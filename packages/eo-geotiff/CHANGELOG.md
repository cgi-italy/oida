# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/eo-geotiff@0.2.1...@oidajs/eo-geotiff@1.0.0) (2021-12-15)


### Bug Fixes

* imrpove typing of plotty color scale ([d7c72b5](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d7c72b59cb57b975b097b4f39638d2ae5d2783c1))
* replace all setImmediate (non standard) calls with setTimeout ([e991548](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e9915486859236b2bfa37760ef4508d0f467dc77))


### Build System

* change packages name scope ([a8d721d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))


### Features

* add method to specify a geotiff decoder in GeotiffRenderer ([e9caac4](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e9caac419c366accb0f18049a4b655873899a368))


### BREAKING CHANGES

* all import to @oida/\* packages shall be updated with @oidajs/\*





## [0.2.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/eo-geotiff@0.2.0...@oida/eo-geotiff@0.2.1) (2021-09-28)


### Bug Fixes

* flip rendered image when geotiff y pixel size is positive ([d47de73](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d47de73b3f231d905098e4dc49eae131b545ac3b))


### Performance Improvements

* use decoder pool in geotiff renderer ([f49a8c5](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f49a8c5c1e927b7591dfd3e256e60c3bdeb18d8a))





# 0.2.0 (2021-06-18)


### Bug Fixes

* add a retrycount option to geotiff renderer ([0e36c80](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0e36c80b34af3de271843819c990191b6ecaa4dc))
* add check for user defined srs in geotiff renderer ([2510d18](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/2510d18f0a33188e500d19ca8c7869361b42e2c5))


### Features

* add optional colors and positions array in colorscale type ([4bc02a1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4bc02a1cdb9bddefacd54190c426195885928d3f))
* add support for rescaling the image based on expected geo extent ([0b447dc](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0b447dcb9336a7a42d8a9146601bf73d03e13071))
