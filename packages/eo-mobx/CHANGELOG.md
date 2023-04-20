# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.2.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx@3.1.0...@oidajs/eo-mobx@3.2.0) (2023-04-20)

### Features

- use data table for vector feature multi selection ([7651a6b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7651a6bbedc356f73eef9fb945decb090ca6be46))

# [3.1.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx@3.0.2...@oidajs/eo-mobx@3.1.0) (2023-04-12)

### Features

- improve visualization for vector datasets ([93eb608](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/93eb608ed11d3faf09dd85d262cf5e90ff3694b5))

## [3.0.2](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx@3.0.1...@oidajs/eo-mobx@3.0.2) (2023-04-06)

**Note:** Version bump only for package @oidajs/eo-mobx

## [3.0.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx@3.0.0...@oidajs/eo-mobx@3.0.1) (2023-01-13)

**Note:** Version bump only for package @oidajs/eo-mobx

# [3.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx@2.4.1...@oidajs/eo-mobx@3.0.0) (2022-12-22)

### Code Refactoring

- remove seriesRange parameter from DatasetPointSeries props ([aac32bf](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/aac32bf797fb12d616bddf2394d2f1e32d2fa69c))

### Features

- add factory for dataset config generation from json object ([508829e](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/508829e70a216c6772197f642117bb3f1947e3ea))
- add preliminary workspace save/load support ([508f00a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/508f00a7b360c0e4283a5d472750c8ee54fd1a58))
- add preview support in explorer workspaces ([5bce458](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5bce45857c02aabae08ca97fa9d4224ba06bab57))

### BREAKING CHANGES

- DatasetPointSeries doesn't take a seriesRange parameter anymore. Use rangeValues
  parameters from DatasetDimensionProps instead

## [2.4.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx@2.4.0...@oidajs/eo-mobx@2.4.1) (2022-10-05)

**Note:** Version bump only for package @oidajs/eo-mobx

# [2.4.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx@2.3.0...@oidajs/eo-mobx@2.4.0) (2022-07-13)

### Bug Fixes

- solve some typings issues ([b7b9706](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b7b9706dfff6f1b283eda129bc9a5218f9b475ef))

### Features

- add missing sum in dataset area statistics ([d48b007](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d48b007c22eedfaf7e942e7f48b8cdc095176666))
- add support for setting download options in dataset download config ([16f9b64](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/16f9b64c59448690f31aaa9c44ddd4d4be88a629))

# [2.3.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx@2.2.0...@oidajs/eo-mobx@2.3.0) (2022-05-16)

### Bug Fixes

- init point series range on fixed dimension domain case ([46d6c5c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/46d6c5cdae5728cfb3b57879f42768491e7088a8))

### Features

- improve dataset dimensions management ([3f1d0d8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3f1d0d8c1539166694976ea8ba893d826c8ea652))

# [2.2.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx@2.1.0...@oidajs/eo-mobx@2.2.0) (2022-04-14)

### Bug Fixes

- check for server side page limits on dataset product search response ([3f3017c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3f3017cff258ecc3b2b91ca1ec2a483c08cbad22))
- sync dataset toi immediatly on DatasetExplorerItem initialization ([7f4d587](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7f4d58735a441e34e4058e6a4e84e851984abc6c))

### Features

- add support for dimensions in vertical profile dataset ([9753f91](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9753f91a2049c04f3ad8193bafa4d3ce3f7ed0a4))
- improve vector dataset visualization ([38f84c8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/38f84c84e605bfc83707352215c872a930a24465))

# [2.1.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx@2.0.1...@oidajs/eo-mobx@2.1.0) (2022-03-09)

### Bug Fixes

- check for analysis variable definition when propagating parent variable value ([d45f6c5](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d45f6c58e3ae62c4af7068fbde04de8c4ba982d6))
- propagate filters on time distribution nearest item search ([67b4fa1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/67b4fa1722511c59ac61dfb9186b7fb9addf4d83))

### Features

- add utility to get the overall time extent of a set of datasets ([8c9a705](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8c9a705b6cc56c62d88ecfe099b0477c54b4882f))
- allow overriding the default dataset discovery footprint style ([b770f15](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b770f15714353aff44695ba67260872fa51d2bf6))

## [2.0.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx@2.0.0...@oidajs/eo-mobx@2.0.1) (2021-12-21)

**Note:** Version bump only for package @oidajs/eo-mobx

# 2.0.0 (2021-12-21)

### Bug Fixes

