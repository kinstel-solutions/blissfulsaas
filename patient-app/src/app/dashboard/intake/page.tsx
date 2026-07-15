import { api } from "@/lib/api-server";
import IntakeFormClient from "@/components/IntakeFormClient";

export default async function IntakePage({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const intake = await api.intake.get();
  const { session: sessionId } = await searchParams;

  return (
    <IntakeFormClient initialData={intake} sessionId={sessionId} />
  );
}
