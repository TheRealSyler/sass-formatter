import { SassTextLine } from '../sassTextLine';
import { FormattingState } from '../state';
import { isScssOrCss, getDistanceReversed, isComment as isComment_ } from 'suf-regex';

import {
  replaceSpacesOrTabs,
  replaceWithOffset,
  getBlockHeaderOffset,
  getIndentationOffset,
} from '../utility';
import { FormatSetTabs } from './format.utility';
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
      STATE.CONTEXT.tabs,
      STATE.CONFIG.tabSize
    );
    hasBeenConverted = true;
  }
  // Set offset.
  let offset =
    STATE.LOCAL_CONTEXT.isAdjacentSelector && STATE.CONTEXT.wasLastLineSelector
      ? STATE.CONTEXT.lastSelectorTabs - STATE.LOCAL_CONTEXT.indentation.distance
      : getBlockHeaderOffset(
        STATE.LOCAL_CONTEXT.indentation.distance,
        STATE.CONFIG.tabSize,
        STATE.CONTEXT.tabs,
        STATE.LOCAL_CONTEXT.ResetTabs
      );

  if (STATE.CONTEXT.firstCommaHeader.exists) {
    offset = STATE.CONTEXT.firstCommaHeader.distance - STATE.LOCAL_CONTEXT.indentation.distance;
  }

  // Set Context Vars
  STATE.CONTEXT.keyframes.is =
    STATE.LOCAL_CONTEXT.isAtKeyframes || STATE.LOCAL_CONTEXT.isAtKeyframesPoint;
  STATE.CONTEXT.allowSpace = false;

  if (!hasBeenConverted && STATE.LOCAL_CONTEXT.isClassOrIdSelector) {
    STATE.CONTEXT.convert.lastSelector = '';
  }

  STATE.CONTEXT.convert.wasLastLineCss = hasBeenConverted;
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
  } else if (
    getDistanceReversed(line.get(), STATE.CONFIG.tabSize) > 0 &&
    STATE.CONFIG.deleteWhitespace
  ) {
    edit = line.get().trimRight();
    PushDebugInfo({
      title: 'BLOCK HEADER: TRAIL',
      lineNumber: STATE.currentLine,
      oldLineText: STATE.lines[STATE.currentLine],
      newLineText: edit,
      debug: STATE.CONFIG.debug,
      replaceSpaceOrTabs,
    });
  } else if (hasBeenConverted || replaceSpaceOrTabs) {
    edit = line.get();
    PushDebugInfo({
      title: 'BLOCK HEADER: MODIFIED',
      lineNumber: STATE.currentLine,
      oldLineText: STATE.lines[STATE.currentLine],
      newLineText: edit,
      debug: STATE.CONFIG.debug,
      replaceSpaceOrTabs,
    });
  } else {
    PushDebugInfo({
      title: 'BLOCK HEADER: DEFAULT',
      lineNumber: STATE.currentLine,
      oldLineText: STATE.lines[STATE.currentLine],
      newLineText: edit,
      debug: STATE.CONFIG.debug,
      replaceSpaceOrTabs,
    });
  }
  STATE.CONTEXT.lastSelectorTabs = Math.max(STATE.LOCAL_CONTEXT.indentation.distance + offset, 0);
  FormatSetTabs(STATE, { additionalTabs, offset: offset });
  return edit;
}
