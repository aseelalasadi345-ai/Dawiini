export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
}

export interface HealthInfo {
  weightKg: string;
  heightCm: string;
  bloodType: string;
  allergies: string;
  chronicConditions: string;
}

export interface NotificationSettings {
  doseReminders: boolean;
  stockAlerts: boolean;
  pharmacyUpdates: boolean;
}

export const mockPersonalInfo: PersonalInfo = {
  firstName: "Sara",
  lastName: "Al-Ahmad",
  dateOfBirth: "12 / 04 / 1988",
  phone: "+966 55 123 4567",
  email: "sara@example.com",
};

export const mockHealthInfo: HealthInfo = {
  weightKg: "68",
  heightCm: "165",
  bloodType: "A+",
  allergies: "Penicillin",
  chronicConditions: "Type 2 Diabetes, Hypertension",
};

export const mockNotificationSettings: NotificationSettings = {
  doseReminders: true,
  stockAlerts: true,
  pharmacyUpdates: false,
};
