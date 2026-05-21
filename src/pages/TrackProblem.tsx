import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { STATUS_STAGES, DEPARTMENTS, URGENCY_LEVELS } from '@/lib/departments';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, MapPin, Calendar, Users, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

const TrackProblem: React.FC = () => {
  const { language, isBilingual } = useLanguage();
  const tt = (ta: string, en: string) => (isBilingual ? `${ta} / ${en}` : language === 'en' ? en : ta);
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('t') || '');
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [claim, setClaim] = useState<any>(null);

  const formatIST = (value: string) => new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata',
  }).format(new Date(value));

  const lookup = async (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) return;
    setLoading(true); setProblem(null);
    const isPhone = /^\d{10}$/.test(term);
    const sb = supabase.from('problems').select('*').order('created_at', { ascending: false }).limit(1);
    const { data, error } = isPhone ? await sb.eq('reporter_phone', term) : await sb.eq('ticket_no', term.toUpperCase());
    if (error || !data?.length) { toast.error(tt('கண்டுபிடிக்கப்படவில்லை', 'Not found')); setLoading(false); return; }
    const p = data[0];
    setProblem(p);
    const [{ data: u }, { data: m }, { data: a }] = await Promise.all([
      supabase.from('problem_updates').select('*').eq('problem_id', p.id).order('created_at', { ascending: true }),
      supabase.from('problem_media').select('*').eq('problem_id', p.id),
      (supabase.from('problem_assignments' as any) as any).select('claimed_at,estimated_completion_at,claimed_by_cadre_id').eq('problem_id', p.id).not('claimed_by_cadre_id', 'is', null).order('claimed_at', { ascending: false }).limit(1),
    ]);
    setUpdates(u || []); setMedia(m || []); setClaim(a?.[0] || null);
    setLoading(false);
  };

  useEffect(() => { if (params.get('t')) lookup(params.get('t')!); }, []);

  const stageIdx = problem ? STATUS_STAGES.findIndex(s => s.id === problem.status) : -1;
  const dept = problem ? DEPARTMENTS.find(d => d.id === problem.department) : null;
  const urg = problem ? URGENCY_LEVELS.find(u => u.id === problem.urgency) : null;

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <BackButton to="/" />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{tt('புகார் நிலையை கண்காணி', 'Track Your Complaint')}</h1>
          <p className="text-sm text-muted-foreground mb-6">{tt('டிக்கெட் எண் அல்லது 10-இலக்க கைபேசி எண் கொடுக்கவும்', 'Enter ticket number or 10-digit phone')}</p>

          <div className="flex gap-2 mb-8">
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="MC-XXXXXXXX or 9876543210" onKeyDown={e => e.key === 'Enter' && lookup()} />
            <Button onClick={() => lookup()} disabled={loading}><Search className="w-4 h-4 mr-1" />{tt('தேடு', 'Search')}</Button>
          </div>

          {problem && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">{problem.ticket_no}</div>
                    <h2 className="text-lg md:text-xl font-bold">{problem.title}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {urg && <Badge className={urg.color}>{tt(urg.ta, urg.en)}</Badge>}
                    {dept && <Badge variant="outline">{dept.icon} {tt(dept.ta, dept.en)}</Badge>}
                    {claim?.claimed_at && <Badge className="bg-green-600 text-white">{tt('ஏற்கப்பட்டது', 'Claimed')}</Badge>}
                    {problem.support_count > 1 && <Badge className="bg-primary/10 text-primary"><Users className="w-3 h-3 mr-1" />{problem.support_count} {tt('ஆதரவு', 'supporters')}</Badge>}
                  </div>
                </div>
                <p className="text-sm text-foreground/80 mb-3">{problem.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[problem.area, problem.constituency, problem.city].filter(Boolean).join(', ')}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(problem.created_at).toLocaleString()}</span>
                </div>
                {claim?.estimated_completion_at && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <Clock className="w-3 h-3" />{tt('முடிக்கும் மதிப்பிடப்பட்ட நேரம்', 'Estimated completion')}: {formatIST(claim.estimated_completion_at)}
                  </div>
                )}
              </div>

              {/* Status Pipeline */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-bold mb-4">{tt('நிலை', 'Status Pipeline')}</h3>
                <div className="space-y-3">
                  {STATUS_STAGES.map((s, i) => {
                    const done = i <= stageIdx;
                    const current = i === stageIdx;
                    return (
                      <div key={s.id} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${current ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {tt(s.ta, s.en)}
                          </div>
                        </div>
                        {current && <Badge className={s.color}>{tt('தற்போது', 'Current')}</Badge>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {media.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-bold mb-3">{tt('ஆதாரம்', 'Evidence')}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {media.map(m => m.media_type === 'video'
                      ? <video key={m.id} src={m.url} controls className="w-full h-32 object-cover rounded" />
                      : <img key={m.id} src={m.url} alt="" className="w-full h-32 object-cover rounded" />)}
                  </div>
                </div>
              )}

              {updates.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-bold mb-3">{tt('நேர வரிசை', 'Timeline')}</h3>
                  <div className="space-y-3">
                    {updates.map(u => (
                      <div key={u.id} className="border-l-2 border-primary pl-3">
                        <div className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString()}</div>
                        <div className="text-sm font-medium">{STATUS_STAGES.find(s => s.id === u.status)?.[language === 'en' ? 'en' : 'ta'] || u.status}</div>
                        {u.note && <div className="text-sm text-foreground/80">{u.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default TrackProblem;
