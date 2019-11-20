import { SassFormattingOptions } from '../provider';

export function FormatHandleBlockComment(text: string, options: SassFormattingOptions) {
  if (/^\/\*\*/.test(text)) {
    return text;
  }
  return `${options.insertSpaces ? ' ' : '\t'}${text.replace(/^[\t ]*/, '')}`;
}
