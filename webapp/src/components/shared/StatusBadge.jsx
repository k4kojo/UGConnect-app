import React from 'react';

const StatusBadge = ({ status, size = "sm", className = "" }) => {
  const getStatusConfig = (status) => {
    const configs = {
      // Prescription statuses
      active: { color: "text-green-600 bg-green-100"},
      completed: { color: "text-blue-600 bg-blue-100"},
      pending: { color: "text-yellow-600 bg-yellow-100" },
      cancelled: { color: "text-red-600 bg-red-100", icon: "✗" },
      
      // Lab result statuses
      processing: { color: "text-blue-600 bg-blue-100"},
      
      // Consultation statuses
      scheduled: { color: "text-blue-600 bg-blue-100"},
      "in-progress": { color: "text-yellow-600 bg-yellow-100"},
      
      // Result statuses
      normal: { color: "text-green-600 bg-green-100"},
      high: { color: "text-red-600 bg-red-100"},
      low: { color: "text-orange-600 bg-orange-100"},
      abnormal: { color: "text-red-600 bg-red-100"},
      
      // Default
      default: { color: "text-gray-600 bg-gray-100"}
    };

    return configs[status] || configs.default;
  };

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-xs",
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-sm"
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full font-medium ${config.color} ${sizeClasses[size]} ${className}`}>
      <span className="text-xs">{config.icon}</span>
      <span className="capitalize">{status}</span>
    </span>
  );
};

export default StatusBadge;
