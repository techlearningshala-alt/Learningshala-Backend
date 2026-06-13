/** Course values accepted by the CRM (Superleap) webhook. */
export const CRM_ACCEPTED_COURSES = [
  "Executive MBA",
  "B.Com Honours",
  "B.Sc",
  "PG Diploma & Certificate",
  "Diploma Program",
  "Certificate Program",
  "MBA",
  "BCA",
  "BBA",
  "MCA",
  "BCom",
  "MCom",
  "MA",
  "BA(Hons.)",
  "MBA (Dual Specialization)",
  "MSc",
  "BA",
  "MA (Journalism & Mass Communication)",
  "MA (Psychology)",
  "BBA + MBA (Integrated Program)",
  "B.com + MBA (Integrated Program)",
  "BCA + MCA (Integrated Program)",
  "VIT-MBA",
] as const;

export type CrmAcceptedCourse = (typeof CRM_ACCEPTED_COURSES)[number];

const normalizeKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[()]/g, " ")
    .replace(/[._+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Website / form aliases -> CRM course name */
const COURSE_ALIASES: Record<string, CrmAcceptedCourse> = {
  "executive mba": "Executive MBA",
  emba: "Executive MBA",
  "e mba": "Executive MBA",

  "b com honours": "B.Com Honours",
  "bcom honours": "B.Com Honours",
  "bachelor of commerce honours": "B.Com Honours",

  "b sc": "B.Sc",
  bsc: "B.Sc",
  "bachelor of science": "B.Sc",

  "pg diploma and certificate": "PG Diploma & Certificate",
  "pg diploma certificate": "PG Diploma & Certificate",
  "post graduate diploma": "PG Diploma & Certificate",
  "pg diploma": "PG Diploma & Certificate",

  "diploma program": "Diploma Program",
  diploma: "Diploma Program",

  "certificate program": "Certificate Program",
  certificate: "Certificate Program",

  mba: "MBA",
  "online mba": "MBA",
  "distance mba": "MBA",
  "regular mba": "MBA",

  bca: "BCA",
  "bachelor of computer applications": "BCA",

  bba: "BBA",
  "bachelor of business administration": "BBA",

  mca: "MCA",
  "master of computer applications": "MCA",

  bcom: "BCom",
  "b com": "BCom",
  "bachelor of commerce": "BCom",

  mcom: "MCom",
  "m com": "MCom",
  "master of commerce": "MCom",

  ma: "MA",
  "master of arts": "MA",

  "ba hons": "BA(Hons.)",
  "ba honours": "BA(Hons.)",
  "ba hons.": "BA(Hons.)",

  "mba dual specialization": "MBA (Dual Specialization)",
  "dual mba": "MBA (Dual Specialization)",

  msc: "MSc",
  "m sc": "MSc",
  "master of science": "MSc",

  ba: "BA",
  "bachelor of arts": "BA",

  "ma journalism and mass communication": "MA (Journalism & Mass Communication)",
  "ma journalism mass communication": "MA (Journalism & Mass Communication)",
  "journalism and mass communication": "MA (Journalism & Mass Communication)",

  "ma psychology": "MA (Psychology)",
  psychology: "MA (Psychology)",

  "bba mba integrated program": "BBA + MBA (Integrated Program)",
  "bba plus mba integrated program": "BBA + MBA (Integrated Program)",
  "bba mba integrated": "BBA + MBA (Integrated Program)",

  "b com mba integrated program": "B.com + MBA (Integrated Program)",
  "bcom mba integrated program": "B.com + MBA (Integrated Program)",
  "b com plus mba integrated program": "B.com + MBA (Integrated Program)",
  "bcom mba integrated": "B.com + MBA (Integrated Program)",

  "bca mca integrated program": "BCA + MCA (Integrated Program)",
  "bca plus mca integrated program": "BCA + MCA (Integrated Program)",
  "bca mca integrated": "BCA + MCA (Integrated Program)",

  "vit mba": "VIT-MBA",
  vitmba: "VIT-MBA",
};

const CRM_BY_NORMALIZED_KEY = new Map<string, CrmAcceptedCourse>(
  CRM_ACCEPTED_COURSES.map((course) => [normalizeKey(course), course])
);

/**
 * Maps a website/form course value to a CRM-accepted course name.
 * DB can keep the original value; use this only for the CRM webhook payload.
 */
export function mapCourseForCrm(course: string | null | undefined): string {
  const raw = String(course || "").trim();
  if (!raw) return "";

  const key = normalizeKey(raw);

  // 1) Exact match against CRM list
  const exact = CRM_BY_NORMALIZED_KEY.get(key);
  if (exact) return exact;

  // 2) Known alias
  const alias = COURSE_ALIASES[key];
  if (alias) return alias;

  // 3) Partial match — longest CRM name first to avoid "MBA" matching before "Executive MBA"
  const sorted = [...CRM_ACCEPTED_COURSES].sort((a, b) => b.length - a.length);
  for (const crmCourse of sorted) {
    const crmKey = normalizeKey(crmCourse);
    if (key.includes(crmKey) || crmKey.includes(key)) {
      return crmCourse;
    }
  }

  // 4) Fallback: send original (CRM may still reject — visible in logs for adding aliases)
  return raw;
}
