import { SassFormatter as SF } from '../index';
import { JestStoreLog } from 'jest-store-log';

test('Sass Format Case 11', () => {
  const log = new JestStoreLog();
  SF.Format(
    `  .class    \t\t       {width:335px;     \t     float:left;\t overflow:hidden; padding-left:5px;}


    `,
    { debug: true }
  );
  expect(log.data.replace(/\x1b\[.*?m/g, '')).toEqual(
    `FORMAT
 BLOCK HEADER: MODIFIED Row: 0 
      Old            : ··.class····⟶⟶·······{width:335px;·····⟶·····float:left;⟶·overflow:hidden;·padding-left:5px;}
      New            : .class\\n··width:·335px\\n··float:·left\\n··overflow:·hidden\\n··padding-left:·5px
      Convert        : ONE LINER
      Replace        : false
 EMPTY LINE: DELETE Row: 1 Next Line: "text": "", "lineNumber": 2, "isEmptyOrWhitespace": true
 EMPTY LINE: DELETE Row: 2 Next Line: "text": "", "lineNumber": -1, "isEmptyOrWhitespace": true
 EMPTY LINE: WHITESPACE Row: 3
|.class|
|··width:·335px|
|··float:·left|
|··overflow:·hidden|
|··padding-left:·5px|
||`
  );
  log.TestEnd();
});
