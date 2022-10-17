# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.2.1](https://github.com/cgi-italy/oida/compare/@oidajs/map-cesium@3.2.0...@oidajs/map-cesium@3.2.1) (2022-10-05)

**Note:** Version bump only for package @oidajs/map-cesium





# [3.2.0](https://github.com/cgi-italy/oida/compare/@oidajs/map-cesium@3.1.2...@oidajs/map-cesium@3.2.0) (2022-07-13)


### Bug Fixes

* account for window device pixel ratio in cesium map renderer view center computation ([dcc5553](https://github.com/cgi-italy/oida/commit/dcc5553c9d78b6993e7706a385399894c19179f5))


### Features

* add more options to centerOnMap operation ([265bede](https://github.com/cgi-italy/oida/commit/265bede4c3146b27a218cd019595380691a663e8))





## [3.1.2](https://github.com/cgi-italy/oida/compare/@oidajs/map-cesium@3.1.1...@oidajs/map-cesium@3.1.2) (2022-05-16)

**Note:** Version bump only for package @oidajs/map-cesium





## [3.1.1](https://github.com/cgi-italy/oida/compare/@oidajs/map-cesium@3.1.0...@oidajs/map-cesium@3.1.1) (2022-04-14)


### Bug Fixes

* reset entity visibility for non pickable objects in cesium picker ([18e7383](https://github.com/cgi-italy/oida/commit/18e73837e9123c2d02701a72c62ee778dbbdc0e3))





# [3.1.0](https://github.com/cgi-italy/oida/compare/@oidajs/map-cesium@3.0.1...@oidajs/map-cesium@3.1.0) (2022-03-09)


### Features

* add support for minimum resolution constraint in tile grid ([d707caa](https://github.com/cgi-italy/oida/commit/d707caa0a1037457ff95eddf7f8c38fec55150eb))





## [3.0.1](https://github.com/cgi-italy/oida/compare/@oidajs/map-cesium@3.0.0...@oidajs/map-cesium@3.0.1) (2021-12-21)

**Note:** Version bump only for package @oidajs/map-cesium






# 3.0.0 (2021-12-21)


### Bug Fixes

* add cesium billboard zIndex support ([ec1feaf](https://github.com/cgi-italy/oida/commit/ec1feafbaca802bb300f8a1e8f98eb8833953f80))
* add check for scene first render in cesium updateDataSource ([ec8f0d4](https://github.com/cgi-italy/oida/commit/ec8f0d4883be8c9fe27f07ce8d98cff7ccfdbe83))
* add CRS:84 to the list of geographic projections in cesium renderer ([7916dba](https://github.com/cgi-italy/oida/commit/7916dba6cc74c9e4cf3af030f1e930601aec3afd))
* apply current visibility and opacity to new imageries ([183e3ad](https://github.com/cgi-italy/oida/commit/183e3ada31c38e592ed574dc1c670e3466e49b8c))
* catch errors on feature creation in cesium feature layer ([0247c69](https://github.com/cgi-italy/oida/commit/0247c696d5d2554e716d783fda43900102dd3a02))
* check for image readyness before creating colormap texture ([607070d](https://github.com/cgi-italy/oida/commit/607070dadd7e516d2907f4ac9067cadcd2518e70))
* check for null source in cesium tile layer extent update ([4219547](https://github.com/cgi-italy/oida/commit/42195479774f7c71f21aee821ecc80767cee61b1))
* datasource add/removal issue in cesium map layer ([c85f30c](https://github.com/cgi-italy/oida/commit/c85f30cc0e42cd9a5883c7de760361248101a651))
* disable default browser recommended resolution in cesium renderer ([641c4a6](https://github.com/cgi-italy/oida/commit/641c4a610034db842a15e4ed155664feaa7d9517))
* disable fill for large polygons in cesium renderer ([1af6ddb](https://github.com/cgi-italy/oida/commit/1af6ddb4446e3cc141988eb8dab812543b41c7a4))
* fix bug in tilesource update ([95f5879](https://github.com/cgi-italy/oida/commit/95f5879e4150be8945cbfabee62f4ceac9f09387))
* fix cesium layers not updating on visibility/opacity change ([56c9c83](https://github.com/cgi-italy/oida/commit/56c9c832dda06049b6b56f2aa881a4d6d6847ff7))
* fix cesium polygon style update ([4986173](https://github.com/cgi-italy/oida/commit/4986173ad2d982742e768c23d5b53df501fbc033))
* fix issue when primitive style is updated before first rendering ([125432a](https://github.com/cgi-italy/oida/commit/125432ab1f769b48196323188c62a3d2f687843f))
* fix samples and feature-layer-controller typing error ([441f677](https://github.com/cgi-italy/oida/commit/441f677df296dba458e536702dcde3e16966ecbb))
* fix tileload event reset on source change ([13d9bc7](https://github.com/cgi-italy/oida/commit/13d9bc75167dc3bdaa5cc6c4e0a1e070b8dff727))
* handle NaN values in cesium volume layer ([75e68a2](https://github.com/cgi-italy/oida/commit/75e68a2fbefe7e2bd9541595ea7b7ffd80e0548e))
* limit maximum pickable objects in cesium feature interactions ([18efde0](https://github.com/cgi-italy/oida/commit/18efde028048a042dc84529828a78b96e1b6cca2))
* listen to mouseleave event in CesiumMouseCoordsInteraction ([3eb0ed0](https://github.com/cgi-italy/oida/commit/3eb0ed00f88fd78145572ffd01682c1680e9186e))
* make line primitives follow ellipsoid surface ([df939b6](https://github.com/cgi-italy/oida/commit/df939b64ad3d1bb617ef57e648b27f1b8bc7bb54))
* optimize imagery layer updates ([a81307d](https://github.com/cgi-italy/oida/commit/a81307d809587786a89ed9b1dc7fb6840893cc6b))
* prevent coordinates duplication in cesium feature draw ([620b2c8](https://github.com/cgi-italy/oida/commit/620b2c8743917e542ced6468e25676412c95ebb0))
* prevent crash in cesium feature draw interaction ([1ef1c99](https://github.com/cgi-italy/oida/commit/1ef1c99061bf04feba05466f58888b2005b467df))
* prevent error when adding feature without geometry ([15215ce](https://github.com/cgi-italy/oida/commit/15215ce51962e9f1dc71599d3d02076c2d2eb215))
* solve issue in cesium tile scheme initialization ([9b95242](https://github.com/cgi-italy/oida/commit/9b95242c7b50defd4173212f9e46e6a74b22be31))
* solve some vertical profile layer issues ([1c4255c](https://github.com/cgi-italy/oida/commit/1c4255c92636a2d3d9ad817b7f017f64a24ac088))
* update cesium WMS source default parameters ([8d798d8](https://github.com/cgi-italy/oida/commit/8d798d81ee99a799223634dea5d3dda3af22ddda))
* **map-cesium:** fix map view computation in some edge cases ([c217949](https://github.com/cgi-italy/oida/commit/c2179495237d02f494c5858d7048d05824ea1070))


### Build System

* change packages name scope ([a8d721d](https://github.com/cgi-italy/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))


### Code Refactoring

* refactor ui library ([665be09](https://github.com/cgi-italy/oida/commit/665be09f9c21304be371273ff55b51e1ea481fa3))
* rename and restructure some packages ([9cbba7d](https://github.com/cgi-italy/oida/commit/9cbba7d3276b3156510c15aca77d79263ae7393b))


### Features

* add cesium feature layer picking callback ([049bd38](https://github.com/cgi-italy/oida/commit/049bd380eb06fb0a029d3e1c1db299b478ee9432))
* add cesium featuredraw interaction ([7c6eeb0](https://github.com/cgi-italy/oida/commit/7c6eeb06316f44da41aee29c53cbaa9470c42e89))
* add feature hover/select map interactions ([d8d26a9](https://github.com/cgi-italy/oida/commit/d8d26a921db4b37cb74e5c57363162b7f11f23a5))
* add getViewportExtent and fitExtent methods to map renderer ([5819ff5](https://github.com/cgi-italy/oida/commit/5819ff5dd7f13461c374b378ff0ae0126b93e705))
* add last click tracking in mouse coord interaction ([674aae6](https://github.com/cgi-italy/oida/commit/674aae6cce3a842e7b7e6272212fe1addd0b778e))
* add maplayer loading state ([5f01f84](https://github.com/cgi-italy/oida/commit/5f01f84c82d63dc55c6d13826988546c35e06335))
* add min/max zoom support in tile layer ([159df4f](https://github.com/cgi-italy/oida/commit/159df4f729d81c3326a2b5e30c92e233701eddfc))
* add new tilesources ([dae91c9](https://github.com/cgi-italy/oida/commit/dae91c98b62f93e6471af55ebffa8097b007e9f6))
* add preliminary support for feature hovering callbacks ([c144e3b](https://github.com/cgi-italy/oida/commit/c144e3b520ddfba078bd0f441e81c1a408abe16d))
* add support for feature layers ([626922f](https://github.com/cgi-italy/oida/commit/626922f72396555405779c77a7c05e6befd87fbb))
* add support for force refreshing a tile source ([8730093](https://github.com/cgi-italy/oida/commit/87300931e5896b42108508ecefbd0f09292ba8c1))
* add support for layer extent ([7e62e06](https://github.com/cgi-italy/oida/commit/7e62e065e28573e11968ad848b20b922d40c3ab1))
* add support for line and draw constraints in aoi field ([45b6527](https://github.com/cgi-italy/oida/commit/45b6527e3ae17e0958828f50da32228acd27846b))
* add support for map interactions ([4e22be1](https://github.com/cgi-italy/oida/commit/4e22be1126d6c59daa7623f93c0bb1b124efd8cf))
* add support for map layer zIndex ([b6ec75b](https://github.com/cgi-italy/oida/commit/b6ec75b3d4a3b53f5f59c34ce2c2156852265fbd))
* add support for rendering props update ([42a9703](https://github.com/cgi-italy/oida/commit/42a97032ac9a5ba3071809a217e64d4c6e847d2a))
* add support for volume layers ([97be351](https://github.com/cgi-italy/oida/commit/97be351670c9d5fe38ab9a707d04722f5c874790))
* add vertical profile layer ([5cea9c9](https://github.com/cgi-italy/oida/commit/5cea9c99a25412ee795fc869398f670ea43d8320))
* add vertical profile layer selection ([1a1da62](https://github.com/cgi-italy/oida/commit/1a1da62589d3ac33267ce5a26dab571f71c47f55))
* allow disabling picking for a geometry from its style ([4eae42d](https://github.com/cgi-italy/oida/commit/4eae42d24a23e9149ac579bc5a9bfd5a1cd09277))
* enable entity api support in cesium layers ([edf4ce9](https://github.com/cgi-italy/oida/commit/edf4ce94186eee3c69470d599d7040071d19e97e))
* enable slice loading function in volumesource ([c8403f7](https://github.com/cgi-italy/oida/commit/c8403f79ef4a9a99b18e27fd0d815ce11b50ae96))
* extend geometry with bbox and circle types ([0612690](https://github.com/cgi-italy/oida/commit/0612690fdf26a53fd236d2de3d36a04953503043))
* improve feature picking ([5ba3494](https://github.com/cgi-italy/oida/commit/5ba3494454f8708d5a6ac14f201cfdcc0a820313))
* improve support for layer feature hovering and selecting ([d794e65](https://github.com/cgi-italy/oida/commit/d794e65b8eb6adea2b5badbb5400cc62882f4b27))
* listen for resize events in map component ([42fe879](https://github.com/cgi-italy/oida/commit/42fe8791e757b4d0d82ef2fc55abdd916a2341b6))
* **map-cesium:** add cesium (https://cesiumjs.org/) map renderer ([04b5210](https://github.com/cgi-italy/oida/commit/04b5210b663e74a5aac9e7914cabe67a32cb806a))


### BREAKING CHANGES

* all import to @oida/\* packages shall be updated with @oidajs/\*
* removed legacy ui library
* Changed npm package namespace from @cgi-eo to @oida. Renamed map-core to core and
map-mobx to state-mst. Changed packages internal directory structure





# [2.0.0](https://github.com/cgi-italy/oida/compare/@oida/map-cesium@1.4.1...@oidajs/map-cesium@2.0.0) (2021-12-15)


### Bug Fixes

* disable fill for large polygons in cesium renderer ([1af6ddb](https://github.com/cgi-italy/oida/commit/1af6ddb4446e3cc141988eb8dab812543b41c7a4))
* limit maximum pickable objects in cesium feature interactions ([18efde0](https://github.com/cgi-italy/oida/commit/18efde028048a042dc84529828a78b96e1b6cca2))
* prevent coordinates duplication in cesium feature draw ([620b2c8](https://github.com/cgi-italy/oida/commit/620b2c8743917e542ced6468e25676412c95ebb0))
* solve some vertical profile layer issues ([1c4255c](https://github.com/cgi-italy/oida/commit/1c4255c92636a2d3d9ad817b7f017f64a24ac088))


### Build System

* change packages name scope ([a8d721d](https://github.com/cgi-italy/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))


### BREAKING CHANGES

* all import to @oida/\* packages shall be updated with @oidajs/\*





## [1.4.1](https://github.com/cgi-italy/oida/compare/@oida/map-cesium@1.4.0...@oida/map-cesium@1.4.1) (2021-09-28)

**Note:** Version bump only for package @oida/map-cesium





# [1.4.0](https://github.com/cgi-italy/oida/compare/@oida/map-cesium@1.3.0...@oida/map-cesium@1.4.0) (2021-06-18)


### Bug Fixes

* add check for scene first render in cesium updateDataSource ([ec8f0d4](https://github.com/cgi-italy/oida/commit/ec8f0d4883be8c9fe27f07ce8d98cff7ccfdbe83))
* add CRS:84 to the list of geographic projections in cesium renderer ([7916dba](https://github.com/cgi-italy/oida/commit/7916dba6cc74c9e4cf3af030f1e930601aec3afd))
* catch errors on feature creation in cesium feature layer ([0247c69](https://github.com/cgi-italy/oida/commit/0247c696d5d2554e716d783fda43900102dd3a02))
* check for image readyness before creating colormap texture ([607070d](https://github.com/cgi-italy/oida/commit/607070dadd7e516d2907f4ac9067cadcd2518e70))
* disable default browser recommended resolution in cesium renderer ([641c4a6](https://github.com/cgi-italy/oida/commit/641c4a610034db842a15e4ed155664feaa7d9517))
* fix issue when primitive style is updated before first rendering ([125432a](https://github.com/cgi-italy/oida/commit/125432ab1f769b48196323188c62a3d2f687843f))
* handle NaN values in cesium volume layer ([75e68a2](https://github.com/cgi-italy/oida/commit/75e68a2fbefe7e2bd9541595ea7b7ffd80e0548e))
* solve issue in cesium tile scheme initialization ([9b95242](https://github.com/cgi-italy/oida/commit/9b95242c7b50defd4173212f9e46e6a74b22be31))
* update cesium WMS source default parameters ([8d798d8](https://github.com/cgi-italy/oida/commit/8d798d81ee99a799223634dea5d3dda3af22ddda))


### Features

* add last click tracking in mouse coord interaction ([674aae6](https://github.com/cgi-italy/oida/commit/674aae6cce3a842e7b7e6272212fe1addd0b778e))
* add min/max zoom support in tile layer ([159df4f](https://github.com/cgi-italy/oida/commit/159df4f729d81c3326a2b5e30c92e233701eddfc))
* improve feature picking ([5ba3494](https://github.com/cgi-italy/oida/commit/5ba3494454f8708d5a6ac14f201cfdcc0a820313))
* improve support for layer feature hovering and selecting ([d794e65](https://github.com/cgi-italy/oida/commit/d794e65b8eb6adea2b5badbb5400cc62882f4b27))





# [1.3.0](https://github.com/cgi-italy/oida/compare/@oida/map-cesium@1.2.0...@oida/map-cesium@1.3.0) (2020-09-11)


### Bug Fixes

* add cesium billboard zIndex support ([ec1feaf](https://github.com/cgi-italy/oida/commit/ec1feafbaca802bb300f8a1e8f98eb8833953f80))
* apply current visibility and opacity to new imageries ([183e3ad](https://github.com/cgi-italy/oida/commit/183e3ada31c38e592ed574dc1c670e3466e49b8c))
* check for null source in cesium tile layer extent update ([4219547](https://github.com/cgi-italy/oida/commit/42195479774f7c71f21aee821ecc80767cee61b1))
* listen to mouseleave event in CesiumMouseCoordsInteraction ([3eb0ed0](https://github.com/cgi-italy/oida/commit/3eb0ed00f88fd78145572ffd01682c1680e9186e))


### Features

* add preliminary support for feature hovering callbacks ([c144e3b](https://github.com/cgi-italy/oida/commit/c144e3b520ddfba078bd0f441e81c1a408abe16d))
* allow disabling picking for a geometry from its style ([4eae42d](https://github.com/cgi-italy/oida/commit/4eae42d24a23e9149ac579bc5a9bfd5a1cd09277))





# [1.2.0](https://github.com/cgi-italy/oida/compare/@oida/map-cesium@1.1.0...@oida/map-cesium@1.2.0) (2020-05-22)


### Bug Fixes

* datasource add/removal issue in cesium map layer ([c85f30c](https://github.com/cgi-italy/oida/commit/c85f30cc0e42cd9a5883c7de760361248101a651))
* make line primitives follow ellipsoid surface ([df939b6](https://github.com/cgi-italy/oida/commit/df939b64ad3d1bb617ef57e648b27f1b8bc7bb54))
* prevent error when adding feature without geometry ([15215ce](https://github.com/cgi-italy/oida/commit/15215ce51962e9f1dc71599d3d02076c2d2eb215))


### Features

* add cesium feature layer picking callback ([049bd38](https://github.com/cgi-italy/oida/commit/049bd380eb06fb0a029d3e1c1db299b478ee9432))
* add cesium featuredraw interaction ([7c6eeb0](https://github.com/cgi-italy/oida/commit/7c6eeb06316f44da41aee29c53cbaa9470c42e89))
* add support for force refreshing a tile source ([8730093](https://github.com/cgi-italy/oida/commit/87300931e5896b42108508ecefbd0f09292ba8c1))
* add support for line and draw constraints in aoi field ([45b6527](https://github.com/cgi-italy/oida/commit/45b6527e3ae17e0958828f50da32228acd27846b))
* add support for rendering props update ([42a9703](https://github.com/cgi-italy/oida/commit/42a97032ac9a5ba3071809a217e64d4c6e847d2a))
* add support for volume layers ([97be351](https://github.com/cgi-italy/oida/commit/97be351670c9d5fe38ab9a707d04722f5c874790))
* add vertical profile layer ([5cea9c9](https://github.com/cgi-italy/oida/commit/5cea9c99a25412ee795fc869398f670ea43d8320))
* add vertical profile layer selection ([1a1da62](https://github.com/cgi-italy/oida/commit/1a1da62589d3ac33267ce5a26dab571f71c47f55))
* enable entity api support in cesium layers ([edf4ce9](https://github.com/cgi-italy/oida/commit/edf4ce94186eee3c69470d599d7040071d19e97e))
* enable slice loading function in volumesource ([c8403f7](https://github.com/cgi-italy/oida/commit/c8403f79ef4a9a99b18e27fd0d815ce11b50ae96))
* listen for resize events in map component ([42fe879](https://github.com/cgi-italy/oida/commit/42fe8791e757b4d0d82ef2fc55abdd916a2341b6))





# [1.1.0](https://github.com/cgi-italy/oida/compare/@oida/map-cesium@1.0.0...@oida/map-cesium@1.1.0) (2020-02-12)


### Bug Fixes

* fix cesium layers not updating on visibility/opacity change ([56c9c83](https://github.com/cgi-italy/oida/commit/56c9c832dda06049b6b56f2aa881a4d6d6847ff7))
* fix samples and feature-layer-controller typing error ([441f677](https://github.com/cgi-italy/oida/commit/441f677df296dba458e536702dcde3e16966ecbb))
* fix tileload event reset on source change ([13d9bc7](https://github.com/cgi-italy/oida/commit/13d9bc75167dc3bdaa5cc6c4e0a1e070b8dff727))
* optimize imagery layer updates ([a81307d](https://github.com/cgi-italy/oida/commit/a81307d809587786a89ed9b1dc7fb6840893cc6b))


### Features

* add maplayer loading state ([5f01f84](https://github.com/cgi-italy/oida/commit/5f01f84c82d63dc55c6d13826988546c35e06335))
* add support for layer extent ([7e62e06](https://github.com/cgi-italy/oida/commit/7e62e065e28573e11968ad848b20b922d40c3ab1))
* add support for map layer zIndex ([b6ec75b](https://github.com/cgi-italy/oida/commit/b6ec75b3d4a3b53f5f59c34ce2c2156852265fbd))
* extend geometry with bbox and circle types ([0612690](https://github.com/cgi-italy/oida/commit/0612690fdf26a53fd236d2de3d36a04953503043))





# 1.0.0 (2019-04-09)


### Bug Fixes

* **map-cesium:** fix map view computation in some edge cases ([c217949](https://github.com/cgi-italy/oida/commit/c217949))
* fix bug in tilesource update ([95f5879](https://github.com/cgi-italy/oida/commit/95f5879))
* fix cesium polygon style update ([4986173](https://github.com/cgi-italy/oida/commit/4986173))


### Code Refactoring

* refactor ui library ([665be09](https://github.com/cgi-italy/oida/commit/665be09))
* rename and restructure some packages ([9cbba7d](https://github.com/cgi-italy/oida/commit/9cbba7d))


### Features

* **map-cesium:** add cesium (https://cesiumjs.org/) map renderer ([04b5210](https://github.com/cgi-italy/oida/commit/04b5210))
* add feature hover/select map interactions ([d8d26a9](https://github.com/cgi-italy/oida/commit/d8d26a9))
* add getViewportExtent and fitExtent methods to map renderer ([5819ff5](https://github.com/cgi-italy/oida/commit/5819ff5))
* add new tilesources ([dae91c9](https://github.com/cgi-italy/oida/commit/dae91c9))
* add support for feature layers ([626922f](https://github.com/cgi-italy/oida/commit/626922f))
* add support for map interactions ([4e22be1](https://github.com/cgi-italy/oida/commit/4e22be1))


### BREAKING CHANGES

* removed legacy ui library
* Changed npm package namespace from @cgi-eo to @oida. Renamed map-core to core and
map-mobx to state-mst. Changed packages internal directory structure





<a name="0.2.0"></a>
# [0.2.0](https://github.com/cgi-italy/oida/compare/@cgi-eo/map-cesium@0.1.0...@cgi-eo/map-cesium@0.2.0) (2018-09-26)


### Features

* add support for feature layers ([626922f](https://github.com/cgi-italy/oida/commit/626922f))





<a name="0.1.0"></a>
# 0.1.0 (2018-09-21)


### Features

* **map-cesium:** add cesium (https://cesiumjs.org/) map renderer ([04b5210](https://github.com/cgi-italy/oida/commit/04b5210))
