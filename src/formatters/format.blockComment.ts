import { FormattingState } from '../state';
import { replaceWithOffset, getIndentationOffset, replaceSpacesOrTabs } from '../utility';

export function FormatHandleBlockComment(text: string, STATE: FormattingState) {
  if (/^[\t ]*\/\*/.test(text)) {
    return replaceSpacesOrTabs(text, STATE);
  }

  return replaceWithOffset(
    text,
    getIndentationOffset(text, STATE.CONTEXT.blockCommentDistance + 1, STATE.CONFIG.tabSize).offset,
    STATE
  );
}
