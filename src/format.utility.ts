import { getDistance } from './utility';
import { isCssPseudo, isCssOneLiner, escapeRegExp, isPseudoWithParenthesis, isClassOrId, isMoreThanOneClassOrId } from './utility.regex';
import { SassFormattingOptions, SassTextLine } from './format.provider';

/**
 * returns the relative distance that the class or id should be at.
 */
export function getCLassOrIdIndentationOffset(distance: number, tabSize: number, current: number, ignoreCurrent: boolean) {
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
export function replaceWithOffset(text: string, offset: number, options: SassFormattingOptions) {
  if (offset < 0) {
    text = text.replace(/\t/g, ' '.repeat(options.tabSize)).replace(new RegExp(`^ {${Math.abs(offset)}}`), '');
    if (!options.insertSpaces) {
      text = replaceSpacesOrTabs(text, false, options.tabSize);
    }
  } else {
    text = text.replace(/^/, options.insertSpaces ? ' '.repeat(offset) : '\t'.repeat(offset / options.tabSize));
  }
  return text;
}
/**
 * returns the difference between the current indentation and the indentation of the given text.
 */
export function getIndentationOffset(text: string, indentation: number, tabSize: number): { offset: number; distance: number } {
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
/**
 * if the Property Value Space is none or more that one, this function returns false, else true;
 */
export function hasPropertyValueSpace(text: string) {
  const split = text.split(':');
  return split[1] === undefined
    ? true
    : split[1][0] === undefined
    ? true
    : split[1].startsWith(' ')
    ? split[1][1] === undefined
      ? true
      : !split[1][1].startsWith(' ')
    : false;
}
/**
 * converts scss/css to sass.
 */
export function convertScssOrCss(
  text: string,
  options: SassFormattingOptions,
  lastSelector: string
): { text: string; increaseTabSize: boolean; lastSelector: string } {
  const isMultiple = isMoreThanOneClassOrId(text);
  StoreConvertInfo('CSS CONVERT');
  StoreConvertInfo(` TEXT: ${text}`);
  if (lastSelector && new RegExp('^.*' + escapeRegExp(lastSelector)).test(text)) {
    StoreConvertInfo(' +  LAST SELECTOR');
    let newText = text.replace(lastSelector, '');
    if (isPseudoWithParenthesis(text)) {
      newText = newText.split('(')[0].trim() + '(&' + ')';
    } else if (text.trim().startsWith(lastSelector)) {
      newText = text.replace(lastSelector, '&');
    } else {
      newText = newText.replace(/ /g, '') + ' &';
    }
    return {
      lastSelector,
      increaseTabSize: true,
      text: replaceWithOffset(removeInvalidChars(newText).trimRight(), options.tabSize, options)
    };
  } else if (isCssOneLiner(text)) {
    StoreConvertInfo(' +  ONE LINER');
    const split = text.split('{');
    return {
      increaseTabSize: false,
      lastSelector: split[0].trim(),
      text: removeInvalidChars(split[0].trim().concat('\n', replaceWithOffset(split[1].trim(), options.tabSize, options))).trimRight()
    };
  } else if (isCssPseudo(text) && !isMultiple) {
    StoreConvertInfo(' +  PSEUDO');
    return {
      increaseTabSize: false,
      lastSelector,
      text: removeInvalidChars(text).trimRight()
    };
  } else if (isClassOrId(text)) {
    StoreConvertInfo(' +  CLASS OR ID');
    lastSelector = removeInvalidChars(text).trimRight();
  }
  StoreConvertInfo(' END/DEFAULT');
  return { text: removeInvalidChars(text).trimRight(), increaseTabSize: false, lastSelector };
}

function removeInvalidChars(text: string) {
  let newText = '';
  let isInQuotes = false;
  let isInComment = false;
  let isInVarSelector = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (!isInQuotes && char === '/' && text[i + 1] === '/') {
      isInComment = true;
    } else if (/['"]/.test(char)) {
      isInQuotes = !isInQuotes;
    } else if (/#/.test(char) && /{/.test(text[i + 1])) {
      isInVarSelector = true;
    } else if (isInVarSelector && /}/.test(text[i - 1])) {
      isInVarSelector = false;
    }
    if (!/[;\{\}]/.test(char) || isInQuotes || isInComment || isInVarSelector) {
      newText += char;
    }
  }
  return newText;
}

export function replaceSpacesOrTabs(text: string, useSpaces: boolean, tabSize: number) {
  if (useSpaces) {
    return text.replace(/\t/g, ' '.repeat(tabSize));
  } else {
    return text.replace(new RegExp(' '.repeat(tabSize), 'g'), '\t');
  }
}
interface LogFormatInfo {
  title: string;
  setSpace?: boolean;
  convert?: boolean;
  offset?: number;
  replaceSpaceOrTabs?: boolean;
  nextLine?: SassTextLine;
}
export function LogFormatInfo(enableDebug: boolean, lineNumber: number, info: LogFormatInfo) {
  if (enableDebug) {
    console.log(
      ' ',
      info.title,
      'Row:',
      lineNumber + 1,
      info.offset !== undefined ? `Offset: ${info.offset}` : '',
      '\n    ',
      'PROPERTY SPACE : ',
      info.setSpace !== undefined ? info.setSpace : 'not provided',
      '\n    ',
      'CONVERT        : ',
      info.convert !== undefined ? info.convert : 'not provided',
      '\n    ',
      'NEXT LINE      : ',
      info.nextLine !== undefined ? info.nextLine : 'not provided',
      '\n    ',
      'REPLACE        : ',
      info.replaceSpaceOrTabs !== undefined ? info.replaceSpaceOrTabs : 'not provided',
      StoreCssConvertLog.log.length > 0 ? '\n' : '',
      StoreCssConvertLog.log.join('\n')
    );
    StoreCssConvertLog.log = [];
  }
}
function StoreConvertInfo(title: string) {
  StoreCssConvertLog.log.push(`      ${title}`);
}
class StoreCssConvertLog {
  static log: string[] = [];
}
