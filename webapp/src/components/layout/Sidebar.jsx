import { ChevronDown } from 'lucide-react';
import React from 'react';

const Sidebar = ({ 
  items = [],
  settingsItems = [],
  isOpen,
  onToggle,
  onItemClick,
  className = '' 
}) => {
  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } ${className}`}>
      {/* University Branding */}
      <div className="p-6 border-b border-blue-700 flex-shrink-0">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-3">
            <div className="text-blue-900 text-xl font-bold">UG</div>
          </div>
          <div className="text-white text-sm font-semibold">UNIVERSITY OF GHANA</div>
        </div>
      </div>

      {/* Navigation - Scrollable area */}
      <div className="flex-1 overflow-y-auto">
        <nav className="mt-6 px-4 pb-20">
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = item.isActive;
              return (
                <a
                  key={item.name}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onItemClick && onItemClick(item);
                  }}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              );
            })}
            
            {/* Settings with dropdown */}
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.isActive;
              return (
                <div key={item.name}>
                  <button
                    onClick={() => item.hasDropdown ? onToggle('settings') : (onItemClick && onItemClick(item))}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                    {item.hasDropdown && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${item.isOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {item.hasDropdown && item.isOpen && item.subItems && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <a 
                          key={subItem.name}
                          href={subItem.path}
                          onClick={(e) => {
                            e.preventDefault();
                            onItemClick && onItemClick(subItem);
                          }}
                          className="block px-4 py-2 text-sm text-blue-200 hover:bg-blue-700 rounded"
                        >
                          {subItem.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
