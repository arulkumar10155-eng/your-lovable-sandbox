# Scale & Reliability Plan — Makkal Connect

Goal: hold **1Cr+ reports, 50L+ cadres, 100k+ concurrent users** without crashes or UI freezes. The `.lovable/architecture.md` target was set but most of it is not yet implemented in code. This plan closes that gap.

## Current Bottlenecks (audit findings)

**Database / query layer**
- `AdminDashboard` loads `problems.select('*').limit(2000)` on every mount — pulls megabytes per admin per refetch.
- `DepartmentDashboard` pulls 500 problems + 200 escalations with `select('*')`.
- `CadreManagement`, `WelfareManagement`, `SocialPostsManager`, `CorruptionReports`, `ModeratorDashboard`, `TeamManagement`, `ProblemsManagement` all do `select('*')` with no cursor — silent 1000-row Supabase cap, OFFSET pagination, full payloads on every realtime tick.
- `AssignProblemModal` loads **all active cadres + all teams** in one shot.
- `ProblemDetailModal` fires 4 parallel `select('*')` per open.
- No partitioning on `problems` / `problem_updates` / `problem_assignments`.
- Only 3 MVs exist (`mv_public_stats`, `mv_city_problem_counts`, `mv_constituency_problem_counts`); KPIs and leaderboards still aggregate base tables live.

**Realtime layer**
- `ProblemsManagement`, `LiveMap`, `TrustTicker`, `AnalyticsDashboard`, `ConstituencyChoropleth` subscribe to **global** `problems` channel `event: '*'`. Every insert anywhere broadcasts to every connected admin → WS storm + full refetch each time.
- Only `LiveStats` and `LiveMap` throttle; the others call `load` directly.

**Frontend**
- All routes are statically imported — first paint ships every admin chunk (Recharts, Leaflet, etc.).
- No list virtualization anywhere; rendering 500–2000 rows at once is the freeze source.
- React Query is global but most components bypass it via raw `useEffect + supabase.from()`, so caches aren't shared across tabs/components.
- Images served as originals from Storage; no thumbs / `srcset`.

**Write path / notifications**
- `send-sms` and welfare/problem inserts run inline in the request — slow under burst.
- No `idempotency_key` on mutations; double-tap submits duplicate rows.
- No rate limiting on public report submission → DoS exposure.

**Observability**
- No `pg_stat_statements` review loop, no slow-query alerting, no error budget tracking.

---

## Implementation Plan (phased, ship in order)

### Phase 1 — Kill unbounded queries (biggest, safest win)

1. Create SQL RPCs for every hot list, returning **only required columns + `next_cursor`**:
   - `feed_page(_constituency text, _status text, _cursor uuid, _limit int default 25)`
   - `cadre_page(_constituency, _cursor, _limit)`
   - `welfare_page(_constituency, _status, _cursor, _limit)`
   - `escalation_page`, `corruption_page`, `team_page`, `social_post_page`
2. Replace every `supabase.from('X').select('*')` list call with the matching RPC + `useInfiniteQuery`. Hard cap 100, default 25.
3. Slim `ProblemDetailModal` to one RPC `problem_detail(_id)` returning media+updates+assignments+escalations in a single round-trip.
4. Convert all admin lists to `@tanstack/react-virtual` (only render visible rows).

### Phase 2 — Scope realtime, stop the storm

1. Replace global `supabase.channel('admin-problems').on('postgres_changes', { table: 'problems' }, load)` with **constituency- or department-scoped** channels using `filter: 'constituency=eq.X'`.
2. Wrap every realtime handler in the existing `throttle(fn, 1000)` from `src/lib/throttle.ts`.
3. Realtime events should **invalidate React Query keys**, not refetch full lists, so cached pages stay warm.
4. Add a 30s polling fallback only for lists >500 rows; drop WS subscription on those.

### Phase 3 — Aggregations & dashboards via MVs

1. New MVs refreshed every 60s by `pg_cron`:
   - `mv_constituency_kpis` (open, resolved, sla_breached, avg_resolution_hours, emergency_count per constituency)
   - `mv_department_kpis` (same, grouped by department)
   - `mv_cadre_leaderboard` (top 500 cadres precomputed)
   - `mv_problem_trends_daily` (date, constituency, category, count, resolved_count)
2. Rewrite `AnalyticsDashboard` and command-centre KPI cards to read **only** from these MVs via thin RPCs. Zero base-table scans on dashboard load.

