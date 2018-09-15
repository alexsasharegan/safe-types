# Safe Types

[![npm](https://img.shields.io/npm/v/safe-types.svg?style=for-the-badge)](https://img.shields.io/npm/v/safe-types)
[![npm downloads](https://img.shields.io/npm/dt/safe-types.svg?style=for-the-badge)](https://www.npmjs.com/package/safe-types)
[![GitHub issues](https://img.shields.io/github/issues/alexsasharegan/safe-types.svg?style=for-the-badge)](https://github.com/alexsasharegan/safe-types/issues)
[![Travis](https://img.shields.io/travis/alexsasharegan/safe-types.svg?style=for-the-badge)](https://github.com/alexsasharegan/safe-types)
[![Coverage Status](https://img.shields.io/coveralls/github/alexsasharegan/safe-types.svg?style=for-the-badge)](https://coveralls.io/github/alexsasharegan/safe-types)
[![GitHub license](https://img.shields.io/github/license/alexsasharegan/safe-types.svg?style=for-the-badge)](https://github.com/alexsasharegan/safe-types/blob/master/LICENSE.md)

Type safe utils inspired from the Rust language for writing better JavaScript.
Written in typescript with support for flow definitions.

## API Documentation

[Safe Types API documentation](https://sad-saha-4a5616.netlify.com/)

Follow the link for method references. Below is an explanation of _why_ and
_how_.

## Purpose

This library started out as an experiment both to learn Rust concepts as well as
to determine whether some of Rust's types can be mapped to TypeScript and
improve the safety of TypeScript/JavaScript.

**Side Note:** It's my opinion that a library like this requires a 100%
TypeScript environment to provide security around JS types. Without the
TypeScript compiler and tooling, these primitives may make your data more opaque
rather than provide insight and clarity into the many states application data
can be in. Using an editor like vscode can provide some built in intellisense
when running in JavaScript without TypeScript, but inference is limited.

## Concepts

The two main exports of this library are implementations of the Maybe Monad and
the Either Monad. I wrote this library without any formal learning in
[category theory](https://en.wikipedia.org/wiki/Category_theory), so the Rust
standard library was essential to guiding my implementation of these Monad
patterns. While these functional programming concepts are notoriously arcane,
they are much easier to learn in practice than in theory.

### Option Type _(Maybe Monad)_

Imagine if you could rewrite JavaScript and remove `null` and `undefined` types.
The dreaded error `undefined is not a function` could be gone forever!. Sounds
great, right? But there are still many times when you need a way to represent
nothing. What happens if your function doesn't return anything? It turns out
that there is a pattern for doing with type safety.

The option type is a simple type that can exist in one of two states--having
_**some**_ value, or having _**none**_ (nothing). In a way, this is very similar
to having a value or having `null`. However, an option carries the context of
the type it represent regardless of it being present. Instead of calling a
function expecting a `string` or `null`, you receive an option of a string
`Option<string>`. That option _**may be**_ `Some<string>`, or it _**may be**_
`None`. This is why it's known as the Maybe Monad.

So how does this work? We wrap the state of having a value in a box. In
JavaScript, this box is implemented with a plain old JavaScript object (POJO).
Let's imagine what a `Some<string>` would look like for the string
`'typescript'`:

```ts
type Some<T> = { value: T };

let someString: Some<string> = { value: "typescript" };
```

This is fine for a simple box to hold our value, but how would we represent
`None`? What about an empty object?

```ts
type None = {};

let noneString: None = {};
```

Now we have a consistent object shape, so we need a way to distinguish the state
of the option type. We want to keep our option generic, so it can't be
implemented with any kind of value checking on the `value` property of the
`Some` object. Instead, we can use another property that will be common to both
states that we call a type discriminant.

```ts
type Some<T> = {
  value: T;
  state: "Some";
};
type None = {
  state: "None";
};
```

This is enough for us to implement the option type! But keeping track of the
option state is tedious, and the abstraction shouldn't allow us to know the
internal state. That's where the library comes in.

#### Usage

Generally, usage of the option type starts by wrapping a value of which we know
the type, but we also know that it may return `null` or `undefined`. To do that,
we can use the `Option.of` or `Option.from` methods (one is just an alias).

```ts
function getAtIndex(index, list) {
  return Option.of(list[index]);
}

let list = [1, 2, 3];
let firstElement = getAtIndex(0, list);
// Some<1>
let probablyNot = getAtIndex(10, list);
// None
```

Both `Option.of` and its alias only create a `Some` type if the value is not
`null` or `undefined`. From then on, you can make use of the methods available
on the `Option` type to perform operations safely. Let's try another example
like getting the input value from an HTMLInputElement.

```ts
// document.querySelector returns an element or null
let maybeInput = Option.of(document.querySelector("input[name=email]"));

// If we are certain this exists, we can unwrap the value.
// It will throw an error if the option is a `none`
let input = maybeInput.unwrap();
// We can also have it throw a custom error message
input = maybeInput.expect("expected an input element with name=email");

// We can safely read a value if we provide a default
let value = maybeInput.map_or("", element => element.value);

// We can even do a chain of dependent actions without dealing with null!
let maybeSubmitBtn = maybeInput.and_then(element =>
  Option.of(element.parent.querySelector("button[type=submit]"))
);
```

You can browse the set of methods known as _combinators_, but the most important
method is `match`. The `match` method accepts an object with methods for each
possible state of the option (`Some` and `None`) and must return the same type
for each possibility.

```ts
let luckyNumber = Option.of(list.find(num => num > 100)).match({
  // Called with the value.
  Some(num) {
    return num;
  },
  None() {
    return 0;
  },
});
```
