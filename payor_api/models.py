"""
Clean models without HIPAA encryption for HCMS Payor Backend
"""
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class MongoConnection:
    """MongoDB connection handler using PyMongo"""
    _client = None
    _db = None
    
    @classmethod
    def get_database(cls):
        if cls._db is None:
            mongodb_settings = getattr(settings, 'MONGODB_SETTINGS', {})
            host = mongodb_settings.get('host', 'mongodb://localhost:27017/')
            database_name = mongodb_settings.get('database', 'hcms_payor_db')
            
            cls._client = MongoClient(host)
            cls._db = cls._client[database_name]
        
        return cls._db
    
    @classmethod
    def close_connection(cls):
        if cls._client:
            cls._client.close()
            cls._client = None
            cls._db = None


class ClaimModel:
    """Clean Claim model using PyMongo without encryption"""
    
    def __init__(self, payor_id=None):
        self.db = MongoConnection.get_database()
        self.payor_id = payor_id
        # Use payor-specific collection for data isolation
        collection_name = f"claims_{payor_id}" if payor_id else "claims"
        self.collection = self.db[collection_name]
    
    def create(self, claim_data):
        """Create a new claim"""
        claim_data['_id'] = ObjectId()
        claim_data['submitted_date'] = datetime.utcnow()
        claim_data['last_updated'] = datetime.utcnow()
        
        # Set defaults
        claim_data.setdefault('status', 'pending')
        claim_data.setdefault('priority', 'medium')
        claim_data.setdefault('urgency', 'Standard')
        claim_data.setdefault('timeline', [])
        claim_data.setdefault('documents', [])
        claim_data.setdefault('preauth_status', 'pending')
        
        # Add payor association for data isolation
        if self.payor_id:
            claim_data['payor_id'] = self.payor_id
        
        # Generate claim_id if not provided
        if 'claim_id' not in claim_data:
            claim_data['claim_id'] = f"CLM-{datetime.utcnow().strftime('%Y%m%d')}-{str(claim_data['_id'])[-6:]}"
        
        result = self.collection.insert_one(claim_data)
        return self.get_by_id(result.inserted_id)
    
    def get_by_id(self, claim_id):
        """Get claim by ObjectId"""
        if isinstance(claim_id, str):
            claim_id = ObjectId(claim_id)
        
        query = {'_id': claim_id}
        if self.payor_id:
            query['payor_id'] = self.payor_id
        
        return self.collection.find_one(query)
    
    def get_by_claim_id(self, claim_id):
        """Get claim by claim_id field"""
        query = {'claim_id': claim_id}
        if self.payor_id:
            query['payor_id'] = self.payor_id
        
        return self.collection.find_one(query)
    
    def get_all(self, filters=None, skip=0, limit=20, sort=None):
        """Get all claims with optional filtering and pagination"""
        query = filters or {}
        
        # Add payor filter for data isolation
        if self.payor_id:
            query['payor_id'] = self.payor_id
        
        cursor = self.collection.find(query)
        
        if sort:
            cursor = cursor.sort(sort)
        else:
            cursor = cursor.sort('submitted_date', -1)
        
        cursor = cursor.skip(skip).limit(limit)
        return list(cursor)
    
    def update(self, claim_id, update_data):
        """Update a claim"""
        if isinstance(claim_id, str):
            claim_id = ObjectId(claim_id)
        
        update_data['last_updated'] = datetime.utcnow()
        
        query = {'_id': claim_id}
        if self.payor_id:
            query['payor_id'] = self.payor_id
        
        result = self.collection.update_one(
            query,
            {'$set': update_data}
        )
        
        if result.modified_count > 0:
            return self.get_by_id(claim_id)
        return None
    
    def get_payor_claims(self, payor_id, status=None):
        """Get claims for a specific payor"""
        query = {'payor_id': payor_id}
        if status:
            query['status'] = status
        
        return list(self.collection.find(query).sort('submitted_date', -1))
    
    def get_provider_claims(self, provider_id):
        """Get claims submitted by a specific provider"""
        query = {'provider.provider_id': provider_id}
        return list(self.collection.find(query).sort('submitted_date', -1))
    
    def evaluate_preauth(self, claim_id):
        """Evaluate pre-authorization for a claim"""
        claim = self.get_by_claim_id(claim_id)
        if not claim:
            return False, "Claim not found"
        
        # Get payor settings
        payor_model = PayorModel()
        payor_settings = payor_model.get_settings(self.payor_id)
        
        amount = claim.get('amount', 0)
        treatment = claim.get('treatment', {})
        diagnosis = claim.get('diagnosis', {})
        
        # Emergency cases - auto approve if enabled
        if (payor_settings.get('emergency_auto_approve', True) and 
            diagnosis.get('emergency', False)):
            self.update_preauth_status(claim_id, 'approved', 'Auto-approved: Emergency case')
            return True, "Auto-approved for emergency treatment"
        
        # Routine procedures under limit - auto approve
        auto_limit = payor_settings.get('auto_preauth_limit', 500.0)
        if amount <= auto_limit and treatment.get('urgency', '').lower() in ['routine', 'standard']:
            self.update_preauth_status(claim_id, 'approved', f'Auto-approved: Amount under ${auto_limit}')
            return True, f"Auto-approved for routine treatment under ${auto_limit}"
        
        # Preventive care - auto approve
        if treatment.get('type', '').lower() in ['preventive', 'wellness', 'screening']:
            self.update_preauth_status(claim_id, 'approved', 'Auto-approved: Preventive care')
            return True, "Auto-approved for preventive care"
        
        # High amount claims - require manual review
        manual_limit = payor_settings.get('require_manual_review_over', 2000.0)
        if amount > manual_limit:
            self.update_preauth_status(claim_id, 'manual_review', f'Requires manual review: Amount over ${manual_limit}')
            return False, f"Requires manual review - amount exceeds ${manual_limit}"
        
        # Default to manual review for other cases
        self.update_preauth_status(claim_id, 'manual_review', 'Standard manual review required')
        return False, "Requires manual review"
    
    def update_preauth_status(self, claim_id, status, notes=None):
        """Update pre-authorization status"""
        update_data = {
            'preauth_status': status,
            'preauth_updated': datetime.utcnow()
        }
        if notes:
            update_data['preauth_notes'] = notes
        
        # Add to timeline
        timeline_entry = {
            'timestamp': datetime.utcnow(),
            'action': f'Pre-auth {status}',
            'notes': notes or '',
            'automated': True
        }
        
        query = {'claim_id': claim_id}
        if self.payor_id:
            query['payor_id'] = self.payor_id
        
        result = self.collection.update_one(
            query,
            {
                '$set': update_data,
                '$push': {'timeline': timeline_entry}
            }
        )
        return result.modified_count > 0
    
    def process_claim_decision(self, claim_id, decision_data, reviewer_id=None):
        """Process payor decision on a claim"""
        claim = self.get_by_claim_id(claim_id)
        if not claim:
            return False, "Claim not found"
        
        decision_status = decision_data.get('status')  # approved, rejected, partially_approved
        decision_notes = decision_data.get('notes', '')
        approved_amount = decision_data.get('approved_amount', 0)
        
        # Validate decision
        if decision_status not in ['approved', 'rejected', 'partially_approved']:
            return False, "Invalid decision status"
        
        # Update claim with decision
        update_data = {
            'status': decision_status,
            'last_updated': datetime.utcnow(),
            'decision': {
                'status': decision_status,
                'approved_amount': approved_amount,
                'notes': decision_notes,
                'reviewer_id': reviewer_id,
                'decision_date': datetime.utcnow()
            }
        }
        
        # Add timeline entry
        timeline_entry = {
            'timestamp': datetime.utcnow(),
            'action': f'Decision: {decision_status}',
            'notes': decision_notes,
            'reviewer_id': reviewer_id,
            'automated': False
        }
        
        # Create audit log entry
        audit_entry = {
            'timestamp': datetime.utcnow(),
            'claim_id': claim_id,
            'action': 'claim_decision',
            'payor_id': self.payor_id,
            'reviewer_id': reviewer_id,
            'old_status': claim.get('status'),
            'new_status': decision_status,
            'decision_data': decision_data
        }
        
        query = {'claim_id': claim_id}
        if self.payor_id:
            query['payor_id'] = self.payor_id
        
        # Update claim and add audit log
        result = self.collection.update_one(
            query,
            {
                '$set': update_data,
                '$push': {'timeline': timeline_entry}
            }
        )
        
        if result.modified_count > 0:
            # Log audit entry
            self.db.audit_logs.insert_one(audit_entry)
            return True, "Decision processed successfully"
        
        return False, "Failed to update claim"


