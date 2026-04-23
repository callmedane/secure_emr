import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Lock, Shield, Clock, Bell, User, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [mfaEnrolled, setMfaEnrolled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [mfaEnrollmentToken, setMfaEnrollmentToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  useEffect(() => {
    void api.getSettings().then((r) => {
      setMfaEnabled(r.settings.mfaEnabled);
      setMfaEnrolled(r.settings.mfaEnrolled);
      setEmailNotifications(r.settings.emailNotifications);
      setSessionTimeout(r.settings.sessionTimeout);
    });
  }, []);

  const handleSaveSettings = async () => {
    await api.updateSettings({ mfaEnabled, emailNotifications, sessionTimeout });
    setShowSuccess(true);
    toast.success('Settings saved successfully');
    window.setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    const result = await api.updatePassword({ currentPassword, newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success(result.message);
    await logout();
  };

  const handleBeginMfaEnrollment = async () => {
    const result = await api.beginMfaEnrollment();
    setMfaEnrollmentToken(result.mfaEnrollmentToken);
    setMfaCode('');
    toast.success(`${result.message} OTPAuth links are shown only in Admin Access.`);
  };

  const handleVerifyMfa = async () => {
    await api.verifyMfaSetup({ mfaEnrollmentToken, code: mfaCode });
    setMfaEnabled(true);
    setMfaEnrolled(true);
    setMfaEnrollmentToken('');
    setMfaCode('');
    toast.success('MFA enrollment verified');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 mt-1">Manage your account and backend-enforced security preferences</p>
      </div>

      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Your settings have been saved successfully!</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Profile Information</CardTitle>
          <CardDescription>Your server-backed account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>First Name</Label><Input value={user?.firstName ?? ''} disabled /></div>
            <div className="space-y-2"><Label>Last Name</Label><Input value={user?.lastName ?? ''} disabled /></div>
          </div>
          <div className="space-y-2"><Label>Email</Label><Input value={user?.email ?? ''} disabled /></div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex items-center gap-2">
              <Input value={user?.role ?? ''} disabled className="flex-1" />
              <Badge className={user?.role === 'Admin' ? 'bg-purple-100 text-purple-700' : user?.role === 'Doctor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                {user?.role ?? 'Unknown'}
              </Badge>
            </div>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Account identity comes from the backend, not editable in the browser.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" />Change Password</CardTitle>
          <CardDescription>Changing your password revokes the current token and requires a fresh login.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="current-password">Current Password</Label><Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" /></div>
          <div className="space-y-2"><Label htmlFor="new-password">New Password</Label><Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" /></div>
          <div className="space-y-2"><Label htmlFor="confirm-password">Confirm New Password</Label><Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" /></div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900 font-medium mb-1">Password Requirements</p>
            <ul className="text-xs text-blue-700 space-y-0.5 ml-4 list-disc">
              <li>At least 10 characters</li>
              <li>Must include uppercase, lowercase, number, and symbol</li>
            </ul>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => void handlePasswordChange()}>Update Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Security Settings</CardTitle>
          <CardDescription>Configure MFA and session controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Multi-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Required for all accounts and cannot be disabled from the UI</p>
            </div>
            <Switch checked={mfaEnabled} disabled />
          </div>
          <div className="rounded-lg border p-4 bg-slate-50">
            <p className="text-sm font-medium text-slate-900">Enrollment status: {mfaEnrolled ? 'Verified' : 'Not verified'}</p>
            <p className="text-sm text-slate-600 mt-1">OTPAuth links are available only in Admin Access. Generate a fresh MFA enrollment package here, then verify it with your current 6-digit authenticator code.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void handleBeginMfaEnrollment()}>Generate new MFA enrollment package</Button>
            </div>
          </div>
          {mfaEnrollmentToken && (
            <>
              <Separator />
              <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm text-green-800">A new enrollment package was generated. Enter the current 6-digit code from your authenticator app to verify MFA enrollment.</p>
                <Input value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} placeholder="Enter current 6-digit code" />
                <Button onClick={() => void handleVerifyMfa()}>Verify MFA enrollment</Button>
              </div>
            </>
          )}
          <Separator />
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Clock className="w-4 h-4" />Session Timeout</Label>
            <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive system notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive alerts and updates via email</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Security Alerts</Label>
              <p className="text-sm text-gray-500">Important access failures are always logged by the backend</p>
            </div>
            <Switch checked disabled />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => void handleSaveSettings()}><Save className="w-4 h-4 mr-2" />Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
