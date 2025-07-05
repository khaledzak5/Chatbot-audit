import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import MessageBubble from "@/components/MessageBubble";
import { Message } from "@/pages/Dashboard";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  conversationTitle: string;
}

const ChatInterface = ({ messages, onSendMessage, conversationTitle }: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-foreground mb-2">
                مرحباً بك في AuditGPT
              </h3>
              <p className="text-muted-foreground">
                مساعدك الذكي لمهام التدقيق والامتثال. اسألني عن تخطيط التدقيق، 
                تقييم المخاطر، متطلبات الامتثال، أو أي أسئلة متعلقة بالتدقيق.
              </p>
              <p className="text-muted-foreground mt-2">
                Welcome to AuditGPT - Your AI assistant for internal audit tasks. 
                Ask me about audit planning, risk assessment, compliance, or any audit-related questions.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-card p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="اسأل عن التدقيق والامتثال وتقييم المخاطر... / Ask about auditing, compliance, risk assessment..."
                className="min-h-[40px] resize-none"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleFileUpload}
              className="h-10 w-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </Button>
            <Button
              type="submit"
              disabled={!inputValue.trim()}
              className="h-10 w-10 bg-accent hover:bg-accent/90"
              size="icon"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </Button>
          </form>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.xlsx,.csv"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;