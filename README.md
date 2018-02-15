# Safe Types

[![npm](https://img.shields.io/npm/v/safe-types.svg?style=for-the-badge)](https://img.shields.io/npm/v/safe-types)
[![npm downloads](https://img.shields.io/npm/dt/safe-types.svg?style=for-the-badge)](https://www.npmjs.com/package/safe-types)
[![GitHub stars](https://img.shields.io/github/stars/alexsasharegan/safe-types.svg?style=for-the-badge)](https://github.com/alexsasharegan/safe-types/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/alexsasharegan/safe-types.svg?style=for-the-badge)](https://github.com/alexsasharegan/safe-types/issues)
[![Travis](https://img.shields.io/travis/alexsasharegan/safe-types.svg?style=for-the-badge)](https://github.com/alexsasharegan/safe-types)
[![Coverage Status](https://img.shields.io/coveralls/github/alexsasharegan/safe-types.svg?style=for-the-badge)](https://coveralls.io/github/alexsasharegan/safe-types)
[![GitHub license](https://img.shields.io/github/license/alexsasharegan/safe-types.svg?style=for-the-badge)](https://github.com/alexsasharegan/safe-types/blob/master/LICENSE.md)

Type safe utils inspired from the Rust language for writing better JavaScript.

## Purpose

Currently, this library is an experiment both to learn Rust concepts as well as
to determine whether some of Rust's types can be mapped to TypeScript and
improve the safety of TypeScript/JavaScript. It's my opinion that a library like
this requires a 100% TypeScript environment to provide security of JS types.
Without the TypeScript compiler and tooling, these primitives may make your data
more opaque rather than provide insight and clarity into the many states
application data can be in.

More documentation to come as I learn how this library best applies to
real-world JavaScript applications!

![option inverse for nodejs callback with error first](./examples/option-inverse-result.png)
![readfile nodejs](./examples/readFile.png)
![database insert nodejs](./examples/db-insert-after.png)
![option use cases](./examples/option-use-cases.png)
![github example code](./examples/github-example.png)
