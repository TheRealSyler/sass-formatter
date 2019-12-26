import { SassTextLine } from '..';

import { FormattingState } from '../state';

import { convertScssOrCss } from './format.convert';

import { PushDebugInfo, isConvert } from '../utility';

export function FormatAtForwardOrAtUse(line: SassTextLine, STATE: FormattingState) {
  if (isConvert(line, STATE)) {
    const convertRes = convertScssOrCss(line.get(), STATE);
    line.set(convertRes.text);
  }
  line.set(line.get().trimStart());
  if (STATE.CONFIG.debug) {
    PushDebugInfo({
      title: '@forward or @use',
      lineNumber: line.lineNumber,
      oldLineText: STATE.lineText,
      newLineText: line.get(),
      debug: STATE.CONFIG.debug
    });
  }
  return line.get();
}
