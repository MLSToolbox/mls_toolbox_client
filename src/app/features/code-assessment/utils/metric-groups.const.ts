/**
 * Which analysis results are keyed by file path ("module" metrics,
 * details.files) vs. by directory path ("package" metrics,
 * details.packages). Single source of truth - previously duplicated
 * independently in assessment-results-final.component.ts and
 * results-csv-export.util.ts, which could silently drift apart.
 */
export const MODULE_METRICS = new Set(["ccpm", "scpm", "fcpm"]);
export const PACKAGE_METRICS = new Set(["fcpp", "scpp", "ccpp"]);
