import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type { AuditLog } from '../lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, Download, Filter, AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => { void api.getAuditLogs().then((r) => setLogs(r.logs)); }, []);

  const filteredLogs = useMemo(() => logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) || log.action.toLowerCase().includes(searchQuery.toLowerCase()) || log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesRole = roleFilter === 'all' || log.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  }), [logs, searchQuery, statusFilter, roleFilter]);

  const suspiciousCount = logs.filter(log => log.status === 'Suspicious' || log.status === 'Failed').length;
  const getStatusIcon = (status: string) => status === 'Success' ? <CheckCircle className="w-4 h-4 text-green-600" /> : status === 'Failed' ? <XCircle className="w-4 h-4 text-red-600" /> : <AlertTriangle className="w-4 h-4 text-yellow-600" />;
  const getStatusColor = (status: string) => status === 'Success' ? 'bg-green-100 text-green-700' : status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';

  return <div className="space-y-6"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2><p className="text-gray-500 mt-1">Server-generated access and activity monitoring</p></div><Button variant="outline" disabled><Download className="w-4 h-4 mr-2" />Export Logs</Button></div>{suspiciousCount > 0 && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription><strong>Security Alert:</strong> {suspiciousCount} failed or suspicious activities detected.</AlertDescription></Alert>}<div className="grid grid-cols-1 md:grid-cols-4 gap-4"><Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Logs</p><p className="text-2xl font-bold">{logs.length}</p></div><div className="bg-blue-50 p-3 rounded-lg"><Shield className="w-5 h-5 text-blue-600" /></div></div></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Successful</p><p className="text-2xl font-bold text-green-600">{logs.filter(l => l.status === 'Success').length}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Failed</p><p className="text-2xl font-bold text-red-600">{logs.filter(l => l.status === 'Failed').length}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Suspicious</p><p className="text-2xl font-bold text-yellow-600">{logs.filter(l => l.status === 'Suspicious').length}</p></CardContent></Card></div><Card><CardHeader><CardTitle className="text-lg">Search & Filter</CardTitle><CardDescription>Find specific activities or users</CardDescription></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search user, action, or resource..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><div className="flex items-center gap-2"><Filter className="w-4 h-4" /><SelectValue placeholder="Status" /></div></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="Success">Success</SelectItem><SelectItem value="Failed">Failed</SelectItem><SelectItem value="Suspicious">Suspicious</SelectItem></SelectContent></Select><Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger><SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="Doctor">Doctor</SelectItem><SelectItem value="Nurse">Nurse</SelectItem><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Unknown">Unknown</SelectItem></SelectContent></Select></div></CardContent></Card><Card><CardHeader><CardTitle>Audit Trail</CardTitle><CardDescription>Immutable-style activity stream backed by the database</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Action</TableHead><TableHead>Resource</TableHead><TableHead>Status</TableHead><TableHead>IP</TableHead></TableRow></TableHeader><TableBody>{filteredLogs.map((log) => <TableRow key={log.id}><TableCell className="text-xs">{new Date(log.timestamp).toLocaleString()}</TableCell><TableCell>{log.user}</TableCell><TableCell>{log.role}</TableCell><TableCell>{log.action}</TableCell><TableCell>{log.resource}</TableCell><TableCell><Badge className={getStatusColor(log.status)}><span className="flex items-center gap-1">{getStatusIcon(log.status)}{log.status}</span></Badge></TableCell><TableCell className="text-xs">{log.ip}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></div>;
}
