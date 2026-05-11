export type WorkJournalViewMode = "grid" | "list";

export type WorkJournalUrlState = {
  initialFilters: string[];
  initialViewMode: WorkJournalViewMode;
};

export type WorkJournalSearchParams = Record<string, string | string[] | undefined>;

export function parseWorkJournalUrlState(
  searchParams: WorkJournalSearchParams | undefined,
  availableFilters: string[],
): WorkJournalUrlState {
  const viewParam = getFirstParam(searchParams?.view);
  const initialViewMode: WorkJournalViewMode = viewParam === "list" ? "list" : "grid";
  const requestedFilters = getAllFilterParams(searchParams?.filters);
  const initialFilters = availableFilters.filter((filter) => requestedFilters.includes(filter));

  return {
    initialFilters,
    initialViewMode,
  };
}

function getFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getAllFilterParams(value: string | string[] | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}
