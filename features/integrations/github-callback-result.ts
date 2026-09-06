export const githubCallbackFailureCopy = {
  invalid_state:
    "This connection attempt is invalid or has already been used. Start again from Aurex.",
  expired_state:
    "This connection attempt expired. Start a new connection from Aurex.",
  authorization_failed:
    "GitHub authorization could not be completed. Please try again.",
  installation_not_found:
    "No accessible GitHub App installation was found for this account.",
  installation_not_authorized:
    "Your GitHub account is not authorized to connect that installation.",
  already_connected:
    "This GitHub installation is already connected to another Aurex business.",
} as const;

export type GitHubCallbackFailureReason = keyof typeof githubCallbackFailureCopy;

export function githubCallbackMessage(reason: string | null) {
  if (reason && reason in githubCallbackFailureCopy) {
    return githubCallbackFailureCopy[reason as GitHubCallbackFailureReason];
  }
  return "GitHub authorization could not be completed. Please try again.";
}
