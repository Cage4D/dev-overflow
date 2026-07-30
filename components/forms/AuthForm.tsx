"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
  type SubmitHandler,
} from "react-hook-form";
import { toast } from "sonner";
import type { ZodType } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import ROUTES from "@/constants/routes";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T, T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean }>;
  formType: "SIGN_IN" | "SIGN_UP";
}

export default function AuthForm<T extends FieldValues>({
  schema,
  defaultValues,
  formType,
  onSubmit,
}: AuthFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleFormSubmit: SubmitHandler<T> = async (data) => {
    const result = await onSubmit(data);

    if (result.success) {
      toast.success(
        formType === "SIGN_IN" ? "Signed in successfully." : "Account created successfully."
      );
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Card className="w-full sm:max-w-md border-none bg-transparent shadow-none">
      <CardHeader>
        <CardTitle>{formType === "SIGN_IN" ? "Welcome back" : "Create an account"}</CardTitle>
        <CardDescription>
          {formType === "SIGN_IN"
            ? "Sign in to your account to continue."
            : "Fill in your details to get started."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="auth-form" onSubmit={form.handleSubmit(handleFormSubmit)}>
          <FieldGroup>
            {Object.keys(defaultValues).map((fieldName) => (
              <Controller
                key={fieldName}
                name={fieldName as Path<T>}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={fieldName} className="capitalize">
                      {fieldName === "email" ? "Email address" : fieldName}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={fieldName}
                      type={fieldName.toLowerCase().includes("password") ? "password" : "text"}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      className="paragraph-regular 
                      background-light900_dark300 light-border-2 text-dark300_light700 no-focus
                      min-h-12 rounded-1.5 border"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            ))}
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Button 
            type="submit" 
            form="auth-form" 
            className="primary-gradient paragraph-medium min-h-12 w-full rounded-2 px-4 py-3 font-inter text-light-900!" 
            disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? formType === "SIGN_IN" ? "Signing In..." : "Signing Up...": formType === "SIGN_IN" ? "Sign In" : "Sign Up"}
        </Button>
        {formType === "SIGN_IN" 
        ? <p>Don&apos;t have an account? {" "} <Link href={ROUTES.SIGN_UP} className="paragraph-semibold primary-text-gradient">Sign Up</Link></p>
        : <p>Already have an account? {" "} <Link href={ROUTES.SIGN_IN} className="paragraph-semibold primary-text-gradient">Sign In</Link></p>}
      </CardFooter>
    </Card>
  );
}