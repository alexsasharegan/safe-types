# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [4.18.0](https://github.com/alexsasharegan/safe-types/compare/v4.17.0...v4.18.0) (2019-03-04)


### Features

* adds a `Task.try` method ([fac3107](https://github.com/alexsasharegan/safe-types/commit/fac3107))



<a name="4.15.0"></a>
# [4.15.0](https://github.com/alexsasharegan/safe-types/compare/v4.14.0...v4.15.0) (2019-02-15)


### Features

* adds Task.retry for retriable tasks ([8ae273b](https://github.com/alexsasharegan/safe-types/commit/8ae273b))



<a name="4.14.0"></a>
# [4.14.0](https://github.com/alexsasharegan/safe-types/compare/v4.13.2...v4.14.0) (2019-02-15)


### Features

* adds Result#task to convert results to tasks ([7f7d5af](https://github.com/alexsasharegan/safe-types/commit/7f7d5af))



<a name="4.13.2"></a>
## [4.13.2](https://github.com/alexsasharegan/safe-types/compare/v4.13.1...v4.13.2) (2019-01-31)


### Bug Fixes

* **flow:** adds missing def for Task.exec ([d8eb322](https://github.com/alexsasharegan/safe-types/commit/d8eb322))



<a name="4.13.1"></a>
## [4.13.1](https://github.com/alexsasharegan/safe-types/compare/v4.13.0...v4.13.1) (2019-01-31)


### Bug Fixes

* **flow:** adds flow types for last release method additions ([2681449](https://github.com/alexsasharegan/safe-types/commit/2681449))



<a name="4.13.0"></a>
# [4.13.0](https://github.com/alexsasharegan/safe-types/compare/v4.12.1...v4.13.0) (2019-01-31)


### Features

* **task:** adds exec method ([a98e738](https://github.com/alexsasharegan/safe-types/commit/a98e738))
* **task:** adds Task.tap and Task.tap_err ([770e34a](https://github.com/alexsasharegan/safe-types/commit/770e34a))
* **task:** methods for side effect tasks ([88eac2c](https://github.com/alexsasharegan/safe-types/commit/88eac2c))



<a name="4.12.1"></a>
## [4.12.1](https://github.com/alexsasharegan/safe-types/compare/v4.12.0...v4.12.1) (2018-12-09)


### Bug Fixes

* **types:** adds flow type defs for new tap helpers ([4b2712b](https://github.com/alexsasharegan/safe-types/commit/4b2712b))



<a name="4.12.0"></a>
# [4.12.0](https://github.com/alexsasharegan/safe-types/compare/v4.11.3...v4.12.0) (2018-12-08)


### Features

* **option:** adds `Option.tap` method for side-effects ([21d4889](https://github.com/alexsasharegan/safe-types/commit/21d4889))
* **result:** adds `Result.tap` & `Result.tap_err` for side-effects ([2b95023](https://github.com/alexsasharegan/safe-types/commit/2b95023))



<a name="4.11.3"></a>
## [4.11.3](https://github.com/alexsasharegan/safe-types/compare/v4.11.2...v4.11.3) (2018-11-20)



<a name="4.11.2"></a>
## [4.11.2](https://github.com/alexsasharegan/safe-types/compare/v4.11.1...v4.11.2) (2018-11-03)


### Bug Fixes

* adds "module" entry to pkg.json for esm ([ead4f12](https://github.com/alexsasharegan/safe-types/commit/ead4f12))



<a name="4.11.1"></a>
## [4.11.1](https://github.com/alexsasharegan/safe-types/compare/v4.11.0...v4.11.1) (2018-10-15)



<a name="4.11.0"></a>
# [4.11.0](https://github.com/alexsasharegan/safe-types/compare/v4.10.0...v4.11.0) (2018-10-14)


### Features

* adds `or_await` & `or_else_await` to Option & Result ([2f0d501](https://github.com/alexsasharegan/safe-types/commit/2f0d501))



<a name="4.10.0"></a>
# [4.10.0](https://github.com/alexsasharegan/safe-types/compare/v4.9.2...v4.10.0) (2018-09-25)


### Features

* **task:** adds new task methods ([fa252c1](https://github.com/alexsasharegan/safe-types/commit/fa252c1))



<a name="4.9.2"></a>
## [4.9.2](https://github.com/alexsasharegan/safe-types/compare/v4.9.1...v4.9.2) (2018-09-25)



<a name="4.9.1"></a>
## [4.9.1](https://github.com/alexsasharegan/safe-types/compare/v4.9.0...v4.9.1) (2018-09-24)


### Bug Fixes

* **types:** `Task.of_ok` & `Task.of_err` should use `any` for opposite generic ([0f421b7](https://github.com/alexsasharegan/safe-types/commit/0f421b7))



<a name="4.9.0"></a>
# [4.9.0](https://github.com/alexsasharegan/safe-types/compare/v4.8.1...v4.9.0) (2018-09-24)


### Features

* **task:** add `Task.map_both` for a bimap operation ([469f32e](https://github.com/alexsasharegan/safe-types/commit/469f32e))



<a name="4.8.1"></a>
## [4.8.1](https://github.com/alexsasharegan/safe-types/compare/v4.8.0...v4.8.1) (2018-09-23)


### Bug Fixes

* adds flow type for new `Task.invert` method ([f0ecb68](https://github.com/alexsasharegan/safe-types/commit/f0ecb68))



<a name="4.8.0"></a>
# [4.8.0](https://github.com/alexsasharegan/safe-types/compare/v4.7.0...v4.8.0) (2018-09-23)


### Features

* adds `Task.invert` method to swap success and error values ([ba637cc](https://github.com/alexsasharegan/safe-types/commit/ba637cc))



<a name="4.7.0"></a>
# [4.7.0](https://github.com/alexsasharegan/safe-types/compare/v4.6.2...v4.7.0) (2018-09-22)


### Features

* more efficient iterators in Result.every & Some.every ([954041a](https://github.com/alexsasharegan/safe-types/commit/954041a))



<a name="4.6.2"></a>
## [4.6.2](https://github.com/alexsasharegan/safe-types/compare/v4.6.1...v4.6.2) (2018-09-20)


### Bug Fixes

* package the 'esm' directory for esm users ([dbb6883](https://github.com/alexsasharegan/safe-types/commit/dbb6883))



<a name="4.6.1"></a>
## [4.6.1](https://github.com/alexsasharegan/safe-types/compare/v4.6.0...v4.6.1) (2018-09-19)


### Bug Fixes

* **flow:** fixes incorrect flow type syntax ([a72fde5](https://github.com/alexsasharegan/safe-types/commit/a72fde5))



<a name="4.6.0"></a>
# [4.6.0](https://github.com/alexsasharegan/safe-types/compare/v4.5.0...v4.6.0) (2018-09-19)


### Features

* **helpers:** adds flow types for `err_or_ok` method ([e202907](https://github.com/alexsasharegan/safe-types/commit/e202907))



<a name="4.5.0"></a>
# [4.5.0](https://github.com/alexsasharegan/safe-types/compare/v4.4.0...v4.5.0) (2018-09-19)


### Features

* **task:** adds 2 new Task methods ([e7f0b61](https://github.com/alexsasharegan/safe-types/commit/e7f0b61))



<a name="4.4.0"></a>
# [4.4.0](https://github.com/alexsasharegan/safe-types/compare/v4.3.0...v4.4.0) (2018-09-18)


### Features

* adds flow types for Task ([357f0c9](https://github.com/alexsasharegan/safe-types/commit/357f0c9))
* implements a Task monad type ([#2](https://github.com/alexsasharegan/safe-types/issues/2)) ([7c8473f](https://github.com/alexsasharegan/safe-types/commit/7c8473f))



<a name="4.3.0"></a>
# [4.3.0](https://github.com/alexsasharegan/safe-types/compare/v4.2.0...v4.3.0) (2018-09-15)


### Features

* adds err_or_ok helper for node-style callback pattern ([41c0faa](https://github.com/alexsasharegan/safe-types/commit/41c0faa))
* adds Option await methods for promise support ([7956c4c](https://github.com/alexsasharegan/safe-types/commit/7956c4c))
* adds Option.narrow for type guard support ([747305b](https://github.com/alexsasharegan/safe-types/commit/747305b))



<a name="4.2.0"></a>
# [4.2.0](https://github.com/alexsasharegan/safe-types/compare/v4.1.0...v4.2.0) (2018-08-10)


### Features

* add support for umd build ([ff6614e](https://github.com/alexsasharegan/safe-types/commit/ff6614e))



<a name="4.1.0"></a>
# [4.1.0](https://github.com/alexsasharegan/safe-types/compare/v4.0.0...v4.1.0) (2018-07-19)


### Features

* **Option:** add toJSON support for Option ([23e9935](https://github.com/alexsasharegan/safe-types/commit/23e9935))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/alexsasharegan/safe-types/compare/v3.3.9...v4.0.0) (2018-06-18)


### Features

* adds Result.some && Result.every helpers ([2cc07a0](https://github.com/alexsasharegan/safe-types/commit/2cc07a0))


### BREAKING CHANGES

* Option.some return signature has changed to return Option<T[]>
* Option.every return signature has changed to return Option<T[]>



<a name="3.3.9"></a>
## [3.3.9](https://github.com/alexsasharegan/safe-types/compare/v3.3.8...v3.3.9) (2018-05-29)


### Bug Fixes

* **flow:** not sure if default generics even works ([cd112c8](https://github.com/alexsasharegan/safe-types/commit/cd112c8))



<a name="3.3.8"></a>
## [3.3.8](https://github.com/alexsasharegan/safe-types/compare/v3.3.7...v3.3.8) (2018-05-29)


### Bug Fixes

* getting default flow generics syntax right ([325d28f](https://github.com/alexsasharegan/safe-types/commit/325d28f))



<a name="3.3.7"></a>
## [3.3.7](https://github.com/alexsasharegan/safe-types/compare/v3.3.6...v3.3.7) (2018-05-29)



<a name="3.3.6"></a>
## [3.3.6](https://github.com/alexsasharegan/safe-types/compare/v3.3.5...v3.3.6) (2018-05-29)



<a name="3.3.5"></a>
## [3.3.5](https://github.com/alexsasharegan/safe-types/compare/v3.3.4...v3.3.5) (2018-05-27)



<a name="3.3.4"></a>
## [3.3.4](https://github.com/alexsasharegan/safe-types/compare/v3.3.3...v3.3.4) (2018-05-27)


### Bug Fixes

* export Option class ([82db0d0](https://github.com/alexsasharegan/safe-types/commit/82db0d0))



<a name="3.3.3"></a>
## [3.3.3](https://github.com/alexsasharegan/safe-types/compare/v3.3.2...v3.3.3) (2018-05-27)


### Bug Fixes

* flow type def fixes ([ee00d73](https://github.com/alexsasharegan/safe-types/commit/ee00d73))



<a name="3.3.2"></a>
## [3.3.2](https://github.com/alexsasharegan/safe-types/compare/v3.3.1...v3.3.2) (2018-05-27)


### Bug Fixes

* **build:** add `.flow` export to lib for flow types ([89625bd](https://github.com/alexsasharegan/safe-types/commit/89625bd))



<a name="3.3.1"></a>
## [3.3.1](https://github.com/alexsasharegan/safe-types/compare/v3.3.0...v3.3.1) (2018-05-26)



<a name="3.3.0"></a>
# [3.3.0](https://github.com/alexsasharegan/safe-types/compare/v3.2.1...v3.3.0) (2018-05-26)


### Features

* **types:** adds flow type defs ([9c51cdc](https://github.com/alexsasharegan/safe-types/commit/9c51cdc))



<a name="3.2.1"></a>
## [3.2.1](https://github.com/alexsasharegan/safe-types/compare/v3.2.0...v3.2.1) (2018-03-29)



<a name="3.2.0"></a>
# [3.2.0](https://github.com/alexsasharegan/safe-types/compare/v3.1.0...v3.2.0) (2018-03-29)


### Features

* new utils get_at_path, has_at_path ([20c7741](https://github.com/alexsasharegan/safe-types/commit/20c7741))



<a name="3.1.0"></a>
# [3.1.0](https://github.com/alexsasharegan/safe-types/compare/v3.0.0...v3.1.0) (2018-02-16)


### Features

* **option:** adds `Option.every` and `Option.some` ([ce0e351](https://github.com/alexsasharegan/safe-types/commit/ce0e351))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/alexsasharegan/safe-types/compare/v2.5.1...v3.0.0) (2018-02-16)


### Features

* adds better semantic methods for inverting result ([75353d4](https://github.com/alexsasharegan/safe-types/commit/75353d4))


### BREAKING CHANGES

* `Option.inverse_result` has been renamed to
`Option.into_result_err`

adds `Result.invert`



<a name="2.5.1"></a>
## [2.5.1](https://github.com/alexsasharegan/safe-types/compare/v2.5.0...v2.5.1) (2018-02-15)



<a name="2.5.0"></a>
# [2.5.0](https://github.com/alexsasharegan/safe-types/compare/v2.4.0...v2.5.0) (2018-02-15)


### Features

* **result:** added doc blocks for intellisense ([faef764](https://github.com/alexsasharegan/safe-types/commit/faef764))



<a name="2.4.0"></a>
# [2.4.0](https://github.com/alexsasharegan/safe-types/compare/v2.3.1...v2.4.0) (2018-02-14)


### Features

* **test:** 100% test coverage ([781e1e5](https://github.com/alexsasharegan/safe-types/commit/781e1e5))



<a name="2.3.1"></a>
## [2.3.1](https://github.com/alexsasharegan/safe-types/compare/v2.3.0...v2.3.1) (2018-02-14)



<a name="2.3.0"></a>
# [2.3.0](https://github.com/alexsasharegan/safe-types/compare/v2.2.1...v2.3.0) (2018-02-14)


### Features

* **result:** `map_both` impl ([f9076a9](https://github.com/alexsasharegan/safe-types/commit/f9076a9))



<a name="2.2.1"></a>
## [2.2.1](https://github.com/alexsasharegan/safe-types/compare/v2.2.0...v2.2.1) (2018-02-14)


### Bug Fixes

* bolster testing for new methods ([0d35925](https://github.com/alexsasharegan/safe-types/commit/0d35925))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/alexsasharegan/safe-types/compare/v2.1.1...v2.2.0) (2018-02-13)


### Features

* **result:** `and_then_await` impl ([1bb487a](https://github.com/alexsasharegan/safe-types/commit/1bb487a))



<a name="2.1.1"></a>
## [2.1.1](https://github.com/alexsasharegan/safe-types/compare/v2.1.0...v2.1.1) (2018-02-13)



<a name="2.1.0"></a>
# [2.1.0](https://github.com/alexsasharegan/safe-types/compare/v2.0.0...v2.1.0) (2018-02-13)


### Features

* **option:** add option to result methods ([2dfd9af](https://github.com/alexsasharegan/safe-types/commit/2dfd9af))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/alexsasharegan/safe-types/compare/v1.7.1...v2.0.0) (2018-02-13)


### Code Refactoring

* change variants to use uppercase ([17fc39a](https://github.com/alexsasharegan/safe-types/commit/17fc39a))


### BREAKING CHANGES

* match statements now use uppercase variants



<a name="1.7.1"></a>
## [1.7.1](https://github.com/alexsasharegan/safe-types/compare/v1.7.0...v1.7.1) (2018-02-13)


### Bug Fixes

* update some types with defaults ([66b6993](https://github.com/alexsasharegan/safe-types/commit/66b6993))



<a name="1.7.0"></a>
# [1.7.0](https://github.com/alexsasharegan/safe-types/compare/v1.6.0...v1.7.0) (2018-02-13)


### Features

* **result:** `and_then_await` experiment ([ebb04ca](https://github.com/alexsasharegan/safe-types/commit/ebb04ca))



<a name="1.6.0"></a>
# [1.6.0](https://github.com/alexsasharegan/safe-types/compare/v1.5.0...v1.6.0) (2018-02-13)


### Features

* **option:** `and` impl ([979a17f](https://github.com/alexsasharegan/safe-types/commit/979a17f))
* **result:** `expect_err` impl ([2dd4be0](https://github.com/alexsasharegan/safe-types/commit/2dd4be0))
* **result:** `expect` impl ([8719c5f](https://github.com/alexsasharegan/safe-types/commit/8719c5f))
* **result:** `unwrap_err` impl ([2286789](https://github.com/alexsasharegan/safe-types/commit/2286789))
* **result:** `unwrap_or_else` impl ([a2360fc](https://github.com/alexsasharegan/safe-types/commit/a2360fc))
* **result:** `unwrap_or` impl ([9189c9a](https://github.com/alexsasharegan/safe-types/commit/9189c9a))
* **result:** `unwrap` imp ([55d873b](https://github.com/alexsasharegan/safe-types/commit/55d873b))
* finish option methods and result tests ([0b76bc2](https://github.com/alexsasharegan/safe-types/commit/0b76bc2))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/alexsasharegan/safe-types/compare/v1.4.0...v1.5.0) (2018-02-13)


### Features

* **option:** test cov ([5de95c8](https://github.com/alexsasharegan/safe-types/commit/5de95c8))
* **result:** `or_else` impl ([6709ba2](https://github.com/alexsasharegan/safe-types/commit/6709ba2))
* **result:** `or` impl ([dd69973](https://github.com/alexsasharegan/safe-types/commit/dd69973))
* **result:** await methods ([c104358](https://github.com/alexsasharegan/safe-types/commit/c104358))
* **result:** testing ([1e80ffe](https://github.com/alexsasharegan/safe-types/commit/1e80ffe))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/alexsasharegan/safe-types/compare/v1.3.0...v1.4.0) (2018-02-12)


### Features

* promise result types ([55c76d0](https://github.com/alexsasharegan/safe-types/commit/55c76d0))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/alexsasharegan/safe-types/compare/v1.2.2...v1.3.0) (2018-02-12)


### Features

* Ok, Err, Some, None aliases for better API ([8beefb1](https://github.com/alexsasharegan/safe-types/commit/8beefb1))



<a name="1.2.2"></a>
## [1.2.2](https://github.com/alexsasharegan/safe-types/compare/v1.2.1...v1.2.2) (2018-02-12)


### Bug Fixes

* **build:** export commonjs ([013e399](https://github.com/alexsasharegan/safe-types/commit/013e399))



<a name="1.2.1"></a>
## [1.2.1](https://github.com/alexsasharegan/safe-types/compare/v1.2.0...v1.2.1) (2018-02-12)


### Bug Fixes

* typescript build errors ([a5f92b0](https://github.com/alexsasharegan/safe-types/commit/a5f92b0))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/alexsasharegan/safe-types/compare/v1.1.0...v1.2.0) (2018-02-12)


### Features

* add types to pkg.json ([44f8406](https://github.com/alexsasharegan/safe-types/commit/44f8406))
* improve test coverage ([e9067ce](https://github.com/alexsasharegan/safe-types/commit/e9067ce))



<a name="1.1.0"></a>
# 1.1.0 (2018-02-12)


### Features

* Some, None, and Option pseudo types ([557da91](https://github.com/alexsasharegan/safe-types/commit/557da91))
* **option:** add match impl ([0ffaaf2](https://github.com/alexsasharegan/safe-types/commit/0ffaaf2))
* **option:** add testing ([7724739](https://github.com/alexsasharegan/safe-types/commit/7724739))
