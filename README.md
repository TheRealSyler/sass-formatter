### Sass Formatter

<span id="BADGE_GENERATION_MARKER_0"></span>
[![Custom](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest) [![Custom](https://www.codefactor.io/repository/github/therealsyler/sass-formatter/badge)](https://www.codefactor.io/repository/github/therealsyler/sass-formatter) [![Custom](https://github.com/TheRealSyler/sass-formatter/actions/workflows/main.yml/badge.svg)](https://github.com/TheRealSyler/sass-formatter/actions/workflows/main.yml) [![codecov](https://codecov.io/gh/TheRealSyler/sass-formatter/branch/master/graph/badge.svg)](https://codecov.io/gh/TheRealSyler/sass-formatter) [![npmV](https://img.shields.io/npm/v/sass-formatter?color=green)](https://www.npmjs.com/package/sass-formatter) [![min](https://img.shields.io/bundlephobia/min/sass-formatter)](https://bundlephobia.com/result?p=sass-formatter) [![install](https://badgen.net/packagephobia/install/sass-formatter)](https://packagephobia.now.sh/result?p=sass-formatter) [![githubLastCommit](https://img.shields.io/github/last-commit/TheRealSyler/sass-formatter)](https://github.com/TheRealSyler/sass-formatter)
<span id="BADGE_GENERATION_MARKER_1"></span>

### Website [sass-formatter.syler.de](https://sass-formatter.syler.de/)

## Used in

- [Vscode sass extension](https://github.com/TheRealSyler/vscode-sass-indented)

## Usage

```typescript
import { SassFormatter } from 'sass-formatter';

const result = SassFormatter.Format(
  `
    span
      color: none

      @for $i from 0 through 2
         
          &:nth-child(#{$i})
              color: none
          @each $author in $list
              .photo-#{$author}
                background: image-url("avatars/#{$author}.png") no-repeat

    @while $types > 0
          .while-#{$types}
 width: $type-width + $types`
);
```

### Result

```sass
span
  color: none

  @for $i from 0 through 2
    &:nth-child(#{$i})
      color: none
      @each $author in $list
        .photo-#{$author}
          background: image-url("avatars/#{$author}.png") no-repeat

  @while $types > 0
    .while-#{$types}
      width: $type-width + $types
```

## CLI

Sass Formatter includes a command-line interface for formatting directly from editors or CI.

```bash
# show help
$ sass-formatter --help

# rewrite files in place
$ sass-formatter -w src/styles/main.scss

# check formatting without writing
$ sass-formatter -ch "src/**/*.sass"

# use custom config file
$ sass-formatter -c ./my-config.json src/**/*.scss
```

Options summary:

```
-w, --write                 Rewrite the file after formatting
-ch, --check                Check if the file is formatted
-d, --default-config        Show default config
-c, --config <Path>         Use custom config file (JSON)
-h, --help                  Print this help
```

Notes:

- By default loads `.sassformatterrc.json` from PWD.
- Config is merged with defaults; missing keys are taken from defaults.
- Unknown keys trigger warnings; invalid values trigger exit code 1.
- Supports formatting: `sass`, `scss`, `css`, `less`.

## Config

### SassFormatterConfig

```ts
interface SassFormatterConfig {
  debug: boolean;
  deleteEmptyRows: boolean;
  deleteWhitespace: boolean; // deprecated
  convert: boolean;
  setPropertySpace: boolean;
  tabSize: number;
  insertSpaces: boolean;
  lineEnding: 'LF' | 'CRLF';
}
```

### defaultSassFormatterConfig

```ts
const defaultSassFormatterConfig: SassFormatterConfig;
```

### .sassformatterrc.json

```json
{
  "insertSpaces": true,
  "tabSize": 2,
  "convert": true,
  "debug": false,
  "deleteEmptyRows": true,
  "deleteWhitespace": true,
  "setPropertySpace": true,
  "lineEnding": "LF"
}
```

## Install

```bash
# install locally (recommended)
npm install --save-dev sass-formatter

# or globally
# npm install -g sass-formatter

# or run without install
# npx sass-formatter --help
```

## License

Copyright (c) 2019 Leonard Grosoli Licensed under the MIT license.
