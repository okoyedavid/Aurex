"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeListsDraftEditor } from "@/features/business/components/employee-lists-draft-editor";
import {
  emptyCreateBusinessForm,
  type CreateBusinessFormState,
  type EmployeeListDraft,
} from "@/features/business/business-draft-types";
import { useCreateBusinessMutation } from "@/features/business/business-hooks";
import { businessErrorMessage } from "@/lib/business-api";
import { buildEmployeeListsPayload } from "@/features/business/employee-list-form";
import {
  deleteCloudinaryUpload,
  uploadAvatarWithRollback,
  validateAvatarFile,
} from "@/lib/cloudinary-upload";

export function CreateBusinessDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createMutation = useCreateBusinessMutation();
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<CreateBusinessFormState>(
    emptyCreateBusinessForm,
  );
  const [formErrors, setFormErrors] = useState<
    Partial<CreateBusinessFormState>
  >({});
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [selectedLogoPreview, setSelectedLogoPreview] = useState<string | null>(
    null,
  );
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [employeeLists, setEmployeeLists] = useState<EmployeeListDraft[]>([]);
  const isSubmitting = isUploadingLogo || createMutation.isPending;

  useEffect(() => {
    return () => {
      if (selectedLogoPreview) {
        URL.revokeObjectURL(selectedLogoPreview);
      }
    };
  }, [selectedLogoPreview]);

  function resetDialog() {
    if (selectedLogoPreview) {
      URL.revokeObjectURL(selectedLogoPreview);
    }

    setForm(emptyCreateBusinessForm);
    setFormErrors({});
    setSelectedLogoFile(null);
    setSelectedLogoPreview(null);
    setEmployeeLists([]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<CreateBusinessFormState> = {};
    if (!form.name.trim()) nextErrors.name = "Business name is required.";
    if (!form.industry.trim()) nextErrors.industry = "Industry is required.";
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    let uploadedImage:
      | Awaited<ReturnType<typeof uploadAvatarWithRollback>>
      | undefined;

    try {
      // Validate and construct the complete API body before creating a remote
      // asset. This avoids orphaned images for client-side validation errors.
      const employeeListsPayload = buildEmployeeListsPayload(employeeLists);

      setIsUploadingLogo(Boolean(selectedLogoFile));
      uploadedImage = selectedLogoFile
        ? await uploadAvatarWithRollback(selectedLogoFile)
        : undefined;
      setIsUploadingLogo(false);

      await createMutation.mutateAsync({
        name: form.name,
        industry: form.industry,
        ...(uploadedImage ? { profile_img: uploadedImage.url } : {}),
        ...(employeeListsPayload.length
          ? { employeeLists: employeeListsPayload }
          : {}),
      });

      toast.success("Business created successfully.");
      resetDialog();
      onOpenChange(false);
    } catch (error) {
      if (uploadedImage?.deleteToken) {
        try {
          await deleteCloudinaryUpload(uploadedImage.deleteToken);
        } catch {
          toast.warning(
            "The business was not created, but its unused image could not be removed automatically.",
          );
        }
      } else if (uploadedImage) {
        toast.warning(
          "The business was not created, but Cloudinary did not provide a deletion token for the unused image.",
        );
      }

      toast.error(businessErrorMessage(error, "Unable to create business."));
    } finally {
      setIsUploadingLogo(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isSubmitting) return;
        onOpenChange(nextOpen);
        if (!nextOpen) resetDialog();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create business</DialogTitle>
          <DialogDescription>
            Add business details and, optionally, payroll employee lists.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <Tabs defaultValue="details">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="details">Business details</TabsTrigger>
              <TabsTrigger value="employees">
                Optional employee lists
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-foreground">
                  Business name
                  <Input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    aria-invalid={Boolean(formErrors.name)}
                    aria-describedby={
                      formErrors.name ? "business-name-error" : undefined
                    }
                    className="mt-2 h-11 rounded-md bg-background"
                    autoComplete="organization"
                  />
                  {formErrors.name ? (
                    <span
                      id="business-name-error"
                      className="mt-2 block text-xs text-destructive"
                    >
                      {formErrors.name}
                    </span>
                  ) : null}
                </label>
                <label className="text-sm font-medium text-foreground">
                  Industry
                  <Input
                    value={form.industry}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        industry: event.target.value,
                      }))
                    }
                    aria-invalid={Boolean(formErrors.industry)}
                    aria-describedby={
                      formErrors.industry
                        ? "business-industry-error"
                        : undefined
                    }
                    className="mt-2 h-11 rounded-md bg-background"
                    placeholder="Fintech, logistics, retail"
                  />
                  {formErrors.industry ? (
                    <span
                      id="business-industry-error"
                      className="mt-2 block text-xs text-destructive"
                    >
                      {formErrors.industry}
                    </span>
                  ) : null}
                </label>
              </div>

              <div className="rounded-md border border-border bg-card p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {selectedLogoPreview ? (
                    <span
                      aria-hidden="true"
                      className="h-16 w-16 shrink-0 rounded-md bg-cover bg-center"
                      style={{
                        backgroundImage: `url("${selectedLogoPreview}")`,
                      }}
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <ImagePlus className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">
                      Profile image
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Optional logo. If selected, it uploads before the business
                      is created.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";

                          if (!file) return;

                          try {
                            validateAvatarFile(file);
                            if (selectedLogoPreview) {
                              URL.revokeObjectURL(selectedLogoPreview);
                            }
                            setSelectedLogoFile(file);
                            setSelectedLogoPreview(URL.createObjectURL(file));
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
                        disabled={isSubmitting}
                        onClick={() => logoInputRef.current?.click()}
                      >
                        {selectedLogoFile ? "Change image" : "Select image"}
                      </Button>
                      {selectedLogoFile ? (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={isSubmitting}
                          onClick={() => {
                            if (selectedLogoPreview) {
                              URL.revokeObjectURL(selectedLogoPreview);
                            }
                            setSelectedLogoFile(null);
                            setSelectedLogoPreview(null);
                          }}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employees">
              <EmployeeListsDraftEditor
                employeeLists={employeeLists}
                setEmployeeLists={setEmployeeLists}
                disabled={isSubmitting}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                resetDialog();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isUploadingLogo ? "Uploading..." : "Creating..."}
                </>
              ) : (
                "Create business"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
