#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { SassFormatter } from './index';

function printHelp() {
  console.log(`
Usage: sassfmt [options] <file...>

Options:
  -w, --write       Rewrite the file after formatting
  -c, --check       Check if the file is formatted
  -h, --help        Print this help
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  const write = args.includes('-w') || args.includes('--write');
  const check = args.includes('-c') || args.includes('--check');

  const files = args.filter((a) => !a.startsWith('-'));
  if (files.length === 0) {
    console.error('No files specified.');
    process.exit(1);
  }

  let exitCode = 0;

  for (const file of files) {
    const filePath = path.resolve(file);

    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found -> ${file}`);
      exitCode = 1;
      continue; // не падаем, идём дальше
    }

    let input: string;
    try {
      input = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      console.error(`Error reading file: ${file}\n${(err as Error).message}`);
      exitCode = 1;
      continue;
    }

    let formatted: string;
    try {
      formatted = SassFormatter.Format(input);
    } catch (err) {
      console.error(
        `Error formatting file: ${file}\n${(err as Error).message}`
      );
      exitCode = 1;
      continue;
    }

    if (check) {
      if (formatted !== input) {
        console.log(`✗ ${file} is not formatted`);
        exitCode = 1;
      } else {
        console.log(`✓ ${file} is formatted`);
      }
    } else if (write) {
      try {
        fs.writeFileSync(filePath, formatted, 'utf-8');
        console.log(`Formatted ${file}`);
      } catch (err) {
        console.error(`Error writing file: ${file}\n${(err as Error).message}`);
        exitCode = 1;
      }
    } else {
      console.log(formatted);
    }
  }

  process.exit(exitCode);
}

main();
