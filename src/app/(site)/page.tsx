import { HomeFeed } from "@/components/home-feed";
import { HomeHero, RipeSiteShell } from "@/components/native-site-shell";
import { createExactTitleMetadata } from "@/lib/metadata";

const canonicalPath = "/";
const title = "The Natural Outcome | Ripe Studios";

export async function generateMetadata() {
  return createExactTitleMetadata({
    title,
    path: canonicalPath,
  });
}

export default function HomePage() {
  return (
    <RipeSiteShell>
      <HomeHero />
      <HomeFeed />
    </RipeSiteShell>
  );
}
