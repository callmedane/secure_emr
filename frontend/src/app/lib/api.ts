import type { AuditLog, MedicalHistoryEntry, Patient, User } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'secure_emr_access_token';

function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeAuditLog(log: unknown): AuditLog | null {
  if (!log || typeof log !== 'object') return null;
  const item = log as Record<string, unknown>;
  return {
    id: String(item.id ?? crypto.randomUUID()),
    timestamp: safeString(item.timestamp, new Date().toISOString()),
    user: safeString(item.user, 'Unknown'),
    role: safeString(item.role, 'Unknown'),
    action: safeString(item.action, 'Unknown action'),
    resource: safeString(item.resource, 'Unknown resource'),
    status: ['Success', 'Failed', 'Suspicious'].includes(String(item.status)) ? (String(item.status) as AuditLog['status']) : 'Suspicious',
    ip: safeString(item.ip, 'Unknown'),
    details: typeof item.details === 'string' ? item.details : undefined,
  };
}

function normalizePatient(patient: unknown): Patient | null {
  if (!patient || typeof patient !== 'object') return null;
  const item = patient as Record<string, unknown>;
  return {
    id: String(item.id ?? ''),
    name: safeString(item.name, 'Unknown patient'),
    age: typeof item.age === 'number' ? item.age : Number(item.age ?? 0),
    gender: ['Male', 'Female', 'Other'].includes(String(item.gender)) ? (String(item.gender) as Patient['gender']) : 'Other',
    diagnosis: safeString(item.diagnosis, 'Not specified'),
    department: safeString(item.department, 'Unassigned'),
    assignedDoctor: safeString(item.assignedDoctor, 'Unassigned'),
    lastUpdated: safeString(item.lastUpdated, new Date().toISOString()),
    status: ['Active', 'Discharged', 'Critical'].includes(String(item.status)) ? (String(item.status) as Patient['status']) : 'Active',
    bloodType: safeString(item.bloodType, 'Unknown'),
    allergies: Array.isArray(item.allergies) ? item.allergies.filter((v): v is string => typeof v === 'string') : [],
    prescriptions: Array.isArray(item.prescriptions) ? item.prescriptions as Patient['prescriptions'] : [],
    medicalHistory: Array.isArray(item.medicalHistory) ? item.medicalHistory as Patient['medicalHistory'] : [],
    contactNumber: safeString(item.contactNumber, 'Not provided'),
    address: safeString(item.address, 'Not provided'),
    emergencyContact: safeString(item.emergencyContact, 'Not provided'),
  };
}

function normalizeUser(user: unknown): User | null {
  if (!user || typeof user !== 'object') return null;
  const item = user as Record<string, unknown>;
  return {
    id: String(item.id ?? ''),
    username: safeString(item.username, 'unknown'),
    email: safeString(item.email, ''),
    role: ['Doctor', 'Nurse', 'Admin', 'Patient'].includes(String(item.role)) ? (String(item.role) as User['role']) : 'Patient',
    firstName: safeString(item.firstName, ''),
    lastName: safeString(item.lastName, ''),
    mfaEnabled: Boolean(item.mfaEnabled),
    sessionTimeout: typeof item.sessionTimeout === 'number' ? item.sessionTimeout : undefined,
    emailNotifications: typeof item.emailNotifications === 'boolean' ? item.emailNotifications : undefined,
    lastLogin: typeof item.lastLogin === 'string' ? item.lastLogin : null,
    isActive: typeof item.isActive === 'boolean' ? item.isActive : true,
  };
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error('Failed to reach the backend API. Check that the Flask server is running and CORS/API URL are correct.');
  }
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || 'Request failed');
  }
  return response.json() as Promise<T>;
}

type RegistrationResponse = {
  message: string;
  user: User;
  mfaEnrollmentToken: string;
  mfaProvisioningUri: string;
};

