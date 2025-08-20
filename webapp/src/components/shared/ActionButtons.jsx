import { Download, Edit, Eye, Play, Plus, Printer, Send, Trash2 } from 'lucide-react';
import React from 'react';

const ActionButtons = ({ 
  actions = [], 
  size = "sm", 
  className = "" 
}) => {
  const getIcon = (actionType) => {
    const icons = {
      view: Eye,
      edit: Edit,
      delete: Trash2,
      download: Download,
      print: Printer,
      send: Send,
      start: Play,
      add: Plus
    };
    return icons[actionType] || Eye;
  };

  const getColor = (actionType) => {
    const colors = {
      view: "text-blue-600 hover:text-blue-900",
      edit: "text-gray-600 hover:text-gray-900",
      delete: "text-red-600 hover:text-red-900",
      download: "text-gray-600 hover:text-gray-900",
      print: "text-gray-600 hover:text-gray-900",
      send: "text-green-600 hover:text-green-900",
      start: "text-green-600 hover:text-green-900",
      add: "text-blue-600 hover:text-blue-900"
    };
    return colors[actionType] || "text-gray-600 hover:text-gray-900";
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {actions.map((action, index) => {
        const Icon = getIcon(action.type);
        const colorClass = getColor(action.type);
        
        return (
          <button
            key={index}
            onClick={() => action.onClick && action.onClick(action.data)}
            className={`${colorClass} transition-colors duration-200`}
            title={action.tooltip || action.label}
            disabled={action.disabled}
          >
            <Icon className={`h-4 w-4 ${size === "lg" ? "h-5 w-5" : ""}`} />
          </button>
        );
      })}
    </div>
  );
};

export default ActionButtons;
