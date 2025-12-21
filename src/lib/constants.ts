// Indian States
export const INDIAN_STATES = [
  "Himachal Pradesh",
  "Other State",
] as const;

export type IndianState = typeof INDIAN_STATES[number];

// Himachal Pradesh Districts
export const HP_DISTRICTS = [
  "Bilaspur",
  "Chamba",
  "Hamirpur",
  "Kangra",
  "Kinnaur",
  "Kullu",
  "Lahaul & Spiti",
  "Mandi",
  "Shimla",
  "Sirmaur",
  "Solan",
  "Una",
] as const;

export type HPDistrict = typeof HP_DISTRICTS[number];

// State-District mapping
export const STATE_DISTRICTS: Record<IndianState, readonly string[]> = {
  "Himachal Pradesh": HP_DISTRICTS,
  "Other State": ["Other District"],
} as const;

// Get districts for a state
export const getDistrictsForState = (state: IndianState): readonly string[] => {
  return STATE_DISTRICTS[state] || [];
};
