import { authAPI } from './api.js';

class AuthService {
  async signUp(userData) {
    try {
      const response = await authAPI.signUp(userData);
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
        message: 'Account created successfully. Please check your email for verification.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Sign up failed'
      };
    }
  }

  async signIn(email, password) {
    try {
      const response = await authAPI.signIn({ email, password });
      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Sign in failed'
      };
    }
  }

  async googleSignIn(idToken) {
    try {
      const response = await authAPI.googleSignIn(idToken);
      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Google sign in failed'
      };
    }
  }

  async appleSignIn(identityToken) {
    try {
      const response = await authAPI.appleSignIn(identityToken);
      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Apple sign in failed'
      };
    }
  }

  async requestPasswordReset(email) {
    try {
      await authAPI.requestPasswordReset(email);
      return {
        success: true,
        message: 'Password reset instructions sent to your email'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Password reset request failed'
      };
    }
  }

  async resetPassword(email, token, newPassword) {
    try {
      await authAPI.resetPassword(email, token, newPassword);
      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Password reset failed'
      };
    }
  }

  async verifyEmail(email, token) {
    try {
      const response = await authAPI.verifyEmail(email, token);
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
        message: 'Email verified successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Email verification failed'
      };
    }
  }

  async resendVerification(email) {
    try {
      await authAPI.resendVerification(email);
      return {
        success: true,
        message: 'Verification email sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to resend verification email'
      };
    }
  }

  async getFirebaseToken() {
    try {
      const response = await authAPI.getFirebaseToken();
      return {
        success: true,
        token: response.data.token
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to get Firebase token'
      };
    }
  }

  async logout() {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  }

  async getCurrentUser() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      throw new Error('No authentication data found');
    }
    
    try {
      const user = JSON.parse(userData);
      return user;
    } catch (err) {
      console.error('Error parsing user data:', err);
      throw new Error('Invalid user data');
    }
  }
}

export const authService = new AuthService();
