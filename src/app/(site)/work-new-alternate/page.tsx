import { RipeSiteShell } from "@/components/native-site-shell";
import { WorkJournalSection } from "@/components/work-journal-section";
import { workJournalFilters, workJournalItems } from "@/data/work-journal";
import { createExactTitleMetadata } from "@/lib/metadata";
import { parseWorkJournalUrlState, type WorkJournalSearchParams } from "@/lib/work-journal-url-state";

const canonicalPath = "/work-new-alternate";
const title = "Work (alternate journal)";

export async function generateMetadata() {
  return createExactTitleMetadata({
    title,
    path: canonicalPath,
  });
}

type WorkNewPageProps = {
  searchParams?: Promise<WorkJournalSearchParams>;
};

export default async function WorkNewPage({ searchParams }: WorkNewPageProps) {
  const initialState = parseWorkJournalUrlState(await searchParams, workJournalFilters);

  return (
    <RipeSiteShell>
      <main>
        <WorkJournalSection
          filters={workJournalFilters}
          items={workJournalItems}
          layout="alternating"
          {...initialState}
        />
      </main>
    </RipeSiteShell>
  );
}
