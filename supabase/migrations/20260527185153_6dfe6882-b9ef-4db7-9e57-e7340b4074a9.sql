
-- Phase 1: indexes
CREATE INDEX IF NOT EXISTS idx_problems_const_status_created ON public.problems (constituency, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_problems_dept_status_created  ON public.problems (department, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_problems_category_created     ON public.problems (category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_problems_created_brin         ON public.problems USING BRIN (created_at);
CREATE INDEX IF NOT EXISTS idx_welfare_const_status_created  ON public.welfare_issues (constituency, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_welfare_dept_status_created   ON public.welfare_issues (department, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cadres_const_points           ON public.cadres (constituency, points DESC);
CREATE INDEX IF NOT EXISTS idx_escalations_status_created    ON public.escalations (status, created_at DESC);

-- Phase 1 RPCs
CREATE OR REPLACE FUNCTION public.feed_problems(
  _constituency text DEFAULT NULL, _department text DEFAULT NULL,
  _status text DEFAULT NULL, _category text DEFAULT NULL,
  _cursor timestamptz DEFAULT NULL, _limit int DEFAULT 25
) RETURNS TABLE(
  id uuid, ticket_no text, title text, category text, department text,
  status text, urgency text, severity text, constituency text, city text,
  area text, reporter_name text, reporter_phone text, support_count int,
  latitude numeric, longitude numeric, created_at timestamptz, next_cursor timestamptz
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  WITH page AS (
    SELECT p.id, p.ticket_no, p.title, p.category, p.department, p.status,
           p.urgency, p.severity, p.constituency, p.city, p.area,
           p.reporter_name, p.reporter_phone, p.support_count,
           p.latitude, p.longitude, p.created_at
    FROM public.problems p
    WHERE (_constituency IS NULL OR p.constituency = _constituency)
      AND (_department   IS NULL OR p.department   = _department)
      AND (_status       IS NULL OR p.status       = _status)
      AND (_category     IS NULL OR p.category     = _category)
      AND (_cursor       IS NULL OR p.created_at < _cursor)
    ORDER BY p.created_at DESC LIMIT LEAST(_limit, 100)
  )
  SELECT page.*, (SELECT min(created_at) FROM page) AS next_cursor FROM page;
$$;

CREATE OR REPLACE FUNCTION public.problem_detail(_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT jsonb_build_object(
    'problem', to_jsonb(p),
    'media', COALESCE((SELECT jsonb_agg(to_jsonb(m) ORDER BY m.created_at) FROM public.problem_media m WHERE m.problem_id=_id), '[]'::jsonb),
    'updates', COALESCE((SELECT jsonb_agg(to_jsonb(u) ORDER BY u.created_at DESC) FROM public.problem_updates u WHERE u.problem_id=_id), '[]'::jsonb),
    'assignments', COALESCE((SELECT jsonb_agg(to_jsonb(a)) FROM public.problem_assignments a WHERE a.problem_id=_id), '[]'::jsonb),
    'escalations', COALESCE((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.created_at DESC) FROM public.escalations e WHERE e.problem_id=_id), '[]'::jsonb)
  ) FROM public.problems p WHERE p.id=_id;
$$;

CREATE OR REPLACE FUNCTION public.feed_welfare(
  _constituency text DEFAULT NULL, _department text DEFAULT NULL,
  _status text DEFAULT NULL, _cursor timestamptz DEFAULT NULL, _limit int DEFAULT 25
) RETURNS TABLE(
  id uuid, ticket_no text, title text, scheme_type text, scheme_name text,
  department text, status text, urgency text, constituency text, city text,
  reporter_name text, reporter_phone text, months_pending text,
  created_at timestamptz, next_cursor timestamptz
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  WITH page AS (
    SELECT w.id, w.ticket_no, w.title, w.scheme_type, w.scheme_name,
           w.department, w.status, w.urgency, w.constituency, w.city,
           w.reporter_name, w.reporter_phone, w.months_pending, w.created_at
    FROM public.welfare_issues w
    WHERE (_constituency IS NULL OR w.constituency = _constituency)
      AND (_department   IS NULL OR w.department   = _department)
      AND (_status       IS NULL OR w.status       = _status)
      AND (_cursor       IS NULL OR w.created_at < _cursor)
    ORDER BY w.created_at DESC LIMIT LEAST(_limit, 100)
  )
  SELECT page.*, (SELECT min(created_at) FROM page) AS next_cursor FROM page;
$$;

CREATE OR REPLACE FUNCTION public.feed_cadres(
  _constituency text DEFAULT NULL, _cursor timestamptz DEFAULT NULL, _limit int DEFAULT 25
) RETURNS TABLE(
  id uuid, name text, phone text, email text, level text, constituency text,
  city text, area text, ward_number text, points int, stars int,
  resolved_count int, rank_tier text, active boolean, approved boolean,
  profile_photo_url text, created_at timestamptz, next_cursor timestamptz
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  WITH page AS (
    SELECT c.id, c.name, c.phone, c.email, c.level, c.constituency, c.city,
           c.area, c.ward_number, c.points, c.stars, c.resolved_count,
           c.rank_tier, c.active, c.approved, c.profile_photo_url, c.created_at
    FROM public.cadres c
    WHERE (_constituency IS NULL OR c.constituency = _constituency)
      AND (_cursor IS NULL OR c.created_at < _cursor)
    ORDER BY c.created_at DESC LIMIT LEAST(_limit, 100)
  )
  SELECT page.*, (SELECT min(created_at) FROM page) AS next_cursor FROM page;
$$;

CREATE OR REPLACE FUNCTION public.feed_escalations(
  _status text DEFAULT NULL, _cursor timestamptz DEFAULT NULL, _limit int DEFAULT 25
) RETURNS TABLE(
  id uuid, problem_id uuid, reason text, status text, to_level text,
  created_at timestamptz, resolved_at timestamptz, next_cursor timestamptz
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  WITH page AS (
    SELECT e.id, e.problem_id, e.reason, e.status, e.to_level, e.created_at, e.resolved_at
    FROM public.escalations e
    WHERE (_status IS NULL OR e.status=_status) AND (_cursor IS NULL OR e.created_at < _cursor)
    ORDER BY e.created_at DESC LIMIT LEAST(_limit, 100)
  )
  SELECT page.*, (SELECT min(created_at) FROM page) AS next_cursor FROM page;
$$;

-- Phase 3 MVs
DROP MATERIALIZED VIEW IF EXISTS public.mv_constituency_kpis CASCADE;
CREATE MATERIALIZED VIEW public.mv_constituency_kpis AS
SELECT constituency,
  count(*) AS total,
  count(*) FILTER (WHERE status NOT IN ('resolved','completed','citizen_confirmed')) AS open_count,
  count(*) FILTER (WHERE status IN ('resolved','completed','citizen_confirmed')) AS resolved_count,
  count(*) FILTER (WHERE urgency='emergency') AS emergency_count,
  count(*) FILTER (WHERE created_at >= now() - interval '24 hours') AS reports_24h,
  count(*) FILTER (WHERE resolved_at >= date_trunc('day', now())) AS resolved_today,
  count(*) FILTER (WHERE citizen_confirmed = true) AS citizen_confirmed_count,
  COALESCE(avg(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600.0) FILTER (WHERE resolved_at IS NOT NULL), 0) AS avg_resolution_hours
FROM public.problems WHERE constituency IS NOT NULL GROUP BY constituency;
CREATE UNIQUE INDEX IF NOT EXISTS mv_constituency_kpis_pk ON public.mv_constituency_kpis (constituency);

DROP MATERIALIZED VIEW IF EXISTS public.mv_department_kpis CASCADE;
CREATE MATERIALIZED VIEW public.mv_department_kpis AS
SELECT department,
  count(*) AS total,
  count(*) FILTER (WHERE status NOT IN ('resolved','completed','citizen_confirmed')) AS open_count,
  count(*) FILTER (WHERE status IN ('resolved','completed','citizen_confirmed')) AS resolved_count,
  count(*) FILTER (WHERE urgency='emergency') AS emergency_count,
  count(*) FILTER (WHERE created_at >= now() - interval '24 hours') AS reports_24h,
  count(*) FILTER (WHERE resolved_at >= date_trunc('day', now())) AS resolved_today,
  COALESCE(avg(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600.0) FILTER (WHERE resolved_at IS NOT NULL), 0) AS avg_resolution_hours
FROM public.problems WHERE department IS NOT NULL GROUP BY department;
CREATE UNIQUE INDEX IF NOT EXISTS mv_department_kpis_pk ON public.mv_department_kpis (department);

DROP MATERIALIZED VIEW IF EXISTS public.mv_cadre_leaderboard CASCADE;
CREATE MATERIALIZED VIEW public.mv_cadre_leaderboard AS
SELECT id, name, constituency, city, level, profile_photo_url, points, stars, resolved_count, rank_tier
FROM public.cadres WHERE active=true AND approved=true
ORDER BY points DESC, stars DESC, resolved_count DESC LIMIT 500;
CREATE UNIQUE INDEX IF NOT EXISTS mv_cadre_leaderboard_pk ON public.mv_cadre_leaderboard (id);
CREATE INDEX IF NOT EXISTS mv_cadre_leaderboard_const ON public.mv_cadre_leaderboard (constituency, points DESC);

DROP MATERIALIZED VIEW IF EXISTS public.mv_problem_trends_daily CASCADE;
CREATE MATERIALIZED VIEW public.mv_problem_trends_daily AS
SELECT date_trunc('day', created_at)::date AS day, constituency, department, category,
  count(*) AS total,
  count(*) FILTER (WHERE status IN ('resolved','completed','citizen_confirmed')) AS resolved
FROM public.problems WHERE created_at >= now() - interval '90 days'
GROUP BY 1,2,3,4;
CREATE UNIQUE INDEX IF NOT EXISTS mv_trends_uniq ON public.mv_problem_trends_daily (day, COALESCE(constituency,''), COALESCE(department,''), COALESCE(category,''));
CREATE INDEX IF NOT EXISTS mv_trends_const ON public.mv_problem_trends_daily (constituency, day DESC);
CREATE INDEX IF NOT EXISTS mv_trends_dept ON public.mv_problem_trends_daily (department, day DESC);

CREATE OR REPLACE FUNCTION public.get_constituency_kpis(_constituency text DEFAULT NULL)
RETURNS SETOF public.mv_constituency_kpis LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT * FROM public.mv_constituency_kpis WHERE _constituency IS NULL OR constituency=_constituency;
$$;

CREATE OR REPLACE FUNCTION public.get_department_kpis(_department text DEFAULT NULL)
RETURNS SETOF public.mv_department_kpis LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT * FROM public.mv_department_kpis WHERE _department IS NULL OR department=_department;
$$;

CREATE OR REPLACE FUNCTION public.get_cadre_leaderboard_cached(_constituency text DEFAULT NULL, _limit int DEFAULT 50)
RETURNS SETOF public.mv_cadre_leaderboard LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT * FROM public.mv_cadre_leaderboard
  WHERE _constituency IS NULL OR constituency=_constituency
  ORDER BY points DESC, stars DESC, resolved_count DESC LIMIT LEAST(_limit, 200);
$$;

CREATE OR REPLACE FUNCTION public.get_problem_trends(
  _constituency text DEFAULT NULL, _department text DEFAULT NULL, _days int DEFAULT 30
) RETURNS TABLE(day date, total bigint, resolved bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT day, sum(total)::bigint, sum(resolved)::bigint
  FROM public.mv_problem_trends_daily
  WHERE day >= (now() - make_interval(days => _days))::date
    AND (_constituency IS NULL OR constituency=_constituency)
    AND (_department IS NULL OR department=_department)
  GROUP BY day ORDER BY day;
$$;

CREATE OR REPLACE FUNCTION public.refresh_kpi_views()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_constituency_kpis;
  EXCEPTION WHEN OTHERS THEN REFRESH MATERIALIZED VIEW public.mv_constituency_kpis; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_department_kpis;
  EXCEPTION WHEN OTHERS THEN REFRESH MATERIALIZED VIEW public.mv_department_kpis; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_cadre_leaderboard;
  EXCEPTION WHEN OTHERS THEN REFRESH MATERIALIZED VIEW public.mv_cadre_leaderboard; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_problem_trends_daily;
  EXCEPTION WHEN OTHERS THEN REFRESH MATERIALIZED VIEW public.mv_problem_trends_daily; END;
END; $$;

DO $$ BEGIN
  PERFORM cron.unschedule('refresh_kpi_views_every_minute') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='refresh_kpi_views_every_minute');
EXCEPTION WHEN OTHERS THEN NULL; END $$;
SELECT cron.schedule('refresh_kpi_views_every_minute', '* * * * *', $$SELECT public.refresh_kpi_views();$$);

GRANT SELECT ON public.mv_constituency_kpis TO anon, authenticated;
GRANT SELECT ON public.mv_department_kpis TO anon, authenticated;
GRANT SELECT ON public.mv_cadre_leaderboard TO anon, authenticated;
GRANT SELECT ON public.mv_problem_trends_daily TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.feed_problems(text,text,text,text,timestamptz,int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.feed_welfare(text,text,text,timestamptz,int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.feed_cadres(text,timestamptz,int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.feed_escalations(text,timestamptz,int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.problem_detail(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_constituency_kpis(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_department_kpis(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_cadre_leaderboard_cached(text,int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_problem_trends(text,text,int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_kpi_views() TO service_role;
