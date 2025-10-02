import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Shield, Building2 } from 'lucide-react';
import payorAPI from '../../services/payorAPI';

const PayorLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await payorAPI.authenticatePayor(credentials.username, credentials.password);
      
      // Set authentication headers for future requests
      payorAPI.setPayorAuth(credentials.username, credentials.password);
      
      // Call parent callback with payor info
      onLogin(response);
      
    } catch (err) {
      setError('Invalid credentials. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const sampleCredentials = [
    { name: 'BlueCross BlueShield', username: 'bcbs_admin', password: 'bcbs_secure_2024' },
    { name: 'UnitedHealth Group', username: 'united_admin', password: 'united_secure_2024' },
    { name: 'Anthem Inc', username: 'anthem_admin', password: 'anthem_secure_2024' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">HCMS Payor Portal</h1>
          <p className="text-gray-600 mt-2">HIPAA-Compliant Healthcare Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Payor Authentication
            </CardTitle>
            <CardDescription>
              Enter your payor credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo Credentials</CardTitle>
            <CardDescription className="text-xs">
              Use these sample credentials for testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sampleCredentials.map((cred, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm text-gray-900">{cred.name}</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Username: <code className="bg-gray-200 px-1 rounded">{cred.username}</code></div>
                    <div>Password: <code className="bg-gray-200 px-1 rounded">{cred.password}</code></div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 text-xs"
                    onClick={() => setCredentials({ username: cred.username, password: cred.password })}
                  >
                    Use These Credentials
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>🔒 All data is encrypted and HIPAA-compliant</p>
          <p>Each payor can only access their own data</p>
        </div>
      </div>
    </div>
  );
};

export default PayorLogin;