class PayorModel:
    """Enhanced Payor model with comprehensive business logic"""
    
    def __init__(self):
        self.db = MongoConnection.get_database()
        self.collection = self.db.payors
        self._ensure_indexes()
    
    def _ensure_indexes(self):
        """Ensure proper indexes for performance"""
        try:
            self.collection.create_index([('payor_id', 1)], unique=True)
            self.collection.create_index([('email', 1)], unique=True)
            self.collection.create_index([('is_active', 1)])
        except Exception as e:
            logger.warning(f"Index creation warning: {e}")
    
    def authenticate(self, email_or_username, password):
        """Authenticate payor by email/username and password"""
        # Try both email and username for authentication
        query = {
            '$or': [
                {'email': email_or_username},
                {'username': email_or_username}
            ],
            'password': password,  # In production, use hashed passwords
            'is_active': True
        }
        
        payor = self.collection.find_one(query)
        return payor
    
    def get_by_id(self, payor_id):
        """Get payor by ID"""
        return self.collection.find_one({'payor_id': payor_id})
    
    def get_by_email(self, email):
        """Get payor by email"""
        return self.collection.find_one({'email': email, 'is_active': True})
    
    def create_payor(self, payor_data):
        """Create a new payor"""
        payor_data['_id'] = ObjectId()
        payor_data['created_date'] = datetime.utcnow()
        payor_data['last_updated'] = datetime.utcnow()
        payor_data.setdefault('is_active', True)
        payor_data.setdefault('settings', {
            'auto_preauth_enabled': True,
            'auto_preauth_limit': 500.0,
            'require_manual_review_over': 2000.0,
            'emergency_auto_approve': True
        })
        
        result = self.collection.insert_one(payor_data)
        return self.get_by_id(payor_data['payor_id'])
    
    def get_settings(self, payor_id):
        """Get payor settings for business rules"""
        payor = self.get_by_id(payor_id)
        return payor.get('settings', {}) if payor else {}
    
    def ensure_default_payors(self):
        """Ensure default payor accounts exist for testing/demo"""
        default_payors = [
            {
                'payor_id': 'PAY001',
                'email': 'bcbs_admin@test.com',
                'username': 'bcbs_admin',  # Add username field for frontend compatibility
                'password': 'bcbs_secure_2024',  # In production, hash this!
                'name': 'BlueCross BlueShield',
                'organization': 'BlueCross BlueShield',
                'contact_info': {
                    'phone': '1-800-BCBS-HELP',
                    'address': '123 Insurance Way, Healthcare City, HC 12345'
                }
            },
            {
                'payor_id': 'PAY002', 
                'email': 'united_admin@test.com',
                'username': 'united_admin',
                'password': 'united_secure_2024',
                'name': 'UnitedHealth Group',
                'organization': 'UnitedHealth Group',
                'contact_info': {
                    'phone': '1-800-UNITED-1',
                    'address': '456 Health Plaza, Medical City, MC 54321'
                }
            },
            {
                'payor_id': 'PAY003',
                'email': 'anthem_admin@test.com',
                'username': 'anthem_admin',
                'password': 'anthem_secure_2024',
                'name': 'Anthem Inc',
                'organization': 'Anthem Inc',
                'contact_info': {
                    'phone': '1-800-ANTHEM-1',
                    'address': '789 Care Boulevard, Insurance Town, IT 98765'
                }
            }
        ]
        
        created_count = 0
        for payor_data in default_payors:
            # Check if payor already exists
            existing = self.get_by_email(payor_data['email'])
            if not existing:
                try:
                    self.create_payor(payor_data)
                    created_count += 1
                    logger.info(f"Created default payor: {payor_data['name']}")
                except Exception as e:
                    logger.error(f"Failed to create default payor {payor_data['name']}: {e}")
        
        return created_count


