import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Shield, 
  FileText, 
  DollarSign, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle,
  Clock,
  Activity
} from 'lucide-react';
import payorAPI from '../../services/payorAPI';

const PolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      console.log('[PolicyManagement] Fetching policies...');
      const response = await payorAPI.getInsurancePolicies();
      console.log('[PolicyManagement] API response:', response);
      console.log('[PolicyManagement] Policies array:', response.policies);
      setPolicies(response.policies || []);
      console.log('[PolicyManagement] Policies set to state');
    } catch (err) {
      console.error('[PolicyManagement] Error fetching policies:', err);
      setError('Failed to load insurance policies');
    } finally {
      setLoading(false);
    }
  };

  const renderMedicalCoverage = (policy) => {
    return (
      <div className="space-y-4">
        {/* Coverage Details */}
        {policy.coverage_details && policy.coverage_details.length > 0 && (
          <div className="border rounded-lg p-3 bg-blue-50">
            <h5 className="font-medium mb-2 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Coverage Details
            </h5>
            <ul className="space-y-1">
              {policy.coverage_details.map((detail, idx) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ICD-10 Diagnosis Codes */}
        {policy.covered_diagnoses && policy.covered_diagnoses.length > 0 && (
          <div className="border rounded-lg p-3 bg-green-50">
            <h5 className="font-medium mb-2 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              Covered ICD-10 Diagnosis Codes ({policy.covered_diagnoses.length})
            </h5>
            <div className="flex flex-wrap gap-1">
              {policy.covered_diagnoses.slice(0, 8).map((code, idx) => (
                <Badge key={idx} className="bg-green-100 text-green-800 hover:bg-green-100 text-xs font-mono">
                  {code}
                </Badge>
              ))}
              {policy.covered_diagnoses.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{policy.covered_diagnoses.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* CPT Procedure Codes */}
        {policy.covered_procedures && policy.covered_procedures.length > 0 && (
          <div className="border rounded-lg p-3 bg-purple-50">
            <h5 className="font-medium mb-2 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Covered CPT Procedure Codes ({policy.covered_procedures.length})
            </h5>
            <div className="flex flex-wrap gap-1">
              {policy.covered_procedures.slice(0, 8).map((code, idx) => (
                <Badge key={idx} className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs font-mono">
                  {code}
                </Badge>
              ))}
              {policy.covered_procedures.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{policy.covered_procedures.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Excluded Diagnoses */}
        {policy.excluded_diagnoses && policy.excluded_diagnoses.length > 0 && (
          <div className="border rounded-lg p-3 bg-red-50">
            <h5 className="font-medium mb-2 text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              Excluded Diagnosis Codes
            </h5>
            <div className="flex flex-wrap gap-1">
              {policy.excluded_diagnoses.map((code, idx) => (
                <Badge key={idx} className="bg-red-100 text-red-800 hover:bg-red-100 text-xs font-mono">
                  {code}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Financial Details */}
        <div className="border rounded-lg p-3 bg-gray-50">
          <h5 className="font-medium mb-2 text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-600" />
            Financial Details
          </h5>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-600">Annual Limit:</span>
              <div className="font-medium text-green-600">${policy.annual_limit?.toLocaleString() || '0'}</div>
            </div>
            <div>
              <span className="text-gray-600">Deductible:</span>
              <div className="font-medium">${policy.deductible?.toLocaleString() || '0'}</div>
            </div>
            <div>
              <span className="text-gray-600">Per Incident:</span>
              <div className="font-medium">${policy.per_incident_limit?.toLocaleString() || '0'}</div>
            </div>
            <div>
              <span className="text-gray-600">Copay:</span>
              <div className="font-medium">{policy.copay_percentage || 0}%</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getPolicyTypeIcon = (policyName) => {
    const name = policyName.toLowerCase();
    if (name.includes('basic')) return <Shield className="h-4 w-4 text-blue-500" />;
    if (name.includes('premium') || name.includes('executive')) return <Activity className="h-4 w-4 text-purple-500" />;
    if (name.includes('senior')) return <Users className="h-4 w-4 text-orange-500" />;
    if (name.includes('family')) return <Users className="h-4 w-4 text-green-500" />;
    if (name.includes('mental')) return <Activity className="h-4 w-4 text-indigo-500" />;
    if (name.includes('sports')) return <Activity className="h-4 w-4 text-red-500" />;
    if (name.includes('emergency')) return <Activity className="h-4 w-4 text-red-600" />;
    if (name.includes('student')) return <Users className="h-4 w-4 text-blue-400" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading policies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Insurance Policies</h2>
          <p className="text-gray-600">Manage your insurance policies and coverage conditions</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {policies.length} Active Policies
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {policies.map((policy, index) => (
          <Card key={index} className="h-fit">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getPolicyTypeIcon(policy.plan_name)}
                  <div>
                    <CardTitle className="text-lg">{policy.plan_name}</CardTitle>
                    <CardDescription className="text-sm">
                      {policy.policy_number}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={policy.status === 'active' ? "default" : "secondary"}>
                  {policy.status === 'active' ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{policy.member_name ? `Member: ${policy.member_name}` : 'No description available'}</p>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="text-sm">
                  <span className="text-gray-600">Policy Type:</span>
                  <span className="ml-2 font-medium">{policy.policy_type || 'N/A'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Payor ID:</span>
                  <span className="ml-2 font-medium">{policy.payor_id}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Medical Coverage & Benefits
                </h4>
                {renderMedicalCoverage(policy)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {policies.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Policies Found</h3>
            <p className="text-gray-600">
              No insurance policies are available for your payor account.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyManagement;