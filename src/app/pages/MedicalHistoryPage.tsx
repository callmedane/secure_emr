import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, Filter, Calendar, FileText, Activity } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export default function MedicalHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Get patients from localStorage and flatten medical history
  const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
  const allHistoryEntries = storedPatients.flatMap((patient: any) =>
    patient.medicalHistory.map((entry: any) => ({
      ...entry,
      patientId: patient.id,
      patientName: patient.name,
    }))
  ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredHistory = allHistoryEntries.filter(entry => {
    const matchesSearch =
      entry.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || entry.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Diagnosis':
        return 'bg-blue-100 text-blue-700';
      case 'Surgery':
        return 'bg-red-100 text-red-700';
      case 'Treatment':
        return 'bg-green-100 text-green-700';
      case 'Test':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Diagnosis':
        return <Activity className="w-4 h-4" />;
      case 'Test':
        return <FileText className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Medical History</h2>
        <p className="text-gray-500 mt-1">
          Comprehensive medical history records across all patients
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-2xl font-bold">{allHistoryEntries.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Diagnoses</p>
                <p className="text-2xl font-bold">
                  {allHistoryEntries.filter(e => e.type === 'Diagnosis').length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tests</p>
                <p className="text-2xl font-bold">
                  {allHistoryEntries.filter(e => e.type === 'Test').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Treatments</p>
                <p className="text-2xl font-bold">
                  {allHistoryEntries.filter(e => e.type === 'Treatment').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
          <CardDescription>Find specific medical history entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by patient, description, or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Entry Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Diagnosis">Diagnosis</SelectItem>
                <SelectItem value="Surgery">Surgery</SelectItem>
                <SelectItem value="Treatment">Treatment</SelectItem>
                <SelectItem value="Test">Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            Showing {filteredHistory.length} of {allHistoryEntries.length} records
          </p>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Medical History Timeline</CardTitle>
          <CardDescription>Chronological view of all medical events</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredHistory.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No medical history records found
            </p>
          ) : (
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-6">
                {filteredHistory.map((entry, idx) => (
                  <div key={idx} className="relative pl-20 pb-6 last:pb-0">
                    <div className="absolute left-6 top-2 w-5 h-5 bg-blue-500 rounded-full ring-4 ring-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeColor(entry.type)}>
                              <div className="flex items-center gap-1">
                                {getTypeIcon(entry.type)}
                                <span>{entry.type}</span>
                              </div>
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(entry.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = `/patients/${entry.patientId}`}
                          >
                            View Patient
                          </Button>
                        </div>

                        <h4 className="font-semibold text-gray-900 mb-2">
                          {entry.patientName}
                        </h4>

                        <p className="text-gray-700 mb-3">
                          {entry.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Recorded by: {entry.doctor}</span>
                          <span>•</span>
                          <span>Patient ID: {entry.patientId}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
