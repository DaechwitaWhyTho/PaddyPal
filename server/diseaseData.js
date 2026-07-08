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

const diseasesRaw = loadCsv("OnnoProhori - diseases_master.csv");
const riskRaw = loadCsv("OnnoProhori - risk_conditions.csv");
const remediesRaw = loadCsv("OnnoProhori - remedies.csv");
const varietyRaw = loadCsv("OnnoProhori - variety_sensitivity.csv");
const symptomsRaw = loadCsv("OnnoProhori - symptoms_variants.csv");

export const CODE_MAP = {
  "bacterial_leaf_blight": "blb",
  "bacterial_leaf_streak": "bls",
  "brown_spot": "bspot",
  "dead_heart": "dh",
  "downy_mildew": "dm",
  "blast": "blast",
  "hispa": "hispa",
  "tungro": "tungro",
  "normal": "normal",
  "bacterial_panicle_blight": "bpb",
  "rice_blast": "blast",
  "rice_hispa": "hispa",
};

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

// code -> [{ variety, risk_level }]
export const VARIETY_SENSITIVITY = {};
for (const row of varietyRaw) {
  const code = row.disease_code;
  if (!VARIETY_SENSITIVITY[code]) VARIETY_SENSITIVITY[code] = [];
  VARIETY_SENSITIVITY[code].push({
    variety: row.variety.trim(),
    risk_level: row.risk_level,
  });
}

// code -> { growth_stage -> [symptom, ...] }
export const SYMPTOMS = {};
for (const row of symptomsRaw) {
  const code = row.disease_code;
  const stage = row.growth_stage;
  if (!SYMPTOMS[code]) SYMPTOMS[code] = {};
  if (!SYMPTOMS[code][stage]) SYMPTOMS[code][stage] = [];
  SYMPTOMS[code][stage].push(row.symptom);
}

// A crop in "adult"/"old" has already passed through earlier growth
// stages, so stages accumulate rather than being mutually exclusive.
const AGE_GROUP_STAGES = {
  young: ["Seedling"],
  adult: ["Seedling", "Tillering"],
  old: ["Seedling", "Tillering", "Panicle", "Maturity"],
};

// How much an age-bucket's risk level should boost/discount model confidence
const RISK_WEIGHT = { critical: 1.5, high: 1.25, moderate: 1.0, low: 0.75, none: 0.5 };

// young/adult/old -> representative day count, tested against crop_age_days ranges
const AGE_GROUP_DAYS = { young: 15, adult: 45, old: 100 };

/** Look up the affected_level for a disease at a given age bucket. */
export function getAgeRiskLevel(diseaseCode, ageGroup) {
  const code = CODE_MAP[diseaseCode] || diseaseCode;
  const day = AGE_GROUP_DAYS[ageGroup];
  if (day == null) return null;
  const match = RISK_CONDITIONS.find(
    (r) =>
      r.disease_code === code &&
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
      const code = CODE_MAP[c.disease_code] || c.disease_code;
      const level = getAgeRiskLevel(code, ageGroup);
      const weight = RISK_WEIGHT[level] ?? 1.0; // unknown -> neutral, no boost/penalty
      return {
        disease_code: code,
        confidence: c.confidence,
        risk_level: level || "unknown",
        score: c.confidence * weight,
      };
    })
    .sort((a, b) => b.score - a.score);

  return { best: scored[0], ranked: scored };
}

export function getRemedies(diseaseCode) {
  const code = CODE_MAP[diseaseCode] || diseaseCode;
  const grouped = REMEDIES[code] || {};
  return REMEDY_CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => ({
    category: cat,
    items: grouped[cat],
  }));
}

export function getDiseaseMeta(diseaseCode) {
  const code = CODE_MAP[diseaseCode] || diseaseCode;
  return DISEASES[code] || null;
}

/** All varieties on record for a disease, with their susceptibility level. */
export function getVarietySensitivity(diseaseCode) {
  const code = CODE_MAP[diseaseCode] || diseaseCode;
  return VARIETY_SENSITIVITY[code] || [];
}

/** Symptoms relevant to the disease at (up to) the crop's current age bucket. */
export function getSymptoms(diseaseCode, ageGroup) {
  const code = CODE_MAP[diseaseCode] || diseaseCode;
  const grouped = SYMPTOMS[code] || {};
  const stages = AGE_GROUP_STAGES[ageGroup] || Object.keys(grouped);
  return stages
    .filter((stage) => grouped[stage]?.length)
    .map((stage) => ({ stage, items: grouped[stage] }));
}