### Phase 4 — Partitioning + indexes for 1Cr rows

1. Enable `pg_partman`; convert `problems`, `problem_updates`, `problem_assignments`, `sms_log` to monthly `RANGE(created_at)` partitions with auto-create + auto-detach.
2. Add composite indexes: `(constituency, status, created_at DESC)`, `(department, status, created_at DESC)`, `(category, created_at DESC)`.
3. BRIN index on `created_at` for archive-range scans.
4. Nightly cron: move rows `resolved AND created_at < now()-12mo` to `problems_archive`.

### Phase 5 — Write path hardening

1. Add `idempotency_key TEXT UNIQUE` to `problems`, `welfare_issues`, `suggestions`, `grievances`, `volunteers`, `corruption_reports`. Frontend submits a UUID per wizard session; reuse on retry.
2. Move SMS/email out of request path: enqueue to `pgmq` (`notifications_sms`, `notifications_email`); cron worker drains in batches; `send-sms` edge fn becomes the drain consumer.
3. Edge-function token-bucket rate limit (IP + phone) on public submission endpoints.
4. Storage: signed-URL flow already in place — add `?width=…` Supabase Image Transformation and `srcset` for every media render; lazy-load below the fold.

### Phase 6 — Frontend perf

1. `React.lazy()` all admin/heavy routes (`AdminDashboard`, `DepartmentDashboard`, `CadreDashboard`, `LiveMap`, `GroundIntelligence`, `AnalyticsDashboard`, `ConstituencyChoropleth`). Keep public routes static so landing stays fast.
2. Move every component-level `useEffect + supabase` fetch to `useQuery` with a stable key — single source of truth, cross-component cache hits.
3. Persist KPI query cache via `@tanstack/query-persist-client-core` + `BroadcastChannel` (tab-to-tab invalidation).
4. Skeletons for every list; remove blocking spinners.

### Phase 7 — Observability & SLOs

1. Enable `pg_stat_statements`; weekly Slack/email digest of top-20 slow queries (>250ms p95).
2. Edge-function logs → structured JSON, sampled error log shipped to `error_events` table.
3. SLOs: p95 list query <300ms, error rate <1%, realtime fan-out <500 msg/sec/admin.
4. Synthetic loadtest in CI with k6: 50k report inserts + 10k concurrent dashboard reads against staging branch before merge.

### Phase 8 — Infra

- Recommend Supabase **Large** instance at 25k DAU, **XL** at 100k DAU; pgbouncer transaction pooling enforced.
- Storage lifecycle: evidence >24mo → cold bucket.
- CDN cache `LiveStats` endpoint (`Cache-Control: public, max-age=60, stale-while-revalidate=300`).

---

## Technical Details

**Cursor pagination shape (every list RPC):**
```sql
CREATE FUNCTION public.feed_page(_constituency text, _status text, _cursor uuid, _limit int)
RETURNS TABLE(...cols, next_cursor uuid) ...
WHERE (_constituency IS NULL OR constituency = _constituency)
  AND (_status IS NULL OR status = _status)
  AND (_cursor IS NULL OR id < _cursor)
ORDER BY id DESC
LIMIT LEAST(_limit, 100);
```

**Realtime scoping example:**
```ts
supabase.channel(`problems:${constituency}`)
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'problems', filter: `constituency=eq.${constituency}` },
    throttle(() => qc.invalidateQueries({ queryKey: ['feed', constituency] }), 1000))
  .subscribe();
```

**Partitioning:**
```sql
SELECT partman.create_parent(
  p_parent_table => 'public.problems',
  p_control => 'created_at',
  p_type => 'range',
  p_interval => 'monthly',
  p_premake => 3
);
```

---

## Sequencing & Risk

Phases 1–2 deliver ~80% of the perceived speedup with **zero schema risk** — ship first. Phase 3–4 require coordinated migrations (partition swap is online via `pg_partman` but needs a maintenance window for the initial migration of existing `problems` rows). Phases 5–7 are additive. Each phase is independently shippable.

## What I need from you before building

1. **Phase scope** — ship all 8 phases sequentially, or start with 1+2+3 (highest impact, lowest risk) and review?
2. **Partitioning window** — OK to schedule a ~10min maintenance window for the initial `problems` partition swap, or use an online dual-write migration (slower, safer)?
3. **Archive cutoff** — keep resolved rows hot for 12 months as planned, or longer?
4. **Loadtest target** — confirm 100k concurrent / 1Cr rows is the target, or different numbers?