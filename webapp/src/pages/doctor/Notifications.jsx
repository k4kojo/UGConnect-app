import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Info,
  MessageCircle,
  Trash2,
  User,
  Video
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, LoadingSpinner } from '../../components/ui';
import { useData } from '../../contexts/DataContext';

const DoctorNotifications = () => {
  const { data, loading, error, fetchNotifications } = useData();
  const [filter, setFilter] = useState('all');

  // Use cached notifications data or fallback to mock data
  const notifications = data.notifications || [
    {
      id: 1,
      type: 'appointment',
      title: 'New Appointment Request',
      message: 'Patient John Doe has requested an appointment for tomorrow at 2:00 PM',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: false,
      priority: 'high',
      actionUrl: '/doctor/appointments'
    },
    {
      id: 2,
      type: 'consultation',
      title: 'Consultation Reminder',
      message: 'You have a consultation with Sarah Wilson in 15 minutes',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      isRead: false,
      priority: 'high',
      actionUrl: '/doctor/consultations'
    },
    {
      id: 3,
      type: 'lab_result',
      title: 'Lab Results Available',
      message: 'Lab results for patient Michael Brown are now available for review',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: true,
      priority: 'medium',
      actionUrl: '/doctor/lab-results'
    },
    {
      id: 4,
      type: 'message',
      title: 'New Patient Message',
      message: 'Patient Emily Davis has sent you a message regarding her treatment',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      isRead: true,
      priority: 'medium',
      actionUrl: '/doctor/chat'
    },
    {
      id: 5,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      isRead: true,
      priority: 'low',
      actionUrl: null
    },
    {
      id: 6,
      type: 'follow_up',
      title: 'Patient Follow-up Due',
      message: 'Follow-up appointment with Robert Johnson is due in 2 days',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      isRead: true,
      priority: 'medium',
      actionUrl: '/doctor/appointments'
    }
  ];

  // Load notifications if not already cached
  useEffect(() => {
    if (!data.notifications) {
      fetchNotifications();
    }
  }, [data.notifications, fetchNotifications]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment': return <Calendar className="h-5 w-5" />;
      case 'consultation': return <Video className="h-5 w-5" />;
      case 'lab_result': return <FileText className="h-5 w-5" />;
      case 'message': return <MessageCircle className="h-5 w-5" />;
      case 'system': return <Info className="h-5 w-5" />;
      case 'follow_up': return <User className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'bg-red-50 border-red-200';
    if (priority === 'medium') return 'bg-yellow-50 border-yellow-200';
    if (priority === 'low') return 'bg-blue-50 border-blue-200';
    
    switch (type) {
      case 'appointment': return 'bg-green-50 border-green-200';
      case 'consultation': return 'bg-purple-50 border-purple-200';
      case 'lab_result': return 'bg-orange-50 border-orange-200';
      case 'message': return 'bg-blue-50 border-blue-200';
      case 'system': return 'bg-gray-50 border-gray-200';
      case 'follow_up': return 'bg-indigo-50 border-indigo-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  const handleMarkAsRead = (notificationId) => {
    // This operation should ideally trigger a backend update and then a force refresh of notifications
    // For now, we'll just log and let the cache refresh handle eventual consistency
    console.log('Marking notification as read:', notificationId);
    fetchNotifications(true); // Force refresh to get updated read status from backend
  };

  const handleMarkAllAsRead = () => {
    console.log('Marking all notifications as read');
    fetchNotifications(true); // Force refresh
  };

  const handleDeleteNotification = (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      console.log('Deleting notification:', notificationId);
      fetchNotifications(true); // Force refresh
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // Navigate to the action URL
      console.log('Navigate to:', notification.actionUrl);
      // window.location.href = notification.actionUrl;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return <LoadingSpinner size="2xl" text="Loading notifications..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-red-400">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Notifications</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={fetchNotifications}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with system alerts, patient messages, and reminders</p>
        </div>
        <div className="flex space-x-3">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('appointment')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'appointment'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Appointments ({notifications.filter(n => n.type === 'appointment').length})
          </button>
          <button
            onClick={() => setFilter('consultation')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'consultation'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Consultations ({notifications.filter(n => n.type === 'consultation').length})
          </button>
          <button
            onClick={() => setFilter('message')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'message'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Messages ({notifications.filter(n => n.type === 'message').length})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border ${getNotificationColor(notification.type, notification.priority)} ${
              !notification.isRead ? 'ring-2 ring-blue-200' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                <div className={`p-2 rounded-full ${
                  notification.isRead ? 'bg-gray-100' : 'bg-blue-100'
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className={`text-sm font-medium ${
                      notification.isRead ? 'text-gray-700' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimestamp(notification.timestamp)}
                    </span>
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className={`mt-1 text-sm ${
                  notification.isRead ? 'text-gray-600' : 'text-gray-700'
                }`}>
                  {notification.message}
                </p>
                
                <div className="mt-3 flex items-center space-x-3">
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {notification.actionUrl ? 'View Details' : 'Mark as Read'}
                  </button>
                  
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter !== 'all'
              ? 'Try adjusting your filters.'
              : 'You\'re all caught up! No new notifications.'
            }
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {notifications.length}
              </div>
              <div className="text-sm text-gray-500">Total Notifications</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {unreadCount}
              </div>
              <div className="text-sm text-gray-500">Unread</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.type === 'appointment' || n.type === 'consultation').length}
              </div>
              <div className="text-sm text-gray-500">Appointments</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageCircle className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.type === 'message').length}
              </div>
              <div className="text-sm text-gray-500">Messages</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorNotifications;
