# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/eo-ui@1.2.0...@oida/eo-ui@2.0.0) (2020-09-11)


### Code Refactoring

* reimplement cancelable promises ([f2d7249](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f2d72494849661151744fe843123b196ff002ff7))
* update DatasetVariable definition ([4875009](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4875009fb8dc1835281512d900d85813ca40af57))


### Features

* add analysis aoi linking/unlinking tools ([96fe274](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/96fe2748cda01d868e283f08e52e713a8a97e147))
* add area statistics series support ([49648e1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/49648e1856ea9ec80bd6ceb53e863c718457ca15))
* add generic dataset dimension selectors ([89fef99](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/89fef99b7b2056e65d18d3be5b8872efeddc87aa))
* add preliminary support for transect analysis ([c31abc3](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c31abc33207356cd61467b01607496e1bd04399c))
* add preliminary support for vector datasets ([4a37c39](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4a37c393e7119d8b01c4d8cf775779ab48716d1c))
* add remove action in dataset map viz item ([5f7cdc3](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5f7cdc34e15541824180721eb785f333284b3713))
* add support for dataset dimension selection in raster viz ([0fd6c29](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0fd6c291dd7c0caa6cd9398423cb746465b9fee6))
* add units in colormap control ([3dd08fc](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3dd08fc0fc02e35ecfea91a8b47afeed3e760c09))
* allow to move analyses between charts ([738ec7e](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/738ec7ee8b68e4b58bfcf61f709009317e653643))
* imporve support for eo multiband datasets ([bc1a85d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bc1a85d0ac20a93a4c2be51a857aca53dce18917))
* improve dataset analysis support ([53320bb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/53320bbea16c52f8e9cb19235c601fa8f2ceabef))
* improve dataset time navigation ([0b055d2](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0b055d2fa5f232766c7408394df04e2bf6b67f85))
* link map and chart view for transect series point highlight ([064fd45](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/064fd45e77f37d5febc31d834b73fcc51ff045b7))


### BREAKING CHANGES

* Code using the DatasetVariable and DatasetDimension types should be updated to use
the new generic type
* CancelablePromise type is not defined anymore. New methods merged on Promise
interface
Cancelation doesn't throw anymore. Use finally for cleanup operations





# [1.2.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/eo-ui@1.1.0...@oida/eo-ui@1.2.0) (2020-05-22)


### Bug Fixes

* update to latest aoi API ([1c06b12](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1c06b12916ae0e4c1eea69236c57b93422ad300e))


### Features

* add 2d widget for vertical profile viz ([9f41429](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9f41429242b2122685e9e228019067991a881229))
* add eo volumetric viz ([3a80f26](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3a80f263b74ce283379f7f26bceed930ca92d9b2))
* add status monitoring in eo dataset download ([da6b6ac](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/da6b6ac2987efd4d11e05245be606958dccb78f9))
* add support for volume layers ([97be351](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/97be351670c9d5fe38ab9a707d04722f5c874790))
* add vertical profile datasets support ([36ec79e](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/36ec79ee5222bc2a05a8e9ba3d2f78c0fb8cd516))
* minor eo improvements ([03c13c0](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/03c13c0f191de497608f0c746fa704151e57926e))
* refactor eo mapViz/analysis ([07228a0](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/07228a05699450de30f493b65ffa369c590be94d))
* save previous view mode settings on switch ([d0387a5](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d0387a5b13489604b56449fbbd700c067c85d583))





# 1.1.0 (2020-02-12)


### Bug Fixes

* fix samples and feature-layer-controller typing error ([441f677](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/441f677df296dba458e536702dcde3e16966ecbb))
* remove unused import ([7c15927](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7c1592765112069187b2a4c8e3aa8b2c36c7f38a))


### Features

* add eo colormap selector ([f099a38](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f099a387d26ae32f30430277f4b1c2674d71eb65))
* add eo packages ([1122419](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1122419d0b8b4116d44a6183f02848c82ba3f714))
* add eo volumetric stack viz ([e744dd9](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e744dd95b79d028ecef283d3f4905561279ebf22))
* add initial dataset tools support ([8d0cb1f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8d0cb1fba2a47c211fe56b61baaf2501b547de9e))
* add initial eo dataset download support ([cf7d7c3](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/cf7d7c37b87ad201cc000b1a2ae75048c6ea48c1))
* add preliminary aoi import support ([1e11eb3](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1e11eb3fd026c134fbd62ddc39463557edd8c2f5))
* improve eo analysis tools ([9d77f06](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9d77f06259f17002ac3e92a80dad334322ab83b5))
* minor UI fixes and improvements ([8f1f29d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8f1f29d52c07a11036374738307c40008a42071e))
