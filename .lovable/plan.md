# Mobile & UX Fixes — Batch Plan

## 1. Dropdown overflow on small screens
Files: `ProblemReportingWizard.tsx`, `CorruptionReportModal.tsx`, `GrievanceWizard.tsx`, `SuggestionWizard.tsx`.
- Wrap shadcn `SelectContent` with `className="max-h-[60vh] w-[var(--radix-select-trigger-width)]"` and `position="popper" sideOffset={4} avoidCollisions`.
- Apply same to District/Constituency/Category/Department/Incident dropdowns.

## 2. Saved-password not auto-logging in (PWA/mobile)
Files: `src/integrations/supabase/client.ts` is generated — fix in login pages instead.
- In `CadreLogin.tsx` / `AdminLogin.tsx` / `MobileAuth.tsx`: on mount, check `supabase.auth.getSession()` and if session exists, redirect to respective dashboard. Currently it likely renders the form even with a valid session.

## 3. Image/video preview — modal instead of redirect
- Create `src/components/MediaPreviewModal.tsx` (handles image, video, audio, pdf via iframe).
- Replace all `<a href={url} target="_blank">` for evidence/proof URLs in: `admin/CorruptionReports.tsx`, `admin/ProblemDetailModal.tsx`, `CadreDashboard.tsx`, public feeds. Convert to button onClick → open modal.

## 4. X-remove button on cadre proof uploads
File: `CadreDashboard.tsx` (or the proof-upload component).
- Add absolute-positioned `×` button top-right on each before/after preview tile.

## 5. Remove sidebar trigger from internal top bar
Files: layouts that include `SidebarTrigger`.
- Remove `<SidebarTrigger />` from internal headers in `AdminDashboard.tsx`, `CadreDashboard.tsx`, `DepartmentDashboard.tsx`, etc. Mobile uses `InternalBottomNav`.

## 6. PWA safe-area: content rendering above top bar
File: `index.css` + main app shells.
- Add `viewport-fit=cover` already present? Add `padding-top: env(safe-area-inset-top)` to fixed top bars in role interfaces; `padding-bottom: env(safe-area-inset-bottom)` to bottom nav.

## 7. Prevent background swipe when modal open
- In modal components, add `useEffect` that sets `document.body.style.overflow = 'hidden'` + `touch-action: none` on mount, restore on unmount. Centralize in a small `useLockBodyScroll` hook.

## 8. Map hidden by expanded bottom bar
File: `MobileBottomNav.tsx` / `InternalBottomNav.tsx` + `LiveMap.tsx`.
- When bottom nav expanded ("More" sheet), use portal/overlay instead of pushing content. Ensure map container has proper `height: calc(100dvh - bottom-nav-height)` not affected by sheet.

## 9. Corruption report detail modal
File: `admin/CorruptionReports.tsx`.
- Add row click → opens `CorruptionDetailModal` showing all fields, evidence (via MediaPreviewModal), status updater, action buttons.

## 10. Cadres detail modal + list avatars
File: `admin/CadreManagement.tsx`.
- List: show small circular `photo_url` avatar left of name; show only relevant info (name, level, location, status badge).
- Click row → `CadreDetailModal` containing: full info + role dropdown, Approve, Deactivate, Public Directory toggle.

## 11. Problems list — unviewed state + faded completed
File: `admin/ProblemsManagement.tsx`.
- Track `viewed_by_admin` (use localStorage set of IDs to avoid migration, OR add column). Use localStorage approach: `viewed-problems` Set in localStorage.
- Unviewed row: subtle blue bg + animated pulsing "Not viewed yet" badge.
- Completed/citizen-confirmed: `opacity-60`.

## 12. Timeline messages — better UI
File: `ProblemDetailModal.tsx` / wherever timeline renders.
- Convert timeline to vertical stepper with colored dots per status, human-readable labels ("Report received", "Team assigned", "Work started", "Completed"), relative timestamps ("2 hours ago"), and bilingual text.

## Order of execution
Phase A (quick wins): 1, 5, 6, 7, 4
Phase B (modals): 3 (MediaPreview), 9, 10, 12
Phase C (logic): 2, 8, 11

## Tech notes
- New shared hook: `src/hooks/use-lock-body-scroll.ts`.
- New shared component: `src/components/MediaPreviewModal.tsx`.
- localStorage key for problem viewed-tracking: `tvk:viewed-problems`.
- No DB migrations required unless we want server-side "viewed" tracking — defaulting to localStorage to keep this lean. Confirm if you want it server-side instead.
