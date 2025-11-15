import { FileText, Sparkles } from 'lucide-react';

export const TASK_TYPES = [
  { value: 'summarize', label: 'Text Summarization', icon: FileText },
  { value: 'translate', label: 'Translation', icon: Sparkles },
  { value: 'sentiment', label: 'Sentiment Analysis', icon: Sparkles },
  { value: 'code', label: 'Code Generation', icon: Sparkles },
  { value: 'ocr', label: 'Extract Data', icon: Sparkles },
];