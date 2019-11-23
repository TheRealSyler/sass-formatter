### Sass Formatter

[![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest) [![CircleCI](https://img.shields.io/circleci/build/github/TheRealSyler/sass-formatter)](https://circleci.com/gh/TheRealSyler/sass-formatter) [![Size](https://badgen.net/bundlephobia/min/sass-formatter)](https://www.npmjs.com/package/sass-formatter) [![Size](https://badgen.net/packagephobia/install/sass-formatter)](https://www.npmjs.com/package/sass-formatter)

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
    ignoreBackslash?: boolean;
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

*Generated With* **[ts-doc-gen](https://www.npmjs.com/package/ts-doc-gen)**
<span id="DOC_GENERATION_MARKER_1"></span>
