import type {
  AuditEvent,
  Business,
  BusinessInvite,
  BusinessMember,
  ISODateString,
  Role,
  User,
} from "@/types/generic";

export type UserBusinessSummary = {
  business: Business;
  role: Role;
  member: BusinessMember;
  pendingPaymentsCount: number;
  pendingInvitesCount: number;
  lastActivityAt: ISODateString;
};

export type PendingAction = {
  id: string;
  type:
    | "verify_email"
    | "accept_invite"
    | "approve_payment"
    | "review_security"
    | "complete_business_profile";
  title: string;
  description: string;
  href: string;
  severity: "info" | "warning" | "critical";
  createdAt: ISODateString;
};

export type BusinessDashboardSummary = {
  business: Business;
  currentUserRole: Role;
  payments: {
    pending: number;
    approved: number;
    failed: number;
    totalValue: number;
  };
  invoices: {
    draft: number;
    sent: number;
    overdue: number;
  };
  providers: {
    active: number;
    pending: number;
  };
  members: {
    active: number;
    invited: number;
  };
  recentActivity: AuditEvent[];
};

export const currentUser: User = {
  id: "usr_amara",
  name: "Amara Okoye",
  avatar: null,
  bio: "Finance operator managing payments across growing Nigerian businesses.",
  username: "amara",
  email: "amara@aurex.example",
  emailVerifiedAt: "2026-06-10T09:00:00.000Z",
  status: "active",
  preferences: {
    twoFactorEnabled: true,
  },
  createdAt: "2026-01-15T08:30:00.000Z",
  updatedAt: "2026-06-18T11:24:00.000Z",
};

