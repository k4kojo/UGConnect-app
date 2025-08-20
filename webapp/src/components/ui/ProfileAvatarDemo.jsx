import React from 'react';
import { ProfileAvatar } from './index';

/**
 * ProfileAvatar Demo Component
 * 
 * Demonstrates various configurations and use cases of the ProfileAvatar component.
 * This component can be used for testing and showcasing the ProfileAvatar functionality.
 */
const ProfileAvatarDemo = () => {
  // Sample user data for demonstration
  const sampleUsers = [
    {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      role: 'admin'
    },
    {
      id: 2,
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      role: 'doctor'
    },
    {
      id: 3,
      first_name: 'Mike',
      last_name: 'Johnson',
      email: 'mike.johnson@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      role: 'doctor'
    },
    {
      id: 4,
      first_name: 'Sarah',
      last_name: 'Wilson',
      email: 'sarah.wilson@example.com',
      role: 'nurse'
    },
    {
      id: 5,
      first_name: 'David',
      last_name: 'Brown',
      email: 'david.brown@example.com',
      role: 'patient'
    },
    {
      id: 6,
      email: 'anonymous@example.com',
      role: 'user'
    }
  ];

  const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">ProfileAvatar Component Demo</h2>
        <p className="text-gray-600 mb-6">
          This demo showcases the ProfileAvatar component with different configurations, sizes, and user data scenarios.
        </p>
      </div>

      {/* Different Sizes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Different Sizes</h3>
        <div className="flex items-center space-x-4">
          {sizes.map((size) => (
            <div key={size} className="text-center">
              <ProfileAvatar 
                user={sampleUsers[0]} 
                size={size} 
                className="mb-2"
              />
              <span className="text-xs text-gray-600 capitalize">{size}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Different Users */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Different Users</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {sampleUsers.map((user) => (
            <div key={user.id} className="text-center">
              <ProfileAvatar 
                user={user} 
                size="lg" 
                className="mb-2"
              />
              <div className="text-sm font-medium text-gray-900">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {user.role}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* With and Without Border */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Border Options</h3>
        <div className="flex items-center space-x-8">
          <div className="text-center">
            <ProfileAvatar 
              user={sampleUsers[1]} 
              size="xl" 
              className="mb-2"
            />
            <span className="text-sm text-gray-600">Without Border</span>
          </div>
          <div className="text-center">
            <ProfileAvatar 
              user={sampleUsers[1]} 
              size="xl" 
              showBorder={true}
              className="mb-2"
            />
            <span className="text-sm text-gray-600">With Border</span>
          </div>
        </div>
      </div>

      {/* Interactive Examples */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Interactive Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Clickable Avatar</h4>
            <ProfileAvatar 
              user={sampleUsers[0]} 
              size="lg" 
              onClick={() => alert('Avatar clicked!')}
              className="mb-2"
            />
            <p className="text-sm text-gray-600">Click the avatar to see the interaction</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Profile with Image</h4>
            <ProfileAvatar 
              user={sampleUsers[1]} 
              size="lg" 
              showBorder={true}
              onClick={() => alert('Profile image clicked!')}
              className="mb-2"
            />
            <p className="text-sm text-gray-600">User with profile image</p>
          </div>
        </div>
      </div>

      {/* Edge Cases */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Edge Cases</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <ProfileAvatar 
              user={null} 
              size="md" 
              className="mb-2"
            />
            <span className="text-sm text-gray-600">No User</span>
          </div>
          
          <div className="text-center">
            <ProfileAvatar 
              user={{}} 
              size="md" 
              className="mb-2"
            />
            <span className="text-sm text-gray-600">Empty User</span>
          </div>
          
          <div className="text-center">
            <ProfileAvatar 
              user={{ email: 'test@example.com' }} 
              size="md" 
              className="mb-2"
            />
            <span className="text-sm text-gray-600">Email Only</span>
          </div>
          
          <div className="text-center">
            <ProfileAvatar 
              user={{ first_name: 'A' }} 
              size="md" 
              className="mb-2"
            />
            <span className="text-sm text-gray-600">First Name Only</span>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Examples</h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
          <pre className="text-sm overflow-x-auto">
{`// Basic usage with initials
<ProfileAvatar user={{ first_name: 'John', last_name: 'Doe' }} />

// With profile image
<ProfileAvatar 
  user={{ 
    first_name: 'Jane', 
    last_name: 'Smith', 
    profile_image: 'https://example.com/avatar.jpg' 
  }} 
/>

// Large size with border and click handler
<ProfileAvatar 
  user={user}
  size="xl"
  showBorder={true}
  onClick={() => navigate('/profile')}
/>

// Small size for header
<ProfileAvatar user={user} size="sm" />

// Medium size for user menu
<ProfileAvatar user={user} size="md" showBorder={true} />`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ProfileAvatarDemo;
