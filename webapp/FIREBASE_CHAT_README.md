# Firebase Realtime Chat Implementation

This document describes the Firebase realtime chat implementation for the Hospital Management System webapp, which mirrors the functionality from the mobile app.

## Overview

The webapp includes a Firebase realtime chat system for **doctors only** that allows:
- Real-time messaging between doctors and their patients
- File and image sharing
- Message status tracking (sent, delivered, read)
- Chat room management
- Cross-platform compatibility with the mobile app (patients)

**Important**: This chat system is designed for confidential patient-doctor communication. Admins cannot access chat content for privacy reasons.

## Architecture

### Firebase Configuration
- **Config File**: `src/config/firebaseConfig.js`
- **Project**: Uses the same Firebase project as the mobile app
- **Services**: Firestore (database), Storage (file uploads), Auth (authentication)

### Core Components

#### 1. Firebase Chat Service (`src/services/firebaseChatService.js`)
Main service handling all Firebase operations:
- `ensureChatRoom()` - Creates or retrieves chat rooms
- `subscribeToMessages()` - Real-time message subscription
- `sendTextMessage()` - Send text messages
- `sendImageMessage()` - Send image files
- `sendFileMessage()` - Send document files
- `markMessagesRead()` - Mark messages as read
- `markMessagesDelivered()` - Mark messages as delivered

#### 2. RealtimeChat Component (`src/components/chat/RealtimeChat.jsx`)
Main chat interface component:
- Chat room list sidebar
- Real-time message display
- File upload functionality
- Message status indicators
- Responsive design

#### 3. Chat Pages
- **Admin**: `src/pages/admin/Chat.jsx` (Access restricted - shows privacy notice)
- **Doctor**: `src/pages/doctor/Chat.jsx` (Full chat functionality)
- **Patient**: Mobile app only (no webapp access)

## Features

### Real-time Messaging
- Instant message delivery using Firebase Firestore real-time listeners
- Automatic message synchronization across devices
- Offline message queuing (handled by Firebase)

### Message Types
1. **Text Messages** - Standard text communication
2. **Image Messages** - Photo sharing with preview
3. **File Messages** - Document sharing with metadata

### Message Status
- **Sent** - Message sent to Firebase
- **Delivered** - Message received by recipient
- **Read** - Message viewed by recipient

### Chat Room Management
- Automatic room creation for patient-doctor pairs
- Room ID format: `patient_{patientId}__doctor_{doctorId}`
- Support for multiple concurrent conversations
- **Privacy**: Only doctors can access their patient conversations
- **Admin Access**: Restricted to prevent unauthorized access to confidential medical communications

### File Sharing
- Image upload with automatic compression
- Document upload with file type validation
- Secure file storage in Firebase Storage
- Download links for file access

## Database Schema

### Chat Rooms Collection (`chatRooms`)
```javascript
{
  id: "patient_123__doctor_456",
  patientId: "123",
  doctorId: "456",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastMessage: "Hello doctor"
}
```

### Messages Subcollection (`chatRooms/{roomId}/messages`)
```javascript
{
  id: "message_789",
  senderId: "123",
  content: "Hello",
  type: "text", // "text" | "image" | "audio" | "file"
  imageUrl: null,
  fileUrl: null,
  fileName: null,
  fileSize: null,
  mimeType: null,
  delivered: false,
  isRead: false,
  createdAt: Timestamp
}
```

## Usage

### For Developers

#### Creating a Chat Room
```javascript
import { createPatientDoctorChat } from '../services/firebaseChatService';

const roomId = await createPatientDoctorChat(patientId, doctorId);
```

#### Sending Messages
```javascript
import { sendTextMessage, sendImageMessage } from '../services/firebaseChatService';

// Send text
await sendTextMessage(roomId, senderId, "Hello!");

// Send image
await sendImageMessage(roomId, senderId, imageFile);
```

#### Subscribing to Messages
```javascript
import { subscribeToMessages } from '../services/firebaseChatService';

const unsubscribe = subscribeToMessages(roomId, (messages) => {
  console.log('New messages:', messages);
});

// Cleanup
unsubscribe();
```

### For Users

#### Doctors (Webapp)
1. **Accessing Chat**: Navigate to the Chat section in your dashboard
2. **Starting Conversations**: Chat rooms are automatically created when needed
3. **Sending Messages**: Type in the input field and press Enter or click Send
4. **Sharing Files**: Click the paperclip icon to attach files or images
5. **Viewing Status**: Message status is shown with checkmarks (✓, ✓✓)

#### Patients (Mobile App)
- Use the mobile app for all patient-doctor communication
- No webapp access for patients

## Security

### Firebase Security Rules
The implementation relies on Firebase security rules to ensure:
- Only authenticated doctors can access their patient conversations
- Patients can only access their conversations with authorized doctors
- File uploads are restricted to authorized users
- **Confidentiality**: Patient-doctor communications are protected from unauthorized access

### Data Privacy
- Messages are stored securely in Firebase
- File uploads are protected with authentication
- User data is anonymized in chat room IDs

## Testing

### Test Component
A test component (`ChatTest.jsx`) is included for development:
- Create test chat rooms
- Send test messages
- Verify Firebase connectivity

### Manual Testing
1. Login as a doctor to test full chat functionality
2. Login as an admin to verify access restrictions
3. Create test conversations between doctors and patients
4. Send messages and test file uploads
5. Verify real-time updates
6. Test mobile app compatibility

## Mobile App Compatibility

The webapp chat system is fully compatible with the mobile app:
- Same Firebase project and configuration
- Identical database schema
- Shared chat rooms and messages
- Cross-platform real-time synchronization

## Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Check Firebase configuration
   - Verify API keys and project settings
   - Ensure proper authentication

2. **Message Not Sending**
   - Check user authentication
   - Verify Firebase permissions
   - Check network connectivity

3. **File Upload Failures**
   - Verify file size limits
   - Check file type restrictions
   - Ensure Firebase Storage rules

### Debug Information
The chat component includes debug information showing:
- User role and ID
- Authentication status
- Chat room count
- Connection status

## Future Enhancements

Potential improvements for the chat system:
- Voice messages
- Video calling integration
- Message encryption
- Chat notifications
- Message search functionality
- Chat history export
- Group chat support

## Dependencies

- `firebase` - Firebase SDK
- `react-hot-toast` - Toast notifications
- `lucide-react` - Icons
- `tailwindcss` - Styling

## Configuration

Ensure the following environment variables are set:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Support

For issues or questions regarding the Firebase chat implementation:
1. Check the Firebase console for errors
2. Review browser console logs
3. Verify Firebase security rules
4. Test with the included test component
