import type { LoginFormData, RegisterFormData } from '@/lib/validations/auth';
import type { ApiResponse } from '@/types';

interface RegisterResponse {
  id: string;
  name: string;
  email: string;
}

export async function registerUser(
  data: RegisterFormData
): Promise<ApiResponse<RegisterResponse>> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Greška pri registraciji',
      };
    }

    return {
      success: true,
      data: result.user,
      message: result.message,
    };
  } catch (error) {
    console.error('Register user error:', error);
    return {
      success: false,
      error: 'Greška u mreži',
    };
  }
}

export async function requestPasswordReset(email: string): Promise<ApiResponse<null>> {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Greška pri slanju zahteva',
      };
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('Request password reset error:', error);
    return {
      success: false,
      error: 'Greška u mreži',
    };
  }
}

export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string
): Promise<ApiResponse<null>> {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password, confirmPassword }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Greška pri promeni lozinke',
      };
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: 'Greška u mreži',
    };
  }
}

export async function verifyEmail(token: string): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(`/api/auth/verify-email?token=${token}`);
    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Greška pri potvrdi emaila',
      };
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('Verify email error:', error);
    return {
      success: false,
      error: 'Greška u mreži',
    };
  }
}

// Type export for login (uses signIn from next-auth directly)
export type { LoginFormData };
