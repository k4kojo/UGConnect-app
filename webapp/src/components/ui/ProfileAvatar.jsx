import React from 'react';

/**
 * ProfileAvatar Component
 * 
 * A reusable component that displays a user's profile image or their initials as a fallback.
 * Supports multiple sizes, customizable colors, and click handlers.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - User object containing profile information
 * @param {string} [props.user.first_name] - User's first name
 * @param {string} [props.user.last_name] - User's last name
 * @param {string} [props.user.firstName] - Alternative first name property
 * @param {string} [props.user.lastName] - Alternative last name property
 * @param {string} [props.user.email] - User's email address
 * @param {string} [props.user.profile_image] - URL to user's profile image
 * @param {string} [props.user.avatar] - Alternative avatar URL property
 * @param {string} [props.user.image] - Alternative image URL property
 * @param {string} [props.size='md'] - Size of the avatar (xs, sm, md, lg, xl, 2xl, 3xl)
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.showBorder=false] - Whether to show a white border around the avatar
 * @param {Function} [props.onClick] - Click handler function
 * 
 * @example
 * // Basic usage with initials
 * <ProfileAvatar user={{ first_name: 'John', last_name: 'Doe' }} />
 * 
 * // With profile image
 * <ProfileAvatar 
 *   user={{ 
 *     first_name: 'Jane', 
 *     last_name: 'Smith', 
 *     profile_image: 'https://example.com/avatar.jpg' 
 *   }} 
 * />
 * 
 * // Large size with border and click handler
 * <ProfileAvatar 
 *   user={user}
 *   size="xl"
 *   showBorder={true}
 *   onClick={() => navigate('/profile')}
 * />
 * 
 * @returns {JSX.Element} ProfileAvatar component
 */
const ProfileAvatar = ({
  user,
  size = 'md',
  className = '',
  showBorder = false,
  onClick
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
    '3xl': 'w-24 h-24 text-2xl'
  };

  /**
   * Generates initials from user's name
   * @param {Object} user - User object
   * @returns {string} User's initials
   */
  const getInitials = (user) => {
    if (!user) return '?';
    
    const firstName = user.first_name || user.firstName || '';
    const lastName = user.last_name || user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return '?';
  };

  /**
   * Generates a consistent background color based on user's name
   * @param {Object} user - User object
   * @returns {string} CSS class for background color
   */
  const getBackgroundColor = (user) => {
    if (!user) return 'bg-gray-500';
    
    const name = (user.first_name || user.firstName || user.email || 'user').toLowerCase();
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    // Simple hash function to get consistent color for same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const hasProfileImage = user?.profile_image || user?.avatar || user?.image;

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        ${showBorder ? 'ring-2 ring-white ring-offset-2' : ''}
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        ${className}
      `}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {hasProfileImage ? (
        <img
          src={user.profile_image || user.avatar || user.image}
          alt={`${user.first_name || user.firstName || 'User'} profile`}
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : (      
      <div
        className={`
          w-full h-full rounded-full flex items-center justify-center font-semibold text-white
          ${getBackgroundColor(user)}
          ${hasProfileImage ? 'hidden' : 'flex'}
        `}
        style={{ display: hasProfileImage ? 'none' : 'flex' }}
      >
        {getInitials(user)}
      </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
