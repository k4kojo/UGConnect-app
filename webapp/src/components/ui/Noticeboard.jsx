import { AlertTriangle, Bell, Calendar, Info, User } from 'lucide-react';
import React from 'react';

const Noticeboard = ({ 
  notices = [], 
  title = 'Noticeboard',
  className = '',
  onViewAll = null
}) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4 text-green-600" />;
      case 'system':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'registration':
        return <User className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment':
        return 'border-l-4 border-l-green-500 bg-green-50';
      case 'system':
        return 'border-l-4 border-l-orange-500 bg-orange-50';
      case 'registration':
        return 'border-l-4 border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-4 border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Bell className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {notices.length} notifications
          </span>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              View all
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notices.length > 0 ? (
          notices.map((notice, index) => (
            <div key={notice.id || index} className={`flex items-start space-x-3 p-4 rounded-lg ${getNotificationColor(notice.type)} hover:shadow-sm transition-shadow`}>
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notice.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">{notice.title}</h4>
                  <div className="flex items-center space-x-2">
                    {notice.time && (
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {notice.time}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{notice.date}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{notice.description}</p>
                {notice.type === 'appointment' && notice.patientName && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Patient:</span>
                    <span className="text-xs font-medium text-gray-900 bg-white px-2 py-1 rounded">
                      {notice.patientName}
                    </span>
                    {notice.status && (
                      <>
                        <span className="text-xs text-gray-500">Status:</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          notice.status === 'completed' ? 'bg-green-100 text-green-800' :
                          notice.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {notice.status}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No notifications available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Noticeboard;
