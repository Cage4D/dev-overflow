import { getAuth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AskAQuestion() {
    const session = await (await getAuth()).api.getSession({ headers: await headers() })
    if (!session) redirect("/sign-in")
    return (
        <>
            <h1 className="h1-bold text-dark100_light900">
                Ask a question!
            </h1>
            <div className="mt-9">
                <QuestionForm/>
            </div>
        </>
    );
};