import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  Bell, 
  Settings, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Mail,
  Phone,
  Shield,
  Save,
  Eye,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

export default function NotificationsProfile({ user }) {
  const [activeTab, setActiveTab] = useState('notifications');
  const [profileData, setProfileData] = useState({
    firstName: user.name.split(' ')[0],
    lastName: user.name.split(' ')[1] || '',
    email: user.email,
    phone: '(555) 123-4567',
    organization: user.type === 'provider' ? 'City General Hospital' : user.type === 'payor' ? 'BlueCross Insurance' : '',
    title: user.type === 'provider' ? 'Chief Medical Officer' : user.type === 'payor' ? 'Claims Manager' : ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    claimUpdates: true,
    policyChanges: true,
    systemAlerts: true,
    marketingEmails: false
  });

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'approval',
      title: 'Claim Approved',
      message: 'Your emergency visit claim (CLM-2024-001) has been approved for $1,250. Payment will be processed within 3-5 business days.',
      timestamp: '2024-01-16T14:30:00Z',
      read: false,
      actionable: true
    },
    {
      id: 2,
      type: 'action_required',
      title: 'Documents Required',
      message: 'Additional documentation is needed for claim CLM-2024-002. Please submit lab results within 7 days to avoid processing delays.',
      timestamp: '2024-01-16T10:15:00Z',
      read: false,
      actionable: true
    },
    {
      id: 3,
      type: 'denial',
      title: 'Claim Denied',
      message: 'Claim CLM-2024-003 for cardiac consultation has been denied due to lack of prior authorization. You have the right to appeal this decision.',
      timestamp: '2024-01-15T16:45:00Z',
      read: true,
      actionable: true
    },
    {
      id: 4,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur on January 20th from 2:00 AM to 4:00 AM EST. Some services may be temporarily unavailable.',
      timestamp: '2024-01-15T09:00:00Z',
      read: true,
      actionable: false
    },
    {
      id: 5,
      type: 'policy',
      title: 'Policy Update',
      message: 'Your insurance policy has been renewed for 2024. Review your updated coverage details and benefits summary.',
      timestamp: '2024-01-14T11:30:00Z',
      read: true,
      actionable: true
    }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'approval':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'action_required':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'denial':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'system':
        return <Settings className="h-5 w-5 text-blue-600" />;
      case 'policy':
        return <Shield className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationBadge = (type) => {
    switch (type) {
      case 'approval':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'action_required':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Action Required</Badge>;
      case 'denial':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Denied</Badge>;
      case 'system':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">System</Badge>;
      case 'policy':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Policy</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Info</Badge>;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleProfileUpdate = () => {
    console.log('Profile updated:', profileData);
    // Handle profile update logic
  };

  const handleNotificationSettingsUpdate = () => {
    console.log('Notification settings updated:', notificationSettings);
    // Handle notification settings update logic
  };

  const markAsRead = (notificationId) => {
    // Handle mark as read logic
    console.log('Mark as read:', notificationId);
  };

  const deleteNotification = (notificationId) => {
    // Handle delete notification logic
    console.log('Delete notification:', notificationId);
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* ...existing code... */}
    </div>
  );
}
