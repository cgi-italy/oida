# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx-react@3.5.0...@oidajs/eo-mobx-react@4.0.0) (2022-12-22)


### Bug Fixes

* solve issue with workspace preview saving ([be4c558](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/be4c5582a2bdfc47ee296ec7b31d9cc8ab1059fc))
* use tabs in DatasetExplorerWorkspacesModal when more than one provider is available ([cb37a7d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/cb37a7d1ea1185b998e33eb91bb12abded21e6fb))


### Code Refactoring

* remove seriesRange parameter from DatasetPointSeries props ([aac32bf](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/aac32bf797fb12d616bddf2394d2f1e32d2fa69c))


### Features

* add preliminary workspace save/load support ([508f00a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/508f00a7b360c0e4283a5d472750c8ee54fd1a58))
* add preview support in explorer workspaces ([5bce458](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5bce45857c02aabae08ca97fa9d4224ba06bab57))


### BREAKING CHANGES

* DatasetPointSeries doesn't take a seriesRange parameter anymore. Use rangeValues
parameters from DatasetDimensionProps instead





# [3.5.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx-react@3.4.0...@oidajs/eo-mobx-react@3.5.0) (2022-10-05)


### Bug Fixes

* handle geoserver getFeatureInfo exception ([c6ae252](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c6ae252e824f92c81c0fa6c0510226bedf66650f))
* solve issue in aoi value initialization in AnalysisAoiFilter ([2626007](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/26260077f7f0e14ec113aff818ec3024d11c0359))


### Features

* add point series dimension sync with parent visualization on click ([8022433](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/802243310fbbc1c623783ab6ccef8065d2e44e25))





# [3.4.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx-react@3.3.0...@oidajs/eo-mobx-react@3.4.0) (2022-07-13)


### Features

* add support for setting download options in dataset download config ([16f9b64](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/16f9b64c59448690f31aaa9c44ddd4d4be88a629))





# [3.3.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx-react@3.2.0...@oidajs/eo-mobx-react@3.3.0) (2022-05-16)


### Bug Fixes

* force tile source update on selected profile change ([6f6150a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6f6150a09133323a61e2c4c6af2e0e30716e9236))


### Features

* improve dataset dimensions management ([3f1d0d8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3f1d0d8c1539166694976ea8ba893d826c8ea652))





# [3.2.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx-react@3.1.0...@oidajs/eo-mobx-react@3.2.0) (2022-04-14)


### Bug Fixes

* keep settings and tools buttons also on dataset map viz error ([93a6347](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/93a634776352c154e20a7ae8e252dcd622b9472e))
* use default time distribution filters in timeline zoom to dataset time extent action ([8a0a7bf](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8a0a7bf6ed48b793658c64079ef2a0930f122a46))


### Features

* add support for dimensions in vertical profile dataset ([9753f91](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9753f91a2049c04f3ad8193bafa4d3ce3f7ed0a4))
* add support for more filter types in DatasetVectorVizFilters ([3b99be4](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3b99be485f375e1cbcda9a4a6ab26405d11562b6))
* improve vector dataset visualization ([38f84c8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/38f84c84e605bfc83707352215c872a930a24465))





# [3.1.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx-react@3.0.1...@oidajs/eo-mobx-react@3.1.0) (2022-03-09)


### Bug Fixes

* add categorical dimension range selection placeholder ([a1b9e4e](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a1b9e4e45c600f29c39b13ee67753bda9d81c675))
* apply default colorscale on variable/band selection ([eae81d6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/eae81d6f1003f23c40e7417f4339a11f324748f6))
* improve download error message layout ([7a34aca](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7a34acaef4e88bb705b7971015f40638d048865f))
* propagate filters on time distribution nearest item search ([67b4fa1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/67b4fa1722511c59ac61dfb9186b7fb9addf4d83))
* track coordinates on init in transect chart ([9acea0e](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9acea0e3dd29c731928a7d20fa462703f863da97))


### Features

