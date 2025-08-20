import React from 'react';
import { ProfileAvatar } from '../ui';

const Header = ({ 
  title = 'UNIVERSITY OF GHANA HOSPITAL MANAGEMENT SYSTEM',
  user,
  onUserMenuToggle,
  userMenuOpen,
  children 
}) => {
  return (
    <div className="bg-blue-900 text-white py-3 px-6 shadow-lg flex-shrink-0">
      <div className="flex justify-between items-center mx-auto">
        <h1 className="text-xl font-bold tracking-wide">
          {title}
        </h1>
        <div className="flex items-center space-x-4">
          {children}
          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={onUserMenuToggle}
              className="flex items-center space-x-2 cursor-pointer hover:bg-blue-800 px-3 py-2 rounded transition-colors duration-200"
            >
              <ProfileAvatar user={user} size="md" className={`${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
