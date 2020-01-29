import { LogTable, styler } from '@sorg/log';

import { isPublishing, testWrapper, grey } from './performance.utils';

const bold = (n: string | number) => styler(n.toString(), { 'font-weight': 'bold' });

// Execution start
(async () => {
  console.log(
    bold(`Sass Formatter Performance Check.${isPublishing ? ' (Publish)\n' : ' (Dev)\n'}`)
  );

  const lastRes = grey('(Last)');
  const table: (number | string)[][] = [
    [
      bold('Lines'),
      bold('Times'),
      bold('Total'),
      lastRes,
      '',
      bold('Median'),
      lastRes,
      '',
      bold('Average'),
      lastRes,
      ''
    ],
    []
  ];
  table.push(testWrapper(1000, 1000));
  table.push(testWrapper(10000, 100));
  table.push(testWrapper(100000, 10));
  table.push(testWrapper(1000000, 1));
  table.push([]);
  console.log(''); // add new line for visual purposes.
  LogTable(table);
})();
