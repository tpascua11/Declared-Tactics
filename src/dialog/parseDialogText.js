// Inline markup for dialog line text: <hl>word</hl> (theme gold highlight),
// <color:RRGGBB>word</color> (custom color). Non-nested, single pass.
// Returns [{ text, color }] — color null for plain segments.

const TAG_RE = /<hl>(.*?)<\/hl>|<color:([0-9a-fA-F]{6})>(.*?)<\/color>/g;

export const HIGHLIGHT_COLOR = '#f5d76e';

export function parseDialogText(raw) {
  if (!raw) return [];
  const segments = [];
  let lastIndex = 0;
  let match;
  TAG_RE.lastIndex = 0;
  while ((match = TAG_RE.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: raw.slice(lastIndex, match.index), color: null });
    }
    if (match[1] !== undefined) {
      segments.push({ text: match[1], color: HIGHLIGHT_COLOR });
    } else {
      segments.push({ text: match[3], color: `#${match[2]}` });
    }
    lastIndex = TAG_RE.lastIndex;
  }
  if (lastIndex < raw.length) {
    segments.push({ text: raw.slice(lastIndex), color: null });
  }
  return segments;
}
