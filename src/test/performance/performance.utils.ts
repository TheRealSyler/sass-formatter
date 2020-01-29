import { styler } from '@sorg/log';
import { readFileSync, writeFileSync } from 'fs';
import { SassFormatter } from '../..';

// Env
/** **ONLY FOR PERFORMANCE CHECK** */
export const isPublishing = process.argv.find(v => v === 'PUBLISH');
const metaPath = 'src/test/performance/performance.meta.json';
const relMetaPath = './performance.meta.json';
const getSassFile = (lines: number): string =>
  `src/test/performance/test-sass-files/sass-${lines}-lines.sass`;

// Log utils
const percentageChange = (n: number, n2: number) => ((n2 - n) / n) * 100;
const num = (n: string | number) => styler(n.toString(), '#1f7');
const neg = (n: string | number) => styler(n.toString(), '#f25');
/** **ONLY FOR PERFORMANCE CHECK** */
export const grey = (n: string | number) => styler(n.toString(), '#aaa');
const info = (n: string | number) => styler(n.toString(), { color: '#699', 'font-weight': 'bold' });
const infoHeader = (n: string | number) =>
  styler(n.toString(), { 'font-weight': 'bold', color: '#aaa' });
const msAndPercentColor = '#09f';
const ms = styler('ms', msAndPercentColor);
const p = styler('%', msAndPercentColor);

function testPerformance(file: string, times: number, lines: number) {
  const start = process.hrtime.bigint();
  const medianArr: number[] = [];
  for (let i = 0; i < times; i++) {
    const medianStart = process.hrtime.bigint();
    SassFormatter.Format(file);
    medianArr.push(Number((process.hrtime.bigint() - medianStart) / BigInt(1e6)));
  }
  const totalTime = (process.hrtime.bigint() - start) / BigInt(1e6);

  const data = require(relMetaPath);
  const median = getMedian(medianArr);
  const average = totalTime / BigInt(times);

  const linesData = data[lines] as {
    total: number;
    median: number;
    average: number;
  };

  data[lines] = {
    total: Number(totalTime),
    median,
    average: Number(average)
  };
  if (isPublishing) {
    console.log(infoHeader('Updated:'), info(metaPath));
    writeFileSync(metaPath, JSON.stringify(data, undefined, 2));
  }
  console.log(infoHeader('Finished:'), info(getSassFile(lines)));

  return [
    num(lines),
    num(times),
    `${num(totalTime.toString())}${ms}`,
    `${grey(`(${linesData.total}ms)`)}`,
    `${getChange(linesData.total, totalTime)}${p}`,
    `${num(median.toString())}${ms}`,
    `${grey(`(${linesData.median}ms)`)}`,
    `${getChange(linesData.median, median)}${p}`,
    `${num(average.toString())}${ms}`,
    `${grey(`(${linesData.average}ms)`)}`,
    `${getChange(linesData.average, average)}${p}`
  ];
}

function getChange(old: number | BigInt, current: number | BigInt) {
  const change = percentageChange(Number(current), Number(old));
  const sign = Math.sign(change);
  if (sign === 0) return grey('0.00');
  return sign === 1 ? num(change.toFixed(2)) : neg(change.toFixed(2));
}

function getMedian(values: number[]) {
  if (values.length === 0) return 0;

  values.sort(function(a, b) {
    return a - b;
  });

  const half = Math.floor(values.length / 2);

  if (values.length % 2) return values[half];

  return (values[half - 1] + values[half]) / 2.0;
}

/** **ONLY FOR PERFORMANCE CHECK** */
export function testWrapper(lines: number, times: number) {
  return testPerformance(readFileSync(getSassFile(lines)).toString(), times, lines);
}
