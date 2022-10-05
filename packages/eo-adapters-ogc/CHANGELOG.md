# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.3.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-adapters-ogc@2.3.0...@oidajs/eo-adapters-ogc@2.3.1) (2022-10-05)


### Bug Fixes

* handle geoserver getFeatureInfo exception ([c6ae252](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c6ae252e824f92c81c0fa6c0510226bedf66650f))
* handle WMS getTimeSeries service exception ([c06d22a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c06d22a75b153c96368d30f006d8abf2d0fa1efd))
* set mandatory "styles" parameter in wms preview url generation ([535f35c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/535f35c1ff9391b641968acc11a62beb715f6d2b))
* solve wms time distribution string parsing error ([4387a22](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4387a229143c1c50d34d2787105b687f108680bb))





# [2.3.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-adapters-ogc@2.2.0...@oidajs/eo-adapters-ogc@2.3.0) (2022-07-13)


### Features

* add missing sum in dataset area statistics ([d48b007](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d48b007c22eedfaf7e942e7f48b8cdc095176666))





# [2.2.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-adapters-ogc@2.1.1...@oidajs/eo-adapters-ogc@2.2.0) (2022-05-16)


### Features

* improve dataset dimensions management ([3f1d0d8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3f1d0d8c1539166694976ea8ba893d826c8ea652))





## [2.1.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-adapters-ogc@2.1.0...@oidajs/eo-adapters-ogc@2.1.1) (2022-04-14)

**Note:** Version bump only for package @oidajs/eo-adapters-ogc





# [2.1.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-adapters-ogc@2.0.1...@oidajs/eo-adapters-ogc@2.1.0) (2022-03-09)


### Features

* update routing utils ([8533a76](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8533a76b4220417d811b4114ff770223d26906d8))





## [2.0.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-adapters-ogc@2.0.0...@oidajs/eo-adapters-ogc@2.0.1) (2021-12-21)

**Note:** Version bump only for package @oidajs/eo-adapters-ogc






# 2.0.0 (2021-12-21)


### Bug Fixes

* add support for an edge case in wms time distribution computation ([b26e73d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b26e73de036c3424af2dd194f6f0263696d3ba72))
* disable time parameter for timeless wms layers ([5b33534](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5b3353400b116f4b3edd71767e10866941b679e5))
* flip extent coordinates for EPSG:4326 in WMS 1.3.0 ([399973f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/399973f5c21b00fe48ad761d7d12754df04b0845))
* handle non geographic SRSs in WMTS spatial coverage provider ([71c3e14](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/71c3e140f2f151c74c023daa0920e54abec81279))
* handle the no step case in WmsTimeDistributionProvider ([8f3ea89](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8f3ea89613924dbd10f00bb2bd0f320a27de7926))
* minor fixes and improvements ([bd78b2c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bd78b2c1b783283753e957d5abcfe722bb2916fd))
* wrong async code invocation in createWcsStatsProvider ([5bc9994](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5bc9994f81ae82e5c559682c4a958b7870651e7b))


### Build System

* change packages name scope ([a8d721d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))


### Features

* add fetch paramters in AsyncDataFetcher ([588b994](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/588b9940e2fa071125654288868bd5d5092f49d8))
* add getFeatureInfo in WmsService and fix issues in wms raster view ([c7e296b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c7e296b730b22f54a6abb97859cfc51d89657b2f))
* add percentiles and band subsetting support in wcs stats provider ([cc8063c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/cc8063cdc300a7d30511029e5f9da07cbf00b52a))
* add preliminary wcs service support ([01abe8c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/01abe8c0482dbff1e3ae8d95531f05eb885db52a))
* add support for dataset numeric domain scaling and offset ([29fd19b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/29fd19b19b3b678f5eb81a7457afba3b886bec47))
* add wcs area statistics tool ([d4cbddb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d4cbddb66d6e80e1cc12ab8f752c9aae69fef414))
* add wmts domain discovery client ([b22e332](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b22e332707d9b9e4b0713fdf4bd55f0e091b3755))
* improve wms discovery ux ([5fc4ebb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5fc4ebb2669ba6c0d84f61d01ecfe507db8193ff))
* use nearest time granule (forward or backward) in eo explorer ([b77e078](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b77e07877c717c8a03f27b9154ae4741d134f7f0))


### Performance Improvements

* reduce image size in WMS GetFeatureInfo request ([4b53546](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4b53546db11c71351b326a5e19742c53e8afe761))


### BREAKING CHANGES

* all import to @oida/\* packages shall be updated with @oidajs/\*





# [1.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/eo-adapters-ogc@0.3.0...@oidajs/eo-adapters-ogc@1.0.0) (2021-12-15)


### Bug Fixes

* wrong async code invocation in createWcsStatsProvider ([5bc9994](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5bc9994f81ae82e5c559682c4a958b7870651e7b))


### Build System

* change packages name scope ([a8d721d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))


### Features

* add percentiles and band subsetting support in wcs stats provider ([cc8063c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/cc8063cdc300a7d30511029e5f9da07cbf00b52a))


### Performance Improvements

* reduce image size in WMS GetFeatureInfo request ([4b53546](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4b53546db11c71351b326a5e19742c53e8afe761))


### BREAKING CHANGES

* all import to @oida/\* packages shall be updated with @oidajs/\*





# [0.3.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/eo-adapters-ogc@0.2.1...@oida/eo-adapters-ogc@0.3.0) (2021-09-28)


### Bug Fixes

* disable time parameter for timeless wms layers ([5b33534](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5b3353400b116f4b3edd71767e10866941b679e5))
* handle the no step case in WmsTimeDistributionProvider ([8f3ea89](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8f3ea89613924dbd10f00bb2bd0f320a27de7926))


### Features

* add wcs area statistics tool ([d4cbddb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d4cbddb66d6e80e1cc12ab8f752c9aae69fef414))





## [0.2.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/eo-adapters-ogc@0.2.0...@oida/eo-adapters-ogc@0.2.1) (2021-06-21)


### Bug Fixes

* handle non geographic SRSs in WMTS spatial coverage provider ([71c3e14](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/71c3e140f2f151c74c023daa0920e54abec81279))





# 0.2.0 (2021-06-18)


### Bug Fixes

* add support for an edge case in wms time distribution computation ([b26e73d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b26e73de036c3424af2dd194f6f0263696d3ba72))
* flip extent coordinates for EPSG:4326 in WMS 1.3.0 ([399973f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/399973f5c21b00fe48ad761d7d12754df04b0845))
* minor fixes and improvements ([bd78b2c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bd78b2c1b783283753e957d5abcfe722bb2916fd))


### Features

* add fetch paramters in AsyncDataFetcher ([588b994](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/588b9940e2fa071125654288868bd5d5092f49d8))
* add getFeatureInfo in WmsService and fix issues in wms raster view ([c7e296b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c7e296b730b22f54a6abb97859cfc51d89657b2f))
* add preliminary wcs service support ([01abe8c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/01abe8c0482dbff1e3ae8d95531f05eb885db52a))
* add support for dataset numeric domain scaling and offset ([29fd19b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/29fd19b19b3b678f5eb81a7457afba3b886bec47))
* add wmts domain discovery client ([b22e332](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b22e332707d9b9e4b0713fdf4bd55f0e091b3755))
* improve wms discovery ux ([5fc4ebb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5fc4ebb2669ba6c0d84f61d01ecfe507db8193ff))
* use nearest time granule (forward or backward) in eo explorer ([b77e078](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b77e07877c717c8a03f27b9154ae4741d134f7f0))
