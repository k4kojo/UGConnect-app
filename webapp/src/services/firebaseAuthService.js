import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../config/firebaseConfig.js';
import { authAPI } from './api.js';

class FirebaseAuthService {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
  }

  async authenticateWithBackend(user) {
    try {
      console.log('Authenticating with Firebase for user:', user.userId);
      
      // Get Firebase custom token from backend
      const response = await authAPI.getFirebaseToken();
      const { customToken } = response.data;
      
      console.log('Received Firebase custom token');
      
      // Sign in to Firebase with custom token
      const userCredential = await signInWithCustomToken(auth, customToken);
      
      console.log('Successfully authenticated with Firebase:', userCredential.user.uid);
      
      this.isAuthenticated = true;
      this.currentUser = userCredential.user;
      
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      console.error('Error authenticating with Firebase:', error);
      this.isAuthenticated = false;
      this.currentUser = null;
      
      let errorMessage = 'Failed to authenticate with Firebase';
      
      // Provide more specific error messages
      if (error.response?.status === 500) {
        errorMessage = 'Firebase Admin not configured on backend. Please contact administrator.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication token expired. Please login again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async signOut() {
    try {
      await auth.signOut();
      this.isAuthenticated = false;
      this.currentUser = null;
      console.log('Signed out from Firebase');
    } catch (error) {
      console.error('Error signing out from Firebase:', error);
    }
  }

  getFirebaseUser() {
    return this.currentUser;
  }

  isFirebaseAuthenticated() {
    return this.isAuthenticated && this.currentUser;
  }
}

export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