* add tooltip to describe colormap clamping checkbox behaviour ([608b227](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/608b227d35098f5798aa75faf3e8c859c750a1c0))
* add units display in dimension value selector ([af4464b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/af4464b8d447d6f04a43abc6d3816e389aa635a0))
* enable discovery drawer close on dataset selection ([a03dab5](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a03dab5e2109b2f0b3700760bfba9efc35077e81))
* improve accessibility ([ab3b6a0](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/ab3b6a0150ffc43993ed2cafcdd053529a08159a))
* update routing utils ([8533a76](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8533a76b4220417d811b4114ff770223d26906d8))


### Performance Improvements

* group timeline items add/remove operations and enhance clustering ([fb32fe7](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/fb32fe7b869052a7a6440738de8bf77c4ac82481))





## [3.0.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-mobx-react@3.0.0...@oidajs/eo-mobx-react@3.0.1) (2021-12-21)

**Note:** Version bump only for package @oidajs/eo-mobx-react






# 3.0.0 (2021-12-21)


### Bug Fixes

* add additional checks for adam multiband datasets discovery ([baa40c4](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/baa40c460b9314b4e58e08db17d66985ada464c7))
* add container height check in dashboard pane widget initialization ([8cb9dc6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8cb9dc68732a58f6ec57cd2693f858efbb4d1da5))
* add missing export ([9e45d1b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9e45d1b0f3c0fb00b53372fbf821e56543eb61b8))
* add missing export ([134eb13](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/134eb1320487f4b3bb2ebe006154e8085bc0ff28))
* expose title parameter for dataset explorer timeline ([1f67b3c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1f67b3c83e458cdaded4f42ab5be33aabcf9cfe8))
* filter out disabled discovery providers from tabs navigation ([e5a2346](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e5a2346b1dbae903494a1d84705bf58b3ec70edc))
* handle dataset time request errors ([adb3d3d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/adb3d3d80842bfb842f17facf1f773fcd03ae30c))
* improve checks for histogram range application to map viz ([a0f5293](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a0f529373598f08c48cf15aee91cd7a0a4f78033))
* improve coloring in dataset analyses charts ([094c508](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/094c5082c0ca3199f8470657831853b8d0112e1f))
* init raster sequence colormap range from data ([13c65eb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/13c65eb3bc84510301c005b787a083ce93043975))
* menu typings ([2df838d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/2df838d8e5e57f7fb8b3b1fe95c561ce499ac672))
* minor fixes and improvements ([bd78b2c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bd78b2c1b783283753e957d5abcfe722bb2916fd))
* minor layout updates ([b33062c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b33062c6a6ea207cdcdde39b4f805beb04aa0429))
* minor layout updates ([c41e216](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c41e21632f8f5375350d63dfc2cc7234e81a0b1a))
* minor layout updates ([adb97cd](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/adb97cdf2d89bd426ea83544253b146fa37719b8))
* minor ui fixes and improvements ([99c5a0f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/99c5a0ff6e5e54da182429198501f94c663965ba))
* minor ui improvements ([a2fbb7f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a2fbb7f42ca7fa6600003864c5bd31ffc46fcb8f))
* replace all setImmediate (non standard) calls with setTimeout ([e991548](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e9915486859236b2bfa37760ef4508d0f467dc77))
* solve issue in dashboard widgets auto layout ([fc2d148](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/fc2d148d9e488ba9f4718e72b2e4a18c9db38ecb))
* solve minor issues in analysis dashboard widget layout ([7bb6db3](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7bb6db335f254b370c6a2bfdf18358dc196a5430))
* update only moved handle range endpoint on colormap slider update ([3ba8b07](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3ba8b0758f414b769914b0c90d21e0000c52f471))
* use a smaller offset in timeline step navigation ([fd82e46](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/fd82e461e7efc50725d9a15088736f7f002efa70))
* use es5 version of vis timeline library (fix edge issue) ([f540701](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f540701fc97d0a2ea08a13a27e6497a1d40633ae))


### Build System

* change packages name scope ([a8d721d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))


### Code Refactoring

* improve data collection components ([6b54259](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6b542593300a06cc6fff16a0c0100a99ab786b31))


### Features

