import { FormattingState } from '../state';

export function FormatHandleBlockComment(text: string, STATE: FormattingState) {
  if (/^\/\*\*/.test(text)) {
    return text;
  }
  return `${STATE.CONFIG.insertSpaces ? ' ' : '\t'}${text.replace(/^[\t ]*/, '')}`;
}
