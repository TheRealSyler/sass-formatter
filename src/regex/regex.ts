export function escapeRegExp(text: string) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
/** Check whether text is a variable: `/^[\t ]*(\$|--)\S+[\t ]*:.*/
export function isVar(text: string): boolean {
    return /^[\t ]*(\$|--)\S+[\t ]*:.*/.test(text);
}
/** Check whether text @import: `/^[\t ]*@import/` */
export function isAtImport(text: string): boolean {
    return /^[\t ]*@import/.test(text);
}
/** Check whether text is a \*: `/^[\t ]*?\*\/` */
export function isStar(text: string): boolean {
    return /^[\t ]*?\*/.test(text);
}
/** Check whether text is a css selector: `/^[\t ]*[{}]?[\t ]*[#\.%@=]/` */
export function isCssSelector(text: string) {
    return /^[\t ]*[{}]?[\t ]*[#\.%@=]/.test(text);
}
/**Check whether text is class, id or placeholder: `/^[\t ]*[#\.%]/` */
export function isClassOrId(text: string): boolean {
    return /^[\t ]*[#\.%]/.test(text);
}
/**Check whether text starts with one of [>\~]: `/^[\t ]*[>~]/` */
export function isSelectorOperator(text: string): boolean {
    return /^[\t ]*[>~]/.test(text);
}
/**`/^[\t ]*\+[\t ]+/` */
export function isAdjacentSelector(text: string): boolean {
    return /^[\t ]*\+[\t ]+/.test(text);
}
/**Check whether text is class, id or placeholder: `/^[\t ]*\r?\n?$/` */
export function isEmptyOrWhitespace(text: string): boolean {
    return /^[\t ]*\r?\n?$/.test(text);
}
/** Check whether text is a property: `^[\t ]*[\w\-]+[\t ]*:` */
export function isProperty(text: string): boolean {
    // if (empty) {
    //   return !/^[\t ]*[\w\-]+ *: *\S+/.test(text);
    // }
    return /^[\t ]*[\w\-]+[\t ]*:/.test(text);
}
/** Check whether text starts with &: `/^[\t ]*&/` */
export function isAnd(text: string): boolean {
    return /^[\t ]*&/.test(text);
}
/** Check whether text is a extend: `/^[\t ]*@extend/` */
export function isAtExtend(text: string): boolean {
    return /^[\t ]*@extend/.test(text);
}
/** Check whether text is include mixin statement */
export function isInclude(text: string) {
    return /^[\t ]*(@include|\+\w)/.test(text);
}
/** Check whether text is a @keyframes: `/^[\t ]*@keyframes/` */
export function isKeyframes(text: string): boolean {
    return /^[\t ]*@keyframes/.test(text);
}
/** Check whether text is a Pseudo selector: `/^[\t ]*\\?::?/`. */
export function isPseudo(text: string) {
    return /^[\t ]*\\?::?/.test(text);
}
/** Check whether text is bracket selector: `/^[\t ]*\[[\w=\-*'' ]*\]/`*/
export function isBracketSelector(text: string): boolean {
    return /^[\t ]*\[[\w=\-*'' ]*\]/.test(text);
}
/** Check whether text starts with an html tag. */
export function isHtmlTag(text: string) {
    return /^[\t ]*(a|abbr|address|area|article|aside|audio|b|base|bdi|bdo|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|data|datalist|dd|del|details|dfn|dialog|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|picture|input|ins|kbd|keygen|label|legend|li|link|main|map|mark|menu|menuitem|meta|meter|nav|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rb|rp|rt|rtc|ruby|s|samp|script|section|select|small|source|span|strong|style|sub|summary|sup|svg|table|tbody|td|template|textarea|tfoot|th|thead|time|title|tr|track|u|ul|var|video|wbr|path|circle|ellipse|line|polygon|polyline|rect|text|slot|h[1-6]?)((:|::|,|\.|#|\[)[\^:$#{}()\w\-\[\]='',\.# +\/]*)?$/.test(
        text
    );
}
/** Check whether text starts with a self closing html tag. */
export function isVoidHtmlTag(text: string) {
    return /^[\t ]*(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr|command|keygen|menuitem|path)((:|::|,|\.|#|\[)[:$#{}()\w\-\[\]='',\.# ]*)?$/.test(
        text
    );
}
/** Check whether text starts with //R: `/^[\t ]*\/?\/\/ *R *$/` */
export function isReset(text: string) {
    return /^[\t ]*\/?\/\/ *R *$/.test(text);
}
/** Check whether text starts with //I: `/^[\t ]*\/?\/\/ *I *$/` */
export function isIgnore(text: string) {
    return /^[\t ]*\/?\/\/ *I *$/.test(text);
}
/** Check whether text starts with //S: `/^[\t ]*\/?\/\/ *S *$/` */
export function isSassSpace(text: string) {
    return /^[\t ]*\/?\/\/ *S *$/.test(text);
}
/** Returns true if the string has brackets or semicolons at the end, comments get ignored. */
export function isScssOrCss(text: string) {
    // Check if has brackets at the end and ignore comments.
    return /[;\{\}][\t ]*(\/\/.*)?$/.test(text);
}
/** `/^[\t ]*[&.#%].*:/` */
export function isCssPseudo(text: string) {
    return /^[\t ]*[&.#%].*:/.test(text);
}
/** `/^[\t ]*[&.#%][\w-]*(?!#)[\t ]*\{.*[;\}][\t ]*$/` */
export function isCssOneLiner(text: string) {
    return /^[\t ]*[&.#%][\w-]*(?!#)[\t ]*\{.*[;\}][\t ]*$/.test(text);
}
/** `/^[\t ]*::?[\w\-]+\(.*\)/` */
// export function isPseudoWithParenthesis(text: string) {
//   return /^[\t ]*::?[\w\-]+\(.*\)/.test(text);
// }
/** `/^[\t ]*(\/\/|\/\*)/` */
export function isComment(text: string) {
    return /^[\t ]*(\/\/|\/\*)/.test(text);
}
/** `/^[\t ]*(\/\*)/` */
export function isBlockCommentStart(text: string) {
    return /^[\t ]*(\/\*)/.test(text);
}
/** `/[\t ]*(\*\/)/` */
export function isBlockCommentEnd(text: string) {
    return /[\t ]*(\*\/)/.test(text);
}
/** `/^[\t ]*[\.#%].* ?, *[\.#%].*\/` */
export function isMoreThanOneClassOrId(text: string) {
    return /^[\t ]*[\.#%].* ?, *[\.#%].*/.test(text);
}
/** `/^[\t ]*[}{]+[\t }{]*$/` */
export function isBracketOrWhitespace(text: string) {
    return /^[\t ]*[}{]+[\t }{]*$/.test(text);
}
/** `/[\t ]*@forward|[\t ]*@use/` */
export function isAtForwardOrAtUse(text: string) {
    return /[\t ]*@forward|[\t ]*@use/.test(text);
}
export function isInterpolatedProperty(text: string) {
    return /^[\t ]*[\w-]*#\{.*?\}[\w-]*:(?!:)/.test(text);
}

export function hasPropertyValueSpace(text: string) {
    return /^[\t ]*([\w ]+|[\w ]*#\{.*?\}[\w ]*): [^ ]/.test(text);
}
/** returns the distance between the beginning and the first char. */
export function getDistance(text: string, tabSize: number): number {
    let count = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char !== ' ' && char !== '\t') {
            break;
        }
        if (char === '\t') {
            count += tabSize;
        } else {
            count++;
        }
    }
    return count;
}
