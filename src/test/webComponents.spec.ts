import { SassFormatter as SF } from '../index';

test('Simple web component', () => {
  expect(
    SF.Format(
      `
web-component
display: inline-block
    margin: 0 1em
`
    )
  ).toBe(
    `
web-component
  display: inline-block
  margin: 0 1em
`
  );
});

test('Class and ID', () => {
  expect(
    SF.Format(
      `
web-component#id.class
      display: inline-block
    margin: 0 1em
`
    )
  ).toBe(
    `
web-component#id.class
  display: inline-block
  margin: 0 1em
`
  );
});

test('With nested', () => {
  expect(
    SF.Format(
      `
web-component
  font:
      weight: 100
    size: 1.3rem
    family: $system-font-stack
`
    )
  ).toBe(
    `
web-component
  font:
    weight: 100
    size: 1.3rem
    family: $system-font-stack
`
  );
});

test('Child web component after nested property', () => {
  expect(
    SF.Format(
      `
div
  grid:
    area: main

  web-component
    display: inline-block
      width: 100%
`
    )
  ).toBe(
    `
div
  grid:
    area: main

  web-component
    display: inline-block
    width: 100%
`
  );
});
