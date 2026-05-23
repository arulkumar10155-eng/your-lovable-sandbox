import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import ProblemReportingWizard from '@/components/ProblemReportingWizard';
import WelfareReportingWizard from '@/components/WelfareReportingWizard';
import LiveStats from '@/components/landing/LiveStats';
import TrustTicker from '@/components/landing/TrustTicker';
import CorruptionReportModal from '@/components/CorruptionReportModal';
import CompletedWorksTeaser from '@/components/landing/CompletedWorksTeaser';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Shield, Users, Heart, CheckCircle, Lock, Eye, Database, Building2,
  ArrowRight, AlertTriangle, Search, MapPin, Activity, Briefcase, Map as MapIcon, Megaphone, UserPlus, LogIn
} from 'lucide-react';

const Index = () => {
  const [showProblemWizard, setShowProblemWizard] = useState(false);
  const [showWelfareWizard, setShowWelfareWizard] = useState(false);
  const [showCorruption, setShowCorruption] = useState(false);
  const { language, isBilingual } = useLanguage();
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    if (params.get('report') === '1') {
      setShowProblemWizard(true);
      params.delete('report');
      setParams(params, { replace: true });
    }
    if (params.get('welfare') === '1') {
      setShowWelfareWizard(true);
      params.delete('welfare');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const tt = (ta: string, en: string) => (isBilingual ? `${ta} / ${en}` : language === 'en' ? en : ta);
  const renderTitle = (ta: string, en: string) =>
    isBilingual ? <>{ta}<span className="block text-base md:text-xl text-muted-foreground mt-1">{en}</span></> : (language === 'ta' ? ta : en);

  if (showProblemWizard) return <ProblemReportingWizard onClose={() => setShowProblemWizard(false)} />;
  if (showWelfareWizard) return <WelfareReportingWizard onClose={() => setShowWelfareWizard(false)} />;

  const pillars = [
    { icon: AlertTriangle, ta: 'பொது பிரச்சனைகள்', en: 'Public Problems', desc_ta: 'புகைப்படத்துடன் புகார்', desc_en: 'Photo + GPS report', color: 'bg-red-500', action: () => setShowProblemWizard(true) },
    { icon: Activity, ta: 'நிர்வாக கண்காணிப்பு', en: 'Governance Tracking', desc_ta: 'நிலை, காலம், தீர்வு', desc_en: 'Status & SLA', color: 'bg-orange-500', href: '/track' },
    { icon: MapIcon, ta: 'நேரடி வரைபடம்', en: 'Live Map', desc_ta: 'பகுதி வாரியாக', desc_en: 'Issues by area', color: 'bg-yellow-600', href: '/map' },
    { icon: MapPin, ta: 'களத்தில் உளவுத்துறை', en: 'Ground Intelligence', desc_ta: 'உண்மை-நேர புள்ளியியல்', desc_en: 'Real-time data', color: 'bg-green-600', href: '/ground-intelligence' },
    { icon: Briefcase, ta: 'டிஜிட்டல் தொண்டர்கள்', en: 'Workforce', desc_ta: 'புத்-நிலை அமைப்பு', desc_en: 'Booth-level cadre', color: 'bg-blue-600' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <main className="overflow-x-hidden">
        {/* Hero */}
        <section className="pt-24 pb-10 md:pt-28 md:pb-16 tvk-gradient-bg">
          <div className="container mx-auto px-4 text-center text-primary-foreground">
            <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-medium mb-4">TVK · Makkal Connect</div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
              {renderTitle('மக்கள் கனெக்ட்', 'Makkal Connect')}
            </h1>
            <p className="text-base md:text-xl mb-2 opacity-95">{tt('புகாரளி → கண்காணி → தீர்வு பெறு', 'Report. Track. Resolve.')}</p>
            <p className="text-sm md:text-base mb-8 opacity-80 max-w-2xl mx-auto">
              {tt('உங்கள் பகுதியின் பிரச்சனைகளை GPS, புகைப்படத்துடன் பதிவு செய்யுங்கள்.',
                'Report neighborhood issues with photo & GPS — track resolution end-to-end.')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" onClick={() => setShowProblemWizard(true)} className="font-bold">
                <AlertTriangle className="w-5 h-5 mr-2" />{tt('புகாரளி', 'Report a Problem')}
              </Button>
              <Link to="/track"><Button size="lg" variant="outline" className="bg-white/10 border-white/40 text-white hover:bg-white/20 font-bold">
                <Search className="w-5 h-5 mr-2" />{tt('நிலை பார்க்க', 'Track Status')}
              </Button></Link>
              <Link to="/map"><Button size="lg" variant="outline" className="bg-white/10 border-white/40 text-white hover:bg-white/20 font-bold">
                <MapIcon className="w-5 h-5 mr-2" />{tt('நேரடி வரைபடம்', 'Live Map')}
              </Button></Link>
            </div>
          </div>
        </section>

        {/* Trust ticker — public proof */}
        <TrustTicker />

        {/* 5 Pillars */}
        <section id="participate" className="py-10 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">{renderTitle('5 முக்கிய தூண்கள்', '5 Core Pillars')}</h2>
            <p className="text-center text-muted-foreground text-sm mb-8">{tt('இந்த தளம் என்ன செய்கிறது', 'What this platform does')}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 max-w-6xl mx-auto">
              {pillars.map((p, i) => {
                const Icon = p.icon;
                const inner = (
                  <div className="bg-card border border-border rounded-xl p-4 md:p-5 text-center h-full hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">
                    <div className={`w-12 h-12 ${p.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-sm md:text-base">{tt(p.ta, p.en)}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{tt(p.desc_ta, p.desc_en)}</p>
                  </div>
                );
                return p.href ? <Link key={i} to={p.href}>{inner}</Link>
                  : <div key={i} onClick={p.action}>{inner}</div>;
              })}
            </div>
          </div>
        </section>

        <LiveStats />

        <CompletedWorksTeaser />

        {/* Join as Cadre */}
        <section id="cadre" className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-tvk-maroon to-tvk-maroon/80 text-primary-foreground rounded-3xl p-6 md:p-10 shadow-xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">{tt('TVK காடரே ஆகுங்கள்', 'Become a TVK Cadre')}</h2>
                  <p className="text-sm md:text-base opacity-90">
                    {tt('உங்கள் பகுதியில் மக்களின் பிரச்சனைகளை தீர்க்கும் களப்பணியில் இணையுங்கள்.',
                      'Join the field force resolving people\'s problems in your area.')}
                  </p>
                </div>
              </div>
              <ul className="grid sm:grid-cols-3 gap-2 text-xs md:text-sm opacity-95 mb-6">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />{tt('ஒதுக்கப்பட்ட பணிகள்', 'Get assigned issues')}</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />{tt('முன்/பின் ஆதாரம் பதிவேற்று', 'Upload before/after proof')}</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />{tt('புள்ளி & தரவரிசை சம்பாதியுங்கள்', 'Earn points & ranking')}</li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link to="/cadre/register">
                  <Button size="lg" variant="secondary" className="font-bold">
                    <UserPlus className="w-5 h-5 mr-2" />{tt('பதிவு செய்', 'Register as Cadre')}
                  </Button>
                </Link>
                <Link to="/cadre/login">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/40 text-white hover:bg-white/20 font-bold">
                    <LogIn className="w-5 h-5 mr-2" />{tt('காடரே உள்நுழை', 'Cadre Login')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="know-cadres" className="py-10 md:py-14 bg-tvk-cream">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Users className="w-4 h-4" />{tt('உங்கள் தொகுதி காடரே', 'Your Constituency Cadres')}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{tt('உங்கள் பகுதியில் உள்ள TVK காடரே யார்?', 'Know the TVK cadres in your area')}</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {tt('மாவட்டம் மற்றும் தொகுதியை தேர்வு செய்து அங்கீகரிக்கப்பட்ட காடரே பட்டியலைப் பாருங்கள்.', 'Select district and constituency to view approved cadres.')}
            </p>
            <Link to="/know-your-cadres">
              <Button variant="hero" size="lg" className="font-bold">
                <Users className="w-5 h-5 mr-2" />{tt('காடரே பட்டியல் பார்', 'View Cadres')}
              </Button>
            </Link>
          </div>
        </section>

        {/* Quick actions */}
        <section className="py-10 md:py-14 bg-tvk-cream">
          <div className="container mx-auto px-4 grid sm:grid-cols-2 gap-4 max-w-4xl">
            <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
              <AlertTriangle className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-lg md:text-xl font-bold mb-1">{tt('பகுதியில் பிரச்சனை?', 'Got a problem?')}</h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                {tt('புகைப்படம் + GPS உடன் ஒரு நிமிடத்தில் பதிவு', 'Report in a minute with photo + GPS')}
              </p>
              <Button variant="hero" onClick={() => setShowProblemWizard(true)}>
                {tt('இப்போதே புகாரளி', 'Report Now')} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
              <Shield className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-lg md:text-xl font-bold mb-1">{tt('ஊழல் / லஞ்சம்?', 'Corruption or bribe?')}</h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                {tt('அநாமதேயமாக புகார் அளியுங்கள் — பெயர் தேவையில்லை', 'Report anonymously — no name required')}
              </p>
              <Button variant="outline" onClick={() => setShowCorruption(true)}>
                <Megaphone className="w-4 h-4 mr-2" />{tt('அநாமதேய புகார்', 'Anonymous Report')}
              </Button>
            </div>
          </div>
        </section>

        {/* Welfare / Scheme Issue — new module */}
        <section className="py-10 md:py-14 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-900 rounded-3xl p-6 md:p-8 shadow-lg">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 text-2xl">🏛️</div>
                <div className="min-w-0">
                  <div className="inline-block text-[10px] font-semibold bg-amber-500 text-white px-2 py-0.5 rounded-full mb-1">NEW</div>
                  <h2 className="text-xl md:text-2xl font-bold mb-1">{tt('நலத்திட்டம் / திட்ட சிக்கல்', 'Welfare / Scheme Issue')}</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {tt('ஓய்வூதியம், ரேஷன், உதவித்தொகை, வீட்டுவசதி, சான்றிதழ் தாமதம் — அரசு உரிமை கிடைக்காமல் சிக்கினால் இங்கு புகாரளியுங்கள்.',
                      'Pension stopped, ration denied, scholarship pending, certificate delayed — report any govt benefit/scheme issue here.')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-5">
                {['🍚 Ration','👴 Pension','🎓 Scholarship','🏠 Housing','👩 Women','🏥 Health','💼 Subsidy','📄 Certificate'].map((s, i) => (
                  <div key={i} className="bg-card/80 border border-amber-200/60 dark:border-amber-900/40 rounded-lg p-2 text-center text-[11px] font-medium">{s}</div>
                ))}
              </div>

              <Button size="lg" variant="hero" onClick={() => setShowWelfareWizard(true)} className="w-full sm:w-auto font-bold">
                <Building2 className="w-5 h-5 mr-2" />{tt('நலத்திட்ட புகார் அளி', 'Report Welfare Issue')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* How data helps */}
        <section className="py-10 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{renderTitle('உங்கள் தரவு எப்படி உதவுகிறது', 'How Your Data Helps')}</h2>
            <div className="grid sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              {[
                { icon: Database, ta: 'தொகுதி வாரியாக', en: 'Constituency Mapping', d_ta: 'பிரச்சனைகள் தொகுதி வாரியாக வரிசைப்படுத்தப்படும்', d_en: 'Issues are grouped by constituency for action' },
                { icon: Activity, ta: 'நேரடி கண்காணிப்பு', en: 'Live Tracking', d_ta: '7 நிலைகளில் வெளிப்படையாக காண்பிக்கப்படும்', d_en: '7-stage status visible to everyone' },
                { icon: Heart, ta: 'வெளிப்படையான நிர்வாகம்', en: 'Transparent Governance', d_ta: 'முன் / பின் ஆதாரம் & திருப்தி மதிப்பீடு', d_en: 'Before/after proof & satisfaction scores' },
              ].map((it, i) => {
                const Icon = it.icon;
                return (
                  <div key={i} className="bg-card border border-border rounded-xl p-5 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"><Icon className="w-6 h-6 text-primary" /></div>
                    <h3 className="font-bold text-sm md:text-base">{tt(it.ta, it.en)}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-2">{tt(it.d_ta, it.d_en)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Departments preview */}
        <section id="categories" className="py-10 md:py-16 bg-tvk-cream">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{renderTitle('நாங்கள் கையாளும் துறைகள்', 'Departments we cover')}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-4 max-w-4xl mx-auto">
              {[
                { icon: '🛣️', ta: 'சாலை', en: 'Roads' },
                { icon: '💧', ta: 'குடிநீர்', en: 'Water' },
                { icon: '⚡', ta: 'மின்சாரம்', en: 'Electricity' },
                { icon: '🗑️', ta: 'துப்புரவு', en: 'Sanitation' },
                { icon: '🏥', ta: 'சுகாதாரம்', en: 'Health' },
                { icon: '🍚', ta: 'ரேஷன்', en: 'Ration' },
                { icon: '🛡️', ta: 'பெண் பாதுகாப்பு', en: 'Women Safety' },
                { icon: '⚖️', ta: 'ஊழல்', en: 'Corruption' },
                { icon: '🏫', ta: 'கல்வி', en: 'Education' },
                { icon: '📌', ta: 'மற்றவை', en: 'Other' },
              ].map((c, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-3 md:p-4 text-center hover:shadow transition cursor-pointer" onClick={() => setShowProblemWizard(true)}>
                  <div className="text-2xl md:text-3xl mb-1">{c.icon}</div>
                  <div className="text-xs md:text-sm font-semibold truncate">{tt(c.ta, c.en)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="py-10 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{renderTitle('தனியுரிமை & பாதுகாப்பு', 'Privacy & Security')}</h2>
            <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl p-4 md:p-8 grid sm:grid-cols-2 gap-4 md:gap-6">
              {[
                { icon: Lock, ta: 'குறியாக்கம்', en: 'Encrypted', d_ta: 'பாதுகாப்பான சேவையகங்களில் சேமிப்பு', d_en: 'Stored on secure servers' },
                { icon: Shield, ta: 'அநாமதேய ஆதரவு', en: 'Anonymous support', d_ta: 'லஞ்ச புகார்களில் பெயர் தேவையில்லை', d_en: 'No name needed for corruption reports' },
                { icon: CheckCircle, ta: 'வெளிப்படைத்தன்மை', en: 'Transparency', d_ta: '7 நிலை நிலை வெளிப்படையாக', d_en: '7-stage status fully public' },
                { icon: Eye, ta: 'மக்கள் கட்டுப்பாடு', en: 'Citizen Control', d_ta: 'திருப்தி மதிப்பீடு உங்களிடம்', d_en: 'You confirm resolution & rate' },
              ].map((it, i) => {
                const Icon = it.icon;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-green-600" /></div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm md:text-base">{tt(it.ta, it.en)}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">{tt(it.d_ta, it.d_en)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 md:py-16 tvk-gradient-bg">
          <div className="container mx-auto px-4 text-center text-primary-foreground">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">{tt('உங்கள் பகுதியை மாற்றுவோம்', 'Let’s fix your area, together')}</h2>
            <p className="opacity-90 mb-6 text-sm md:text-base">{tt('ஒரு புகார் — ஒரு தீர்வு — ஒரு வெளிப்படையான நிர்வாகம்', 'One report — one resolution — full transparency')}</p>
            <Button size="lg" variant="secondary" onClick={() => setShowProblemWizard(true)} className="font-bold">
              {tt('இப்போது தொடங்கு', 'Get Started')} →
            </Button>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
      {showCorruption && <CorruptionReportModal onClose={() => setShowCorruption(false)} />}
    </div>
  );
};

export default Index;
