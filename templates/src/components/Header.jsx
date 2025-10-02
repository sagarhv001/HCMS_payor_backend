import { Shield, User, Stethoscope, LogOut, Bell, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import NotificationDropdown from './notifications/NotificationDropdown';

export default function Header({ user, onLogout }) {
  const getIcon = () => {
    switch (user.type) {
      case 'patient':
        return <User className="h-5 w-5 text-blue-600" />;
      case 'provider':
        return <Stethoscope className="h-5 w-5 text-green-600" />;
      case 'payor':
        return <Shield className="h-5 w-5 text-purple-600" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (user.type) {
      case 'patient':
        return 'Patient Portal';
      case 'provider':
        return 'Provider Dashboard';
      case 'payor':
        return 'Payor Dashboard';
      default:
        return '';
    }
  };

  const getUserColor = () => {
    switch (user.type) {
      case 'patient':
        return 'bg-blue-100 text-blue-600';
      case 'provider':
        return 'bg-green-100 text-green-600';
      case 'payor':
        return 'bg-purple-100 text-purple-600';
      default:
        return '';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl text-gray-900">HealthClaim Portal</h1>
              <p className="text-sm text-gray-500">{getTitle()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <NotificationDropdown />
          <div className="flex items-center space-x-4 px-3 py-2 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getUserColor()}`}>
                {getIcon()}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarFallback className={getUserColor()}>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="hover:bg-red-50 hover:text-red-600 rounded-xl"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
