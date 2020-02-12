# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.1.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/map-cesium@1.0.0...@oida/map-cesium@1.1.0) (2020-02-12)


### Bug Fixes

* fix cesium layers not updating on visibility/opacity change ([56c9c83](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/56c9c832dda06049b6b56f2aa881a4d6d6847ff7))
* fix samples and feature-layer-controller typing error ([441f677](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/441f677df296dba458e536702dcde3e16966ecbb))
* fix tileload event reset on source change ([13d9bc7](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/13d9bc75167dc3bdaa5cc6c4e0a1e070b8dff727))
* optimize imagery layer updates ([a81307d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a81307d809587786a89ed9b1dc7fb6840893cc6b))


### Features

* add maplayer loading state ([5f01f84](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5f01f84c82d63dc55c6d13826988546c35e06335))
* add support for layer extent ([7e62e06](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7e62e065e28573e11968ad848b20b922d40c3ab1))
* add support for map layer zIndex ([b6ec75b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b6ec75b3d4a3b53f5f59c34ce2c2156852265fbd))
* extend geometry with bbox and circle types ([0612690](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0612690fdf26a53fd236d2de3d36a04953503043))





# 1.0.0 (2019-04-09)


### Bug Fixes

* **map-cesium:** fix map view computation in some edge cases ([c217949](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c217949))
* fix bug in tilesource update ([95f5879](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/95f5879))
* fix cesium polygon style update ([4986173](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4986173))


### Code Refactoring

* refactor ui library ([665be09](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/665be09))
* rename and restructure some packages ([9cbba7d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9cbba7d))


### Features

* **map-cesium:** add cesium (https://cesiumjs.org/) map renderer ([04b5210](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/04b5210))
* add feature hover/select map interactions ([d8d26a9](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d8d26a9))
* add getViewportExtent and fitExtent methods to map renderer ([5819ff5](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5819ff5))
* add new tilesources ([dae91c9](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/dae91c9))
* add support for feature layers ([626922f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/626922f))
* add support for map interactions ([4e22be1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4e22be1))


### BREAKING CHANGES

* removed legacy ui library
* Changed npm package namespace from @cgi-eo to @oida. Renamed map-core to core and
map-mobx to state-mst. Changed packages internal directory structure





<a name="0.2.0"></a>
# [0.2.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@cgi-eo/map-cesium@0.1.0...@cgi-eo/map-cesium@0.2.0) (2018-09-26)


### Features

* add support for feature layers ([626922f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/626922f))





<a name="0.1.0"></a>
# 0.1.0 (2018-09-21)


### Features

* **map-cesium:** add cesium (https://cesiumjs.org/) map renderer ([04b5210](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/04b5210))
