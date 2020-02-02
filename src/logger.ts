import { styler, SetEnvironment } from '@sorg/log';
import { SassTextLine } from './sassTextLine';
SetEnvironment('node');

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

export interface LogConvertData {
  type: string;
  text: string;
  log: boolean;
}

type Logs = {
  ConvertData: LogConvertData;
  info: LogFormatInfo;
};

const colon = styler(':', '#777');
// const quote = styler('"', '#f64');
const pipe = styler('|', '#f64');
const TEXT = (text: string) => styler(text, '#bbb');
const NUMBER = (number: number) => styler(number.toString(), '#f03');
const BOOL = (bool: Boolean) => styler(bool.toString(), bool ? '#0c0' : '#c00');

export function LogDebugResult(result: string) {
  const data = StoreLog.logs;
  let out = styler('FORMAT', '#0af');
  for (let i = 0; i < data.length; i++) {
    out += '\n';
    out += InfoLogHelper(data[i]);
  }
  out += `
${pipe}${styler(replaceWhitespace(result.replace(/\n/g, '|\n|')), '#c76')}${pipe}`;
  console.log(out);
}

const emptyTempConvertData: LogConvertData = {
  text: '',
  type: '',
  log: false
};
export class StoreLog {
  static TempConvertData: LogConvertData = emptyTempConvertData;
  static resetTempConvertData() {
    this.TempConvertData = emptyTempConvertData;
  }
  static logs: Logs[] = [];
}

export function PushDebugInfo(info: LogFormatInfo) {
  if (info.debug) {
    StoreLog.logs.push({
      info,
      ConvertData: StoreLog.TempConvertData ? StoreLog.TempConvertData : ({} as LogConvertData)
    });
    StoreLog.resetTempConvertData();
  } else {
    StoreLog.resetTempConvertData();
  }
}

function InfoLogHelper(data: Logs) {
  if (data) {
    const { ConvertData, info } = data;

    const notProvided = null;
    const title = styler(info.title, '#cc0');
    const row = `${TEXT('Row')}${colon} ${NUMBER(info.lineNumber)}`;
    const offset =
      info.offset !== undefined ? `${TEXT('Offset')}${colon} ${NUMBER(info.offset)}` : '';
    const propertySpace = info.setSpace !== undefined ? BOOL(info.setSpace) : notProvided;
    const nextLine =
      info.nextLine !== undefined
        ? JSON.stringify(info.nextLine)
            .replace(/[{}]/g, '')
            .replace(/:/g, ': ')
            .replace(/,/g, ', ')
            .replace(/".*?"/g, s => {
              return styler(s, '#c76');
            })
        : notProvided;
    const replace =
      info.replaceSpaceOrTabs !== undefined ? BOOL(info.replaceSpaceOrTabs) : notProvided;
    const CONVERT = ConvertData.log
      ? `
      ${TEXT('Convert')}        ${colon} ${styler(ConvertData.type, '#f64')}`
      : '';
    switch (info.newLineText) {
      case 'DELETED':
        return ` ${title} ${row} ${TEXT('Next Line')}${colon} ${nextLine}`;
      case 'NEWLINE':
      case 'NULL':
        return ` ${title} ${row}`;
      default:
        let additionalInfo = '';
        additionalInfo +=
          propertySpace !== null
            ? `\n      ${TEXT('Property Space')} ${colon} ${propertySpace}`
            : '';
        additionalInfo +=
          nextLine !== null ? `\n      ${TEXT('Next Line')}      ${colon} ${nextLine}` : '';
        additionalInfo +=
          replace !== null ? `\n      ${TEXT('Replace')}        ${colon} ${replace}` : '';

        return ` ${title} ${row} ${offset}
      ${TEXT('Old')}            ${colon} ${styler(replaceWhitespace(info.oldLineText), '#c64')}
      ${TEXT('New')}            ${colon} ${styler(
          replaceWhitespace(info.newLineText.replace(/\n/g, '\\n')),
          '#2c2'
        )}${CONVERT}${additionalInfo}`;
    }
  }
  return '';
}
function replaceWhitespace(text: string) {
  return text.replace(/ /g, '·').replace(/\t/g, '⟶');
}
