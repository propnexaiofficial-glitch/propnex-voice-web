import type { AgentTool } from "@/features/agent-tools/types";

export const agentTools: AgentTool[] = [
  {
    id: "tool-001",
    name: "Lead Reactivation Agent",
    description: "Re-engages dormant or cold leads with personalized AI outreach calls.",
    longDescription:
      "Automatically identifies inactive leads from your CRM, crafts contextual conversation scripts, and initiates outbound calls to re-engage prospects who haven't responded in 30+ days.",
    category: "Sales",
    status: "active",
    isPremium: true,
    accent: "gold",
    features: ["CRM sync", "Smart scheduling", "Sentiment analysis"],
  },
  {
    id: "tool-002",
    name: "Appointment Booker",
    description: "Schedules property viewings and callbacks during live conversations.",
    longDescription:
      "Integrates with your calendar to offer available time slots, confirm bookings, and send automated reminders to both agents and customers.",
    category: "Scheduling",
    status: "configured",
    isPremium: false,
    accent: "purple",
    features: ["Calendar sync", "SMS reminders", "Timezone aware"],
  },
  {
    id: "tool-003",
    name: "Follow-Up Sequencer",
    description: "Automated multi-touch follow-up sequences across voice and SMS.",
    longDescription:
      "Design multi-step outreach cadences that combine AI voice calls, voicemails, and SMS nudges to maximize contact rates for warm leads.",
    category: "Outbound",
    status: "inactive",
    isPremium: false,
    accent: "blue",
    features: ["Multi-channel", "A/B testing", "Analytics"],
  },
  {
    id: "tool-004",
    name: "Objection Handler",
    description: "Real-time AI assistance for handling common sales objections.",
    longDescription:
      "Provides dynamic response suggestions during live calls when customers raise price, timing, or competitor objections.",
    category: "Sales",
    status: "inactive",
    isPremium: true,
    accent: "pink",
    features: ["Live coaching", "Script library", "Call scoring"],
  },
  {
    id: "tool-005",
    name: "Market Insights Bot",
    description: "Shares live property market data and pricing trends on calls.",
    longDescription:
      "Pulls real-time market comparables, price trends, and neighborhood stats to help agents answer data-driven questions during conversations.",
    category: "Data",
    status: "configured",
    isPremium: true,
    accent: "green",
    features: ["Live data feed", "Area reports", "Price alerts"],
  },
  {
    id: "tool-006",
    name: "Complaint Resolver",
    description: "Empathetic AI handling for customer complaints and escalations.",
    longDescription:
      "Detects negative sentiment, applies de-escalation protocols, and routes complex cases to human agents with full context summaries.",
    category: "Support",
    status: "inactive",
    isPremium: false,
    accent: "purple",
    features: ["Sentiment detection", "Escalation rules", "Case logging"],
  },
];

export const defaultToolConfig = {
  maxRetries: 3,
  callWindow: "09:00 - 18:00",
  language: "English (US)",
  voiceAgentId: "voice-001",
};
