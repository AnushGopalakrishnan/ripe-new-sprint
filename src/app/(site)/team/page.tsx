import { TeamPageClient } from "@/components/team-page-client";
import { getTeamMembers } from "@/lib/content";
import { createExactTitleMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return createExactTitleMetadata({
    title: "Team new",
    path: "/team",
  });
}

export default async function TeamPage() {
  const members = await getTeamMembers();

  return <TeamPageClient members={members} />;
}
