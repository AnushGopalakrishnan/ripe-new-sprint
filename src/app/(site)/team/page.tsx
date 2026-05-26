import { TeamPageClient } from "@/components/team-page-client";
import { getJobPostings, getTeamMembers } from "@/lib/content";
import { createExactTitleMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return createExactTitleMetadata({
    title: "Team new",
    path: "/team",
  });
}

export default async function TeamPage() {
  const [members, roles] = await Promise.all([getTeamMembers(), getJobPostings()]);

  return <TeamPageClient members={members} roles={roles} />;
}
