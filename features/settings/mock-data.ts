import type {
  AuthUser,
  Business,
  NotificationPreferences,
  SecuritySettings,
  TeamMember,
  UserSession,
} from "@/features/settings/types";

export const mockAuthUser: AuthUser = {
  id: "usr_01aurex",
  fullName: "Amara Okoye",
  email: "amara@aurex.example",
  phoneNumber: "+234 801 234 5678",
  role: "Owner",
  initials: "AO",
};

export const mockBusiness: Business = {
  id: "biz_01aurex",
  name: "Aurex Technologies",
  email: "finance@aurex.example",
  industry: "Financial technology",
  country: "Nigeria",
  defaultCurrency: "NGN",
  address: "12 Marina Road, Lagos Island, Lagos",
};

export const mockUserSessions: UserSession[] = [
  {
    id: "session_current",
    deviceName: "MacBook Pro",
    browser: "Chrome on macOS",
    location: "Lagos, Nigeria",
    ipAddress: "102.89.23.41",
    lastActiveAt: "Active now",
    isCurrent: true,
  },
  {
    id: "session_mobile",
    deviceName: "iPhone 15",
    browser: "Safari on iOS",
    location: "Lagos, Nigeria",
    ipAddress: "102.89.25.18",
    lastActiveAt: "2 hours ago",
    isCurrent: false,
  },
  {
    id: "session_office",
    deviceName: "Office workstation",
    browser: "Edge on Windows",
    location: "Abuja, Nigeria",
    ipAddress: "197.210.54.9",
    lastActiveAt: "June 13, 2026 at 16:42",
    isCurrent: false,
  },
];

export const mockNotificationPreferences: NotificationPreferences = {
  paymentAlerts: true,
  invoiceReminders: true,
  providerSpendAlerts: true,
  securityAlerts: true,
  weeklySpendSummary: true,
  aiInsightReports: false,
  theme: "system",
  timezone: "Africa/Lagos",
  defaultCurrency: "NGN",
};

export const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  suspiciousLoginAlerts: true,
};

export const mockTeamMembers: TeamMember[] = [
  {
    id: "team_01",
    name: "Amara Okoye",
    email: "amara@aurex.example",
    role: "Owner",
    initials: "AO",
    status: "Active",
  },
  {
    id: "team_02",
    name: "Daniel Cole",
    email: "daniel@aurex.example",
    role: "Admin",
    initials: "DC",
    status: "Active",
  },
  {
    id: "team_03",
    name: "Nneka Ibe",
    email: "nneka@aurex.example",
    role: "Finance",
    initials: "NI",
    status: "Active",
  },
  {
    id: "team_04",
    name: "Sam Adeyemi",
    email: "sam@aurex.example",
    role: "Viewer",
    initials: "SA",
    status: "Invited",
  },
];
