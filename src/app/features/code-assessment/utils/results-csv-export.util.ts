import { AnalyzeResponse, AnalysisResult } from "@app/core/models";

type Severity = "error" | "warning" | "info" | "success";
type CsvValue = string | number | boolean | null | undefined;
type CsvRow = Record<string, CsvValue>;

interface ExportArtifact {
  blob: Blob;
  fileName: string;
}

interface MessageEntry {
  diagnosis?: string;
  recommendation?: string;
  severity?: string;
  rule_id?: number;
}

interface GroupedMessages {
  total: number;
  byFile: Record<string, MessageEntry[]>;
  byPackage: Record<string, MessageEntry[]>;
}

interface OverviewCsvRow extends CsvRow {
  session_id: string;
  timestamp: string;
  metric_id: string;
  metric_name: string;
  category: string;
  global_score_0_10: number;
  module_count: number;
  messages_total: number;
  has_details: boolean;
}

interface ModuleMetricCsvRow extends CsvRow {
  session_id: string;
  metric_id: string;
  metric_name: string;
  file_path: string;
  cohesion_level: string;
  score_0_10: number | undefined;
  nloc: number | undefined;
  n_methods: number | undefined;
  n_possible_pairs: number | undefined;
  n_shared_pairs: number | undefined;
  n_connected_pairs: number | undefined;
  n_components: number | undefined;
  shared_variable_count: number | undefined;
  shared_file_count: number | undefined;
  is_script_file: boolean | undefined;
  ml_content_only: boolean | undefined;
  stages_detected: string;
  phases_detected: string;
  disconnected_methods_count: number | undefined;
}

interface PackageMetricCsvRow extends CsvRow {
  session_id: string;
  metric_id: string;
  metric_name: string;
  package_path: string;
  score_0_10: number | undefined;
  cohesion_level: string;
  total_modules: number | undefined;
  ml_modules: number | undefined;
  n_nodes: number | undefined;
  connections_count: number | undefined;
  n_groups: number | undefined;
  n_pairs: number | undefined;
  n_shared: number | undefined;
  isolated_nodes_count: number | undefined;
  needs_refactoring: boolean | undefined;
  stages_detected: string;
  phases_detected: string;
}

interface IssueCsvRow extends CsvRow {
  session_id: string;
  metric_id: string;
  entity_type: "file" | "package";
  entity_path: string;
  severity: Severity;
  rule_id: number | undefined;
  diagnosis: string;
  recommendation: string;
}

const MODULE_METRICS = new Set(["ccpm", "scpm", "fcpm"]);
const PACKAGE_METRICS = new Set(["fcpp", "scpp", "ccpp"]);

const OVERVIEW_HEADERS = [
  "session_id",
  "timestamp",
  "metric_id",
  "metric_name",
  "category",
  "global_score_0_10",
  "module_count",
  "messages_total",
  "has_details",
];

const MODULE_HEADERS = [
  "session_id",
  "metric_id",
  "metric_name",
  "file_path",
  "cohesion_level",
  "score_0_10",
  "nloc",
  "n_methods",
  "n_possible_pairs",
  "n_shared_pairs",
  "n_connected_pairs",
  "n_components",
  "shared_variable_count",
  "shared_file_count",
  "is_script_file",
  "ml_content_only",
  "stages_detected",
  "phases_detected",
  "disconnected_methods_count",
];

const PACKAGE_HEADERS = [
  "session_id",
  "metric_id",
  "metric_name",
  "package_path",
  "score_0_10",
  "cohesion_level",
  "total_modules",
  "ml_modules",
  "n_nodes",
  "connections_count",
  "n_groups",
  "n_pairs",
  "n_shared",
  "isolated_nodes_count",
  "needs_refactoring",
  "stages_detected",
  "phases_detected",
];

const ISSUE_HEADERS = [
  "session_id",
  "metric_id",
  "entity_type",
  "entity_path",
  "severity",
  "rule_id",
  "diagnosis",
  "recommendation",
];

const CRC32_TABLE = buildCrc32Table();

