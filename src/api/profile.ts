import Axios from './index';

interface User {
    _id: string;
    name: string;
    email: string;
    provider: string;
    role: string;
    avatar?: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

interface GetProfileResponse {
    user: User;
}

interface UpdateProfileRequest {
    name: string;
    email: string;
}

interface UpdateProfileResponse {
    user: User;
}

interface UpdatePasswordRequest {
    newPassword: string;
    confirmPassword: string;
}

/**
 * Get user profile
 */
export const getProfile = async (): Promise<User> => {
    const response = await Axios.get<{ data: GetProfileResponse }>('/profile');
    return response.data.data.user;
};

/**
 * Update user profile (name and email)
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<User> => {
    const response = await Axios.patch<{ data: UpdateProfileResponse }>('/profile', data);
    return response.data.data.user;
};

/**
 * Update user password
 */
export const updatePassword = async (data: UpdatePasswordRequest): Promise<void> => {
    await Axios.patch('/profile/password', data);
};

export interface NotificationPreferences {
    notifyShortsReady: boolean;
    notifyExportReady: boolean;
    notifyProductUpdates: boolean;
}

/**
 * Get notification preferences
 */
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
    const response = await Axios.get<{ data: NotificationPreferences }>('/profile/notification-preferences');
    return response.data.data;
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (
    data: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
    const response = await Axios.patch<{ data: NotificationPreferences }>('/profile/notification-preferences', data);
    return response.data.data;
};

export type { User };

