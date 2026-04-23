import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ShieldCheck, AlertCircle, KeyRound, UserPlus } from 'lucide-react';
import { api } from '../lib/api';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '' });
  const [registered, setRegistered] = useState(false);
  const [mfaEnrollmentToken, setMfaEnrollmentToken] = useState('');
  const [mfaProvisioningUri, setMfaProvisioningUri] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await api.registerAdmin(form);
      setRegistered(true);
      setMfaEnrollmentToken(result.mfaEnrollmentToken);
      setMfaProvisioningUri(result.mfaProvisioningUri);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.verifyMfaSetup({ mfaEnrollmentToken, code: mfaCode });
      navigate('/admin-login', { state: { message: 'Administrator registration complete. You can now sign in.' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MFA verification failed');
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
          <h1 className="text-4xl font-bold mb-2">Admin Registration</h1>
          <p className="text-slate-300">Create an administrator account with mandatory MFA enrollment.</p>
        </div>
        <Card className="shadow-2xl border-white/10 bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle>{registered ? 'Complete MFA setup' : 'Administrator onboarding'}</CardTitle>
            <CardDescription>{registered ? 'Finish the authenticator enrollment before first login.' : 'Create an administrator account, then verify MFA.'}</CardDescription>
          </CardHeader>
          <CardContent>
            {!registered ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>First Name</Label><Input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Last Name</Label><Input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required /></div>
                </div>
                <div className="space-y-2"><Label>Username</Label><Input value={form.username} onChange={(e) => update('username', e.target.value)} required /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required /></div>
                <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required /></div>
                <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required /></div>
                {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                {message && <Alert><AlertDescription>{message}</AlertDescription></Alert>}
                <Button type="submit" className="w-full bg-gradient-to-r from-slate-900 to-cyan-700 hover:from-slate-800 hover:to-cyan-600" disabled={loading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading ? 'Creating admin...' : 'Create Admin & Setup MFA'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-4">
                <Alert><AlertDescription>Open this one-time provisioning URI in your authenticator app, then enter the current 6-digit code.</AlertDescription></Alert>
                <div className="space-y-2"><Label>Provisioning URI</Label><Input value={mfaProvisioningUri} readOnly /></div><p className="text-xs text-slate-600">Need a QR code? Use <a href="https://www.qrcode-monkey.com/" target="_blank" rel="noreferrer" className="font-medium text-sky-700 underline">https://www.qrcode-monkey.com/</a> as a QR generator that can be scanned using Google Authenticator or Microsoft Authenticator for the MFA 6-digit code.</p>
                <div className="space-y-2"><Label>Authenticator Code</Label><div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input className="pl-10" value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} required /></div></div>
                {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                <Button type="submit" className="w-full bg-gradient-to-r from-slate-900 to-cyan-700 hover:from-slate-800 hover:to-cyan-600" disabled={loading}>{loading ? 'Verifying...' : 'Verify MFA & Continue'}</Button>
              </form>
            )}
            <div className="mt-6 flex items-center justify-between text-sm">
              <Link to="/admin-login" className="text-slate-700 font-medium">Admin login</Link>
              <Link to="/" className="text-slate-600 font-medium">Patient/staff login</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
