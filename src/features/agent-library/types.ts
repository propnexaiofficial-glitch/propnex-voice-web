export type VoiceTagCategory = "tone" | "accent" | "gender" | "use-case";

export type VoiceTag = {
  label: string;
  category: VoiceTagCategory;
};

export type VoiceAccent = "purple" | "blue" | "green" | "gold" | "pink";

export type VoiceAgent = {
  id: string;
  name: string;
  description: string;
  tags: VoiceTag[];
  accent: VoiceAccent;
  sampleDurationSeconds: number;
  assigned: boolean;
  recommendedFor: string;
};
