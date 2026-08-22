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
    en: "Himsols is Himachal's plantation implementation partner. We coordinate native tree planting on verified farmer land and forest patches, then deliver geo-tagged photos, survival tracking and certificates.",
    hi: "हिमसोल्स हिमाचल का वृक्षारोपण कार्यान्वयन पार्टनर है। हम सत्यापित किसान भूमि और वन क्षेत्रों पर देशी पेड़ लगाने का समन्वय करते हैं, फिर जियो-टैग फोटो, सर्वाइवल ट्रैकिंग और प्रमाण पत्र देते हैं।",
  },
} as const;

export const CTA = {
  primary: { en: "Plant trees", hi: "पेड़ लगवाओ" },
  secondary: { en: "Get CSR proposal", hi: "CSR प्रस्ताव प्राप्त करें" },
} as const;

export type Lang = "en" | "hi";
export const pick = (v: { en: string; hi: string }, lang: string): string =>
  lang === "hi" ? v.hi : v.en;
