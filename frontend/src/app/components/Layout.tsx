import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LayoutDashboard, FileText, History, Users, Activity, Settings, LogOut, Bell, Shield, Stethoscope, UserCog, Info } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Doctor', 'Nurse', 'Admin', 'Patient'] },
  { path: '/patients', label: 'Patient Records', icon: FileText, roles: ['Doctor', 'Nurse', 'Admin'] },
  { path: '/medical-history', label: 'Medical History', icon: History, roles: ['Doctor', 'Nurse', 'Admin'] },
  { path: '/user-management', label: 'User Management', icon: Users, roles: ['Admin'] },
  { path: '/audit-logs', label: 'Audit Logs', icon: Activity, roles: ['Admin', 'Doctor'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['Doctor', 'Nurse', 'Admin', 'Patient'] },
  { path: '/about', label: 'About Us', icon: Info, roles: ['Doctor', 'Nurse', 'Admin', 'Patient'] },
];

export default function Layout() {
  const { user, logout, hasPermission, authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (authLoading) return <div className="min-h-screen grid place-items-center text-slate-600">Loading secure session...</div>;
  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRoleIcon = (role: string) => role === 'Doctor' ? <Stethoscope className="w-4 h-4" /> : role === 'Admin' ? <UserCog className="w-4 h-4" /> : <Shield className="w-4 h-4" />;
  const getRoleBadgeColor = (role: string) => role === 'Doctor' ? 'bg-blue-100 text-blue-700' : role === 'Nurse' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700';

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md"><Shield className="w-6 h-6 text-white" /></div>
            <div><h2 className="font-bold text-slate-900">EMR System</h2><p className="text-xs text-slate-500">Secure Portal</p></div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const canAccess = hasPermission(item.roles as never);
            if (!canAccess) return null;
            return <button key={item.path} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isActive ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md shadow-sky-200' : 'text-slate-700 hover:bg-slate-100'}`}><Icon className="w-5 h-5" /><span className="flex-1">{item.label}</span></button>;
          })}
        </nav>
        <div className="p-4 border-t border-slate-200"><div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3"><div className="flex items-center gap-2 text-emerald-700"><Shield className="w-4 h-4" /><span className="text-sm font-medium">Access Verified</span></div><p className="text-xs text-emerald-600 mt-1">JWT + MFA + RBAC active</p></div></div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div><h1 className="text-xl font-bold text-slate-900">{navigationItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}</h1><p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /><span className="text-sm font-medium text-emerald-700">Secure</span></div>
              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"><Bell className="w-5 h-5 text-slate-600" /></button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><button className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors"><Avatar className="w-8 h-8"><AvatarFallback className="bg-gradient-to-br from-sky-500 to-cyan-600 text-white">{user.firstName[0]}{user.lastName[0]}</AvatarFallback></Avatar><div className="text-left"><p className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</p><div className="flex items-center gap-1">{getRoleIcon(user.role)}<span className="text-xs text-slate-500">{user.role}</span></div></div></button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56"><DropdownMenuLabel><div className="flex flex-col space-y-1"><p className="text-sm font-medium">{user.firstName} {user.lastName}</p><p className="text-xs text-slate-500">{user.email}</p><Badge className={`w-fit mt-1 ${getRoleBadgeColor(user.role)}`}>{user.role}</Badge></div></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onClick={() => navigate('/settings')}><Settings className="w-4 h-4 mr-2" />Settings</DropdownMenuItem><DropdownMenuItem onClick={() => void handleLogout()}><LogOut className="w-4 h-4 mr-2" />Logout</DropdownMenuItem></DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6"><Outlet /></main>
      </div>
    </div>
  );
}
