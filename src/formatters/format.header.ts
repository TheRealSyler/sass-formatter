import { SassTextLine } from '../sassTextLine';
import { FormattingState } from '../state';
import { isScssOrCss, isComment as isComment_ } from 'suf-regex';
import {
  replaceSpacesOrTabs,
  replaceWithOffset,
  getBlockHeaderOffset,
  getIndentationOffset,
} from '../utility';
import { convertScssOrCss } from './format.convert';
import { PushDebugInfo } from '../logger';

export function FormatBlockHeader(line: SassTextLine, STATE: FormattingState) {
  let replaceSpaceOrTabs = false;
  let hasBeenConverted = false;
  let additionalTabs = 0;
  let edit: string = line.get();

  // First Convert then set Offset.
  if (
    STATE.CONFIG.convert &&
    isScssOrCss(line.get(), STATE.CONTEXT.convert.wasLastLineCss) &&
    !isComment_(line.get())
  ) {
    const convertRes = convertScssOrCss(line.get(), STATE);
    STATE.CONTEXT.convert.lastSelector = convertRes.lastSelector;
    if (convertRes.increaseTabSize) {
      additionalTabs = STATE.CONFIG.tabSize;
    }
    line.set(convertRes.text);
    STATE.LOCAL_CONTEXT.indentation = getIndentationOffset(
      line.get(),
      STATE.CONTEXT.indentation,
      STATE.CONFIG.tabSize
    );
    hasBeenConverted = true;
  }
  // Set offset.
  let offset =
    STATE.LOCAL_CONTEXT.isAdjacentSelector && STATE.CONTEXT.wasLastLineSelector
      ? STATE.CONTEXT.lastSelectorIndentation - STATE.LOCAL_CONTEXT.indentation.distance
      : getBlockHeaderOffset(
        STATE.LOCAL_CONTEXT.indentation.distance,
        STATE.CONFIG.tabSize,
        STATE.CONTEXT.indentation,
        STATE.LOCAL_CONTEXT.isReset
      );

  if (STATE.LOCAL_CONTEXT.isElse && STATE.CONTEXT.if.isIn) {
    offset = (STATE.CONTEXT.if.indentation - STATE.CONFIG.tabSize) - STATE.LOCAL_CONTEXT.indentation.distance
  } else if (!STATE.LOCAL_CONTEXT.isIf) {
    STATE.CONTEXT.keyframes.isIn =
      STATE.LOCAL_CONTEXT.isAtKeyframes || STATE.LOCAL_CONTEXT.isAtKeyframesPoint;
  }

  STATE.CONTEXT.allowSpace = false;

  if (!hasBeenConverted && STATE.LOCAL_CONTEXT.isClassOrIdSelector) {
    STATE.CONTEXT.convert.lastSelector = '';
  }

  STATE.CONTEXT.convert.wasLastLineCss = hasBeenConverted;

  if (STATE.CONTEXT.firstCommaHeader.exists) {
    offset = STATE.CONTEXT.firstCommaHeader.distance - STATE.LOCAL_CONTEXT.indentation.distance;
  }

  if (line.get().trim().endsWith(',')) {
    if (STATE.CONTEXT.firstCommaHeader.exists !== true) {
      STATE.CONTEXT.firstCommaHeader.distance = STATE.LOCAL_CONTEXT.indentation.distance + offset;
    }
    STATE.CONTEXT.firstCommaHeader.exists = true;
  } else {
    STATE.CONTEXT.firstCommaHeader.exists = false;
  }

  // Convert Spaces to tabs or vice versa depending on the config.
  if (STATE.CONFIG.insertSpaces ? /\t/g.test(line.get()) : / /g.test(line.get())) {
    line.set(replaceSpacesOrTabs(line.get(), STATE));
    replaceSpaceOrTabs = true;
  }

  // Set edit or just return the line text.
  if (offset !== 0) {
    edit = replaceWithOffset(line.get(), offset, STATE).trimRight();
    PushDebugInfo({
      title: 'BLOCK HEADER: MOVE',
      lineNumber: STATE.currentLine,
      oldLineText: STATE.lines[STATE.currentLine],
      newLineText: edit,
      debug: STATE.CONFIG.debug,
      replaceSpaceOrTabs,
      offset: offset,
    });
  } else {
    edit = line.get().trimRight();
    PushDebugInfo({
      title: 'BLOCK HEADER: DEFAULT',
      lineNumber: STATE.currentLine,
      oldLineText: STATE.lines[STATE.currentLine],
      newLineText: edit,
      debug: STATE.CONFIG.debug,
      replaceSpaceOrTabs,
    });
  }

  STATE.CONTEXT.lastSelectorIndentation = Math.max(STATE.LOCAL_CONTEXT.indentation.distance + offset, 0);

  if (STATE.LOCAL_CONTEXT.isReset) {
    STATE.CONTEXT.indentation = Math.max(0, STATE.LOCAL_CONTEXT.indentation.distance + offset);
  } else {
    STATE.CONTEXT.indentation = Math.max(
      0,
      STATE.LOCAL_CONTEXT.indentation.distance +
      offset + // keep in mind that +offset can decrease the number.
      STATE.CONFIG.tabSize +
      additionalTabs
    );
  }

  if (STATE.LOCAL_CONTEXT.isAtKeyframes) {
    STATE.CONTEXT.keyframes.indentation = STATE.CONTEXT.indentation
  }

  if (STATE.LOCAL_CONTEXT.isIf) {
    STATE.CONTEXT.if.indentation = STATE.CONTEXT.indentation
    STATE.CONTEXT.if.isIn = true
  } else {
    STATE.CONTEXT.if.isIn = false

  }

  STATE.CONTEXT.wasLastHeaderIncludeMixin = STATE.LOCAL_CONTEXT.isInclude
  STATE.CONTEXT.wasLastHeaderNestedProp = STATE.LOCAL_CONTEXT.isNestPropHead

  return edit;
}
