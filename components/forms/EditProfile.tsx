"use client"

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { EditProfileSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { editProfile } from "@/lib/actions/user.action";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";

interface EditProfileProps {
  userId: string;
  initialData: {
    name: string;
    username: string;
    bio?: string;
    image?: string;
    portfolio?: string;
  };
}

export default function EditProfile({ userId, initialData }: EditProfileProps) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(EditProfileSchema),
    defaultValues: {
      userId,
      name: initialData.name,
      username: initialData.username,
      bio: initialData.bio || "",
      image: initialData.image || "",
      portfolio: initialData.portfolio || "",
    },
  });

  const handleSubmit = async (data: EditProfileParams) => {
    const result = await editProfile(data);
    if (result.success) {
      toast.success("Profile updated successfully.");
      router.push(ROUTES.PROFILE(userId));
    } else {
      toast.error(result.error?.message ?? "Something went wrong.");
    }
  };

  return (
    <Card className="w-full max-w-2xl border bg-transparent shadow-none">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your public profile information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="edit-profile-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <Input {...field} id="name" className="min-h-11" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </>
                )}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <Input {...field} id="username" className="min-h-11" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </>
                )}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Controller
                name="bio"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <Textarea {...field} id="bio" className="min-h-28" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </>
                )}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="portfolio">Portfolio URL</FieldLabel>
              <Controller
                name="portfolio"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <Input {...field} id="portfolio" placeholder="https://..." className="min-h-11" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </>
                )}
              />
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(ROUTES.PROFILE(userId))}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="edit-profile-form"
          className="primary-gradient text-light-900!"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
