
<div align = center>

[![Badge CodeFactor]][CodeFactor]  
[![Badge CodeCov]][CodeCov]  
[![Badge CI]][CI]

[![Badge Minified]][Minified]  
[![Badge License]][License]  
[![Badge NPM]][NPM]

<br>

# SASS Formatter

*Formatting library most notably*  
*used for the **[VSCode Extension]**.*

</div>

<br>
<br>

## Installation

*How to include this library in your code.*

-   #### [NodeJS]

    ```typescript
    import 'sass-formatter@0.7.5'
    ```

-   #### [Deno]

    ```typescript
    import 'npm:sass-formatter@0.7.5'
    ```

<br>
<br>

## Usage

*Small example showcasing the conversion.*

<br>

```typescript
const string = `
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
```

```typescript
import { SassFormatter } from 'sass-formatter'

const result = SassFormatter
    .Format(string);
```

<br>

### Output

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



<br>
<br>

## Config

*Configuration options and their default values.*

<br>

```ts
interface SassFormatterConfig {
    

    /*  Print debug messages  */
    
    debug : boolean ; // false
    
    
    /*  Remove empty lines  */
    
    deleteEmptyRows : boolean ; // true
    
    
    /*  Transform CSS / SCSS 🠖 SASS  */
    
    convert : boolean ; // true
    

    /*  Insert a space after a property's colon  */
    
    setPropertySpace : boolean ; // true
    
    
    /*  Width of a tab character  */

    tabSize : number ; 2
    

    /*  Whether to use spaces or tabs  */
    
    insertSpaces : boolean ; // true
    
    
    /*  Line ending character sequence  */
    
    lineEnding : 'CRLF' | 'LF' ; // LF
}
```

<br>


<!----------------------------------------------------------------------------->

[VSCode Extension]: https://github.com/TheRealSyler/vscode-sass-indented
[CodeFactor]: https://www.codefactor.io/repository/github/therealsyler/sass-formatter/overview/nestedprops
[Minified]: https://packagephobia.now.sh/result?p=sass-formatter
[CodeCov]: https://codecov.io/gh/TheRealSyler/sass-formatter
[NodeJS]: https://nodejs.org/en/
[Deno]: https://deno.land/
[NPM]: https://www.npmjs.com/package/sass-formatter
[CI]: https://github.com/TheRealSyler/sass-formatter/actions/workflows/main.yml

[License]: LICENSE


<!---------------------------------[ Badges ]---------------------------------->

[Badge CodeFactor]: https://img.shields.io/codefactor/grade/github/TheRealSyler/SASS-formatter?style=for-the-badge&labelColor=F44A6A&color=bf3a54&logoColor=white&logo=CodeFactor
[Badge Minified]: https://img.shields.io/bundlephobia/min/sass-formatter?style=for-the-badge&labelColor=00B0B9&color=008b90&logoColor=white&logo=GitLFS&label=Minified
[Badge License]: https://img.shields.io/badge/License-MIT-ac8b11.svg?style=for-the-badge&labelColor=yellow
[Badge CodeCov]: https://img.shields.io/codecov/c/github/TheRealSyler/sass-formatter?style=for-the-badge&labelColor=F01F7A&color=b3175d&logoColor=white&logo=CodeCov
[Badge NPM]: https://img.shields.io/npm/v/sass-formatter?style=for-the-badge&labelColor=CB3837&color=a52d2d&logoColor=white&logo=NPM
[Badge CI]: https://img.shields.io/github/actions/workflow/status/TheRealSyler/SASS-formatter/main.yml?branch=main&label=CI&style=for-the-badge&logoColor=white&logo=GitHub&labelColor=683D87&color=4f2f68
