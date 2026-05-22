import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, AlertTriangle, ListChecks, Building2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { DEPARTMENTS, STATUS_STAGES } from '@/lib/departments';
import ProblemDetailModal from '@/components/admin/ProblemDetailModal';
import InternalBottomNav from '@/components/layout/InternalBottomNav';
import EnableNotificationsButton from '@/components/EnableNotificationsButton';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

const DepartmentDashboard: React.FC = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [problems, setProblems] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [open, setOpen] = useState<any>(null);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { nav('/admin'); return; }
    const { data: officer } = await supabase.from('department_officers').select('*').eq('user_id', session.user.id).maybeSingle();
    if (!officer) { toast.error('Not a department officer'); await supabase.auth.signOut(); nav('/admin'); return; }
    setDepartment(officer.department);
    setDisplayName(officer.display_name || '');
    import('@/lib/notifications').then(m => m.syncNotificationToken({
      role: 'department_admin', department: officer.department,
    }));
    const { data: probs } = await supabase.from('problems').select('*').order('created_at', { ascending: false }).limit(500);
    setProblems(probs || []);
    const { data: esc } = await supabase.from('escalations').select('*').order('created_at', { ascending: false }).limit(200);
    setEscalations(esc || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const logout = async () => { await supabase.auth.signOut(); nav('/admin'); };
  const dep = DEPARTMENTS.find(d => d.id === department);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  const pending = problems.filter(p => !['resolved','completed','citizen_confirmed'].includes(p.status));
  const resolved = problems.filter(p => ['resolved','completed','citizen_confirmed'].includes(p.status));

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="container mx-auto px-3 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xl">{dep?.icon || '🏛️'}</div>
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">{dep?.en || department}</div>
              <div className="text-[10px] text-muted-foreground truncate">{displayName} · Department Officer</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <EnableNotificationsButton ctx={{ role: 'department_admin', department }} />
            <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4 mr-1" />Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 py-4 space-y-4 max-w-full">
        <div className="grid grid-cols-3 gap-2">
          <Card><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-primary">{problems.length}</div><div className="text-[10px] text-muted-foreground">Total</div></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-orange-600">{pending.length}</div><div className="text-[10px] text-muted-foreground">Pending</div></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-green-600">{resolved.length}</div><div className="text-[10px] text-muted-foreground">Resolved</div></CardContent></Card>
        </div>

        <div id="dept-escalations" />
        {escalations.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-600" />Escalations to your department ({escalations.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {escalations.slice(0, 5).map(e => {
                const p = problems.find(x => x.id === e.problem_id);
                return (
                  <div key={e.id} className="bg-orange-50 border border-orange-200 rounded p-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="font-mono text-[10px]">{p?.ticket_no || e.problem_id.slice(0,8)}</span>
                      <Badge variant={e.status === 'open' ? 'destructive' : 'secondary'} className="text-[10px]">{e.status}</Badge>
                    </div>
                    <div className="font-medium mt-1 break-words">{e.reason}</div>
                    {p && <Button size="sm" variant="outline" className="mt-2 h-7 text-[11px]" onClick={() => setOpen(p)}>View problem</Button>}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <div id="dept-problems" />
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ListChecks className="w-4 h-4" />Problems · {dep?.en || department}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {problems.length === 0 && <div className="text-xs text-muted-foreground py-6 text-center">No problems in your department yet.</div>}
            {problems.map(p => {
              const stage = STATUS_STAGES.find(s => s.id === p.status);
              return (
                <div key={p.id} className="bg-card border rounded-lg p-3">
                  <div className="flex flex-wrap gap-1 mb-1">
                    <span className="font-mono text-[10px] bg-muted px-1.5 rounded">{p.ticket_no}</span>
                    <Badge variant="outline" className="text-[10px]">{stage?.en || p.status}</Badge>
                    {p.urgency === 'emergency' && <Badge className="bg-red-600 text-white text-[10px]">EMERGENCY</Badge>}
                  </div>
                  <div className="font-semibold text-sm break-words">{p.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 break-words">{[p.area, p.constituency, p.city].filter(Boolean).join(' · ')}</div>
                  <div className="flex flex-wrap gap-2 mt-2 items-center">
                    <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setOpen(p)}>View details</Button>
                    <select
                      value={p.status}
                      onChange={async (e) => {
                        const upd: any = { status: e.target.value };
                        if (['completed','resolved','citizen_confirmed'].includes(e.target.value)) upd.resolved_at = new Date().toISOString();
                        const { error } = await supabase.from('problems').update(upd).eq('id', p.id);
                        if (error) return toast.error(error.message);
                        toast.success('Status updated'); load();
                      }}
                      className="h-7 text-[11px] rounded border border-input bg-background px-1"
                    >
                      {STATUS_STAGES.map(s => <option key={s.id} value={s.id}>{s.en}</option>)}
                    </select>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>

      {open && <ProblemDetailModal problem={open} onClose={() => setOpen(null)} />}
      <InternalBottomNav
        items={[
          { title: 'Problems', icon: ListChecks, value: 'dept-problems' },
          { title: 'Escalations', icon: AlertTriangle, value: 'dept-escalations' },
          { title: 'Stats', icon: BarChart3, value: 'top' },
        ]}
        activeValue=""
        onSelect={(v) => {
          if (v === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
          else document.getElementById(v)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        onLogout={logout}
      />
    </div>
  );
};
export default DepartmentDashboard;