export function buildResultsCsvExportArtifact(response: AnalyzeResponse): ExportArtifact {
  const sessionId = response.session_id;
  const timestamp = response.timestamp;

  const overviewRows: OverviewCsvRow[] = [];
  const moduleRows: ModuleMetricCsvRow[] = [];
  const packageRows: PackageMetricCsvRow[] = [];
  const issueRows: IssueCsvRow[] = [];

  for (const metric of Object.values(response.results)) {
    const metricId = metric.analyzer_id;
    const metricName = metric.documentation.name;
    const category = metric.documentation.category;
    const groupedMessages = extractGroupedMessages(metric.messages);

    overviewRows.push({
      session_id: sessionId,
      timestamp,
      metric_id: metricId,
      metric_name: metricName,
      category,
      global_score_0_10: roundNumber(metric.score),
      module_count: metric.module_count,
      messages_total: groupedMessages.total,
      has_details: metric.details !== undefined && metric.details !== null,
    });

    issueRows.push(
      ...buildIssueRows(sessionId, metricId, "file", groupedMessages.byFile),
      ...buildIssueRows(sessionId, metricId, "package", groupedMessages.byPackage),
    );

    if (MODULE_METRICS.has(metricId)) {
      moduleRows.push(...buildModuleRows(sessionId, metricId, metricName, metric, groupedMessages.byFile));
    } else if (PACKAGE_METRICS.has(metricId)) {
      packageRows.push(...buildPackageRows(sessionId, metricId, metricName, metric, groupedMessages.byPackage));
    }
  }

  const files = [
    {
      name: "overview.csv",
      content: toCsv(OVERVIEW_HEADERS, overviewRows),
    },
    {
      name: "module_metrics.csv",
      content: toCsv(MODULE_HEADERS, moduleRows),
    },
    {
      name: "package_metrics.csv",
      content: toCsv(PACKAGE_HEADERS, packageRows),
    },
    {
      name: "issues.csv",
      content: toCsv(ISSUE_HEADERS, issueRows),
    },
  ];

  return {
    blob: createZipBlob(files),
    fileName: `mlstoolbox-${sessionId}.zip`,
  };
}

function buildModuleRows(
  sessionId: string,
  metricId: string,
  metricName: string,
  metric: AnalysisResult,
  byFileMessages: Record<string, MessageEntry[]>,
): ModuleMetricCsvRow[] {
  const details = asRecord(metric.details);
  const files = asRecord(details?.["files"]);
  if (!files) return [];

  const rows: ModuleMetricCsvRow[] = [];

  for (const [filePath, fileDataUnknown] of Object.entries(files)) {
    const fileData = asRecord(fileDataUnknown);
    if (!fileData) continue;

    const cohesionLevel = getString(fileData, "cohesion_level");
    const score = getModuleScore(metricId, fileData);

    rows.push({
      session_id: sessionId,
      metric_id: metricId,
      metric_name: metricName,
      file_path: filePath,
      cohesion_level: cohesionLevel ?? "",
      score_0_10: score,
      nloc: getNumber(fileData, "nloc"),
      n_methods: getNumber(fileData, "n_methods"),
      n_possible_pairs: getNumber(fileData, "n_possible_pairs"),
      n_shared_pairs: getNumber(fileData, "n_shared_pairs"),
      n_connected_pairs: getNumber(fileData, "n_connected_pairs"),
      n_components: getNumber(fileData, "n_components"),
      shared_variable_count: getNumber(fileData, "shared_variable_count"),
      shared_file_count: getNumber(fileData, "shared_file_count"),
      is_script_file: getBoolean(fileData, "is_script_file"),
      ml_content_only: getBoolean(fileData, "ml_content_only"),
      stages_detected: safeJoinArray(getStringArray(fileData, "stages_detected")),
      phases_detected: safeJoinArray(getStringArray(fileData, "phases_detected")),
      disconnected_methods_count:
        getNumber(fileData, "n_disconnected_methods") ??
        getStringArray(fileData, "disconnected_methods").length,
    });
  }

  return rows;
}

