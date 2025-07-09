import type { TextSegment } from '../types/message';

/**
 * Parses text content that contains highlighted sections marked with @[text] syntax
 * and returns an array of text segments with highlight information.
 * 
 * @param content - The input text that may contain @[highlighted] sections
 * @returns Array of TextSegment objects with text and isHighlighted properties
 * 
 * @example
 * parseHighlightedText("This is @[highlighted] text")
 * // Returns: [
 * //   { text: "This is ", isHighlighted: false },
 * //   { text: "highlighted", isHighlighted: true },
 * //   { text: " text", isHighlighted: false }
 * // ]
 */
export function parseHighlightedText(content: string): TextSegment[] {
  const segments: TextSegment[] = [];
  
  // Regular expression to match @[text] patterns for highlighted sections
  const regex = /@\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  // Iterate through all matches of the highlight pattern
  while ((match = regex.exec(content)) !== null) {
    // Add any regular text before the current match
    if (match.index > lastIndex) {
      segments.push({
        text: content.slice(lastIndex, match.index),
        isHighlighted: false
      });
    }
    
    // Add the highlighted text (capture group 1 contains the text inside @[])
    segments.push({
      text: match[1],
      isHighlighted: true
    });
    
    // Update position to continue searching after this match
    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text after the last match
  if (lastIndex < content.length) {
    segments.push({
      text: content.slice(lastIndex),
      isHighlighted: false
    });
  }

  return segments;
}