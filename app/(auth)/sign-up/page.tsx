"use client";

import AuthForm from "@/components/forms/AuthForm"
import { signUpWithCredentials } from "@/lib/actions/auth.action";
import { SignUpSchema } from "@/lib/validations"
import { useRouter } from "next/navigation";

export default function SignUp() {
    const router = useRouter();
    return (
        <div>
            <AuthForm
            formType="SIGN_UP"
            schema={SignUpSchema}
            defaultValues={{ username: "", name: "", email: "", password: "" }}
            onSubmit={ async (data) => {
                const result = await signUpWithCredentials(data);
                if (result.success) {
                    router.push("/")
                }
                return result;
            }}/>
        </div>
    );
};