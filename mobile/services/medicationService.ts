import api from './api';
import { userService } from './userService';
import { cacheService, CACHE_KEYS } from './cacheService';

// Types
export interface Medication {
  id: string;
  patientId: string;
  prescribedBy?: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  prescriber?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  takenAt: string;
  status: 'taken' | 'skipped' | 'missed';
  notes?: string;
  createdAt: string;
}

export interface MedicationReminder {
  id: string;
  medicationId: string;
  remindAt: string;
  sent: boolean;
  sentAt?: string;
  message?: string;
  createdAt: string;
}

export interface MedicationAdherence {
  period: string;
  totalLogs: number;
  taken: number;
  skipped: number;
  missed: number;
  adherenceRate: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    medications: T[];
    pagination: Pagination;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Query parameters
export interface MedicationQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface LogQueryParams {
  page?: number;
  limit?: number;
  status?: 'taken' | 'skipped' | 'missed';
  startDate?: string;
  endDate?: string;
}

class MedicationService {
  private readonly baseUrl = '/api/v0/medications';

  /**
   * Invalidate medication-related caches after data changes
   */
  private async invalidateMedicationCaches(medicationId?: string): Promise<void> {
    const invalidationPromises = [
      // Always invalidate main medications list
      cacheService.delete(CACHE_KEYS.MEDICATIONS),
      // Always invalidate upcoming reminders
      cacheService.delete(CACHE_KEYS.UPCOMING_REMINDERS),
      // Always invalidate overall adherence stats
      cacheService.invalidatePattern('overall_adherence'),
    ];

    // If specific medication ID provided, invalidate its related caches
    if (medicationId) {
      invalidationPromises.push(
        cacheService.delete(CACHE_KEYS.MEDICATION_DETAILS(medicationId)),
        cacheService.invalidatePattern(`medication_logs_${medicationId}`),
        cacheService.invalidatePattern(`medication_adherence_${medicationId}`),
        cacheService.invalidatePattern(`medication_reminders_${medicationId}`)
      );
    }

    await Promise.all(invalidationPromises);
  }

