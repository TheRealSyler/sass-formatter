import { FormattingState } from '../state';

import {
  isMoreThanOneClassOrId,
  escapeRegExp,
  isPseudoWithParenthesis,
  isCssPseudo,
  isCssSelector
} from 'suf-regex';

import { replaceWithOffset, StoreLog } from '../utility';
import { HandleSetPropertySpace } from './format.property';

/**
 * converts scss/css to sass.
 */
export function convertScssOrCss(
  text: string,
  STATE: FormattingState
): { text: string; increaseTabSize: boolean; lastSelector: string } {
  const isMultiple = isMoreThanOneClassOrId(text);
  let lastSelector = STATE.CONTEXT.convert.lastSelector;
  StoreLog.TempConvertData.log = true;
  StoreLog.TempConvertData.text = text;
  if (!/[\t ]*[#.%]\{.*?}/.test(text)) {
    if (lastSelector && new RegExp('^.*' + escapeRegExp(lastSelector)).test(text)) {
      SetStoreConvertInfoType('LAST SELECTOR');
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
        text: '\n'.concat(
          replaceWithOffset(removeInvalidChars(newText).trimRight(), STATE.CONFIG.tabSize, STATE)
        )
      };
    } else if (isCssOneLiner(text)) {
      SetStoreConvertInfoType('ONE LINER');

      const split = text.split('{');
      const properties = split[1].split(';');
      // Set isProp to true so that it Sets the property space.
      STATE.LOCAL_CONTEXT.isProp = true;
      const selector = split[0].trim();
      return {
        increaseTabSize: false,
        lastSelector: selector,
        text: removeInvalidChars(
          selector.concat(
            '\n',
            properties
              .map(v =>
                replaceWithOffset(
                  HandleSetPropertySpace(STATE, v.trim(), false).text,
                  STATE.CONFIG.tabSize,
                  STATE
                )
              )
              .join('\n')
          )
        ).trimRight()
      };
    } else if (isCssPseudo(text) && !isMultiple) {
      SetStoreConvertInfoType('PSEUDO');
      return {
        increaseTabSize: false,
        lastSelector,
        text: removeInvalidChars(text).trimRight()
      };
    } else if (isCssSelector(text)) {
      SetStoreConvertInfoType('SELECTOR');
      lastSelector = removeInvalidChars(text).trimRight();
      return { text: lastSelector, increaseTabSize: false, lastSelector };
    }
  }
  SetStoreConvertInfoType('DEFAULT');
  return { text: removeInvalidChars(text).trimRight(), increaseTabSize: false, lastSelector };
}

function isCssOneLiner(text: string) {
  return /^[\t ]*[&.#%][\w-]*(?!#)[\t ]*\{.*[;\}][\t ]*$/.test(text);
}

function removeInvalidChars(text: string) {
  let newText = '';
  let isInQuotes = false;
  let isInComment = false;
  let isInInterpolation = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (!isInQuotes && char === '/' && text[i + 1] === '/') {
      isInComment = true;
    } else if (/['"]/.test(char)) {
      isInQuotes = !isInQuotes;
    } else if (/#/.test(char) && /{/.test(text[i + 1])) {
      isInInterpolation = true;
    } else if (isInInterpolation && /}/.test(text[i - 1])) {
      isInInterpolation = false;
    }
    if (!/[;\{\}]/.test(char) || isInQuotes || isInComment || isInInterpolation) {
      newText += char;
    }
  }
  return newText;
}

function SetStoreConvertInfoType(type: string) {
  StoreLog.TempConvertData.type = type;
}
