import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Shield,
  Users,
  DollarSign,
  FileText,
  Loader2,
  LogOut,
  Building2,
  RefreshCw
} from 'lucide-react';
import payorAPI from '../../services/payorAPI';
import PolicyManagement from '../policies/PolicyManagement';
import PreAuthorizationCenter from '../preauth/PreAuthorizationCenter';
import MedicalCodesCheatsheet from '../common/MedicalCodesCheatsheet';
import { useRealTimeData } from '../../hooks/useRealTimeData';

function PayorDashboard({ payor, onLogout }) {
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Use real-time data hook
  const { 
    claims, 
    analytics, 
    summary, 
    loading, 
    error, 
    lastFetchTime, 
    refresh 
  } = useRealTimeData(payor);

  // Debug logging
  console.log('PayorDashboard rendered with payor:', payor);

  // Early return for testing - remove this after debugging
  if (!payor) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payor Dashboard</h2>
          <p className="text-gray-600">No payor data available</p>
        </div>
      </div>
    );
  }

  // Handle claim actions
  const handleClaimAction = async (claimId, action, data = {}) => {
    try {
      setActionLoading(prev => ({ ...prev, [claimId]: action }));
      
      let status;
      switch (action) {
        case 'approve':
          status = 'approved';
          break;
        case 'deny':
          status = 'denied';
          break;
        case 'request-info':
          status = 'processing';
          break;
        default:
          status = action;
      }
      
      await payorAPI.updateClaimStatus(
        claimId, 
        status, 
        data.notes || `Claim ${action}d by payor`,
        data.approvedAmount
      );
      
      // Refresh claims data
      refresh();
    } catch (err) {
      setError(`Failed to ${action} claim. Please try again.`);
      console.error(`Claim ${action} error:`, err);
    } finally {
      setActionLoading(prev => ({ ...prev, [claimId]: null }));
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesPriority = priorityFilter === 'all' || claim.priority === priorityFilter;
    const matchesSearch = searchTerm === '' || 
      claim.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claim_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium Priority</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low Priority</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Standard</Badge>;
    }
  };

  const getNetworkColor = (network) => {
    if (!network) return 'text-gray-600';
    return network.toLowerCase().includes('in-network') || network.toLowerCase().includes('in network') 
      ? 'text-green-600' 
      : 'text-orange-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{payor.name}</h1>
                <p className="text-gray-600">HIPAA-Compliant Payor Portal • {payor.payor_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastFetchTime && (
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Last updated: {lastFetchTime.toLocaleTimeString()}
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={refresh} 
                className="flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <MedicalCodesCheatsheet />
              <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="policies">Insurance Policies</TabsTrigger>
            <TabsTrigger value="preauth">Pre-Authorization</TabsTrigger>
            <TabsTrigger value="claims">Claims Management</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#4ea8de]" />
          <span className="ml-2 text-gray-600">Loading dashboard data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchData}
              className="ml-auto text-red-600 border-red-200 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Analytics Cards: Average Processing Time, Approval Ratio */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 mb-1">Average Processing Time</p>
                  <p className="text-3xl text-blue-900 font-medium">
                    {analytics?.avg_processing_time_days ? `${analytics.avg_processing_time_days} days` : 'N/A'}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">Calculated from recent claims</p>
                </div>
                <Clock className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 mb-1">Approval Ratio</p>
                  <p className="text-3xl text-green-900 font-medium">
                    {analytics?.approval_ratio ? `${analytics.approval_ratio}%` : 'N/A'}
                  </p>
                  <p className="text-xs text-green-700 mt-1">Current approval rate</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 mb-1">Claims Today</p>
                  <p className="text-3xl text-purple-900 font-medium">
                    {analytics?.total_claims_today || summary?.total_claims || 0}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    {analytics?.pending_review || 0} awaiting review
                  </p>
                </div>
                <FileText className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 mb-1">Total Amount</p>
                  <p className="text-3xl text-amber-900 font-medium">
                    ${analytics?.total_amount ? analytics.total_amount.toLocaleString() : '0'}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">This month processed</p>
                </div>
                <DollarSign className="h-10 w-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Queue List: Submitted claims with patient + provider info */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Queue List of Submitted Claims</CardTitle>
          <CardDescription>
            Review submitted claims with patient and provider information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by patient name, claim ID, or provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-[#4ea8de] focus:ring-[#4ea8de]"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48 h-12 bg-gray-50 border-gray-200 rounded-xl">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => fetchData()}
              className="h-12 px-8 bg-[#4ea8de] hover:bg-[#3d8bbd] rounded-xl"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Claims Queue with Action Buttons per Row */}
          <div className="space-y-4">
            {!loading && filteredClaims.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No claims found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
            
            {filteredClaims.map((claim) => (
              <Card key={claim._id || claim.claim_id} className="rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Patient + Provider Info */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Patient Information */}
                      <div>
                        <h4 className="text-sm text-[#6b7280] mb-3">Patient Information</h4>
                        <div className="space-y-2">
                          <p className="text-gray-900 font-medium">{claim.patient?.name || 'N/A'}</p>
                          <p className="text-sm text-[#6b7280]">ID: {claim.patient?.patient_id || 'N/A'}</p>
                          <p className="text-sm text-[#6b7280]">Policy: {claim.patient?.policy_number || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Provider Information */}
                      <div>
                        <h4 className="text-sm text-[#6b7280] mb-3">Provider Information</h4>
                        <div className="space-y-2">
                          <p className="text-gray-900 font-medium">{claim.provider?.name || 'N/A'}</p>
                          <p className="text-sm text-[#6b7280]">ID: {claim.provider?.provider_id || 'N/A'}</p>
                          <p className={`text-sm ${getNetworkColor(claim.provider?.network || 'Unknown')}`}>
                            {claim.provider?.network || 'Network Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Claim Details */}
                    <div>
                      <h4 className="text-sm text-[#6b7280] mb-3">Claim Details</h4>
                      <div className="space-y-2">
                        <p className="text-[#4ea8de] font-medium">{claim.claim_id}</p>
                        <p className="text-sm text-[#6b7280]">{claim.diagnosis?.primary || 'No diagnosis'}</p>
                        <p className="text-xl text-gray-900 font-medium">${claim.amount?.toLocaleString() || '0'}</p>
                        <p className="text-sm text-[#6b7280]">
                          Submitted: {claim.submitted_date ? new Date(claim.submitted_date).toLocaleDateString() : 'N/A'}
                        </p>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(claim.priority)}
                          <Badge variant={claim.status === 'approved' ? 'default' : claim.status === 'denied' ? 'destructive' : 'secondary'}>
                            {claim.status?.charAt(0).toUpperCase() + claim.status?.slice(1) || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons per Row: Approve, Reject, Request Info */}
                    <div>
                      <h4 className="text-sm text-[#6b7280] mb-3">Actions</h4>
                      <div className="space-y-3">
                        <Button 
                          size="sm" 
                          onClick={() => handleClaimAction(claim.claim_id, 'approve', { approvedAmount: claim.amount })}
                          disabled={actionLoading[claim.claim_id] || claim.status === 'approved'}
                          className="w-full bg-[#4ade80] hover:bg-green-600 text-white rounded-xl disabled:opacity-50"
                        >
                          {actionLoading[claim.claim_id] === 'approve' ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          {claim.status === 'approved' ? 'Approved' : 'Approve'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleClaimAction(claim.claim_id, 'deny')}
                          disabled={actionLoading[claim.claim_id] || claim.status === 'denied'}
                          className="w-full rounded-xl disabled:opacity-50"
                        >
                          {actionLoading[claim.claim_id] === 'deny' ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          {claim.status === 'denied' ? 'Denied' : 'Deny'}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={actionLoading[claim.claim_id]}
                              className="w-full rounded-xl border-[#4ea8de] text-[#4ea8de] hover:bg-[#4ea8de] hover:text-white disabled:opacity-50"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Request Info
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md rounded-2xl">
                            <DialogHeader>
                              <DialogTitle>Request Additional Information</DialogTitle>
                              <DialogDescription>
                                Send a request for more information about claim {claim.claim_id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="request-type">Request Type</Label>
                                <Select>
                                  <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Select request type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="documentation">Additional Documentation</SelectItem>
                                    <SelectItem value="clarification">Medical Clarification</SelectItem>
                                    <SelectItem value="authorization">Prior Authorization</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                  id="message"
                                  placeholder="Describe what additional information is needed..."
                                  className="min-h-[100px] rounded-xl"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" className="rounded-xl">Cancel</Button>
                              <Button 
                                onClick={() => {
                                  handleClaimAction(claim.claim_id, 'request-info', {
                                    notes: 'Additional information requested by payor'
                                  });
                                }}
                                className="bg-[#4ea8de] hover:bg-[#3d8bbd] rounded-xl"
                              >
                                Send Request
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coverage Rules & Validation */}
      {!loading && (
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Claims Summary & Validation
            </CardTitle>
            <CardDescription>
              Current status overview of your claim queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border border-green-200 rounded-2xl bg-green-50">
                <div className="flex items-center space-x-3 mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h4 className="text-green-800 font-medium">Approved Claims</h4>
                </div>
                <p className="text-sm text-green-700">
                  {summary?.status_counts?.approved || 0} claims approved
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {summary?.total_claims ? Math.round((summary.status_counts?.approved || 0) / summary.total_claims * 100) : 0}% of total claims
                </p>
              </div>
              
              <div className="p-4 border border-yellow-200 rounded-2xl bg-yellow-50">
                <div className="flex items-center space-x-3 mb-2">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  <h4 className="text-yellow-800 font-medium">Pending Review</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  {summary?.status_counts?.pending || 0} claims awaiting review
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  {summary?.priority_counts?.high || 0} high priority
                </p>
              </div>
              
              <div className="p-4 border border-blue-200 rounded-2xl bg-blue-50">
                <div className="flex items-center space-x-3 mb-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <h4 className="text-blue-800 font-medium">Total Claims</h4>
                </div>
                <p className="text-sm text-blue-700">
                  {summary?.total_claims || 0} total claims in system
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {summary?.status_counts?.denied || 0} denied claims
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
          </TabsContent>

          <TabsContent value="policies">
            <PolicyManagement />
          </TabsContent>

          <TabsContent value="preauth">
            <PreAuthorizationCenter />
          </TabsContent>

          <TabsContent value="claims" className="space-y-6">
            {/* Claims management content - you can move existing claims UI here */}
            <Card>
              <CardHeader>
                <CardTitle>Claims Management</CardTitle>
                <CardDescription>Detailed claims management interface coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  This section will contain the detailed claims management interface 
                  with filtering, search, and claim details.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default PayorDashboard;
