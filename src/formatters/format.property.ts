import { SassTextLine } from '../sassTextLine';
import { FormattingState } from '../state';
import { isComment as isComment_ } from 'suf-regex';
import { replaceWithOffset, convertLine, replaceSpacesOrTabs, getBlockHeaderOffset } from '../utility';
import { convertScssOrCss } from './format.convert';
import { PushDebugInfo } from '../logger';

export function FormatProperty(line: SassTextLine, STATE: FormattingState) {
  let convert = false;
  let replaceSpaceOrTabs = false;
  let edit = line.get();
  const isComment = isComment_(line.get());
  const SetPropertySpaceRes = setPropertyValueSpaces(STATE, line.get());
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
    let offset = STATE.LOCAL_CONTEXT.indentation.offset;
    const distance = STATE.LOCAL_CONTEXT.indentation.distance

    if (STATE.CONTEXT.wasLastHeaderIncludeMixin || STATE.CONTEXT.wasLastHeaderNestedProp) {
      if (distance >= STATE.CONTEXT.indentation - STATE.CONFIG.tabSize) {
        offset = getBlockHeaderOffset(distance,
          STATE.CONFIG.tabSize,
          STATE.CONTEXT.indentation,
          false)
      } else {
        offset = (STATE.CONTEXT.indentation - STATE.CONFIG.tabSize) - distance

        STATE.CONTEXT.wasLastHeaderIncludeMixin = false
        STATE.CONTEXT.wasLastHeaderNestedProp = false
        STATE.CONTEXT.indentation = STATE.CONTEXT.indentation - STATE.CONFIG.tabSize
      }
    } else if (STATE.LOCAL_CONTEXT.isVariable || STATE.LOCAL_CONTEXT.isImport) {
      offset = getBlockHeaderOffset(distance,
        STATE.CONFIG.tabSize,
        STATE.CONTEXT.indentation,
        false)
    }

    edit = replaceWithOffset(line.get(), offset, STATE).trimRight();
    PushDebugInfo({
      title: 'PROPERTY: MOVE',
      lineNumber: STATE.currentLine,
      oldLineText: STATE.lines[STATE.currentLine],
      newLineText: edit,
      debug: STATE.CONFIG.debug,
      offset: offset,
      originalOffset: STATE.LOCAL_CONTEXT.indentation.offset,
      replaceSpaceOrTabs,
    });
  } else {
    edit = line.get().trimRight();
    PushDebugInfo({
      title: 'PROPERTY: DEFAULT',
      lineNumber: STATE.currentLine,
      oldLineText: STATE.lines[STATE.currentLine],
      newLineText: edit,
      debug: STATE.CONFIG.debug,
      replaceSpaceOrTabs,
    });
  }

  if (STATE.CONTEXT.keyframes.isIn && STATE.LOCAL_CONTEXT.isAtKeyframesPoint) {
    STATE.CONTEXT.indentation = Math.max(0, STATE.CONTEXT.indentation + STATE.CONFIG.tabSize);
  }

  return edit;
}

function canReplaceSpacesOrTabs(STATE: FormattingState, text: string) {
  return STATE.CONFIG.insertSpaces
    ? /\t/g.test(text)
    : new RegExp(' '.repeat(STATE.CONFIG.tabSize), 'g').test(text);
}

export function setPropertyValueSpaces(STATE: FormattingState, text: string) {

  if (
    text &&
    (!STATE.LOCAL_CONTEXT.isHtmlTag &&
      (STATE.LOCAL_CONTEXT.isProp || STATE.LOCAL_CONTEXT.isInterpolatedProp || STATE.LOCAL_CONTEXT.isVariable) &&
      STATE.CONFIG.setPropertySpace)
  ) {

    let newPropValue = '';
    const [propName, propValue] = text.split(/:(.*)/)


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


    return `${propName.trimEnd()}:${propValue ? ' ' + newPropValue : ''}`


  }
  return text
}

