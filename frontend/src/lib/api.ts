import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ChesedTrain,
  CreateChesedTrainData,
  UpdateChesedTrainData,
  TaskSlot,
  CreateTaskSlotData,
  UpdateTaskSlotData,
  Contribution,
  CreateContributionData,
  UpdateContributionData,
  SimchaContribution,
  CreateSimchaContributionData,
  Donation,
  CreateDonationData,
  GiftCard,
  CreateGiftCardData,
  GuestSession,
  CreateGuestSessionData,
  VerifyGuestSessionData,
  Notification,
  ThankYouNote,
  UploadResponse,
  ApiError,
  DeliveryStatus,
  DashboardStats,
} from '@/types';
import { getApiBaseUrl } from './config';
import { readStoredAuthToken, writeStoredAuthToken } from './auth-storage';
import { readStoredGuestSession } from './guest-session';

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private unwrap<T>(data: any, keys: string[]): T {
    for (const key of keys) {
      if (data && key in data) {
        return data[key] as T;
      }
    }

    return data as T;
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token to requests
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        const guestSession = this.getGuestSession();
        if (guestSession?.token && config.headers) {
          config.headers['x-guest-session-token'] = guestSession.token;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response) {
          const apiError: ApiError = {
            message: error.response.data?.message || 'An error occurred',
            errors: error.response.data?.errors,
            statusCode: error.response.status,
          };

          // Handle 401 Unauthorized - clear token and redirect to login
          if (error.response.status === 401) {
            this.clearToken();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }

          return Promise.reject(apiError);
        } else if (error.request) {
          return Promise.reject({
            message: 'Network error. Please check your connection.',
            statusCode: 0,
          } as ApiError);
        } else {
          return Promise.reject({
            message: error.message || 'An unexpected error occurred',
          } as ApiError);
        }
      }
    );
  }

  private getToken(): string | null {
    return readStoredAuthToken();
  }

  private setToken(token: string): void {
    writeStoredAuthToken(token);
  }

  private clearToken(): void {
    writeStoredAuthToken(null);
  }

  private getGuestSession() {
    return readStoredGuestSession();
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/login', credentials);
    this.setToken(data.token);
    return data;
  }

  async register(registerData: RegisterData): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/register', registerData);
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser(): Promise<User> {
    const { data } = await this.client.get('/auth/me');
    return this.unwrap<User>(data, ['user']);
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await this.client.post<{ message: string }>('/auth/forgot-password', { email });
    return data;
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const { data } = await this.client.post<{ message: string }>('/auth/reset-password', { token, password });
    return data;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const { data } = await this.client.get<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return data;
  }

  async resendVerification(): Promise<{ message: string }> {
    const { data } = await this.client.post<{ message: string }>('/auth/resend-verification');
    return data;
  }

  // ============================================
  // GUEST SESSION ENDPOINTS
  // ============================================

  async createGuestSession(sessionData: CreateGuestSessionData): Promise<GuestSession> {
    const { data } = await this.client.post('/guest-sessions', sessionData);
    return this.unwrap<GuestSession>(data, ['guestSession']);
  }

  async verifyGuestSession(verifyData: VerifyGuestSessionData): Promise<GuestSession> {
    const { data } = await this.client.post('/guest-sessions/verify', verifyData);
    return this.unwrap<GuestSession>(data, ['guestSession']);
  }

  // ============================================
  // CHESED TRAIN ENDPOINTS
  // ============================================

  async getChesedTrains(params?: { category?: string; status?: string }): Promise<ChesedTrain[]> {
    const { data } = await this.client.get('/chesed-trains', { params });
    return this.unwrap<ChesedTrain[]>(data, ['trains']);
  }

  async getChesedTrain(idOrSlug: string): Promise<ChesedTrain> {
    const { data } = await this.client.get(`/chesed-trains/${idOrSlug}`);
    return this.unwrap<ChesedTrain>(data, ['train']);
  }

  async createChesedTrain(trainData: CreateChesedTrainData): Promise<ChesedTrain> {
    const { data } = await this.client.post('/chesed-trains', trainData);
    return this.unwrap<ChesedTrain>(data, ['train']);
  }

  async updateChesedTrain(id: string, trainData: UpdateChesedTrainData): Promise<ChesedTrain> {
    const { data } = await this.client.patch(`/chesed-trains/${id}`, trainData);
    return this.unwrap<ChesedTrain>(data, ['train']);
  }

  async deleteChesedTrain(id: string): Promise<void> {
    await this.client.delete(`/chesed-trains/${id}`);
  }

  async getMyChesedTrains(params?: { page?: number; limit?: number }): Promise<ChesedTrain[]> {
    const { data } = await this.client.get('/users/trains', { params });
    return this.unwrap<ChesedTrain[]>(data, ['data', 'trains']);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await this.client.get('/users/dashboard-stats');
    return data as DashboardStats;
  }

  // ============================================
  // TASK SLOT ENDPOINTS
  // ============================================

  async getTaskSlots(
    trainId: string,
    params?: { date?: string; taskType?: string; page?: number; limit?: number }
  ): Promise<TaskSlot[]> {
    const { data } = await this.client.get(`/chesed-trains/${trainId}/task-slots`, { params });
    return this.unwrap<TaskSlot[]>(data, ['data', 'taskSlots']);
  }

  async getTaskSlot(trainId: string, slotId: string): Promise<TaskSlot> {
    const { data } = await this.client.get(`/chesed-trains/${trainId}/task-slots/${slotId}`);
    return this.unwrap<TaskSlot>(data, ['taskSlot']);
  }

  async createTaskSlot(trainId: string, slotData: CreateTaskSlotData): Promise<TaskSlot> {
    const { data } = await this.client.post(`/chesed-trains/${trainId}/task-slots`, slotData);
    return this.unwrap<TaskSlot>(data, ['taskSlot']);
  }

  async createTaskSlotsBulk(trainId: string, slotsData: CreateTaskSlotData[]): Promise<TaskSlot[]> {
    const { data } = await this.client.post(`/chesed-trains/${trainId}/task-slots/bulk`, { slots: slotsData });
    return this.unwrap<TaskSlot[]>(data, ['taskSlots']);
  }

  async updateTaskSlot(trainId: string, slotId: string, slotData: UpdateTaskSlotData): Promise<TaskSlot> {
    const { data } = await this.client.patch(`/chesed-trains/${trainId}/task-slots/${slotId}`, slotData);
    return this.unwrap<TaskSlot>(data, ['taskSlot']);
  }

  async deleteTaskSlot(trainId: string, slotId: string): Promise<void> {
    await this.client.delete(`/chesed-trains/${trainId}/task-slots/${slotId}`);
  }

  // ============================================
  // CONTRIBUTION ENDPOINTS
  // ============================================

  async getContributions(
    trainId: string,
    params?: { slotId?: string; status?: string; page?: number; limit?: number }
  ): Promise<Contribution[]> {
    const { data } = await this.client.get(`/chesed-trains/${trainId}/contributions`, { params });
    return this.unwrap<Contribution[]>(data, ['data', 'contributions']);
  }

  async getContribution(trainId: string, contributionId: string): Promise<Contribution> {
    const contributions = await this.getContributions(trainId);
    const contribution = contributions.find((entry) => entry.id === contributionId);
    if (!contribution) {
      throw { message: 'Contribution not found', statusCode: 404 } as ApiError;
    }
    return contribution;
  }

  async createContribution(trainId: string, contributionData: CreateContributionData): Promise<Contribution> {
    const { data } = await this.client.post(`/chesed-trains/${trainId}/contributions`, contributionData);
    return this.unwrap<Contribution>(data, ['contribution']);
  }

  async updateContribution(trainId: string, contributionId: string, contributionData: UpdateContributionData): Promise<Contribution> {
    const { data } = await this.client.patch(`/contributions/${contributionId}`, contributionData);
    return this.unwrap<Contribution>(data, ['contribution']);
  }

  async cancelContribution(trainId: string, contributionId: string): Promise<Contribution> {
    return this.updateContribution(trainId, contributionId, { status: 'CANCELLED' });
  }

  // Confirm milchig/fleishig on day of delivery
  async confirmMealCategory(trainId: string, contributionId: string, mealCategory: string): Promise<Contribution> {
    return this.updateContribution(trainId, contributionId, {
      mealCategory: mealCategory as CreateContributionData['mealCategory'],
      confirmedMealCategory: true,
    });
  }

  // Update delivery status
  async updateDeliveryStatus(trainId: string, contributionId: string, status: DeliveryStatus, estimatedArrival?: string): Promise<Contribution> {
    return this.updateContribution(trainId, contributionId, {
      deliveryStatus: status,
      estimatedArrival,
    });
  }

  // ============================================
  // SIMCHA CONTRIBUTION ENDPOINTS
  // ============================================

  async getSimchaContributions(
    trainId: string,
    params?: { page?: number; limit?: number }
  ): Promise<SimchaContribution[]> {
    const { data } = await this.client.get(`/chesed-trains/${trainId}/simcha-contributions`, {
      params,
    });
    return this.unwrap<SimchaContribution[]>(data, ['data', 'contributions']);
  }

  async createSimchaContribution(trainId: string, contributionData: CreateSimchaContributionData): Promise<SimchaContribution> {
    const { data } = await this.client.post(`/chesed-trains/${trainId}/simcha-contributions`, contributionData);
    return this.unwrap<SimchaContribution>(data, ['contribution']);
  }

  async updateSimchaContribution(trainId: string, contributionId: string, contributionData: Partial<CreateSimchaContributionData>): Promise<SimchaContribution> {
    const { data } = await this.client.patch(`/chesed-trains/${trainId}/simcha-contributions/${contributionId}`, contributionData);
    return this.unwrap<SimchaContribution>(data, ['contribution']);
  }

  async deleteSimchaContribution(trainId: string, contributionId: string): Promise<void> {
    await this.client.delete(`/chesed-trains/${trainId}/simcha-contributions/${contributionId}`);
  }

  // ============================================
  // DONATION ENDPOINTS
  // ============================================

  async getDonations(trainId: string): Promise<Donation[]> {
    const { data } = await this.client.get(`/donations/train/${trainId}`);
    return this.unwrap<Donation[]>(data, ['donations']);
  }

  async createDonation(trainId: string, donationData: CreateDonationData): Promise<Donation> {
    const { data } = await this.client.post('/donations', { ...donationData, trainId });
    return this.unwrap<Donation>(data, ['donation']);
  }

  async createDonationPaymentIntent(
    trainId: string,
    donationData: Pick<CreateDonationData, 'donorName' | 'donorEmail' | 'amount' | 'message'> & { isAnonymous?: boolean }
  ): Promise<{ donation: Donation; clientSecret: string }> {
    const { data } = await this.client.post('/donations', {
      trainId,
      ...donationData,
    });
    return {
      donation: this.unwrap<Donation>(data, ['donation']),
      clientSecret: data.clientSecret,
    };
  }

  async confirmDonation(trainId: string, donationId: string): Promise<Donation> {
    const { data } = await this.client.post(`/donations/${donationId}/confirm`);
    return this.unwrap<Donation>(data, ['donation']);
  }

  // ============================================
  // GIFT CARD ENDPOINTS
  // ============================================

  async getGiftCards(trainId: string): Promise<GiftCard[]> {
    const { data } = await this.client.get(`/gift-cards/train/${trainId}`);
    return this.unwrap<GiftCard[]>(data, ['giftCards']);
  }

  async createGiftCard(trainId: string, giftCardData: CreateGiftCardData): Promise<GiftCard> {
    const { data } = await this.client.post('/gift-cards', { ...giftCardData, trainId });
    return this.unwrap<GiftCard>(data, ['giftCard']);
  }

  async updateGiftCard(trainId: string, giftCardId: string, giftCardData: Partial<CreateGiftCardData>): Promise<GiftCard> {
    const { data } = await this.client.post(`/gift-cards/${giftCardId}/resend`, {
      ...giftCardData,
      trainId,
    });
    return this.unwrap<GiftCard>(data, ['giftCard']);
  }

  async deleteGiftCard(trainId: string, giftCardId: string): Promise<void> {
    await this.client.delete(`/chesed-trains/${trainId}/gift-cards/${giftCardId}`);
  }

  async markGiftCardSent(trainId: string, giftCardId: string): Promise<GiftCard> {
    return this.updateGiftCard(trainId, giftCardId, {});
  }

  async markGiftCardReceived(trainId: string, giftCardId: string): Promise<GiftCard> {
    return this.updateGiftCard(trainId, giftCardId, {});
  }

  // ============================================
  // FILE UPLOAD ENDPOINTS
  // ============================================

  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await this.client.post<UploadResponse>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  async uploadFiles(files: File[]): Promise<UploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const { data } = await this.client.post<UploadResponse[]>('/uploads/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  // ============================================
  // USER ENDPOINTS
  // ============================================

  async getUserParticipations(params?: { page?: number; limit?: number }): Promise<{ contributions: Contribution[] }> {
    const { data } = await this.client.get('/users/contributions', { params });
    return { contributions: this.unwrap<Contribution[]>(data, ['data', 'contributions', 'participations']) };
  }

  async getUserDonations(params?: { page?: number; limit?: number }): Promise<{ donations: Donation[] }> {
    const { data } = await this.client.get('/users/donations', { params });
    return { donations: this.unwrap<Donation[]>(data, ['data', 'donations']) };
  }

  async updateUserProfile(profileData: Partial<User>): Promise<{ user: User }> {
    const { data } = await this.client.patch<{ user: User }>('/users/profile', profileData);
    return data;
  }

  async getNotifications(params?: { page?: number; limit?: number; read?: boolean }): Promise<Notification[]> {
    const { data } = await this.client.get('/notifications', { params });
    return this.unwrap<Notification[]>(data, ['notifications']);
  }

  async markNotificationRead(notificationId: string): Promise<Notification> {
    const { data } = await this.client.patch(`/notifications/${notificationId}/read`);
    return this.unwrap<Notification>(data, ['notification']);
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.client.post('/notifications/read-all');
  }

  async getUnreadNotificationCount(): Promise<number> {
    const { data } = await this.client.get<{ count: number }>('/notifications/unread-count');
    return data.count;
  }

  async getThankYouNotes(trainIdOrSlug: string): Promise<ThankYouNote[]> {
    const { data } = await this.client.get(`/chesed-trains/${trainIdOrSlug}/thank-you`);
    return this.unwrap<ThankYouNote[]>(data, ['notes']);
  }

  async createThankYouNote(
    trainIdOrSlug: string,
    payload: { contributionId?: string; recipientUserId?: string; message: string }
  ): Promise<ThankYouNote> {
    const { data } = await this.client.post(`/chesed-trains/${trainIdOrSlug}/thank-you`, payload);
    return this.unwrap<ThankYouNote>(data, ['note']);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await this.client.post<{ message: string }>('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  }

  async deleteAccount(): Promise<{ message: string }> {
    const { data } = await this.client.delete<{ message: string }>('/users/account');
    return data;
  }

  // ============================================
  // GENERIC HTTP METHODS
  // ============================================

  async get<T>(url: string): Promise<{ data: T }> {
    const response = await this.client.get<T>(url);
    return { data: response.data };
  }

  async post<T>(url: string, body?: unknown): Promise<{ data: T }> {
    const response = await this.client.post<T>(url, body);
    return { data: response.data };
  }

  async patch<T>(url: string, body?: unknown): Promise<{ data: T }> {
    const response = await this.client.patch<T>(url, body);
    return { data: response.data };
  }

  async delete<T>(url: string): Promise<{ data: T }> {
    const response = await this.client.delete<T>(url);
    return { data: response.data };
  }
}

// Export singleton instance
export const api = new ApiClient();
export default api;
