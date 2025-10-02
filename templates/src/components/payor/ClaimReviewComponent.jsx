import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CheckCircle, XCircle, Clock, DollarSign, AlertTriangle } from 'lucide-react';

/**
 * Enhanced Claim Review Component for Payor Dashboard
 * Handles detailed claim review and decision making
 */
const ClaimReviewComponent = ({ 
  claim, 
  onDecision, 
  onClose, 
  loading = false 
}) => {
  // State for decision form
  const [decision, setDecision] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [approvedAmount, setApprovedAmount] = React.useState(claim?.amount || 0);
  const [submitting, setSubmitting] = React.useState(false);

  if (!claim) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>No Claim Selected</CardTitle>
          <CardDescription>Select a claim from the list to review</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleDecisionSubmit = async () => {
    if (!decision) {
      alert('Please select a decision');
      return;
    }

    setSubmitting(true);
    try {
      const decisionData = {
        status: decision,
        notes: notes,
        approved_amount: decision === 'partially_approved' ? approvedAmount : 
                        decision === 'approved' ? claim.amount : 0
      };

      await onDecision(claim.claim_id, decisionData);
      
      // Reset form
      setDecision('');
      setNotes('');
      setApprovedAmount(claim.amount);
      
    } catch (error) {
      console.error('Decision submission failed:', error);
      alert('Failed to submit decision. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { variant: 'secondary', text: 'Pending Review', icon: Clock },
      'approved': { variant: 'success', text: 'Approved', icon: CheckCircle },
      'rejected': { variant: 'destructive', text: 'Rejected', icon: XCircle },
      'partially_approved': { variant: 'warning', text: 'Partially Approved', icon: AlertTriangle },
      'manual_review': { variant: 'warning', text: 'Manual Review Required', icon: AlertTriangle }
    };
    return statusMap[status] || { variant: 'secondary', text: status, icon: Clock };
  };

  const statusInfo = getStatusBadge(claim.status);
  const StatusIcon = statusInfo.icon;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Claim Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                Claim Review: {claim.claim_id}
                <Badge variant={statusInfo.variant}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.text}
                </Badge>
              </CardTitle>
              <CardDescription>
                Submitted: {formatDate(claim.submitted_date)}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close Review
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="font-medium">{claim.patient?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member ID</p>
                <p className="font-mono text-sm">{claim.patient?.member_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Policy Number</p>
                <p className="font-mono text-sm">{claim.patient?.policy_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact</p>
                <p className="text-sm">{claim.patient?.phone || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Information */}
        <Card>
          <CardHeader>
            <CardTitle>Provider Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Provider</p>
                <p className="font-medium">{claim.provider?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">NPI</p>
                <p className="font-mono text-sm">{claim.provider?.npi || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Provider ID</p>
                <p className="font-mono text-sm">{claim.provider?.provider_id || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
              <p className="font-medium">{claim.diagnosis?.description || 'N/A'}</p>
              {claim.diagnosis?.primary_code && (
                <p className="text-sm text-muted-foreground">Code: {claim.diagnosis.primary_code}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Treatment</p>
              <p className="font-medium">{claim.treatment?.type || 'N/A'}</p>
              {claim.treatment?.category && (
                <p className="text-sm text-muted-foreground">Category: {claim.treatment.category}</p>
              )}
            </div>
            {claim.treatment?.procedures && claim.treatment.procedures.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Procedures</p>
                <div className="space-y-1">
                  {claim.treatment.procedures.map((proc, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-mono">{proc.code}</span> - {proc.description}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requested Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(claim.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgency</p>
                <Badge variant={claim.treatment?.urgency === 'Emergency' ? 'destructive' : 'secondary'}>
                  {claim.treatment?.urgency || 'Standard'}
                </Badge>
              </div>
            </div>
            
            {claim.diagnosis?.emergency && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-medium text-red-800">Emergency Case</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pre-authorization Status */}
      {claim.preauth_status && (
        <Card>
          <CardHeader>
            <CardTitle>Pre-authorization Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant={claim.preauth_status === 'approved' ? 'success' : 'warning'}>
                {claim.preauth_status}
              </Badge>
              {claim.preauth_notes && (
                <p className="text-sm text-muted-foreground">{claim.preauth_notes}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {claim.timeline && claim.timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Claim Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {claim.timeline.map((entry, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium">{entry.action}</p>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground">{entry.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.timestamp)}
                      {entry.automated && ' (Automated)'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decision Panel */}
      {(claim.status === 'pending' || claim.preauth_status === 'manual_review') && (
        <Card>
          <CardHeader>
            <CardTitle>Make Decision</CardTitle>
            <CardDescription>
              Review the claim details above and make your decision
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Decision</label>
                <Select value={decision} onValueChange={setDecision}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select decision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve Full Amount</SelectItem>
                    <SelectItem value="partially_approved">Partial Approval</SelectItem>
                    <SelectItem value="rejected">Reject Claim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {decision === 'partially_approved' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Approved Amount</label>
                  <input
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(parseFloat(e.target.value) || 0)}
                    max={claim.amount}
                    min={0}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about your decision..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleDecisionSubmit}
                disabled={!decision || submitting}
                className="flex-1"
              >
                {submitting ? 'Processing...' : 'Submit Decision'}
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClaimReviewComponent;