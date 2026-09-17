"use server";

import { z } from "zod";
import action from "../handlers/action";
import { SignInSchema, SignUpSchema } from "../validations";
import handleError from "../handlers/error";
import { getAuth } from "@/auth";
import { headers } from "next/headers"

type AuthCredentials = z.infer<typeof SignUpSchema>;

export async function signUpWithCredentials(params: AuthCredentials) {
  const validationResult = await action({ params, schema: SignUpSchema });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { name, username, email, password } = validationResult.params!;

  try {
    const auth = await getAuth();
    await auth.api.signUpEmail({
      headers: await headers(),
      body: { name, email, password, username },
    });

    return { success: true };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}

export async function signInWithCredentials(
  params: Pick<AuthCredentials, "email" | "password">,
) {
  const validationResult = await action({ params, schema: SignInSchema });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { email, password } = validationResult.params!;

  try {
    const auth = await getAuth();
    await auth.api.signInEmail({
      headers: await headers(),
      body: { email, password },
    });

    return { success: true };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}
