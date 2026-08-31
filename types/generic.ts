type Id = string;
type ISODateString = string;

type UserStatus = "active" | "inactive";
type BusinessStatus = "active" | "suspended";
type NotificationSeverity = "info" | "warning" | "error" | "critical";
type AuditEventCategory = "authentication" | "account" | "session" | "security";
type AuditEventOutcome = "success" | "failure" | "blocked";

export type Permission =
  | "business:update"
  | "employees:view_own"
  | "members:invite"
  | "members:view"
  | "members:remove"
  | "members:update_role"
  | "members:update_status"
  | "payments:create"
  | "payments:view"
  | "payments:view_own"
  | "payments:approve"
  | "payments:cancel"
  | "providers:create"
  | "providers:update"
  | "providers:view"
  | "invoices:create"
  | "invoices:view"
  | "reports:view"
  | "audit_logs:view"
  | "roles:view"
  | "roles:create"
  | "roles:update"
  | "roles:delete"
  | "roles:assign"
  | "employee_lists:create"
  | "employee_lists:view"
  | "employee_lists:update"
  | "employee_lists:archive"
  | "employees:create"
  | "employees:view"
  | "employees:update"
  | "employees:archive"
  | "employees:verify";

export type User = {
  id: Id;
  name: string;
  avatar?: string | null;
  bio?: string | null;
  username?: string | null;
  email: string;
  emailVerifiedAt: ISODateString | null;
  status: UserStatus;
  preferences: {
    twoFactorEnabled: boolean;
  };
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
export type Business = {
  id: Id;
  name: string;
  ownerUserId: Id;
  profile_img?: string | null;
  industry: string;
  defaultCurrency: string;
  status: BusinessStatus;
  isVerified: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
type UserSession = {
  id: Id;
  userId: Id;
  userSessionId: string;
  currentAuthSessionId: string | null;
  userAgent: string | null;
  deviceName: string | null;
  ipAddress: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  lastSeenAt: ISODateString;
  createdAt: ISODateString;
  expiresAt: ISODateString;
  revokedAt: ISODateString | null;
};

export type SessionListItem = UserSession & {
  isCurrentSession: boolean;
  isCurrentIpMatch: boolean;
};

export type GetMySessionsResponse = {
  message: "session retrieved successfully";
  currentIpAddress: string | null;
  data: SessionListItem[];
  sessions: SessionListItem[];
};

export type RevokeSessionResponse = {
  message: "Session revoked successfully";
  revokedCurrentSession: boolean;
  userSession: UserSession | null;
};

export type RevokeOtherSessionsResponse = {
  message: "Other sessions revoked successfully";
  revokedCount: number;
};

export type SessionRouteErrorResponse = {
  message: string;
  requestId?: string | null;
  details?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
  };
  stack?: string;
};

type AuditEventChanges = {
  fields?: string[];
  before?: unknown;
  after?: unknown;
};

export type AuditEvent = {
  id: Id;
  eventId: string;
  eventType: string;
  category: AuditEventCategory;
  outcome: AuditEventOutcome;
  severity: NotificationSeverity;
  userId: Id | null;
  emailHash: string | null;
  userSessionId: string | null;
  authSessionId: string | null;
  requestId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  reason: string | null;
  changes?: AuditEventChanges;
  metadata?: unknown;
  createdAt: ISODateString;
};

export type ApiErrorResponse = {
  message: string;
  code?: string;
  errors?: unknown;
  requestId?: string | null;
  details?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
  };
  stack?: string;
};

export type ForgotPasswordBody = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: "Password reset code sent successfully";
};

export type ResetPasswordBody = {
  email: string;
  otp: string;
  newPassword: string;
};

export type ResetPasswordResponse = {
  message: "Password reset successfully";
};

export type UpdateAvatarBody = {
  avatar: string;
};

export type UpdateAvatarResponse = {
  message: "Avatar updated successfully";
  user: User;
};
export type DeleteAvatarResponse = {
  message: "Avatar deleted successfully";
  user: User;
};

export type UpdatePreferencesBody = {
  preferences: {
    twoFactorEnabled?: boolean;
  };
};

export type UpdatePreferencesResponse = {
  message: "Preferences updated successfully";
  user: User;
};
