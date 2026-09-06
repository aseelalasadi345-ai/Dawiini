import { IAuthUser, IResponse, ISignupResult } from "@/interfaces/interfaces";
import { axiosPost } from "@/lib/axios";
import type { SignupFormValues, LoginFormValues } from "@/lib/validations/auth";

// POST /api/auth/signup, /api/auth/login, /api/auth/logout — all built to
// the IResponse convention, so the generic axiosPost unwrap works
// unmodified here (unlike lib/api/schedule.ts's two routes).

// Only these four fields go to the route — confirmPassword/agreeToTerms are
// SignupFormValues-only (client-side validation), not part of the API body.
type SignupData = Pick<SignupFormValues, "firstName" | "lastName" | "email" | "password">;

export function signupRequest(data: SignupData): Promise<IResponse<ISignupResult>> {
  return axiosPost<SignupData, ISignupResult>("auth/signup", data);
}

export function loginRequest(
  data: Pick<LoginFormValues, "email" | "password">
): Promise<IResponse<IAuthUser>> {
  return axiosPost<typeof data, IAuthUser>("auth/login", data);
}

export function logoutRequest(): Promise<IResponse<never>> {
  return axiosPost<undefined, never>("auth/logout", undefined);
}

export function forgotPasswordRequest(data: {
  email: string;
  locale: string;
}): Promise<IResponse<never>> {
  return axiosPost<typeof data, never>("auth/forgot-password", data);
}

export function resetPasswordRequest(data: {
  password: string;
}): Promise<IResponse<never>> {
  return axiosPost<typeof data, never>("auth/reset-password", data);
}
