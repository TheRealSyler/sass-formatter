import { FormattingState } from '../state'

import {
  escapeRegExp, isCssOneLiner,
  // isPseudoWithParenthesis,
  isCssPseudo,
  isCssSelector, isMoreThanOneClassOrId
} from '../regex/regex'

import { SetConvertData } from '../logger'
import { replaceWithOffset } from '../utility'
import { setPropertyValueSpaces } from './format.property'

/** converts scss/css to sass. */
export function convertScssOrCss(text: string, STATE: FormattingState) {
  const isMultiple = isMoreThanOneClassOrId(text);
  let lastSelector = STATE.CONTEXT.convert.lastSelector;

  // if NOT interpolated class, id or partial
  if (!/[\t ]*[#.%]\{.*?}/.test(text)) {
    if (lastSelector && new RegExp('^.*' + escapeRegExp(lastSelector)).test(text)) {
      /*istanbul ignore if */
      if (STATE.CONFIG.debug) SetConvertData({ type: 'LAST SELECTOR', text });

      return {
        lastSelector,
        increaseTabSize: false,
        text: replaceWithOffset(removeInvalidChars(text.replaceAll(lastSelector, '&')).trimEnd(), STATE.CONFIG.tabSize, STATE),
      };
    } else if (isCssOneLiner(text)) {
      /*istanbul ignore if */
      if (STATE.CONFIG.debug) SetConvertData({ type: 'ONE LINER', text });

      const split = text.split('{');
      const properties = split[1].split(';');
      // Set isProp to true so that it Sets the property space.
      STATE.LOCAL_CONTEXT.isProp = true;
      const selector = split[0].trim();
      return {
        increaseTabSize: false,
        lastSelector: selector,
        text:
          selector.concat(
            '\n',
            properties
              .map((v) =>
                replaceWithOffset(
                  setPropertyValueSpaces(STATE, removeInvalidChars(v)).trim(),
                  STATE.CONFIG.tabSize,
                  STATE
                )
              )
              .join('\n')
          ).trimEnd()
        ,
      };
    } else if (isCssPseudo(text) && !isMultiple) {
      /*istanbul ignore if */
      if (STATE.CONFIG.debug) SetConvertData({ type: 'PSEUDO', text });

      return {
        increaseTabSize: false,
        lastSelector,
        text: removeInvalidChars(text).trimEnd(),
      };
    } else if (isCssSelector(text)) {
      /*istanbul ignore if */
      if (STATE.CONFIG.debug) SetConvertData({ type: 'SELECTOR', text });

      lastSelector = removeInvalidChars(text).trimEnd();
      return { text: lastSelector, increaseTabSize: false, lastSelector };
    }
  }
  /*istanbul ignore if */
  if (STATE.CONFIG.debug) SetConvertData({ type: 'DEFAULT', text });

  return { text: removeInvalidChars(text).trimEnd(), increaseTabSize: false, lastSelector };
}

function removeInvalidChars(text: string) {
  let newText = ''
  let isInQuotes = false
  let isInComment = false
  let isInInterpolation = false
  let quoteChar = ''
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (!isInQuotes && char === '/' && text[i + 1] === '/') {
      isInComment = true
    } else if (/['"]/.test(char)) {
      if (!isInQuotes || char === quoteChar) {
        isInQuotes = !isInQuotes
        if (isInQuotes) {
          quoteChar = char
        }
      }
    } else if (/#/.test(char) && /{/.test(text[i + 1])) {
      isInInterpolation = true
    } else if (isInInterpolation && /}/.test(text[i - 1])) {
      isInInterpolation = false
    }
    if (!/[;\{\}]/.test(char) || isInQuotes || isInComment || isInInterpolation) {
      newText += char;
    }
  }
  return newText;
}

