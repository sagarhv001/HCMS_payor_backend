import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import PayorDashboardSummary from './PayorDashboardSummary';
import ClaimReviewComponent from './ClaimReviewComponent';

/**
 * Enhanced Payor Dashboard Component
 * Integrates summary metrics with claim management functionality
 */
const EnhancedPayorDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    metrics: null,
    claims: [],
    loading: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Mock API calls - replace with actual API endpoints
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch metrics
      const metricsResponse = await fetch('/api/payor/dashboard-api/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!metricsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await metricsResponse.json();
      
      setDashboardData({
        metrics: data.metrics,
        claims: data.claims || [],
        loading: false
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false
      }));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentPage, statusFilter]);

  const handleClaimSelect = (claim) => {
    setSelectedClaim(claim);
    setActiveTab('review');
  };

  const handleClaimUpdate = (updatedClaim) => {
    setDashboardData(prev => ({
      ...prev,
      claims: prev.claims.map(claim => 
        claim._id === updatedClaim._id ? updatedClaim : claim
      )
    }));
    
    // Refresh metrics after claim update
    fetchDashboardData();
  };

  const handleBackToDashboard = () => {
    setActiveTab('dashboard');
    setSelectedClaim(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { variant: 'secondary', color: 'bg-orange-100 text-orange-800' },
      'approved': { variant: 'success', color: 'bg-green-100 text-green-800' },
      'rejected': { variant: 'destructive', color: 'bg-red-100 text-red-800' },
      'partially_approved': { variant: 'warning', color: 'bg-yellow-100 text-yellow-800' },
      'under_review': { variant: 'secondary', color: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <Badge className={config.color}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter claims based on search and status
  const filteredClaims = dashboardData.claims.filter(claim => {
    const matchesSearch = !searchTerm || 
      claim.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.provider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claim_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (activeTab === 'review' && selectedClaim) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={handleBackToDashboard}
                className="flex items-center gap-2"
              >
                ← Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Claim Review</h1>
                <p className="text-sm text-muted-foreground">
                  Claim ID: {selectedClaim.claim_id}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <ClaimReviewComponent 
            claimId={selectedClaim._id}
            onClaimUpdate={handleClaimUpdate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payor Dashboard</h1>
              <p className="text-muted-foreground">
                Manage claims and monitor payor operations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Dashboard Summary */}
        <PayorDashboardSummary 
          metrics={dashboardData.metrics}
          loading={dashboardData.loading}
        />

        {/* Claims Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Claims Management
              </div>
              <Badge variant="outline">
                {filteredClaims.length} claim(s)
              </Badge>
            </CardTitle>
            <CardDescription>
              Review and manage insurance claims
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by patient, provider, or claim ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="partially_approved">Partially Approved</option>
                  <option value="under_review">Under Review</option>
                </select>
              </div>
            </div>

            {/* Claims List */}
            {dashboardData.loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No claims are currently available for review.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredClaims.map((claim) => (
                  <div key={claim._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">
                            {claim.claim_id}
                          </span>
                          {getStatusBadge(claim.status)}
                          {claim.is_urgent && (
                            <Badge variant="destructive" className="text-xs">
                              URGENT
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Patient:</span>
                            <br />
                            {claim.patient_name || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Provider:</span>
                            <br />
                            {claim.provider_name || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Amount:</span>
                            <br />
                            {formatCurrency(claim.total_amount)}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>
                            <br />
                            {claim.service_date ? formatDate(claim.service_date) : 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClaimSelect(claim)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedPayorDashboard;