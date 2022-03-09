# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.1.0](https://github.com/cgi-italy/oida/compare/@oidajs/map-ol@3.0.1...@oidajs/map-ol@3.1.0) (2022-03-09)


### Bug Fixes

* improve tile grid computation logic ([a1c394b](https://github.com/cgi-italy/oida/commit/a1c394b9d760fcfc83f9a66cb86c3b5efa18fa43))


### Features

* add support for minimum resolution constraint in tile grid ([d707caa](https://github.com/cgi-italy/oida/commit/d707caa0a1037457ff95eddf7f8c38fec55150eb))





## [3.0.1](https://github.com/cgi-italy/oida/compare/@oidajs/map-ol@3.0.0...@oidajs/map-ol@3.0.1) (2021-12-21)

**Note:** Version bump only for package @oidajs/map-ol






# 3.0.0 (2021-12-21)


### Bug Fixes

* add missing circle feature support in ol renderer ([b80f756](https://github.com/cgi-italy/oida/commit/b80f756523c8794e1f18dfee99daba3eb3b35f3f))
* check for extent size on ol map renderer fitExtent ([fe2f266](https://github.com/cgi-italy/oida/commit/fe2f2667d5678266cb10eb10cb14a74b2e56f735))
* check for undefined style when setting picking props ([b421adf](https://github.com/cgi-italy/oida/commit/b421adf78be516899b62d3348730dc34f7d83d37))
* fix for mouse coord interaction not working after ol upgrade ([4d5d239](https://github.com/cgi-italy/oida/commit/4d5d23947de5c8d7c3b01bd03bda59132e4598e9))
* fix ol tilegrid computation for non uniform resolution extents ([a68e036](https://github.com/cgi-italy/oida/commit/a68e0363562233e274c1b6d58f33a7aad713018e))
* fix some feature layer error conditions ([d38162b](https://github.com/cgi-italy/oida/commit/d38162bb983c377b5dbcb324b55f086210da8012))
* fix source in init in ol geo-image layer ([cec638f](https://github.com/cgi-italy/oida/commit/cec638f4948f1bb68e20d3ba39f3a54a012ff726))
* minor fixes ([470fa4a](https://github.com/cgi-italy/oida/commit/470fa4aa19578e6a2bcb77fe12c8cd1e560bf688))
* **map-ol:** fix viewport extent set/get in non geographic projs ([342adb2](https://github.com/cgi-italy/oida/commit/342adb2e71e75f843e026fe63e018755be2b5a68))
* minor fixes ([f1c2209](https://github.com/cgi-italy/oida/commit/f1c22090d6e41df33c235a034f4b8bc7b748095f))


### Build System

* change packages name scope ([a8d721d](https://github.com/cgi-italy/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))


### Code Refactoring

* refactor ui library ([665be09](https://github.com/cgi-italy/oida/commit/665be09f9c21304be371273ff55b51e1ea481fa3))
* rename and restructure some packages ([9cbba7d](https://github.com/cgi-italy/oida/commit/9cbba7d3276b3156510c15aca77d79263ae7393b))


### Features

* add crossOrigin option to wms and wmts tile sources ([1f53fbb](https://github.com/cgi-italy/oida/commit/1f53fbbed5484b74a136b80e2769c4bd90f38e4e))
* add feature hover/select map interactions ([d8d26a9](https://github.com/cgi-italy/oida/commit/d8d26a921db4b37cb74e5c57363162b7f11f23a5))
* add geo-image layer ([33c0d4d](https://github.com/cgi-italy/oida/commit/33c0d4dfd72c27c26a4e02a061c74c4a40c58bf8))
* add getViewportExtent and fitExtent methods to map renderer ([5819ff5](https://github.com/cgi-italy/oida/commit/5819ff5dd7f13461c374b378ff0ae0126b93e705))
* add initial support for image layers ([6aab5fd](https://github.com/cgi-italy/oida/commit/6aab5fd56c3709bb21b95fd5d71227fc7e1b8d71))
* add initial support for map feature draw ([90307a6](https://github.com/cgi-italy/oida/commit/90307a68b6a07f5e9f0ecc1c2c6d7f4d77080e6f))
* add last click tracking in mouse coord interaction ([674aae6](https://github.com/cgi-italy/oida/commit/674aae6cce3a842e7b7e6272212fe1addd0b778e))
* add map and layers renderer implementation in volatile state ([4335eff](https://github.com/cgi-italy/oida/commit/4335effa0bf02e4b8e33d5591e8015cd846166c0))
* add maplayer loading state ([5f01f84](https://github.com/cgi-italy/oida/commit/5f01f84c82d63dc55c6d13826988546c35e06335))
* add min/max zoom support in tile layer ([159df4f](https://github.com/cgi-italy/oida/commit/159df4f729d81c3326a2b5e30c92e233701eddfc))
* add new tilesources ([dae91c9](https://github.com/cgi-italy/oida/commit/dae91c98b62f93e6471af55ebffa8097b007e9f6))
* add support for feature layers ([626922f](https://github.com/cgi-italy/oida/commit/626922f72396555405779c77a7c05e6befd87fbb))
* add support for force refreshing a tile source ([8730093](https://github.com/cgi-italy/oida/commit/87300931e5896b42108508ecefbd0f09292ba8c1))
* add support for layer extent ([7e62e06](https://github.com/cgi-italy/oida/commit/7e62e065e28573e11968ad848b20b922d40c3ab1))
* add support for line and draw constraints in aoi field ([45b6527](https://github.com/cgi-italy/oida/commit/45b6527e3ae17e0958828f50da32228acd27846b))
* add support for map interactions ([4e22be1](https://github.com/cgi-italy/oida/commit/4e22be1126d6c59daa7623f93c0bb1b124efd8cf))
* add support for map layer zIndex ([b6ec75b](https://github.com/cgi-italy/oida/commit/b6ec75b3d4a3b53f5f59c34ce2c2156852265fbd))
* add support for rendering props update ([42a9703](https://github.com/cgi-italy/oida/commit/42a97032ac9a5ba3071809a217e64d4c6e847d2a))
* add support for tile layers ([d53b17d](https://github.com/cgi-italy/oida/commit/d53b17dc238751f5c7369daab62431c53de82b35))
* add util to generate an image icon from a feature style object ([9bb241e](https://github.com/cgi-italy/oida/commit/9bb241eabbcd40d04496a65145ef41db5a669c63))
* add vertical profile layer selection ([1a1da62](https://github.com/cgi-italy/oida/commit/1a1da62589d3ac33267ce5a26dab571f71c47f55))
* allow disabling picking for a geometry from its style ([4eae42d](https://github.com/cgi-italy/oida/commit/4eae42d24a23e9149ac579bc5a9bfd5a1cd09277))
* extend geometry with bbox and circle types ([0612690](https://github.com/cgi-italy/oida/commit/0612690fdf26a53fd236d2de3d36a04953503043))
* improve feature picking ([5ba3494](https://github.com/cgi-italy/oida/commit/5ba3494454f8708d5a6ac14f201cfdcc0a820313))
* improve support for layer feature hovering and selecting ([d794e65](https://github.com/cgi-italy/oida/commit/d794e65b8eb6adea2b5badbb5400cc62882f4b27))
* listen for resize events in map component ([42fe879](https://github.com/cgi-italy/oida/commit/42fe8791e757b4d0d82ef2fc55abdd916a2341b6))
* **map-ol:** add Openlayers map renderer ([24c6fbf](https://github.com/cgi-italy/oida/commit/24c6fbf98df79f09e41b12f84756f222ae7ceebf))


### BREAKING CHANGES

* all import to @oida/\* packages shall be updated with @oidajs/\*
* removed legacy ui library
* Changed npm package namespace from @cgi-eo to @oida. Renamed map-core to core and
map-mobx to state-mst. Changed packages internal directory structure





# [2.0.0](https://github.com/cgi-italy/oida/compare/@oida/map-ol@1.4.1...@oidajs/map-ol@2.0.0) (2021-12-15)


### Build System

* change packages name scope ([a8d721d](https://github.com/cgi-italy/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))


### Features

* add util to generate an image icon from a feature style object ([9bb241e](https://github.com/cgi-italy/oida/commit/9bb241eabbcd40d04496a65145ef41db5a669c63))


### BREAKING CHANGES

* all import to @oida/\* packages shall be updated with @oidajs/\*





## [1.4.1](https://github.com/cgi-italy/oida/compare/@oida/map-ol@1.4.0...@oida/map-ol@1.4.1) (2021-09-28)

**Note:** Version bump only for package @oida/map-ol





# [1.4.0](https://github.com/cgi-italy/oida/compare/@oida/map-ol@1.3.0...@oida/map-ol@1.4.0) (2021-06-18)


### Bug Fixes

* check for extent size on ol map renderer fitExtent ([fe2f266](https://github.com/cgi-italy/oida/commit/fe2f2667d5678266cb10eb10cb14a74b2e56f735))
* fix source in init in ol geo-image layer ([cec638f](https://github.com/cgi-italy/oida/commit/cec638f4948f1bb68e20d3ba39f3a54a012ff726))


### Features

* add geo-image layer ([33c0d4d](https://github.com/cgi-italy/oida/commit/33c0d4dfd72c27c26a4e02a061c74c4a40c58bf8))
* add last click tracking in mouse coord interaction ([674aae6](https://github.com/cgi-italy/oida/commit/674aae6cce3a842e7b7e6272212fe1addd0b778e))
* add min/max zoom support in tile layer ([159df4f](https://github.com/cgi-italy/oida/commit/159df4f729d81c3326a2b5e30c92e233701eddfc))
* improve feature picking ([5ba3494](https://github.com/cgi-italy/oida/commit/5ba3494454f8708d5a6ac14f201cfdcc0a820313))
* improve support for layer feature hovering and selecting ([d794e65](https://github.com/cgi-italy/oida/commit/d794e65b8eb6adea2b5badbb5400cc62882f4b27))





# [1.3.0](https://github.com/cgi-italy/oida/compare/@oida/map-ol@1.2.0...@oida/map-ol@1.3.0) (2020-09-11)


### Bug Fixes

* check for undefined style when setting picking props ([b421adf](https://github.com/cgi-italy/oida/commit/b421adf78be516899b62d3348730dc34f7d83d37))


### Features

* allow disabling picking for a geometry from its style ([4eae42d](https://github.com/cgi-italy/oida/commit/4eae42d24a23e9149ac579bc5a9bfd5a1cd09277))





# [1.2.0](https://github.com/cgi-italy/oida/compare/@oida/map-ol@1.1.0...@oida/map-ol@1.2.0) (2020-05-22)


### Bug Fixes

* add missing circle feature support in ol renderer ([b80f756](https://github.com/cgi-italy/oida/commit/b80f756523c8794e1f18dfee99daba3eb3b35f3f))
* fix for mouse coord interaction not working after ol upgrade ([4d5d239](https://github.com/cgi-italy/oida/commit/4d5d23947de5c8d7c3b01bd03bda59132e4598e9))


### Features

* add support for force refreshing a tile source ([8730093](https://github.com/cgi-italy/oida/commit/87300931e5896b42108508ecefbd0f09292ba8c1))
* add support for line and draw constraints in aoi field ([45b6527](https://github.com/cgi-italy/oida/commit/45b6527e3ae17e0958828f50da32228acd27846b))
* add support for rendering props update ([42a9703](https://github.com/cgi-italy/oida/commit/42a97032ac9a5ba3071809a217e64d4c6e847d2a))
* add vertical profile layer selection ([1a1da62](https://github.com/cgi-italy/oida/commit/1a1da62589d3ac33267ce5a26dab571f71c47f55))
* listen for resize events in map component ([42fe879](https://github.com/cgi-italy/oida/commit/42fe8791e757b4d0d82ef2fc55abdd916a2341b6))





# [1.1.0](https://github.com/cgi-italy/oida/compare/@oida/map-ol@1.0.0...@oida/map-ol@1.1.0) (2020-02-12)


### Bug Fixes

* fix ol tilegrid computation for non uniform resolution extents ([a68e036](https://github.com/cgi-italy/oida/commit/a68e0363562233e274c1b6d58f33a7aad713018e))
* fix some feature layer error conditions ([d38162b](https://github.com/cgi-italy/oida/commit/d38162bb983c377b5dbcb324b55f086210da8012))
* minor fixes ([470fa4a](https://github.com/cgi-italy/oida/commit/470fa4aa19578e6a2bcb77fe12c8cd1e560bf688))


### Features

* add crossOrigin option to wms and wmts tile sources ([1f53fbb](https://github.com/cgi-italy/oida/commit/1f53fbbed5484b74a136b80e2769c4bd90f38e4e))
* add initial support for image layers ([6aab5fd](https://github.com/cgi-italy/oida/commit/6aab5fd56c3709bb21b95fd5d71227fc7e1b8d71))
* add maplayer loading state ([5f01f84](https://github.com/cgi-italy/oida/commit/5f01f84c82d63dc55c6d13826988546c35e06335))
* add support for layer extent ([7e62e06](https://github.com/cgi-italy/oida/commit/7e62e065e28573e11968ad848b20b922d40c3ab1))
* add support for map layer zIndex ([b6ec75b](https://github.com/cgi-italy/oida/commit/b6ec75b3d4a3b53f5f59c34ce2c2156852265fbd))
* extend geometry with bbox and circle types ([0612690](https://github.com/cgi-italy/oida/commit/0612690fdf26a53fd236d2de3d36a04953503043))





# 1.0.0 (2019-04-09)


### Bug Fixes

* minor fixes ([f1c2209](https://github.com/cgi-italy/oida/commit/f1c2209))
* **map-ol:** fix viewport extent set/get in non geographic projs ([342adb2](https://github.com/cgi-italy/oida/commit/342adb2))


### Code Refactoring

* refactor ui library ([665be09](https://github.com/cgi-italy/oida/commit/665be09))
* rename and restructure some packages ([9cbba7d](https://github.com/cgi-italy/oida/commit/9cbba7d))


### Features

* **map-ol:** add Openlayers map renderer ([24c6fbf](https://github.com/cgi-italy/oida/commit/24c6fbf))
* add feature hover/select map interactions ([d8d26a9](https://github.com/cgi-italy/oida/commit/d8d26a9))
* add getViewportExtent and fitExtent methods to map renderer ([5819ff5](https://github.com/cgi-italy/oida/commit/5819ff5))
* add initial support for map feature draw ([90307a6](https://github.com/cgi-italy/oida/commit/90307a6))
* add map and layers renderer implementation in volatile state ([4335eff](https://github.com/cgi-italy/oida/commit/4335eff))
* add new tilesources ([dae91c9](https://github.com/cgi-italy/oida/commit/dae91c9))
* add support for feature layers ([626922f](https://github.com/cgi-italy/oida/commit/626922f))
* add support for map interactions ([4e22be1](https://github.com/cgi-italy/oida/commit/4e22be1))
* add support for tile layers ([d53b17d](https://github.com/cgi-italy/oida/commit/d53b17d))


### BREAKING CHANGES

* removed legacy ui library
* Changed npm package namespace from @cgi-eo to @oida. Renamed map-core to core and
map-mobx to state-mst. Changed packages internal directory structure





<a name="0.2.0"></a>
# [0.2.0](https://github.com/cgi-italy/oida/compare/@cgi-eo/map-ol@0.1.1...@cgi-eo/map-ol@0.2.0) (2018-09-26)


### Features

* add support for feature layers ([626922f](https://github.com/cgi-italy/oida/commit/626922f))





<a name="0.1.1"></a>
## [0.1.1](https://github.com/cgi-italy/oida/compare/@cgi-eo/map-ol@0.1.0...@cgi-eo/map-ol@0.1.1) (2018-09-21)

**Note:** Version bump only for package @cgi-eo/map-ol





<a name="0.1.0"></a>
# 0.1.0 (2018-09-20)


### Features

* **map-ol:** add Openlayers map renderer ([24c6fbf](https://github.com/cgi-italy/oida/commit/24c6fbf))
* add support for tile layers ([d53b17d](https://github.com/cgi-italy/oida/commit/d53b17d))
