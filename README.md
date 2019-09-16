### Sass Formatter

```typescript
import SassFormatter { SassTextDocument } from 'sass-formatter'

const formattedSass = SassFormatter.SassFormatter.Format(new SassTextDocument('.class\n    margin: 10px\n padding: 10rem'), {
  insertSpaces: true,
  tabSize: 2
});
// result should be '.class\n  margin: 10px\n  padding: 10rem'
```
