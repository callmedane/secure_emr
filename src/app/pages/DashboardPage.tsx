import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { getSystemStats, activityData } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Activity,
  AlertTriangle,
  TrendingUp,
  Clock,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const stats = getSystemStats();
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Generate sample recent activity with current date/time
  const generateRecentLogs = () => {
    const now = new Date();
    const activities = [
      {
        id: 'L001',
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
        user: 'current.user',
        role: user?.role || 'User',
        action: 'Viewed System Dashboard',
        resource: 'Dashboard',
        status: 'Success' as const,
        ip: '192.168.1.100',
      },
      {
        id: 'L002',
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
        user: 'system',
        role: 'System',
        action: 'Backup Completed',
        resource: 'Database',
        status: 'Success' as const,
        ip: '127.0.0.1',
      },
      {
        id: 'L003',
        timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
        user: 'current.user',
        role: user?.role || 'User',
        action: 'Updated User Settings',
        resource: 'Settings',
        status: 'Success' as const,
        ip: '192.168.1.100',
      },
      {
        id: 'L004',
        timestamp: new Date(now.getTime() - 1 * 3600000).toISOString(),
        user: 'admin.user',
        role: 'Admin',
        action: 'System Configuration Changed',
        resource: 'Admin Panel',
        status: 'Success' as const,
        ip: '192.168.1.50',
      },
      {
        id: 'L005',
        timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
        user: 'current.user',
        role: user?.role || 'User',
        action: 'Logged In',
        resource: 'Authentication',
        status: 'Success' as const,
        ip: '192.168.1.100',
      },
    ];
    return activities;
  };

  // Update logs and time every second to keep timestamps fresh
  useEffect(() => {
    setRecentLogs(generateRecentLogs());
    setCurrentTime(new Date());

    const interval = setInterval(() => {
      setRecentLogs(generateRecentLogs());
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.role]);

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12% from last month',
    },
    {
      title: 'Active Records',
      value: stats.activeRecords,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: `${stats.activeRecords} currently active`,
    },
    {
      title: 'Recent Updates',
      value: stats.recentUpdates,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: 'Last 48 hours',
    },
    {
      title: 'Security Alerts',
      value: stats.failedAccessAttempts,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: 'Requires attention',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {user?.firstName}!
            </h2>
            <p className="text-sky-100">
              Your role: <span className="font-semibold">{user?.role}</span> • Last login: Today at 9:15 AM
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">System Status</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span className="text-sm">All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2.5 rounded-xl`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>Login and record access trends (Last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData} id="activity-chart">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  id="logins-line"
                  type="monotone"
                  dataKey="logins"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Logins"
                  dot={{ fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  id="records-line"
                  type="monotone"
                  dataKey="records"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Records Accessed"
                  dot={{ fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system access logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <div className={`mt-1 p-1.5 rounded-lg ${
                    log.status === 'Success' ? 'bg-green-100' :
                    log.status === 'Failed' ? 'bg-red-100' :
                    'bg-yellow-100'
                  }`}>
                    {log.status === 'Success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : log.status === 'Failed' ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {log.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {log.user} ({log.role}) • {log.resource}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={log.status === 'Success' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">Add New Patient</h3>
            <p className="text-sm text-gray-500 text-center mt-1">
              Create a new patient record
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-gray-200 hover:border-green-300 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="bg-green-50 p-3 rounded-lg mb-3">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">View Audit Logs</h3>
            <p className="text-sm text-gray-500 text-center mt-1">
              Review system activity
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="bg-purple-50 p-3 rounded-lg mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900">Generate Report</h3>
            <p className="text-sm text-gray-500 text-center mt-1">
              Export system analytics
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}