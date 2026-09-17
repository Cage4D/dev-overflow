import { getAuth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getQuestion } from "@/lib/actions/question.action";
import ROUTES from "@/constants/routes";

export default async function EditQuestion({ params }: RouteParams) {
  const { id } = await params;
  if (!id) return notFound();

  const session = await (await getAuth()).api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { data: question, success } = await getQuestion({ questionId: id });
  if (!success) return notFound();

  if (question?.author.toString() !== session?.user?.id)
    redirect(ROUTES.QUESTION(id));
  return (
    <main>
      <QuestionForm question={question} isEdit />
    </main>
  );
}
