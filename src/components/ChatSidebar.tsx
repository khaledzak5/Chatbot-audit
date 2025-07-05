import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/pages/Dashboard";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
}

const ChatSidebar = ({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
}: ChatSidebarProps) => {
  const handleLogout = () => {
    localStorage.removeItem("auditgpt_user");
    window.location.href = "/login";
  };

  return (
    <div className="w-64 bg-primary text-primary-foreground flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-primary-foreground/20">
        <h1 className="text-xl font-semibold mb-4">AuditGPT</h1>
        <Button
          onClick={onNewChat}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          + New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                activeConversationId === conversation.id
                  ? "bg-primary-foreground/20"
                  : "hover:bg-primary-foreground/10"
              }`}
            >
              <div className="font-medium text-sm truncate">
                {conversation.title}
              </div>
              {conversation.lastMessage && (
                <div className="text-xs text-primary-foreground/70 mt-1 truncate">
                  {conversation.lastMessage}
                </div>
              )}
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="text-center text-primary-foreground/60 text-sm py-8">
              No conversations yet. Create your first chat!
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-primary-foreground/20">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full text-primary-foreground hover:bg-primary-foreground/10"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebar;