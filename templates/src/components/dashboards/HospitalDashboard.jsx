import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Plus, Search, Filter, FileText, TrendingUp, Clock, XCircle } from 'lucide-react';

function HospitalDashboard() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const claims = [
    { id: 'CLM-001', patient: 'John Doe', age: 45, diagnosis: 'Acute Bronchitis', amount: '$1,250', status: 'approved', date: '2024-01-15', insurance: 'BlueCross' },
    { id: 'CLM-002', patient: 'Jane Smith', age: 32, diagnosis: 'Routine Checkup', amount: '$350', status: 'pending', date: '2024-01-14', insurance: 'Aetna' },
    { id: 'CLM-003', patient: 'Mike Johnson', age: 58, diagnosis: 'Cardiac Evaluation', amount: '$2,800', status: 'pending', date: '2024-01-13', insurance: 'BlueCross' },
    { id: 'CLM-004', patient: 'Sarah Wilson', age: 29, diagnosis: 'Lab Tests', amount: '$450', status: 'rejected', date: '2024-01-12', insurance: 'UnitedHealth' },
    { id: 'CLM-005', patient: 'Robert Brown', age: 67, diagnosis: 'Physical Therapy', amount: '$180', status: 'approved', date: '2024-01-11', insurance: 'Medicare' },
  ];

  const filteredClaims = claims.filter(claim => {
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesSearch = claim.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const analytics = {
    totalSubmitted: 156,
    pendingApprovals: 23,
    rejectedClaims: 8,
    approvalRate: 89
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl shadow-sm border-0 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">Total Claims Submitted</p>
                <p className="text-2xl text-blue-900">{analytics.totalSubmitted}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-0 bg-gradient-to-r from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 mb-1">Pending Approvals</p>
                <p className="text-2xl text-yellow-900">{analytics.pendingApprovals}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-0 bg-gradient-to-r from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 mb-1">Rejected Claims</p>
                <p className="text-2xl text-red-900">{analytics.rejectedClaims}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-0 bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Approval Rate</p>
                <p className="text-2xl text-green-900">{analytics.approvalRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section */}
      <Card className="rounded-xl shadow-sm border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Document Upload Center</CardTitle>
              <CardDescription>Upload medical reports and invoices for claim processing</CardDescription>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Claim
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Medical Reports</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Invoices & Bills</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Supporting Documents</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card className="rounded-xl shadow-sm border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Patient Claims</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search claims..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Insurance</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="text-blue-600">{claim.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-900">{claim.patient}</p>
                        <p className="text-xs text-gray-500">Age: {claim.age}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-40">
                      <p className="text-sm text-gray-900 truncate">{claim.diagnosis}</p>
                    </TableCell>
                    <TableCell className="text-gray-900">{claim.amount}</TableCell>
                    <TableCell className="text-gray-600">{claim.insurance}</TableCell>
                    <TableCell className="text-gray-600">{claim.date}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(claim.status)}>
                        {claim.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          Edit
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
  );
}

export default HospitalDashboard;
