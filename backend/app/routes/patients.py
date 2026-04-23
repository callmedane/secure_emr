from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity
from ..audit import write_audit_log
from ..models import Patient, User
from ..rbac import require_roles
from ..security import can_access_patient

patients_bp = Blueprint("patients", __name__)


def _current_user() -> User:
    return User.query.get_or_404(int(get_jwt_identity()))


@patients_bp.get('/patients')
@require_roles('Admin', 'Doctor', 'Nurse', 'Patient')
def list_patients():
    user = _current_user()
    patients = Patient.query.order_by(Patient.last_updated.desc()).all()
    allowed = [p.to_dict() for p in patients if can_access_patient(user, p)]
    claims = get_jwt()
    write_audit_log(claims.get('username', 'unknown'), claims.get('role', 'Unknown'), 'List Patients', 'Patient Records', 'Success', f'Returned {len(allowed)} authorized records')
    return jsonify({'patients': allowed})


@patients_bp.get('/patients/<patient_id>')
@require_roles('Admin', 'Doctor', 'Nurse', 'Patient')
def get_patient(patient_id: str):
    patient = Patient.query.get_or_404(patient_id)
    user = _current_user()
    claims = get_jwt()
    if not can_access_patient(user, patient):
        write_audit_log(claims.get('username', 'unknown'), claims.get('role', 'Unknown'), 'View Patient', f'Patient {patient_id}', 'Denied', 'Object-level access control blocked access')
        return jsonify({'message': 'Forbidden'}), 403
    write_audit_log(claims.get('username', 'unknown'), claims.get('role', 'Unknown'), 'View Patient', f'Patient {patient_id}', 'Success')
    return jsonify({'patient': patient.to_dict()})


@patients_bp.get('/patients/my-record')
@require_roles('Patient')
def get_my_patient_record():
    user = _current_user()
    patient = Patient.query.filter_by(portal_user_id=user.id).first()
    if not patient:
        return jsonify({'message': 'No patient record is linked to this account yet.'}), 404
    claims = get_jwt()
    write_audit_log(claims.get('username', 'unknown'), claims.get('role', 'Unknown'), 'View Patient', f'Patient {patient.id}', 'Success', 'Self-service patient record access')
    return jsonify({'patient': patient.to_dict()})


@patients_bp.get('/medical-history')
@require_roles('Admin', 'Doctor', 'Nurse', 'Patient')
def list_medical_history():
    user = _current_user()
    patients = Patient.query.all()
    entries = []
    for patient in patients:
        if not can_access_patient(user, patient):
            continue
        for entry in patient.medical_history:
            entries.append({**entry.to_dict(), 'patientId': patient.id, 'patientName': patient.name})
    entries.sort(key=lambda item: item['date'], reverse=True)
    claims = get_jwt()
    write_audit_log(claims.get('username', 'unknown'), claims.get('role', 'Unknown'), 'View History', 'Medical History', 'Success', f'Returned {len(entries)} authorized entries')
    return jsonify({'entries': entries})
