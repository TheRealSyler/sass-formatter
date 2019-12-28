### Sass Formatter

<span id="BADGE_GENERATION_MARKER_0"></span>
[![Custom](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest) [![Custom](https://www.codefactor.io/repository/github/therealsyler/sass-formatter/badge)](https://www.codefactor.io/repository/github/therealsyler/sass-formatter) [![Custom](https://codecov.io/gh/TheRealSyler/sass-formatter/branch/master/graph/badge.svg)](https://codecov.io/gh/TheRealSyler/sass-formatter) [![circleci](https://img.shields.io/circleci/build/github/TheRealSyler/sass-formatter)](https://app.circleci.com/github/TheRealSyler/sass-formatter/pipelines) [![npmV](https://img.shields.io/npm/v/sass-formatter?color=green)](https://www.npmjs.com/package/sass-formatter) [![min](https://img.shields.io/bundlephobia/min/sass-formatter)](https://bundlephobia.com/result?p=sass-formatter) [![install](https://badgen.net/packagephobia/install/sass-formatter)](https://packagephobia.now.sh/result?p=sass-formatter) [![githubLastCommit](https://img.shields.io/github/last-commit/TheRealSyler/sass-formatter)](https://github.com/TheRealSyler/sass-formatter)
<span id="BADGE_GENERATION_MARKER_1"></span>

## Usage

```typescript
import { SassFormatter } from 'sass-formatter';

const result = SassFormatter.SassFormatter.Format(
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

<span id="DOC_GENERATION_MARKER_0"></span>

# Docs

- **[config](#config)**

  - [SassFormatterConfig](#sassformatterconfig)

### config

##### SassFormatterConfig

```typescript
interface SassFormatterConfig {
  debug: boolean;
  deleteCompact: boolean;
  deleteEmptyRows: boolean;
  deleteWhitespace: boolean;
  convert: boolean;
  setPropertySpace: boolean;
  tabSize: number;
  insertSpaces: boolean;
}
```

_Generated with_ **[suf-cli](https://www.npmjs.com/package/suf-cli)**
<span id="DOC_GENERATION_MARKER_1"></span>

<span id="LICENSE_GENERATION_MARKER_0"></span>
Copyright (c) 2019 Leonard Grosoli Licensed under the MIT license.
<span id="LICENSE_GENERATION_MARKER_1"></span>
