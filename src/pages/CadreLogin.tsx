import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, LogIn } from 'lucide-react';
import TVKLogo from '@/components/TVKLogo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CadreLogin: React.FC = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session) {
        const { data: c } = await supabase.from('cadres').select('id').eq('user_id', session.user.id).maybeSingle();
        if (c) { nav('/cadre', { replace: true }); return; }
      }
      setChecking(false);
    })();
    return () => { mounted = false; };
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success('Welcome back!');
    nav('/cadre');
  };

  if (checking) return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="pt-20 pb-10">
        <div className="container mx-auto px-3 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <TVKLogo size="sm" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Cadre Login</h1>
              <p className="text-xs text-muted-foreground">Access your assigned tasks</p>
            </div>
          </div>
          <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-4 md:p-5 space-y-3">
            <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <Button type="submit" disabled={busy} className="w-full" variant="hero">
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}<LogIn className="w-4 h-4 mr-2" />Login
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              No account? <Link to="/cadre/register" className="text-primary underline">Register</Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default CadreLogin;