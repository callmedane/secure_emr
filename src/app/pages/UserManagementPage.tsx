import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type { User } from '../lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Users, Plus, Search, Shield, Stethoscope, UserCog, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Label } from '../components/ui/label';

const initialForm = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  role: 'Doctor' as 'Doctor' | 'Nurse',
  password: '',
  confirmPassword: '',
};

type StaffCreationResult = {
  message: string;
  mfaSecret: string;
  mfaProvisioningUri: string;
  securityNotice: string;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<StaffCreationResult | null>(null);

  const loadUsers = async () => {
    const response = await api.getUsers();
    setUsers(response.users);
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filtered = useMemo(
    () => users.filter(user => [user.username, user.email, `${user.firstName} ${user.lastName}`, user.role].some(value => value.toLowerCase().includes(query.toLowerCase()))),
    [users, query]
  );

  const iconForRole = (role: string) => role === 'Admin' ? <UserCog className="w-4 h-4" /> : role === 'Doctor' ? <Stethoscope className="w-4 h-4" /> : <Shield className="w-4 h-4" />;
  const badgeForRole = (role: string) => role === 'Admin' ? 'bg-purple-100 text-purple-700' : role === 'Doctor' ? 'bg-blue-100 text-blue-700' : role === 'Nurse' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const response = await api.createStaff(form);
      setSuccess({
        message: response.message,
        mfaSecret: response.mfaSecret,
        mfaProvisioningUri: response.mfaProvisioningUri,
        securityNotice: response.securityNotice,
      });
      setForm(initialForm);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create staff account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500 mt-1">Private administrative provisioning for doctors and nurses</p>
        </div>
        <Badge className="bg-slate-900 text-white px-3 py-1.5">Admin-only control</Badge>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Public registration remains patient-only. Doctor and Nurse accounts are now created privately here with password registration and MFA enrollment.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">{success.message}</p>
              <p>{success.securityNotice}</p>
              <div>
                <span className="font-medium">MFA Secret:</span>{' '}
                <code className="rounded bg-slate-100 px-2 py-1">{success.mfaSecret}</code>
              </div>
              <div>
                <span className="font-medium">Provisioning URI:</span>
                <code className="mt-1 block break-all rounded bg-slate-100 px-2 py-2 text-xs">{success.mfaProvisioningUri}</code>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" />Create Staff Account</CardTitle>
            <CardDescription>Create a Doctor or Nurse account with a permanent password and MFA package, similar to patient registration but restricted to admins.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Professional email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input id="email" type="email" className="pl-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Staff role</Label>
                <select id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'Doctor' | 'Nurse' })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter staff password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Confirm staff password" required />
              </div>
              <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">
                Staff accounts are stored in the database immediately and can sign in through the normal login page after the MFA secret is enrolled in an authenticator app.
              </div>
              <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Creating account...' : 'Create Staff Account'}</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Users</p><p className="text-2xl font-bold">{users.length}</p></div><Users className="w-8 h-8 text-blue-600" /></div></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">MFA Enabled</p><p className="text-2xl font-bold">{users.filter(u => u.mfaEnabled).length}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Active Accounts</p><p className="text-2xl font-bold">{users.filter(u => u.isActive).length}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>Search the managed account list</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search users..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>MFA</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><Badge className={badgeForRole(user.role)}><span className="flex items-center gap-1">{iconForRole(user.role)}{user.role}</span></Badge></TableCell>
                      <TableCell><Badge variant={user.mfaEnabled ? 'default' : 'secondary'}>{user.mfaEnabled ? 'Enabled' : 'Disabled'}</Badge></TableCell>
                      <TableCell className="text-sm text-gray-500">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</TableCell>
                      <TableCell><Badge variant={user.isActive ? 'default' : 'destructive'}>{user.isActive ? 'Active' : 'Disabled'}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
