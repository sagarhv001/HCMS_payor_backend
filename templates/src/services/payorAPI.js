/**
 * API Service for HCMS Payor Backend
 * Handles all HTTP requests to the Django REST API
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

class PayorAPIService {
  /**
   * Generic request handler with error handling
   */
  constructor() {
    this.payorAuth = {};
    this.accessToken = localStorage.getItem('payor_access_token');
    this.refreshToken = localStorage.getItem('payor_refresh_token');
    
    // If we have a stored access token, set up authentication
    if (this.accessToken) {
      this.setJWTAuth(this.accessToken);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...this.payorAuth,
        ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('[payorAPI.request] Called with:', { url, config });

    try {
      const response = await fetch(url, config);
      console.log('[payorAPI.request] Response received:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok,
        headers: [...response.headers.entries()]
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[payorAPI.request] Response not ok:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[payorAPI.request] Data parsed:', data);
      return data;
    } catch (error) {
      console.error('[payorAPI.request] Failed:', error);
      throw error;
    }
  }

  /**
   * Get paginated list of claims
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @param {string} priority - Filter by priority (optional)
   * @param {string} status - Filter by status (optional)
   */
  async getClaims(page = 1, limit = 20, priority = null, status = null) {
    let endpoint = `/claims/?page=${page}&limit=${limit}`;
    
    if (priority && priority !== 'all') {
      endpoint += `&priority=${priority}`;
    }
    
    if (status && status !== 'all') {
      endpoint += `&status=${status}`;
    }
    
    return await this.request(endpoint);
  }

  /**
   * Get specific claim by ID
   * @param {string} claimId - Claim ID
   */
  async getClaim(claimId) {
    return await this.request(`/claims/${claimId}/`);
  }

  /**
   * Update claim status
   * @param {string} claimId - Claim ID
   * @param {string} status - New status (approved, denied, processing)
   * @param {string} notes - Optional notes
   * @param {number} approvedAmount - Approved amount (for approved claims)
   */
  async updateClaimStatus(claimId, status, notes = null, approvedAmount = null) {
    const payload = { status };
    
    if (notes) {
      payload.notes = notes;
    }
    
    if (approvedAmount !== null) {
      payload.approved_amount = approvedAmount.toString();
    }

    return await this.request(`/claims/${claimId}/status/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get latest analytics data
   */
  async getAnalytics() {
    return await this.request('/analytics/');
  }

  /**
   * Get claims summary (counts by status/priority)
   */
  async getClaimsSummary() {
    return await this.request('/claims/summary/');
  }

  /**
   * Get pre-authorization requests
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   */
  async getPreAuthRequests(page = 1, limit = 20) {
    return await this.request(`/pre-auth/?page=${page}&limit=${limit}`);
  }

  /**
   * Search claims by term
   * @param {string} searchTerm - Search term
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   */
  async searchClaims(searchTerm, page = 1, limit = 20) {
    return await this.request(`/claims/?search=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`);
  }

  // HIPAA-compliant Payor Authentication Methods

  /**
   * Authenticate payor with credentials
   * @param {string} email - Payor email address
   * @param {string} password - Payor password
   */
  async authenticatePayor(email, password) {
    console.log('payorAPI.authenticatePayor called with:', { email, password: '***' });
    try {
      const result = await this.request('/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      console.log('payorAPI.authenticatePayor success:', result);
      
      // Store JWT tokens and user data for persistent authentication
      if (result.access_token) {
        this.storeTokens(result);
        this.storeUserData({
          payor_id: result.payor_id,
          email: result.email,
          name: result.name,
          organization: result.organization,
          contact_info: result.contact_info
        });
      }
      
      return result;
    } catch (error) {
      console.error('payorAPI.authenticatePayor error:', error);
      throw error;
    }
  }

  /**
   * Set JWT authentication token
   * @param {string} accessToken - JWT access token
   */
  setJWTAuth(accessToken) {
    this.accessToken = accessToken;
    localStorage.setItem('payor_access_token', accessToken);
  }

  /**
   * Set payor authentication headers for subsequent requests (fallback)
   * @param {string} email - Payor email address
   * @param {string} password - Payor password
   */
  setPayorAuth(email, password) {
    this.payorAuth = {
      'X-Payor-Email': email,
      'X-Payor-Password': password,
    };
  }

  /**
   * Store JWT tokens from authentication response
   * @param {Object} authResponse - Authentication response with tokens
   */
  storeTokens(authResponse) {
    if (authResponse.access_token) {
      this.accessToken = authResponse.access_token;
      localStorage.setItem('payor_access_token', authResponse.access_token);
    }
    if (authResponse.refresh_token) {
      this.refreshToken = authResponse.refresh_token;
      localStorage.setItem('payor_refresh_token', authResponse.refresh_token);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.accessToken && !!localStorage.getItem('payor_access_token');
  }

  /**
   * Get stored user data
   */
  getStoredUser() {
    const userData = localStorage.getItem('payor_user_data');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Store user data
   */
  storeUserData(userData) {
    localStorage.setItem('payor_user_data', JSON.stringify(userData));
  }

  /**
   * Clear all authentication data
   */
  clearAuth() {
    this.accessToken = null;
    this.refreshToken = null;
    this.payorAuth = {};
    localStorage.removeItem('payor_access_token');
    localStorage.removeItem('payor_refresh_token');
    localStorage.removeItem('payor_user_data');
  }



  // Insurance Policy Methods

  /**
   * Get insurance policies (filtered by authenticated payor)
   */
  async getInsurancePolicies() {
    console.log('[payorAPI.getInsurancePolicies] Called');
    const result = await this.request('/policies/');
    console.log('[payorAPI.getInsurancePolicies] Response:', result);
    return result;
  }

  /**
   * Evaluate pre-authorization for a claim
   * @param {Object} claimData - Claim data for evaluation
   * @param {string} policyNumber - Policy number to evaluate against
   * @param {Object} payorCredentials - Payor credentials (optional)
   */
  async evaluatePreAuth(claimData, policyNumber, payorCredentials = null) {
    const requestData = {
      claim_data: claimData,
      policy_number: policyNumber,
    };

    if (payorCredentials) {
      requestData.payor_credentials = payorCredentials;
    }

    return await this.request('/pre-auth/evaluate/', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // Enhanced Claims Methods with Payor Authentication

  /**
   * Get claims with payor authentication
   * All existing getClaims calls will now automatically filter by authenticated payor
   */
  async getClaimsSecure(page = 1, limit = 20, priority = null, status = null) {
    return await this.getClaims(page, limit, priority, status);
  }

  /**
   * Get analytics with payor authentication
   * All analytics will be filtered by authenticated payor
   */
  async getAnalyticsSecure() {
    return await this.getAnalytics();
  }

  /**
   * Get pre-auth requests with payor authentication
   * All pre-auth requests will be filtered by authenticated payor
   */
  async getPreAuthRequestsSecure(page = 1, limit = 20) {
    return await this.getPreAuthRequests(page, limit);
  }
}

// Export singleton instance
export default new PayorAPIService();