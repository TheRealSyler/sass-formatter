#!/usr/bin/env node

//
// ┌─┐┌─┐┌─┐┌─┐   ┌─┐┌─┐┬─┐┌┬┐┌─┐┌┬┐┌┬┐┌─┐┬─┐
// └─┐├─┤└─┐└─┐───├┤ │ │├┬┘│││├─┤ │  │ ├┤ ├┬┘
// └─┘┴ ┴└─┘└─┘   └  └─┘┴└─┴ ┴┴ ┴ ┴  ┴ └─┘┴└─
// ----------------------------------------------------------------
// MIT License
// Copyright (c) 2019 Leonard Grosoli
// Modified by https://github.com/maarutan  maarutan \ Marat Arzymatov 2025
// Permission is hereby granted, free of charge...
// lib author https://github.com/TheRealSyler TheRealSyler \ Leonard Grosoli
//

import fs from 'fs';
import path from 'path';
import {
  SassFormatter,
  defaultSassFormatterConfig,
  SassFormatterConfig
} from './index';

function printHelp() {
  console.log(`
Usage: sass-formatter [options] <file...>

Options:
  -w, --write                 Rewrite the file after formatting
  -ch, --check                Check if the file is formatted
  -d, --default-config        Show default config
  -c, --config   <Path>       Use custom config file (JSON)

-----------------------------------------------------------
  -h, --help                        Print this help

  You can configure using sassformatterrc
  in your project.

  sassformatterrc format: JSON matching SassFormatterConfig
`);
}

/**
 * Load config from a file or fallback to default
 */
function loadConfig(configPath?: string): SassFormatterConfig {
  const finalPath = configPath
    ? path.resolve(configPath)
    : path.resolve(process.cwd(), 'sassformatterrc');

  if (fs.existsSync(finalPath)) {
    try {
      const raw = fs.readFileSync(finalPath, 'utf-8');
      return { ...defaultSassFormatterConfig, ...JSON.parse(raw) };
    } catch (err) {
      console.error(
        `Failed to read or parse config file: ${finalPath}\n${(err as Error).message}`
      );
      process.exit(1);
    }
  }

  return defaultSassFormatterConfig;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('-d') || args.includes('--default-config')) {
    console.log(`
--------------------------------------------------------------

    Create a
    [ .sassformatterrc ]
    file in your project and configure your formatter.

--------------------------------------------------------------

=> default config:
`);
    console.log(JSON.stringify(defaultSassFormatterConfig, null, 2));
    process.exit(0);
  }

  const write = args.includes('-w') || args.includes('--write');
  const check = args.includes('-ch') || args.includes('--check');

  // Обработка кастомного конфига
  let configPath: string | undefined;
  const configIndex = args.findIndex((a) => a === '-c' || a === '--config');
  if (configIndex !== -1 && args[configIndex + 1]) {
    configPath = args[configIndex + 1];
    args.splice(configIndex, 2);
  }

  const config = loadConfig(configPath);

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
      continue;
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
      formatted = SassFormatter.Format(input, config);
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
