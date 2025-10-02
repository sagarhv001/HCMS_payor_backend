"""
URL configuration for HCMS Payor Backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.http import JsonResponse

def api_status(request):
    """Root endpoint showing API status"""
    return JsonResponse({
        'status': 'HCMS Payor Backend API',
        'version': '1.0.0',
        'endpoints': {
            'authentication': '/api/login/',
            'mongo_authentication': '/api/mongo/auth/',
            'payor_dashboard': '/api/payor/dashboard-api/',
            'payor_claims': '/api/payor/review/',  
            'policies': '/api/policies/',
            'claims': '/api/claims/',
            'analytics': '/api/analytics/',
            'pre_auth': '/api/pre-auth/'
        },
        'message': 'HCMS Payor Backend API - JWT Authentication Ready'
    })

urlpatterns = [
    path('', api_status, name='api-status'),
    path('admin/', admin.site.urls),
    path('api/', include('payor_api.urls')),
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)