[![npm version](https://img.shields.io/npm/v/@itrocks/range?logo=npm)](https://www.npmjs.org/package/@itrocks/range)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/range)](https://www.npmjs.org/package/@itrocks/range)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/range?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/range)
[![issues](https://img.shields.io/github/issues/itrocks-ts/range)](https://github.com/itrocks-ts/range/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# range

A property decorator to specify min-max value ranges, date, numeric or string-based.

*This documentation was written by an artificial intelligence and may contain errors or approximations.
It has not yet been fully reviewed by a human. If anything seems unclear or incomplete,
please feel free to contact the author of this package.*

## Installation

```bash
npm i @itrocks/range
```

## Usage

`@itrocks/range` provides:

- a property decorator `@Range(minValue?, maxValue?)` to declare a
  minimum/maximum allowed value on a property (number, bigint, string or
  `Date`),
- a helper function `rangeOf(target, property)` to read back the range
  that was configured on that property.

The decorator only stores metadata. It does not validate values by
itself, but other components (for example
`@itrocks/reflect-to-schema` or your own validation layer) can use this
metadata to enforce constraints or generate database schemas.

### Minimal example

```ts
import { Range } from '@itrocks/range'

class Product {
  // Price must stay between 0 and 9,999.99
  @Range(0, 9999.99)
  price = 0
}
```

Here, `price` is marked as having a numeric value between `0` and
`9999.99`. A generic validator or persistence layer can read this
information and reject values outside the range.

### Complete example with metadata lookup

In more advanced scenarios you may want to inspect declared ranges at
runtime, in order to build your own validation logic or schema
generation.

```ts
import type { ObjectOrType } from '@itrocks/class-type'
import { Range, rangeOf }   from '@itrocks/range'

class Movie {
  // Release year between 1900 and 2100
  @Range(1900, 2100)
  year = 2024

  // Rating between 0 and 5 (inclusive)
  @Range(0, 5)
  rating = 0
}

function describeRanges<T extends object>(type: ObjectOrType<T>): void {
  for (const property of ['year', 'rating'] as (keyof T)[]) {
    const range = rangeOf(type, property)
    if (range) {
      console.log(
        `${String(property)}: min=${String(range.minValue)}, max=${String(range.maxValue)}`
      )
    }
  }
}

describeRanges(Movie)
// year:  min=1900, max=2100
// rating: min=0,    max=5
```

In real projects you will usually rely on higher‑level helpers (for
example from other `@itrocks/*` packages) to iterate over properties
instead of listing them manually as in this simplified example.

## API

### `function Range<T extends object>(minValue?: Ranged, maxValue?: Ranged): DecorateCaller<T>`

Property decorator used to declare a minimum and/or maximum allowed
value for a property.

The decorated property is expected to be one of the supported
"ranged" types:

- `number`
- `bigint`
- `string`
- `Date`

The concrete meaning of the range (inclusive, exclusive, how it is
validated) is defined by the component that consumes this metadata
(
for example a validator or a schema generator).

#### Parameters

- `minValue` *(optional)* – minimal allowed value. When omitted, there
  is no lower bound stored in the metadata.
- `maxValue` *(optional)* – maximal allowed value. When omitted, there
  is no upper bound stored in the metadata.

Both parameters can be of any `Ranged` type (`bigint | number | string
| Date`). You should pass a value that matches the type of the
decorated property.

#### Return value

- `DecorateCaller<T>` – function from `@itrocks/decorator/property`
  used internally by TypeScript to apply the decorator. You usually do
  not call it directly; you simply apply `@Range(...)` on the property.

#### Example

```ts
class Account {
  // Balance is allowed to go negative but is capped
  @Range(undefined, 1_000_000n)
  balance!: bigint
}
```

---

### `function rangeOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>): RangeType | undefined`

Retrieves the range configuration associated with a property, if any.

The returned `RangeType` has the shape:

```ts
interface RangeType {
  minValue: bigint | number | string | Date
  maxValue: bigint | number | string | Date
}
```

#### Parameters

- `target` – the class constructor (`Movie`) or an instance
  (`new Movie()`) that owns the property.
- `property` – the property name to inspect.

#### Return value

- `RangeType | undefined` – the configured range for the given
  property, or `undefined` if this property is not decorated with
  `@Range`.

#### Example

```ts
import type { ObjectOrType } from '@itrocks/class-type'
import { Range, rangeOf }   from '@itrocks/range'

class Subscription {
  @Range(new Date('2020-01-01'), new Date('2030-12-31'))
  expiration!: Date
}

function isInConfiguredRange<T extends object>(
  target: ObjectOrType<T>,
  property: keyof T,
  value: bigint | number | string | Date
): boolean {
  const range = rangeOf(target, property)
  if (!range) return true // no constraint defined

  return (value >= range.minValue) && (value <= range.maxValue)
}

isInConfiguredRange(Subscription, 'expiration', new Date('2025-01-01')) // true
```

## Typical use cases

- Declare numeric ranges on domain model properties (e.g. prices,
  quantities, scores) and let a shared validator enforce them.
- Associate date ranges with properties (e.g. validity periods,
  subscriptions, availability windows) and centralize the logic that
  checks whether a value is still valid.
- Configure constraints that will later be translated into database
  column definitions (for example via `@itrocks/reflect-to-schema`).
- Drive UI behavior based on ranges, such as slider minima/maxima or
  form input constraints (`min`, `max`, etc.).
- Combine `@Range` with other `@itrocks/*` decorators (`@Length`,
  `@Precision`, `@Value`, …) to describe rich constraints while keeping
  your model classes simple.
