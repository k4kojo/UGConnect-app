import React from 'react';

const UserAvatar = ({ 
  user, 
  size = "md", 
  showBorder = false, 
  className = "",
  onClick 
}) => {
  const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg"
  };

  const getInitials = (user) => {
    if (!user) return "?";
    
    const firstName = user.first_name || user.name?.split(' ')[0] || "";
    const lastName = user.last_name || user.name?.split(' ')[1] || "";
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleClick = () => {
    if (onClick) {
      onClick(user);
    }
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold ${
        showBorder ? 'border-2 border-blue-200' : ''
      } ${onClick ? 'cursor-pointer hover:bg-blue-200 transition-colors' : ''} ${className}`}
      onClick={handleClick}
    >
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={`${user.first_name} ${user.last_name}`}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        getInitials(user)
      )}
    </div>
  );
};

export default UserAvatar;
