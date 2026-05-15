import { HomeFeed } from "@/components/home-feed";
import { HomeHero, RipeSiteShell } from "@/components/native-site-shell";
import { createExactTitleMetadata } from "@/lib/metadata";

const canonicalPath = "/home-new-feed";
const title = "Home (new feed)";

export async function generateMetadata() {
  return createExactTitleMetadata({
    title,
    path: canonicalPath,
  });
}

export default function HomeNewFeedPage() {
  return (
    <RipeSiteShell>
      <HomeHero />
      <HomeFeed />
    </RipeSiteShell>
  );
}
