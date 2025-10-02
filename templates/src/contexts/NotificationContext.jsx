import { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);

  // Add a new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setHasUnread(true);
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    
    // Check if there are still unread notifications
    setNotifications(prev => {
      const stillHasUnread = prev.some(n => !n.read && n.id !== notificationId);
      setHasUnread(stillHasUnread);
      return prev;
    });
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setHasUnread(false);
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setHasUnread(false);
  };

  // Remove specific notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setNotifications(prev => {
      const stillHasUnread = prev.some(n => !n.read);
      setHasUnread(stillHasUnread);
      return prev;
    });
  };

  // Auto-remove old notifications (older than 24 hours)
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      setNotifications(prev => {
        const filtered = prev.filter(n => n.timestamp > dayAgo);
        const stillHasUnread = filtered.some(n => !n.read);
        setHasUnread(stillHasUnread);
        return filtered;
      });
    }, 60000); // Check every minute

    return () => clearInterval(cleanup);
  }, []);

  const value = {
    notifications,
    hasUnread,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};