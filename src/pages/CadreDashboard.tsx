import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LogOut, ListChecks, CalendarDays, AlertTriangle, User as UserIcon, Loader2, Upload, MapPin, Phone, Users2, Hand, UserCheck, Trophy, Star, Clock, X, Image as ImageIcon, Building2 } from 'lucide-react';
import WelfareManagement from '@/components/admin/WelfareManagement';
import { STATUS_STAGES, DEPARTMENTS } from '@/lib/departments';
import { toast } from 'sonner';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar, { SidebarItem } from '@/components/layout/AppSidebar';
import InternalBottomNav from '@/components/layout/InternalBottomNav';
import Leaderboards from '@/components/admin/Leaderboards';
import CadreCard from '@/components/cadre/CadreCard';
import EnableNotificationsButton from '@/components/EnableNotificationsButton';

const CADRE_ITEMS: SidebarItem[] = [
  { title: 'Problems', icon: ListChecks, value: 'problems' },
  { title: 'My Team', icon: Users2, value: 'team' },
  { title: 'Postings', icon: CalendarDays, value: 'postings' },
  { title: 'Escalations', icon: AlertTriangle, value: 'escalations' },
  { title: 'Rank', icon: Trophy, value: 'rank' },
  { title: 'Profile', icon: UserIcon, value: 'profile' },
];

const rankFromPoints = (points = 0) => {
  if (points >= 1000) return 'diamond';
  if (points >= 500) return 'platinum';
  if (points >= 200) return 'gold';
  if (points >= 50) return 'silver';
  return 'bronze';
};

const formatIST = (value: string) => new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata',
}).format(new Date(value));

