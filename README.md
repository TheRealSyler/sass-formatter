### Sass Formatter
[![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)
[![CircleCI](https://img.shields.io/circleci/build/github/TheRealSyler/s.color)](https://circleci.com/gh/TheRealSyler/sass-formatter)
```typescript
import { SassFormatter, SassTextDocument } from 'sass-formatter'

const formattedSass = SassFormatter.SassFormatter.Format(new SassTextDocument('.class\n    margin: 10px\n padding: 10rem'), {
  insertSpaces: true,
  tabSize: 2
});
// result should be '.class\n  margin: 10px\n  padding: 10rem'
```
