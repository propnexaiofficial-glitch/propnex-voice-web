export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { AgentLibraryPageContent } from "@/features/agent-library/components/agent-library-page";

export default function AgentLibraryPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <AgentLibraryPageContent />
    </div>
  );
}
