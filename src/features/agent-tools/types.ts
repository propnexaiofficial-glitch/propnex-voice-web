export type AgentToolStatus = "active" | "inactive" | "configured";

export type AgentTool = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  status: AgentToolStatus;
  isPremium: boolean;
  accent: "purple" | "blue" | "green" | "gold" | "pink";
  features: string[];
};

export type ToolConfig = {
  maxRetries: number;
  callWindow: string;
  language: string;
  voiceAgentId: string;
};
