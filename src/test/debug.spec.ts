import { SassFormatter as SF } from '../index';
import { JestStoreLog } from 'jest-store-log';

test('Debug Message', () => {
  const log = new JestStoreLog();

  expect(
    SF.Format(
      `  .class    \t\t       {width:335px;     \t     float:left;\t overflow:hidden; padding-left:5px;}


    `,
      { debug: true }
    )
  ).toEqual(`.class
  width: 335px
  float: left
  overflow: hidden
  padding-left: 5px
`);
  expect(log.logs[0].replace(/\x1b\[.*?m/g, '')).toEqual(
    `FORMAT
 BLOCK HEADER: MODIFIED Line Number: 0  
      Old            : ··.class····⟶⟶·······{width:335px;·····⟶·····float:left;⟶·overflow:hidden;·padding-left:5px;}
      New            : .class\\n··width:·335px\\n··float:·left\\n··overflow:·hidden\\n··padding-left:·5px
      Convert        : ONE LINER
      Replace        : false
 EMPTY LINE: DELETE Line Number: 1 Next Line: "text": "", "isEmptyOrWhitespace": true
 EMPTY LINE: DELETE Line Number: 2 Next Line: "text": "    ", "isEmptyOrWhitespace": true
 EMPTY LINE: WHITESPACE Line Number: 3
|.class|
|··width:·335px|
|··float:·left|
|··overflow:·hidden|
|··padding-left:·5px|
||`
  );
  log.restore();
});
