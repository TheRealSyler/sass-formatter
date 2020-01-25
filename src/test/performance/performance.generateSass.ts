import { Random } from 'suf';
import { all as allCssProps } from 'known-css-properties';
import { writeFileSync } from 'fs';

function GenerateWrapper(lines: number, outputPath: string) {
  let text = '';
  for (let i = 0; i < lines; i++) {
    if (i % 50 === 0) {
      if (i !== 0) {
        text += '\n';
      }
      text += Choose50(GenerateCss(50), GenerateSass(50));
    }
  }

  writeFileSync(outputPath, text);
  console.log(`\x1B[1;mGENERATED: random sass\x1B[m at: ${outputPath}`);
}

function GenerateSass(lines: number) {
  let text = getSelector(false);
  for (let i = 1; i < lines; i++) {
    text += Choose95(getSassProp(), getOtherSass());
  }
  return text.replace(/\n$/, '');
}

function getSassInclude() {
  return `${getEmptySpace()}+${getRandomString()}(${Math.random() * 2443})\n`;
}
function getOtherSass() {
  return Choose50(getSassInclude(), getSelector(false));
}

function getSassProp() {
  const propName = allCssProps[RandomRoundedNumber(allCssProps.length)];

  return `${getEmptySpace()}${propName}:${getPropertyValue()}\n`;
}

function GenerateCss(lines: number) {
  let text = getSelector();
  for (let i = 1; i < lines - 1; i++) {
    const propName = allCssProps[RandomRoundedNumber(allCssProps.length)];
    text += `${getEmptySpace()}${propName}:${getPropertyValue()};\n`;
  }
  text += `${getEmptySpace()}}`;
  return text;
}

function getSelector(isCss = true) {
  let text = '';
  const a = () => `${Choose50('.', '#')}${getRandomString()}`;
  text += `${getEmptySpace()}${a()}${Choose50(a(), Choose50(a(), ''))}${Choose50(
    a(),
    Choose50(a(), '')
  )}${isCss ? ' {' : ''}\n`;
  return text;
}

function getPropertyValue() {
  let text = '';
  text += getEmptySpace(4);
  text += Choose50(
    `${Math.round(Math.random() * 325434)}${Choose50('px', 'rem')}`,
    Choose50(
      Choose50('auto', 'unset'),
      `#${RandomRoundedNumber()}${RandomRoundedNumber()}${RandomRoundedNumber()}`
    )
  );
  return text;
}

function RandomRoundedNumber(max: number = 9) {
  return Math.round(Math.random() * max);
}

function Choose50(a: any, b: any) {
  return Math.random() <= 0.5 ? a : b;
}

function Choose95(a: any, b: any) {
  return Math.random() <= 0.95 ? a : b;
}

function getRandomString(max = 24) {
  return Random.String(max).replace(/\d/g, '');
}

function getEmptySpace(max?: number) {
  return ' '.repeat(Math.floor(Math.random() * (max ? max : 24)));
}

function genWrapper(lines: number) {
  GenerateWrapper(lines, `src/test/performance/test-sass-files/sass-${lines}-lines.sass`);
}

genWrapper(100);
genWrapper(1000);
genWrapper(10000);
genWrapper(100000);
genWrapper(1000000);
