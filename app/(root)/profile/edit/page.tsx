import EditProfile from "@/components/forms/EditProfile";
import { getAuth } from "@/auth";
import { headers } from "next/headers";
import { getUser } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";

export default async function EditProfilePage() {
  const session = await (await getAuth()).api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  if (!currentUserId) redirect("/sign-in");

  const { success, data: user } = await getUser({ userId: currentUserId });
  if (!success || !user) redirect("/");

  return (
    <EditProfile
      userId={currentUserId}
      initialData={{
        name: user.name,
        username: user.username,
        bio: user.bio,
        image: user.image,
        portfolio: user.portfolio,
      }}
    />
  );
}
