import { SassTextLine } from '../sassTextLine';

import { FormattingState } from '../state';

import { convertScssOrCss } from './format.convert';

import { convertLine } from '../utility';
import { PushDebugInfo } from '../logger';

export function FormatAtForwardOrAtUse(line: SassTextLine, STATE: FormattingState) {
  if (convertLine(line, STATE)) {
    const convertRes = convertScssOrCss(line.get(), STATE);
    line.set(convertRes.text);
  }
  line.set(line.get().trimStart());
  /* istanbul ignore if */
  if (STATE.CONFIG.debug) {
    PushDebugInfo({
      title: '@forward or @use',
      lineNumber: STATE.currentLine,
      oldLineText: STATE.lines[STATE.currentLine],
      newLineText: line.get(),
      debug: STATE.CONFIG.debug,
    });
  }
  return line.get();
}
