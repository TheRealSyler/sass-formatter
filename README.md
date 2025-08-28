<h1>
   Sass Formatter 🐍
</h1>

<table>
  <tr>
    <td>
      <img width="452" alt="logo" src="https://github.com/user-attachments/assets/2c675dcf-6db6-4b16-96ce-707ae36f7a3c" />
    </td>
    <td>
      <h3>
        <strong>Sass Formatter</strong> - TypeScript 🚀 library for formatting Sass <br />
        <h4>Both within code and as a CLI</h4> 
        <h4>Supports formatting for [ `Css`, `Scss`, `Sass`, `Less` ]</h4> 
        <h4>Supports `.sassformatterrc` for custom configuration </h4>
      </h3>
    </td>
  </tr>
</table>

<span id="BADGE_GENERATION_MARKER_0"></span>
[![Jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)
[![CodeFactor](https://www.codefactor.io/repository/github/therealsyler/sass-formatter/badge)](https://www.codefactor.io/repository/github/therealsyler/sass-formatter)
[![Actions](https://github.com/TheRealSyler/sass-formatter/actions/workflows/main.yml/badge.svg)](https://github.com/TheRealSyler/sass-formatter/actions/workflows/main.yml)
[![Codecov](https://codecov.io/gh/TheRealSyler/sass-formatter/branch/master/graph/badge.svg)](https://codecov.io/gh/TheRealSyler/sass-formatter)
[![npm](https://img.shields.io/npm/v/sass-formatter?color=green)](https://www.npmjs.com/package/sass-formatter)
[![Minified](https://img.shields.io/bundlephobia/min/sass-formatter)](https://bundlephobia.com/result?p=sass-formatter)
[![Install](https://badgen.net/packagephobia/install/sass-formatter)](https://packagephobia.now.sh/result?p=sass-formatter)
[![Last Commit](https://img.shields.io/github/last-commit/TheRealSyler/sass-formatter)](https://github.com/TheRealSyler/sass-formatter)

### Online Preview

> You can preview formatting live: [sass-formatter.syler.de](https://sass-formatter.syler.de/) 👈

### Used in <img width="32" alt="image" src="https://github.com/user-attachments/assets/f1ba02eb-aae7-40a1-a3d1-843b0b9bc3d8" />

> [`[ Visual Studio Code ] sass extension`](https://github.com/TheRealSyler/vscode-sass-indented) 👈

---

# Docs

- **[Usage](#usage)**
  - **[SassFormatter](#sassformatter)**
  - - [Result](#result)
  - **[Cli](#Cli)**
  - - [Cli Help](#cli-help)
  - - [Cli Write](#cli-write)
  - - [Cli Check](#cli-check)

- **[Config](#config)**
  - [SassFormatterConfig](#sassformatterconfig)
  - [defaultSassFormatterConfig](#defaultsassformatterconfig)
  - [sassformatterrc](#sassformatterrc)

- **[Install](#install)**
- **[License](#license)**

---

## Usage

### SassFormatter

```typescript
import { SassFormatter } from 'sass-formatter';

const result = SassFormatter.Format(
  `
span
│  │  │  color: none
│
│  @for $i from 0 through 2
   │  │  │  │  &:nth-child(#{$i})
│  │  │  │  color: none
│  │  │  │  │  @each $author in $list
│  │  │  │  .photo-#{$author}
│  background: image-url("avatars/#{$author}.png") no-repeat
│
│@while $types > 0
│  │  │  │  │.while-#{$types}
│  │width: $type-width + $types
  `
);
```

### Result

```sass
span
│ color: none
│
│ @for $i from 0 through 2
│ │ &:nth-child(#{$i})
│ │ │ color: none
│ │ │ @each $author in $list
│ │ │ │ .photo-#{$author}
│ │ │ │ │ background: image-url("avatars/#{$author}.png") no-repeat
│
│ @while $types > 0
│ │ .while-#{$types}
│ │ │ width: $type-width + $types
```

---

### Cli

#### Cli Help

```bash
$ sass-formatter -h


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

You can configure using a .sassformatterrc file (JSON) placed in your project's working directory.
The config will be merged with defaults: any missing keys are taken from defaults.
If the config file contains invalid types/values, the CLI will print an error and exit with code 1.
```

#### Cli Write

> `Rewrite the file after formatting`: <br/>
> formats this file to sass <br/>
> whatever it may be <br/>
> `sass` `scss` `less` `css` <br/>

#### Cli Check

> `Check if the file is formatted`: <br/>
> just check whether the file has been formatted or not <br/>

---

## Config

### SassFormatterConfig

```ts
interface SassFormatterConfig {
  /** Enable debug messages */
  debug: boolean;
  /** Delete rows that are empty */
  deleteEmptyRows: boolean;
  /** @deprecated */
  deleteWhitespace: boolean;
  /** Convert CSS or SCSS to Sass */
  convert: boolean;
  /** Set space after property colon */
  setPropertySpace: boolean;
  tabSize: number;
  /** Use spaces or tabs */
  insertSpaces: boolean;
  /** Line endings: LF or CRLF */
  lineEnding: 'LF' | 'CRLF';
}
```

### defaultSassFormatterConfig

```ts
const defaultSassFormatterConfig: SassFormatterConfig;
```

### .sassformatterrc

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

> Just create a .sassformatterrc file next to your project <br/>
> and configure your formatter.

---

## Install

```bash
# install locally (recommended)
npm install --save-dev sass-formatter

# or install globally
npm install -g sass-formatter

# or run without install
npx sass-formatter --help

#    for example:
#    sass-formatter -w src/styles/main.scss
#    sass-formatter -ch src/**/*.sass

```

---

_Generated with_ **[suf-cli](https://www.npmjs.com/package/suf-cli)**

## License

[License](LICENSE) <br />
Copyright (c) 2019 Leonard Grosoli. Licensed under the MIT license.

---

> Built with ❤️ by [Syler](https://github.com/TheRealSyler) <br />
> I wish you maximum productivity. ⚡⚡⚡