function buildPackageRows(
  sessionId: string,
  metricId: string,
  metricName: string,
  metric: AnalysisResult,
  byPackageMessages: Record<string, MessageEntry[]>,
): PackageMetricCsvRow[] {
  const details = asRecord(metric.details);
  const packages = asRecord(details?.["packages"]);
  if (!packages) return [];

  const rows: PackageMetricCsvRow[] = [];

  for (const [packagePath, packageDataUnknown] of Object.entries(packages)) {
    const packageData = asRecord(packageDataUnknown);
    if (!packageData) continue;

    const metricsData = asRecord(packageData["metrics"]);
    const qualityIndicators = asRecord(packageData["quality_indicators"]);
    const entityMessages = findMessagesForEntity(byPackageMessages, packagePath);

    const score = getPackageScore(metricId, packageData, metricsData);

    rows.push({
      session_id: sessionId,
      metric_id: metricId,
      metric_name: metricName,
      package_path: packagePath,
      score_0_10: score,
      cohesion_level: getString(metricsData, "cohesion_level") ?? "",
      total_modules: getNumber(metricsData, "total_modules"),
      ml_modules: getNumber(metricsData, "ml_modules"),
      n_nodes: getNumber(packageData, "n_nodes"),
      connections_count: getNumber(packageData, "connections_count"),
      n_groups: getNumber(packageData, "n_groups"),
      n_pairs: getNumber(packageData, "n_pairs"),
      n_shared: getNumber(packageData, "n_shared"),
      isolated_nodes_count: getStringArray(packageData, "isolated_nodes").length,
      needs_refactoring: getBoolean(qualityIndicators, "needs_refactoring"),
      stages_detected: safeJoinArray(getStringArray(packageData, "stages_detected")),
      phases_detected: safeJoinArray(getStringArray(packageData, "phases_detected")),
    });
  }

  return rows;
}

function buildIssueRows(
  sessionId: string,
  metricId: string,
  entityType: "file" | "package",
  groupedMessages: Record<string, MessageEntry[]>,
): IssueCsvRow[] {
  const rows: IssueCsvRow[] = [];

  for (const [entityPath, messages] of Object.entries(groupedMessages)) {
    for (const message of messages) {
      rows.push({
        session_id: sessionId,
        metric_id: metricId,
        entity_type: entityType,
        entity_path: entityPath,
        severity: normalizeSeverity(message.severity),
        rule_id: typeof message.rule_id === "number" ? message.rule_id : undefined,
        diagnosis: message.diagnosis ?? "",
        recommendation: message.recommendation ?? "",
      });
    }
  }

  return rows;
}

function getModuleScore(metricId: string, fileData: Record<string, unknown>): number | undefined {
  if (metricId === "scpm") {
    return scaleToTen(getNumber(fileData, "scpm"));
  }
  if (metricId === "fcpm") {
    return scaleToTen(getNumber(fileData, "fcpm"));
  }
  return undefined;
}

function getPackageScore(
  metricId: string,
  packageData: Record<string, unknown>,
  metricsData: Record<string, unknown> | null,
): number | undefined {
  if (metricId === "fcpp") {
    return scaleToTen(getNumber(packageData, "fcpp"));
  }
  if (metricId === "scpp") {
    return scaleToTen(getNumber(packageData, "scpp"));
  }
  if (metricId === "ccpp") {
    return scaleToTen(getNumber(metricsData, "ccpp_score"));
  }
  return undefined;
}

function normalizeSeverity(rawSeverity: string | undefined): Severity {
  if (!rawSeverity) return "info";

  const normalized = rawSeverity.toLowerCase();
  if (normalized === "critical" || normalized === "error" || normalized === "high") return "error";
  if (normalized === "warning" || normalized === "medium") return "warning";
  if (normalized === "success") return "success";
  return "info";
}

function extractGroupedMessages(messagesUnknown: unknown): GroupedMessages {
  const messages = asRecord(messagesUnknown);
  const byFile = toMessageMap(messages?.["by_file"]);
  const byPackage = toMessageMap(messages?.["by_package"]);

  let total = getNumber(messages, "total") ?? 0;
  if (total === 0) {
    total = Object.values(byFile).reduce((acc, entries) => acc + entries.length, 0);
    total += Object.values(byPackage).reduce((acc, entries) => acc + entries.length, 0);
  }

  return { total, byFile, byPackage };
}

function toMessageMap(value: unknown): Record<string, MessageEntry[]> {
  const map = asRecord(value);
  if (!map) return {};

  const result: Record<string, MessageEntry[]> = {};

  for (const [key, maybeArray] of Object.entries(map)) {
    if (!Array.isArray(maybeArray)) continue;

    const entries: MessageEntry[] = [];
    for (const candidate of maybeArray) {
      const candidateRecord = asRecord(candidate);
      if (!candidateRecord) continue;

      entries.push({
        diagnosis: getString(candidateRecord, "diagnosis") ?? "",
        recommendation: getString(candidateRecord, "recommendation") ?? "",
        severity: getString(candidateRecord, "severity") ?? "info",
        rule_id: getNumber(candidateRecord, "rule_id"),
      });
    }

    result[key] = entries;
  }

  return result;
}

