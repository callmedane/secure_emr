from datetime import datetime, timedelta
from secrets import token_urlsafe
from werkzeug.security import check_password_hash, generate_password_hash
from .extensions import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    mfa_enabled = db.Column(db.Boolean, default=False, nullable=False)
    mfa_secret = db.Column(db.String(32), nullable=True)
    mfa_enrolled_at = db.Column(db.DateTime, nullable=True)
    session_timeout_minutes = db.Column(db.Integer, default=30, nullable=False)
    email_notifications = db.Column(db.Boolean, default=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    failed_login_attempts = db.Column(db.Integer, default=0, nullable=False)
    locked_until = db.Column(db.DateTime, nullable=True)
    must_change_password = db.Column(db.Boolean, default=False, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def is_locked(self) -> bool:
        return bool(self.locked_until and self.locked_until > datetime.utcnow())

    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

    def to_dict(self, include_mfa_uri: bool = False):
        data = {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "mfaEnabled": self.mfa_enabled,
            "mfaEnrolled": bool(self.mfa_enrolled_at),
            "sessionTimeout": self.session_timeout_minutes,
            "emailNotifications": self.email_notifications,
            "lastLogin": self.last_login.isoformat() if self.last_login else None,
            "isActive": self.is_active,
            "mustChangePassword": self.must_change_password,
        }
        if include_mfa_uri:
            from .security import get_mfa_provisioning_uri
            data["mfaProvisioningUri"] = get_mfa_provisioning_uri(self)
        return data


class Patient(db.Model):
    id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    diagnosis = db.Column(db.String(255), nullable=False)
    department = db.Column(db.String(120), nullable=False)
    assigned_doctor = db.Column(db.String(120), nullable=False)
    assigned_nurse = db.Column(db.String(120), nullable=True)
    portal_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    blood_type = db.Column(db.String(10), nullable=False)
    allergies = db.Column(db.Text, nullable=False, default="")
    contact_number = db.Column(db.String(40), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    emergency_contact = db.Column(db.String(120), nullable=False)
    prescriptions = db.relationship("Prescription", backref="patient", cascade="all, delete-orphan")
    medical_history = db.relationship("MedicalHistoryEntry", backref="patient", cascade="all, delete-orphan")

    def to_dict(self, include_mfa_uri: bool = False):
        data = {
            "id": self.id,
            "name": self.name,
            "age": self.age,
            "gender": self.gender,
            "diagnosis": self.diagnosis,
            "department": self.department,
            "assignedDoctor": self.assigned_doctor,
            "assignedNurse": self.assigned_nurse,
            "portalUserId": str(self.portal_user_id) if self.portal_user_id is not None else None,
            "lastUpdated": self.last_updated.isoformat(),
            "status": self.status,
            "bloodType": self.blood_type,
            "allergies": [item.strip() for item in self.allergies.split(',') if item.strip()],
            "contactNumber": self.contact_number,
            "address": self.address,
            "emergencyContact": self.emergency_contact,
            "prescriptions": [p.to_dict() for p in self.prescriptions],
            "medicalHistory": [m.to_dict() for m in sorted(self.medical_history, key=lambda x: x.date, reverse=True)],
        }


class Prescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.String(20), db.ForeignKey('patient.id'), nullable=False)
    medication = db.Column(db.String(120), nullable=False)
    dosage = db.Column(db.String(80), nullable=False)
    frequency = db.Column(db.String(80), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    prescribed_by = db.Column(db.String(120), nullable=False)

    def to_dict(self, include_mfa_uri: bool = False):
        data = {
            "medication": self.medication,
            "dosage": self.dosage,
            "frequency": self.frequency,
            "startDate": self.start_date.isoformat(),
            "endDate": self.end_date.isoformat(),
            "prescribedBy": self.prescribed_by,
        }


class MedicalHistoryEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.String(20), db.ForeignKey('patient.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    type = db.Column(db.String(30), nullable=False)
    description = db.Column(db.Text, nullable=False)
    doctor = db.Column(db.String(120), nullable=False)

    def to_dict(self, include_mfa_uri: bool = False):
        data = {
            "date": self.date.isoformat(),
            "type": self.type,
            "description": self.description,
            "doctor": self.doctor,
        }


class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    action = db.Column(db.String(120), nullable=False)
    resource = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    ip = db.Column(db.String(45), nullable=False)
    details = db.Column(db.Text, nullable=True)

    def to_dict(self, include_mfa_uri: bool = False):
        data = {
            "id": str(self.id),
            "timestamp": self.timestamp.isoformat(),
            "user": self.user,
            "role": self.role,
            "action": self.action,
            "resource": self.resource,
            "status": self.status,
            "ip": self.ip,
            "details": self.details,
        }


class RevokedToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(64), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    revoked_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    reason = db.Column(db.String(120), nullable=True)


class MfaEnrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(128), unique=True, nullable=False, index=True, default=lambda: token_urlsafe(32))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    secret = db.Column(db.String(32), nullable=False)
    purpose = db.Column(db.String(40), nullable=False, default='enrollment')
    expires_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.utcnow() + timedelta(minutes=15))
    used_at = db.Column(db.DateTime, nullable=True)

    def is_valid(self) -> bool:
        return self.used_at is None and self.expires_at > datetime.utcnow()