- add active flag initialization in dataset discovery ([590be80](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/590be80098b9c0c9bdad17a8551fcff4df1e36bc))
- add additional checks for adam multiband datasets discovery ([baa40c4](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/baa40c460b9314b4e58e08db17d66985ada464c7))
- add missing export ([134eb13](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/134eb1320487f4b3bb2ebe006154e8085bc0ff28))
- allow disabling auto parent disposal on analysis removal ([bc52304](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bc523048a9d2489d757c656823eda82250145bd2))
- handle dataset time request errors ([adb3d3d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/adb3d3d80842bfb842f17facf1f773fcd03ae30c))
- improve coloring in dataset analyses charts ([094c508](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/094c5082c0ca3199f8470657831853b8d0112e1f))
- init raster sequence colormap range from data ([13c65eb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/13c65eb3bc84510301c005b787a083ce93043975))
- minor fixes ([5bf1c5d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5bf1c5d8e62fef3c7eb7c0cf9a268e014e572031))
- replace all setImmediate (non standard) calls with setTimeout ([e991548](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e9915486859236b2bfa37760ef4508d0f467dc77))
- solve some vertical profile layer issues ([1c4255c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1c4255c92636a2d3d9ad817b7f017f64a24ac088))
- update layer extent before setting the new source ([5bd8c02](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5bd8c02c517e0b05f0b7c7e279d33fde265c3d1d))

### Build System

- change packages name scope ([a8d721d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))

### Features

- add adam dataset discovery ([fcfde83](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/fcfde83d74b8446caa0f39d6989d304f4bbde204))
- add common number formatting utility ([afda2ab](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/afda2ab139d1855704662375fe26013b5f52e2d5))
- add control to perform auto histogram stretch in raster viz ([a441f8f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a441f8f1471c4876417862d9e6b784d79487135c))
- add dataset area statistics tool ([0e4e67f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0e4e67fa9133a9b7bd8d67171e56f359504299a8))
- add eo dataset grid scatter analysis tool ([88374b6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/88374b67516dbebcefb01c851fe9ad2b1e9cf01e))
- add eo dataset transect analysis tool ([75394b8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/75394b8515fa31d8bb75c034539b215baf6cfe2b))
- add eo map location info tool ([e737282](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e73728218429c3f9482489c5ddf10a93590a65c1))
- add fetch paramters in AsyncDataFetcher ([588b994](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/588b9940e2fa071125654288868bd5d5092f49d8))
- add initial support for opensearch dataset discovery ([bd58dad](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bd58dad47ddcb338ce6f81f4358ab6a6e81d6115))
- add optional colors and positions array in colorscale type ([4bc02a1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4bc02a1cdb9bddefacd54190c426195885928d3f))
- add preliminary support for vectorial datasets visualization ([8ed1e64](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8ed1e64bf2e370281b87a6451a4f7998e0d7fac8))
- add raster sequence analysis ([22914fd](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/22914fddf2cc5294b83535d0161afadf6df038ae))
- add support for additional parameters in raster sequence analysis ([57f5180](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/57f5180eeeaae42426064854ca12756801a3e47e))
- add support for dataset numeric domain scaling and offset ([29fd19b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/29fd19b19b3b678f5eb81a7457afba3b886bec47))
- add support for dataset raster sequence additional filters ([e99cede](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e99cede5a6ca0f9a55cd3923687486522463cefe))
- add support for dynamic domains in DatasetDimensions ([4e28c27](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4e28c278f73ba7057c35c5af0fcfa381a9fc571b))
- add support for layer min/max zoom level in raster source provider ([39aeca0](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/39aeca02faaec0101a2109b3c8476db6cf6f5bda))
- add support for layer source error message ([8fc159b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8fc159b32af12fba25dec14ed9fe4b02a356abdd))
- add support for multiple tile layers in RasterMapViz ([389470a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/389470a34cd848652ba9bd145d1de3e141279775))
- add support for percentiles in area stats series ([61eb5eb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/61eb5ebee7be89ff1cb8ea2b4cb52124da62e1bd))
- allow a dimension to be excluded from series selection ([f577579](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f57757971fcc460c8b023cc389c61a014f649558))
- allow aoi import in dataset analyses ([9ffd9aa](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9ffd9aa8f9572876be74c348026c4e6a46fb4189))
- allow specification of default dataset tools parameters in config ([83984d7](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/83984d7b1a9b051321c641029c058ec28c8c61c7))
- automatically init series variable and dimension after creation ([7a73fa4](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7a73fa4c8efb57ac13058fa98a63390b93469783))
- improve analysis ux ([8c2f075](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8c2f075570f1e7c0f04c849ec3daf32d6fc35fbe))
- improve dataset time navigation ui ([a668c3f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a668c3fce38501a53c3cfedf4e852d2ba2c68515))
- use nearest time granule (forward or backward) in eo explorer ([b77e078](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b77e07877c717c8a03f27b9154ae4741d134f7f0))
- video layer improvements ([9dcb5fe](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9dcb5fe4b54d1a454a7f26269657d151d4ddcb43))

### BREAKING CHANGES

- all import to @oida/\* packages shall be updated with @oidajs/\*
- RasterMapViz map layer is now a GroupLayer instead of a TileLayer

# [1.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/eo-mobx@0.3.0...@oidajs/eo-mobx@1.0.0) (2021-12-15)

### Bug Fixes

- replace all setImmediate (non standard) calls with setTimeout ([e991548](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e9915486859236b2bfa37760ef4508d0f467dc77))
- solve some vertical profile layer issues ([1c4255c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1c4255c92636a2d3d9ad817b7f017f64a24ac088))
- update layer extent before setting the new source ([5bd8c02](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5bd8c02c517e0b05f0b7c7e279d33fde265c3d1d))

