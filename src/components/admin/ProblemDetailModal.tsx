import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Phone, Clock, User, CheckCircle2, Circle, ArrowUpCircle, UserCheck, Wrench, FileImage } from 'lucide-react';
import { DEPARTMENTS, STATUS_STAGES } from '@/lib/departments';
import MediaPreviewModal from '@/components/MediaPreviewModal';

const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.round(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)} hr ago`;
  if (diff < 86400 * 7) return `${Math.round(diff / 86400)} days ago`;
  return new Date(iso).toLocaleDateString();
};

const STATUS_META: Record<string, { label: string; tamil: string; icon: any; color: string }> = {
  submitted: { label: 'Report Submitted', tamil: 'புகார் பதிவு', icon: FileImage, color: 'bg-blue-500' },
  assigned: { label: 'Assigned to Team', tamil: 'குழுவுக்கு ஒதுக்கப்பட்டது', icon: UserCheck, color: 'bg-indigo-500' },
  claimed: { label: 'Claimed by Cadre', tamil: 'தொண்டர் ஏற்றார்', icon: UserCheck, color: 'bg-purple-500' },
  in_progress: { label: 'Work in Progress', tamil: 'பணி நடைபெறுகிறது', icon: Wrench, color: 'bg-amber-500' },
  completed: { label: 'Work Completed', tamil: 'பணி முடிந்தது', icon: CheckCircle2, color: 'bg-green-600' },
  citizen_confirmed: { label: 'Citizen Confirmed', tamil: 'குடிமகன் உறுதிப்படுத்தினார்', icon: CheckCircle2, color: 'bg-emerald-700' },
  escalated: { label: 'Escalated', tamil: 'மேல்நிலைக்கு', icon: ArrowUpCircle, color: 'bg-orange-500' },
};

const ProblemDetailModal: React.FC<{ problem: any; onClose: () => void }> = ({ problem, onClose }) => {
  const [media, setMedia] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [m, u, a, e] = await Promise.all([
        supabase.from('problem_media').select('*').eq('problem_id', problem.id),
        supabase.from('problem_updates').select('*').eq('problem_id', problem.id).order('created_at', { ascending: false }),
        supabase.from('problem_assignments').select('*').eq('problem_id', problem.id),
        supabase.from('escalations').select('*').eq('problem_id', problem.id).order('created_at', { ascending: false }),
      ]);
      const aRows = a.data || [];
      const cadreIds = Array.from(new Set(aRows.flatMap((r: any) => [r.cadre_id, r.claimed_by_cadre_id]).filter(Boolean)));
      const teamIds = Array.from(new Set(aRows.map((r: any) => r.team_id).filter(Boolean)));
      const [{ data: cs }, { data: ts }] = await Promise.all([
        cadreIds.length ? supabase.from('cadres').select('id,name,phone,level').in('id', cadreIds) : Promise.resolve({ data: [] as any[] }),
        teamIds.length ? supabase.from('teams').select('id,name').in('id', teamIds) : Promise.resolve({ data: [] as any[] }),
      ]);
      const cMap = new Map((cs || []).map((x: any) => [x.id, x]));
      const tMap = new Map((ts || []).map((x: any) => [x.id, x]));
      const enriched = aRows.map((r: any) => ({
        ...r,
        cadres: r.cadre_id ? cMap.get(r.cadre_id) : null,
        claimed_by_cadre: r.claimed_by_cadre_id ? cMap.get(r.claimed_by_cadre_id) : null,
        teams: r.team_id ? tMap.get(r.team_id) : null,
      }));
      setMedia(m.data || []); setUpdates(u.data || []); setAssignments(enriched); setEscalations(e.data || []);
    })();
  }, [problem.id]);

  const dep = DEPARTMENTS.find(d => d.id === problem.department);
  const stage = STATUS_STAGES.find(s => s.id === problem.status);

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-2 md:p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-start justify-between gap-2 z-10">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1 mb-1">
              <span className="font-mono text-xs bg-muted px-1.5 rounded">{problem.ticket_no}</span>
              <Badge variant="outline" className="text-[10px]">{dep?.en}</Badge>
              <Badge variant="outline" className="text-[10px]">{stage?.en}</Badge>
              {problem.urgency === 'emergency' && <Badge className="bg-red-600 text-white text-[10px]">EMERGENCY</Badge>}
            </div>
            <h2 className="font-bold text-base md:text-lg break-words">{problem.title}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm break-words whitespace-pre-wrap">{problem.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-muted/40 rounded p-2 space-y-1">
              <div className="font-semibold text-sm mb-1">Reporter</div>
              <div className="inline-flex items-center gap-1"><User className="w-3 h-3" />{problem.reporter_name} {problem.reporter_age ? `· ${problem.reporter_age} yrs` : ''}</div>
              <div className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{problem.reporter_phone}</div>
              <div className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(problem.created_at).toLocaleString()}</div>
            </div>
            <div className="bg-muted/40 rounded p-2 space-y-1">
              <div className="font-semibold text-sm mb-1">Location</div>
              <div className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{[problem.address_line, problem.area, problem.constituency, problem.city, problem.pincode].filter(Boolean).join(' · ')}</div>
              {problem.polling_booth && <div>Booth: {problem.polling_booth}</div>}
              {problem.latitude && <div className="text-[10px]">GPS: {Number(problem.latitude).toFixed(4)}, {Number(problem.longitude).toFixed(4)}</div>}
            </div>
          </div>

          {media.length > 0 && (
            <div>
              <div className="font-semibold text-sm mb-2">Media ({media.length})</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {media.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPreviewUrl(m.url)}
                    className="block rounded overflow-hidden border border-border hover:border-primary transition-colors"
                  >
                    <img src={m.url} alt="" className="w-full h-32 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {assignments.length > 0 && (
            <div>
              <div className="font-semibold text-sm mb-2">Assignments & Claim Audit</div>
              <div className="space-y-2 text-xs">
                {assignments.map(a => {
                  const claimer = (a as any).claimed_by_cadre || a.cadres;
                  const claimedAt = a.claimed_at ? new Date(a.claimed_at) : null;
                  const elapsedH = claimedAt ? Math.max(0, (Date.now() - claimedAt.getTime()) / 36e5) : null;
                  const elapsedLabel = elapsedH == null ? null : elapsedH < 1 ? `${Math.round(elapsedH * 60)}m ago` : elapsedH < 24 ? `${elapsedH.toFixed(1)}h ago` : `${(elapsedH / 24).toFixed(1)}d ago`;
                  return (
                    <div key={a.id} className="bg-muted/40 rounded p-2 space-y-0.5">
                      {a.teams?.name && <div><span className="font-semibold">Team:</span> {a.teams.name}</div>}
                      {a.cadres?.name && <div><span className="font-semibold">Assigned:</span> {a.cadres.name} ({a.cadres.level})</div>}
                      {claimer?.name ? (
                        <div className="text-green-700">
                          <span className="font-semibold">Claimed by:</span> {claimer.name}
                          {claimedAt && <span className="text-muted-foreground"> · {claimedAt.toLocaleString()} ({elapsedLabel})</span>}
                        </div>
                      ) : a.team_id ? <div className="text-amber-700"><span className="font-semibold">Status:</span> Open for team claim</div> : null}
                      {a.notes && <div className="text-muted-foreground italic">"{a.notes}"</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {updates.length > 0 && (
            <div>
              <div className="font-semibold text-sm mb-3">Progress Timeline</div>
              <ol className="relative border-l-2 border-border ml-3 space-y-4">
                {[...updates].reverse().map((u, idx, arr) => {
                  const meta = STATUS_META[u.status] || { label: u.status?.replace(/_/g, ' '), tamil: '', icon: Circle, color: 'bg-muted-foreground' };
                  const Icon = meta.icon;
                  const isLatest = idx === arr.length - 1;
                  return (
                    <li key={u.id} className="ml-4 relative">
                      <span className={`absolute -left-[26px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-white shadow ${meta.color} ${isLatest ? 'ring-4 ring-primary/20 animate-pulse' : ''}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <div className="bg-muted/40 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <div className="font-semibold text-sm">{meta.label}</div>
                            {meta.tamil && <div className="text-[11px] text-muted-foreground">{meta.tamil}</div>}
                          </div>
                          <div className="text-[10px] text-muted-foreground text-right">
                            <div>{timeAgo(u.created_at)}</div>
                            <div>{new Date(u.created_at).toLocaleString()}</div>
                          </div>
                        </div>
                        {u.note && <div className="text-xs text-foreground/80 mt-2 italic">"{u.note}"</div>}
                        {(u.before_url || u.after_url) && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {u.before_url && (
                              <button type="button" onClick={() => setPreviewUrl(u.before_url)} className="text-left">
                                <div className="text-[10px] font-semibold text-muted-foreground mb-0.5">Before</div>
                                <img src={u.before_url} alt="before" className="w-full h-24 object-cover rounded border hover:border-primary" />
                              </button>
                            )}
                            {u.after_url && (
                              <button type="button" onClick={() => setPreviewUrl(u.after_url)} className="text-left">
                                <div className="text-[10px] font-semibold text-green-700 mb-0.5">After</div>
                                <img src={u.after_url} alt="after" className="w-full h-24 object-cover rounded border hover:border-primary" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {escalations.length > 0 && (
            <div>
              <div className="font-semibold text-sm mb-2">Escalations</div>
              <div className="space-y-1">
                {escalations.map(e => (
                  <div key={e.id} className="bg-orange-50 border border-orange-200 rounded p-2 text-xs">
                    <div className="flex justify-between"><span className="font-semibold">→ {e.to_level}</span><Badge variant={e.status === 'open' ? 'destructive' : 'secondary'} className="text-[10px]">{e.status}</Badge></div>
                    <div className="text-muted-foreground mt-1">{e.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {previewUrl && <MediaPreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </div>
  );
};
export default ProblemDetailModal;