class MemberModel:
    """Enhanced Member/Patient model with payor-specific collections"""
    
    def __init__(self, payor_id=None):
        self.db = MongoConnection.get_database()
        self.payor_id = payor_id
        # Use payor-specific collection for data isolation
        collection_name = f"members_{payor_id}" if payor_id else "members"
        self.collection = self.db[collection_name]
        self._ensure_indexes()
    
    def _ensure_indexes(self):
        """Ensure proper indexes for performance"""
        try:
            self.collection.create_index([('member_id', 1)], unique=True)
            self.collection.create_index([('insurance_id', 1)])
            self.collection.create_index([('policy_number', 1)])
            self.collection.create_index([('is_active', 1)])
        except Exception as e:
            logger.warning(f"Member index creation warning: {e}")
    
    def get_by_member_id(self, member_id):
        """Get member by member_id within payor's collection"""
        return self.collection.find_one({'member_id': member_id})
    
    def get_by_policy_number(self, policy_number):
        """Get member by policy number"""
        return self.collection.find_one({'policy_number': policy_number})
    
    def get_by_insurance_id(self, insurance_id):
        """Get member by insurance_id within payor's collection"""
        return self.collection.find_one({'insurance_id': insurance_id})
    
    def verify_eligibility(self, member_id):
        """Comprehensive eligibility check for payor's member"""
        member = self.get_by_member_id(member_id)
        if not member:
            return False, "Member not found in our records"
        
        if not member.get('is_active', False):
            return False, "Member account is inactive"
        
        # Check coverage dates
        coverage_start = member.get('coverage_start_date')
        coverage_end = member.get('coverage_end_date')
        current_date = datetime.utcnow()
        
        if coverage_start and current_date < coverage_start:
            return False, "Coverage not yet active"
        
        if coverage_end and current_date > coverage_end:
            return False, "Coverage has expired"
        
        # Check premium status
        if member.get('premium_status') == 'unpaid':
            return False, "Premium payment outstanding"
        
        # Check suspension status
        if member.get('is_suspended', False):
            return False, "Membership is temporarily suspended"
        
        return True, "Member is eligible for coverage"
    
    def get_all(self, filters=None, skip=0, limit=20):
        """Get all members for this payor with filtering"""
        query = filters or {}
        cursor = self.collection.find(query).skip(skip).limit(limit).sort('member_id', 1)
        return list(cursor)
    
    def update_member(self, member_id, update_data):
        """Update member information"""
        update_data['last_updated'] = datetime.utcnow()
        result = self.collection.update_one(
            {'member_id': member_id},
            {'$set': update_data}
        )
        return result.modified_count > 0


