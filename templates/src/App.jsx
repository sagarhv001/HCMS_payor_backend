import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import payorAPI from './services/payorAPI';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastProvider } from './contexts/ToastContext';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = (userType, identifier, payorData = null) => {
    // Set user with type and basic info
    if (userType === 'payor' && payorData) {
      // Use the actual payor data from authentication response
      setUser({
        type: userType,
        email: payorData.email,
        name: payorData.name,
        payor_id: payorData.payor_id,
        contact_info: payorData.contact_info,
        authenticated: true
      });
    } else {
      // For patient/provider, use simple logic
      setUser({
        type: userType,
        email: identifier,
        name: identifier.split('@')[0]
      });
    }
  };

  // Check for existing authentication on app load
  useEffect(() => {
    const checkExistingAuth = () => {
      if (payorAPI.isAuthenticated()) {
        const storedUser = payorAPI.getStoredUser();
        if (storedUser) {
          setUser({
            type: 'payor',
            email: storedUser.email,
            name: storedUser.name,
            payor_id: storedUser.payor_id,
            contact_info: storedUser.contact_info,
            authenticated: true
          });
        }
      }
      setLoading(false);
    };

    checkExistingAuth();
  }, []);

  const handleLogout = () => {
    payorAPI.clearAuth();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading HCMS Payor Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <ToastProvider>
      <NotificationProvider>
        <Dashboard user={user} onLogout={handleLogout} />
      </NotificationProvider>
    </ToastProvider>
  );
}
