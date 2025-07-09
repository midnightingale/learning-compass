export interface UserMessage {
  type: 'user';
  content: string;
}

export interface AssistantMessage {
  type: 'assistant';
  content: string;
}

export type Message = UserMessage | AssistantMessage;

export interface TextSegment {
  text: string;
  isHighlighted: boolean;
}