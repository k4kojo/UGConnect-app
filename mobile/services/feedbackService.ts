import api from './api';

export type DoctorFeedback = {
  feedbackId: string;
  doctorId: string;
  patientId: string;
  rating: number; // 1-5
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const feedbackService = {
  // Create doctor feedback
  createDoctorFeedback: async (payload: {
    doctorId: string;
    rating: number; // 1-5
    comment?: string;
  }): Promise<DoctorFeedback> => {
    const res = await api.post("/api/v0/user-feedbacks", {
      doctorId: payload.doctorId,
      rating: payload.rating,
      comment: payload.comment ?? null,
    });
    return res.data;
  },

  // Get feedbacks for a specific doctor
  getDoctorFeedbacks: async (doctorId: string): Promise<DoctorFeedback[]> => {
    const res = await api.get(`/api/v0/user-feedbacks/doctor/${doctorId}`);
    return res.data;
  },

  // Get feedbacks by current user
  getUserFeedbacks: async (): Promise<DoctorFeedback[]> => {
    const res = await api.get("/api/v0/user-feedbacks/user");
    return res.data;
  },

  // Update feedback
  updateFeedback: async (feedbackId: string, updates: {
    rating?: number;
    comment?: string;
  }): Promise<DoctorFeedback> => {
    const res = await api.put(`/api/v0/user-feedbacks/${feedbackId}`, updates);
    return res.data;
  },

  // Delete feedback
  deleteFeedback: async (feedbackId: string): Promise<void> => {
    await api.delete(`/api/v0/user-feedbacks/${feedbackId}`);
  },

  // Get feedback statistics for a doctor
  getDoctorFeedbackStats: async (doctorId: string): Promise<{
    averageRating: number;
    totalFeedbacks: number;
    ratingDistribution: { [key: number]: number };
  }> => {
    const res = await api.get(`/api/v0/user-feedbacks/doctor/${doctorId}/stats`);
    return res.data;
  },
};
