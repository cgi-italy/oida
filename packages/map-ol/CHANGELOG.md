# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.4.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/map-ol@1.3.0...@oida/map-ol@1.4.0) (2021-06-18)


### Bug Fixes

* check for extent size on ol map renderer fitExtent ([fe2f266](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/fe2f2667d5678266cb10eb10cb14a74b2e56f735))
* fix source in init in ol geo-image layer ([cec638f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/cec638f4948f1bb68e20d3ba39f3a54a012ff726))


### Features

* add geo-image layer ([33c0d4d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/33c0d4dfd72c27c26a4e02a061c74c4a40c58bf8))
* add last click tracking in mouse coord interaction ([674aae6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/674aae6cce3a842e7b7e6272212fe1addd0b778e))
* add min/max zoom support in tile layer ([159df4f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/159df4f729d81c3326a2b5e30c92e233701eddfc))
* improve feature picking ([5ba3494](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5ba3494454f8708d5a6ac14f201cfdcc0a820313))
* improve support for layer feature hovering and selecting ([d794e65](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d794e65b8eb6adea2b5badbb5400cc62882f4b27))





# [1.3.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/map-ol@1.2.0...@oida/map-ol@1.3.0) (2020-09-11)


### Bug Fixes

* check for undefined style when setting picking props ([b421adf](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b421adf78be516899b62d3348730dc34f7d83d37))


### Features

* allow disabling picking for a geometry from its style ([4eae42d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4eae42d24a23e9149ac579bc5a9bfd5a1cd09277))





# [1.2.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/map-ol@1.1.0...@oida/map-ol@1.2.0) (2020-05-22)


### Bug Fixes

* add missing circle feature support in ol renderer ([b80f756](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b80f756523c8794e1f18dfee99daba3eb3b35f3f))
* fix for mouse coord interaction not working after ol upgrade ([4d5d239](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4d5d23947de5c8d7c3b01bd03bda59132e4598e9))


### Features

* add support for force refreshing a tile source ([8730093](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/87300931e5896b42108508ecefbd0f09292ba8c1))
* add support for line and draw constraints in aoi field ([45b6527](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/45b6527e3ae17e0958828f50da32228acd27846b))
* add support for rendering props update ([42a9703](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/42a97032ac9a5ba3071809a217e64d4c6e847d2a))
* add vertical profile layer selection ([1a1da62](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1a1da62589d3ac33267ce5a26dab571f71c47f55))
* listen for resize events in map component ([42fe879](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/42fe8791e757b4d0d82ef2fc55abdd916a2341b6))





# [1.1.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/map-ol@1.0.0...@oida/map-ol@1.1.0) (2020-02-12)


### Bug Fixes

* fix ol tilegrid computation for non uniform resolution extents ([a68e036](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a68e0363562233e274c1b6d58f33a7aad713018e))
* fix some feature layer error conditions ([d38162b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d38162bb983c377b5dbcb324b55f086210da8012))
* minor fixes ([470fa4a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/470fa4aa19578e6a2bcb77fe12c8cd1e560bf688))


### Features

* add crossOrigin option to wms and wmts tile sources ([1f53fbb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1f53fbbed5484b74a136b80e2769c4bd90f38e4e))
* add initial support for image layers ([6aab5fd](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6aab5fd56c3709bb21b95fd5d71227fc7e1b8d71))
* add maplayer loading state ([5f01f84](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5f01f84c82d63dc55c6d13826988546c35e06335))
* add support for layer extent ([7e62e06](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7e62e065e28573e11968ad848b20b922d40c3ab1))
* add support for map layer zIndex ([b6ec75b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b6ec75b3d4a3b53f5f59c34ce2c2156852265fbd))
* extend geometry with bbox and circle types ([0612690](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0612690fdf26a53fd236d2de3d36a04953503043))





# 1.0.0 (2019-04-09)


### Bug Fixes

* minor fixes ([f1c2209](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f1c2209))
* **map-ol:** fix viewport extent set/get in non geographic projs ([342adb2](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/342adb2))


### Code Refactoring

* refactor ui library ([665be09](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/665be09))
* rename and restructure some packages ([9cbba7d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9cbba7d))


### Features

* **map-ol:** add Openlayers map renderer ([24c6fbf](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/24c6fbf))
* add feature hover/select map interactions ([d8d26a9](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d8d26a9))
* add getViewportExtent and fitExtent methods to map renderer ([5819ff5](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5819ff5))
* add initial support for map feature draw ([90307a6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/90307a6))
* add map and layers renderer implementation in volatile state ([4335eff](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4335eff))
* add new tilesources ([dae91c9](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/dae91c9))
* add support for feature layers ([626922f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/626922f))
* add support for map interactions ([4e22be1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4e22be1))
* add support for tile layers ([d53b17d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d53b17d))


### BREAKING CHANGES

* removed legacy ui library
* Changed npm package namespace from @cgi-eo to @oida. Renamed map-core to core and
map-mobx to state-mst. Changed packages internal directory structure





<a name="0.2.0"></a>
# [0.2.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@cgi-eo/map-ol@0.1.1...@cgi-eo/map-ol@0.2.0) (2018-09-26)


### Features

* add support for feature layers ([626922f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/626922f))





<a name="0.1.1"></a>
## [0.1.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@cgi-eo/map-ol@0.1.0...@cgi-eo/map-ol@0.1.1) (2018-09-21)

**Note:** Version bump only for package @cgi-eo/map-ol





<a name="0.1.0"></a>
# 0.1.0 (2018-09-20)


### Features

* **map-ol:** add Openlayers map renderer ([24c6fbf](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/24c6fbf))
* add support for tile layers ([d53b17d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d53b17d))
