import React from 'react';

const PatientAvatar = ({ 
  patient, 
  size = 'md', 
  className = '' 
}) => {
  // Extract initials from patient name
  const getInitials = (name) => {
    if (!name) return 'PA'; // Default to 'PA' for Patient Avatar
    
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  // Size configurations
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  const patientName = patient?.name || 'Unknown Patient';
  const profileImage = patient?.profileImage;
  const initials = getInitials(patientName);

  // Color based on initials for consistent avatar colors
  const getAvatarColor = (initials) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-orange-500 text-white',
      'bg-red-500 text-white',
      'bg-indigo-500 text-white',
      'bg-pink-500 text-white',
      'bg-teal-500 text-white',
    ];
    
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
      hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const avatarColor = getAvatarColor(initials);

  if (profileImage) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
        <img
          src={profileImage}
          alt={`${patientName} avatar`}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div 
          className={`h-full w-full rounded-full ${avatarColor} items-center justify-center font-medium hidden`}
        >
          {initials}
        </div>
      </div>
    );
  }

  // Default to initials avatar
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full ${avatarColor} flex items-center justify-center font-medium ${className}`}
      title={patientName}
    >
      {initials}
    </div>
  );
};

export default PatientAvatar;
