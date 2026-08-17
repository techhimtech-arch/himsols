// Single source of truth for Himsols positioning + CTA copy.
// Keep every page consistent: change it here, it changes everywhere.

export const POSITIONING = {
  // Short label / badge
  label: {
    en: "Plantation Implementation Partner",
    hi: "वृक्षारोपण कार्यान्वयन पार्टनर",
  },
  // The one positioning line used on hero, about and footer
  line: {
    en: "Himsols is a tree plantation implementation partner in Himachal Pradesh — we plant native trees, geo-tag them and track survival. Free for farmers.",
    hi: "हिमसोल्स हिमाचल प्रदेश में वृक्षारोपण कार्यान्वयन पार्टनर है — हम देशी पेड़ लगाते हैं, जियो-टैग करते हैं और सर्वाइवल ट्रैक करते हैं। किसानों के लिए नि:शुल्क।",
  },
} as const;

export const CTA = {
  primary: { en: "Plant trees", hi: "पेड़ लगवाओ" },
  secondary: { en: "Get CSR proposal", hi: "CSR प्रस्ताव प्राप्त करें" },
} as const;

export type Lang = "en" | "hi";
export const pick = (v: { en: string; hi: string }, lang: string): string =>
  lang === "hi" ? v.hi : v.en;
