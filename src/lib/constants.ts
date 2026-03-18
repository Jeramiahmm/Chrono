export const CATEGORIES = [
  { value: "travel", label: "Travel" },
  { value: "achievement", label: "Achievement" },
  { value: "education", label: "Education" },
  { value: "life", label: "Life" },
  { value: "career", label: "Career" },
] as const;

export const VALID_CATEGORIES = CATEGORIES.map((c) => c.value);
