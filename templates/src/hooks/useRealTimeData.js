import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useToast } from '../contexts/ToastContext';
import payorAPI from '../services/payorAPI';

export const useRealTimeData = (payor) => {
  const [claims, setClaims] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  
  const { addNotification } = useNotification();
  const { addToast } = useToast();

  // Fetch all data
  const fetchData = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      setError(null);
      
      const [claimsData, analyticsData, summaryData] = await Promise.allSettled([
        payorAPI.getClaims(1, 20),
        payorAPI.getAnalytics(),
        payorAPI.getClaimsSummary()
      ]);
      
      // Handle claims data
      if (claimsData.status === 'fulfilled') {
        const newClaims = claimsData.value.results || [];
        
        // Check for new claims if this isn't the initial load
        if (!isInitialLoad && claims.length > 0) {
          const previousClaimIds = new Set(claims.map(c => c.claim_id));
          const newClaimsList = newClaims.filter(c => !previousClaimIds.has(c.claim_id));
          
          // Add notifications for new claims
          newClaimsList.forEach(claim => {
            addNotification({
              type: 'claim',
              title: 'New Claim Received',
              message: `Claim ${claim.claim_id} from ${claim.patient?.name || 'Unknown Patient'} - $${claim.amount}`,
              data: { claimId: claim.claim_id }
            });
          });
          
          // Add notifications for status changes
          newClaims.forEach(newClaim => {
            const oldClaim = claims.find(c => c.claim_id === newClaim.claim_id);
            if (oldClaim && oldClaim.status !== newClaim.status) {
              let notificationType = 'claim';
              let title = 'Claim Status Updated';
              
              if (newClaim.status === 'approved') {
                notificationType = 'approval';
                title = 'Claim Approved';
              } else if (newClaim.status === 'denied') {
                notificationType = 'warning';
                title = 'Claim Denied';
              }
              
              addNotification({
                type: notificationType,
                title,
                message: `Claim ${newClaim.claim_id} status changed to ${newClaim.status}`,
                data: { claimId: newClaim.claim_id }
              });
            }
          });
        }
        
        setClaims(newClaims);
      } else {
        console.warn('Failed to load claims:', claimsData.reason);
      }
      
      // Handle analytics data
      if (analyticsData.status === 'fulfilled') {
        setAnalytics(analyticsData.value);
      } else {
        console.warn('Failed to load analytics:', analyticsData.reason);
      }
      
      // Handle summary data
      if (summaryData.status === 'fulfilled') {
        setSummary(summaryData.value);
      } else {
        console.warn('Failed to load summary:', summaryData.reason);
      }
      
      setLastFetchTime(new Date());
      
      // Show success toast for manual refreshes (not initial load or automatic polls)
      if (!isInitialLoad && window._manualRefresh) {
        addToast({
          type: 'success',
          title: 'Data Updated',
          message: 'Dashboard data has been refreshed successfully'
        });
        window._manualRefresh = false;
      }
      
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard data fetch error:', err);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  }, [claims, addNotification, addToast]);

  // Initial data fetch
  useEffect(() => {
    if (payor) {
      fetchData(true);
    }
  }, [payor]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!payor) return;

    // Poll every 30 seconds for new data
    const pollInterval = setInterval(() => {
      fetchData(false);
    }, 30000);

    // Also set up a more frequent check for critical updates
    const criticalInterval = setInterval(() => {
      // Only fetch claims for critical updates to reduce load
      payorAPI.getClaims(1, 5).then(data => {
        const latestClaims = data.results || [];
        if (latestClaims.length > 0 && claims.length > 0) {
          const latestClaim = latestClaims[0];
          const currentLatest = claims[0];
          
          // If we have a newer claim or status change, trigger full refresh
          if (latestClaim.claim_id !== currentLatest?.claim_id || 
              latestClaim.status !== currentLatest?.status) {
            fetchData(false);
          }
        }
      }).catch(err => {
        console.warn('Critical update check failed:', err);
      });
    }, 10000); // Check every 10 seconds

    return () => {
      clearInterval(pollInterval);
      clearInterval(criticalInterval);
    };
  }, [payor, claims, fetchData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    window._manualRefresh = true;
    fetchData(false);
  }, [fetchData]);

  return {
    claims,
    analytics,
    summary,
    loading,
    error,
    lastFetchTime,
    refresh
  };
};