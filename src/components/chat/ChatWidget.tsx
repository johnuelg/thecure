import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useProfileBranding } from "@/hooks/useProfileBranding";
import SafeChatImage from "./SafeChatImage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("chat_session_id");
    if (stored) return stored;
    const newId = crypto.randomUUID();
    localStorage.setItem("chat_session_id", newId);
    return newId;
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: brandingProfile } = useProfileBranding();

  const logoUrl = brandingProfile?.logo_url;

  // Load existing conversation on mount
  useEffect(() => {
    const loadConversation = async () => {
      const { data: conversations } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("session_id", sessionId)
        .order("last_message_at", { ascending: false })
        .limit(1);

      if (conversations && conversations.length > 0) {
        const convId = conversations[0].id;
        setConversationId(convId);

        const { data: msgs } = await supabase
          .from("chat_messages")
          .select("id, role, content")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true });

        if (msgs) {
          setMessages(msgs as Message[]);
        }
      }
    };

    loadConversation();
  }, [sessionId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Show tooltip on first visit
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem("chat_tooltip_shown");
    if (!hasSeenTooltip && !isOpen) {
      const showTimer = setTimeout(() => setShowTooltip(true), 1500);
      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
        localStorage.setItem("chat_tooltip_shown", "true");
      }, 6000);
      return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
    }
  }, [isOpen]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://ppnmetjyfixbuoduoddo.supabase.co/functions/v1/chat-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmedInput,
            conversationId,
            sessionId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationId(null);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 0.9, 1.05, 1], opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 rounded-full healthcare-gradient text-primary-foreground shadow-lg shadow-primary/25 dark:shadow-primary/40 flex items-center justify-center hover:shadow-xl hover:shadow-primary/30 transition-all animate-chat-pulse dark:animate-chat-pulse-dark"
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6 text-primary-foreground dark:text-[#41c0c2] dark:drop-shadow-[0_0_10px_rgba(65,192,194,0.8)]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* First-visit tooltip */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
            onClick={() => { setShowTooltip(false); localStorage.setItem("chat_tooltip_shown", "true"); }}
            className="fixed bottom-7 right-20 sm:bottom-9 sm:right-22 z-50 bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm text-foreground whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
          >
            Chat with me 💬
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-card border-r border-b border-border rotate-[-45deg]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[380px] sm:max-w-[calc(100vw-48px)] h-[70vh] sm:h-[500px] max-h-[calc(100vh-100px)] bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <MessageCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Ask me anything</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearConversation}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    title="Clear conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center mb-4">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <MessageCircle className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <h4 className="font-medium mb-2">Welcome!</h4>
                  <p className="text-sm text-muted-foreground">
                    Ask me about services, experience, or projects. I'm here to help!
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {["What services do you offer?", "Tell me about your experience", "What projects have you worked on?"].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInputValue(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted rounded-bl-sm"
                        )}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-table:my-3 prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1 prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-td:border prose-td:border-border prose-table:text-xs">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              skipHtml
                              urlTransform={(url, key) => {
                                try {
                                  const trimmed = url.trim();
                                  // Images: only http(s) or relative/anchor — block data:, javascript:, mailto:, tel:, etc.
                                  if (key === "src") {
                                    return /^(https?:|\/|#)/i.test(trimmed) ? trimmed : "";
                                  }
                                  // Links: allow http(s), mailto, tel, anchor, relative
                                  return /^(https?:|mailto:|tel:|#|\/)/i.test(trimmed) ? trimmed : "";
                                } catch {
                                  return "";
                                }
                              }}
                              components={{
                                a: ({ node, ...props }) => (
                                  <a {...props} target="_blank" rel="noopener noreferrer nofollow" />
                                ),
                                img: ({ node, src, alt, ...props }) => {
                                  if (!src) return null;
                                  return <SafeChatImage {...props} src={src} alt={alt} />;
                                },
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t bg-muted/30">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  disabled={!inputValue.trim() || isLoading}
                  className="healthcare-gradient border-0 text-primary-foreground hover:text-primary-foreground hover:shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