class PolicyModel:
    """Policy model for coverage validation"""
    
    def __init__(self, payor_id=None):
        self.db = MongoConnection.get_database()
        self.payor_id = payor_id
        # Use payor-specific collection for data isolation
        collection_name = f"policies_{payor_id}" if payor_id else "policies"
        self.collection = self.db[collection_name]
        self._ensure_indexes()
    
    def _ensure_indexes(self):
        """Ensure proper indexes"""
        try:
            self.collection.create_index([('policy_id', 1)], unique=True)
            self.collection.create_index([('policy_type', 1)])
            self.collection.create_index([('is_active', 1)])
        except Exception as e:
            logger.warning(f"Policy index creation warning: {e}")
    
    def get_by_policy_id(self, policy_id):
        """Get policy by ID"""
        return self.collection.find_one({'policy_id': policy_id})
    
    def check_coverage(self, policy_id, diagnosis_code=None, procedure_code=None):
        """Check if a diagnosis/procedure is covered under the policy"""
        policy = self.get_by_policy_id(policy_id)
        if not policy:
            return False, "Policy not found"
        
        if not policy.get('is_active', False):
            return False, "Policy is inactive"
        
        # Check diagnosis codes (ICD-10)
        if diagnosis_code:
            covered_diagnoses = policy.get('covered_diagnoses', [])
            excluded_diagnoses = policy.get('excluded_diagnoses', [])
            
            if diagnosis_code in excluded_diagnoses:
                return False, f"Diagnosis {diagnosis_code} is explicitly excluded"
            
            # Check if diagnosis is covered (if list exists and is not empty)
            if covered_diagnoses and diagnosis_code not in covered_diagnoses:
                return False, f"Diagnosis {diagnosis_code} not covered under this policy"
        
        # Check procedure codes (CPT)
        if procedure_code:
            covered_procedures = policy.get('covered_procedures', [])
            excluded_procedures = policy.get('excluded_procedures', [])
            
            if procedure_code in excluded_procedures:
                return False, f"Procedure {procedure_code} is explicitly excluded"
            
            if covered_procedures and procedure_code not in covered_procedures:
                return False, f"Procedure {procedure_code} not covered under this policy"
        
        return True, "Coverage validated successfully"
    
    def get_coverage_limits(self, policy_id):
        """Get coverage limits for a policy"""
        policy = self.get_by_policy_id(policy_id)
        if not policy:
            return None
        
        return {
            'annual_limit': policy.get('annual_limit', 0),
            'per_incident_limit': policy.get('per_incident_limit', 0),
            'deductible': policy.get('deductible', 0),
            'copay_percentage': policy.get('copay_percentage', 0)
        }


