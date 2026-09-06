import {
  IHealthProfile,
  IPersonalProfile,
  IProfile,
  IResponse,
  IUserSettings,
} from "@/interfaces/interfaces";
import { axiosGet, axiosPut } from "@/lib/axios";
import type {
  HealthProfileRequest,
  PersonalProfileRequest,
  SettingsRequest,
} from "@/lib/schemas/profile";

// GET /api/profile, PUT /api/profile/{personal,health,settings} — all built
// to the IResponse convention, so axiosGet/axiosPut work unmodified here.

export function getProfile(): Promise<IResponse<IProfile>> {
  return axiosGet<IProfile>("profile");
}

export function updatePersonalProfile(
  data: PersonalProfileRequest
): Promise<IResponse<IPersonalProfile>> {
  return axiosPut<PersonalProfileRequest, IPersonalProfile>("profile/personal", data);
}

export function updateHealthProfile(
  data: HealthProfileRequest
): Promise<IResponse<IHealthProfile>> {
  return axiosPut<HealthProfileRequest, IHealthProfile>("profile/health", data);
}

export function updateSettings(
  data: SettingsRequest
): Promise<IResponse<IUserSettings>> {
  return axiosPut<SettingsRequest, IUserSettings>("profile/settings", data);
}
