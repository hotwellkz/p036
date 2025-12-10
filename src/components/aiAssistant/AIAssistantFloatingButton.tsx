import { Sparkles } from "lucide-react";
import { useAIAssistantContext } from "./AIAssistantProvider";

export function AIAssistantFloatingButton() {
  const { isOpen, openPanel } = useAIAssistantContext();

  if (isOpen) return null; // Не показываем кнопку, если панель открыта

  return (
    <button
      type="button"
      onClick={openPanel}
      className="fixed bottom-6 right-6 z-[9999] h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30 flex items-center justify-center text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
      aria-label="Открыть AI-ассистента"
      title="AI-ассистент"
    >
      <Sparkles size={24} />
    </button>
  );
}

