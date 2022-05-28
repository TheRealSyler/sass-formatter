import { SassFormatter as SF } from '../index';

test('Interpolated Property', () => {
  expect(
    SF.Format(
      ` @for $i from 0 through 3
      .nav-#{map-get($directions, $i)}
        #{map-get($directions, $i)}: 1rem
        animation:  nav-#{map-get($directions, $i)}-start  200ms  ease
        border-radius-#{$dir}: 1rem\t
                            \t            #{$dir}:   1rem
        border: solid 20px red
   `,
      { debug: false }
    )
  ).toBe(`@for $i from 0 through 3
  .nav-#{map-get($directions, $i)}
    #{map-get($directions, $i)}: 1rem
    animation: nav-#{map-get($directions, $i)}-start 200ms ease
    border-radius-#{$dir}: 1rem
    #{$dir}: 1rem
    border: solid 20px red
`);
});

test('Interpolation', () => {
  const a = SF.Format(
    `#{body}
    color: red

#{main}
    color:red`, { debug: false }
  );

  expect(a).toBe(`#{body}
  color: red

#{main}
  color: red
`);
});

test('Interpolation #61', () => {
  const a = SF.Format(
    `@for $i from 1 through 6
  h#{$i}
    color: red

@for $i from 1 through 6
  #{'h' + $i}::before
    color: red`, { debug: false }
  );

  expect(a).toBe(`@for $i from 1 through 6
  h#{$i}
    color: red

@for $i from 1 through 6
  #{'h' + $i}::before
    color: red
`);
});
