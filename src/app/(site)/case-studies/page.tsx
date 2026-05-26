import { RipeNativeShell } from "@/components/ripe-native-shell";
import { WorkJournalSection } from "@/components/work-journal-section";
import { mergeCaseStudiesAsJournalItems } from "@/lib/case-studies-journal";
import { getCaseStudies } from "@/lib/content";
import { createExactTitleMetadata } from "@/lib/metadata";
import { parseWorkJournalUrlState, type WorkJournalSearchParams } from "@/lib/work-journal-url-state";

const canonicalPath = "/case-studies";
const title = "Case Studies";

export async function generateMetadata() {
  return createExactTitleMetadata({
    title,
    path: canonicalPath,
  });
}

type CaseStudiesPageProps = {
  searchParams?: Promise<WorkJournalSearchParams>;
};

export default async function CaseStudiesPage({ searchParams }: CaseStudiesPageProps) {
  const studies = await getCaseStudies();
  const { items, filters } = mergeCaseStudiesAsJournalItems(studies);
  const initialState = parseWorkJournalUrlState(await searchParams, filters);

  return (
    <RipeNativeShell>
      <main className="main">
        <WorkJournalSection filters={filters} items={items} layout="alternating" {...initialState} />
      </main>
    </RipeNativeShell>
  );
}
