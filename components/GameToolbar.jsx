import React from "react";

/**
 * @typedef {object} GameToolbarProps
 * @property {string} mode
 * @property {(mode: string) => void} setMode
 * @property {(mode?: string) => void} sendMessage
 * @property {string} input
 * @property {(val: string) => void} setInput
 * @property {() => void} undo
 * @property {() => void} redo
 */

/**
 * @param {GameToolbarProps} props
 */
export const GameToolbar = ({
  mode,
  setMode,
  sendMessage,
  input,
  setInput,
  undo,
  redo,
}) => {
  // Removed explicit type annotation from toolbarButtons
  const toolbarButtons = [
    { key: "do", label: "🗡️ Do" },
    { key: "say", label: "💬 Say" },
    { key: "think", label: "💭 Think" },
    { key: "story", label: "📖 Story" },
    { key: "continue", label: "🔄 Continue" },
    { key: "erase", label: "🗑️ ERASE" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 flex gap-2 z-50">
      {toolbarButtons.map((b) => (
        <button
          key={b.key}
          // Note: The logic here assumes `sendMessage` handles setting the mode and sending the message.
          // This must match the `handleModeSelect` logic in GameInterface.
          // Since the prop passing in GameInterface is currently `onSelectMode`, we will
          // assume for this isolated conversion that this is the intended usage, but this component
          // seems to handle both mode selection and sending simultaneously, which is different
          // from how the parent `GameInterface.jsx` calls it.
          onClick={() => sendMessage(b.key)}
          className={`px-3 py-1 rounded hover:bg-white/10 ${
            mode === b.key ? "bg-cyan-500 text-black font-semibold" : ""
          }`}
        >
          {b.label}
        </button>
      ))}
      <input
        type="text"
        className="ml-2 bg-gray-800/60 px-3 py-1 rounded w-64 focus:outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your action or dialogue..."
      />
      <button onClick={undo} className="px-2 py-1 hover:bg-white/10 rounded">
        ↩️
      </button>
      <button onClick={redo} className="px-2 py-1 hover:bg-white/10 rounded">
        ↪️
      </button>
    </div>
  );
};
