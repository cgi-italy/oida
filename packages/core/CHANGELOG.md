# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.1.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/core@2.0.0...@oida/core@2.1.0) (2021-06-18)


### Bug Fixes

* add missing return statement in fliGeometryCoords function ([7582d93](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7582d932d743699531849486c1522fcd6ae63788))
* add missing TileSource definition ([002bf8f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/002bf8fcec21764c092f0f52a70728357440e541))
* minor fixes and improvements ([bd78b2c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bd78b2c1b783283753e957d5abcfe722bb2916fd))
* typing issues ([8db52dd](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8db52dd222a065614d81cf9feec976448fe2bebe))


### Features

* add aoi field factory ([6bf45be](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6bf45beedd40001d930c69090b8b2ed18aec0d00))
* add color utils in core ([0219ce7](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0219ce75aefe67ff1b534eba192bc821da7321da))
* add common number formatting utility ([afda2ab](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/afda2ab139d1855704662375fe26013b5f52e2d5))
* add geo-image layer ([33c0d4d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/33c0d4dfd72c27c26a4e02a061c74c4a40c58bf8))
* add getGeometryCenter util ([54e8ec7](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/54e8ec7d5d9aa4ce7a2b1ddc6e183561665f79a8))
* add last click tracking in mouse coord interaction ([674aae6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/674aae6cce3a842e7b7e6272212fe1addd0b778e))
* add map aoi field component ([aacdecf](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/aacdecff3248b8e1e513dafe77bab2decda35f08))
* add min/max zoom support in tile layer ([159df4f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/159df4f729d81c3326a2b5e30c92e233701eddfc))
* add some basic url utilities ([bb0a839](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bb0a839c33d24d2f081b0d2d0cf22bb546447417))
* add some basic xml parsing utils ([fd67ad6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/fd67ad6bcbe008f1a67a9d6f2425691883c214e0))
* add support for async data in enum field ([70c8d54](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/70c8d5448387e3fb2ea6cf5f6d4d0299554e4a48))
* add support for limiting date/time selection in date picker ([d95a006](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d95a006fc52ad598bbbc12efa36de57d2c56a69f))
* add utility class to retrieve srs defs from spatialreference.org ([573f267](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/573f267f5e44e37949aefaf9b8f230d7ea010f7a))
* add utility to check extent validity ([a0afa8b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a0afa8be43b54c8f85b0fa4f682ee7d1df4189f8))
* improve support for layer feature hovering and selecting ([d794e65](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d794e65b8eb6adea2b5badbb5400cc62882f4b27))





# [2.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/core@1.2.0...@oida/core@2.0.0) (2020-09-11)


### Bug Fixes

* solve issue in cancelable promise implementation ([92413a3](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/92413a3fb2ab6ec477d3105792e6a640f6d65477))


### Code Refactoring

* reimplement cancelable promises ([f2d7249](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f2d72494849661151744fe843123b196ff002ff7))


### Features

* add date form field ([e946019](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e946019e77239cfd3862e55b3d2f64a2649161c0))
* allow disabling picking for a geometry from its style ([4eae42d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4eae42d24a23e9149ac579bc5a9bfd5a1cd09277))
* improve dataset analysis support ([53320bb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/53320bbea16c52f8e9cb19235c601fa8f2ceabef))
* improve dataset time navigation ([0b055d2](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0b055d2fa5f232766c7408394df04e2bf6b67f85))


### BREAKING CHANGES

* CancelablePromise type is not defined anymore. New methods merged on Promise
interface
Cancelation doesn't throw anymore. Use finally for cleanup operations





# [1.2.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/core@1.1.0...@oida/core@1.2.0) (2020-05-22)


### Features

