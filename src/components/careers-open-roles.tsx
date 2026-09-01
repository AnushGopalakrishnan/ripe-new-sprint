"use client";

import { CopyEmailCta } from "@/components/copy-email-cta";
import { DirectionalRoleItem } from "@/components/directional-role-item";
import styles from "@/components/careers-open-roles.module.css";
import teamStyles from "@/components/team-page-client.module.css";
import typeStyles from "@/styles/careers-typography.module.css";
import type { JobPosting } from "@/types/content";

export type CareersOpenRolesProps = { roles: JobPosting[] };

export default function CareersOpenRoles({ roles }: CareersOpenRolesProps) {
  return (
    <div className={`join_us-section ${styles.root}`}>
      <section className={`join_us-wrap ${styles.wrap}`}>
        <div className={`join_us ${styles.inner}`}>
          <div className={`join_us_content ${styles.content}`}>
            <div className="w-layout-vflex content-wrap u-justify-left">
              <h2 className={typeStyles.h1} data-careers-reveal>Join Us</h2>
              <p data-careers-reveal data-careers-reveal-delay="1">
                All our roles are remote and flexible, keeping with our studio policy.
                <br />
                Aliqua quis magna eu ipsum consectetur. Esse cupidatat consectetur do sint esse aliquip.
                <br />
                <br />
                If you don&apos;t see a open role here that fits you, but you still think you&apos;d be a good fit at
                Ripe, feel free to drop a line at{" "}
                <CopyEmailCta className={teamStyles.copyEmail} email="careers@ripe.studio" />
                !
                <br />
                <br />
                We&apos;re always on the lookout for talent, and if we find the right people, we will make it work for
                you!
              </p>
            </div>

            <div className="w-layout-vflex content-wrap u-justify-left u-width-full">
              <div className="w-layout-hflex content-wrap u-width-full u-align-top">
                <h2 className={typeStyles.h1} data-careers-reveal>Open Roles</h2>
              </div>

              <div data-type="all" data-directional-hover="" data-careers-reveal data-careers-reveal-delay="1" className={`jobs-list-wrapper w-dyn-list ${teamStyles.directionalWrap}`}>
                <div role="list" className="jobs-list w-dyn-items">
                  {roles.map((role) => (
                    <DirectionalRoleItem key={`${role.title}-${role.location}-${role.contractType}`} role={role} titleElement="h4" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
