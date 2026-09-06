import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  forgotPasswordRequest,
  loginRequest,
  logoutRequest,
  resetPasswordRequest,
  signupRequest,
} from "@/lib/api/auth";
import { useAuth as useAuthContext } from "@/components/AuthProvider";
import type { LoginFormValues, SignupFormValues } from "@/lib/validations/auth";

// Wraps signupRequest/loginRequest/logoutRequest. On success, each populates
// (or clears) AuthProvider's current-user state directly — the same
// context useTodaySchedule/usePharmacyAvailability read from — so callers
// don't need to remember to do it themselves.

export function useSignup() {
  const { setUser } = useAuthContext();

  return useMutation({
    mutationFn: (data: Pick<SignupFormValues, "firstName" | "lastName" | "email" | "password">) =>
      signupRequest(data),
    onSuccess: (response) => {
      // Only populate the current-user state if Supabase actually returned
      // a session (see app/api/auth/signup/route.ts's needsEmailConfirmation
      // — this project requires confirming the email first). Setting `user`
      // without a real session cookie would make the app look logged in
      // while every subsequent authenticated request still 401s.
      if (response.data && !response.data.needsEmailConfirmation) {
        setUser(response.data);
      }
    },
  });
}

export function useLogin() {
  const { setUser } = useAuthContext();

  return useMutation({
    mutationFn: (data: Pick<LoginFormValues, "email" | "password">) => loginRequest(data),
    onSuccess: (response) => {
      if (response.data) setUser(response.data);
    },
  });
}

// Neither of these touches AuthProvider's user state: a forgot-password
// request happens while signed out, and a successful reset ends with the
// server signing the recovery session back out (see
// app/api/auth/reset-password/route.ts) so the person logs in fresh.

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string; locale: string }) => forgotPasswordRequest(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { password: string }) => resetPasswordRequest(data),
  });
}

export function useLogout() {
  const { setUser } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutRequest(),
    onSuccess: () => {
      setUser(null);
      // Drop every cached query — the next signed-in user (or an anonymous
      // view) must never see this user's cached schedule/profile data.
      queryClient.clear();
    },
  });
}