class InsurancePayorMappingModel:
    """Model to map insurance IDs to payor IDs"""
    
    def __init__(self):
        self.db = MongoConnection.get_database()
        self.collection = self.db.insurance_payor_mappings
    
    def get_payor_by_insurance(self, insurance_id):
        """Get payor ID by insurance ID"""
        mapping = self.collection.find_one({'insurance_id': insurance_id})
        return mapping.get('payor_id') if mapping else None
    
    def get_all_mappings(self):
        """Get all insurance to payor mappings"""
        return list(self.collection.find({}))


class PreAuthorizationModel:
    """Pre-authorization model"""
    
    def __init__(self, payor_id=None):
        self.db = MongoConnection.get_database()
        self.collection = self.db.pre_authorizations
        self.payor_id = payor_id
    
    def create(self, preauth_data):
        """Create a new pre-authorization request"""
        preauth_data['_id'] = ObjectId()
        preauth_data['created_date'] = datetime.utcnow()
        preauth_data['last_updated'] = datetime.utcnow()
        preauth_data.setdefault('status', 'pending')
        
        if self.payor_id:
            preauth_data['payor_id'] = self.payor_id
        
        result = self.collection.insert_one(preauth_data)
        return self.get_by_id(result.inserted_id)
    
    def get_by_id(self, preauth_id):
        """Get pre-authorization by ID"""
        if isinstance(preauth_id, str):
            preauth_id = ObjectId(preauth_id)
        
        query = {'_id': preauth_id}
        if self.payor_id:
            query['payor_id'] = self.payor_id
        
        return self.collection.find_one(query)
    
    def get_by_claim_id(self, claim_id):
        """Get pre-authorization by claim ID"""
        query = {'claim_id': claim_id}
        if self.payor_id:
            query['payor_id'] = self.payor_id
        
        return self.collection.find_one(query)
    
    def update_status(self, preauth_id, status, notes=None):
        """Update pre-authorization status"""
        if isinstance(preauth_id, str):
            preauth_id = ObjectId(preauth_id)
        
        update_data = {
            'status': status,
            'last_updated': datetime.utcnow()
        }
        
        if notes:
            update_data['notes'] = notes
        
        query = {'_id': preauth_id}
        if self.payor_id:
            query['payor_id'] = self.payor_id
        
        result = self.collection.update_one(query, {'$set': update_data})
        return result.modified_count > 0


