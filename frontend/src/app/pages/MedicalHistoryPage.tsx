import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type { MedicalHistoryEntry } from '../lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, Filter, Calendar, FileText, Activity } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function MedicalHistoryPage() {
  const [entries, setEntries] = useState<MedicalHistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => { void api.getMedicalHistory().then((r) => setEntries(r.entries)); }, []);

  const filteredHistory = useMemo(() => entries.filter(entry => {
    const matchesSearch = (entry.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) || entry.description.toLowerCase().includes(searchQuery.toLowerCase()) || entry.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    return matchesSearch && matchesType;
  }), [entries, searchQuery, typeFilter]);

  const getTypeColor = (type: string) => type === 'Diagnosis' ? 'bg-blue-100 text-blue-700' : type === 'Test' ? 'bg-purple-100 text-purple-700' : type === 'Treatment' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  const getTypeIcon = (type: string) => type === 'Diagnosis' ? <Activity className="w-4 h-4" /> : type === 'Test' ? <FileText className="w-4 h-4" /> : <Calendar className="w-4 h-4" />;

  return <div className="space-y-6"><div><h2 className="text-2xl font-bold text-gray-900">Medical History</h2><p className="text-gray-500 mt-1">Chronological records sourced from backend patient history</p></div><div className="grid grid-cols-1 md:grid-cols-4 gap-4"><Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Total Records</p><p className="text-2xl font-bold">{entries.length}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Diagnoses</p><p className="text-2xl font-bold">{entries.filter(e => e.type === 'Diagnosis').length}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Tests</p><p className="text-2xl font-bold">{entries.filter(e => e.type === 'Test').length}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Treatments</p><p className="text-2xl font-bold">{entries.filter(e => e.type === 'Treatment').length}</p></CardContent></Card></div><Card><CardHeader><CardTitle className="text-lg">Search & Filter</CardTitle><CardDescription>Find specific medical history entries</CardDescription></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search by patient, description, or doctor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div><Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger><div className="flex items-center gap-2"><Filter className="w-4 h-4" /><SelectValue placeholder="Entry Type" /></div></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="Diagnosis">Diagnosis</SelectItem><SelectItem value="Surgery">Surgery</SelectItem><SelectItem value="Treatment">Treatment</SelectItem><SelectItem value="Test">Test</SelectItem></SelectContent></Select></div><p className="text-sm text-gray-600 mt-4">Showing {filteredHistory.length} of {entries.length} records</p></CardContent></Card><Card><CardHeader><CardTitle>Medical History Timeline</CardTitle><CardDescription>Chronological view of all medical events</CardDescription></CardHeader><CardContent>{filteredHistory.length === 0 ? <p className="text-center text-gray-500 py-8">No medical history records found</p> : <div className="space-y-4">{filteredHistory.map((entry, idx) => <Card key={`${entry.patientId}-${idx}`} className="border-l-4 border-l-blue-500"><CardContent className="pt-6"><div className="flex items-start justify-between mb-3"><div className="flex items-center gap-2"><Badge className={getTypeColor(entry.type)}><div className="flex items-center gap-1">{getTypeIcon(entry.type)}<span>{entry.type}</span></div></Badge><span className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</span></div><Button variant="ghost" size="sm" onClick={() => window.location.href = `/patients/${entry.patientId}`}>View Patient</Button></div><h4 className="font-semibold text-gray-900 mb-2">{entry.patientName}</h4><p className="text-gray-700 mb-3">{entry.description}</p><div className="flex items-center gap-4 text-sm text-gray-500"><span>Recorded by: {entry.doctor}</span><span>•</span><span>Patient ID: {entry.patientId}</span></div></CardContent></Card>)}</div>}</CardContent></Card></div>;
}