* add additional actions to aoi field ([6b7de40](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6b7de40e47d5844a114a9d0f3adfac4d1e33387c))
* add common number formatting utility ([afda2ab](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/afda2ab139d1855704662375fe26013b5f52e2d5))
* add control to perform auto histogram stretch in raster viz ([a441f8f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a441f8f1471c4876417862d9e6b784d79487135c))
* add dataset area statistics tool ([0e4e67f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0e4e67fa9133a9b7bd8d67171e56f359504299a8))
* add dataset explorer analysis tools dropdown component ([b496f5a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b496f5a0c37c331bae99841aa63d6bf72ce9704b))
* add eo dataset grid scatter analysis tool ([88374b6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/88374b67516dbebcefb01c851fe9ad2b1e9cf01e))
* add eo dataset transect analysis tool ([75394b8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/75394b8515fa31d8bb75c034539b215baf6cfe2b))
* add eo map location info tool ([e737282](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e73728218429c3f9482489c5ddf10a93590a65c1))
* add eo video ui controls ([bf73759](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bf73759716b156b152e3b09aa97fedfe1effe082))
* add initial support for opensearch dataset discovery ([bd58dad](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bd58dad47ddcb338ce6f81f4358ab6a6e81d6115))
* add optional colors and positions array in colorscale type ([4bc02a1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4bc02a1cdb9bddefacd54190c426195885928d3f))
* add preliminary support for vectorial datasets visualization ([8ed1e64](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8ed1e64bf2e370281b87a6451a4f7998e0d7fac8))
* add raster sequence analysis ([22914fd](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/22914fddf2cc5294b83535d0161afadf6df038ae))
* add routing support in discovery provider drawer ([73293e4](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/73293e44f40f0c0dfd00ac18e764c932e73cc474))
* add smoothing control to point series chart ([f395b84](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f395b84b27664ea803dafb08f667a5db3f9d2ead))
* add support for additional parameters in raster sequence analysis ([57f5180](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/57f5180eeeaae42426064854ca12756801a3e47e))
* add support for dataset numeric domain scaling and offset ([29fd19b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/29fd19b19b3b678f5eb81a7457afba3b886bec47))
* add support for dataset raster sequence additional filters ([e99cede](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e99cede5a6ca0f9a55cd3923687486522463cefe))
* add support for dynamic domains in DatasetDimensions ([4e28c27](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4e28c278f73ba7057c35c5af0fcfa381a9fc571b))
* add support for layer source error message ([8fc159b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8fc159b32af12fba25dec14ed9fe4b02a356abdd))
* add support for multiple tile layers in RasterMapViz ([389470a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/389470a34cd848652ba9bd145d1de3e141279775))
* add support for percentiles in area stats series ([61eb5eb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/61eb5ebee7be89ff1cb8ea2b4cb52124da62e1bd))
* allow a dimension to be excluded from series selection ([f577579](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f57757971fcc460c8b023cc389c61a014f649558))
* allow aoi import in dataset analyses ([9ffd9aa](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9ffd9aa8f9572876be74c348026c4e6a46fb4189))
* allow customization of dataset download component ([b847fc9](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b847fc98fc9d99360e368ba603e4e389c8d69ee5))
* allow specification of default dataset tools parameters in config ([83984d7](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/83984d7b1a9b051321c641029c058ec28c8c61c7))
* enhance dataset time value selector ([f11c84c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f11c84cc560d3dab50ad07aaf90763e8482529e1))
* hide dimension and variable selectors on unique option ([cbe658c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/cbe658cd4d3275e9a2b6ad9dd93f45f47e8accf3))
* improve analysis dashboard widget positioning ([f56db5d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f56db5d87fad5c10b7a68dbe5b019ce3113aeed2))
* improve analysis ux ([8c2f075](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8c2f075570f1e7c0f04c849ec3daf32d6fc35fbe))
* improve dataset time navigation ui ([a668c3f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a668c3fce38501a53c3cfedf4e852d2ba2c68515))
* minor ui updates ([128ee4a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/128ee4a611dd0f50ebdda167d5c81129876ca27f))
* video layer improvements ([9dcb5fe](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9dcb5fe4b54d1a454a7f26269657d151d4ddcb43))


