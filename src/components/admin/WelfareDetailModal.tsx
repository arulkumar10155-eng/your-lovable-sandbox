import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Phone, MapPin, Calendar, FileText, Hash, Clock, Building2, Receipt } from 'lucide-react';
import { WELFARE_SCHEMES, WELFARE_STATUS } from '@/lib/welfareSchemes';
import MediaPreviewModal from '@/components/MediaPreviewModal';

interface Props {
  welfare: any;
  onClose: () => void;
  canEdit?: boolean;
  onChanged?: () => void;
}

const Row: React.FC<{ icon: any; label: string; value?: React.ReactNode }> = ({ icon: Icon, label, value }) =>
  value ? (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="font-medium break-words">{value}</div>
      </div>
    </div>
  ) : null;

const WelfareDetailModal: React.FC<Props> = ({ welfare, onClose, canEdit, onChanged }) => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState(welfare.status);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('welfare_updates').select('*').eq('welfare_issue_id', welfare.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setUpdates(data || []));
  }, [welfare.id]);

  const scheme = WELFARE_SCHEMES.find(s => s.id === welfare.scheme_type);
  const sub = scheme?.subcategories.find(c => c.id === welfare.subcategory);
  const stage = WELFARE_STATUS.find(s => s.id === welfare.status);

  const saveStatus = async () => {
    setBusy(true);
    const upd: any = { status: newStatus };
    if (['resolved', 'citizen_confirmed'].includes(newStatus)) upd.resolved_at = new Date().toISOString();
    const { error } = await supabase.from('welfare_issues').update(upd).eq('id', welfare.id);
    if (!error) {
      await supabase.from('welfare_updates').insert({
        welfare_issue_id: welfare.id, status: newStatus, note: note || null,
      });
      // Fire-and-forget SMS to citizen for key milestones
      const smsTrigger = newStatus === 'under_processing' || newStatus === 'dept_contacted'
        ? 'WELFARE_PROCESSING'
        : (newStatus === 'resolved' ? 'WELFARE_RESOLVED' : null);
      if (smsTrigger) {
        supabase.functions.invoke('send-sms', { body: { welfareId: welfare.id, trigger: smsTrigger } })
          .catch(e => console.warn('[welfare-sms]', e));
      }
      toast.success('Status updated');
      setNote('');
      onChanged?.();
      const { data } = await supabase.from('welfare_updates').select('*').eq('welfare_issue_id', welfare.id).order('created_at', { ascending: false });
      setUpdates(data || []);
    } else toast.error(error.message);
    setBusy(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 bg-card border-b z-10 px-5 py-4">
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{welfare.ticket_no}</span>
            <Badge variant="outline" className="text-[10px]">{scheme?.icon} {scheme?.en}</Badge>
            <Badge className={`text-[10px] ${stage?.color || ''}`}>{stage?.en || welfare.status}</Badge>
            {welfare.urgency === 'emergency' && <Badge className="bg-red-600 text-white text-[10px]">EMERGENCY</Badge>}
          </div>
          <DialogTitle className="text-base md:text-lg break-words">{welfare.title}</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-5">
          {/* Description */}
          <section>
            <div className="text-xs font-semibold text-muted-foreground mb-1.5">DESCRIPTION</div>
            <p className="text-sm whitespace-pre-wrap break-words bg-muted/30 rounded-lg p-3">{welfare.description}</p>
          </section>

          {/* Two-column info grid */}
          <div className="grid md:grid-cols-2 gap-5">
            <section className="space-y-2.5">
              <div className="text-xs font-semibold text-muted-foreground">REPORTER</div>
              <Row icon={User} label="Name" value={`${welfare.reporter_name}${welfare.reporter_age ? ` · ${welfare.reporter_age} yrs` : ''}`} />
              <Row icon={Phone} label="Phone" value={<a href={`tel:${welfare.reporter_phone}`} className="text-primary">{welfare.reporter_phone}</a>} />
              <Row icon={Calendar} label="Reported" value={new Date(welfare.created_at).toLocaleString()} />
            </section>

            <section className="space-y-2.5">
              <div className="text-xs font-semibold text-muted-foreground">LOCATION</div>
              <Row icon={MapPin} label="Address" value={[welfare.address_line, welfare.area, welfare.constituency, welfare.city, welfare.pincode].filter(Boolean).join(' · ')} />
            </section>
          </div>

          {/* Scheme details */}
          <section className="space-y-2.5 border-t pt-4">
            <div className="text-xs font-semibold text-muted-foreground">SCHEME DETAILS</div>
            <div className="grid md:grid-cols-2 gap-2.5">
              <Row icon={Building2} label="Scheme Type" value={scheme?.en} />
              <Row icon={FileText} label="Subcategory" value={sub?.en || welfare.subcategory} />
              <Row icon={Receipt} label="Scheme Name" value={welfare.scheme_name} />
              <Row icon={Hash} label="Application ID" value={welfare.application_id} />
              <Row icon={Clock} label="Pending" value={welfare.months_pending} />
              <Row icon={Building2} label="Routed Dept" value={welfare.department} />
            </div>
          </section>

          {/* Proof */}
          {welfare.proof_urls?.length > 0 && (
            <section className="border-t pt-4">
              <div className="text-xs font-semibold text-muted-foreground mb-2">PROOF ({welfare.proof_urls.length})</div>
              <div className="grid grid-cols-3 gap-2">
                {welfare.proof_urls.map((u: string, i: number) => (
                  <button key={i} type="button" onClick={() => setPreview(u)} className="rounded overflow-hidden border hover:border-primary">
                    <img src={u} alt="" className="w-full h-24 object-cover" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Timeline */}
          {updates.length > 0 && (
            <section className="border-t pt-4">
              <div className="text-xs font-semibold text-muted-foreground mb-2">TIMELINE</div>
              <ol className="space-y-2">
                {updates.map(u => {
                  const meta = WELFARE_STATUS.find(s => s.id === u.status);
                  return (
                    <li key={u.id} className="bg-muted/30 rounded-lg p-3 text-sm">
                      <div className="flex justify-between gap-2">
                        <Badge className={`text-[10px] ${meta?.color || ''}`}>{meta?.en || u.status}</Badge>
                        <span className="text-[10px] text-muted-foreground">{new Date(u.created_at).toLocaleString()}</span>
                      </div>
                      {u.note && <p className="mt-1 text-xs italic">"{u.note}"</p>}
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {/* Update controls */}
          {canEdit && (
            <section className="border-t pt-4 space-y-2 bg-primary/5 -mx-5 px-5 py-4">
              <div className="text-xs font-semibold">Update status</div>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WELFARE_STATUS.map(s => <SelectItem key={s.id} value={s.id}>{s.en}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea placeholder="Add a note (optional)" value={note} onChange={e => setNote(e.target.value)} rows={2} />
              <Button onClick={saveStatus} disabled={busy} className="w-full">Save update</Button>
            </section>
          )}
        </div>
      </DialogContent>
      {preview && <MediaPreviewModal url={preview} onClose={() => setPreview(null)} />}
    </Dialog>
  );
};

export default WelfareDetailModal;