export const api = {
  async register(payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: string;
    password: string;
    confirmPassword: string;
  }) {
    return request<RegistrationResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async registerAdmin(payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    return request<RegistrationResponse>('/auth/register-admin', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async verifyMfaSetup(payload: { mfaEnrollmentToken: string; code: string }) {
    return request<{ message: string }>('/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async login(username: string, password: string, mfaCode?: string) {
    const result = await request<{ accessToken: string; user: User; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, mfaCode }),
    });
    setToken(result.accessToken);
    return { ...result, user: normalizeUser(result.user) ?? result.user };
  },
  async me() {
    const response = await request<{ user: User }>('/auth/me');
    return { user: normalizeUser(response.user) ?? response.user };
  },
  async logout() {
    try {
      await request<{ message: string }>('/auth/logout', { method: 'POST' });
    } finally {
      setToken(null);
    }
  },
  async getDashboard() {
    const response = await request<{ stats?: { totalPatients?: number; activeRecords?: number; recentUpdates?: number; failedAccessAttempts?: number; }; activityData?: { date: string; logins: number; records: number; }[]; }>('/dashboard/summary');
    return {
      stats: {
        totalPatients: Number(response.stats?.totalPatients ?? 0),
        activeRecords: Number(response.stats?.activeRecords ?? 0),
        recentUpdates: Number(response.stats?.recentUpdates ?? 0),
        failedAccessAttempts: Number(response.stats?.failedAccessAttempts ?? 0),
      },
      activityData: Array.isArray(response.activityData) ? response.activityData.filter(Boolean) : [],
    };
  },
  async getPatients() {
    const response = await request<{ patients: Patient[] }>('/patients');
    return { patients: (Array.isArray(response.patients) ? response.patients : []).map(normalizePatient).filter((p): p is Patient => Boolean(p)) };
  },
  async getPatient(id: string) {
    const response = await request<{ patient: Patient }>(`/patients/${id}`);
    return { patient: normalizePatient(response.patient) as Patient };
  },
  async getMedicalHistory() {
    return request<{ entries: MedicalHistoryEntry[] }>('/medical-history');
  },
  async getAuditLogs(limit = 100) {
    const response = await request<{ logs: AuditLog[] }>(`/audit-logs?limit=${limit}`);
    return { logs: (Array.isArray(response.logs) ? response.logs : []).map(normalizeAuditLog).filter((log): log is AuditLog => Boolean(log)) };
  },
  async getUsers() {
    const response = await request<{ users: User[] }>('/users');
    return { users: (Array.isArray(response.users) ? response.users : []).filter((u): u is User => Boolean(u)) };
  },
  async createStaff(payload: { firstName: string; lastName: string; username: string; email: string; role: 'Doctor' | 'Nurse'; password: string; confirmPassword: string; }) {
    return request<{ message: string; user: User; mfaEnrollmentToken: string; mfaProvisioningUri: string; securityNotice: string }>('/users/staff', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async updateUser(userId: string | number, payload: { firstName: string; lastName: string; username: string; email: string; role: string; isActive: boolean; }) {
    return request<{ message: string; user: User }>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  async deleteUser(userId: string | number) {
    return request<{ message: string }>(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
  async getSettings() {
    return request<{ settings: { mfaEnabled: boolean; mfaEnrolled: boolean; emailNotifications: boolean; sessionTimeout: string; } }>('/settings/me');
  },
  async updateSettings(payload: { mfaEnabled: boolean; emailNotifications: boolean; sessionTimeout: string; }) {
    return request<{ message: string }>('/settings/me', { method: 'PUT', body: JSON.stringify(payload) });
  },
  async updatePassword(payload: { currentPassword: string; newPassword: string }) {
    return request<{ message: string }>('/settings/password', { method: 'POST', body: JSON.stringify(payload) });
  },
  async beginMfaEnrollment() {
    return request<{ mfaEnrollmentToken: string; mfaProvisioningUri: string; message: string }>('/settings/mfa/enroll', { method: 'POST' });
  },
};
