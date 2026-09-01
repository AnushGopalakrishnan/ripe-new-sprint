import Link from "next/link";
import type { Route } from "next";

export type ProfileLinkProps = {
  children: string;
  external?: boolean;
  href: string;
};

export function ProfileLink({ children, external = false, href }: ProfileLinkProps) {
  if (external || href.startsWith("mailto:")) {
    return <a href={href} className="profile-link" rel={external ? "noreferrer" : undefined} target={external ? "_blank" : undefined}>{children}</a>;
  }

  return <Link href={href as Route} className="profile-link">{children}</Link>;
}