class PayorAnalyticsModel:
    """Analytics model for payor dashboard"""
    
    def __init__(self, payor_id):
        self.db = MongoConnection.get_database()
        self.payor_id = payor_id
        self.claims_collection = self.db.claims
        self.preauth_collection = self.db.pre_authorizations
    
    def get_dashboard_metrics(self):
        """Get key metrics for payor dashboard"""
        # Claims metrics
        total_claims = self.claims_collection.count_documents({'payor_id': self.payor_id})
        pending_claims = self.claims_collection.count_documents({
            'payor_id': self.payor_id,
            'status': 'pending'
        })
        approved_claims = self.claims_collection.count_documents({
            'payor_id': self.payor_id,
            'status': 'approved'
        })
        
        # Pre-auth metrics
        preauth_pending = self.preauth_collection.count_documents({
            'payor_id': self.payor_id,
            'status': 'pending'
        })
        
        # Amount metrics
        pipeline = [
            {'$match': {'payor_id': self.payor_id}},
            {'$group': {
                '_id': None,
                'total_amount': {'$sum': '$amount'},
                'avg_amount': {'$avg': '$amount'}
            }}
        ]
        
        amount_result = list(self.claims_collection.aggregate(pipeline))
        total_amount = amount_result[0]['total_amount'] if amount_result else 0
        avg_amount = amount_result[0]['avg_amount'] if amount_result else 0
        
        return {
            'total_claims': total_claims,
            'pending_claims': pending_claims,
            'approved_claims': approved_claims,
            'preauth_pending': preauth_pending,
            'total_amount': total_amount,
            'average_claim_amount': avg_amount,
            'approval_rate': (approved_claims / total_claims * 100) if total_claims > 0 else 0
        }
    
    def get_claims_by_status(self):
        """Get claims grouped by status"""
        pipeline = [
            {'$match': {'payor_id': self.payor_id}},
            {'$group': {
                '_id': '$status',
                'count': {'$sum': 1},
                'total_amount': {'$sum': '$amount'}
            }}
        ]
        
        return list(self.claims_collection.aggregate(pipeline))
    
    def get_recent_activity(self, limit=10):
        """Get recent claims activity"""
        return list(self.claims_collection.find(
            {'payor_id': self.payor_id}
        ).sort('last_updated', -1).limit(limit))