### Build System

- change packages name scope ([a8d721d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))

### Features

- add control to perform auto histogram stretch in raster viz ([a441f8f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a441f8f1471c4876417862d9e6b784d79487135c))
- add preliminary support for vectorial datasets visualization ([8ed1e64](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8ed1e64bf2e370281b87a6451a4f7998e0d7fac8))
- add support for dynamic domains in DatasetDimensions ([4e28c27](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4e28c278f73ba7057c35c5af0fcfa381a9fc571b))
- add support for layer min/max zoom level in raster source provider ([39aeca0](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/39aeca02faaec0101a2109b3c8476db6cf6f5bda))
- add support for multiple tile layers in RasterMapViz ([389470a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/389470a34cd848652ba9bd145d1de3e141279775))
- allow a dimension to be excluded from series selection ([f577579](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f57757971fcc460c8b023cc389c61a014f649558))

### BREAKING CHANGES

- all import to @oida/\* packages shall be updated with @oidajs/\*
- RasterMapViz map layer is now a GroupLayer instead of a TileLayer

# [0.3.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/eo-mobx@0.2.0...@oida/eo-mobx@0.3.0) (2021-09-28)

### Bug Fixes

- allow disabling auto parent disposal on analysis removal ([bc52304](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bc523048a9d2489d757c656823eda82250145bd2))
- improve coloring in dataset analyses charts ([094c508](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/094c5082c0ca3199f8470657831853b8d0112e1f))
- init raster sequence colormap range from data ([13c65eb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/13c65eb3bc84510301c005b787a083ce93043975))

### Features

- add support for additional parameters in raster sequence analysis ([57f5180](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/57f5180eeeaae42426064854ca12756801a3e47e))
- allow specification of default dataset tools parameters in config ([83984d7](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/83984d7b1a9b051321c641029c058ec28c8c61c7))

# 0.2.0 (2021-06-18)

### Bug Fixes

- add active flag initialization in dataset discovery ([590be80](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/590be80098b9c0c9bdad17a8551fcff4df1e36bc))
- add additional checks for adam multiband datasets discovery ([baa40c4](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/baa40c460b9314b4e58e08db17d66985ada464c7))
- add missing export ([134eb13](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/134eb1320487f4b3bb2ebe006154e8085bc0ff28))
- handle dataset time request errors ([adb3d3d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/adb3d3d80842bfb842f17facf1f773fcd03ae30c))
- minor fixes ([5bf1c5d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5bf1c5d8e62fef3c7eb7c0cf9a268e014e572031))

### Features

- add adam dataset discovery ([fcfde83](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/fcfde83d74b8446caa0f39d6989d304f4bbde204))
- add common number formatting utility ([afda2ab](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/afda2ab139d1855704662375fe26013b5f52e2d5))
- add dataset area statistics tool ([0e4e67f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0e4e67fa9133a9b7bd8d67171e56f359504299a8))
- add eo dataset grid scatter analysis tool ([88374b6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/88374b67516dbebcefb01c851fe9ad2b1e9cf01e))
- add eo dataset transect analysis tool ([75394b8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/75394b8515fa31d8bb75c034539b215baf6cfe2b))
- add eo map location info tool ([e737282](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e73728218429c3f9482489c5ddf10a93590a65c1))
- add fetch paramters in AsyncDataFetcher ([588b994](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/588b9940e2fa071125654288868bd5d5092f49d8))
- add initial support for opensearch dataset discovery ([bd58dad](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bd58dad47ddcb338ce6f81f4358ab6a6e81d6115))
- add optional colors and positions array in colorscale type ([4bc02a1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4bc02a1cdb9bddefacd54190c426195885928d3f))
- add raster sequence analysis ([22914fd](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/22914fddf2cc5294b83535d0161afadf6df038ae))
- add support for dataset numeric domain scaling and offset ([29fd19b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/29fd19b19b3b678f5eb81a7457afba3b886bec47))
- add support for dataset raster sequence additional filters ([e99cede](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e99cede5a6ca0f9a55cd3923687486522463cefe))
- add support for layer source error message ([8fc159b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8fc159b32af12fba25dec14ed9fe4b02a356abdd))
- add support for percentiles in area stats series ([61eb5eb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/61eb5ebee7be89ff1cb8ea2b4cb52124da62e1bd))
- allow aoi import in dataset analyses ([9ffd9aa](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9ffd9aa8f9572876be74c348026c4e6a46fb4189))
- automatically init series variable and dimension after creation ([7a73fa4](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7a73fa4c8efb57ac13058fa98a63390b93469783))
- improve analysis ux ([8c2f075](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8c2f075570f1e7c0f04c849ec3daf32d6fc35fbe))
- improve dataset time navigation ui ([a668c3f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a668c3fce38501a53c3cfedf4e852d2ba2c68515))
- use nearest time granule (forward or backward) in eo explorer ([b77e078](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b77e07877c717c8a03f27b9154ae4741d134f7f0))
- video layer improvements ([9dcb5fe](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9dcb5fe4b54d1a454a7f26269657d151d4ddcb43))
