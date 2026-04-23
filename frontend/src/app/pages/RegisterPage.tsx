import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Shield, AlertCircle, UserPlus, KeyRound } from 'lucide-react';
import { api } from '../lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', email: '', role: 'Patient', password: '', confirmPassword: '' });
  const [mfaEnrollmentToken, setMfaEnrollmentToken] = useState('');
  const [mfaUri, setMfaUri] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const result = await api.register(form);
      setRegistered(true);
      setMfaEnrollmentToken(result.mfaEnrollmentToken);
      setMfaUri(result.mfaProvisioningUri);
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerifying(true);
    try {
      await api.verifyMfaSetup({ mfaEnrollmentToken, code: mfaCode });
      navigate('/', { state: { registered: true, username: form.username, message: 'Registration complete. You can now log in with your password and MFA code.' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MFA verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-3xl mb-4 shadow-lg shadow-sky-200">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent mb-2">Create Account</h1>
          <p className="text-slate-600">Patient self-service registration with required MFA</p>
        </div>
        <Card className="shadow-xl shadow-sky-100 border-sky-100">
          <CardHeader>
            <CardTitle>{registered ? 'Complete MFA setup' : 'Create Patient Account'}</CardTitle>
            <CardDescription>{registered ? 'Scan or copy the one-time MFA enrollment link, then verify one current code.' : 'This page is for patient registration only.'}</CardDescription>
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
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(value) => update('role', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Patient">Patient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required /></div>
                <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required /></div>
                {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}
                <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 shadow-md" disabled={loading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading ? 'Creating account...' : 'Register & Setup MFA'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Open this one-time provisioning URI in your authenticator app, then enter the current 6-digit code.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2"><Label>Provisioning URI</Label><Input value={mfaUri} readOnly /></div><p className="text-xs text-slate-600">Need a QR code? Use <a href="https://www.qrcode-monkey.com/" target="_blank" rel="noreferrer" className="font-medium text-sky-700 underline">https://www.qrcode-monkey.com/</a> as a QR generator that can be scanned using Google Authenticator or Microsoft Authenticator for the MFA 6-digit code.</p>
                <div className="space-y-2"><Label>Authenticator Code</Label><div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input className="pl-10" value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} required /></div></div>
                {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 shadow-md" disabled={verifying}>
                  {verifying ? 'Verifying...' : 'Verify MFA & Continue to Login'}
                </Button>
              </form>
            )}
            <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
              <Link to="/" className="text-sky-700 font-medium">Login here</Link>
              <Link to="/admin-register" className="text-slate-700 font-medium">Admin registration</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
