# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 1.0.0 (2019-04-09)


### Bug Fixes

* fix bug in tilesource update ([95f5879](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/95f5879))
* minor fixes ([f1c2209](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f1c2209))
* minor typings fixes ([e1810c2](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e1810c2))
* **state-mst:** catch invalid reference in FeatureLayerController source ([3fa8e49](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3fa8e49))
* **state-mst:** fix entity reference resolution from collection ([a014161](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a014161))


### Code Refactoring

* refactor ui library ([665be09](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/665be09))
* rename and restructure some packages ([9cbba7d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9cbba7d))
* **state-mst:** refactor DynamicUnion into TaggedUnion type ([d018219](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d018219))


### Features

* add feature hover/select map interactions ([d8d26a9](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d8d26a9))
* add getViewportExtent and fitExtent methods to map renderer ([5819ff5](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5819ff5))
* add initial data filtering support ([b7e564f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b7e564f))
* add initial support for map feature draw ([90307a6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/90307a6))
* add map and layers renderer implementation in volatile state ([4335eff](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4335eff))
* **state-mst:** add custom IsoDate type ([ecac034](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/ecac034))
* **state-mst:** add selection support ([4177af6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4177af6))
* add new tilesources ([dae91c9](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/dae91c9))
* add new types and mixins ([3990d8f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3990d8f))
* add support for geometrycollection in FeatureLayerController ([a5efc41](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a5efc41))
* allow partial map viewport update ([509819a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/509819a))
* implement custom map entity reference ([5e5d9f6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5e5d9f6))
* minor types updates ([7d194c1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7d194c1))


### BREAKING CHANGES

* **state-mst:** Removed DynamicUnion. Use TaggedUnion instead. MapEntity, MapEntityCollection moved
into Entity and EntityCollection
* Use new MapEntityReference for referencing map entities in the state tree.
Refactored MapEntityCollectionTracker into the more generic ArrayTracker
* removed legacy ui library
* Changed npm package namespace from @cgi-eo to @oida. Renamed map-core to core and
map-mobx to state-mst. Changed packages internal directory structure





<a name="0.2.0"></a>
# [0.2.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@cgi-eo/map-mobx@0.1.1...@cgi-eo/map-mobx@0.2.0) (2018-09-26)


### Features

* **map-mobx:** add mst function type ([fbd5cff](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/fbd5cff))
* **map-mobx:** add ReferenceOrType and MapEntityCollection types ([723ff1f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/723ff1f))
* **map-mobx:** improve mst types naming ([d8738b0](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d8738b0))
* add support for feature layers ([626922f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/626922f))





<a name="0.1.1"></a>
## [0.1.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@cgi-eo/map-mobx@0.1.0...@cgi-eo/map-mobx@0.1.1) (2018-09-21)


### Bug Fixes

* **map-mobx:** null check in map renderer init ([5deed1e](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5deed1e))





<a name="0.1.0"></a>
# 0.1.0 (2018-09-20)


### Features

* **map-mobx:** add basic map mobx controllers ([d812574](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d812574))
* **map-mobx:** add basic mobx map types ([c9aa44b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c9aa44b))
* add support for tile layers ([d53b17d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d53b17d))