  /**
   * Get all medications for a patient
   */
  async getMedications(patientId: string, params?: MedicationQueryParams): Promise<PaginatedResponse<Medication>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const url = `${this.baseUrl}/${patientId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Medication API URL:', url);
    console.log('Patient ID:', patientId);
    
    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get current user's medications (for patients)
   */
  async getMyMedications(params?: MedicationQueryParams): Promise<Medication[]> {
    // Get the current user from AsyncStorage
    const currentUser = await userService.getStoredUser();
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }
    
    // Debug logging to check user data
    console.log('=== MEDICATION SERVICE DEBUG ===');
    console.log('Current user:', JSON.stringify(currentUser, null, 2));
    console.log('User ID:', currentUser.userId);
    console.log('User role:', currentUser.role);
    
    // Check auth token
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('authToken');
    console.log('Auth token present:', !!token);
    console.log('Token length:', token?.length || 0);
    
    if (!currentUser.userId) {
      throw new Error('User ID not found in stored user data');
    }
    
    try {
      const response = await this.getMedications(currentUser.userId, params);
      // Backend returns data.medications with nested structure
      const medicationList = response.data.medications || [];
      
      // Transform the nested structure to flat structure
      return medicationList.map((item: any) => ({
        ...item.medication,
        prescriber: item.prescriber
      }));
    } catch (error: any) {
      console.error('=== MEDICATION API ERROR ===');
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.error || error.message);
      console.error('Full error response:', error.response?.data);
      throw error;
    }
  }

  /**
   * Get a single medication by ID
   */
  async getMedicationById(medicationId: string): Promise<ApiResponse<Medication>> {
    const response = await api.get(`${this.baseUrl}/details/${medicationId}`);
    
    // Transform the nested structure to flat structure
    if (response.data.success && response.data.data) {
      const medicationData = response.data.data;
      return {
        ...response.data,
        data: {
          ...medicationData.medication,
          prescriber: medicationData.prescriber
        }
      };
    }
    
    return response.data;
  }

  /**
   * Create a new medication (doctors only)
   */
  async createMedication(medicationData: {
    patientId: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    instructions?: string;
  }): Promise<ApiResponse<Medication>> {
    const response = await api.post(this.baseUrl, medicationData);
    
    // Invalidate caches after creating new medication
    await this.invalidateMedicationCaches();
    
    return response.data;
  }

  /**
   * Update a medication
   */
  async updateMedication(medicationId: string, updateData: Partial<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string;
    instructions: string;
    isActive: boolean;
  }>): Promise<ApiResponse<Medication>> {
    const response = await api.put(`${this.baseUrl}/${medicationId}`, updateData);
    
    // Invalidate caches after updating medication
    await this.invalidateMedicationCaches(medicationId);
    
    return response.data;
  }

  /**
   * Delete a medication
   */
  async deleteMedication(medicationId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`${this.baseUrl}/${medicationId}`);
    
    // Invalidate caches after deleting medication
    await this.invalidateMedicationCaches(medicationId);
    
    return response.data;
  }

  /**
   * Log medication intake
   */
  async logMedicationIntake(medicationId: string, logData: {
    status: 'taken' | 'skipped' | 'missed';
    takenAt?: string;
    notes?: string;
  }): Promise<ApiResponse<MedicationLog>> {
    const response = await api.post(`${this.baseUrl}/${medicationId}/logs`, logData);
    
    // Invalidate related caches to update UI
    await this.invalidateMedicationCaches(medicationId);
    
    return response.data;
  }

  /**
   * Get medication logs
   */
  async getMedicationLogs(medicationId: string, params?: LogQueryParams): Promise<PaginatedResponse<MedicationLog>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const url = `${this.baseUrl}/${medicationId}/logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get medication reminders
   */
  async getMedicationReminders(medicationId: string, sent?: boolean): Promise<PaginatedResponse<MedicationReminder>> {
    const queryParams = new URLSearchParams();
    if (sent !== undefined) queryParams.append('sent', sent.toString());

    const url = `${this.baseUrl}/${medicationId}/reminders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get medication adherence statistics
   */
  async getMedicationAdherence(medicationId: string, days: number = 30): Promise<ApiResponse<MedicationAdherence>> {
    const response = await api.get(`${this.baseUrl}/${medicationId}/adherence?days=${days}`);
    return response.data;
  }

  /**
   * Get upcoming reminders for current user
   */
  async getUpcomingReminders(): Promise<MedicationReminder[]> {
    try {
      const medications = await this.getMyMedications({ isActive: true });
      const upcomingReminders: MedicationReminder[] = [];

      // Get reminders for each active medication
      for (const medication of medications) {
        try {
          const remindersResponse = await this.getMedicationReminders(medication.id, false);
          const reminders = remindersResponse.data.medications || [];
          
          // Filter for upcoming reminders (next 24 hours)
          const now = new Date();
          const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          
          const upcomingForMed = reminders.filter((reminder: MedicationReminder) => {
            const remindTime = new Date(reminder.remindAt);
            return remindTime > now && remindTime <= tomorrow;
          });

          upcomingReminders.push(...upcomingForMed);
        } catch (error) {
          console.warn(`Failed to get reminders for medication ${medication.id}:`, error);
        }
      }

      // Sort by reminder time
      return upcomingReminders.sort((a, b) => 
        new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get upcoming reminders:', error);
      return [];
    }
  }

  /**
   * Get medication adherence summary for all medications
   */
  async getOverallAdherence(days: number = 30): Promise<{
    totalMedications: number;
    averageAdherence: number;
    totalLogs: number;
    taken: number;
    skipped: number;
    missed: number;
  }> {
    try {
      const medications = await this.getMyMedications({ isActive: true });
      
      if (medications.length === 0) {
        return {
          totalMedications: 0,
          averageAdherence: 0,
          totalLogs: 0,
          taken: 0,
          skipped: 0,
          missed: 0,
        };
      }

      let totalAdherence = 0;
      let totalLogs = 0;
      let totalTaken = 0;
      let totalSkipped = 0;
      let totalMissed = 0;
      let medicationsWithData = 0;

      for (const medication of medications) {
        try {
          const adherenceResponse = await this.getMedicationAdherence(medication.id, days);
          const adherence = adherenceResponse.data;
          
          if (adherence.totalLogs > 0) {
            totalAdherence += adherence.adherenceRate;
            medicationsWithData++;
          }
          
          totalLogs += adherence.totalLogs;
          totalTaken += adherence.taken;
          totalSkipped += adherence.skipped;
          totalMissed += adherence.missed;
        } catch (error) {
          console.warn(`Failed to get adherence for medication ${medication.id}:`, error);
        }
      }

      const averageAdherence = medicationsWithData > 0 ? totalAdherence / medicationsWithData : 0;

      return {
        totalMedications: medications.length,
        averageAdherence: Math.round(averageAdherence * 100) / 100,
        totalLogs,
        taken: totalTaken,
        skipped: totalSkipped,
        missed: totalMissed,
      };
    } catch (error) {
      console.error('Failed to get overall adherence:', error);
      return {
        totalMedications: 0,
        averageAdherence: 0,
        totalLogs: 0,
        taken: 0,
        skipped: 0,
        missed: 0,
      };
    }
  }
}

export const medicationService = new MedicationService();
