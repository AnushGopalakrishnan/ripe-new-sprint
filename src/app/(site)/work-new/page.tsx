import { RipeNativeShell } from "@/components/ripe-native-shell";
import { WorkJournalSection } from "@/components/work-journal-section";
import { workJournalFilters, workJournalItems } from "@/data/work-journal";
import { createExactTitleMetadata } from "@/lib/metadata";
import { parseWorkJournalUrlState, type WorkJournalSearchParams } from "@/lib/work-journal-url-state";

const canonicalPath = "/work-new";
const title = "Work (new journal)";

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
    <RipeNativeShell>
      <main className="main">
        <WorkJournalSection filters={workJournalFilters} items={workJournalItems} {...initialState} />
      </main>
    </RipeNativeShell>
  );
}
