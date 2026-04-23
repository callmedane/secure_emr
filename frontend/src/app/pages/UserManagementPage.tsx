import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Edit,
  Mail,
  Plus,
  Search,
  Shield,
  Stethoscope,
  Trash2,
  UserCog,
  Users,
  X,
} from 'lucide-react';

import { api } from '../lib/api';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

type Role = 'Admin' | 'Doctor' | 'Nurse' | 'Patient';

type ManagedUser = {
  id: number | string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: Role;
  mfaEnabled: boolean;
  isActive: boolean;
  lastLogin?: string | null;
  mfaProvisioningUri?: string | null;
};

type CreateStaffForm = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'Doctor' | 'Nurse';
  password: string;
  confirmPassword: string;
};

type EditUserForm = {
  id: number | string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
  mfaProvisioningUri?: string | null;
};

type SuccessState = {
  message: string;
  mfaSecret?: string;
  mfaProvisioningUri?: string;
  securityNotice?: string;
} | null;

const initialForm: CreateStaffForm = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  role: 'Doctor',
  password: '',
  confirmPassword: '',
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<CreateStaffForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<SuccessState>(null);

  const [editingUser, setEditingUser] = useState<EditUserForm | null>(null);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | string | null>(null);
  const [copiedUserId, setCopiedUserId] = useState<number | string | null>(null);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.getUsers();
      setUsers(response.users ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) =>
      [user.username, user.email, `${user.firstName} ${user.lastName}`, user.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [users, query]);

  const iconForRole = (role: string) =>
    role === 'Admin' ? (
      <UserCog className="w-4 h-4" />
    ) : role === 'Doctor' ? (
      <Stethoscope className="w-4 h-4" />
    ) : (
      <Shield className="w-4 h-4" />
    );

  const badgeForRole = (role: string) =>
    role === 'Admin'
      ? 'bg-purple-100 text-purple-700'
      : role === 'Doctor'
      ? 'bg-blue-100 text-blue-700'
      : role === 'Nurse'
      ? 'bg-green-100 text-green-700'
      : 'bg-slate-100 text-slate-700';

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

  const openEdit = (user: ManagedUser) => {
    setEditingUser({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      mfaProvisioningUri: user.mfaProvisioningUri ?? null,
    });
    setError('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdatingUser(true);
    setError('');
    try {
      await api.updateUser(editingUser.id, {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        username: editingUser.username,
        email: editingUser.email,
        role: editingUser.role,
        isActive: editingUser.isActive,
      });
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleDelete = async (user: ManagedUser) => {
    const confirmed = window.confirm(
      `Delete ${user.firstName} ${user.lastName} (${user.username})? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingUserId(user.id);
    setError('');
    try {
      await api.deleteUser(user.id);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const copyOtpAuth = async (user: ManagedUser) => {
    const uri = user.mfaProvisioningUri;
    if (!uri) {
      setError('This user does not have an OTP provisioning URI available.');
      return;
    }

    try {
      await navigator.clipboard.writeText(uri);
      setCopiedUserId(user.id);
      window.setTimeout(() => setCopiedUserId(null), 1500);
    } catch {
      setError('Failed to copy OTPAuth link');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="mt-1 text-gray-500">Private administrative provisioning for doctors and nurses</p>
        </div>
        <Badge className="bg-slate-900 px-3 py-1.5 text-white">Admin-only control</Badge>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Public registration remains patient-only. Doctor and Nurse accounts are created privately here with password registration and MFA enrollment.
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
              {success.securityNotice && <p>{success.securityNotice}</p>}
              {success.mfaSecret && (
                <div>
                  <span className="font-medium">MFA Secret:</span>{' '}
                  <code className="rounded bg-slate-100 px-2 py-1">{success.mfaSecret}</code>
                </div>
              )}
              {success.mfaProvisioningUri && (
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Provisioning URI:</span>
                    <code className="mt-1 block break-all rounded bg-slate-100 px-2 py-2 text-xs">
                      {success.mfaProvisioningUri}
                    </code>
                  </div>
                  <p className="text-xs text-slate-600">Need a QR code? Use <a href="https://www.qrcode-monkey.com/" target="_blank" rel="noreferrer" className="font-medium text-sky-700 underline">https://www.qrcode-monkey.com/</a> as a QR generator that can be scanned using Google Authenticator or Microsoft Authenticator for the MFA 6-digit code.</p>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1.6fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Staff Account
            </CardTitle>
            <CardDescription>Create a Doctor or Nurse account. OTPAuth links are shown only inside this admin area.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Professional email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Staff role</Label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as 'Doctor' | 'Nurse' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter staff password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Confirm staff password"
                  required
                />
              </div>

              <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">
                Staff accounts are stored in the database immediately and can sign in through the normal login page after the MFA secret is enrolled in an authenticator app.
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Creating account...' : 'Create Staff Account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">MFA Enabled</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.mfaEnabled).length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Active Accounts</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.isActive).length}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>Search, edit, delete, and manage OTP provisioning links</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>MFA</TableHead>
                      <TableHead>OTPAuth Link</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filtered.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={badgeForRole(user.role)}>
                            <span className="flex items-center gap-1">
                              {iconForRole(user.role)}
                              {user.role}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.mfaEnabled ? 'default' : 'secondary'}>
                            {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.mfaProvisioningUri ? (
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(user.mfaProvisioningUri!, '_blank')}
                              >
                                Open
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => copyOtpAuth(user)}
                                title="Copy OTPAuth link"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              {copiedUserId === user.id && (
                                <span className="text-xs text-green-600">Copied</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">Unavailable</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'destructive'}>
                            {user.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => openEdit(user)}>
                              <Edit className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(user)}
                              disabled={deletingUserId === user.id}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!filtered.length && (
                      <TableRow>
                        <TableCell colSpan={9} className="py-8 text-center text-sm text-slate-500">
                          {loadingUsers ? 'Loading users...' : 'No users found.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <Card className="w-full max-w-2xl shadow-2xl">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Edit User</CardTitle>
                <CardDescription>Update account details and account status.</CardDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setEditingUser(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-firstName">First name</Label>
                    <Input
                      id="edit-firstName"
                      value={editingUser.firstName}
                      onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lastName">Last name</Label>
                    <Input
                      id="edit-lastName"
                      value={editingUser.lastName}
                      onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-username">Username</Label>
                    <Input
                      id="edit-username"
                      value={editingUser.username}
                      onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Role</Label>
                    <select
                      id="edit-role"
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as Role })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="Patient">Patient</option>
                      <option value="Nurse">Nurse</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <select
                      id="edit-status"
                      value={editingUser.isActive ? 'active' : 'disabled'}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, isActive: e.target.value === 'active' })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>OTPAuth provisioning URI</Label>
                  <div className="rounded-lg border bg-slate-50 p-3 text-xs break-all text-slate-700">
                    {editingUser.mfaProvisioningUri || 'Unavailable'}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updatingUser}>
                    {updatingUser ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}