import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, X, MapPin, Calendar, Users, IndianRupee, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DEPARTMENTS } from '@/lib/departments';

const CompletedWorksPage: React.FC = () => {
  const { language, isBilingual } = useLanguage();
  const tt = (ta: string, en: string) => (isBilingual ? `${ta} / ${en}` : language === 'en' ? en : ta);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('completed_works').select('*').eq('published', true).order('highlight', { ascending: false }).order('created_at', { ascending: false });
      setRows(data || []); setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="pt-16 pb-24">
        <BackButton to="/" />
        <section className="container mx-auto px-3 md:px-4 py-6 md:py-10">
          <div className="text-center mb-6 md:mb-10">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">{tt('நிறைவு பெற்ற பணிகள்', 'Completed Works')}</div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">{tt('மக்களுக்கான நிறைவு பெற்ற பணிகள்', 'Works delivered for the people')}</h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">{tt('TVK மற்றும் களப்பணியாளர்களின் முயற்சியால் நிறைவு பெற்ற திட்டங்கள்.', 'Projects completed through TVK and on-ground efforts.')}</p>
          </div>

          {loading ? <div className="text-center text-sm text-muted-foreground py-10">Loading…</div> : rows.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-10">No works to display yet.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {rows.map(r => (
                <button key={r.id} onClick={() => setActive(r)} className="group bg-card border border-border rounded-xl overflow-hidden text-left hover:shadow-lg hover:-translate-y-0.5 transition">
                  <div className="aspect-square bg-muted relative">
                    {(r.cover_image_url || r.after_image_url)
                      ? <img src={r.cover_image_url || r.after_image_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition" loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-muted-foreground" /></div>}
                    {r.highlight && <Badge className="absolute top-2 left-2 bg-yellow-500 text-black text-[10px]"><Star className="w-3 h-3 mr-0.5" />Featured</Badge>}
                  </div>
                  <div className="p-2 md:p-3">
                    <div className="font-semibold text-xs md:text-sm line-clamp-2">{r.title}</div>
                    <div className="text-[10px] md:text-[11px] text-muted-foreground truncate mt-0.5">{[r.area, r.constituency].filter(Boolean).join(' · ') || r.city || '—'}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
      {active && <WorkDetail work={active} onClose={() => setActive(null)} />}
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

const WorkDetail: React.FC<{ work: any; onClose: () => void }> = ({ work, onClose }) => {
  const allImgs = [work.cover_image_url, work.before_image_url, work.after_image_url, ...(work.gallery_urls || [])].filter(Boolean);
  const [idx, setIdx] = useState(0);
  const dep = DEPARTMENTS.find(d => d.id === work.department);
  const reviews: any[] = Array.isArray(work.reviews) ? work.reviews : [];
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-2 md:p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-card border-b p-3 flex justify-between items-center">
          <h2 className="font-bold text-base md:text-lg truncate pr-2">{work.title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="p-3 md:p-4 space-y-4">
          {allImgs.length > 0 && (
            <div className="relative bg-muted rounded-lg overflow-hidden">
              <img src={allImgs[idx]} alt="" className="w-full max-h-[60vh] object-contain" />
              {allImgs.length > 1 && (
                <>
                  <button onClick={() => setIdx((idx - 1 + allImgs.length) % allImgs.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setIdx((idx + 1) % allImgs.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"><ChevronRight className="w-5 h-5" /></button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">{idx + 1}/{allImgs.length}</div>
                </>
              )}
            </div>
          )}

          {work.before_image_url && work.after_image_url && (
            <div className="grid grid-cols-2 gap-2">
              <div><div className="text-xs font-semibold mb-1">Before</div><img src={work.before_image_url} className="w-full h-32 object-cover rounded border" /></div>
              <div><div className="text-xs font-semibold mb-1">After</div><img src={work.after_image_url} className="w-full h-32 object-cover rounded border" /></div>
            </div>
          )}

          {work.description && <p className="text-sm whitespace-pre-wrap">{work.description}</p>}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {dep && <div className="bg-muted/40 rounded p-2"><div className="text-[10px] text-muted-foreground">Department</div>{dep.icon} {dep.en}</div>}
            {(work.area || work.constituency || work.city) && <div className="bg-muted/40 rounded p-2"><div className="text-[10px] text-muted-foreground inline-flex items-center gap-1"><MapPin className="w-3 h-3" />Location</div>{[work.area, work.constituency, work.city].filter(Boolean).join(', ')}</div>}
            {work.beneficiaries && <div className="bg-muted/40 rounded p-2"><div className="text-[10px] text-muted-foreground inline-flex items-center gap-1"><Users className="w-3 h-3" />Beneficiaries</div>{work.beneficiaries.toLocaleString()}</div>}
            {work.cost_amount && <div className="bg-muted/40 rounded p-2"><div className="text-[10px] text-muted-foreground inline-flex items-center gap-1"><IndianRupee className="w-3 h-3" />Cost</div>₹{Number(work.cost_amount).toLocaleString()}</div>}
            {work.completed_on && <div className="bg-muted/40 rounded p-2"><div className="text-[10px] text-muted-foreground inline-flex items-center gap-1"><Calendar className="w-3 h-3" />Completed</div>{new Date(work.completed_on).toLocaleDateString('en-IN')}</div>}
          </div>

          {reviews.length > 0 && (
            <div>
              <div className="font-semibold text-sm mb-2">Citizen Reviews</div>
              <div className="space-y-2">
                {reviews.map((r, i) => (
                  <div key={i} className="bg-muted/40 rounded p-3">
                    <div className="flex justify-between items-center"><div className="font-semibold text-sm">{r.name || 'Anonymous'}</div>
                    <div className="flex">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`w-3 h-3 ${j < (r.rating || 0) ? 'fill-yellow-500 text-yellow-500' : 'text-muted'}`} />)}</div></div>
                    {r.comment && <p className="text-xs text-muted-foreground mt-1">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletedWorksPage;