const CadreDashboard: React.FC = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const initialLoaded = React.useRef(false);
  const [cadre, setCadre] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [postings, setPostings] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [team, setTeam] = useState<any | null>(null);
  const [teamMates, setTeamMates] = useState<any[]>([]);
  const [open, setOpen] = useState<any>(null);
  const [claimFor, setClaimFor] = useState<any>(null);
  const [tab, setTab] = useState('problems');

  const load = async () => {
    if (!initialLoaded.current) setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { nav('/cadre/login'); return; }
    const { data: c, error: cadreError } = await supabase.from('cadres').select('*').eq('user_id', session.user.id).maybeSingle();
    if (cadreError) { toast.error(cadreError.message); setLoading(false); return; }
    if (!c) { toast.error('No cadre profile linked'); await supabase.auth.signOut(); nav('/cadre/login'); return; }
    setCadre(c);
    // teams I belong to
    const { data: tm } = await supabase.from('team_members').select('team_id').eq('cadre_id', c.id);
    const teamIds = (tm || []).map((x: any) => x.team_id);
    if (teamIds.length) {
      const { data: t } = await supabase.from('teams').select('*').eq('id', teamIds[0]).maybeSingle();
      setTeam(t || null);
      const { data: members } = await supabase.from('team_members').select('cadre_id, role_in_team').eq('team_id', teamIds[0]);
      const memberIds = (members || []).map((m: any) => m.cadre_id);
      if (memberIds.length) {
        const { data: mc } = await supabase.from('cadres').select('id,name,phone,level,role_title,profile_photo_url').in('id', memberIds);
        setTeamMates(mc || []);
      } else setTeamMates([]);
    } else { setTeam(null); setTeamMates([]); }
    // Get all my assignments (direct + team) with claim info
    const { data: paDirect } = await supabase.from('problem_assignments').select('*').eq('active', true).eq('cadre_id', c.id);
    let paTeam: any[] = [];
    if (teamIds.length) {
      const { data } = await supabase.from('problem_assignments').select('*').eq('active', true).in('team_id', teamIds);
      paTeam = data || [];
    }
    const allPa = [...(paDirect || []), ...paTeam];
    const uniqIds = Array.from(new Set(allPa.map((a: any) => a.problem_id)));
    let problemsById: Record<string, any> = {};
    if (uniqIds.length) {
      const { data: probs } = await supabase.from('problems').select('*').in('id', uniqIds);
      (probs || []).forEach((p: any) => { problemsById[p.id] = p; });
    }
    // Joiners I belong to
    const { data: joins } = await supabase.from('problem_assignment_joiners').select('assignment_id').eq('cadre_id', c.id);
    const joinedSet = new Set((joins || []).map((j: any) => j.assignment_id));
    const merged = allPa
      .map((a: any) => ({ ...a, problem: problemsById[a.problem_id], joined: joinedSet.has(a.id) }))
      .filter((a: any) => a.problem)
      .sort((a: any, b: any) => new Date(b.problem.created_at).getTime() - new Date(a.problem.created_at).getTime());
    setAssignments(merged);
    const { data: post } = await supabase.from('team_postings').select('*').eq('cadre_id', c.id).order('starts_at', { ascending: false });
    setPostings(post || []);
    const { data: esc } = await supabase.from('escalations').select('*').eq('raised_by_cadre_id', c.id).order('created_at', { ascending: false });
    setEscalations(esc || []);
    setLoading(false);
    initialLoaded.current = true;
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!cadre) return;
    import('@/lib/notifications').then(m => m.syncNotificationToken({
      role: 'cadre', constituency: cadre.constituency, department: cadre.department,
    }));
  }, [cadre]);

  const logout = async () => { await supabase.auth.signOut(); nav('/cadre/login'); };

  const claim = async (assignmentId: string, estimatedCompletionAt: string) => {
    const { error } = await supabase
      .from('problem_assignments' as any)
      .update({ claimed_by_cadre_id: cadre.id, claimed_at: new Date().toISOString(), estimated_completion_at: estimatedCompletionAt })
      .eq('id', assignmentId)
      .is('claimed_by_cadre_id', null);
    if (error) return toast.error(error.message);
    setClaimFor(null);
    toast.success('You have claimed this problem'); load();
  };
  const join = async (assignmentId: string) => {
    const { error } = await supabase.from('problem_assignment_joiners').insert({ assignment_id: assignmentId, cadre_id: cadre.id });
    if (error) return toast.error(error.message);
    toast.success('Joined as supporter'); load();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar
          brand={cadre.name}
          subtitle={`${cadre.level} · ${[cadre.area, cadre.constituency].filter(Boolean).join(' · ') || cadre.city}`}
          items={CADRE_ITEMS}
          activeValue={tab}
          onSelect={setTab}
          onLogout={logout}
        />
        <SidebarInset className="min-w-0">
          <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-sm font-semibold capitalize truncate">{tab}</div>
              </div>
              <div className="flex items-center gap-2">
                <EnableNotificationsButton ctx={{ role: 'cadre', constituency: cadre.constituency, department: cadre.department }} />
                <div className="flex items-center gap-1 text-xs text-yellow-600">
                  <Trophy className="w-3 h-3" />
                  <span className="font-bold">{cadre.points || 0}</span>
                  <Star className="w-3 h-3 fill-current ml-1" />
                  <span>{cadre.stars || 0}</span>
                </div>
              </div>
            </div>
          </header>

          <main className="px-3 py-4 space-y-4 max-w-full overflow-x-hidden">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-card border rounded-lg p-3 text-center"><div className="text-2xl font-bold text-primary">{assignments.length}</div><div className="text-[10px] text-muted-foreground">Assigned</div></div>
              <div className="bg-card border rounded-lg p-3 text-center"><div className="text-2xl font-bold text-green-600">{assignments.filter(a => a.problem.status === 'completed' || a.problem.status === 'citizen_confirmed').length}</div><div className="text-[10px] text-muted-foreground">Resolved</div></div>
              <div className="bg-card border rounded-lg p-3 text-center"><div className="text-2xl font-bold text-orange-600">{escalations.filter(e => e.status === 'open').length}</div><div className="text-[10px] text-muted-foreground">Escalated</div></div>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
              <TabsContent value="problems" className="mt-0 space-y-2">
            {assignments.length === 0 && <div className="text-sm text-muted-foreground py-6 text-center">No problems assigned yet</div>}
            {assignments.map(a => {
              const p = a.problem;
              const stage = STATUS_STAGES.find(s => s.id === p.status);
              const dep = DEPARTMENTS.find(d => d.id === p.department);
              const isDirect = a.cadre_id === cadre.id;
              const isClaimer = a.claimed_by_cadre_id === cadre.id;
              const canEdit = isDirect || isClaimer;
              const isTeamAssign = !!a.team_id && !isDirect;
              const unclaimed = isTeamAssign && !a.claimed_by_cadre_id;
              return (
                <div key={a.id} className="bg-card border rounded-lg p-3">
                  <div className="flex flex-wrap gap-1 mb-1">
                    <span className="font-mono text-[10px] bg-muted px-1.5 rounded">{p.ticket_no}</span>
                    <Badge variant="outline" className="text-[10px]">{dep?.en}</Badge>
                    <Badge variant="outline" className="text-[10px]">{stage?.en}</Badge>
                    {p.urgency === 'emergency' && <Badge className="bg-red-600 text-white text-[10px]">EMERGENCY</Badge>}
                    {isDirect && <Badge className="bg-blue-600 text-white text-[10px]">Direct</Badge>}
                    {isClaimer && <Badge className="bg-green-600 text-white text-[10px]">Claimed by you</Badge>}
                    {isTeamAssign && a.claimed_by_cadre_id && !isClaimer && <Badge variant="secondary" className="text-[10px]">Team · led by another</Badge>}
                    {unclaimed && <Badge className="bg-amber-500 text-white text-[10px]">Open for claim</Badge>}
                  </div>
                  <div className="font-semibold text-sm break-words">{p.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{[p.area, p.constituency].filter(Boolean).join(' · ')}</div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {canEdit && <Button size="sm" onClick={() => setOpen({ problem: p, assignment: a })}><Upload className="w-3 h-3 mr-1" />Update / Proof</Button>}
                    {unclaimed && <Button size="sm" variant="default" onClick={() => setClaimFor(a)}><Hand className="w-3 h-3 mr-1" />Claim & Lead</Button>}
                    {a.estimated_completion_at && <Badge variant="outline" className="text-[10px]"><Clock className="w-3 h-3 mr-1" />ETA {formatIST(a.estimated_completion_at)}</Badge>}
                    {isTeamAssign && a.claimed_by_cadre_id && !isClaimer && !a.joined && <Button size="sm" variant="outline" onClick={() => join(a.id)}><UserCheck className="w-3 h-3 mr-1" />Join (view only)</Button>}
                    {a.joined && !isClaimer && <Badge variant="outline" className="text-[10px]">You joined as supporter</Badge>}
                    <Button size="sm" variant="ghost" onClick={() => setOpen({ problem: p, assignment: a, viewOnly: !canEdit })}>View</Button>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="team" className="mt-3 space-y-2">
            {!team && <div className="text-sm text-muted-foreground py-6 text-center">You are not in any team yet.</div>}
            {team && (
              <>
                <div className="bg-card border rounded-lg p-3">
                  <div className="font-bold">{team.name}</div>
                  <div className="text-[11px] text-muted-foreground">{[team.department, team.constituency, team.city].filter(Boolean).join(' · ')}</div>
                  {team.description && <p className="text-xs mt-1">{team.description}</p>}
                </div>
                <div className="text-xs font-semibold text-muted-foreground">Team members ({teamMates.length})</div>
                <div className="space-y-1">
                  {teamMates.map(m => (
                    <div key={m.id} className="bg-card border rounded-lg p-2 flex items-center gap-2">
                      {m.profile_photo_url
                        ? <img src={m.profile_photo_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                        : <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{m.name?.[0]}</div>}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">{m.name}{m.id === cadre.id && <span className="text-[10px] text-muted-foreground ml-1">(you)</span>}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{m.role_title || m.level}</div>
                      </div>
                      <a href={`tel:${m.phone}`} className="text-xs inline-flex items-center gap-1 text-primary"><Phone className="w-3 h-3" />{m.phone}</a>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="postings" className="mt-3 space-y-2">
            {postings.length === 0 && <div className="text-sm text-muted-foreground py-6 text-center">No active postings</div>}
            {postings.map(p => (
              <div key={p.id} className="bg-card border rounded-lg p-3">
                <div className="font-semibold text-sm">{p.posting_title}</div>
                <div className="text-[11px] text-muted-foreground">{p.posting_type} · {p.area || '—'}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{new Date(p.starts_at).toLocaleString()} {p.ends_at ? '→ ' + new Date(p.ends_at).toLocaleString() : ''}</div>
                {p.notes && <p className="text-xs mt-1">{p.notes}</p>}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="escalations" className="mt-3 space-y-2">
            {escalations.length === 0 && <div className="text-sm text-muted-foreground py-6 text-center">No escalations raised</div>}
            {escalations.map(e => (
              <div key={e.id} className="bg-card border rounded-lg p-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="text-xs font-mono">{e.problem_id.slice(0, 8)}</div>
                  <Badge variant={e.status === 'open' ? 'destructive' : 'secondary'} className="text-[10px]">{e.status}</Badge>
                </div>
                <p className="text-sm mt-1">{e.reason}</p>
                <div className="text-[11px] text-muted-foreground mt-1">→ {e.to_level}</div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="profile" className="mt-3 space-y-3">
            <div className="bg-card border rounded-lg p-4 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                {cadre.profile_photo_url
                  ? <img src={cadre.profile_photo_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
                  : <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">{cadre.name?.[0]}</div>}
                <div className="flex-1">
                  <div className="font-bold">{cadre.name}</div>
                  <label className="text-xs text-primary cursor-pointer underline">
                    Change photo
                    <input type="file" accept="image/*" hidden onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const path = `cadre-photos/${cadre.id}-${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi,'_')}`;
                      const { error } = await supabase.storage.from('problem-media').upload(path, file, { contentType: file.type });
                      if (error) return toast.error(error.message);
                      const url = supabase.storage.from('problem-media').getPublicUrl(path).data.publicUrl;
                      const { error: e2 } = await supabase.from('cadres').update({ profile_photo_url: url }).eq('id', cadre.id);
                      if (e2) return toast.error(e2.message);
                      toast.success('Photo updated'); load();
                    }} />
                  </label>
                </div>
              </div>
              <div><b>Email:</b> {cadre.email}</div>
              <div className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /><b>Phone:</b> {cadre.phone}</div>
              <div><b>Level:</b> {cadre.level}</div>
              <div><b>Role:</b> {cadre.role_title || '—'}</div>
              <div><b>Location:</b> {[cadre.area, cadre.constituency, cadre.city].filter(Boolean).join(' · ')}</div>
              <div><b>Status:</b> {cadre.approved ? <Badge className="bg-green-600">Approved</Badge> : <Badge variant="secondary">Pending Approval</Badge>}</div>
            </div>
            <CadreCard cadre={cadre} />
          </TabsContent>

          <TabsContent value="rank" className="mt-0 space-y-3">
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 border border-yellow-300 rounded-2xl p-4">
              <div className="text-xs uppercase tracking-wider text-yellow-800">Your rank</div>
              <div className="text-4xl font-black text-yellow-900 capitalize mt-1">{rankFromPoints(cadre.points || 0)}</div>
              <div className="flex gap-4 mt-3 text-sm">
                <div><span className="font-bold text-2xl">{cadre.points || 0}</span> <span className="text-xs text-muted-foreground">points</span></div>
                <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /><span className="font-bold">{cadre.stars || 0}</span></div>
                <div><span className="font-bold">{cadre.resolved_count || 0}</span> <span className="text-xs text-muted-foreground">solved</span></div>
              </div>
              <div className="text-[10px] text-muted-foreground mt-2">+30 per resolve · +30 if &lt;24h · +20 with before/after photos · +5 per claim</div>
            </div>
            <Leaderboards constituency={cadre.constituency || undefined} />
          </TabsContent>
            </Tabs>
          </main>
          <InternalBottomNav items={CADRE_ITEMS} activeValue={tab} onSelect={setTab} onLogout={logout} />
        </SidebarInset>
      </div>

      {open && <ProblemUpdateDrawer problem={open.problem} viewOnly={!!open.viewOnly} cadreId={cadre.id} onClose={() => { setOpen(null); load(); }} />}
      {claimFor && <ClaimEtaModal assignment={claimFor} onClose={() => setClaimFor(null)} onClaim={claim} />}
    </SidebarProvider>
  );
};

const ClaimEtaModal: React.FC<{ assignment: any; onClose: () => void; onClaim: (assignmentId: string, eta: string) => void }> = ({ assignment, onClose, onClaim }) => {
  const defaultEta = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const [eta, setEta] = useState(defaultEta);

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-bold text-base">Claim issue</h3>
            <p className="text-xs text-muted-foreground">Set the estimated completion time shown to the public.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <Label>Estimated time to complete</Label>
        <Input type="datetime-local" value={eta} min={new Date().toISOString().slice(0, 16)} onChange={e => setEta(e.target.value)} className="mt-1" />
        <Button className="w-full mt-4" disabled={!eta} onClick={() => onClaim(assignment.id, new Date(eta).toISOString())}>
          <Hand className="w-4 h-4 mr-2" />Claim & Lead
        </Button>
      </div>
    </div>
  );
};


const ProblemUpdateDrawer: React.FC<{ problem: any; cadreId: string; viewOnly?: boolean; onClose: () => void }> = ({ problem, viewOnly, onClose }) => {
  const [status, setStatus] = useState(problem.status);
  const [note, setNote] = useState('');
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [escReason, setEscReason] = useState('');
  const [media, setMedia] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('problem_media').select('*').eq('problem_id', problem.id);
      setMedia(data || []);
    })();
  }, [problem.id]);

  const upload = async (file: File, label: string) => {
    const path = `proof/${problem.id}/${label}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('problem-media').upload(path, file);
    if (error) throw error;
    return supabase.storage.from('problem-media').getPublicUrl(path).data.publicUrl;
  };

  const save = async () => {
    setBusy(true);
    try {
      let before_url: string | null = null;
      let after_url: string | null = null;
      if (beforeFile) before_url = await upload(beforeFile, 'before');
      if (afterFile) after_url = await upload(afterFile, 'after');
      const { error: e1 } = await supabase.from('problem_updates').insert({
        problem_id: problem.id, status, note: note || null, before_url, after_url,
      });
      if (e1) throw e1;
      if (status !== problem.status) {
        const upd: any = { status };
        if (status === 'completed') upd.resolved_at = new Date().toISOString();
        await supabase.from('problems').update(upd).eq('id', problem.id);
        const { notifyStatusChange } = await import('@/lib/notify');
        notifyStatusChange(problem.id, status);
      }
      toast.success('Update saved');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    } finally { setBusy(false); }
  };

  const escalate = async () => {
    if (escReason.trim().length < 5) return toast.error('Reason too short');
    setBusy(true);
    const { error } = await supabase.from('escalations').insert({
      problem_id: problem.id, reason: escReason, to_level: 'department_officer',
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success('Escalation raised'); setEscReason('');
  };

  const beforePreview = beforeFile ? URL.createObjectURL(beforeFile) : null;
  const afterPreview = afterFile ? URL.createObjectURL(afterFile) : null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-lg leading-tight break-words">{problem.title}</h3>
            <div className="text-[11px] text-muted-foreground mt-1 font-mono">{problem.ticket_no}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground break-words leading-relaxed">{problem.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-muted/40 rounded p-2 space-y-1">
            <div className="font-semibold text-sm mb-1">Reporter</div>
            <div className="inline-flex items-center gap-1"><UserIcon className="w-3 h-3" />{problem.reporter_name} {problem.reporter_age ? `· ${problem.reporter_age} yrs` : ''}</div>
            <div><a href={`tel:${problem.reporter_phone}`} className="inline-flex items-center gap-1 text-primary"><Phone className="w-3 h-3" />{problem.reporter_phone}</a></div>
            <div className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{formatIST(problem.created_at)}</div>
          </div>
          <div className="bg-muted/40 rounded p-2 space-y-1">
            <div className="font-semibold text-sm mb-1">Location</div>
            <div className="inline-flex items-start gap-1"><MapPin className="w-3 h-3 mt-0.5 shrink-0" /><span>{[problem.address_line, problem.area, problem.constituency, problem.city, problem.pincode].filter(Boolean).join(' · ')}</span></div>
            {problem.latitude && <a href={`https://maps.google.com/?q=${problem.latitude},${problem.longitude}`} target="_blank" rel="noreferrer" className="text-[10px] text-primary underline">Open in Maps</a>}
          </div>
        </div>

        {media.length > 0 && (
          <div>
            <div className="font-semibold text-sm mb-2 inline-flex items-center gap-1"><ImageIcon className="w-3 h-3" />Reporter Evidence ({media.length})</div>
            <div className="grid grid-cols-3 gap-2">
              {media.map(m => (
                <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="aspect-square rounded border overflow-hidden block">
                  {m.media_type === 'video'
                    ? <video src={m.url} className="w-full h-full object-cover" />
                    : <img src={m.url} alt="" className="w-full h-full object-cover" />}
                </a>
              ))}
            </div>
          </div>
        )}

        {viewOnly ? (
          <div className="text-xs bg-muted/50 rounded p-3">
            You are a supporter on this assignment (view only). Only the claimer can update status or upload proof.
          </div>
        ) : (
        <div className="space-y-4">
          <div>
            <Label>Status</Label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full h-10 rounded border border-input bg-background px-2 text-sm">
              {STATUS_STAGES.map(s => <option key={s.id} value={s.id}>{s.en}</option>)}
            </select>
          </div>
          <div><Label>Note</Label><Textarea rows={3} value={note} onChange={e => setNote(e.target.value)} /></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3">
              <Label className="text-xs font-semibold inline-flex items-center gap-1"><ImageIcon className="w-3 h-3" />Before photo</Label>
              {beforePreview && (
                <div className="relative mt-2">
                  <img src={beforePreview} alt="Before preview" className="h-32 w-full rounded-lg object-cover border" />
                  <button type="button" onClick={() => setBeforeFile(null)} aria-label="Remove before photo"
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center shadow hover:scale-110 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <Input type="file" accept="image/*" onChange={e => setBeforeFile(e.target.files?.[0] || null)} className="mt-2 text-xs" />
            </div>
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3">
              <Label className="text-xs font-semibold inline-flex items-center gap-1"><ImageIcon className="w-3 h-3" />After photo</Label>
              {afterPreview && (
                <div className="relative mt-2">
                  <img src={afterPreview} alt="After preview" className="h-32 w-full rounded-lg object-cover border" />
                  <button type="button" onClick={() => setAfterFile(null)} aria-label="Remove after photo"
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center shadow hover:scale-110 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <Input type="file" accept="image/*" onChange={e => setAfterFile(e.target.files?.[0] || null)} className="mt-2 text-xs" />
            </div>
          </div>
          <Button onClick={save} disabled={busy} className="w-full">
            {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}<Upload className="w-4 h-4 mr-2" />Save Update
          </Button>

          <div className="border-t pt-3">
            <Label className="text-xs">Escalate this problem</Label>
            <Textarea rows={2} value={escReason} onChange={e => setEscReason(e.target.value)} placeholder="Why escalate?" />
            <Button onClick={escalate} disabled={busy} variant="outline" size="sm" className="w-full mt-2">
              <AlertTriangle className="w-4 h-4 mr-2" />Escalate to Department Officer
            </Button>
          </div>
        </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default CadreDashboard;