"""
HCMS Payor Backend Views
Django REST API views for Payor operations with MongoDB integration
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import datetime, timedelta
import logging
from .models import ClaimModel, NotificationModel, PayorModel, MemberModel, PolicyModel, convert_objectid_to_string

# Custom user class for JWT tokens
class PayorUser:
    """Custom user class for payor authentication with JWT"""
    def __init__(self, payor_data):
        self.id = payor_data.get('payor_id')
        self.payor_id = payor_data.get('payor_id')
        self.email = payor_data.get('email')
        self.name = payor_data.get('name')
        self.organization = payor_data.get('organization')
        self.is_active = payor_data.get('is_active', True)
        self.is_authenticated = True
    
    @property
    def is_anonymous(self):
        return False

logger = logging.getLogger(__name__)

# Simple serializers for API responses
class ClaimSerializer:
    @staticmethod
    def serialize(claim):
        """Serialize claim data for API response"""
        return convert_objectid_to_string(claim)

class PayorSerializer:
    @staticmethod
    def serialize(payor):
        """Serialize payor data for API response"""
        return convert_objectid_to_string(payor)


class PayorLoginAPIView(APIView):
    """
    Payor Login API View
    Handles payor authentication
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Authenticate payor with email/username and password"""
        try:
            # Support both email and username parameters
            email = request.data.get('email') or request.data.get('username')
            password = request.data.get('password')
            
            if not email or not password:
                return Response(
                    {'error': 'Email/username and password are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Initialize PayorModel to authenticate
            payor_model = PayorModel()
            
            # Ensure default payors exist for testing
            payor_model.ensure_default_payors()
            
            # Authenticate payor
            payor = payor_model.authenticate(email, password)
            
            if not payor:
                return Response(
                    {'error': 'Invalid payor credentials. Please check your email/username and password.'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Create JWT tokens for persistent authentication
            payor_user = PayorUser(payor)
            refresh = RefreshToken()
            refresh['user_id'] = payor.get('payor_id')
            refresh['email'] = payor.get('email')
            refresh['name'] = payor.get('name')
            refresh['organization'] = payor.get('organization', 'Unknown')
            
            # Return response format that matches frontend expectations with JWT tokens
            response_data = {
                'success': True,
                'authenticated': True,  # Frontend checks for this field
                'message': 'Authentication successful',
                'payor_id': payor.get('payor_id'),
                'email': payor.get('email'),
                'name': payor.get('name'),
                'organization': payor.get('organization', 'Unknown'),
                'contact_info': payor.get('contact_info', {}),
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'payor': {
                    'payor_id': payor.get('payor_id'),
                    'email': payor.get('email'),
                    'name': payor.get('name'),
                    'organization': payor.get('organization', 'Unknown')
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in PayorLoginAPIView: {str(e)}")
            return Response(
                {'error': 'Authentication failed. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PayorLogoutAPIView(APIView):
    """
    Payor Logout API View
    Handles payor logout
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Logout payor"""
        try:
            # For basic implementation, just return success
            # In a more complex system, you'd invalidate tokens here
            return Response(
                {'success': True, 'message': 'Logout successful'}, 
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error in PayorLogoutAPIView: {str(e)}")
            return Response(
                {'error': 'Logout failed'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PayorMongoAuthAPIView(APIView):
    """
    Payor MongoDB Authentication API View
    Handles payor authentication using MongoDB (compatible with frontend mongo auth calls)
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Authenticate payor with MongoDB backend - matches frontend mongo auth pattern"""
        try:
            # Support both email/password and username/password formats
            email = request.data.get('email') or request.data.get('username')
            password = request.data.get('password')
            
            if not email or not password:
                return Response(
                    {'error': 'Email/username and password are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Initialize PayorModel to authenticate
            payor_model = PayorModel()
            
            # Ensure default payors exist for testing
            payor_model.ensure_default_payors()
            
            # Try authentication with email
            payor = payor_model.authenticate(email, password)
            
            if not payor:
                return Response(
                    {'error': 'Invalid payor credentials. Please check your email address and password.'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Create JWT tokens for persistent authentication
            refresh = RefreshToken()
            refresh['user_id'] = payor.get('payor_id')
            refresh['email'] = payor.get('email')
            refresh['name'] = payor.get('name')
            refresh['organization'] = payor.get('organization', 'Unknown')
            
            # Return response in format compatible with frontend expectations with JWT tokens
            response_data = {
                'success': True,
                'authenticated': True,  # Frontend checks for this field
                'message': 'Authentication successful',
                'payor_id': payor.get('payor_id'),
                'email': payor.get('email'),
                'name': payor.get('name'),
                'organization': payor.get('organization', 'Unknown'),
                'contact_info': payor.get('contact_info', {}),
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {  # Frontend expects 'user' key for mongo auth
                    'id': payor.get('payor_id'),
                    'payor_id': payor.get('payor_id'),
                    'email': payor.get('email'),
                    'username': payor.get('email'),  # Use email as username
                    'name': payor.get('name'),
                    'organization': payor.get('organization', 'Unknown'),
                    'role': 'payor'  # Set role for compatibility
                },
                'payor': {  # Also include payor key for backward compatibility
                    'payor_id': payor.get('payor_id'),
                    'email': payor.get('email'),
                    'name': payor.get('name'),
                    'organization': payor.get('organization', 'Unknown')
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in PayorMongoAuthAPIView: {str(e)}")
            return Response(
                {'error': 'Authentication failed. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PayorPoliciesAPIView(APIView):
    """
    Payor Policies API View
    Provides insurance policies for authenticated payors
    """
    permission_classes = [AllowAny]  # We'll handle authentication manually
    authentication_classes = []  # Disable automatic JWT authentication
    
    def get(self, request):
        """Get policies for the authenticated payor"""
        try:
            # Extract payor_id from JWT token or headers
            payor_id = self._get_payor_id_from_request(request)
            
            if not payor_id:
                return Response(
                    {'error': 'Authentication required. Please provide valid credentials.'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Initialize policy model for this payor
            policy_model = PolicyModel(payor_id=payor_id)
            
            # Get all policies for this payor
            policies = list(policy_model.collection.find({}))
            
            # Convert ObjectId to string for JSON serialization
            policies = [convert_objectid_to_string(policy) for policy in policies]
            
            response_data = {
                'success': True,
                'count': len(policies),
                'policies': policies,
                'payor_id': payor_id
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in PayorPoliciesAPIView: {str(e)}")
            return Response(
                {'error': 'Failed to load policies. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_payor_id_from_request(self, request):
        """Extract payor_id from JWT token or custom headers"""
        try:
            # Try JWT authentication first
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    from django.conf import settings
                    import jwt
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                    return payload.get('user_id')
                except jwt.ExpiredSignatureError:
                    logger.warning("JWT token expired")
                except jwt.InvalidTokenError as e:
                    logger.warning(f"Invalid JWT token: {e}")
                except Exception as e:
                    logger.warning(f"JWT decode error: {e}")
            
            # Fall back to custom headers for backward compatibility
            payor_email = request.headers.get('X-Payor-Email')
            payor_password = request.headers.get('X-Payor-Password')
            
            if payor_email and payor_password:
                payor_model = PayorModel()
                payor = payor_model.authenticate(payor_email, payor_password)
                if payor:
                    return payor.get('payor_id')
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting payor_id: {str(e)}")
            return None


class PayorDashboardAPIView(APIView):
    """
    Payor Dashboard API View
    Provides dashboard metrics and claims list for authenticated payors
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get dashboard data for the authenticated payor"""
        try:
            # Get payor information from request user
            payor_id = getattr(request.user, 'payor_id', None)
            if not payor_id:
                return Response(
                    {'error': 'Payor ID not found for user'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Initialize models
            claim_model = ClaimModel(payor_id=payor_id)
            member_model = MemberModel(payor_id=payor_id)
            
            # Calculate dashboard metrics
            metrics = self._calculate_metrics(claim_model, member_model, payor_id)
            
            # Get recent claims with pagination
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 20))
            claims = self._get_claims_list(claim_model, page, page_size)
            
            response_data = {
                'metrics': metrics,
                'claims': claims['claims'],
                'pagination': claims['pagination']
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in PayorDashboardAPIView: {str(e)}")
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _calculate_metrics(self, claim_model, member_model, payor_id):
        """Calculate dashboard metrics"""
        try:
            # Get claims for this payor
            all_claims = claim_model.get_by_payor(payor_id)
            
            # Calculate basic metrics
            total_claims = len(all_claims)
            pending_claims = len([c for c in all_claims if c.get('status') == 'pending'])
            approved_claims = len([c for c in all_claims if c.get('status') == 'approved'])
            rejected_claims = len([c for c in all_claims if c.get('status') == 'rejected'])
            partially_approved_claims = len([c for c in all_claims if c.get('status') == 'partially_approved'])
            
            # Calculate financial metrics
            total_amount = sum(c.get('total_amount', 0) for c in all_claims)
            average_claim_amount = total_amount / total_claims if total_claims > 0 else 0
            
            # Calculate approval rate
            processed_claims = approved_claims + rejected_claims + partially_approved_claims
            approval_rate = (approved_claims / processed_claims * 100) if processed_claims > 0 else 0
            
            # Get preauth pending count
            preauth_pending = len([c for c in all_claims if c.get('preauth_status') == 'pending'])
            
            # Get active members count
            active_members = member_model.get_active_count()
            
            # Count auto-approved vs manual review
            auto_approved_count = len([c for c in all_claims if c.get('auto_approved', False)])
            manual_review_count = total_claims - auto_approved_count
            
            return {
                'total_claims': total_claims,
                'pending_claims': pending_claims,
                'approved_claims': approved_claims,
                'rejected_claims': rejected_claims,
                'partially_approved_claims': partially_approved_claims,
                'approval_rate': round(approval_rate, 1),
                'total_amount': total_amount,
                'average_claim_amount': round(average_claim_amount, 2),
                'preauth_pending': preauth_pending,
                'active_members': active_members,
                'auto_approved_count': auto_approved_count,
                'manual_review_count': manual_review_count,
                'avg_processing_time': '2.3'  # Mock data - implement actual calculation
            }
            
        except Exception as e:
            logger.error(f"Error calculating metrics: {str(e)}")
            return {}
    
    def _get_claims_list(self, claim_model, page, page_size):
        """Get paginated claims list"""
        try:
            # Get all claims for the payor
            all_claims = claim_model.get_recent_claims(limit=1000)  # Get reasonable limit
            
            # Apply pagination
            start_idx = (page - 1) * page_size
            end_idx = start_idx + page_size
            paginated_claims = all_claims[start_idx:end_idx]
            
            # Serialize claims
            serialized_claims = [ClaimSerializer.serialize(claim) for claim in paginated_claims]
            
            # Calculate pagination info
            total_claims = len(all_claims)
            total_pages = (total_claims + page_size - 1) // page_size
            
            return {
                'claims': serialized_claims,
                'pagination': {
                    'current_page': page,
                    'total_pages': total_pages,
                    'total_claims': total_claims,
                    'page_size': page_size
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting claims list: {str(e)}")
            return {'claims': [], 'pagination': {}}


class PayorClaimReviewAPIView(APIView):
    """
    Payor Claim Review API View
    Handles claim review and decision processing for payors
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, claim_id=None):
        """Get claim details or claims list for review"""
        try:
            # Get payor information
            payor_id = getattr(request.user, 'payor_id', None)
            if not payor_id:
                return Response(
                    {'error': 'Payor ID not found for user'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            claim_model = ClaimModel(payor_id=payor_id)
            
            if claim_id:
                # Get specific claim details
                claim = claim_model.get_by_id(claim_id)
                if not claim:
                    return Response(
                        {'error': 'Claim not found'}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Verify payor owns this claim
                if claim.get('payor_id') != payor_id:
                    return Response(
                        {'error': 'Access denied'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # Get detailed claim information
                detailed_claim = self._get_detailed_claim_info(claim, claim_model)
                return Response(
                    {'claim_details': detailed_claim}, 
                    status=status.HTTP_200_OK
                )
            
            else:
                # Get claims list for review
                status_filter = request.GET.get('status', 'pending')
                claims = claim_model.get_claims_for_review(payor_id, status_filter)
                
                serialized_claims = [ClaimSerializer.serialize(claim) for claim in claims]
                return Response(
                    {'claims': serialized_claims}, 
                    status=status.HTTP_200_OK
                )
                
        except Exception as e:
            logger.error(f"Error in PayorClaimReviewAPIView GET: {str(e)}")
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request, claim_id):
        """Process claim decision"""
        try:
            # Get payor information
            payor_id = getattr(request.user, 'payor_id', None)
            if not payor_id:
                return Response(
                    {'error': 'Payor ID not found for user'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Validate request data
            decision = request.data.get('decision')
            if decision not in ['approved', 'rejected', 'partially_approved']:
                return Response(
                    {'error': 'Invalid decision. Must be approved, rejected, or partially_approved'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            claim_model = ClaimModel(payor_id=payor_id)
            
            # Get the claim
            claim = claim_model.get_by_id(claim_id)
            if not claim:
                return Response(
                    {'error': 'Claim not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Verify payor owns this claim
            if claim.get('payor_id') != payor_id:
                return Response(
                    {'error': 'Access denied'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Process the decision
            decision_data = {
                'decision': decision,
                'approved_amount': request.data.get('approved_amount'),
                'reason_code': request.data.get('reason_code', ''),
                'notes': request.data.get('notes', ''),
                'reviewer_id': str(request.user.id),
                'decision_date': datetime.utcnow()
            }
            
            # Update claim with decision
            updated_claim = claim_model.process_claim_decision(claim_id, decision_data)
            if not updated_claim:
                return Response(
                    {'error': 'Failed to process claim decision'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Send notifications
            self._send_decision_notifications(claim, decision_data)
            
            return Response(
                {
                    'message': 'Claim decision processed successfully',
                    'claim': ClaimSerializer.serialize(updated_claim)
                }, 
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error in PayorClaimReviewAPIView POST: {str(e)}")
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_detailed_claim_info(self, claim, claim_model):
        """Get detailed claim information for review"""
        try:
            # Get member and policy information
            member_model = MemberModel(payor_id=claim.get('payor_id'))
            policy_model = PolicyModel(payor_id=claim.get('payor_id'))
            
            member_info = member_model.get_by_id(claim.get('member_id'))
            policy_info = policy_model.get_by_member_id(claim.get('member_id'))
            
            # Build detailed claim object
            detailed_claim = {
                'claim_id': claim.get('claim_id'),
                'status': claim.get('status'),
                'patient_info': {
                    'name': claim.get('patient_name'),
                    'member_id': claim.get('member_id'),
                    'dob': member_info.get('date_of_birth') if member_info else None,
                    'phone': member_info.get('phone_number') if member_info else None
                },
                'provider_info': {
                    'name': claim.get('provider_name'),
                    'npi': claim.get('provider_npi'),
                    'address': claim.get('provider_address')
                },
                'clinical_info': {
                    'diagnosis_codes': claim.get('diagnosis_codes', []),
                    'procedure_codes': claim.get('procedure_codes', []),
                    'service_date': claim.get('service_date'),
                    'service_description': claim.get('service_description')
                },
                'financial_info': {
                    'billed_amount': claim.get('billed_amount', 0),
                    'covered_amount': claim.get('covered_amount', 0),
                    'patient_responsibility': claim.get('patient_responsibility', 0),
                    'total_amount': claim.get('total_amount', 0)
                },
                'timeline': claim.get('audit_trail', []),
                'policy_info': {
                    'policy_number': policy_info.get('policy_number') if policy_info else None,
                    'coverage_type': policy_info.get('coverage_type') if policy_info else None,
                    'deductible_remaining': policy_info.get('deductible_remaining') if policy_info else None
                },
                'preauth_required': claim.get('preauth_required', False),
                'urgency_level': claim.get('urgency_level', 'routine'),
                'submitted_date': claim.get('submitted_date'),
                'last_updated': claim.get('last_updated')
            }
            
            return convert_objectid_to_string(detailed_claim)
            
        except Exception as e:
            logger.error(f"Error getting detailed claim info: {str(e)}")
            return convert_objectid_to_string(claim)
    
    def _send_decision_notifications(self, claim, decision_data):
        """Send notifications for claim decision"""
        try:
            notification_model = NotificationModel()
            
            # Prepare notification content
            decision = decision_data['decision']
            claim_id = claim.get('claim_id')
            
            # Send to patient
            patient_message = f"Your claim {claim_id} has been {decision}"
            if decision == 'approved':
                patient_message += f" for ${decision_data.get('approved_amount', claim.get('total_amount', 0))}"
            
            notification_model.send_notification(
                recipient=claim.get('patient_contact'),
                message=patient_message,
                notification_type='claim_decision',
                claim_id=claim.get('_id')
            )
            
            # Send to provider
            provider_message = f"Claim {claim_id} decision: {decision}"
            notification_model.send_notification(
                recipient=claim.get('provider_contact'),
                message=provider_message,
                notification_type='claim_decision',
                claim_id=claim.get('_id')
            )
            
            logger.info(f"Notifications sent for claim {claim_id} decision: {decision}")
            
        except Exception as e:
            logger.error(f"Error sending decision notifications: {str(e)}")


# Health check endpoint
class HealthCheckAPIView(APIView):
    """Health check endpoint for monitoring"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({'status': 'healthy', 'timestamp': datetime.utcnow()})


class PayorClaimsAPIView(APIView):
    """Claims API endpoint for provider submissions and payor viewing"""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def get(self, request):
        """Get claims for the authenticated payor"""
        try:
            # Extract payor_id from JWT token or headers (reuse logic from policies view)
            payor_id = self._get_payor_id_from_request(request)
            
            if not payor_id:
                return Response(
                    {'error': 'Authentication required. Please provide valid credentials.'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Initialize claim model for this payor
            claim_model = ClaimModel(payor_id=payor_id)
            
            # Get pagination parameters
            page = int(request.GET.get('page', 1))
            limit = int(request.GET.get('limit', 20))
            
            # Get claims with pagination
            skip = (page - 1) * limit
            claims = claim_model.get_all(skip=skip, limit=limit)
            
            # Convert ObjectId to string and transform data for frontend expectations
            transformed_claims = []
            for claim in claims:
                claim = convert_objectid_to_string(claim)
                
                # Transform flat structure to nested structure expected by frontend
                transformed_claim = {
                    **claim,
                    'patient': {
                        'name': claim.get('patient_name', 'Unknown Patient'),
                        'id': claim.get('patient_id', ''),
                        'insurance_id': claim.get('insurance_id', '')
                    },
                    'provider': {
                        'name': claim.get('provider_name', 'Unknown Provider'),
                        'id': claim.get('provider_id', '')
                    }
                }
                transformed_claims.append(transformed_claim)
            
            response_data = {
                'success': True,
                'results': transformed_claims,  # Frontend expects 'results' not 'claims'
                'page': page,
                'limit': limit,
                'total': len(transformed_claims),
                'payor_id': payor_id
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in PayorClaimsAPIView GET: {str(e)}")
            return Response(
                {'error': 'Failed to load claims. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        """Accept new claim submissions from providers"""
        try:
            data = request.data
            
            # Validate required fields (matching ProviderDashboard form)
            required_fields = ['patient_name', 'insurance_id', 'diagnosis_code', 'amount']
            missing_fields = [field for field in required_fields if not data.get(field)]
            
            if missing_fields:
                return Response(
                    {'error': f'Missing required fields: {", ".join(missing_fields)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Map insurance_id to payor_id using InsurancePayorMappingModel
            from .models import InsurancePayorMappingModel
            mapping_model = InsurancePayorMappingModel()
            payor_id = mapping_model.get_payor_by_insurance(data['insurance_id'])
            
            if not payor_id:
                return Response(
                    {'error': f'Insurance ID {data["insurance_id"]} not found or not covered by this payor'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Create claim data structure matching provider expectations
            claim_data = {
                'patient_name': data['patient_name'],
                'patient_id': data.get('patient_id', f"P-{data['insurance_id'][-5:]}"),
                'insurance_id': data['insurance_id'],
                'diagnosis_code': data['diagnosis_code'],
                'diagnosis_description': data.get('diagnosis_description', ''),
                'procedure_code': data.get('procedure_code', ''),
                'procedure_description': data.get('procedure_description', ''),
                'amount': float(data['amount'].replace('$', '').replace(',', '')) if isinstance(data['amount'], str) else data['amount'],
                'date_of_service': data.get('date_of_service', datetime.utcnow().strftime('%Y-%m-%d')),
                'priority': data.get('priority', 'medium'),
                'notes': data.get('notes', ''),
                'provider_id': data.get('provider_id', 'PROV-001'),
                'provider_name': data.get('provider_name', 'Healthcare Provider'),
                'status': 'pending',
                'submitted_date': datetime.utcnow(),
                'last_updated': datetime.utcnow()
            }
            
            # Initialize claim model for the identified payor
            claim_model = ClaimModel(payor_id=payor_id)
            
            # Auto-validate against policy coverage
            policy_model = PolicyModel(payor_id=payor_id)
            
            # Check if patient has active policy
            # For now, we'll assume insurance_id maps to a policy_id
            coverage_result, coverage_message = policy_model.check_coverage(
                data['insurance_id'], 
                data['diagnosis_code']
            )
            
            claim_data['coverage_validated'] = coverage_result
            claim_data['coverage_message'] = coverage_message
            
            # Auto-approve if covered, otherwise set to review
            if coverage_result:
                claim_data['status'] = 'approved'
                claim_data['auto_approved'] = True
            else:
                claim_data['status'] = 'under_review'
                claim_data['reason_for_review'] = coverage_message
            
            # Create the claim
            new_claim = claim_model.create(claim_data)
            
            if new_claim:
                # Send notification to provider about claim status
                self._notify_provider_claim_status(new_claim, 'submitted')
                
                response_data = {
                    'success': True,
                    'message': 'Claim submitted successfully',
                    'claim': convert_objectid_to_string(new_claim),
                    'status': claim_data['status'],
                    'auto_approved': claim_data.get('auto_approved', False),
                    'processing_time_ms': 1250,  # Mock processing time
                    'expected_payment': self._calculate_expected_payment(claim_data),
                    'patient_responsibility': self._calculate_patient_responsibility(claim_data)
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                return Response(
                    {'error': 'Failed to create claim'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
        except Exception as e:
            logger.error(f"Error in PayorClaimsAPIView POST: {str(e)}")
            return Response(
                {'error': f'Failed to process claim: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_payor_id_from_request(self, request):
        """Extract payor_id from JWT token or custom headers"""
        try:
            # Try JWT authentication first
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    from django.conf import settings
                    import jwt
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                    return payload.get('user_id')
                except jwt.ExpiredSignatureError:
                    logger.warning("JWT token expired")
                except jwt.InvalidTokenError as e:
                    logger.warning(f"Invalid JWT token: {e}")
                    
            # Fall back to custom headers for backward compatibility
            payor_email = request.headers.get('X-Payor-Email')
            payor_password = request.headers.get('X-Payor-Password')
            
            if payor_email and payor_password:
                payor_model = PayorModel()
                payor = payor_model.authenticate(payor_email, payor_password)
                if payor:
                    return payor.get('payor_id')
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting payor_id: {str(e)}")
            return None
    
    def _notify_provider_claim_status(self, claim, event_type):
        """Send notification to provider about claim status change"""
        try:
            import requests
            import hashlib
            import hmac
            import json
            
            # Get provider webhook URL (in production, this would be stored in provider registry)
            provider_webhook_url = self._get_provider_webhook_url(claim.get('provider_id'))
            
            if not provider_webhook_url:
                logger.info(f"No webhook URL configured for provider {claim.get('provider_id')}")
                return
            
            # Prepare webhook payload
            webhook_payload = {
                'event_type': 'claim_status_update',
                'timestamp': datetime.now().isoformat(),
                'claim_id': claim.get('claim_id'),
                'previous_status': None if event_type == 'submitted' else 'under_review',
                'new_status': claim.get('status'),
                'message': self._get_status_message(claim.get('status')),
                'processed_by': 'automated_system',
                'processed_date': datetime.now().isoformat(),
                'patient_name': claim.get('patient_name'),
                'insurance_id': claim.get('insurance_id'),
                'provider_id': claim.get('provider_id'),
                'amount': claim.get('amount'),
                'coverage_validated': claim.get('coverage_validated', False),
                'coverage_message': claim.get('coverage_message', ''),
                'auto_approved': claim.get('auto_approved', False)
            }
            
            # Add payment details if approved
            if claim.get('status') == 'approved':
                webhook_payload['payment_details'] = {
                    'approved_amount': self._calculate_expected_payment(claim),
                    'patient_responsibility': self._calculate_patient_responsibility(claim),
                    'expected_payment_date': (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
                    'payment_method': 'ACH'
                }
            
            # Generate webhook signature for security
            secret_key = 'webhook_secret_key'  # In production, use proper secret management
            payload_json = json.dumps(webhook_payload, sort_keys=True)
            signature = hmac.new(
                secret_key.encode('utf-8'),
                payload_json.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            webhook_payload['webhook_signature'] = f'sha256={signature}'
            
            # Send webhook (non-blocking)
            try:
                response = requests.post(
                    provider_webhook_url,
                    json=webhook_payload,
                    headers={
                        'Content-Type': 'application/json',
                        'X-Webhook-Signature': f'sha256={signature}'
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    logger.info(f"Webhook sent successfully to provider {claim.get('provider_id')} for claim {claim.get('claim_id')}")
                else:
                    logger.warning(f"Webhook failed for provider {claim.get('provider_id')}: {response.status_code}")
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"Failed to send webhook to provider {claim.get('provider_id')}: {str(e)}")
                
        except Exception as e:
            logger.error(f"Error sending provider notification: {str(e)}")
    
    def _get_provider_webhook_url(self, provider_id):
        """Get webhook URL for provider (mock implementation)"""
        # In production, this would look up the provider's registered webhook URL
        provider_webhooks = {
            'PROV-001': 'http://localhost:3000/webhooks/payor-claims',
            'PROV-002': 'http://provider2.example.com/webhooks/claims',
            'PROV-003': 'http://provider3.example.com/api/claim-updates'
        }
        return provider_webhooks.get(provider_id)
    
    def _get_status_message(self, status):
        """Get human-readable status message"""
        messages = {
            'approved': 'Claim approved after validation',
            'under_review': 'Claim submitted for manual review',
            'rejected': 'Claim rejected due to coverage exclusion',
            'pending': 'Claim received and pending review'
        }
        return messages.get(status, 'Claim status updated')
    
    def _calculate_expected_payment(self, claim_data):
        """Calculate expected payment amount based on policy"""
        try:
            amount = float(str(claim_data.get('amount', 0)).replace('$', '').replace(',', ''))
            
            # Mock calculation - in production, use actual policy calculations
            if claim_data.get('auto_approved', False):
                # Apply standard copay percentage (20% patient responsibility)
                return round(amount * 0.8, 2)  # 80% covered
            else:
                return 0.0  # Under review, no payment yet
                
        except (ValueError, TypeError):
            return 0.0
    
    def _calculate_patient_responsibility(self, claim_data):
        """Calculate patient responsibility amount"""
        try:
            amount = float(str(claim_data.get('amount', 0)).replace('$', '').replace(',', ''))
            
            # Mock calculation - 20% patient responsibility
            if claim_data.get('auto_approved', False):
                return round(amount * 0.2, 2)
            else:
                return amount  # If not approved, patient pays full amount
                
        except (ValueError, TypeError):
            return 0.0


class PayorClaimsSummaryAPIView(APIView):
    """Claims summary API endpoint"""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def get(self, request):
        """Get claims summary for the authenticated payor"""
        try:
            payor_id = self._get_payor_id_from_request(request)
            
            if not payor_id:
                return Response(
                    {'error': 'Authentication required. Please provide valid credentials.'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Initialize claim model
            claim_model = ClaimModel(payor_id=payor_id)
            
            # Get all claims for summary
            all_claims = claim_model.get_all(limit=1000)
            
            # Calculate summary statistics
            total_claims = len(all_claims)
            pending_claims = len([c for c in all_claims if c.get('status') == 'pending'])
            approved_claims = len([c for c in all_claims if c.get('status') == 'approved'])
            rejected_claims = len([c for c in all_claims if c.get('status') == 'rejected'])
            
            total_amount = sum(c.get('total_amount', 0) for c in all_claims)
            
            response_data = {
                'success': True,
                'summary': {
                    'total_claims': total_claims,
                    'pending_claims': pending_claims,
                    'approved_claims': approved_claims,
                    'rejected_claims': rejected_claims,
                    'total_amount': total_amount,
                    'approval_rate': (approved_claims / total_claims * 100) if total_claims > 0 else 0
                },
                'payor_id': payor_id
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in PayorClaimsSummaryAPIView: {str(e)}")
            return Response(
                {'error': 'Failed to load claims summary. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_payor_id_from_request(self, request):
        """Extract payor_id from JWT token or custom headers"""
        try:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    from django.conf import settings
                    import jwt
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                    return payload.get('user_id')
                except jwt.ExpiredSignatureError:
                    logger.warning("JWT token expired")
                except jwt.InvalidTokenError as e:
                    logger.warning(f"Invalid JWT token: {e}")
                    
            payor_email = request.headers.get('X-Payor-Email')
            payor_password = request.headers.get('X-Payor-Password')
            
            if payor_email and payor_password:
                payor_model = PayorModel()
                payor = payor_model.authenticate(payor_email, payor_password)
                if payor:
                    return payor.get('payor_id')
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting payor_id: {str(e)}")
            return None


class PayorAnalyticsAPIView(APIView):
    """Analytics API endpoint"""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def get(self, request):
        """Get analytics data for the authenticated payor"""
        try:
            payor_id = self._get_payor_id_from_request(request)
            
            if not payor_id:
                return Response(
                    {'error': 'Authentication required. Please provide valid credentials.'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Mock analytics data for now
            response_data = {
                'success': True,
                'analytics': {
                    'claims_trend': [
                        {'month': 'Jan', 'claims': 45, 'approved': 38},
                        {'month': 'Feb', 'claims': 52, 'approved': 44},
                        {'month': 'Mar', 'claims': 48, 'approved': 41},
                        {'month': 'Apr', 'claims': 58, 'approved': 49},
                        {'month': 'May', 'claims': 61, 'approved': 52},
                        {'month': 'Jun', 'claims': 55, 'approved': 47}
                    ],
                    'top_procedures': [
                        {'code': '99213', 'name': 'Office Visit', 'count': 45},
                        {'code': '99214', 'name': 'Extended Office Visit', 'count': 32},
                        {'code': '90837', 'name': 'Psychotherapy', 'count': 28}
                    ],
                    'cost_analysis': {
                        'total_paid': 125000,
                        'average_claim_amount': 850,
                        'monthly_trend': [8500, 9200, 8800, 9600, 10200, 9800]
                    }
                },
                'payor_id': payor_id
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in PayorAnalyticsAPIView: {str(e)}")
            return Response(
                {'error': 'Failed to load analytics. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_payor_id_from_request(self, request):
        """Extract payor_id from JWT token or custom headers"""
        try:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    from django.conf import settings
                    import jwt
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                    return payload.get('user_id')
                except jwt.ExpiredSignatureError:
                    logger.warning("JWT token expired")
                except jwt.InvalidTokenError as e:
                    logger.warning(f"Invalid JWT token: {e}")
                    
            payor_email = request.headers.get('X-Payor-Email')
            payor_password = request.headers.get('X-Payor-Password')
            
            if payor_email and payor_password:
                payor_model = PayorModel()
                payor = payor_model.authenticate(payor_email, payor_password)
                if payor:
                    return payor.get('payor_id')
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting payor_id: {str(e)}")
            return None


class PayorPreAuthAPIView(APIView):
    """Pre-authorization API endpoint"""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def get(self, request):
        """Get pre-authorization requests for the authenticated payor"""
        try:
            payor_id = self._get_payor_id_from_request(request)
            
            if not payor_id:
                return Response(
                    {'error': 'Authentication required. Please provide valid credentials.'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get pagination parameters
            page = int(request.GET.get('page', 1))
            limit = int(request.GET.get('limit', 20))
            
            # Mock pre-auth data for now - in production this would come from database
            preauth_requests = [
                {
                    'id': 'PRE-001',
                    'member_name': 'John Doe',
                    'procedure': 'MRI Scan',
                    'provider': 'City General Hospital',
                    'requested_date': '2024-10-01',
                    'status': 'pending',
                    'urgency': 'routine'
                },
                {
                    'id': 'PRE-002',
                    'member_name': 'Jane Smith',
                    'procedure': 'Surgery - Appendectomy',
                    'provider': 'Metro Medical Center',
                    'requested_date': '2024-10-02',
                    'status': 'approved',
                    'urgency': 'urgent'
                }
            ]
            
            response_data = {
                'success': True,
                'preauth_requests': preauth_requests,
                'page': page,
                'limit': limit,
                'total': len(preauth_requests),
                'payor_id': payor_id
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in PayorPreAuthAPIView: {str(e)}")
            return Response(
                {'error': 'Failed to load pre-authorization requests. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_payor_id_from_request(self, request):
        """Extract payor_id from JWT token or custom headers"""
        try:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    from django.conf import settings
                    import jwt
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                    return payload.get('user_id')
                except jwt.ExpiredSignatureError:
                    logger.warning("JWT token expired")
                except jwt.InvalidTokenError as e:
                    logger.warning(f"Invalid JWT token: {e}")
                    
            payor_email = request.headers.get('X-Payor-Email')
            payor_password = request.headers.get('X-Payor-Password')
            
            if payor_email and payor_password:
                payor_model = PayorModel()
                payor = payor_model.authenticate(payor_email, payor_password)
                if payor:
                    return payor.get('payor_id')
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting payor_id: {str(e)}")
            return None
