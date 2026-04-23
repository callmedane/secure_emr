import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../lib/api';
import type { Patient } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, Eye, Edit, Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { void api.getPatients().then((r) => setPatients((r.patients ?? []).filter(Boolean))); }, []);

  const canEdit = hasPermission(['Doctor', 'Admin']);
  const canAdd = hasPermission(['Doctor', 'Admin']);
  const departments = useMemo(() => Array.from(new Set(patients.map(p => p?.department).filter(Boolean) as string[])), [patients]);
  const filteredPatients = useMemo(() => patients.filter(patient => {
    if (!patient) return false;
    const matchesSearch = (patient.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) || String(patient.id ?? '').toLowerCase().includes(searchQuery.toLowerCase()) || (patient.diagnosis ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || (patient.department ?? '') === departmentFilter;
    const matchesStatus = statusFilter === 'all' || (patient.status ?? 'Active') === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  }), [patients, searchQuery, departmentFilter, statusFilter]);

  const getStatusColor = (status: string) => status === 'Active' ? 'bg-green-100 text-green-700' : status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';

  return <div className="space-y-6">
    <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold text-gray-900">Patient Records</h2><p className="text-gray-500 mt-1">Live patient records from the protected backend API</p></div>{canAdd && <Button className="bg-blue-600 hover:bg-blue-700" disabled><Plus className="w-4 h-4 mr-2" />Create endpoint-ready patient</Button>}</div>
    <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Access Level: <strong>{user?.role}</strong> • Data is enforced by the system's RBAC.</AlertDescription></Alert>
    <Card><CardHeader><CardTitle className="text-lg">Search & Filter</CardTitle><CardDescription>Find patients by name, ID, or diagnosis</CardDescription></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-4 gap-4"><div className="md:col-span-2 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search patients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div><Select value={departmentFilter} onValueChange={setDepartmentFilter}><SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger><SelectContent><SelectItem value="all">All Departments</SelectItem>{departments.map((department) => <SelectItem key={department} value={department}>{department}</SelectItem>)}</SelectContent></Select><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Critical">Critical</SelectItem><SelectItem value="Discharged">Discharged</SelectItem></SelectContent></Select></div></CardContent></Card>
    <Card><CardHeader><CardTitle>Patient List</CardTitle><CardDescription>Showing {filteredPatients.length} of {patients.length} patients</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Department</TableHead><TableHead>Diagnosis</TableHead><TableHead>Status</TableHead><TableHead>Assigned Doctor</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filteredPatients.map((patient) => <TableRow key={patient.id}><TableCell className="font-medium">{patient.id}</TableCell><TableCell>{patient.name ?? 'Unknown'}</TableCell><TableCell>{patient.department ?? 'Unassigned'}</TableCell><TableCell>{patient.diagnosis ?? 'Not specified'}</TableCell><TableCell><Badge className={getStatusColor(patient.status ?? 'Active')}>{patient.status ?? 'Active'}</Badge></TableCell><TableCell>{patient.assignedDoctor ?? 'Unassigned'}</TableCell><TableCell className="text-right"><div className="flex items-center justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => navigate(`/patients/${patient.id}`)}><Eye className="w-4 h-4" /></Button>{canEdit && <Button variant="ghost" size="sm" disabled><Edit className="w-4 h-4" /></Button>}</div></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
  </div>;
}
