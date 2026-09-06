import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  updateHealthProfile,
  updatePersonalProfile,
  updateSettings,
} from "@/lib/api/profile";
import { useAuth } from "@/components/AuthProvider";
import { allowStatuses } from "@/lib/axios";
import type {
  HealthProfileRequest,
  PersonalProfileRequest,
  SettingsRequest,
} from "@/lib/schemas/profile";
import type { IProfile, IResponse } from "@/interfaces/interfaces";

// Wraps getProfile, mirroring usePharmacyAvailability's handling of an
// expected non-2xx-as-body-status. A profile that's "not yet filled in" is a
// real bug fix here, not just a style match: GET /api/profile embeds
// status: 404 for a brand-new user (see app/api/profile/route.ts), and the
// generic axiosGet/unwrap() treats any embedded status >= 400 as a thrown
// ApiError — so without this try/catch, every brand-new user hit a hard
// isError on personal-profile/health-profile/settings (no working page, and
// on settings specifically, no way to even log out from it) the very first
// time they opened any of those tabs, before ever saving anything. Caught
// live via the Playwright e2e suite. allowStatuses recovers the route's real
// data (firstName/lastName/email are always present) rather than discarding
// it, so the "read-only" fields on Personal Info still populate correctly.
export function useProfile() {
  const { user } = useAuth();

  return useQuery<IResponse<IProfile>>({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      try {
        return await getProfile();
      } catch (error) {
        return allowStatuses<IProfile>(error, 404);
      }
    },
    enabled: Boolean(user),
  });
}

// Each section's mutation invalidates the same ["profile", ...] query key
// useProfile reads, matching useUpdateDoseStatus/useTodaySchedule's
// invalidation pattern in hooks/useSchedule.ts.

export function useUpdatePersonalProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PersonalProfileRequest) => updatePersonalProfile(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useUpdateHealthProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HealthProfileRequest) => updateHealthProfile(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SettingsRequest) => updateSettings(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}