export const roles: Role[] = [
  {
    id: "role_owner",
    businessId: null,
    name: "Owner",
    key: "owner",
    type: "system",
    permissions: [
      "business:update",
      "members:invite",
      "members:remove",
      "members:update_role",
      "payments:create",
      "payments:view",
      "payments:approve",
      "payments:cancel",
      "providers:create",
      "providers:update",
      "providers:view",
      "invoices:create",
      "invoices:view",
      "reports:view",
      "audit_logs:view",
    ],
    deniedPermissions: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "role_admin",
    businessId: null,
    name: "Admin",
    key: "admin",
    type: "system",
    permissions: [
      "business:update",
      "members:invite",
      "payments:create",
      "payments:view",
      "payments:approve",
      "providers:view",
      "invoices:create",
      "invoices:view",
      "reports:view",
    ],
    deniedPermissions: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "role_finance",
    businessId: null,
    name: "Finance Manager",
    key: "finance_manager",
    type: "system",
    permissions: [
      "payments:create",
      "payments:view",
      "payments:approve",
      "providers:view",
      "invoices:create",
      "invoices:view",
      "reports:view",
    ],
    deniedPermissions: ["members:remove"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "role_viewer",
    businessId: null,
    name: "Viewer",
    key: "viewer",
    type: "system",
    permissions: ["payments:view", "payments:view_own", "providers:view", "invoices:view"],
    deniedPermissions: ["payments:approve", "payments:cancel"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export const businesses: Business[] = [
  {
    id: "biz_lagos_foods",
    name: "Lagos Foods Market",
    ownerUserId: currentUser.id,
    industry: "Retail and distribution",
    defaultCurrency: "NGN",
    status: "active",
    isVerified: true,
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-06-20T15:18:00.000Z",
  },
  {
    id: "biz_eko_health",
    name: "Eko Health Services",
    ownerUserId: "usr_daniel",
    industry: "Healthcare",
    defaultCurrency: "NGN",
    status: "active",
    isVerified: false,
    createdAt: "2026-03-12T11:15:00.000Z",
    updatedAt: "2026-06-19T13:40:00.000Z",
  },
  {
    id: "biz_abuja_build",
    name: "Abuja Build Partners",
    ownerUserId: "usr_nneka",
    industry: "Construction",
    defaultCurrency: "NGN",
    status: "suspended",
    isVerified: true,
    createdAt: "2026-04-08T08:45:00.000Z",
    updatedAt: "2026-06-17T09:05:00.000Z",
  },
];

export const memberships: BusinessMember[] = businesses.map((business, index) => ({
  id: `mem_${business.id}`,
  businessId: business.id,
  userId: currentUser.id,
  roleId: [roles[0].id, roles[2].id, roles[1].id][index],
  status: index === 2 ? "suspended" : "active",
  invitedByUserId: index === 0 ? null : business.ownerUserId,
  createdAt: business.createdAt,
  updatedAt: business.updatedAt,
}));

export const invites: BusinessInvite[] = [
  {
    id: "inv_paystack_ops",
    businessId: "biz_lagos_foods",
    email: "ops@lagosfoods.example",
    roleId: "role_finance",
    invitedByUserId: currentUser.id,
    acceptedByUserId: null,
    status: "pending",
    expiresAt: "2026-07-02T12:00:00.000Z",
    acceptedAt: null,
    revokedAt: null,
    revokedByUserId: null,
    createdAt: "2026-06-21T10:30:00.000Z",
    updatedAt: "2026-06-21T10:30:00.000Z",
  },
  {
    id: "inv_clinic_admin",
    businessId: "biz_eko_health",
    email: currentUser.email,
    roleId: "role_admin",
    invitedByUserId: "usr_daniel",
    acceptedByUserId: currentUser.id,
    status: "accepted",
    expiresAt: "2026-06-25T12:00:00.000Z",
    acceptedAt: "2026-06-14T08:20:00.000Z",
    revokedAt: null,
    revokedByUserId: null,
    createdAt: "2026-06-12T13:00:00.000Z",
    updatedAt: "2026-06-14T08:20:00.000Z",
  },
  {
    id: "inv_site_viewer",
    businessId: "biz_abuja_build",
    email: "audit@abujabuild.example",
    roleId: "role_viewer",
    invitedByUserId: "usr_nneka",
    acceptedByUserId: null,
    status: "expired",
    expiresAt: "2026-06-11T12:00:00.000Z",
    acceptedAt: null,
    revokedAt: null,
    revokedByUserId: null,
    createdAt: "2026-06-01T09:10:00.000Z",
    updatedAt: "2026-06-11T12:00:00.000Z",
  },
  {
    id: "inv_vendor_ops",
    businessId: "biz_lagos_foods",
    email: "vendor@lagosfoods.example",
    roleId: "role_viewer",
    invitedByUserId: currentUser.id,
    acceptedByUserId: null,
    status: "revoked",
    expiresAt: "2026-06-30T12:00:00.000Z",
    acceptedAt: null,
    revokedAt: "2026-06-18T16:00:00.000Z",
    revokedByUserId: currentUser.id,
    createdAt: "2026-06-10T14:10:00.000Z",
    updatedAt: "2026-06-18T16:00:00.000Z",
  },
];

export const auditEvents: AuditEvent[] = [
  {
    id: "aud_001",
    eventId: "evt_payment_created",
    eventType: "payment.created",
    category: "account",
    outcome: "success",
    severity: "info",
    userId: currentUser.id,
    emailHash: null,
    userSessionId: "uses_001",
    authSessionId: "auth_001",
    requestId: "req_01",
    ipAddress: "102.89.23.41",
    userAgent: "Chrome on Windows",
    deviceName: "Office workstation",
    city: "Lagos",
    region: "Lagos",
    country: "Nigeria",
    reason: null,
    metadata: { businessId: "biz_lagos_foods", amount: 2850000 },
    createdAt: "2026-06-22T15:30:00.000Z",
  },
  {
    id: "aud_002",
    eventId: "evt_invite_accepted",
    eventType: "invite.accepted",
    category: "account",
    outcome: "success",
    severity: "info",
    userId: currentUser.id,
    emailHash: null,
    userSessionId: "uses_001",
    authSessionId: "auth_001",
    requestId: "req_02",
    ipAddress: "102.89.23.41",
    userAgent: "Chrome on Windows",
    deviceName: "Office workstation",
    city: "Lagos",
    region: "Lagos",
    country: "Nigeria",
    reason: null,
    metadata: { businessId: "biz_eko_health" },
    createdAt: "2026-06-21T09:00:00.000Z",
  },
  {
    id: "aud_003",
    eventId: "evt_session_revoked",
    eventType: "session.revoked",
    category: "session",
    outcome: "success",
    severity: "warning",
    userId: currentUser.id,
    emailHash: null,
    userSessionId: "uses_mobile",
    authSessionId: "auth_mobile",
    requestId: "req_03",
    ipAddress: "197.210.54.9",
    userAgent: "Safari on iOS",
    deviceName: "iPhone 15",
    city: "Abuja",
    region: "FCT",
    country: "Nigeria",
    reason: "User revoked unfamiliar device",
    createdAt: "2026-06-20T18:10:00.000Z",
  },
  {
    id: "aud_004",
    eventId: "evt_login_blocked",
    eventType: "login.blocked",
    category: "authentication",
    outcome: "blocked",
    severity: "critical",
    userId: currentUser.id,
    emailHash: null,
    userSessionId: null,
    authSessionId: null,
    requestId: "req_04",
    ipAddress: "41.203.80.22",
    userAgent: "Unknown browser",
    deviceName: "Unknown device",
    city: "Port Harcourt",
    region: "Rivers",
    country: "Nigeria",
    reason: "OTP challenge failed repeatedly",
    createdAt: "2026-06-19T21:45:00.000Z",
  },
];

export const pendingActions: PendingAction[] = [
  {
    id: "act_verify_eko",
    type: "complete_business_profile",
    title: "Complete Eko Health verification",
    description: "Add missing registration details before higher payment limits are enabled.",
    href: "/business/biz_eko_health/settings",
    severity: "warning",
    createdAt: "2026-06-22T12:00:00.000Z",
  },
  {
    id: "act_approve_lagos",
    type: "approve_payment",
    title: "Approve 3 supplier payments",
    description: "Lagos Foods Market has NGN 2.85M waiting for approval.",
    href: "/business/biz_lagos_foods/payments",
    severity: "critical",
    createdAt: "2026-06-22T10:10:00.000Z",
  },
  {
    id: "act_security",
    type: "review_security",
    title: "Review blocked sign-in",
    description: "A blocked sign-in attempt needs a quick account security review.",
    href: "/dashboard/activity",
    severity: "warning",
    createdAt: "2026-06-19T21:45:00.000Z",
  },
];

export function getUserBusinessSummaries(): UserBusinessSummary[] {
  return businesses.map((business, index) => ({
    business,
    role: roles.find((role) => role.id === memberships[index].roleId) ?? roles[3],
    member: memberships[index],
    pendingPaymentsCount: [3, 1, 0][index],
    pendingInvitesCount: invites.filter(
      (invite) => invite.businessId === business.id && invite.status === "pending",
    ).length,
    lastActivityAt: ["2026-06-22T15:30:00.000Z", "2026-06-21T09:00:00.000Z", "2026-06-17T09:05:00.000Z"][index],
  }));
}

export function getBusinessById(businessId: string) {
  return businesses.find((business) => business.id === businessId);
}

export function getBusinessDashboardSummary(businessId: string): BusinessDashboardSummary | null {
  const business = getBusinessById(businessId);

  if (!business) {
    return null;
  }

  const index = businesses.findIndex((item) => item.id === businessId);

  return {
    business,
    currentUserRole: roles.find((role) => role.id === memberships[index].roleId) ?? roles[3],
    payments: [
      { pending: 3, approved: 28, failed: 1, totalValue: 18450000 },
      { pending: 1, approved: 12, failed: 0, totalValue: 7250000 },
      { pending: 0, approved: 7, failed: 2, totalValue: 4120000 },
    ][index],
    invoices: [
      { draft: 4, sent: 18, overdue: 2 },
      { draft: 2, sent: 9, overdue: 1 },
      { draft: 1, sent: 5, overdue: 3 },
    ][index],
    providers: [
      { active: 14, pending: 2 },
      { active: 6, pending: 1 },
      { active: 9, pending: 0 },
    ][index],
    members: [
      { active: 8, invited: 1 },
      { active: 5, invited: 0 },
      { active: 6, invited: 1 },
    ][index],
    recentActivity: auditEvents.filter(
      (event) =>
        typeof event.metadata === "object" &&
        event.metadata !== null &&
        "businessId" in event.metadata &&
        event.metadata.businessId === businessId,
    ),
  };
}
