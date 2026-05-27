import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, User, CheckCircle2, Circle, ArrowUpCircle, UserCheck, Wrench, FileImage, Hash, Calendar, Navigation, AlertTriangle } from 'lucide-react';
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
  reported: { label: 'Report Submitted', tamil: 'புகார் பதிவு', icon: FileImage, color: 'bg-blue-500' },
  assigned: { label: 'Assigned to Team', tamil: 'குழுவுக்கு ஒதுக்கப்பட்டது', icon: UserCheck, color: 'bg-indigo-500' },
  claimed: { label: 'Claimed by Cadre', tamil: 'தொண்டர் ஏற்றார்', icon: UserCheck, color: 'bg-purple-500' },
  in_progress: { label: 'Work in Progress', tamil: 'பணி நடைபெறுகிறது', icon: Wrench, color: 'bg-amber-500' },
  work_started: { label: 'Work Started', tamil: 'பணி துவங்கியது', icon: Wrench, color: 'bg-amber-500' },
  completed: { label: 'Work Completed', tamil: 'பணி முடிந்தது', icon: CheckCircle2, color: 'bg-green-600' },
  resolved: { label: 'Resolved', tamil: 'தீர்க்கப்பட்டது', icon: CheckCircle2, color: 'bg-green-600' },
  citizen_confirmed: { label: 'Citizen Confirmed', tamil: 'குடிமகன் உறுதிப்படுத்தினார்', icon: CheckCircle2, color: 'bg-emerald-700' },
  escalated: { label: 'Escalated', tamil: 'மேல்நிலைக்கு', icon: ArrowUpCircle, color: 'bg-orange-500' },
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{children}</div>
);

const InfoRow: React.FC<{ icon: any; label: string; value?: React.ReactNode }> = ({ icon: Icon, label, value }) =>
  value ? (
    <div className="flex items-start gap-2.5 text-sm">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="font-medium break-words">{value}</div>
      </div>
    </div>
  ) : null;

