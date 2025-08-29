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

#### Result

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

<span id="DOC_GENERATION_MARKER_0"></span>

# Docs

- **[config](#config)**

  - [SassFormatterConfig](#sassformatterconfig)
  - [defaultSassFormatterConfig](#defaultsassformatterconfig)

### config

##### SassFormatterConfig

```ts
interface SassFormatterConfig {
    /**Enable debug messages */
    debug: boolean;
    /**delete rows that are empty. */
    deleteEmptyRows: boolean;
    /**@deprecated*/
    deleteWhitespace: boolean;
    /**Convert css or scss to sass */
    convert: boolean;
    /**set the space after the colon of a property to one.*/
    setPropertySpace: boolean;
    tabSize: number;
    /**insert spaces or tabs. */
    insertSpaces: boolean;
    /**Defaults to LF*/
    lineEnding: 'LF' | 'CRLF';
}
```

##### defaultSassFormatterConfig

```ts
const defaultSassFormatterConfig: SassFormatterConfig;
```

_Generated with_ **[suf-cli](https://www.npmjs.com/package/suf-cli)**
<span id="DOC_GENERATION_MARKER_1"></span>

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

<span id="LICENSE_GENERATION_MARKER_0"></span>
Copyright (c) 2019 Leonard Grosoli Licensed under the MIT license.
<span id="LICENSE_GENERATION_MARKER_1"></span>
