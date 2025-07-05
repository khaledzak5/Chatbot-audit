import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatSidebar from "@/components/ChatSidebar";
import ChatInterface from "@/components/ChatInterface";
import ThemeToggle from "@/components/ThemeToggle";

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  sources?: string[];
  scores?: number[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem("auditgpt_user");
    if (!user) {
      navigate("/login");
      return;
    }

    // Load conversations from localStorage
    const savedConversations = localStorage.getItem("auditgpt_conversations");
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      setConversations(parsed.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt)
      })));
    }
  }, [navigate]);

  const createNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Chat",
      lastMessage: "",
      createdAt: new Date(),
    };
    
    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setActiveConversationId(newConversation.id);
    setMessages([]);
    
    // Save to localStorage
    localStorage.setItem("auditgpt_conversations", JSON.stringify(updatedConversations));
  };

  const selectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    // Load messages for this conversation from localStorage
    const savedMessages = localStorage.getItem(`auditgpt_messages_${conversationId}`);
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setMessages(parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    } else {
      setMessages([]);
    }
  };

  const sendMessage = async (content: string) => {
    if (!activeConversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "typing...",
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
    };

    const messagesWithLoading = [...messages, userMessage, loadingMessage];
    setMessages(messagesWithLoading);

    try {
      // Use RAG API
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      // Replace loading message with actual response
      const aiMessage: Message = {
        id: loadingMessage.id,
        content: data.response || "أنا مساعد تدقيق داخلي، لا أستطيع الإجابة على أسئلة خارج نطاق المستندات المتوفرة لدي",
        isUser: false,
        timestamp: new Date(),
        sources: data.sources,
        scores: data.scores
      };

      const finalMessages = [...messages, userMessage, aiMessage];
      setMessages(finalMessages);

      // Update conversation title if it's the first message
      const updatedConversations = conversations.map(conv => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            title: conv.title === "New Chat" ? content.slice(0, 50) + (content.length > 50 ? "..." : "") : conv.title,
            lastMessage: content,
          };
        }
        return conv;
      });
      setConversations(updatedConversations);

      // Save to localStorage
      localStorage.setItem(`auditgpt_messages_${activeConversationId}`, JSON.stringify(finalMessages));
      localStorage.setItem("auditgpt_conversations", JSON.stringify(updatedConversations));

    } catch (error) {
      console.error('RAG API Error:', error);
      
      // Replace loading message with error message
      const errorMessage: Message = {
        id: loadingMessage.id,
        content: "أنا مساعد تدقيق داخلي، لا أستطيع الإجابة على أسئلة خارج نطاق المستندات المتوفرة لدي",
        isUser: false,
        timestamp: new Date(),
      };

      const errorMessages = [...messages, userMessage, errorMessage];
      setMessages(errorMessages);
    }
  };

  const activeConversation = conversations.find(conv => conv.id === activeConversationId);

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={createNewChat}
        onSelectConversation={selectConversation}
      />
      <div className="flex-1 flex flex-col">
        {/* Header with theme toggle */}
        <div className="flex justify-between items-center p-4 border-b bg-card">
          <h2 className="text-lg font-semibold text-foreground">
            {activeConversation?.title || "Select a chat"}
          </h2>
          <ThemeToggle />
        </div>
        <ChatInterface
          messages={messages}
          onSendMessage={sendMessage}
          conversationTitle={activeConversation?.title || "Select a chat"}
        />
      </div>
    </div>
  );
};

export default Dashboard;