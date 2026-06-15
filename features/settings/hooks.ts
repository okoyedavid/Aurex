"use client";

import {
  mockAuthUser,
  mockBusiness,
  mockNotificationPreferences,
  mockSecuritySettings,
  mockTeamMembers,
  mockUserSessions,
} from "@/features/settings/mock-data";

export function useCurrentUser() {
  // TODO(auth): Replace with the migrated auth user/session provider.
  return { data: mockAuthUser, isLoading: false, error: null };
}

export function useCurrentBusiness() {
  // TODO(api): Replace with the authenticated business endpoint.
  return { data: mockBusiness, isLoading: false, error: null };
}

export function useUserSessions() {
  // TODO(auth): Fetch sessions and expose revoke/revoke-all mutations.
  return { data: mockUserSessions, isLoading: false, error: null };
}

export function useSettings() {
  // TODO(api): Replace with settings queries and mutation handlers.
  return {
    data: {
      notifications: mockNotificationPreferences,
      security: mockSecuritySettings,
      teamMembers: mockTeamMembers,
    },
    isLoading: false,
    error: null,
  };
}
