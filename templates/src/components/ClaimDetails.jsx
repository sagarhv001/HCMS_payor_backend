import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { 
  ArrowLeft,
  FileText, 
  Download, 
  Eye,
  Calendar,
  User,
  Building2,
  DollarSign,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

function ClaimDetails({ claimId, onBack }) {
  const [statusUpdate, setStatusUpdate] = useState('');
  const [notes, setNotes] = useState('');

  // Mock claim data
  const claimData = {
    id: 'CLM-2024-001',
    status: 'pending',
    submittedDate: '2024-01-15',
    lastUpdated: '2024-01-16',
    amount: '$1,250.00',
    approvedAmount: '$1,125.00',
    patient: {
      name: 'John Doe',
      id: 'P-12345',
      dateOfBirth: '1979-03-15',
      address: '123 Main St, City, State 12345',
      phone: '(555) 123-4567',
      email: 'john.doe@email.com',
      policyNumber: 'BC-789-456-123',
      groupNumber: 'GRP-001'
    },
    provider: {
      name: 'City General Hospital',
      id: 'H-5678',
      npi: '1234567890',
      address: '456 Hospital Ave, Medical City, State 12345',
      phone: '(555) 987-6543',
      taxId: '12-3456789'
    },
    diagnosis: {
      primary: 'J20.9 - Acute Bronchitis, unspecified',
      secondary: ['Z87.891 - Personal history of nicotine dependence'],
      procedures: ['99213 - Office visit, established patient, level 3']
    },
    documents: [
      { id: 1, name: 'Medical Records.pdf', type: 'Medical Record', uploadDate: '2024-01-15', size: '2.4 MB' },
      { id: 2, name: 'Lab Results.pdf', type: 'Lab Report', uploadDate: '2024-01-15', size: '1.8 MB' },
      { id: 3, name: 'Invoice.pdf', type: 'Invoice', uploadDate: '2024-01-15', size: '0.9 MB' },
      { id: 4, name: 'Prescription.pdf', type: 'Prescription', uploadDate: '2024-01-15', size: '0.5 MB' }
    ],
    timeline: [
      { date: '2024-01-15', event: 'Claim submitted', status: 'info' },
      { date: '2024-01-15', event: 'Initial review completed', status: 'success' },
      { date: '2024-01-16', event: 'Medical review initiated', status: 'info' },
      { date: '2024-01-16', event: 'Pending additional documentation', status: 'warning' }
    ]
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Review</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Denied</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Under Review</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>;
    }
  };

  const getTimelineIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const handleStatusUpdate = () => {
    // Handle status update logic
    console.log('Status update:', statusUpdate, notes);
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Claims
          </Button>
          <div>
            <h1 className="text-3xl text-gray-900">Claim Details</h1>
            <p className="text-gray-600">Comprehensive view of claim {claimData.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {getStatusBadge(claimData.status)}
          <Button variant="outline" className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Claim Header Card */}
      <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Claim ID</p>
                <p className="text-xl text-gray-900 font-medium">{claimData.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Claim Amount</p>
                <p className="text-xl text-gray-900 font-medium">{claimData.amount}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-xl text-gray-900 font-medium">{claimData.submittedDate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-xl text-gray-900 font-medium">{claimData.lastUpdated}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Patient & Provider Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Patient Information */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600">Full Name</Label>
                    <p className="text-gray-900 font-medium">{claimData.patient.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Patient ID</Label>
                    <p className="text-gray-900">{claimData.patient.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Date of Birth</Label>
                    <p className="text-gray-900">{claimData.patient.dateOfBirth}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Phone</Label>
                    <p className="text-gray-900">{claimData.patient.phone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600">Policy Number</Label>
                    <p className="text-gray-900 font-medium">{claimData.patient.policyNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Group Number</Label>
                    <p className="text-gray-900">{claimData.patient.groupNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Email</Label>
                    <p className="text-gray-900">{claimData.patient.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Address</Label>
                    <p className="text-gray-900">{claimData.patient.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Provider Information */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-green-600" />
                Provider Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600">Provider Name</Label>
                    <p className="text-gray-900 font-medium">{claimData.provider.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Provider ID</Label>
                    <p className="text-gray-900">{claimData.provider.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">NPI Number</Label>
                    <p className="text-gray-900">{claimData.provider.npi}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600">Tax ID</Label>
                    <p className="text-gray-900">{claimData.provider.taxId}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Phone</Label>
                    <p className="text-gray-900">{claimData.provider.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Address</Label>
                    <p className="text-gray-900">{claimData.provider.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnosis & Procedures */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Diagnosis & Procedures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Primary Diagnosis</Label>
                  <p className="text-gray-900 font-medium">{claimData.diagnosis.primary}</p>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Secondary Diagnoses</Label>
                  <div className="space-y-1">
                    {claimData.diagnosis.secondary.map((diagnosis, index) => (
                      <p key={index} className="text-gray-900">{diagnosis}</p>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Procedures</Label>
                  <div className="space-y-1">
                    {claimData.diagnosis.procedures.map((procedure, index) => (
                      <p key={index} className="text-gray-900">{procedure}</p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Documents & Status */}
        <div className="space-y-8">
          {/* Uploaded Documents */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
              <CardDescription>
                Supporting documentation for this claim
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {claimData.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-900 font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Processing Timeline</CardTitle>
              <CardDescription>
                Track the progress of this claim
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {claimData.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-1">
                      {getTimelineIcon(event.status)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">{event.event}</p>
                      <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Update Form */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>
                Change the claim status and add notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">New Status</Label>
                  <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="partially_approved">Partially Approved</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="more_info">More Info Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this status update..."
                    className="min-h-[100px] rounded-xl"
                  />
                </div>
                
                <Button 
                  onClick={handleStatusUpdate}
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl"
                  disabled={!statusUpdate}
                >
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ClaimDetails;
