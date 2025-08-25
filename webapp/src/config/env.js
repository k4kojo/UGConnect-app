// Environment configuration for the webapp
const config = {
	// API Configuration
	API_URL: 'http://localhost:5500/api/v0',
	
	// Firebase Configuration (if needed for chat/notifications)
	FIREBASE: {
		API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
		AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
		PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
		STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
		MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
		APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
	},
	
	// OAuth Configuration
	GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
	APPLE_CLIENT_ID: import.meta.env.VITE_APPLE_CLIENT_ID,
	
	// Environment
	NODE_ENV: import.meta.env.MODE || 'development',
	
	// Feature flags
	FEATURES: {
		CHAT_ENABLED: true,
		NOTIFICATIONS_ENABLED: true,
		VIDEO_CALLS_ENABLED: true,
		PAYMENTS_ENABLED: true,
	},
	
	// App settings
	APP: {
		NAME: 'Hospital Management System',
		VERSION: '1.0.0',
		DESCRIPTION: 'Modern React-based Hospital Management System',
	},
};

export default config;
