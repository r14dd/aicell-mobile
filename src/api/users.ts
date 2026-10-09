import { api } from '@/api/client';

export type Me = {
  id: number;
  msisdn: string;
  display_msisdn: string;
  display_name: string;
  line_type: 'prepaid' | 'postpaid';
  language: 'az' | 'en';
  app_version: string | null;
  is_premium: boolean;
};

export const getMe = () => api<Me>('users/me/');

export type OtpRequest = { request_id: string; ttl: number; resend_after: number };
export type SignedIn = { access: string; refresh: string; subscriber: Me };

/** No SMS is sent yet: every number signs in with the test code. */
export const OTP_TEST_CODE = '000000';
export const sendOtp = (msisdn: string) => api<OtpRequest>('users/otp/send/', { method: 'POST', body: { msisdn } });
export const verifyOtp = (request_id: string, code: string) => api<SignedIn>('users/otp/verify/', { method: 'POST', body: { request_id, code } });
