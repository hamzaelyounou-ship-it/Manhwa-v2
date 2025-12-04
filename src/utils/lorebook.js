/**
 * @typedef {object} LoreEntry
 * @property {string} id
 * @property {string} key
 * @property {string} value
 * @property {boolean} [pinned]
 */

/**
 * Injects lore entries into a base prompt string.
 *
 * @param {string} basePrompt - The original prompt.
 * @param {LoreEntry[]} lore - An array of lore entries.
 * @returns {string} The prompt with the injected lore section, or the original prompt if no lore is provided.
 */
export function injectLoreIntoPrompt(basePrompt, lore) {
  if (!lore || lore.length === 0) return basePrompt;
  const sections = lore.map(e => `- ${e.key}: ${e.value}`);
  return `${basePrompt}
\n[LOREBOOK - Injected Knowledge]\n${sections.join('\n')}
\n[END LOREBOOK]\n`;
}
