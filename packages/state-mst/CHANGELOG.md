# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/state-mst@1.0.0...@oida/state-mst@2.0.0) (2020-02-12)


### Bug Fixes

* fix samples and feature-layer-controller typing error ([441f677](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/441f677df296dba458e536702dcde3e16966ecbb))
* fix some feature layer error conditions ([d38162b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d38162bb983c377b5dbcb324b55f086210da8012))
* fix TaggedUnion getSpecificType with search for child Unions ([7ed3514](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7ed3514f90ddcffa932170d0cb4a8a316e43548a))
* minor fixes ([c681a1a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c681a1a619fd626c44d766f07bfa61343d8e5e63))
* use reference snapshot as key for reference types in ArrayTracker ([5a72dc5](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5a72dc5b115098593965f595bc6e52ca61db333e))


### Code Refactoring

* improve EntityReference type ([37cfb2b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/37cfb2bddbcf7196270b12ef7d055f8c761131a5))


### Features

* accept existing tree node instances as input for ReferenceOrType ([ea811ec](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/ea811ec6fb3f54e865927656b25729f7f382fb65))
* **state-mst:** add MaybeType ([e8a0518](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e8a051824ad0392885b6cf4d5cf62da477d41172))
* add filter type in data filtering state ([2819562](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/2819562cdedb9ba1ebdd1c36b790878e41deff0c))
* add generic MST non serializable object type ([688c723](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/688c7233757597e3d501d6521f8952b59cb44001))
* add hasConfig and isDataProvider mixin types ([6f1ac27](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6f1ac277c6ca9f822dec658b443bc7583c1cb84e))
* add initial support for image layers ([6aab5fd](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6aab5fd56c3709bb21b95fd5d71227fc7e1b8d71))
* add maplayer loading state ([5f01f84](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5f01f84c82d63dc55c6d13826988546c35e06335))
* add needsConfig mixin ([5c4e1f7](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5c4e1f71c5bfb97541300048be8de66a2970e6da))
* add percentage to loadingState mixin ([3c320ec](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3c320ecce8da8e776e1058a07d06c61b61400323))
* add support for layer extent ([7e62e06](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7e62e065e28573e11968ad848b20b922d40c3ab1))
* add support for map layer zIndex ([b6ec75b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b6ec75b3d4a3b53f5f59c34ce2c2156852265fbd))
* allow to set a custom name for collection type ([91be618](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/91be61836545ca9380e84f0d97c8d068c870f4d3))
* allow usage of layer references as GroupLayer children ([4ca7929](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4ca7929b560af7a6f496485f26466ca65447053e))


### BREAKING CHANGES

* EntityReference now is a function that takes the entity type as input





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
