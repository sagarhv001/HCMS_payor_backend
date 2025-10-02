# HCMS Payor Backend API

Healthcare Claims Management System - Payor Backend API built with Django REST Framework and MongoDB

## 🏥 Overview

This is a comprehensive healthcare claims management system designed for insurance payors. It provides REST APIs for claim processing, member management, policy administration, and real-time notifications with a modern React frontend.

## 🏗️ Architecture

- **Backend**: Django REST Framework with PyMongo for MongoDB integration
- **Frontend**: React with Tailwind CSS and modern UI components
- **Database**: MongoDB with payor-specific data isolation
- **Authentication**: JWT-based authentication with role-based access
- **Real-time**: WebSocket support for notifications and live updates

## 📋 Features

### Core Functionality
- ✅ **Claim Management**: Submit, review, approve/deny claims
- ✅ **Member Management**: Complete member database with demographics
- ✅ **Policy Administration**: ICD-10/CPT code coverage management
- ✅ **Pre-Authorization**: Automated policy evaluation
- ✅ **Real-time Notifications**: Live claim updates and alerts
- ✅ **Analytics Dashboard**: Claims statistics and insights
- ✅ **Medical Codes Reference**: ICD-10 and CPT code lookup tool

### Security & Compliance
- 🔒 **JWT Authentication**: Secure token-based auth
- 🏥 **HIPAA Considerations**: Data isolation by payor
- 🔐 **Role-based Access**: Payor-specific data access
- 📊 **Audit Logging**: Comprehensive activity tracking

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB 4.4+
- Django 4.2+

### Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/sagarhv001/HCMS_payor_backed.git
   cd HCMS_payor_backed
   ```

2. **Backend Setup**
   ```bash
   # Create virtual environment
   python -m venv env
   env\Scripts\activate  # Windows
   # source env/bin/activate  # Linux/Mac
   
   # Install dependencies
   pip install django djangorestframework djangorestframework-simplejwt
   pip install pymongo django-cors-headers python-decouple
   
   # Initialize database
   python manage.py migrate
   python initialize_sample_data.py
   
   # Start backend server
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd templates
   npm install
   npm run dev
   ```

4. **Access Application**
   - Backend API: `http://localhost:8000/api/`
   - Frontend UI: `http://localhost:3000`

## 📡 API Documentation

### Base URL
```
http://localhost:8000/api/
```

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### 1. Payor Login
**POST** `/login/`

Login for payor users with email/password authentication.

**Request Body:**
```json
{
  "email": "bcbs_admin@test.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "payor": {
    "payor_id": "PAY001",
    "name": "BlueCross BlueShield",
    "email": "bcbs_admin@test.com",
    "organization": "BCBS"
  }
}
```

### 2. Payor Logout
**POST** `/logout/`

Logout and invalidate JWT tokens.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### 3. MongoDB Authentication (Alternative)
**POST** `/mongo/auth/`

Direct MongoDB authentication for payor accounts.

**Request Body:**
```json
{
  "payor_id": "PAY001",
  "email": "bcbs_admin@test.com"
}
```

---

## 📋 Claims Management

### 1. Get Claims
**GET** `/claims/`

Retrieve all claims for authenticated payor with filtering and pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` - Filter by claim status (pending, approved, denied)
- `page` - Page number for pagination
- `limit` - Number of claims per page

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "_id": "claim_id_here",
      "claim_id": "CLM-2024-001",
      "patient": {
        "name": "John Doe",
        "member_id": "MEM123456",
        "date_of_birth": "1985-06-15",
        "insurance_id": "BCBS-789456123"
      },
      "provider": {
        "name": "City General Hospital",
        "provider_id": "PROV-001",
        "address": "123 Medical Center Dr"
      },
      "diagnosis": {
        "primary": "Acute Bronchitis",
        "primary_code": "J20.9",
        "description": "Acute bronchitis, unspecified"
      },
      "treatment": {
        "type": "Outpatient Visit",
        "procedures": ["99213", "85025"],
        "category": "Primary Care"
      },
      "financial": {
        "amount": 250.00,
        "currency": "USD"
      },
      "status": "pending",
      "submission_date": "2024-01-15T10:30:00Z",
      "payor_id": "PAY001"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10
}
```

### 2. Submit New Claim
**POST** `/claims/`

Submit a new claim for processing.

**Request Body:**
```json
{
  "patient": {
    "name": "Jane Smith",
    "member_id": "MEM789012",
    "date_of_birth": "1990-03-22",
    "insurance_id": "BCBS-456789012"
  },
  "provider": {
    "name": "Downtown Medical Clinic",
    "provider_id": "PROV-002",
    "address": "456 Health Ave"
  },
  "diagnosis": {
    "primary": "Essential Hypertension",
    "primary_code": "I10"
  },
  "treatment": {
    "type": "Office Visit",
    "procedures": ["99214"]
  },
  "financial": {
    "amount": 180.00
  }
}
```

