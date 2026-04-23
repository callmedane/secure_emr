import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ShieldCheck, Lock, User, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function AdminLoginPage() {
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
      await login(username.trim(), password, mfaCode || undefined);
      navigate('/settings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-sky-950 to-cyan-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-3xl mb-4 shadow-lg border border-white/10">
            <ShieldCheck className="w-10 h-10 text-cyan-300" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Admin Login</h1>
          <p className="text-slate-300">Restricted portal for private administrator access</p>
        </div>

        <Card className="shadow-2xl border-white/10 bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle>Administrator Access</CardTitle>
            <CardDescription>
              Sign in with your administrator credentials and MFA code.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
              <input
                type="text"
                name="fake-username"
                autoComplete="username"
                className="hidden"
                tabIndex={-1}
              />
              <input
                type="password"
                name="fake-password"
                autoComplete="new-password"
                className="hidden"
                tabIndex={-1}
              />

              <div className="space-y-2">
                <Label htmlFor="admin-username">Admin Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="admin-username"
                    name="admin_username"
                    type="text"
                    autoComplete="off"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 border-slate-200"
                    placeholder="Enter admin username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Admin Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="admin-password"
                    name="admin_password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-slate-200"
                    placeholder="Enter admin password"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-mfa">MFA Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="admin-mfa"
                    name="admin_mfa"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter 6-digit code"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="pl-10 border-slate-200"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-slate-900 to-cyan-700 hover:from-slate-800 hover:to-cyan-600"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Login as Admin'}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4" />
                Back to patient/staff login
              </Link>
              <Link to="/admin-register" className="text-sky-700 font-medium">
                Admin registration
              </Link>
            </div>
            {location.state?.message && (
              <Alert className="mt-4"><AlertDescription>{location.state.message}</AlertDescription></Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}