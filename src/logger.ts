import { Logger, LoggerType, styler, SetEnvironment } from '@sorg/log';
import { Log } from './utility';
SetEnvironment('node');

const colon = styler(':', '#777');
const quote = styler('"', '#f64');
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
    const { info, lineNumber, ConvertData } = data;

    const notProvided = styler('not provided', '#666');
    const title = styler(info.title, '#cc0');
    const row = `${TEXT('Row')}${colon} ${NUMBER(lineNumber)}`;
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
  ${styler('CONVERT CSS', '#0c7')}
  ${TEXT('Text')}           ${colon} ${quote}${ConvertData.text}${quote}
  ${TEXT('Type')}           ${colon} ${styler(ConvertData.type, '#f64')}`
      : '';
    return ` ${title} ${row} ${offset}
  ${TEXT('Property Space')} ${colon} ${propertySpace}
  ${TEXT('Convert')}        ${colon} ${convert}
  ${TEXT('Next Line')}      ${colon} ${nextLine}
  ${TEXT('Replace')}        ${colon} ${replace}${CONVERT}`;
  }
  return '';
}
