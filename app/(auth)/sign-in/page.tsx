"use client";

import AuthForm from "@/components/forms/AuthForm";
import { signInWithCredentials } from "@/lib/actions/auth.action";
import { SignInSchema } from "@/lib/validations";
import { useRouter } from "next/navigation"

export default function SignIn() {
    const router = useRouter();
    return (
        <div>
            <AuthForm
            formType="SIGN_IN"
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={async (data) => {
                const result = await signInWithCredentials(data);
                if (result.success) {
                    router.push("/")
                }
                return result;
            }}/>
        </div>
    );
};