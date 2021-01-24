import { SassTextLine } from '../sassTextLine';

import { FormattingState } from '../state';

import { getDistanceReversed, isComment as isComment_ } from 'suf-regex';

import { replaceWithOffset, convertLine, replaceSpacesOrTabs } from '../utility';

import { FormatSetTabs } from './format.utility';
import { convertScssOrCss } from './format.convert';
import { PushDebugInfo } from '../logger';

export function FormatProperty(line: SassTextLine, STATE: FormattingState) {
  let convert = false;
  let replaceSpaceOrTabs = false;
  let edit = line.get();
  const isComment = isComment_(line.get());
  let { setSpace, text: SetPropertySpaceRes } = setPropertyValueSpaces(STATE, line.get());
  line.set(SetPropertySpaceRes);
  if (convertLine(line, STATE)) {
    const convertRes = convertScssOrCss(line.get(), STATE);
    line.set(convertRes.text);
    convert = true;
  }
  // Set Context Vars
  STATE.CONTEXT.convert.wasLastLineCss = convert;

  const move = STATE.LOCAL_CONTEXT.indentation.offset !== 0 && !isComment;
  if (!move && canReplaceSpacesOrTabs(STATE, line.get())) {
    line.set(replaceSpacesOrTabs(line.get(), STATE).trimRight());
    replaceSpaceOrTabs = true;
  }

  // Return
  if (move) {
    edit = replaceWithOffset(line.get(), STATE.LOCAL_CONTEXT.indentation.offset, STATE).trimRight();
    PushDebugInfo({
      title: 'PROPERTY: MOVE',
      lineNumber: STATE.currentLine,
      oldLineText: STATE.lines[STATE.currentLine],
      newLineText: edit,
      debug: STATE.CONFIG.debug,
      setSpace,
      offset: STATE.LOCAL_CONTEXT.indentation.offset,
      replaceSpaceOrTabs,
    });
  } else if (
    getDistanceReversed(line.get(), STATE.CONFIG.tabSize) > 0 &&
    STATE.CONFIG.deleteWhitespace
  ) {
    edit = line.get().trimRight();
    PushDebugInfo({
      title: 'PROPERTY: TRAIL',
      lineNumber: STATE.currentLine,
      oldLineText: STATE.lines[STATE.currentLine],
      newLineText: edit,
      debug: STATE.CONFIG.debug,
      setSpace,
      replaceSpaceOrTabs,
    });
  } else if (setSpace || convert || replaceSpaceOrTabs) {
    edit = line.get();
    PushDebugInfo({
      title: 'PROPERTY: CHANGE',
      lineNumber: STATE.currentLine,
      oldLineText: STATE.lines[STATE.currentLine],
      newLineText: edit,
      debug: STATE.CONFIG.debug,
      setSpace,
      replaceSpaceOrTabs,
    });
  } else {
    PushDebugInfo({
      title: 'PROPERTY: DEFAULT',
      lineNumber: STATE.currentLine,
      oldLineText: STATE.lines[STATE.currentLine],
      newLineText: edit,
      debug: STATE.CONFIG.debug,
      setSpace,
      replaceSpaceOrTabs,
    });
  }

  FormatSetTabs(STATE);
  return edit;
}

export function canReplaceSpacesOrTabs(STATE: FormattingState, text: string) {
  return STATE.CONFIG.insertSpaces
    ? /\t/g.test(text)
    : new RegExp(' '.repeat(STATE.CONFIG.tabSize), 'g').test(text);
}

export function setPropertyValueSpaces(STATE: FormattingState, text: string) {

  let setSpace = false;

  if (
    text &&
    (!STATE.LOCAL_CONTEXT.isHtmlTag &&
      (STATE.LOCAL_CONTEXT.isProp || STATE.LOCAL_CONTEXT.isInterpolatedProp) &&
      STATE.CONFIG.setPropertySpace)
  ) {

    let newPropValue = '';
    const [propName, propValue] = text.split(/:(.+)/)

    if (propValue) {
      let wasLastCharSpace = true;

      for (let i = 0; i < propValue.length; i++) {
        const char = propValue[i];

        switch (char) {
          case ' ':
            if (!wasLastCharSpace) {
              newPropValue += char;
              wasLastCharSpace = true;
            }
            break;
          case '.':
            wasLastCharSpace = true;
            newPropValue += char;
            break;
          default:
            wasLastCharSpace = false;
            newPropValue += char;
            break;

        }
      }
    }

    text = `${propName.trimEnd()}:${newPropValue ? ' ' + newPropValue : ''}`

    setSpace = true;
  }
  return { setSpace, text };
}

