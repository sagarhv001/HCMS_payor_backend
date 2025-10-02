import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Search, 
  Plus, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit,
  Users,
  DollarSign,
  Stethoscope
} from 'lucide-react';

function ProviderDashboard() {
  const [searchId, setSearchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateClaimOpen, setIsCreateClaimOpen] = useState(false);

  // Mock data
  const stats = {
    totalClaims: 156,
    pendingClaims: 23,
    approvedClaims: 125,
    rejectedClaims: 8,
    totalRevenue: '$285,420'
  };

  const activeClaims = [
    {
      id: 'CLM-2024-001',
      patientName: 'John Doe',
      patientId: 'P-12345',
      insuranceId: 'BC-789-456',
      diagnosis: 'Acute Bronchitis',
      amount: '$1,250',
      status: 'pending',
      submittedDate: '2024-01-15',
      lastUpdate: '2024-01-16'
    },
    {
      id: 'CLM-2024-002',
      patientName: 'Jane Smith',
      patientId: 'P-12346',
      insuranceId: 'AET-456-789',
      diagnosis: 'Routine Physical',
      amount: '$350',
      status: 'approved',
      submittedDate: '2024-01-14',
      lastUpdate: '2024-01-16'
    },
    {
      id: 'CLM-2024-003',
      patientName: 'Mike Johnson',
      patientId: 'P-12347',
      insuranceId: 'UH-123-789',
      diagnosis: 'Cardiac Evaluation',
      amount: '$2,800',
      status: 'under_review',
      submittedDate: '2024-01-13',
      lastUpdate: '2024-01-15'
    },
    {
      id: 'CLM-2024-004',
      patientName: 'Sarah Wilson',
      patientId: 'P-12348',
      insuranceId: 'BC-654-321',
      diagnosis: 'Lab Work',
      amount: '$450',
      status: 'rejected',
      submittedDate: '2024-01-12',
      lastUpdate: '2024-01-14'
    }
  ];

  const filteredClaims = activeClaims.filter(claim => {
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesSearch = searchId === '' || 
      claim.insuranceId.toLowerCase().includes(searchId.toLowerCase()) ||
      claim.patientName.toLowerCase().includes(searchId.toLowerCase()) ||
      claim.id.toLowerCase().includes(searchId.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Under Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-[#4ea8de] to-[#4ade80] rounded-2xl shadow-lg">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Provider Dashboard</h1>
            <p className="text-[#6b7280]">Manage patient claims and track submissions</p>
          </div>
        </div>
        
        <Dialog open={isCreateClaimOpen} onOpenChange={setIsCreateClaimOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#4ea8de] hover:bg-[#3d8bbd] text-white shadow-lg rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Create New Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Claim</DialogTitle>
              <DialogDescription>
                Submit a new insurance claim for patient treatment
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Patient Name</Label>
                <Input placeholder="Enter patient name" />
              </div>
              <div className="space-y-2">
                <Label>Insurance ID</Label>
                <Input placeholder="Enter insurance ID" />
              </div>
              <div className="space-y-2">
                <Label>Diagnosis Code</Label>
                <Input placeholder="Enter ICD-10 code" />
              </div>
              <div className="space-y-2">
                <Label>Treatment Amount</Label>
                <Input placeholder="$0.00" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Input placeholder="Brief description of treatment" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateClaimOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Submit Claim
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards - Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Patient Search */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#4ea8de]" />
                Patient Lookup by Insurance ID
              </CardTitle>
              <CardDescription>
                Search by insurance ID, patient name, or claim number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter Insurance ID, Patient Name, or Claim Number"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-[#4ea8de] focus:ring-[#4ea8de]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48 h-12 bg-gray-50 border-gray-200 rounded-xl">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="h-12 px-8 bg-[#4ea8de] hover:bg-[#3d8bbd] rounded-xl">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Claims Table */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Claims Table: Active Claims</CardTitle>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {filteredClaims.length} claims
                </Badge>
              </div>
              <CardDescription>
                Claim ID, Patient Name, Status, Actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Insurance ID</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.map((claim) => (
                      <TableRow key={claim.id} className="hover:bg-gray-50">
                        <TableCell className="text-[#4ea8de] font-medium">{claim.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-gray-900">{claim.patientName}</p>
                            <p className="text-xs text-[#6b7280]">{claim.patientId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#6b7280]">{claim.insuranceId}</TableCell>
                        <TableCell className="text-[#6b7280]">{claim.diagnosis}</TableCell>
                        <TableCell className="text-gray-900 font-medium">{claim.amount}</TableCell>
                        <TableCell>{getStatusBadge(claim.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                              <Eye className="h-4 w-4 text-[#4ea8de]" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                              <Edit className="h-4 w-4 text-[#4ea8de]" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel with Quick Stats */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-600">Total</p>
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl text-blue-900">{stats.totalClaims}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-yellow-600">Pending</p>
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <p className="text-2xl text-yellow-900">{stats.pendingClaims}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-green-600">Approved</p>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl text-green-900">{stats.approvedClaims}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-red-600">Rejected</p>
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-2xl text-red-900">{stats.rejectedClaims}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-purple-600">Revenue</p>
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-xl text-purple-900">{stats.totalRevenue}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  );
}

export default ProviderDashboard;
