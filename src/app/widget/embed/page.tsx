import { ChatWidget } from "@/components/ChatWidget";

export default function WidgetEmbedPage() {
  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <ChatWidget defaultOpen />
    </div>
  );
}
