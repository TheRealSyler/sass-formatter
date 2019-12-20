### Sass Formatter

<span id="BADGE_GENERATION_MARKER_0"></span>
 [![badge=https://jestjs.io/img/jest-badge.svg](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest) [![badge=https://www.codefactor.io/repository/github/therealsyler/sass-formatter/badge](https://www.codefactor.io/repository/github/therealsyler/sass-formatter/badge)](https://www.codefactor.io/repository/github/therealsyler/sass-formatter) [![badge=https://codecov.io/gh/TheRealSyler/sass-formatter/branch/master/graph/badge.svg](https://codecov.io/gh/TheRealSyler/sass-formatter/branch/master/graph/badge.svg)](https://codecov.io/gh/TheRealSyler/sass-formatter) [![circleci]( https://img.shields.io/circleci/build/github/TheRealSyler/sass-formatter)](https://app.circleci.com/github/TheRealSyler/sass-formatter/pipelines) [![npmV]( https://img.shields.io/npm/v/sass-formatter?color=green)](https://www.npmjs.com/package/sass-formatter) [![min]( https://img.shields.io/bundlephobia/min/sass-formatter)](https://bundlephobia.com/result?p=sass-formatter) [![install](https://badgen.net/packagephobia/install/sass-formatter)](https://packagephobia.now.sh/result?p=sass-formatter) [![githubLastCommit]( https://img.shields.io/github/last-commit/TheRealSyler/sass-formatter)](https://github.com/TheRealSyler/sass-formatter)
<span id="BADGE_GENERATION_MARKER_1"></span>

```typescript
import { SassFormatter, SassTextDocument } from 'sass-formatter';

const formattedSass = SassFormatter.SassFormatter.Format(
  new SassTextDocument('.class\n    margin: 10px\n padding: 10rem'),
  {
    insertSpaces: true,
    tabSize: 2
  }
);
// result should be '.class\n  margin: 10px\n  padding: 10rem'
```

<span id="DOC_GENERATION_MARKER_0"></span>

# Docs

- **[provider](#provider)**

  - [SassFormatterConfig](#sassformatterconfig)
  - [SassFormattingOptions](#sassformattingoptions)
  - [SassTextLine](#sasstextline)
  - [SassTextDocument](#sasstextdocument)
  - [SassFormatter](#sassformatter)

### provider

##### SassFormatterConfig

```typescript
interface SassFormatterConfig {
  enabled?: boolean;
  debug?: boolean;
  deleteCompact?: boolean;
  deleteEmptyRows?: boolean;
  deleteWhitespace?: boolean;
  convert?: boolean;
  replaceSpacesOrTabs?: boolean;
  setPropertySpace?: boolean;
}
```

##### SassFormattingOptions

```typescript
interface SassFormattingOptions {
  tabSize: number;
  insertSpaces: boolean;
}
```

##### SassTextLine

```typescript
class SassTextLine {
  lineNumber: number;
  text: string;
  isEmptyOrWhitespace: boolean;
  constructor(text: string, lineNumber: number);
}
```

##### SassTextDocument

```typescript
class SassTextDocument {
  private lines?;
  lineCount: number;
  private rawText?;
  constructor(text: string);
  lineAt(lineNumber: number): SassTextLine;
  getText(): string;
}
```

##### SassFormatter

```typescript
class SassFormatter {
  static Format(document: SassTextDocument, options: SassFormattingOptions, config?: SassFormatterConfig): string;
}
```

_Generated With_ **[ts-doc-gen](https://www.npmjs.com/package/ts-doc-gen)**
<span id="DOC_GENERATION_MARKER_1"></span>
