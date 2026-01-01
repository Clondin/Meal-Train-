import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ChesedTrain,
  CreateChesedTrainData,
  UpdateChesedTrainData,
  MealDate,
  CreateMealDateData,
  ClaimMealDateData,
  Participant,
  CreateParticipantData,
  Donation,
  CreateDonationData,
  GiftCard,
  CreateGiftCardData,
  UploadResponse,
  ApiError,
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
          // Server responded with error status
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
          // Request was made but no response received
          return Promise.reject({
            message: 'Network error. Please check your connection.',
            statusCode: 0,
          } as ApiError);
        } else {
          // Something happened in setting up the request
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

  // ===== Auth Endpoints =====

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
    const { data } = await this.client.post<{ message: string }>('/auth/forgot-password', {
      email,
    });
    return data;
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const { data } = await this.client.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
    });
    return data;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const { data } = await this.client.post<{ message: string }>('/auth/verify-email', {
      token,
    });
    return data;
  }

  async resendVerification(): Promise<{ message: string }> {
    const { data } = await this.client.post<{ message: string }>('/auth/resend-verification');
    return data;
  }

  // ===== Chesed Train Endpoints =====

  async getChesedTrains(): Promise<ChesedTrain[]> {
    const { data } = await this.client.get<ChesedTrain[]>('/chesed-trains');
    return data;
  }

  async getChesedTrain(id: string): Promise<ChesedTrain> {
    const { data } = await this.client.get<ChesedTrain>(`/chesed-trains/${id}`);
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

  // ===== Meal Date Endpoints =====

  async getMealDates(trainId: string): Promise<MealDate[]> {
    const { data } = await this.client.get<MealDate[]>(`/chesed-trains/${trainId}/meal-dates`);
    return data;
  }

  async getMealDate(trainId: string, dateId: string): Promise<MealDate> {
    const { data } = await this.client.get<MealDate>(
      `/chesed-trains/${trainId}/meal-dates/${dateId}`
    );
    return data;
  }

  async createMealDate(trainId: string, dateData: CreateMealDateData): Promise<MealDate> {
    const { data } = await this.client.post<MealDate>(
      `/chesed-trains/${trainId}/meal-dates`,
      dateData
    );
    return data;
  }

  async claimMealDate(
    trainId: string,
    dateId: string,
    claimData: ClaimMealDateData
  ): Promise<MealDate> {
    const { data } = await this.client.post<MealDate>(
      `/chesed-trains/${trainId}/meal-dates/${dateId}/claim`,
      claimData
    );
    return data;
  }

  async unclaimMealDate(trainId: string, dateId: string): Promise<MealDate> {
    const { data } = await this.client.post<MealDate>(
      `/chesed-trains/${trainId}/meal-dates/${dateId}/unclaim`
    );
    return data;
  }

  async updateMealDate(
    trainId: string,
    dateId: string,
    dateData: Partial<CreateMealDateData>
  ): Promise<MealDate> {
    const { data } = await this.client.patch<MealDate>(
      `/chesed-trains/${trainId}/meal-dates/${dateId}`,
      dateData
    );
    return data;
  }

  async deleteMealDate(trainId: string, dateId: string): Promise<void> {
    await this.client.delete(`/chesed-trains/${trainId}/meal-dates/${dateId}`);
  }

  async markMealDateDelivered(trainId: string, dateId: string): Promise<MealDate> {
    const { data } = await this.client.post<MealDate>(
      `/chesed-trains/${trainId}/meal-dates/${dateId}/delivered`
    );
    return data;
  }

  // ===== Participant Endpoints =====

  async getParticipants(trainId: string): Promise<Participant[]> {
    const { data } = await this.client.get<Participant[]>(
      `/chesed-trains/${trainId}/participants`
    );
    return data;
  }

  async getParticipant(trainId: string, participantId: string): Promise<Participant> {
    const { data } = await this.client.get<Participant>(
      `/chesed-trains/${trainId}/participants/${participantId}`
    );
    return data;
  }

  async createParticipant(
    trainId: string,
    participantData: CreateParticipantData
  ): Promise<Participant> {
    const { data } = await this.client.post<Participant>(
      `/chesed-trains/${trainId}/participants`,
      participantData
    );
    return data;
  }

  async updateParticipant(
    trainId: string,
    participantId: string,
    participantData: Partial<CreateParticipantData>
  ): Promise<Participant> {
    const { data } = await this.client.patch<Participant>(
      `/chesed-trains/${trainId}/participants/${participantId}`,
      participantData
    );
    return data;
  }

  async deleteParticipant(trainId: string, participantId: string): Promise<void> {
    await this.client.delete(`/chesed-trains/${trainId}/participants/${participantId}`);
  }

  // ===== Donation Endpoints =====

  async getDonations(trainId: string): Promise<Donation[]> {
    const { data } = await this.client.get<Donation[]>(`/chesed-trains/${trainId}/donations`);
    return data;
  }

  async getDonation(trainId: string, donationId: string): Promise<Donation> {
    const { data } = await this.client.get<Donation>(
      `/chesed-trains/${trainId}/donations/${donationId}`
    );
    return data;
  }

  async createDonation(trainId: string, donationData: CreateDonationData): Promise<Donation> {
    const { data } = await this.client.post<Donation>(
      `/chesed-trains/${trainId}/donations`,
      donationData
    );
    return data;
  }

  async createDonationPaymentIntent(
    trainId: string,
    amount: number
  ): Promise<{ clientSecret: string }> {
    const { data } = await this.client.post<{ clientSecret: string }>(
      `/chesed-trains/${trainId}/donations/payment-intent`,
      { amount }
    );
    return data;
  }

  async confirmDonation(trainId: string, donationId: string): Promise<Donation> {
    const { data } = await this.client.post<Donation>(
      `/chesed-trains/${trainId}/donations/${donationId}/confirm`
    );
    return data;
  }

  // ===== Gift Card Endpoints =====

  async getGiftCards(trainId: string): Promise<GiftCard[]> {
    const { data } = await this.client.get<GiftCard[]>(`/chesed-trains/${trainId}/gift-cards`);
    return data;
  }

  async getGiftCard(trainId: string, giftCardId: string): Promise<GiftCard> {
    const { data } = await this.client.get<GiftCard>(
      `/chesed-trains/${trainId}/gift-cards/${giftCardId}`
    );
    return data;
  }

  async createGiftCard(trainId: string, giftCardData: CreateGiftCardData): Promise<GiftCard> {
    const { data } = await this.client.post<GiftCard>(
      `/chesed-trains/${trainId}/gift-cards`,
      giftCardData
    );
    return data;
  }

  async updateGiftCard(
    trainId: string,
    giftCardId: string,
    giftCardData: Partial<CreateGiftCardData>
  ): Promise<GiftCard> {
    const { data } = await this.client.patch<GiftCard>(
      `/chesed-trains/${trainId}/gift-cards/${giftCardId}`,
      giftCardData
    );
    return data;
  }

  async deleteGiftCard(trainId: string, giftCardId: string): Promise<void> {
    await this.client.delete(`/chesed-trains/${trainId}/gift-cards/${giftCardId}`);
  }

  async markGiftCardSent(trainId: string, giftCardId: string): Promise<GiftCard> {
    const { data } = await this.client.post<GiftCard>(
      `/chesed-trains/${trainId}/gift-cards/${giftCardId}/sent`
    );
    return data;
  }

  async markGiftCardReceived(trainId: string, giftCardId: string): Promise<GiftCard> {
    const { data } = await this.client.post<GiftCard>(
      `/chesed-trains/${trainId}/gift-cards/${giftCardId}/received`
    );
    return data;
  }

  // ===== File Upload Endpoints =====

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

  // ===== User Endpoints =====

  async getUserParticipations(): Promise<{ participations: Participant[] }> {
    const { data } = await this.client.get<{ participations: Participant[] }>('/users/participations');
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

  // ===== Generic HTTP Methods =====

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
