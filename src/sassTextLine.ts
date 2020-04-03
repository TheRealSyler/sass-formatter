import { isEmptyOrWhitespace } from 'suf-regex';

export class SassTextLine {
  isEmptyOrWhitespace: boolean;
  constructor(private text: string) {
    this.isEmptyOrWhitespace = isEmptyOrWhitespace(text);
  }
  /**Sets the text of the line. */
  set(text: string) {
    this.text = text;
  }
  /**Gets the text of the line. */
  get(): string {
    return this.text;
  }
}
