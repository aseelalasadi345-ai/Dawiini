import type {
  LoginFormValues,
  SignupFormValues,
  ForgotPasswordFormValues,
} from "@/lib/validations/auth";

// Simulated network latency so the forms' loading states are visible.
// TODO: replace each function body with a real API call. Callers already
// await these and catch rejections, so swapping the body for a fetch() that
// throws on a non-2xx response (e.g. 401 on bad credentials) requires no
// changes in the form components themselves.
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function login(_data: LoginFormValues): Promise<void> {
  await delay(600);
}

export async function signup(_data: SignupFormValues): Promise<void> {
  await delay(600);
}

export async function requestPasswordReset(
  _data: ForgotPasswordFormValues
): Promise<void> {
  await delay(600);
}
