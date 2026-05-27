// Materialized-view-backed KPI bar. Reads precomputed snapshots refreshed
// every 60s by pg_cron — renders instantly even at 1Cr+ rows because it
// never scans the `problems` base table.

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import {
  ListChecks, AlertTriangle, CheckCircle2, Siren, Clock, Shield, Flame,
} from 'lucide-react';

type Scope =
  | { kind: 'super' }
  | { kind: 'constituency'; constituencies: string[] }
  | { kind: 'department'; department: string };

const fmt = (n: number) => (n || 0).toLocaleString('en-IN');

const Kpi: React.FC<{ label: string; value: React.ReactNode; icon: any; tone: string; sub?: string }> =
  ({ label, value, icon: Icon, tone, sub }) => (
  <Card>
    <CardContent className="p-3 md:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{label}</div>
          <div className="text-xl md:text-2xl font-bold leading-tight mt-0.5">{value}</div>
          {sub && <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{sub}</div>}
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tone}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const CommandCenterKpis: React.FC<{ scope: Scope }> = ({ scope }) => {
  const { data } = useQuery({
    queryKey: ['kpis', scope],
    staleTime: 60_000,
    queryFn: async () => {
      if (scope.kind === 'department') {
        const { data } = await (supabase.rpc as any)('get_department_kpis', { _department: scope.department });
        const row: any = (data || [])[0] || {};
        return {
          total: Number(row.total || 0), open: Number(row.open_count || 0), resolved: Number(row.resolved_count || 0),
          resolvedToday: Number(row.resolved_today || 0), emergency: Number(row.emergency_count || 0),
          avgRes: Number(row.avg_resolution_hours || 0), reports24h: Number(row.reports_24h || 0),
        };
      }
      const params = scope.kind === 'constituency' && scope.constituencies.length === 1
        ? { _constituency: scope.constituencies[0] } : {};
      const { data } = await (supabase.rpc as any)('get_constituency_kpis', params);
      const rows = data || [];
      const filtered = scope.kind === 'constituency'
        ? rows.filter((r: any) => scope.constituencies.includes(r.constituency))
        : rows;
      const sum = (k: string) => filtered.reduce((a: number, r: any) => a + Number(r[k] || 0), 0);
      const avgRes = filtered.length
        ? filtered.reduce((a: number, r: any) => a + Number(r.avg_resolution_hours || 0), 0) / filtered.length
        : 0;
      return {
        total: sum('total'), open: sum('open_count'), resolved: sum('resolved_count'),
        resolvedToday: sum('resolved_today'), emergency: sum('emergency_count'),
        avgRes, reports24h: sum('reports_24h'),
      };
    },
  });

  const m = data || { total: 0, open: 0, resolved: 0, resolvedToday: 0, emergency: 0, avgRes: 0, reports24h: 0 };
  const slaRate = m.resolved && m.avgRes ? Math.max(0, 100 - Math.min(100, (m.avgRes / 48) * 50)) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
      <Kpi label="Total Reports"   value={fmt(m.total)}              icon={ListChecks}    tone="text-blue-600 bg-blue-100" sub="all-time" />
      <Kpi label="Open"            value={fmt(m.open)}               icon={AlertTriangle} tone="text-orange-600 bg-orange-100" />
      <Kpi label="Resolved Today"  value={fmt(m.resolvedToday)}      icon={CheckCircle2}  tone="text-green-600 bg-green-100" />
      <Kpi label="Last 24h"        value={fmt(m.reports24h)}         icon={Flame}         tone="text-amber-600 bg-amber-100" />
      <Kpi label="Emergency Open"  value={fmt(m.emergency)}          icon={Siren}         tone="text-red-600 bg-red-100" />
      <Kpi label="Avg Resolution"  value={`${(m.avgRes || 0).toFixed(1)}h`} icon={Clock}  tone="text-violet-600 bg-violet-100" />
      <Kpi label="SLA (≤48h)"      value={`${slaRate.toFixed(0)}%`}  icon={Shield}        tone="text-emerald-600 bg-emerald-100" sub="rolling" />
    </div>
  );
};

export default CommandCenterKpis;
