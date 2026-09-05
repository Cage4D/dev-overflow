import handleError from "@/lib/handlers/error";
import dbConnect from "@/lib/mongoose";
import { AccountSchema } from "@/lib/validations";
import Account from "@/database/account.model";
import { ForbiddenError } from "@/lib/http-errors";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const accounts = await Account.find();
    return NextResponse.json(
      { success: true, data: accounts },
      { status: 200 },
    );
  } catch (err) {
    return handleError(err, "api") as APIErrorResponse;
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const validatedData = AccountSchema.parse(body);

    const existingAccount = await Account.findOne({
      provider: validatedData.provider,
      providerAccountId: validatedData.providerAccountId,
    });
    if (existingAccount)
      throw new ForbiddenError(
        "An account with the same provider already exists",
      );

    const newAccount = await Account.create(validatedData);
    return NextResponse.json(
      { success: true, data: newAccount },
      { status: 201 },
    );
  } catch (err) {
    return handleError(err, "api") as APIErrorResponse;
  }
}