function findMessagesForEntity(
  grouped: Record<string, MessageEntry[]>,
  path: string,
): MessageEntry[] {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  const withSlash = normalized.length > 0 ? `/${normalized}` : path;

  return grouped[path] ?? grouped[normalized] ?? grouped[withSlash] ?? [];
}

function getNumber(record: Record<string, unknown> | null, key: string): number | undefined {
  if (!record) return undefined;
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function getBoolean(record: Record<string, unknown> | null, key: string): boolean | undefined {
  if (!record) return undefined;
  const value = record[key];
  return typeof value === "boolean" ? value : undefined;
}

function getString(record: Record<string, unknown> | null, key: string): string | undefined {
  if (!record) return undefined;
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function getStringArray(record: Record<string, unknown> | null, key: string): string[] {
  if (!record) return [];
  const value = record[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function scaleToTen(value: number | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (value >= 0 && value <= 1) return roundNumber(value * 10);
  return roundNumber(value);
}

function roundNumber(value: number): number {
  return Number(value.toFixed(2));
}

function safeJoinArray(values: string[], separator = "; "): string {
  if (values.length === 0) return "";
  return values.join(separator);
}

function toCsv(headers: string[], rows: CsvRow[]): string {
  const headerLine = headers.map(escapeCsv).join(",");
  const dataLines = rows.map((row) =>
    headers.map((header) => escapeCsv(row[header])).join(","),
  );
  return [headerLine, ...dataLines].join("\n");
}

function escapeCsv(value: CsvValue): string {
  if (value === null || value === undefined) return "";

  const strValue = String(value);
  if (/[",\n\r]/.test(strValue)) {
    return `"${strValue.replace(/"/g, "\"\"")}"`;
  }
  return strValue;
}

function createZipBlob(files: Array<{ name: string; content: string }>): Blob {
  const encoder = new TextEncoder();
  const localRecords: Uint8Array[] = [];
  const centralRecords: Uint8Array[] = [];
  let localOffset = 0;

  const now = new Date();
  const dosTime = toDosTime(now);
  const dosDate = toDosDate(now);

  for (const file of files) {
    const fileNameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.content);
    const crc = crc32(dataBytes);

    const localHeader = new Uint8Array(30 + fileNameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, dataBytes.length, true);
    localView.setUint32(22, dataBytes.length, true);
    localView.setUint16(26, fileNameBytes.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(fileNameBytes, 30);

    const centralHeader = new Uint8Array(46 + fileNameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, dosTime, true);
    centralView.setUint16(14, dosDate, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, dataBytes.length, true);
    centralView.setUint32(24, dataBytes.length, true);
    centralView.setUint16(28, fileNameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, localOffset, true);
    centralHeader.set(fileNameBytes, 46);

    localRecords.push(localHeader, dataBytes);
    centralRecords.push(centralHeader);
    localOffset += localHeader.length + dataBytes.length;
  }

  const centralSize = centralRecords.reduce((acc, entry) => acc + entry.length, 0);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, localOffset, true);
  endView.setUint16(20, 0, true);

  const totalSize =
    localRecords.reduce((acc, entry) => acc + entry.length, 0) +
    centralSize +
    endRecord.length;
  const buffer = new Uint8Array(totalSize);
  let cursor = 0;

  for (const entry of localRecords) {
    buffer.set(entry, cursor);
    cursor += entry.length;
  }
  for (const entry of centralRecords) {
    buffer.set(entry, cursor);
    cursor += entry.length;
  }
  buffer.set(endRecord, cursor);

  return new Blob([buffer], { type: "application/zip" });
}

function toDosTime(date: Date): number {
  const seconds = Math.floor(date.getSeconds() / 2);
  const minutes = date.getMinutes();
  const hours = date.getHours();
  return (hours << 11) | (minutes << 5) | seconds;
}

function toDosDate(date: Date): number {
  const year = Math.max(date.getFullYear(), 1980);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return ((year - 1980) << 9) | (month << 5) | day;
}

function buildCrc32Table(): Uint32Array {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    const index = (crc ^ byte) & 0xff;
    crc = (crc >>> 8) ^ CRC32_TABLE[index];
  }
  return (crc ^ 0xffffffff) >>> 0;
}
