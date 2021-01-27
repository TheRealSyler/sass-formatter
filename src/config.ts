export interface SassFormatterConfig {
  /**Enable debug messages */
  debug: boolean;
  /**delete rows that are empty. */
  deleteEmptyRows: boolean;
  /**@deprecated*/
  deleteWhitespace: boolean;
  /**Convert css or scss to sass */
  convert: boolean;
  /**set the space after the colon of a property to one.*/
  setPropertySpace: boolean;
  tabSize: number;
  /**insert spaces or tabs. */
  insertSpaces: boolean;
  /**Defaults to LF*/
  lineEnding: 'LF' | 'CRLF';
}


export const defaultSassFormatterConfig: SassFormatterConfig = {
  insertSpaces: true,
  tabSize: 2,
  convert: true,
  debug: false,
  deleteEmptyRows: true,
  deleteWhitespace: true,
  setPropertySpace: true,
  lineEnding: 'LF',
};