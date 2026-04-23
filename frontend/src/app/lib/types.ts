export type UserRole = 'Doctor' | 'Nurse' | 'Admin' | 'Patient';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  mfaEnabled?: boolean;
  sessionTimeout?: number;
  emailNotifications?: boolean;
  lastLogin?: string | null;
  isActive?: boolean;
}

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  prescribedBy: string;
}

export interface MedicalHistoryEntry {
  date: string;
  type: 'Diagnosis' | 'Surgery' | 'Treatment' | 'Test';
  description: string;
  doctor: string;
  patientId?: string;
  patientName?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  diagnosis: string;
  department: string;
  assignedDoctor: string;
  lastUpdated: string;
  status: 'Active' | 'Discharged' | 'Critical';
  bloodType: string;
  allergies: string[];
  prescriptions: Prescription[];
  medicalHistory: MedicalHistoryEntry[];
  contactNumber: string;
  address: string;
  emergencyContact: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  status: 'Success' | 'Failed' | 'Suspicious';
  ip: string;
  details?: string;
}
