# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/samples-mst-antd@2.0.1...@oida/samples-mst-antd@3.0.0) (2020-09-11)


### Code Refactoring

* reimplement cancelable promises ([f2d7249](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f2d72494849661151744fe843123b196ff002ff7))


### BREAKING CHANGES

* CancelablePromise type is not defined anymore. New methods merged on Promise
interface
Cancelation doesn't throw anymore. Use finally for cleanup operations





## [2.0.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/samples-mst-antd@2.0.0...@oida/samples-mst-antd@2.0.1) (2020-05-22)

**Note:** Version bump only for package @oida/samples-mst-antd





# [2.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/samples-mst-antd@1.0.0...@oida/samples-mst-antd@2.0.0) (2020-02-12)


### Bug Fixes

* fix samples and feature-layer-controller typing error ([441f677](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/441f677df296dba458e536702dcde3e16966ecbb))


### Code Refactoring

* use react hooks in data collection state management ([626e14d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/626e14d20d4460b327b1f502e39ae8a7ca7b925f))


### BREAKING CHANGES

* data collection related components are now based on hooks. Old renderProps based
components were removed





# 1.0.0 (2019-04-09)


### Bug Fixes

* **samples-mst-antd:** fix wrong import url ([6b39676](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6b39676))


### Code Refactoring

* refactor ui library ([665be09](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/665be09))
* **state-mst:** refactor DynamicUnion into TaggedUnion type ([d018219](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d018219))


### BREAKING CHANGES

* **state-mst:** Removed DynamicUnion. Use TaggedUnion instead. MapEntity, MapEntityCollection moved
into Entity and EntityCollection
* removed legacy ui library
