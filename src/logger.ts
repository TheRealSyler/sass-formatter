import { Logger, LoggerType, styler, SetEnvironment } from '@sorg/log';
import { Log, LogFormatInfo } from './utility';
SetEnvironment('node');

const colon = styler(':', '#777');
// const quote = styler('"', '#f64');
const pipe = styler('|', '#f64');
const TEXT = (text: string) => styler(text, '#bbb');
const NUMBER = (number: number) => styler(number.toString(), '#f03');
const BOOL = (bool: Boolean) => styler(bool.toString(), bool ? '#0c0' : '#c00');

export const logger = new Logger<{
  info: LoggerType;
}>({
  info: {
    customHandler: msg => {
      const data = msg.rawMessages[0] as Log[];
      const res = msg.rawMessages[1] as string;

      let out = styler('FORMAT', '#0af');
      for (let i = 0; i < data.length; i++) {
        out += '\n';
        out += InfoLogHelper(data[i]);
      }
      out += `
${pipe}${styler(res.replace(/\n/g, '|\n|'), '#c76')}${pipe}`;
      return out;
    }
  }
});

function InfoLogHelper(data: any) {
  if (data) {
    const ConvertData = data.ConvertData;
    const info = data.info as LogFormatInfo;
    const notProvided = null;
    const title = styler(info.title, '#cc0');
    const row = `${TEXT('Row')}${colon} ${NUMBER(info.lineNumber)}`;
    const offset = info.offset !== undefined ? `${TEXT('Offset')}${colon} ${NUMBER(info.offset)}` : '';
    const propertySpace = info.setSpace !== undefined ? BOOL(info.setSpace) : notProvided;
    const convert = info.convert !== undefined ? BOOL(info.convert) : notProvided;
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
    const replace = info.replaceSpaceOrTabs !== undefined ? BOOL(info.replaceSpaceOrTabs) : notProvided;
    const CONVERT = ConvertData.log
      ? `
  ${styler('CONVERT TYPE', '#0c7')}   ${colon} ${styler(ConvertData.type, '#f64')}`
      : '';
    switch (info.newLineText) {
      case 'DELETED':
        return ` ${title} ${row} ${TEXT('Next Line')}${colon} ${nextLine}`;
      case 'NEWLINE':
        return ` ${title} ${row}`;
      case 'NULL':
        return ` ${title} ${row}`;
      default:
        let additionalInfo = '';
        additionalInfo += propertySpace !== null ? `\n      ${TEXT('Property Space')} ${colon} ${propertySpace}` : '';
        additionalInfo += convert !== null ? `\n      ${TEXT('Convert')}        ${colon} ${convert}` : '';
        additionalInfo += nextLine !== null ? `\n      ${TEXT('Next Line')}      ${colon} ${nextLine}` : '';
        additionalInfo += replace !== null ? `\n      ${TEXT('Replace')}        ${colon} ${replace}${CONVERT}` : '';

        return ` ${title} ${row} ${offset}
      ${TEXT('Old')}            ${colon} ${styler(replaceWhiteSpace(info.oldLineText), '#c64')}
      ${TEXT('New')}            ${colon} ${styler(replaceWhiteSpace(info.newLineText), '#2c2')}${additionalInfo}`;
    }
  }
  return '';

  function replaceWhiteSpace(text: string) {
    return text.replace(/ /g, '·').replace(/\t/g, '⟶');
  }
}
