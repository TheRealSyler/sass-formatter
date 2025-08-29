#!/usr/bin/env node

//
// ┌─┐┌─┐┌─┐┌─┐   ┌─┐┌─┐┬─┐┌┬┐┌─┐┌┬┐┌┬┐┌─┐┬─┐
// └─┐├─┤└─┐└─┐───├┤ │ │├┬┘│││├─┤ │  │ ├┤ ├┬┘
// └─┘┴ ┴└─┘└─┘   └  └─┘┴└─┴ ┴┴ ┴ ┴  ┴ └─┘┴└─
// ----------------------------------------------------------------
// MIT License
// Copyright (c) 2019 Leonard Grosoli
// Modified by https://github.com/maarutan  maarutan \ Marat Arzymatov 2025 😘😘😘
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
  -c, --config <Path>         Use custom config file (JSON)
  -h, --help                  Print this help

Examples:
  sass-formatter -w src/styles/main.scss
  sass-formatter -ch "src/**/*.sass"
  sass-formatter -c ./my-config.json src/**/*.scss

You can configure using a .sassformatterrc.json file (JSON) placed in your project's working directory.
The config will be merged with defaults: any missing keys are taken from defaults.
If the config file contains invalid types/values, the CLI will print an error and exit with code 1.
`);
}

/**
 * Validate and merge parsed config with defaults.
 * - Ensures types match default values.
 * - Ensures union values (like lineEnding) are valid.
 * - Unknown keys produce a warning but do not fail.
 */
function validateAndMergeConfig(
  parsed: any,
  defaults: SassFormatterConfig,
  configPath: string
): SassFormatterConfig {
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Config file must be a JSON object (key/value pairs).');
  }

  const merged: any = { ...defaults };
  const errors: string[] = [];
  const warnings: string[] = [];

  // validate known keys/types from defaults
  for (const key of Object.keys(defaults) as (keyof SassFormatterConfig)[]) {
    const defaultVal = (defaults as any)[key];
    if (Object.prototype.hasOwnProperty.call(parsed, key)) {
      const val = parsed[key];

      // special case for lineEnding (union)
      if (key === 'lineEnding') {
        if (val !== 'LF' && val !== 'CRLF') {
          errors.push(
            `Invalid value for "lineEnding": ${JSON.stringify(val)} (allowed: "LF" | "CRLF")`
          );
        } else {
          merged[key] = val;
        }
        continue;
      }

      // check type compatibility
      const defaultType = typeof defaultVal;
      const valType = typeof val;

      if (defaultType !== valType) {
        // allow numbers coerced from strings? no — require strict types
        errors.push(
          `Invalid type for "${key}": expected ${defaultType}, got ${valType}`
        );
      } else {
        merged[key] = val;
      }
    } else {
      // not provided -> use default (already in merged)
    }
  }

  // warn about unknown keys
  for (const key of Object.keys(parsed)) {
    if (!(key in defaults)) {
      warnings.push(`Unknown config key "${key}" — it will be ignored.`);
    }
  }

  // if there are errors, throw a composed error
  if (errors.length > 0) {
    const msg = [
      `Config file is invalid: ${configPath}`,
      ...errors.map((e) => `  - ${e}`)
    ].join('\n');
    throw new Error(msg);
  }

  // print warnings (but continue)
  if (warnings.length > 0) {
    for (const w of warnings) {
      console.warn(`Warning: ${w}`);
    }
  }

  return merged as SassFormatterConfig;
}

/**
 * Load config from provided path or from cwd (.sassformatterrc.json).
 * If no file found -> return defaults.
 * If file exists -> parse, validate & merge with defaults.
 */
function loadConfig(configPath?: string): SassFormatterConfig {
  const finalPath = configPath
    ? path.resolve(configPath)
    : path.resolve(process.cwd(), '.sassformatterrc.json');

  if (!fs.existsSync(finalPath)) {
    // No config file in cwd -> use defaults
    return defaultSassFormatterConfig;
  }

  // Read file and parse JSON
  let raw: string;
  try {
    raw = fs.readFileSync(finalPath, 'utf-8');
  } catch (err) {
    console.error(
      `Failed to read config file: ${finalPath}\n${(err as Error).message}`
    );
    process.exit(1);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(
      `Failed to parse JSON in config file: ${finalPath}\n${(err as Error).message}`
    );
    process.exit(1);
  }

  // Validate & merge
  try {
    const merged = validateAndMergeConfig(
      parsed,
      defaultSassFormatterConfig,
      finalPath
    );
    return merged;
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}

/**
 * Normalize line endings to LF for comparison
 */
function normalizeEol(s: string): string {
  return s.replace(/\r\n/g, '\n');
}

async function main() {
  const argsRaw = process.argv.slice(2);
  // Make a shallow copy we can mutate (for removing -c and its value)
  const args = [...argsRaw];

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('-d') || args.includes('--default-config')) {
    console.log(`
--------------------------------------------------------------
Create a [ .sassformatterrc.json ] file in your project and configure your formatter.
--------------------------------------------------------------

=> default config (merged values):
`);
    console.log(JSON.stringify(defaultSassFormatterConfig, null, 2));
    process.exit(0);
  }

  const write = args.includes('-w') || args.includes('--write');
  const check = args.includes('-ch') || args.includes('--check');

  // Custom config path option handling (-c / --config)
  let configPath: string | undefined;
  const configIndex = args.findIndex((a) => a === '-c' || a === '--config');
  if (configIndex !== -1) {
    if (args[configIndex + 1]) {
      configPath = args[configIndex + 1];
      // remove the option and its value from args so file globs remain
      args.splice(configIndex, 2);
    } else {
      console.error('Error: --config option requires a path argument.');
      process.exit(1);
    }
  }

  const config = loadConfig(configPath);

  // Remaining args that don't start with '-' are file paths / globs
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
      // SassFormatter.Format may be sync or async depending on implementation.
      // If it's async returning a Promise, await it; otherwise it will return a string.
      const maybe = (SassFormatter as any).Format(input, config);
      formatted = typeof maybe === 'string' ? maybe : await maybe;
    } catch (err) {
      console.error(
        `Error formatting file: ${file}\n${(err as Error).message}`
      );
      exitCode = 1;
      continue;
    }

    if (check) {
      const orig = normalizeEol(input);
      const out = normalizeEol(formatted);
      if (out !== orig) {
        console.log(`✗ ${file} is not formatted`);
        exitCode = 1;
      } else {
        console.log(`✓ ${file} is formatted`);
      }
    } else if (write) {
      try {
        // Ensure directory exists before writing
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
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

// Top-level guard to catch unexpected exceptions
main().catch((err) => {
  console.error('Unexpected error:', (err as Error).message);
  process.exit(1);
});