### BREAKING CHANGES

* all import to @oida/\* packages shall be updated with @oidajs/\*
* RasterMapViz map layer is now a GroupLayer instead of a TileLayer
* Removed icon from collection item props: icons should be added in table column or
list item content





# [2.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/eo-mobx-react@1.0.1...@oidajs/eo-mobx-react@2.0.0) (2021-12-15)


### Bug Fixes

* filter out disabled discovery providers from tabs navigation ([e5a2346](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e5a2346b1dbae903494a1d84705bf58b3ec70edc))
* improve checks for histogram range application to map viz ([a0f5293](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a0f529373598f08c48cf15aee91cd7a0a4f78033))
* minor ui improvements ([a2fbb7f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a2fbb7f42ca7fa6600003864c5bd31ffc46fcb8f))
* replace all setImmediate (non standard) calls with setTimeout ([e991548](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e9915486859236b2bfa37760ef4508d0f467dc77))
* solve minor issues in analysis dashboard widget layout ([7bb6db3](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7bb6db335f254b370c6a2bfdf18358dc196a5430))


### Build System

* change packages name scope ([a8d721d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))


### Features

* add control to perform auto histogram stretch in raster viz ([a441f8f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a441f8f1471c4876417862d9e6b784d79487135c))
* add preliminary support for vectorial datasets visualization ([8ed1e64](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8ed1e64bf2e370281b87a6451a4f7998e0d7fac8))
* add smoothing control to point series chart ([f395b84](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f395b84b27664ea803dafb08f667a5db3f9d2ead))
* add support for dynamic domains in DatasetDimensions ([4e28c27](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4e28c278f73ba7057c35c5af0fcfa381a9fc571b))
* add support for multiple tile layers in RasterMapViz ([389470a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/389470a34cd848652ba9bd145d1de3e141279775))
* allow a dimension to be excluded from series selection ([f577579](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f57757971fcc460c8b023cc389c61a014f649558))
* allow customization of dataset download component ([b847fc9](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b847fc98fc9d99360e368ba603e4e389c8d69ee5))


### BREAKING CHANGES

* all import to @oida/\* packages shall be updated with @oidajs/\*
* RasterMapViz map layer is now a GroupLayer instead of a TileLayer





# [1.1.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/eo-mobx-react@1.0.1...@oida/eo-mobx-react@1.1.0) (2021-09-28)


### Bug Fixes

* add missing export ([9e45d1b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9e45d1b0f3c0fb00b53372fbf821e56543eb61b8))
* expose title parameter for dataset explorer timeline ([1f67b3c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1f67b3c83e458cdaded4f42ab5be33aabcf9cfe8))
* improve coloring in dataset analyses charts ([094c508](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/094c5082c0ca3199f8470657831853b8d0112e1f))
* init raster sequence colormap range from data ([13c65eb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/13c65eb3bc84510301c005b787a083ce93043975))
* solve issue in dashboard widgets auto layout ([fc2d148](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/fc2d148d9e488ba9f4718e72b2e4a18c9db38ecb))
* update only moved handle range endpoint on colormap slider update ([3ba8b07](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3ba8b0758f414b769914b0c90d21e0000c52f471))


### Features

* add support for additional parameters in raster sequence analysis ([57f5180](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/57f5180eeeaae42426064854ca12756801a3e47e))
* allow specification of default dataset tools parameters in config ([83984d7](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/83984d7b1a9b051321c641029c058ec28c8c61c7))
* hide dimension and variable selectors on unique option ([cbe658c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/cbe658cd4d3275e9a2b6ad9dd93f45f47e8accf3))





## [1.0.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/eo-mobx-react@1.0.0...@oida/eo-mobx-react@1.0.1) (2021-06-21)


### Bug Fixes

* use a smaller offset in timeline step navigation ([fd82e46](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/fd82e461e7efc50725d9a15088736f7f002efa70))





# 1.0.0 (2021-06-18)


### Bug Fixes

