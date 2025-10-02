import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileCheck,
  Plus,
  Search
} from 'lucide-react';
import payorAPI from '../../services/payorAPI';

const PreAuthorizationCenter = () => {
  const [preauths, setPreauths] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewPreauth, setShowNewPreauth] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const [newPreauth, setNewPreauth] = useState({
    patient_name: '',
    patient_age: '',
    diagnosis_codes: '',
    treatment_type: '',
    provider_id: '',
    amount: '',
    policy_number: '',
    prior_auth_number: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [preauthResponse, policyResponse] = await Promise.all([
        payorAPI.getPreAuthRequestsSecure(),
        payorAPI.getInsurancePolicies()
      ]);
      
      setPreauths(preauthResponse.results || []);
      setPolicies(policyResponse.policies || []);
    } catch (err) {
      setError('Failed to load pre-authorization data');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluatePreauth = async () => {
    try {
      const claimData = {
        diagnosis_codes: newPreauth.diagnosis_codes.split(',').map(code => code.trim()),
        treatment_type: newPreauth.treatment_type,
        provider_id: newPreauth.provider_id,
        amount: parseFloat(newPreauth.amount),
        patient_age: parseInt(newPreauth.patient_age),
        prior_auth_number: newPreauth.prior_auth_number || undefined
      };

      const result = await payorAPI.evaluatePreAuth(claimData, newPreauth.policy_number);
      setEvaluationResult(result);
      
      // Refresh the preauth list
      fetchData();
    } catch (err) {
      setError('Failed to evaluate pre-authorization');
    }
  };

  const handleInputChange = (field, value) => {
    setNewPreauth(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'denied':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      approved: 'default',
      denied: 'destructive',
      pending: 'secondary'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading pre-authorization data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pre-Authorization Center</h2>
          <p className="text-gray-600">Manage and evaluate pre-authorization requests</p>
        </div>
        <Button onClick={() => setShowNewPreauth(!showNewPreauth)}>
          <Plus className="h-4 w-4 mr-2" />
          New Pre-Auth Evaluation
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showNewPreauth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Evaluate Pre-Authorization
            </CardTitle>
            <CardDescription>
              Enter claim details to evaluate against policy conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient_name">Patient Name</Label>
                <Input
                  id="patient_name"
                  value={newPreauth.patient_name}
                  onChange={(e) => handleInputChange('patient_name', e.target.value)}
                  placeholder="Enter patient name"
                />
              </div>
              
              <div>
                <Label htmlFor="patient_age">Patient Age</Label>
                <Input
                  id="patient_age"
                  type="number"
                  value={newPreauth.patient_age}
                  onChange={(e) => handleInputChange('patient_age', e.target.value)}
                  placeholder="Enter patient age"
                />
              </div>

              <div>
                <Label htmlFor="diagnosis_codes">Diagnosis Codes (comma-separated)</Label>
                <Input
                  id="diagnosis_codes"
                  value={newPreauth.diagnosis_codes}
                  onChange={(e) => handleInputChange('diagnosis_codes', e.target.value)}
                  placeholder="e.g., Z00.00, I10"
                />
              </div>

              <div>
                <Label htmlFor="treatment_type">Treatment Type</Label>
                <Input
                  id="treatment_type"
                  value={newPreauth.treatment_type}
                  onChange={(e) => handleInputChange('treatment_type', e.target.value)}
                  placeholder="e.g., routine checkup"
                />
              </div>

              <div>
                <Label htmlFor="provider_id">Provider ID</Label>
                <Input
                  id="provider_id"
                  value={newPreauth.provider_id}
                  onChange={(e) => handleInputChange('provider_id', e.target.value)}
                  placeholder="e.g., PROV-001"
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newPreauth.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="Enter claim amount"
                />
              </div>

              <div>
                <Label htmlFor="policy_number">Policy Number</Label>
                <Select onValueChange={(value) => handleInputChange('policy_number', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies.map((policy) => (
                      <SelectItem key={policy.policy_number} value={policy.policy_number}>
                        {policy.policy_name} ({policy.policy_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prior_auth_number">Prior Auth Number (optional)</Label>
                <Input
                  id="prior_auth_number"
                  value={newPreauth.prior_auth_number}
                  onChange={(e) => handleInputChange('prior_auth_number', e.target.value)}
                  placeholder="Enter if available"
                />
              </div>
            </div>

            <Button onClick={handleEvaluatePreauth} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Evaluate Pre-Authorization
            </Button>

            {evaluationResult && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(evaluationResult.evaluation.status)}
                    Evaluation Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      {getStatusBadge(evaluationResult.evaluation.status)}
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium">Reason:</span>
                      <p className="text-sm text-gray-600 mt-1">{evaluationResult.evaluation.reason}</p>
                    </div>

                    {evaluationResult.evaluation.conditions_met.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Conditions Met:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {evaluationResult.evaluation.conditions_met.map((condition, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {condition.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {evaluationResult.evaluation.conditions_failed.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Conditions Failed:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {evaluationResult.evaluation.conditions_failed.map((condition, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {condition.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Request ID: {evaluationResult.request_id}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        <h3 className="text-lg font-medium">Recent Pre-Authorization Requests</h3>
        
        {preauths.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pre-Authorization Requests</h3>
              <p className="text-gray-600">
                No pre-authorization requests found for your payor account.
              </p>
            </CardContent>
          </Card>
        ) : (
          preauths.map((preauth, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{preauth.request_id}</span>
                      {getStatusBadge(preauth.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Policy: {preauth.policy_number} • 
                      Requested: {new Date(preauth.requested_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PreAuthorizationCenter;