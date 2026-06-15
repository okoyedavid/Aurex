export type UserRole = "Owner" | "Admin" | "Finance" | "Viewer";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  avatarUrl?: string;
  initials: string;
}

export interface Business {
  id: string;
  name: string;
  email: string;
  industry: string;
  country: string;
  defaultCurrency: string;
  address: string;
}

export interface UserSession {
  id: string;
  deviceName: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface NotificationPreferences {
  paymentAlerts: boolean;
  invoiceReminders: boolean;
  providerSpendAlerts: boolean;
  securityAlerts: boolean;
  weeklySpendSummary: boolean;
  aiInsightReports: boolean;
  theme: "system" | "light" | "dark";
  timezone: string;
  defaultCurrency: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  suspiciousLoginAlerts: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
  status: "Active" | "Invited";
}
