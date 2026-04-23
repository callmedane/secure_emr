import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { AuditLog } from '../lib/types';
import { Users, FileText, Activity, AlertTriangle, TrendingUp, Clock, Shield, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalPatients: 0, activeRecords: 0, recentUpdates: 0, failedAccessAttempts: 0 });
  const [activityData, setActivityData] = useState<{ date: string; logins: number; records: number }[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const load = async () => {
      const [dashboard, logs] = await Promise.all([api.getDashboard(), api.getAuditLogs(5)]);
      setStats(dashboard.stats);
      setActivityData(dashboard.activityData);
      setRecentLogs((logs.logs ?? []).filter((log): log is AuditLog => Boolean(log)));
    };
    void load();
  }, []);

  const statCards = user?.role === 'Patient' ? [
    { title: 'My Account', value: 1, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50', change: 'Secure patient portal access' },
    { title: 'MFA Status', value: user?.mfaEnabled ? 1 : 0, icon: Shield, color: 'text-green-600', bgColor: 'bg-green-50', change: user?.mfaEnabled ? 'Enabled' : 'Disabled' },
    { title: 'Recent Updates', value: stats.recentUpdates, icon: Activity, color: 'text-purple-600', bgColor: 'bg-purple-50', change: 'Profile/account activity' },
    { title: 'Security Alerts', value: stats.failedAccessAttempts, icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50', change: 'Failed attempts on your account' },
  ] : [
    { title: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50', change: 'Tracked in secure DB' },
    { title: 'Active Records', value: stats.activeRecords, icon: FileText, color: 'text-green-600', bgColor: 'bg-green-50', change: 'Server-enforced access' },
    { title: 'Recent Updates', value: stats.recentUpdates, icon: Activity, color: 'text-purple-600', bgColor: 'bg-purple-50', change: 'Last 48 hours' },
    { title: 'Security Alerts', value: stats.failedAccessAttempts, icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50', change: 'Requires attention' },
  ];

  return <div className="space-y-6">
    <div className="bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName}!</h2><p className="text-sky-100">Your role: <span className="font-semibold">{user?.role}</span> • Access validated by the backend</p></div><div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20"><div className="flex items-center gap-2 mb-1"><Shield className="w-5 h-5" /><span className="font-semibold">System Status</span></div><div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-300" /><span className="text-sm">Auth, audit, and API services operational</span></div></div></div></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{statCards.map((stat) => { const Icon = stat.icon; return <Card key={stat.title} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle><div className={`${stat.bgColor} p-2.5 rounded-xl`}><Icon className={`w-5 h-5 ${stat.color}`} /></div></CardHeader><CardContent><div className="text-3xl font-bold text-slate-900">{stat.value}</div><p className="text-xs text-slate-500 mt-1">{stat.change}</p></CardContent></Card>; })}</div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Card><CardHeader><CardTitle>System Activity</CardTitle><CardDescription>Login and record access trends from server audit logs</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><LineChart data={activityData}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="date" stroke="#888" fontSize={12} /><YAxis stroke="#888" fontSize={12} /><Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} /><Legend /><Line type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={2} name="Logins" dot={{ fill: '#3b82f6' }} activeDot={{ r: 6 }} /><Line type="monotone" dataKey="records" stroke="#10b981" strokeWidth={2} name="Records Accessed" dot={{ fill: '#10b981' }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></CardContent></Card>
    <Card><CardHeader><CardTitle>Recent Activity</CardTitle><CardDescription>Latest backend audit entries</CardDescription></CardHeader><CardContent><div className="space-y-4">{recentLogs.length === 0 ? <p className="text-sm text-slate-500">No recent activity found.</p> : recentLogs.filter((log): log is AuditLog => Boolean(log)).map((log) => <div key={log.id} className="flex items-start gap-3 pb-4 border-b last:border-0"><div className={`mt-1 p-1.5 rounded-lg ${(log?.status ?? 'Suspicious') === 'Success' ? 'bg-green-100' : (log?.status ?? 'Suspicious') === 'Failed' ? 'bg-red-100' : 'bg-yellow-100'}`}>{(log?.status ?? 'Suspicious') === 'Success' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertTriangle className={`w-4 h-4 ${(log?.status ?? 'Suspicious') === 'Failed' ? 'text-red-600' : 'text-yellow-600'}`} />}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900">{log?.action ?? 'Unknown action'}</p><p className="text-xs text-gray-500 mt-0.5">{log?.user ?? 'Unknown'} ({log?.role ?? 'Unknown'}) • {log?.resource ?? 'Unknown resource'}</p><div className="flex items-center gap-2 mt-1"><Clock className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-400">{new Date(log?.timestamp ?? Date.now()).toLocaleString()}</span></div></div><Badge variant={(log?.status ?? 'Suspicious') === 'Success' ? 'default' : 'destructive'} className="text-xs">{log?.status ?? 'Suspicious'}</Badge></div>)}</div></CardContent></Card></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><Card className="border-2 border-dashed border-gray-200"><CardContent className="flex flex-col items-center justify-center py-8"><div className="bg-blue-50 p-3 rounded-lg mb-3"><FileText className="w-6 h-6 text-blue-600" /></div><h3 className="font-medium text-gray-900">Real backend data</h3><p className="text-sm text-gray-500 text-center mt-1">Patient records now come from the Flask API and database.</p></CardContent></Card><Card className="border-2 border-dashed border-gray-200"><CardContent className="flex flex-col items-center justify-center py-8"><div className="bg-green-50 p-3 rounded-lg mb-3"><Activity className="w-6 h-6 text-green-600" /></div><h3 className="font-medium text-gray-900">Auditable access</h3><p className="text-sm text-gray-500 text-center mt-1">Every login and record view is written to the audit trail.</p></CardContent></Card><Card className="border-2 border-dashed border-gray-200"><CardContent className="flex flex-col items-center justify-center py-8"><div className="bg-purple-50 p-3 rounded-lg mb-3"><TrendingUp className="w-6 h-6 text-purple-600" /></div><h3 className="font-medium text-gray-900">Deployable structure</h3><p className="text-sm text-gray-500 text-center mt-1">Frontend and backend are separated for real deployment.</p></CardContent></Card></div>
  </div>;
}