### 3. Claims Summary
**GET** `/claims/summary/`

Get summary statistics for payor's claims.

**Response:**
```json
{
  "success": true,
  "summary": {
    "total_claims": 150,
    "pending_claims": 25,
    "approved_claims": 100,
    "denied_claims": 25,
    "total_amount": 125000.00,
    "average_claim_amount": 833.33
  }
}
```

---

## 👥 Member Management

### Get Members
**GET** `/policies/` (includes member data)

Retrieve member information associated with policies.

**Response includes member details:**
```json
{
  "members": [
    {
      "member_id": "MEM123456",
      "name": "John Doe",
      "date_of_birth": "1985-06-15",
      "insurance_id": "BCBS-789456123",
      "status": "active",
      "demographics": {
        "gender": "male",
        "address": "123 Main St, City, State 12345",
        "phone": "+1-555-0123",
        "email": "john.doe@email.com"
      },
      "coverage": {
        "effective_date": "2024-01-01",
        "end_date": "2024-12-31",
        "group_number": "GRP001"
      }
    }
  ]
}
```

---

## 🏥 Policy Management

### 1. Get Policies
**GET** `/policies/`

Retrieve all insurance policies for the authenticated payor.

**Response:**
```json
{
  "success": true,
  "policies": [
    {
      "policy_id": "POL-BCBS-001",
      "policy_name": "BlueCross Gold Plan",
      "policy_type": "individual",
      "payor_id": "PAY001",
      "member_name": "John Doe",
      "coverage_details": [
        "Covers preventive care at 100% with no deductible",
        "Emergency room visits covered at 80% after $200 copay",
        "Prescription drugs covered with $10/$30/$50 tier copays"
      ],
      "covered_diagnoses": [
        "J20.9", "Z00.00", "I25.10", "I10", "E11.9"
      ],
      "covered_procedures": [
        "99213", "99214", "99215", "85025", "80053", "93000"
      ],
      "excluded_diagnoses": [
        "F32.9", "Z51.11"
      ],
      "financial": {
        "annual_limit": 50000,
        "deductible": 1500,
        "copay_primary": 25,
        "copay_specialist": 50,
        "coinsurance": 0.20
      }
    }
  ]
}
```

---

## 🔍 Pre-Authorization

### Pre-Authorization Check
**POST** `/pre-auth/`

Evaluate a potential claim against policy rules before submission.

**Request Body:**
```json
{
  "member_id": "MEM123456",
  "diagnosis_codes": ["I10", "Z00.00"],
  "treatment_type": "routine checkup",
  "provider_id": "PROV-001",
  "amount": 200.00,
  "policy_number": "POL-BCBS-001"
}
```

**Response:**
```json
{
  "success": true,
  "evaluation": {
    "status": "approved",
    "reason": "All criteria met for coverage",
    "conditions_met": [
      "coverage_active",
      "diagnosis_covered",
      "provider_in_network",
      "within_annual_limit"
    ],
    "conditions_failed": [],
    "estimated_coverage": {
      "covered_amount": 160.00,
      "patient_responsibility": 40.00,
      "coverage_percentage": 80
    }
  }
}
```

---

## 📊 Analytics & Reporting

### Analytics Dashboard
**GET** `/analytics/`

Get comprehensive analytics for the payor's operations.

**Response:**
```json
{
  "success": true,
  "analytics": {
    "claims": {
      "total": 150,
      "pending": 25,
      "approved": 100,
      "denied": 25,
      "approval_rate": 0.80
    },
    "financial": {
      "total_claims_value": 125000.00,
      "approved_amount": 95000.00,
      "denied_amount": 30000.00,
      "average_claim": 833.33
    },
    "trends": {
      "monthly_claims": [12, 15, 18, 22, 25],
      "top_diagnoses": [
        {"code": "I10", "count": 25, "description": "Hypertension"},
        {"code": "J20.9", "count": 18, "description": "Acute Bronchitis"}
      ],
      "top_procedures": [
        {"code": "99213", "count": 45, "description": "Office Visit - Low Complexity"},
        {"code": "85025", "count": 32, "description": "Complete Blood Count"}
      ]
    }
  }
}
```

---

## 🏗️ Dashboard API

### Comprehensive Dashboard Data
**GET** `/payor/dashboard-api/`

