import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { CenteredShell } from "@/components/centered-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signOut } from "../actions";
import { OnboardingForm } from "./form";

export const instant = false;

export default async function OnboardingPage() {
  const { supabase } = await requireSession();
  const { t } = await getT();

  const { data: state, error: stateError } = await supabase.rpc("my_access_state");
  if (stateError) throw new Error("Unable to check account access.");
  if (state === "active") redirect("/app");

  const signOutButton = (
    <form action={signOut} className="mt-4">
      <Button type="submit" variant="ghost" full>
        <LogOut size={18} aria-hidden="true" />
        {t("account.signOut")}
      </Button>
    </form>
  );

  if (state === "inactive") {
    return (
      <CenteredShell>
        <Alert tone="warning" title={t("onboarding.offTitle")}>
          {t("onboarding.offBody")}
        </Alert>
        {signOutButton}
      </CenteredShell>
    );
  }

  // Invited? Join that clinic automatically. Safe to repeat: it does nothing without an invitation.
  const { data: joinedClinic, error: inviteError } = await supabase.rpc("claim_my_invite");
  if (inviteError) throw new Error("Unable to claim the clinic invitation.");
  if (joinedClinic) redirect("/app");

  return (
    <CenteredShell>
      <h1 className="text-3xl font-semibold tracking-tight">{t("onboarding.title")}</h1>
      <p className="mt-2 text-lg text-ink-soft">{t("onboarding.desc")}</p>
      <Card className="mt-6">
        <OnboardingForm />
      </Card>
      {signOutButton}
    </CenteredShell>
  );
}