const ProblemDetailModal: React.FC<{ problem: any; onClose: () => void }> = ({ problem, onClose }) => {
  const [media, setMedia] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Single round-trip: problem + media + updates + assignments + escalations.
      const { data } = await (supabase.rpc as any)('problem_detail', { _id: problem.id });
      const payload: any = data || {};
      const aRows: any[] = payload.assignments || [];
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
      setMedia(payload.media || []);
      setUpdates(payload.updates || []);
      setAssignments(enriched);
      setEscalations(payload.escalations || []);
    })();
  }, [problem.id]);

  const dep = DEPARTMENTS.find(d => d.id === problem.department);
  const stage = STATUS_STAGES.find(s => s.id === problem.status);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="sticky top-0 bg-card border-b z-10 px-5 py-4">
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{problem.ticket_no}</span>
            <Badge variant="outline" className="text-[10px]">{dep?.icon} {dep?.en}</Badge>
            <Badge variant="outline" className={`text-[10px] ${stage?.color || ''}`}>{stage?.en || problem.status}</Badge>
            {problem.urgency === 'emergency' && <Badge className="bg-red-600 text-white text-[10px]">EMERGENCY</Badge>}
            {problem.urgency === 'high' && <Badge className="bg-orange-500 text-white text-[10px]">HIGH</Badge>}
          </div>
          <DialogTitle className="text-base md:text-lg break-words">{problem.title}</DialogTitle>
        </DialogHeader>

        <div className="px-5 py-5 space-y-6">
          {/* Description block */}
          <section>
            <SectionTitle>Description</SectionTitle>
            <p className="text-sm whitespace-pre-wrap break-words bg-muted/30 rounded-lg p-3 leading-relaxed">{problem.description}</p>
          </section>

          {/* Reporter + Location side-by-side */}
          <div className="grid md:grid-cols-2 gap-6">
            <section className="space-y-3">
              <SectionTitle>Reporter</SectionTitle>
              <InfoRow icon={User} label="Name" value={`${problem.reporter_name}${problem.reporter_age ? ` · ${problem.reporter_age} yrs` : ''}`} />
              <InfoRow icon={Phone} label="Phone" value={<a href={`tel:${problem.reporter_phone}`} className="text-primary">{problem.reporter_phone}</a>} />
              <InfoRow icon={Calendar} label="Reported on" value={new Date(problem.created_at).toLocaleString()} />
            </section>

            <section className="space-y-3">
              <SectionTitle>Location</SectionTitle>
              <InfoRow icon={MapPin} label="Address" value={[problem.address_line, problem.area, problem.constituency, problem.city, problem.pincode].filter(Boolean).join(' · ')} />
              {problem.polling_booth && <InfoRow icon={Hash} label="Polling Booth" value={problem.polling_booth} />}
              {problem.latitude && (
                <InfoRow icon={Navigation} label="GPS" value={
                  <a href={`https://maps.google.com/?q=${problem.latitude},${problem.longitude}`} target="_blank" rel="noreferrer" className="text-primary">
                    {Number(problem.latitude).toFixed(5)}, {Number(problem.longitude).toFixed(5)}
                  </a>
                } />
              )}
            </section>
          </div>

          {/* Media */}
          {media.length > 0 && (
            <section className="border-t pt-5">
              <SectionTitle>Media ({media.length})</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {media.map(m => (
                  <button key={m.id} type="button" onClick={() => setPreviewUrl(m.url)}
                    className="rounded-lg overflow-hidden border hover:border-primary transition-colors">
                    <img src={m.url} alt="" className="w-full h-32 object-cover" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Assignments */}
          {assignments.length > 0 && (
            <section className="border-t pt-5">
              <SectionTitle>Assignments & Claims</SectionTitle>
              <div className="space-y-2">
                {assignments.map(a => {
                  const claimer = (a as any).claimed_by_cadre || a.cadres;
                  const claimedAt = a.claimed_at ? new Date(a.claimed_at) : null;
                  return (
                    <div key={a.id} className="border rounded-lg p-3 text-sm space-y-1">
                      {a.teams?.name && <div><span className="text-muted-foreground text-xs">Team:</span> <span className="font-medium">{a.teams.name}</span></div>}
                      {a.cadres?.name && <div><span className="text-muted-foreground text-xs">Assigned:</span> <span className="font-medium">{a.cadres.name}</span> <span className="text-xs text-muted-foreground">({a.cadres.level})</span></div>}
                      {claimer?.name ? (
                        <div className="text-green-700"><span className="text-xs">Claimed by:</span> <span className="font-medium">{claimer.name}</span>
                          {claimedAt && <span className="text-xs text-muted-foreground"> · {claimedAt.toLocaleString()}</span>}
                        </div>
                      ) : a.team_id ? <div className="text-amber-700 text-xs">Open for team claim</div> : null}
                      {a.notes && <div className="text-xs text-muted-foreground italic">"{a.notes}"</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Timeline */}
          {updates.length > 0 && (
            <section className="border-t pt-5">
              <SectionTitle>Progress Timeline</SectionTitle>
              <ol className="relative border-l-2 border-border ml-3 space-y-4">
                {[...updates].reverse().map((u, idx, arr) => {
                  const meta = STATUS_META[u.status] || { label: u.status?.replace(/_/g, ' '), tamil: '', icon: Circle, color: 'bg-muted-foreground' };
                  const Icon = meta.icon;
                  const isLatest = idx === arr.length - 1;
                  return (
                    <li key={u.id} className="ml-4 relative">
                      <span className={`absolute -left-[26px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-white shadow ${meta.color} ${isLatest ? 'ring-4 ring-primary/20' : ''}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <div className="bg-muted/30 rounded-lg p-3">
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
            </section>
          )}

          {/* Escalations */}
          {escalations.length > 0 && (
            <section className="border-t pt-5">
              <SectionTitle>Escalations</SectionTitle>
              <div className="space-y-2">
                {escalations.map(e => (
                  <div key={e.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold inline-flex items-center gap-1"><ArrowUpCircle className="w-4 h-4 text-orange-600" />→ {e.to_level}</span>
                      <Badge variant={e.status === 'open' ? 'destructive' : 'secondary'} className="text-[10px]">{e.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{e.reason}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </DialogContent>
      {previewUrl && <MediaPreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </Dialog>
  );
};
export default ProblemDetailModal;
