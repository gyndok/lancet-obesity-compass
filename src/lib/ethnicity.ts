const ASIAN_ETHNICITY_EXACT_MATCHES = new Set([
  "asian",
  "chinese",
  "japanese",
  "korean",
  "indian",
  "vietnamese",
  "thai",
  "filipino"
]);

const ASIAN_ETHNICITY_SUBSTRING_MATCHES = [
  "east asian",
  "south asian",
  "southeast asian"
];

export function isAsianEthnicity(ethnicity?: string | null): boolean {
  if (!ethnicity) {
    return false;
  }

  const normalized = ethnicity.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  if (ASIAN_ETHNICITY_EXACT_MATCHES.has(normalized)) {
    return true;
  }

  return ASIAN_ETHNICITY_SUBSTRING_MATCHES.some(match => normalized.includes(match));
}
