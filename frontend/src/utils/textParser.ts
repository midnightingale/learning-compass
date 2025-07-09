import type { TextSegment } from '../types/message';

export function parseHighlightedText(content: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /@\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: content.slice(lastIndex, match.index),
        isHighlighted: false
      });
    }
    
    segments.push({
      text: match[1],
      isHighlighted: true
    });
    
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({
      text: content.slice(lastIndex),
      isHighlighted: false
    });
  }

  return segments;
}