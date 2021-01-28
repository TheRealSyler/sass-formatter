import { styler, SetEnvironment } from 'suf-log';
import { SassTextLine } from './sassTextLine';
import { StateLocalContext } from './state';
SetEnvironment('node');

export interface LogFormatInfo {
  title: string;
  debug: boolean;
  lineNumber: number;
  oldLineText: string;
  newLineText?: string;
  offset?: number;
  originalOffset?: number;
  replaceSpaceOrTabs?: boolean;
  nextLine?: SassTextLine;
}

export interface LogConvertData {
  type: string;
  text: string;
}

type Logs = {
  convertData?: LogConvertData;
  LOCAL_CONTEXT?: StateLocalContext
  info: LogFormatInfo;
};

const colon = styler(':', '#777');
// const quote = styler('"', '#f64');
const pipe = styler('|', '#f64');
const TEXT = (text: string) => styler(text, '#eee');
const NUMBER = (number: number) => styler(number.toString(), '#f03');
const BOOL = (bool: Boolean) => styler(bool.toString(), bool ? '#4f6' : '#f03');

export function LogDebugResult(result: string) {
  const data = StoreLog.logs;
  let out = styler('FORMAT', { "font-weight": 'bold', color: '#0af' });
  for (let i = 0; i < data.length; i++) {
    out += '\n';
    out += InfoLogHelper(data[i]);
  }
  out += `
${pipe}${styler(replaceWhitespace(result.replace(/\n/g, '|\n|')), '#c76')}${pipe}`;
  console.log(out);
}

export function ResetDebugLog() {
  StoreLog.reset()
}

class StoreLog {
  static tempConvertData?: LogConvertData;
  static tempLOCAL_CONTEXT?: StateLocalContext;
  static resetTemp() {
    this.tempConvertData = undefined;
    this.tempLOCAL_CONTEXT = undefined
  }
  static logs: Logs[] = [];

  static reset() {
    this.resetTemp()
    this.logs = []
  }
}

export function SetDebugLOCAL_CONTEXT(data: any) {
  StoreLog.tempLOCAL_CONTEXT = data
}

export function SetConvertData(data: LogConvertData) {
  StoreLog.tempConvertData = data
}

export function PushDebugInfo(info: LogFormatInfo) {
  if (info.debug) {
    StoreLog.logs.push({
      info,
      convertData: StoreLog.tempConvertData,
      LOCAL_CONTEXT: StoreLog.tempLOCAL_CONTEXT,
    });
  }
  StoreLog.resetTemp();

}

function InfoLogHelper(data: Logs) {

  const { convertData, info, LOCAL_CONTEXT } = data;

  const notProvided = null;
  const title = styler(info.title, '#cc0');
  const lineNumber = `${TEXT('Line Number')}${colon} ${NUMBER(info.lineNumber)}`;
  const offset =
    info.offset !== undefined ? `${TEXT('Offset')}${colon} ${NUMBER(info.offset)}` : '';

  const originalOffset =
    info.originalOffset !== undefined ? `${TEXT('Original Offset')}${colon} ${NUMBER(info.originalOffset)}` : '';
  const nextLine =
    info.nextLine !== undefined
      ? JSON.stringify(info.nextLine)
        .replace(/[{}]/g, '')
        .replace(/:/g, ': ')
        .replace(/,/g, ', ')
        .replace(/".*?"/g, (s) => {
          return styler(s, '#c76');
        })
      : notProvided;
  const replace =
    info.replaceSpaceOrTabs !== undefined ? BOOL(info.replaceSpaceOrTabs) : notProvided;
  const CONVERT = convertData
    ? `
      ${TEXT('Convert')}        ${colon} ${styler(convertData.type, '#f64')}`
    : '';


  const newText = info.newLineText ? `\n      ${TEXT('New')}            ${colon} ${styler(
    replaceWhitespace(info.newLineText.replace(/\n/g, '\\n')),
    '#0af'
  )}` : ''

  switch (info.newLineText) {
    case 'DELETED':
      return ` ${title} ${lineNumber} ${TEXT('Next Line')}${colon} ${nextLine}`;
    case 'NEWLINE':
    case 'NULL':
      return ` ${title} ${lineNumber}`;
    default:
      let data = '';

      data +=
        nextLine !== null ? `\n      ${TEXT('Next Line')}      ${colon} ${nextLine}` : '';
      data +=
        replace !== null ? `\n      ${TEXT('Replace')}        ${colon} ${replace}` : '';


      if (LOCAL_CONTEXT) {
        data += `\n ${styler('LOCAL_CONTEXT', '#f64')} ${styler('{', '#777')}`
        for (const key in LOCAL_CONTEXT) {
          if (Object.prototype.hasOwnProperty.call(LOCAL_CONTEXT, key)) {
            const val = LOCAL_CONTEXT[key];
            data += `\n    ${styler(key, '#777')}${colon} ${parseValue(val)}`
          }
        }
        data += styler('\n }', '#777')
      }

      return ` ${title} ${lineNumber} ${offset} ${originalOffset}
      ${TEXT('Old')}            ${colon} ${styler(replaceWhitespace(info.oldLineText), '#d75')}${newText}${CONVERT}${data}`;
  }
}
function replaceWhitespace(text: string) {
  return text.replace(/ /g, '·').replace(/\t/g, '⟶');
}


function parseValue(val: any) {
  const type = typeof val
  if (type === 'boolean') {
    return BOOL(val)
  } else if (type === 'string') {
    return styler(val, '#f64')
  } else if (type === 'object') {
    return styler(JSON.stringify(val), '#0af')
  }
  return val
}