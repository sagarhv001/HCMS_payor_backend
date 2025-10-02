from django.urls import path
from . import views

app_name = 'payor_api'

urlpatterns = [
    # Health check endpoint
    path('health/', views.HealthCheckAPIView.as_view(), name='health-check'),
    
    # Authentication endpoints
    path('login/', views.PayorLoginAPIView.as_view(), name='payor-login'),
    path('logout/', views.PayorLogoutAPIView.as_view(), name='payor-logout'),
    path('mongo/auth/', views.PayorMongoAuthAPIView.as_view(), name='payor-mongo-auth'),
    
    # Policies endpoint
    path('policies/', views.PayorPoliciesAPIView.as_view(), name='payor-policies'),
    
    # Claims endpoints
    path('claims/', views.PayorClaimsAPIView.as_view(), name='payor-claims'),
    path('claims/summary/', views.PayorClaimsSummaryAPIView.as_view(), name='payor-claims-summary'),
    
    # Analytics endpoint
    path('analytics/', views.PayorAnalyticsAPIView.as_view(), name='payor-analytics'),
    
    # Pre-authorization endpoint
    path('pre-auth/', views.PayorPreAuthAPIView.as_view(), name='payor-preauth'),
    
    # Enhanced Payor Views (2 comprehensive views as requested)
    path('payor/dashboard-api/', views.PayorDashboardAPIView.as_view(), name='payor-dashboard-api'),
    path('payor/review/', views.PayorClaimReviewAPIView.as_view(), name='payor-review-list'),
    path('payor/review/<str:claim_id>/', views.PayorClaimReviewAPIView.as_view(), name='payor-review-detail'),
]