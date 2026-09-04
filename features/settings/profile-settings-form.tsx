"use client";

import { UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  accountErrorMessage,
  accountFieldError,
} from "@/features/account/account-errors";
import {
  useDeleteAvatarMutation,
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
} from "@/features/account/account-hooks";
import { useMeQuery } from "@/features/auth/use-me-query";
import { SettingsSection } from "@/features/settings/settings-section";
import { AccountApiError } from "@/lib/account-api";
import {
  uploadAvatarToCloudinary,
  validateAvatarFile,
} from "@/lib/cloudinary-upload";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "User";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function ProfileSettingsForm() {
  const userQuery = useMeQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const updateAvatarMutation = useUpdateAvatarMutation();
  const deleteAvatarMutation = useDeleteAvatarMutation();
  const user = userQuery.data;
  const formKey = user?.id ?? "empty-profile";
  const [profileError, setProfileError] = useState<AccountApiError | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [selectedAvatarPreview, setSelectedAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const avatarPending =
    isUploadingAvatar ||
    updateAvatarMutation.isPending ||
    deleteAvatarMutation.isPending;

  useEffect(() => {
    return () => {
      if (selectedAvatarPreview) {
        URL.revokeObjectURL(selectedAvatarPreview);
      }
    };
  }, [selectedAvatarPreview]);

  function clearSelectedAvatar() {
    if (selectedAvatarPreview) {
      URL.revokeObjectURL(selectedAvatarPreview);
    }

    setSelectedAvatarFile(null);
    setSelectedAvatarPreview(null);
  }

  return (
    <SettingsSection
      id="profile"
      title="Profile settings"
      description="Manage the personal information associated with your Aurex account."
      icon={UserRound}
    >
      {userQuery.isLoading ? (
        <div className="space-y-5">
          <Skeleton className="h-20" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-28 sm:col-span-2" />
          </div>
        </div>
      ) : userQuery.isError ? (
        <FeedbackState
          variant="inline"
          title="Unable to load profile"
          message={userQuery.error.message}
          retry={() => void userQuery.refetch()}
        />
      ) : (
        <form
          key={formKey}
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);

            updateProfileMutation.mutate(
              {
                name: String(formData.get("name") ?? "").trim(),
                username: String(formData.get("username") ?? "").trim(),
                bio: String(formData.get("bio") ?? "").trim(),
              },
              {
                onSuccess: (result) => {
                  setProfileError(null);
                  toast.success(result.message);
                },
                onError: (error) => {
                  setProfileError(
                    error instanceof AccountApiError ? error : null,
                  );
                  toast.error(
                    accountErrorMessage(
                      error,
                      "Unable to update profile. Please try again.",
                    ),
                  );
                },
              },
            );
          }}
        >
          <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center">
            {user?.avatar ? (
              <span
                aria-hidden="true"
                className="h-16 w-16 shrink-0 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: `url("${selectedAvatarPreview ?? user.avatar}")`,
                }}
              />
            ) : (
              <>
                {selectedAvatarPreview ? (
                  <span
                    aria-hidden="true"
                    className="h-16 w-16 shrink-0 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url("${selectedAvatarPreview}")` }}
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                    {getInitials(user?.name ?? user?.username, user?.email)}
                  </div>
                )}
              </>
            )}
            <div>
              <p className="font-semibold text-foreground">Profile image</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Displayed from your account profile when available.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";

                    if (!file) {
                      return;
                    }

                    try {
                      validateAvatarFile(file);
                      clearSelectedAvatar();
                      setSelectedAvatarFile(file);
                      setSelectedAvatarPreview(URL.createObjectURL(file));
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Unable to select image.",
                      );
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-md"
                  disabled={avatarPending}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {selectedAvatarFile ? "Change selected image" : "Change image"}
                </Button>
                {selectedAvatarFile ? (
                  <>
                    <Button
                      type="button"
                      className="h-9 rounded-md"
                      disabled={avatarPending}
                      onClick={async () => {
                        if (!selectedAvatarFile) {
                          return;
                        }

                        try {
                          setIsUploadingAvatar(true);
                          const avatar =
                            await uploadAvatarToCloudinary(selectedAvatarFile);

                          updateAvatarMutation.mutate(
                            { avatar },
                            {
                              onSuccess: (result) => {
                                clearSelectedAvatar();
                                toast.success(result.message);
                              },
                              onError: (error) => {
                                toast.error(
                                  accountErrorMessage(
                                    error,
                                    "Unable to update avatar. Please try again.",
                                  ),
                                );
                              },
                            },
                          );
                        } catch (error) {
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : "Unable to upload image.",
                          );
                        } finally {
                          setIsUploadingAvatar(false);
                        }
                      }}
                    >
                      {avatarPending ? "Uploading..." : "Upload photo"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 rounded-md"
                      disabled={avatarPending}
                      onClick={clearSelectedAvatar}
                    >
                      Cancel
                    </Button>
                  </>
                ) : null}
                {user?.avatar ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 rounded-md text-destructive hover:text-destructive"
                    disabled={avatarPending}
                    onClick={() => {
                      const confirmed = window.confirm(
                        "Remove your profile image?",
                      );

                      if (!confirmed) {
                        return;
                      }

                      deleteAvatarMutation.mutate(undefined, {
                        onSuccess: (result) => {
                          clearSelectedAvatar();
                          toast.success(result.message);
                        },
                        onError: (error) => {
                          toast.error(
                            accountErrorMessage(
                              error,
                              "Unable to remove avatar. Please try again.",
                            ),
                          );
                        },
                      });
                    }}
                  >
                    Remove avatar
                  </Button>
                ) : null}
              </div>
              {selectedAvatarFile ? (
                <div className="mt-3 rounded-md border border-border bg-background p-3">
                  <p className="text-sm font-semibold text-foreground">
                    Preview selected photo
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Review the image above. It will not be uploaded until you click Upload photo.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium text-foreground">
              Name
              <Input
                name="name"
                autoComplete="name"
                defaultValue={user?.name ?? ""}
                aria-invalid={Boolean(accountFieldError(profileError, "name"))}
                aria-describedby={
                  accountFieldError(profileError, "name")
                    ? "profile-name-error"
                    : undefined
                }
                className="mt-2 h-11 rounded-md bg-background"
              />
              {accountFieldError(profileError, "name") ? (
                <span id="profile-name-error" className="mt-2 block text-xs text-destructive">
                  {accountFieldError(profileError, "name")}
                </span>
              ) : null}
            </label>
            <label className="text-sm font-medium text-foreground">
              Username
              <Input
                name="username"
                autoComplete="username"
                defaultValue={user?.username ?? ""}
                aria-invalid={Boolean(
                  accountFieldError(profileError, "username"),
                )}
                aria-describedby={
                  accountFieldError(profileError, "username")
                    ? "profile-username-error"
                    : undefined
                }
                className="mt-2 h-11 rounded-md bg-background"
              />
              {accountFieldError(profileError, "username") ? (
                <span id="profile-username-error" className="mt-2 block text-xs text-destructive">
                  {accountFieldError(profileError, "username")}
                </span>
              ) : null}
            </label>
            <label className="text-sm font-medium text-foreground sm:col-span-2">
              Email address
              <Input
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={user?.email ?? ""}
                disabled
                readOnly
                className="mt-2 h-11 rounded-md bg-muted"
              />
              <span className="mt-2 block text-xs text-muted-foreground">
                Email changes are handled in the secure email card below.
              </span>
            </label>
            <label className="text-sm font-medium text-foreground sm:col-span-2">
              Bio
              <Textarea
                name="bio"
                defaultValue={user?.bio ?? ""}
                aria-invalid={Boolean(accountFieldError(profileError, "bio"))}
                aria-describedby={
                  accountFieldError(profileError, "bio")
                    ? "profile-bio-error"
                    : undefined
                }
                className="mt-2 rounded-md bg-background"
              />
              {accountFieldError(profileError, "bio") ? (
                <span id="profile-bio-error" className="mt-2 block text-xs text-destructive">
                  {accountFieldError(profileError, "bio")}
                </span>
              ) : null}
            </label>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              className="h-10 rounded-md px-5"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      )}
    </SettingsSection>
  );
}
