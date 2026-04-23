import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Lock,
  Shield,
  Clock,
  Bell,
  User,
  Save,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, hasPermission } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [showSuccess, setShowSuccess] = useState(false);

  const isAdmin = hasPermission(['Admin']);

  const handleSaveSettings = () => {
    setShowSuccess(true);
    toast.success('Settings saved successfully');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 mt-1">
          Manage your account and security preferences
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your settings have been saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your account details and role information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={user?.firstName} disabled />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={user?.lastName} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email} disabled />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex items-center gap-2">
              <Input value={user?.role} disabled className="flex-1" />
              <Badge className={
                user?.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                user?.role === 'Doctor' ? 'bg-blue-100 text-blue-700' :
                'bg-green-100 text-green-700'
              }>
                {user?.role}
              </Badge>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Contact your system administrator to update profile information
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password regularly for better security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" placeholder="Enter current password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" placeholder="Enter new password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" placeholder="Confirm new password" />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900 font-medium mb-1">Password Requirements:</p>
            <ul className="text-xs text-blue-700 space-y-0.5 ml-4 list-disc">
              <li>At least 8 characters long</li>
              <li>Contains uppercase and lowercase letters</li>
              <li>Includes at least one number</li>
              <li>Contains at least one special character</li>
            </ul>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700">
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Configure multi-factor authentication and access controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* MFA */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Multi-Factor Authentication</Label>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
          </div>

          <Separator />

          {/* Session Timeout */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Session Timeout
            </Label>
            <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Automatically log out after period of inactivity
            </p>
          </div>

          {mfaEnabled && (
            <>
              <Separator />
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">MFA is enabled</span>
                </div>
                <p className="text-sm text-green-600 mb-3">
                  Your account is protected with multi-factor authentication
                </p>
                <Button variant="outline" size="sm">
                  Configure MFA Device
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage how you receive system notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive alerts and updates via email
              </p>
            </div>
            <Switch 
              checked={emailNotifications} 
              onCheckedChange={setEmailNotifications} 
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Security Alerts</Label>
              <p className="text-sm text-gray-500">
                Get notified about suspicious activities
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Patient Updates</Label>
              <p className="text-sm text-gray-500">
                Notifications for patient record changes
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Admin-only Role Permissions */}
      {isAdmin && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Shield className="w-5 h-5" />
              Role Permissions (Admin Only)
            </CardTitle>
            <CardDescription>
              Manage system-wide access controls and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                These settings affect all users in the system. Changes require administrator approval.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Doctor - Full Patient Access</span>
                <Badge className="bg-blue-100 text-blue-700">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Nurse - Read-Only Access</span>
                <Badge className="bg-green-100 text-green-700">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Admin - Full System Control</span>
                <Badge className="bg-purple-100 text-purple-700">Enabled</Badge>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Manage Advanced Permissions
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleSaveSettings}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