* add support for force refreshing a tile source ([8730093](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/87300931e5896b42108508ecefbd0f09292ba8c1))
* add support for line and draw constraints in aoi field ([45b6527](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/45b6527e3ae17e0958828f50da32228acd27846b))
* add support for rendering props update ([42a9703](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/42a97032ac9a5ba3071809a217e64d4c6e847d2a))
* add support for volume layers ([97be351](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/97be351670c9d5fe38ab9a707d04722f5c874790))
* add vertical profile layer ([5cea9c9](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5cea9c99a25412ee795fc869398f670ea43d8320))
* add vertical profile layer selection ([1a1da62](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1a1da62589d3ac33267ce5a26dab571f71c47f55))
* enable slice loading function in volumesource ([c8403f7](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c8403f79ef4a9a99b18e27fd0d815ce11b50ae96))
* listen for resize events in map component ([42fe879](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/42fe8791e757b4d0d82ef2fc55abdd916a2341b6))
* move form field definition in core ([0509f7c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0509f7c0a191d6220d1cbfa04ac13a3504402a79))





# [1.1.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/core@1.0.0...@oida/core@1.1.0) (2020-02-12)


### Bug Fixes

* fix area unit labels ([22f5543](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/22f5543d72cdbd836f62eea6a98eef889929448a))


### Features

* **core:** add file size formatter ([1ebdffe](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1ebdffe9faf2baf6467d4c59d76994795bf9c036))
* **state-mst:** add MaybeType ([e8a0518](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e8a051824ad0392885b6cf4d5cf62da477d41172))
* add filter type in data filtering state ([2819562](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/2819562cdedb9ba1ebdd1c36b790878e41deff0c))
* add initial support for image layers ([6aab5fd](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6aab5fd56c3709bb21b95fd5d71227fc7e1b8d71))
* add promise wrapper helper function ([17f5bdb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/17f5bdb146a6545769235ed6becb1f5b3706a305))
* add support for layer extent ([7e62e06](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7e62e065e28573e11968ad848b20b922d40c3ab1))
* add support for map layer zIndex ([b6ec75b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b6ec75b3d4a3b53f5f59c34ce2c2156852265fbd))
* extend axios instance with cancelable request ([b4c520b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b4c520b9c37e54683c616323238c8515cfdeb0ed))
* extend geometry with bbox and circle types ([0612690](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0612690fdf26a53fd236d2de3d36a04953503043))





# 1.0.0 (2019-04-09)


### Bug Fixes

* add missing Color export ([5d7da73](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5d7da73))


### Code Refactoring

* refactor ui library ([665be09](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/665be09))
* rename and restructure some packages ([9cbba7d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9cbba7d))


### Features

* add feature hover/select map interactions ([d8d26a9](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d8d26a9))
* add getViewportExtent and fitExtent methods to map renderer ([5819ff5](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5819ff5))
* add initial support for map feature draw ([90307a6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/90307a6))
* add map and layers renderer implementation in volatile state ([4335eff](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4335eff))
* add new types and mixins ([3990d8f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3990d8f))
* **ui-react-mst:** add formatters module ([0ad31f7](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0ad31f7))
* minor types updates ([7d194c1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7d194c1))


### Reverts

* revert commit of WIP feature ([459d907](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/459d907))


### BREAKING CHANGES

* removed legacy ui library
* Changed npm package namespace from @cgi-eo to @oida. Renamed map-core to core and
map-mobx to state-mst. Changed packages internal directory structure





<a name="0.3.0"></a>
# [0.3.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@cgi-eo/map-core@0.2.0...@cgi-eo/map-core@0.3.0) (2018-09-26)


### Features

* add support for feature layers ([626922f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/626922f))





<a name="0.2.0"></a>
# [0.2.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@cgi-eo/map-core@0.1.0...@cgi-eo/map-core@0.2.0) (2018-09-21)


### Features

* **map-core:** add declaration for bbox, mapcoord and size map types ([f16387e](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f16387e))





<a name="0.1.0"></a>
# 0.1.0 (2018-09-20)


### Features

* **map-core:** add map renderer factory ([8784658](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8784658))
* **map-core:** add subscription tracker helper class ([26e1cff](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/26e1cff))
* **map-core:** define basic map interfaces ([5ba7f65](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5ba7f65))
* add support for tile layers ([d53b17d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d53b17d))
