import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DEPARTMENTS } from '@/lib/departments';
import { Shield, RefreshCw, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import CorruptionDetailModal from './CorruptionDetailModal';

const CorruptionReports: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('corruption_reports').select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setRows(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" /><h2 className="font-bold">Anonymous Corruption Reports</h2>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={load}><RefreshCw className="w-4 h-4" /></Button>
      </div>
      {loading ? <div className="text-sm text-muted-foreground text-center py-6">Loading…</div> :
       rows.length === 0 ? <div className="text-sm text-muted-foreground text-center py-6">No reports yet</div> :
       rows.map(r => {
         const evCount = (r.evidence_urls?.length || (r.evidence_url ? 1 : 0));
         return (
           <button key={r.id} onClick={() => setOpen(r)} className="w-full text-left bg-card border border-border rounded-lg p-3 hover:border-primary transition-colors">
             <div className="flex flex-wrap gap-2 items-center mb-1">
               <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{r.ticket_no}</span>
               <Badge variant="outline" className="text-[10px] capitalize">{r.status.replace(/_/g, ' ')}</Badge>
               {r.department && <Badge variant="secondary" className="text-[10px]">{DEPARTMENTS.find(d=>d.id===r.department)?.en || r.department}</Badge>}
               {evCount > 0 && <Badge className="bg-blue-600 text-white text-[10px]"><ImageIcon className="w-3 h-3 mr-0.5" />{evCount}</Badge>}
               <span className="text-[11px] text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
             </div>
             <p className="text-sm line-clamp-2 break-words">{r.description}</p>
             <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-2">
               {[r.office_location, r.constituency, r.city].filter(Boolean).join(' · ')}
               {r.amount_demanded && <span>· ₹{Number(r.amount_demanded).toLocaleString('en-IN')}</span>}
             </div>
           </button>
         );
       })}
       {open && <CorruptionDetailModal report={open} onClose={() => setOpen(null)} onChanged={load} />}
    </div>
  );
};
export default CorruptionReports;
