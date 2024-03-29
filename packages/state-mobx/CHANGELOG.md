# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.3.0](https://github.com/cgi-italy/oida/compare/@oidajs/state-mobx@2.2.1...@oidajs/state-mobx@2.3.0) (2023-10-30)

### Bug Fixes

- disable swipe tool for unsupport layer types ([cec6694](https://github.com/cgi-italy/oida/commit/cec6694c3b5b38bebcd6ec4652ceee0b12b1b6b5))

### Features

- add layer swipe interaction and tool ([507ecd8](https://github.com/cgi-italy/oida/commit/507ecd877baf8724346932876fb925d910388af3))

## [2.2.1](https://github.com/cgi-italy/oida/compare/@oidajs/state-mobx@2.2.0...@oidajs/state-mobx@2.2.1) (2023-10-10)

### Bug Fixes

- prevent debounced function invocation on debounce unset in AsyncDataFetcher ([1cb0ef6](https://github.com/cgi-italy/oida/commit/1cb0ef6b15ff097b1c6741683d5f450c7c51b4c1))

# [2.2.0](https://github.com/cgi-italy/oida/compare/@oidajs/state-mobx@2.1.3...@oidajs/state-mobx@2.2.0) (2023-08-09)

### Features

- add support for vector layer clustering ([f3af823](https://github.com/cgi-italy/oida/commit/f3af8230102604859fd8294b5568408a25e5f828))

## [2.1.3](https://github.com/cgi-italy/oida/compare/@oidajs/state-mobx@2.1.2...@oidajs/state-mobx@2.1.3) (2023-04-12)

**Note:** Version bump only for package @oidajs/state-mobx

## [2.1.2](https://github.com/cgi-italy/oida/compare/@oidajs/state-mobx@2.1.1...@oidajs/state-mobx@2.1.2) (2023-04-06)

**Note:** Version bump only for package @oidajs/state-mobx

## [2.1.1](https://github.com/cgi-italy/oida/compare/@oidajs/state-mobx@2.1.0...@oidajs/state-mobx@2.1.1) (2023-01-13)

**Note:** Version bump only for package @oidajs/state-mobx

# [2.1.0](https://github.com/cgi-italy/oida/compare/@oidajs/state-mobx@2.0.5...@oidajs/state-mobx@2.1.0) (2022-12-22)

### Features

- add preliminary workspace save/load support ([508f00a](https://github.com/cgi-italy/oida/commit/508f00a7b360c0e4283a5d472750c8ee54fd1a58))

## [2.0.5](https://github.com/cgi-italy/oida/compare/@oidajs/state-mobx@2.0.4...@oidajs/state-mobx@2.0.5) (2022-10-05)

**Note:** Version bump only for package @oidajs/state-mobx

## [2.0.4](https://github.com/cgi-italy/oida/compare/@oidajs/state-mobx@2.0.3...@oidajs/state-mobx@2.0.4) (2022-07-13)

### Bug Fixes

- init filter reactions in DataFilters constructor ([93bb206](https://github.com/cgi-italy/oida/commit/93bb20613b5a84616b87cf33a3666a29e972eff3))
- propagate new data before updating loading state in AsyncDataFetcher ([948428c](https://github.com/cgi-italy/oida/commit/948428c1a0e8a589a006270957916beeba3c5275))
- solve a few issues with history back/forward navigation in StatePathRouter ([4df7bb5](https://github.com/cgi-italy/oida/commit/4df7bb557da5e4cc513c2a70c66e11641df2f0c7))
- solve some typings issues ([b7b9706](https://github.com/cgi-italy/oida/commit/b7b9706dfff6f1b283eda129bc9a5218f9b475ef))
- unset map renderer implementation from state on controller destroy ([eeb2c71](https://github.com/cgi-italy/oida/commit/eeb2c7113289c36e6f6bf89b9952b90f323ffc9c))

## [2.0.3](https://github.com/cgi-italy/oida/compare/@oidajs/state-mobx@2.0.2...@oidajs/state-mobx@2.0.3) (2022-05-16)

### Bug Fixes

- return the same promise for AsyncDataFetcher debounced request ([52b2d24](https://github.com/cgi-italy/oida/commit/52b2d2419537d3c01fd66089b721ab59446e42ec))

### Reverts

- "fix: return the same promise for AsyncDataFetcher debounced request" ([e5e319f](https://github.com/cgi-italy/oida/commit/e5e319f495c490ee65169ac6022b21a3d0b0ea4a))

## [2.0.2](https://github.com/cgi-italy/oida/compare/@oidajs/state-mobx@2.0.1...@oidajs/state-mobx@2.0.2) (2022-03-09)

### Bug Fixes

- add some checks in ArrayTracker item add/removal ([17e252a](https://github.com/cgi-italy/oida/commit/17e252ac1fa0ff3ef4fed23a8b9e9d8200b9d526))

## [2.0.1](https://github.com/cgi-italy/oida/compare/@oidajs/state-mobx@2.0.0...@oidajs/state-mobx@2.0.1) (2021-12-21)

**Note:** Version bump only for package @oidajs/state-mobx

# 2.0.0 (2021-12-21)

### Bug Fixes

- minor fixes ([5bf1c5d](https://github.com/cgi-italy/oida/commit/5bf1c5d8e62fef3c7eb7c0cf9a268e014e572031))
- remove mobx action annotations in collection overriden methods ([99a2b31](https://github.com/cgi-italy/oida/commit/99a2b3190c7bc8b233147e68524f66143b06e9dd))
- solve some vertical profile layer issues ([1c4255c](https://github.com/cgi-italy/oida/commit/1c4255c92636a2d3d9ad817b7f017f64a24ac088))

### Build System

- change packages name scope ([a8d721d](https://github.com/cgi-italy/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))

### Features

- add color utils in core ([0219ce7](https://github.com/cgi-italy/oida/commit/0219ce75aefe67ff1b534eba192bc821da7321da))
- add fetch paramters in AsyncDataFetcher ([588b994](https://github.com/cgi-italy/oida/commit/588b9940e2fa071125654288868bd5d5092f49d8))
- add geo-image layer ([33c0d4d](https://github.com/cgi-italy/oida/commit/33c0d4dfd72c27c26a4e02a061c74c4a40c58bf8))
- add initial viewport in map module config ([ad94b5f](https://github.com/cgi-italy/oida/commit/ad94b5fc6f74c4e1fd8854300cada210105730c2))
- add last click tracking in mouse coord interaction ([674aae6](https://github.com/cgi-italy/oida/commit/674aae6cce3a842e7b7e6272212fe1addd0b778e))
- add support for filter reactions ([b1a66eb](https://github.com/cgi-italy/oida/commit/b1a66eb27532e8c7e262b9c484752ae2f346f266))
- allow to use numbers as identifiers ([e04eb42](https://github.com/cgi-italy/oida/commit/e04eb420fa84a0749f473eb599e201ef6941bf0c))
- improve analysis ux ([8c2f075](https://github.com/cgi-italy/oida/commit/8c2f075570f1e7c0f04c849ec3daf32d6fc35fbe))
- improve support for layer feature hovering and selecting ([d794e65](https://github.com/cgi-italy/oida/commit/d794e65b8eb6adea2b5badbb5400cc62882f4b27))

### BREAKING CHANGES

- all import to @oida/\* packages shall be updated with @oidajs/\*

# [1.0.0](https://github.com/cgi-italy/oida/compare/@oida/state-mobx@0.3.0...@oidajs/state-mobx@1.0.0) (2021-12-15)

### Bug Fixes

- solve some vertical profile layer issues ([1c4255c](https://github.com/cgi-italy/oida/commit/1c4255c92636a2d3d9ad817b7f017f64a24ac088))

### Build System

- change packages name scope ([a8d721d](https://github.com/cgi-italy/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))

### BREAKING CHANGES

- all import to @oida/\* packages shall be updated with @oidajs/\*

# [0.3.0](https://github.com/cgi-italy/oida/compare/@oida/state-mobx@0.2.0...@oida/state-mobx@0.3.0) (2021-09-28)

### Features

- add initial viewport in map module config ([ad94b5f](https://github.com/cgi-italy/oida/commit/ad94b5fc6f74c4e1fd8854300cada210105730c2))

# 0.2.0 (2021-06-18)

### Bug Fixes

- minor fixes ([5bf1c5d](https://github.com/cgi-italy/oida/commit/5bf1c5d8e62fef3c7eb7c0cf9a268e014e572031))
- remove mobx action annotations in collection overriden methods ([99a2b31](https://github.com/cgi-italy/oida/commit/99a2b3190c7bc8b233147e68524f66143b06e9dd))

### Features

- add color utils in core ([0219ce7](https://github.com/cgi-italy/oida/commit/0219ce75aefe67ff1b534eba192bc821da7321da))
- add fetch paramters in AsyncDataFetcher ([588b994](https://github.com/cgi-italy/oida/commit/588b9940e2fa071125654288868bd5d5092f49d8))
- add geo-image layer ([33c0d4d](https://github.com/cgi-italy/oida/commit/33c0d4dfd72c27c26a4e02a061c74c4a40c58bf8))
- add last click tracking in mouse coord interaction ([674aae6](https://github.com/cgi-italy/oida/commit/674aae6cce3a842e7b7e6272212fe1addd0b778e))
- add support for filter reactions ([b1a66eb](https://github.com/cgi-italy/oida/commit/b1a66eb27532e8c7e262b9c484752ae2f346f266))
- allow to use numbers as identifiers ([e04eb42](https://github.com/cgi-italy/oida/commit/e04eb420fa84a0749f473eb599e201ef6941bf0c))
- improve analysis ux ([8c2f075](https://github.com/cgi-italy/oida/commit/8c2f075570f1e7c0f04c849ec3daf32d6fc35fbe))
- improve support for layer feature hovering and selecting ([d794e65](https://github.com/cgi-italy/oida/commit/d794e65b8eb6adea2b5badbb5400cc62882f4b27))
