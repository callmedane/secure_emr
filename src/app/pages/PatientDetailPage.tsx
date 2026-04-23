import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Shield,
  AlertCircle,
  Calendar,
  Activity,
  Pill,
  FileText,
  Edit,
  Download,
  Clock,
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  
  // Get patient from localStorage
  const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
  const patient = storedPatients.find((p: any) => p.id === id);

  const canEdit = hasPermission(['Doctor', 'Admin']);

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Patient Not Found</h3>
            <p className="text-gray-500 mb-4">
              The patient record you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/patients')}>
              Back to Patients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Critical':
        return 'bg-red-100 text-red-700';
      case 'Discharged':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/patients')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
            <p className="text-gray-500">Patient ID: {patient.id}</p>
          </div>
          <Badge className={getStatusColor(patient.status)}>
            {patient.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {canEdit && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Edit className="w-4 h-4 mr-2" />
              Edit Record
            </Button>
          )}
        </div>
      </div>

      {/* Access Control Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Access Level: {user?.role} Access</strong> • Last accessed by {patient.assignedDoctor} on {new Date(patient.lastUpdated).toLocaleString()}
        </AlertDescription>
      </Alert>

      {/* Patient Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{patient.name}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{patient.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{patient.gender}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-500">Blood Type</p>
              <p className="font-medium">{patient.bloodType}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium">{patient.department}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-500">Assigned Doctor</p>
              <p className="font-medium">{patient.assignedDoctor}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{patient.contactNumber}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-500 flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                Address
              </p>
              <p className="font-medium">{patient.address}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-500">Emergency Contact</p>
              <p className="font-medium">{patient.emergencyContact}</p>
            </div>
          </CardContent>
        </Card>

        {/* Medical Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Medical Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Primary Diagnosis</p>
              <p className="font-medium">{patient.diagnosis}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-500 mb-2">Allergies</p>
              {patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy, idx) => (
                    <Badge key={idx} variant="destructive">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">No known allergies</p>
              )}
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last Updated
              </p>
              <p className="font-medium">
                {new Date(patient.lastUpdated).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="prescriptions">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="prescriptions">
                <Pill className="w-4 h-4 mr-2" />
                Prescriptions
              </TabsTrigger>
              <TabsTrigger value="history">
                <FileText className="w-4 h-4 mr-2" />
                Medical History
              </TabsTrigger>
              <TabsTrigger value="notes">
                <Calendar className="w-4 h-4 mr-2" />
                Notes
              </TabsTrigger>
            </TabsList>

            {/* Prescriptions Tab */}
            <TabsContent value="prescriptions" className="space-y-4 mt-6">
              {patient.prescriptions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No active prescriptions</p>
              ) : (
                patient.prescriptions.map((prescription, idx) => (
                  <Card key={idx} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{prescription.medication}</h4>
                          <p className="text-sm text-gray-500">
                            Prescribed by {prescription.prescribedBy}
                          </p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Dosage</p>
                          <p className="font-medium">{prescription.dosage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Frequency</p>
                          <p className="font-medium">{prescription.frequency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Start Date</p>
                          <p className="font-medium">
                            {new Date(prescription.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">End Date</p>
                          <p className="font-medium">
                            {new Date(prescription.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Medical History Tab */}
            <TabsContent value="history" className="space-y-4 mt-6">
              {patient.medicalHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No medical history records</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  {patient.medicalHistory.map((entry, idx) => (
                    <div key={idx} className="relative pl-12 pb-8 last:pb-0">
                      <div className="absolute left-2.5 top-2 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-white" />
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline">{entry.type}</Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="font-medium mb-1">{entry.description}</p>
                          <p className="text-sm text-gray-500">By {entry.doctor}</p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-6">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No clinical notes available</p>
                {canEdit && (
                  <Button variant="outline">
                    Add Note
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
