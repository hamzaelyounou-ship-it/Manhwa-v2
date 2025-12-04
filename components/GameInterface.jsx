import React, { useState, useEffect, useRef } from "react";
import GameToolbar from "./GameToolbar";

/**
 * @typedef {"do" | "say" | "think" | "story" | "continue" | "erase"} ModeKey
 *
 * @typedef {object} GameInterfaceProps
 * @property {string} worldSummary
 * @property {string} characterName
 * @property {string} characterClass
 * @property {string} characterBackground
 * @property {string} aiInstructions
 * @property {string} authorsNote
 *
 * @typedef {{ role: "user" | "assistant"; content: string; }} Message
 */

/**
 * @param {GameInterfaceProps} props
 */
export default function GameInterface({
  worldSummary,
  characterName,
  characterClass,
  characterBackground,
  aiInstructions,
  authorsNote,
}) {
  // Type annotations removed
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [activeMode, setActiveMode] = useState("story");
  // Type annotation removed
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * @param {string} userInput
   * @param {ModeKey} mode
   */
  const sendMessage = async (userInput, mode) => {
    if (!userInput && mode !== "continue" && mode !== "erase") return;

    let updatedMessages = [...messages];
    if (mode !== "erase") {
      updatedMessages.push({ role: "user", content: userInput });
    } else {
      // ERASE: remove last user + assistant
      updatedMessages = updatedMessages.slice(0, -2);
      setMessages(updatedMessages);
      return;
    }

    setMessages(updatedMessages);
    setLoading(true);
    setCurrentInput("");

    // Prepare payload
    const payload = {
      messages: updatedMessages,
      worldSummary,
      characterName,
      characterClass,
      characterBackground,
      aiInstructions,
      authorsNote,
      mode,
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        try {
          const parsed = JSON.parse(chunk);
          if (parsed?.content) {
            assistantMessage += parsed.content;
            setMessages([...updatedMessages, { role: "assistant", content: assistantMessage }]);
          }
        } catch {
          // Ignore parse errors for partial chunks
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @param {ModeKey} mode
   */
  const handleModeSelect = (mode) => {
    setActiveMode(mode);
    if (mode === "continue") {
      sendMessage("", "continue");
    } else if (mode === "erase") {
      sendMessage("", "erase");
    }
  };

  /**
   * @param {React.FormEvent} e
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(currentInput, activeMode);
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4">
      {/* Story Log */}
      <div className="flex-1 overflow-y-auto mb-24 space-y-4 max-w-4xl mx-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === "assistant" ? "text-cyan-300" : "text-white"}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="animate-pulse text-gray-400">AI is typing...</div>}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input + Toolbar */}
      <GameToolbar onSelectMode={handleModeSelect} />

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-4xl w-full px-4"
      >
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="Type your action/dialogue/thought/story..."
          className="w-full rounded-full px-4 py-2 bg-black/40 backdrop-blur-md text-white focus:outline-none"
        />
      </form>
    </div>
  );
}
