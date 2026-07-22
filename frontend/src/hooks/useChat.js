import { useState, useCallback, useRef } from "react";
import { sendChatMessage } from "../lib/api";

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async (text) => {
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      const data = await sendChatMessage(text);
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current = null;
    }
    setMessages([]);
    setIsTyping(false);
    setError(null);
  }, []);

  return { messages, isTyping, error, sendMessage, clearChat };
}
