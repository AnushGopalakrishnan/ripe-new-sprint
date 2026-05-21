import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeamMemberBySlug, getTeamMemberSlugs } from "@/lib/content";
import { createExactTitleMetadata } from "@/lib/metadata";

type TeamMemberPageProps = {
  params: Promise<{ slug: string }>;
};

const PLACEHOLDER_IMAGE = "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg";
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await getTeamMemberSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: TeamMemberPageProps) {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);

  return createExactTitleMetadata({
    title: member?.name ? `${member.name} | Team` : "Team Member",
    path: `/team/${slug}`,
  });
}

export default async function TeamMemberPage({ params }: TeamMemberPageProps) {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);

  if (!member) notFound();

  const bio = member.bio?.trim() || member.bioSummary?.trim() || "";

  return (
    <section className="main">
      <div className="w-layout-hflex team_memeber-flex">
        <div className="left-sticky">
          <div className="w-layout-vflex header_wrap u-align-bottom u-padding-b-32">
            <div className="profile_name">{member.name}</div>
            <div className="profile-job_title-text">{member.role || "Team Member"}</div>
            <div className="profile_details-wrap">
              {member.twitterUrl ? (
                <a href={member.twitterUrl} target="_blank" rel="noreferrer" className="profile-link">
                  Twitter
                </a>
              ) : null}
              {member.email ? (
                <a href={`mailto:${member.email}`} className="profile-link">
                  Mail
                </a>
              ) : null}
              {member.websiteUrl ? (
                <a href={member.websiteUrl} target="_blank" rel="noreferrer" className="profile-link">
                  Website
                </a>
              ) : null}
            </div>
          </div>

          <div className="w-layout-vflex profile_image-wrap u-align-bottom">
            <img
              src={member.avatar?.src || PLACEHOLDER_IMAGE}
              loading="lazy"
              alt={member.name}
              sizes="100vw"
              className="teammember_image"
            />
          </div>
        </div>

        <div className="right-scrolling">
          <div className="w-layout-vflex header_wrap u-align-bottom">
            <div className="profile_bio-text">{bio}</div>
          </div>

          <div className="wrapper">
            <div className="collection-list-wrapper-5 w-dyn-list">
              {member.projects?.length ? (
                <div role="list" className="w-dyn-items">
                  {member.projects
                    .filter((project) => project.slug)
                    .map((project) => (
                      <div key={project.slug} role="listitem" className="w-dyn-item">
                        <Link href={`/case-studies/${project.slug}`} className="profile-link">
                          {project.title || project.slug}
                        </Link>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="w-dyn-empty">
                  <div>No linked projects yet.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="team_memeber-header u-flex-horizontal" />
      <section className="team_memeber-flex u-flex-horizontal" />
    </section>
  );
}