* add additional checks for adam multiband datasets discovery ([baa40c4](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/baa40c460b9314b4e58e08db17d66985ada464c7))
* add container height check in dashboard pane widget initialization ([8cb9dc6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8cb9dc68732a58f6ec57cd2693f858efbb4d1da5))
* add missing export ([134eb13](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/134eb1320487f4b3bb2ebe006154e8085bc0ff28))
* handle dataset time request errors ([adb3d3d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/adb3d3d80842bfb842f17facf1f773fcd03ae30c))
* menu typings ([2df838d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/2df838d8e5e57f7fb8b3b1fe95c561ce499ac672))
* minor fixes and improvements ([bd78b2c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bd78b2c1b783283753e957d5abcfe722bb2916fd))
* minor layout updates ([c41e216](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c41e21632f8f5375350d63dfc2cc7234e81a0b1a))
* minor layout updates ([adb97cd](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/adb97cdf2d89bd426ea83544253b146fa37719b8))
* minor ui fixes and improvements ([99c5a0f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/99c5a0ff6e5e54da182429198501f94c663965ba))
* use es5 version of vis timeline library (fix edge issue) ([f540701](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f540701fc97d0a2ea08a13a27e6497a1d40633ae))


### Code Refactoring

* improve data collection components ([6b54259](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6b542593300a06cc6fff16a0c0100a99ab786b31))


### Features

* add common number formatting utility ([afda2ab](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/afda2ab139d1855704662375fe26013b5f52e2d5))
* add dataset area statistics tool ([0e4e67f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0e4e67fa9133a9b7bd8d67171e56f359504299a8))
* add dataset explorer analysis tools dropdown component ([b496f5a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b496f5a0c37c331bae99841aa63d6bf72ce9704b))
* add eo dataset grid scatter analysis tool ([88374b6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/88374b67516dbebcefb01c851fe9ad2b1e9cf01e))
* add eo dataset transect analysis tool ([75394b8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/75394b8515fa31d8bb75c034539b215baf6cfe2b))
* add eo map location info tool ([e737282](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e73728218429c3f9482489c5ddf10a93590a65c1))
* add eo video ui controls ([bf73759](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bf73759716b156b152e3b09aa97fedfe1effe082))
* add initial support for opensearch dataset discovery ([bd58dad](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bd58dad47ddcb338ce6f81f4358ab6a6e81d6115))
* add optional colors and positions array in colorscale type ([4bc02a1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4bc02a1cdb9bddefacd54190c426195885928d3f))
* add raster sequence analysis ([22914fd](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/22914fddf2cc5294b83535d0161afadf6df038ae))
* add routing support in discovery provider drawer ([73293e4](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/73293e44f40f0c0dfd00ac18e764c932e73cc474))
* add support for dataset numeric domain scaling and offset ([29fd19b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/29fd19b19b3b678f5eb81a7457afba3b886bec47))
* add support for dataset raster sequence additional filters ([e99cede](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e99cede5a6ca0f9a55cd3923687486522463cefe))
* add support for layer source error message ([8fc159b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8fc159b32af12fba25dec14ed9fe4b02a356abdd))
* add support for percentiles in area stats series ([61eb5eb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/61eb5ebee7be89ff1cb8ea2b4cb52124da62e1bd))
* allow aoi import in dataset analyses ([9ffd9aa](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9ffd9aa8f9572876be74c348026c4e6a46fb4189))
* enhance dataset time value selector ([f11c84c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f11c84cc560d3dab50ad07aaf90763e8482529e1))
* improve analysis dashboard widget positioning ([f56db5d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f56db5d87fad5c10b7a68dbe5b019ce3113aeed2))
* improve analysis ux ([8c2f075](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8c2f075570f1e7c0f04c849ec3daf32d6fc35fbe))
* improve dataset time navigation ui ([a668c3f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a668c3fce38501a53c3cfedf4e852d2ba2c68515))
* minor ui updates ([128ee4a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/128ee4a611dd0f50ebdda167d5c81129876ca27f))
* video layer improvements ([9dcb5fe](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9dcb5fe4b54d1a454a7f26269657d151d4ddcb43))


### BREAKING CHANGES

* Removed icon from collection item props: icons should be added in table column or
list item content
