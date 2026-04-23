import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, Lock, User, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate('/dashboard');
  }, [authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password, mfaCode || undefined);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-3xl mb-4 shadow-lg shadow-sky-200">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent mb-2">Secure EMR System</h1>
          <p className="text-slate-600">Zero Trust electronic medical records portal</p>
        </div>
        <Card className="shadow-xl shadow-sky-100 border-sky-100">
          <CardHeader>
            <CardTitle>Secure Login</CardTitle>
            <CardDescription>Authenticate against the Flask API with MFA and server-enforced RBAC</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username / Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input id="username" type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10 border-slate-200" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input id="password" type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 border-slate-200" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mfa">MFA Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input id="mfa" type="text" placeholder="Enter 6-digit code if enabled" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} maxLength={6} className="pl-10 border-slate-200" />
                </div>
              </div>
              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
              <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 shadow-md" disabled={loading}>{loading ? 'Authenticating...' : 'Login'}</Button>
            </form>
            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-sky-500" />JWT tokens are stored only for this browser session.</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-cyan-500" />Patient accounts register publicly, while staff accounts are provisioned privately by an administrator.</div>
            </div>
            <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50/80 p-4 text-sm text-slate-700">
              <p className="text-sm font-medium text-sky-900 mb-2">Production-style access flow</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Patients create their own account through the registration page.</li>
                <li>Doctors and nurses receive their account and MFA setup details from the admin workspace.</li>
                <li>All roles sign in here using the same login page.</li>
              </ul>
            </div>
            <div className="mt-6 flex items-center justify-between text-sm">
              <Link to="/register" className="text-sky-600 hover:text-sky-700 font-medium">Patient registration</Link>
              <Link to="/admin-login" className="text-slate-600 hover:text-slate-800 font-medium">Admin access</Link>
            </div>
            {location.state?.message && <Alert className="mt-4"><AlertDescription>{location.state.message}</AlertDescription></Alert>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
