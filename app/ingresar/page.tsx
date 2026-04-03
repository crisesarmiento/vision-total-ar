import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth/auth-panel";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <AuthPanel mode="signin" />
    </main>
  );
}
