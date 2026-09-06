import { Frequency, NotificationType } from "@/app/generated/prisma/enums";

export interface IResponse<T = undefined> {
  data?: T;
  message?: string;
  status?: number;
}

// Shape returned by POST /api/medications — the user's own regimen entry
// (Prisma `Medication`), distinct from MedicationCatalogEntry (the shared
// MOPH drug-reference catalog GET /api/medications searches).
export interface IMedication {
  id: string;
  name: string;
  dose: string;
  frequency: Frequency;
  times: string[];
  startDate: string;
  endDate: string | null;
  notes: string | null;
}

export interface IPharmacyHours {
  days: string;
  hours: string;
}

// Shape returned by GET /api/pharmacies/availability?medicationId=xxx —
// one row per pharmacy currently reporting stock data for that medication.
export interface IPharmacyAvailability {
  pharmacyId: string;
  name: string;
  address: string;
  phone: string;
  hours: IPharmacyHours[];
  level: "plenty" | "limited" | "out_of_stock";
  updatedAt: string;
}

// Shape returned by GET /api/schedule/today — a day's doses joined with
// their medication info.
export interface IDoseToday {
  doseId: string;
  medicationId: string;
  medicationName: string;
  dose: string;
  notes: string | null;
  time: string;
  status: "pending" | "taken" | "skipped";
  takenAt: string | null;
}

// Raw Dose row, as returned by PATCH /api/schedule/doses/[id] — distinct
// from IDoseToday above (that route doesn't join in medication info).
export interface IDose {
  id: string;
  medicationId: string;
  date: string;
  time: string;
  status: "pending" | "taken" | "skipped";
  takenAt: string | null;
  createdAt: string;
}

// Shape returned by GET /api/notifications. title/message are plain
// already-rendered text (see prisma/schema.prisma's Notification comment),
// not translation keys — rendered as-is by the notifications page/navbar.
export interface INotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  medicationId: string | null;
  doseId: string | null;
  pharmacyId: string | null;
  createdAt: string;
}

// One hit from GET /api/medications?q= — the Search page's autocomplete.
// matchSource lets the UI show "Contains: <ingredient>" only when the match
// came from the ingredients tier, not the medication's own name.
export interface ICatalogSearchHit {
  id: string;
  name: string;
  nameAr: string | null;
  form: string;
  strength: string;
  ingredients: string | null;
  matchSource: "name" | "ingredients";
}

// Shape returned by GET /api/recent-searches — the Home/Search pages'
// "Recent Searches" chips, most-recently-searched first.
export interface IRecentSearch {
  catalogEntryId: string;
  name: string;
  strength: string;
}

// Shape returned by GET /api/saved-medications — a saved MedicationCatalogEntry
// (the real MOPH catalog table), joined in. catalogEntryId doubles as the id
// to unsave/re-check against (POST/DELETE /api/saved-medications).
export interface ISavedMedication {
  catalogEntryId: string;
  name: string;
  nameAr: string | null;
  form: string;
  strength: string;
  genericName: string | null;
  brand: string | null;
  useCase: string | null;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────
// Auth (POST /api/auth/signup, /api/auth/login) — session/cookies are
// handled by Supabase itself; this is just the profile echo returned
// alongside a successful signup/login so the frontend can populate its
// current-user state without a second round trip.
// ─────────────────────────────────────────────────────────────

export interface IAuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // prisma/schema.prisma: User.role — exposed here so client components
  // (e.g. Navbar's admin link) can gate on it without a separate fetch.
  role: "user" | "admin";
}

// POST /api/auth/signup's actual response — extends IAuthUser with whether
// Supabase actually returned a session. This project has "Confirm email"
// on (verified live: signUp() returns no session and Supabase attempts to
// send a confirmation email), so a successful signup does NOT always mean
// the user is now logged in — needsEmailConfirmation tells the frontend
// which of the two states it's in.
export interface ISignupResult extends IAuthUser {
  needsEmailConfirmation: boolean;
}

// ─────────────────────────────────────────────────────────────
// Profile (GET /api/profile, PUT /api/profile/{personal,health,settings})
// ─────────────────────────────────────────────────────────────

// personal is never fully absent once signed up (firstName/lastName/email
// always exist on User) — dateOfBirth/phone are null until PersonalProfile
// is first saved. health/settings are null until their own first save.
export interface IPersonalProfile {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string | null;
  phone: string | null;
}

// currentMedications is derived from the Medication table at request time,
// not a stored field — see prisma/schema.prisma's HealthProfile comment.
export interface IHealthProfile {
  weightKg: string | null;
  heightCm: string | null;
  bloodType: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  currentMedications: { id: string; name: string; dose: string }[];
}

export interface IUserSettings {
  doseReminders: boolean;
  stockAlerts: boolean;
  pharmacyUpdates: boolean;
  locale: "en" | "ar";
}

export interface IProfile {
  personal: IPersonalProfile;
  health: IHealthProfile | null;
  settings: IUserSettings | null;
}
