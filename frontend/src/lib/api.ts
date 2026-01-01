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
  UploadResponse,
  ApiError,
  DeliveryStatus,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

  private setupInterceptors() {
    // Request interceptor - Add auth token to requests
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
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
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth-token');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth-token', token);
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth-token');
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
    const { data } = await this.client.get<User>('/auth/me');
    return data;
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
    const { data } = await this.client.post<{ message: string }>('/auth/verify-email', { token });
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
    const { data } = await this.client.post<GuestSession>('/guest-sessions', sessionData);
    return data;
  }

  async verifyGuestSession(verifyData: VerifyGuestSessionData): Promise<GuestSession> {
    const { data } = await this.client.post<GuestSession>('/guest-sessions/verify', verifyData);
    return data;
  }

  // ============================================
  // CHESED TRAIN ENDPOINTS
  // ============================================

  async getChesedTrains(params?: { category?: string; status?: string }): Promise<ChesedTrain[]> {
    const { data } = await this.client.get<ChesedTrain[]>('/chesed-trains', { params });
    return data;
  }

  async getChesedTrain(idOrSlug: string): Promise<ChesedTrain> {
    const { data } = await this.client.get<ChesedTrain>(`/chesed-trains/${idOrSlug}`);
    return data;
  }

  async createChesedTrain(trainData: CreateChesedTrainData): Promise<ChesedTrain> {
    const { data } = await this.client.post<ChesedTrain>('/chesed-trains', trainData);
    return data;
  }

  async updateChesedTrain(id: string, trainData: UpdateChesedTrainData): Promise<ChesedTrain> {
    const { data } = await this.client.patch<ChesedTrain>(`/chesed-trains/${id}`, trainData);
    return data;
  }

  async deleteChesedTrain(id: string): Promise<void> {
    await this.client.delete(`/chesed-trains/${id}`);
  }

  async getMyChesedTrains(): Promise<ChesedTrain[]> {
    const { data } = await this.client.get<ChesedTrain[]>('/chesed-trains/my-trains');
    return data;
  }

  // ============================================
  // TASK SLOT ENDPOINTS
  // ============================================

  async getTaskSlots(trainId: string, params?: { date?: string; taskType?: string }): Promise<TaskSlot[]> {
    const { data } = await this.client.get<TaskSlot[]>(`/chesed-trains/${trainId}/task-slots`, { params });
    return data;
  }

  async getTaskSlot(trainId: string, slotId: string): Promise<TaskSlot> {
    const { data } = await this.client.get<TaskSlot>(`/chesed-trains/${trainId}/task-slots/${slotId}`);
    return data;
  }

  async createTaskSlot(trainId: string, slotData: CreateTaskSlotData): Promise<TaskSlot> {
    const { data } = await this.client.post<TaskSlot>(`/chesed-trains/${trainId}/task-slots`, slotData);
    return data;
  }

  async createTaskSlotsBulk(trainId: string, slotsData: CreateTaskSlotData[]): Promise<TaskSlot[]> {
    const { data } = await this.client.post<TaskSlot[]>(`/chesed-trains/${trainId}/task-slots/bulk`, { slots: slotsData });
    return data;
  }

  async updateTaskSlot(trainId: string, slotId: string, slotData: UpdateTaskSlotData): Promise<TaskSlot> {
    const { data } = await this.client.patch<TaskSlot>(`/chesed-trains/${trainId}/task-slots/${slotId}`, slotData);
    return data;
  }

  async deleteTaskSlot(trainId: string, slotId: string): Promise<void> {
    await this.client.delete(`/chesed-trains/${trainId}/task-slots/${slotId}`);
  }

  // ============================================
  // CONTRIBUTION ENDPOINTS
  // ============================================

  async getContributions(trainId: string, params?: { slotId?: string; status?: string }): Promise<Contribution[]> {
    const { data } = await this.client.get<Contribution[]>(`/chesed-trains/${trainId}/contributions`, { params });
    return data;
  }

  async getContribution(trainId: string, contributionId: string): Promise<Contribution> {
    const { data } = await this.client.get<Contribution>(`/chesed-trains/${trainId}/contributions/${contributionId}`);
    return data;
  }

  async createContribution(trainId: string, contributionData: CreateContributionData): Promise<Contribution> {
    const { data } = await this.client.post<Contribution>(`/chesed-trains/${trainId}/contributions`, contributionData);
    return data;
  }

  async updateContribution(trainId: string, contributionId: string, contributionData: UpdateContributionData): Promise<Contribution> {
    const { data } = await this.client.patch<Contribution>(`/chesed-trains/${trainId}/contributions/${contributionId}`, contributionData);
    return data;
  }

  async cancelContribution(trainId: string, contributionId: string): Promise<Contribution> {
    const { data } = await this.client.post<Contribution>(`/chesed-trains/${trainId}/contributions/${contributionId}/cancel`);
    return data;
  }

  // Confirm milchig/fleishig on day of delivery
  async confirmMealCategory(trainId: string, contributionId: string, mealCategory: string): Promise<Contribution> {
    const { data } = await this.client.post<Contribution>(
      `/chesed-trains/${trainId}/contributions/${contributionId}/confirm-category`,
      { mealCategory }
    );
    return data;
  }

  // Update delivery status
  async updateDeliveryStatus(trainId: string, contributionId: string, status: DeliveryStatus, estimatedArrival?: string): Promise<Contribution> {
    const { data } = await this.client.post<Contribution>(
      `/chesed-trains/${trainId}/contributions/${contributionId}/delivery-status`,
      { status, estimatedArrival }
    );
    return data;
  }

  // ============================================
  // SIMCHA CONTRIBUTION ENDPOINTS
  // ============================================

  async getSimchaContributions(trainId: string): Promise<SimchaContribution[]> {
    const { data } = await this.client.get<SimchaContribution[]>(`/chesed-trains/${trainId}/simcha-contributions`);
    return data;
  }

  async createSimchaContribution(trainId: string, contributionData: CreateSimchaContributionData): Promise<SimchaContribution> {
    const { data } = await this.client.post<SimchaContribution>(`/chesed-trains/${trainId}/simcha-contributions`, contributionData);
    return data;
  }

  async updateSimchaContribution(trainId: string, contributionId: string, contributionData: Partial<CreateSimchaContributionData>): Promise<SimchaContribution> {
    const { data } = await this.client.patch<SimchaContribution>(`/chesed-trains/${trainId}/simcha-contributions/${contributionId}`, contributionData);
    return data;
  }

  async deleteSimchaContribution(trainId: string, contributionId: string): Promise<void> {
    await this.client.delete(`/chesed-trains/${trainId}/simcha-contributions/${contributionId}`);
  }

  // ============================================
  // DONATION ENDPOINTS
  // ============================================

  async getDonations(trainId: string): Promise<Donation[]> {
    const { data } = await this.client.get<Donation[]>(`/chesed-trains/${trainId}/donations`);
    return data;
  }

  async createDonation(trainId: string, donationData: CreateDonationData): Promise<Donation> {
    const { data } = await this.client.post<Donation>(`/chesed-trains/${trainId}/donations`, donationData);
    return data;
  }

  async createDonationPaymentIntent(trainId: string, amount: number): Promise<{ clientSecret: string }> {
    const { data } = await this.client.post<{ clientSecret: string }>(`/chesed-trains/${trainId}/donations/payment-intent`, { amount });
    return data;
  }

  async confirmDonation(trainId: string, donationId: string): Promise<Donation> {
    const { data } = await this.client.post<Donation>(`/chesed-trains/${trainId}/donations/${donationId}/confirm`);
    return data;
  }

  // ============================================
  // GIFT CARD ENDPOINTS
  // ============================================

  async getGiftCards(trainId: string): Promise<GiftCard[]> {
    const { data } = await this.client.get<GiftCard[]>(`/chesed-trains/${trainId}/gift-cards`);
    return data;
  }

  async createGiftCard(trainId: string, giftCardData: CreateGiftCardData): Promise<GiftCard> {
    const { data } = await this.client.post<GiftCard>(`/chesed-trains/${trainId}/gift-cards`, giftCardData);
    return data;
  }

  async updateGiftCard(trainId: string, giftCardId: string, giftCardData: Partial<CreateGiftCardData>): Promise<GiftCard> {
    const { data } = await this.client.patch<GiftCard>(`/chesed-trains/${trainId}/gift-cards/${giftCardId}`, giftCardData);
    return data;
  }

  async deleteGiftCard(trainId: string, giftCardId: string): Promise<void> {
    await this.client.delete(`/chesed-trains/${trainId}/gift-cards/${giftCardId}`);
  }

  async markGiftCardSent(trainId: string, giftCardId: string): Promise<GiftCard> {
    const { data } = await this.client.post<GiftCard>(`/chesed-trains/${trainId}/gift-cards/${giftCardId}/sent`);
    return data;
  }

  async markGiftCardReceived(trainId: string, giftCardId: string): Promise<GiftCard> {
    const { data } = await this.client.post<GiftCard>(`/chesed-trains/${trainId}/gift-cards/${giftCardId}/received`);
    return data;
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

  async getUserParticipations(): Promise<{ contributions: Contribution[] }> {
    const { data } = await this.client.get<{ contributions: Contribution[] }>('/users/contributions');
    return data;
  }

  async getUserDonations(): Promise<{ donations: Donation[] }> {
    const { data } = await this.client.get<{ donations: Donation[] }>('/users/donations');
    return data;
  }

  async updateUserProfile(profileData: Partial<User>): Promise<{ user: User }> {
    const { data } = await this.client.patch<{ user: User }>('/users/profile', profileData);
    return data;
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