class NotificationModel:
    """Model for handling notifications to patients and providers"""
    
    def __init__(self):
        self.db = MongoConnection.get_database()
        self.collection = self.db.notifications
        self._ensure_indexes()
    
    def _ensure_indexes(self):
        """Ensure proper indexes"""
        try:
            self.collection.create_index([('claim_id', 1)])
            self.collection.create_index([('recipient_type', 1)])
            self.collection.create_index([('sent_date', -1)])
        except Exception as e:
            logger.warning(f"Notification index creation warning: {e}")
    
    def send_claim_notification(self, claim_data, notification_type, payor_info=None):
        """Send notification for claim status change"""
        try:
            # Extract notification recipients
            patient = claim_data.get('patient', {})
            provider = claim_data.get('provider', {})
            
            notifications_sent = []
            
            # Send to patient if contact info available
            if patient.get('phone') or patient.get('email'):
                patient_notification = self._create_patient_notification(
                    claim_data, notification_type, patient, payor_info
                )
                notifications_sent.append(patient_notification)
            
            # Send to provider if contact info available
            if provider.get('email'):
                provider_notification = self._create_provider_notification(
                    claim_data, notification_type, provider, payor_info
                )
                notifications_sent.append(provider_notification)
            
            # Store notification records
            if notifications_sent:
                self.collection.insert_many(notifications_sent)
            
            # In production, integrate with actual SMS/Email services
            # For now, log the notifications
            for notification in notifications_sent:
                logger.info(f"Notification sent: {notification['type']} to {notification['recipient_type']} - {notification['message'][:50]}...")
            
            return True, f"Sent {len(notifications_sent)} notifications"
            
        except Exception as e:
            logger.error(f"Notification sending failed: {e}")
            return False, f"Notification failed: {str(e)}"
    
    def _create_patient_notification(self, claim_data, notification_type, patient, payor_info):
        """Create patient notification record"""
        claim_id = claim_data.get('claim_id')
        amount = claim_data.get('amount', 0)
        status = claim_data.get('status')
        
        # Generate appropriate message
        if notification_type == 'submitted':
            message = f"Your claim {claim_id} for ${amount:.2f} has been submitted for review."
        elif notification_type == 'approved':
            approved_amount = claim_data.get('decision', {}).get('approved_amount', amount)
            message = f"Great news! Your claim {claim_id} has been approved for ${approved_amount:.2f}."
        elif notification_type == 'rejected':
            message = f"Your claim {claim_id} has been reviewed. Please contact us for details."
        elif notification_type == 'partially_approved':
            approved_amount = claim_data.get('decision', {}).get('approved_amount', amount * 0.8)
            message = f"Your claim {claim_id} has been partially approved for ${approved_amount:.2f}."
        else:
            message = f"Your claim {claim_id} status has been updated to {status}."
        
        return {
            '_id': ObjectId(),
            'claim_id': claim_id,
            'recipient_type': 'patient',
            'recipient_id': patient.get('member_id'),
            'recipient_name': patient.get('name'),
            'recipient_phone': patient.get('phone'),
            'recipient_email': patient.get('email'),
            'type': notification_type,
            'message': message,
            'sent_date': datetime.utcnow(),
            'payor_info': payor_info
        }
    
    def _create_provider_notification(self, claim_data, notification_type, provider, payor_info):
        """Create provider notification record"""
        claim_id = claim_data.get('claim_id')
        amount = claim_data.get('amount', 0)
        patient_name = claim_data.get('patient', {}).get('name', 'Patient')
        
        # Generate provider-specific message
        if notification_type == 'approved':
            approved_amount = claim_data.get('decision', {}).get('approved_amount', amount)
            message = f"Claim {claim_id} for {patient_name} has been approved for ${approved_amount:.2f}."
        elif notification_type == 'rejected':
            message = f"Claim {claim_id} for {patient_name} has been declined. Review required."
        elif notification_type == 'partially_approved':
            approved_amount = claim_data.get('decision', {}).get('approved_amount', amount * 0.8)
            message = f"Claim {claim_id} for {patient_name} partially approved for ${approved_amount:.2f}."
        else:
            message = f"Claim {claim_id} for {patient_name} status updated."
        
        return {
            '_id': ObjectId(),
            'claim_id': claim_id,
            'recipient_type': 'provider',
            'recipient_id': provider.get('provider_id'),
            'recipient_name': provider.get('name'),
            'recipient_email': provider.get('email'),
            'type': notification_type,
            'message': message,
            'sent_date': datetime.utcnow(),
            'payor_info': payor_info
        }
    
    def get_notifications_for_claim(self, claim_id):
        """Get all notifications sent for a claim"""
        return list(self.collection.find({'claim_id': claim_id}).sort('sent_date', -1))


# Utility function to convert ObjectId to string for JSON serialization
def convert_objectid_to_string(obj):
    """Convert ObjectId fields to strings for JSON serialization"""
    if isinstance(obj, dict):
        return {key: convert_objectid_to_string(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectid_to_string(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    else:
        return obj