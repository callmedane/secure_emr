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

export const mockPatients: Patient[] = [];

export const mockAuditLogs: AuditLog[] = [];

export interface SystemStats {
  totalPatients: number;
  activeRecords: number;
  recentUpdates: number;
  failedAccessAttempts: number;
}

export const getSystemStats = (): SystemStats => {
  return {
    totalPatients: 0,
    activeRecords: 0,
    recentUpdates: 0,
    failedAccessAttempts: 0,
  };
};

export interface ActivityData {
  date: string;
  logins: number;
  records: number;
}

export const activityData: ActivityData[] = [];