Single endpoint providing all dashboard data for the payor portal.

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "payor_info": {
      "payor_id": "PAY001",
      "name": "BlueCross BlueShield",
      "organization": "BCBS"
    },
    "stats": {
      "total_claims": 150,
      "pending_claims": 25,
      "total_members": 1250,
      "active_policies": 15
    },
    "recent_claims": [...],
    "notifications": [...],
    "analytics": {...}
  }
}
```

---

## 🔍 Claim Review

### Claim Review List
**GET** `/payor/review/`

Get claims requiring review with detailed information.

### Claim Review Detail
**GET** `/payor/review/<claim_id>/`
**PUT** `/payor/review/<claim_id>/`

Get or update specific claim review with approval/denial.

**PUT Request Body:**
```json
{
  "status": "approved",
  "review_notes": "Claim approved - meets all policy requirements",
  "approved_amount": 200.00
}
```

---

## 🏥 Health Check

### Health Check
**GET** `/health/`

Check API health and database connectivity.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-10-03T10:30:00Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## 🗃️ Database Schema

### MongoDB Collections

1. **claims_PAY001** (Payor-specific claims)
2. **claims_PAY002** (Payor-specific claims)
3. **claims_PAY003** (Payor-specific claims)
4. **members** (Member information)
5. **policies** (Insurance policies)
6. **payors** (Payor accounts)
7. **notifications** (System notifications)

### Sample Data Structure

**Claim Document:**
```json
{
  "_id": ObjectId("..."),
  "claim_id": "CLM-2024-001",
  "patient": {
    "name": "John Doe",
    "member_id": "MEM123456",
    "date_of_birth": "1985-06-15",
    "insurance_id": "BCBS-789456123"
  },
  "provider": {
    "name": "City General Hospital",
    "provider_id": "PROV-001"
  },
  "diagnosis": {
    "primary": "Acute Bronchitis",
    "primary_code": "J20.9"
  },
  "financial": {
    "amount": 250.00,
    "currency": "USD"
  },
  "status": "pending",
  "payor_id": "PAY001",
  "created_at": ISODate("..."),
  "updated_at": ISODate("...")
}
```

---

## 🔑 Test Accounts

### Payor Login Credentials

| Payor | Email | Password | Payor ID |
|-------|-------|----------|----------|
| BlueCross BlueShield | `bcbs_admin@test.com` | `admin123` | PAY001 |
| United Healthcare | `united_admin@test.com` | `admin123` | PAY002 |
| Anthem | `anthem_admin@test.com` | `admin123` | PAY003 |

### Sample Member IDs for Testing
- `MEM123456` (BCBS)
- `MEM789012` (United)
- `MEM345678` (Anthem)

---

## 🛠️ Development

### Project Structure
```
HCMS_payor_backed/
├── payor_api/              # Django app
│   ├── models.py           # MongoDB models
│   ├── views.py            # API views
│   ├── urls.py             # URL routing
│   └── admin.py            # Admin interface
├── templates/              # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── contexts/       # React contexts
│   └── package.json
├── logs/                   # Application logs
├── initialize_sample_data.py # Database setup
├── manage.py               # Django management
├── settings.py             # Django settings
└── README.md               # This file
```

### Running Tests
```bash
# Backend tests
python manage.py test

# Frontend tests
cd templates
npm test
```

### Environment Configuration
Create `.env` file with:
```env
SECRET_KEY=your_secret_key_here
DEBUG=True
MONGODB_HOST=mongodb://localhost:27017/
MONGODB_DATABASE=hcms_payor_db
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

## 🚀 Deployment

### Production Checklist
- [ ] Set `DEBUG=False` in settings
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Set up MongoDB with authentication
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up proper logging and monitoring
- [ ] Configure environment variables securely

### Docker Deployment (Optional)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

---

## 📞 Support & Documentation

### Additional Resources
- **API Integration Guide**: `CLAIMS_API_INTEGRATION_GUIDE.md`
- **Provider Integration**: `PROVIDER_INTEGRATION_GUIDE.md`
- **JWT Authentication**: `JWT_AUTHENTICATION_SUCCESS.md`

### Contact Information
- **Developer**: Sagar HV
- **Repository**: https://github.com/sagarhv001/HCMS_payor_backed
- **Issues**: Please create GitHub issues for bug reports

---

## 📝 License

This project is developed for healthcare claim management purposes. Please ensure compliance with HIPAA and other healthcare regulations when using in production.

---

## ✅ Recent Updates

- ✅ Fixed Modal Centering Issues in Medical Codes Cheatsheet
- ✅ Implemented Real-time Notifications System
- ✅ Added Comprehensive Member Data Management
- ✅ Enhanced API Response Formatting
- ✅ Improved Database Collections Structure
- ✅ Added JWT Authentication Flow
- ✅ Created Modern React Frontend with Tailwind CSS

---

*Last Updated: October 3, 2025*