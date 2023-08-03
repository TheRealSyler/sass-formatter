import {
    hasPropertyValueSpace,
    isBlockCommentEnd,
    isClassOrId,
    isHtmlTag,
    isInclude,
    isInterpolatedProperty,
    isProperty,
    isPseudo,
    isScssOrCss,
    isVoidHtmlTag,
} from './regex';

test('Regex Is Class OR Id', () => {
    expect(isClassOrId('  	.desktop')).toEqual(true);
    expect(isClassOrId('.desktop')).toEqual(true);
    expect(isClassOrId('		#desktop')).toEqual(true);
    expect(isClassOrId('   %desktop')).toEqual(true);
    expect(isClassOrId('  	-desktop')).toEqual(false);
    expect(isClassOrId('   -any-prop: 213px')).toEqual(false);
    expect(isClassOrId('any-prop: 213px')).toEqual(false);
    expect(isClassOrId('=function')).toEqual(false);
});
test('Regex Is Property', () => {
    expect(isProperty('	-any-prop: 213px')).toEqual(true);
    expect(isProperty('any-prop: 213px')).toEqual(true);
    expect(isProperty('  margin: 213px')).toEqual(true);
    expect(isProperty('  	margin: 213px')).toEqual(true);
    expect(isProperty('  	margin  : 213px')).toEqual(true);
    expect(isProperty('  	margin \t : 213px')).toEqual(true);
    expect(isProperty('	  +desktop')).toEqual(false);
    expect(isProperty('=function')).toEqual(false);
});

test('Regex has Property Value Space', () => {
    expect(hasPropertyValueSpace('prop: 12px')).toEqual(true);
    expect(hasPropertyValueSpace('prop:  12px')).toEqual(false);
    expect(hasPropertyValueSpace('prop:12px')).toEqual(false);
});
test('Regex Is Pseudo', () => {
    expect(isPseudo(':root')).toEqual(true);
    expect(isPseudo('\\:root')).toEqual(true);
});
test('Regex Is Block Comment', () => {
    expect(isBlockCommentEnd('*')).toEqual(false);
});
test('Regex Is HtmlTag', () => {
    expect(isHtmlTag('a')).toEqual(true);
    expect(isHtmlTag('a.class#{$var}[type="awd"]')).toEqual(true);
    expect(isHtmlTag('ab')).toEqual(false);
    expect(isHtmlTag('tr:nth-child(2n+1)')).toEqual(true);
    expect(isHtmlTag('picture, img')).toEqual(true);
    expect(isHtmlTag('i[class^="el-icon"]')).toEqual(true);
    expect(isVoidHtmlTag('i[class^="el-icon"]')).toEqual(false);
    expect(isVoidHtmlTag('area')).toEqual(true);
    expect(isVoidHtmlTag('a')).toEqual(false);
});
test('Regex Is Include', () => {
    expect(isInclude('+a')).toEqual(true);
    expect(isInclude('@include a')).toEqual(true);
    expect(isInclude('+a()')).toEqual(true);
    expect(isInclude('+a-a()')).toEqual(true);
    expect(isInclude('@include a-a()')).toEqual(true);
    expect(isInclude('a')).toEqual(false);
});

test('Regex Is InterpolatedProperty', () => {
    expect(isInterpolatedProperty("#{'h' + $i}::before")).toEqual(false);
    expect(isInterpolatedProperty("#{'h' + $i}:")).toEqual(true);
});
test('Regex Is ScssOrCss', () => {
    expect(isScssOrCss("#{'h' + $i}::before")).toEqual(false);
    expect(isScssOrCss('.class,')).toEqual(false);
});
