import { getDistance, isScssOrCss, isComment } from 'suf-regex';
import { logger } from './logger';
import { SassTextLine } from './index';
import { FormattingState } from './state';

/**
 * returns the relative distance that the class or id should be at.
 */
export function getBlockHeaderOffset(
  distance: number,
  tabSize: number,
  current: number,
  ignoreCurrent: boolean
) {
  if (distance === 0) {
    return 0;
  }
  if (tabSize * Math.round(distance / tabSize - 0.1) > current && !ignoreCurrent) {
    return current - distance;
  }
  return tabSize * Math.round(distance / tabSize - 0.1) - distance;
}
/**
 * adds or removes whitespace based on the given offset, a positive value adds whitespace a negative value removes it.
 */
export function replaceWithOffset(text: string, offset: number, STATE: FormattingState) {
  if (offset < 0) {
    text = text
      .replace(/\t/g, ' '.repeat(STATE.CONFIG.tabSize))
      .replace(new RegExp(`^ {${Math.abs(offset)}}`), '');
    if (!STATE.CONFIG.insertSpaces) {
      text = replaceSpacesOrTabs(text, STATE, false);
    }
  } else {
    text = text.replace(
      /^/,
      STATE.CONFIG.insertSpaces ? ' '.repeat(offset) : '\t'.repeat(offset / STATE.CONFIG.tabSize)
    );
  }
  return text;
}
/**
 * returns the difference between the current indentation and the indentation of the given text.
 */
export function getIndentationOffset(
  text: string,
  indentation: number,
  tabSize: number
): { offset: number; distance: number } {
  const distance = getDistance(text, tabSize);
  return { offset: indentation - distance, distance };
}
/**
 *
 */
export function isKeyframePoint(text: string, isAtKeyframe: boolean) {
  if (isAtKeyframe === false) {
    return false;
  }
  return /^[\t ]*\d+%/.test(text) || /^[\t ]*from|^[\t ]*to/.test(text);
}

export function replaceSpacesOrTabs(text: string, STATE: FormattingState, insertSpaces?: boolean) {
  if (insertSpaces !== undefined ? insertSpaces : STATE.CONFIG.insertSpaces) {
    return text.replace(/\t/g, ' '.repeat(STATE.CONFIG.tabSize));
  } else {
    return text.replace(new RegExp(' '.repeat(STATE.CONFIG.tabSize), 'g'), '\t');
  }
}
export interface LogFormatInfo {
  title: string;
  debug: boolean;
  lineNumber: number;
  oldLineText: string;
  newLineText: string;
  setSpace?: boolean;
  offset?: number;
  replaceSpaceOrTabs?: boolean;
  nextLine?: SassTextLine;
}

export function PushDebugInfo(info: LogFormatInfo) {
  if (info.debug) {
    StoreLog.logs.push({
      info,
      ConvertData: StoreLog.TempConvertData ? StoreLog.TempConvertData : ({} as LogType)
    });
    StoreLog.resetTempConvertData();
  } else {
    StoreLog.resetTempConvertData();
  }
}
export function Log(res: string) {
  logger.Log('info', StoreLog.logs, res);
}

export interface LogType {
  type: string;
  text: string;
  log: boolean;
}
export interface Log {
  ConvertData: LogType;
  lineNumber: number;
  info: LogFormatInfo;
}
export class StoreLog {
  static TempConvertData: LogType;
  static resetTempConvertData() {
    this.TempConvertData = {
      text: '',
      type: '',
      log: false
    };
  }
  static logs: { ConvertData: LogType; info: LogFormatInfo }[] = [];
}

export function isConvert(line: SassTextLine, STATE: FormattingState) {
  return (
    STATE.CONFIG.convert &&
    isScssOrCss(line.get(), STATE.CONTEXT.convert.wasLastLineCss) &&
    !isComment(line.get())
  );
}
