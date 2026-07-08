import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");

function loadCsv(filename) {
  const raw = fs.readFileSync(path.join(DATA_DIR, filename), "utf-8");
  return parse(raw, { columns: true, skip_empty_lines: true, trim: true });
}

const diseasesRaw = loadCsv("OnnoProhori__diseases_master.csv");
const riskRaw = loadCsv("OnnoProhori__risk_conditions.csv");
const remediesRaw = loadCsv("OnnoProhori__remedies.csv");

// code -> { name_en, name_bn, disease_type, disease_cause, description }
export const DISEASES = Object.fromEntries(diseasesRaw.map((d) => [d.code, d]));

export const RISK_CONDITIONS = riskRaw.map((r) => ({
  disease_code: r.disease_code,
  condition_type: r.condition_type,
  operator: r.operator,
  min_val: Number(r.min_val),
  max_val: Number(r.max_val),
  affected_level: r.affected_level, // low | moderate | high | critical | none
}));

// Order remedies are shown in, and which categories we even bother with
const REMEDY_CATEGORY_ORDER = ["প্রতিরোধক", "কৃষিপ্রক্রিয়াগত", "রাসায়নিক", "পরামর্শ"];

// code -> { category -> [remedy strings] }
export const REMEDIES = {};
for (const row of remediesRaw) {
  const code = row.disease_code;
  const category = row["শ্রেণী"];
  const text = row["প্রতিকার"];
  if (!REMEDIES[code]) REMEDIES[code] = {};
  if (!REMEDIES[code][category]) REMEDIES[code][category] = [];
  REMEDIES[code][category].push(text);
}

// How much an age-bucket's risk level should boost/discount model confidence
const RISK_WEIGHT = { critical: 1.5, high: 1.25, moderate: 1.0, low: 0.75, none: 0.5 };

// young/adult/old -> representative day count, tested against crop_age_days ranges
const AGE_GROUP_DAYS = { young: 15, adult: 45, old: 100 };

/** Look up the affected_level for a disease at a given age bucket. */
export function getAgeRiskLevel(diseaseCode, ageGroup) {
  const day = AGE_GROUP_DAYS[ageGroup];
  if (day == null) return null;
  const match = RISK_CONDITIONS.find(
    (r) =>
      r.disease_code === diseaseCode &&
      r.condition_type === "crop_age_days" &&
      r.operator === "between" &&
      day >= r.min_val &&
      day <= r.max_val
  );
  return match ? match.affected_level : null;
}

/**
 * candidates: [{ disease_code, confidence }] from the AI model, unsorted OK.
 * Combines model confidence with the age-based risk level to re-rank them.
 */
export function pickBestDisease(candidates, ageGroup) {
  const scored = candidates
    .map((c) => {
      const level = getAgeRiskLevel(c.disease_code, ageGroup);
      const weight = RISK_WEIGHT[level] ?? 1.0; // unknown -> neutral, no boost/penalty
      return {
        disease_code: c.disease_code,
        confidence: c.confidence,
        risk_level: level || "unknown",
        score: c.confidence * weight,
      };
    })
    .sort((a, b) => b.score - a.score);

  return { best: scored[0], ranked: scored };
}

export function getRemedies(diseaseCode) {
  const grouped = REMEDIES[diseaseCode] || {};
  return REMEDY_CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => ({
    category: cat,
    items: grouped[cat],
  }));
}

export function getDiseaseMeta(diseaseCode) {
  return DISEASES[diseaseCode] || null;
}