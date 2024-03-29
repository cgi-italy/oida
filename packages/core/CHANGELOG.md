# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.9.0](https://github.com/cgi-italy/oida/compare/@oidajs/core@4.8.0...@oidajs/core@4.9.0) (2023-10-30)

### Bug Fixes

- disable swipe tool for unsupport layer types ([cec6694](https://github.com/cgi-italy/oida/commit/cec6694c3b5b38bebcd6ec4652ceee0b12b1b6b5))

### Features

- add layer swipe interaction and tool ([507ecd8](https://github.com/cgi-italy/oida/commit/507ecd877baf8724346932876fb925d910388af3))

# [4.8.0](https://github.com/cgi-italy/oida/compare/@oidajs/core@4.7.0...@oidajs/core@4.8.0) (2023-08-09)

### Features

- add method for computing the extent of a set of features ([0f73aa4](https://github.com/cgi-italy/oida/commit/0f73aa4eb6dba29553dac7bf3b05814cd6772388))
- add preliminary support for planetary computer datasets ([7a8faf9](https://github.com/cgi-italy/oida/commit/7a8faf93705d98f9d2f4c37e34f778c7327969b4))
- add support for map credits ([6bc14a4](https://github.com/cgi-italy/oida/commit/6bc14a4ad94f86f49bcbce8e3a9915ec7f094ab3))
- add support for vector layer clustering ([f3af823](https://github.com/cgi-italy/oida/commit/f3af8230102604859fd8294b5568408a25e5f828))

# [4.7.0](https://github.com/cgi-italy/oida/compare/@oidajs/core@4.6.0...@oidajs/core@4.7.0) (2023-04-12)

### Features

- improve visualization for vector datasets ([93eb608](https://github.com/cgi-italy/oida/commit/93eb608ed11d3faf09dd85d262cf5e90ff3694b5))

# [4.6.0](https://github.com/cgi-italy/oida/compare/@oidajs/core@4.5.1...@oidajs/core@4.6.0) (2023-04-06)

### Bug Fixes

- bind abortcontroller instance to abort method in axios cancelableRequest ([0997d8f](https://github.com/cgi-italy/oida/commit/0997d8fc1569116cb80a2682e8c5e1e15a2f984b))

### Features

- add type guard for query filter type inference ([6b56475](https://github.com/cgi-italy/oida/commit/6b56475674464ca5d6372ed427428bd2c21ac0e4))

## [4.5.1](https://github.com/cgi-italy/oida/compare/@oidajs/core@4.5.0...@oidajs/core@4.5.1) (2023-01-13)

**Note:** Version bump only for package @oidajs/core

# [4.5.0](https://github.com/cgi-italy/oida/compare/@oidajs/core@4.4.0...@oidajs/core@4.5.0) (2022-12-22)

### Features

- add support for map export as image in map renderer ([fea5e44](https://github.com/cgi-italy/oida/commit/fea5e442db2ac138376d86c8efe818fe48fac6e4))

# [4.4.0](https://github.com/cgi-italy/oida/compare/@oidajs/core@4.3.0...@oidajs/core@4.4.0) (2022-10-05)

### Bug Fixes

- add readonly support in aoi field ([14b0ee6](https://github.com/cgi-italy/oida/commit/14b0ee6b239ac8bb585ecd6c5a1cf1071281118d))
- omit id in aoi field serialization ([5b2e3f4](https://github.com/cgi-italy/oida/commit/5b2e3f48ad2d10c74bf2f4290fce661df3531937))

### Features

- add support for field label with checkbox in antd form renderer ([fcd21c9](https://github.com/cgi-italy/oida/commit/fcd21c953c1f619f39c0d612c8e154de844de5eb))
- add util for date extraction from string (e.g. filename) ([d08b1c2](https://github.com/cgi-italy/oida/commit/d08b1c2342ad0725e1b087e75ed0c0c6fd37aae0))
- add util to transform a geometry into a GeoJSON geometry ([f8fb189](https://github.com/cgi-italy/oida/commit/f8fb189af8954ac8b9521d057e34d57fe4729167))
- add utility for string capitalization ([cba4ebe](https://github.com/cgi-italy/oida/commit/cba4ebe38f65b6bb4f857f5c1dd29b47fa4f6154))

# [4.3.0](https://github.com/cgi-italy/oida/compare/@oidajs/core@4.2.0...@oidajs/core@4.3.0) (2022-07-13)

### Features

- add an utility function to format positions ([c7a8800](https://github.com/cgi-italy/oida/commit/c7a88009126b2f993cddff288e83c149887b4467))
- add more options to centerOnMap operation ([265bede](https://github.com/cgi-italy/oida/commit/265bede4c3146b27a218cd019595380691a663e8))
- add support for embedding a map into an aoi field ([6def987](https://github.com/cgi-italy/oida/commit/6def9877e6071d108883527eb66cde78186b8acb))
- add support for readonly forms and form fields ([8f473ec](https://github.com/cgi-italy/oida/commit/8f473ec9678b0ebae0dc8b45f9dd7d8ce3ac621f))

# [4.2.0](https://github.com/cgi-italy/oida/compare/@oidajs/core@4.1.0...@oidajs/core@4.2.0) (2022-05-16)

### Features

- add duration formatting utils ([ac2b968](https://github.com/cgi-italy/oida/commit/ac2b9682f2a80134163067f9b5b51ff971ff4c9b))
- improve dataset dimensions management ([3f1d0d8](https://github.com/cgi-italy/oida/commit/3f1d0d8c1539166694976ea8ba893d826c8ea652))

# [4.1.0](https://github.com/cgi-italy/oida/compare/@oidajs/core@4.0.1...@oidajs/core@4.1.0) (2022-03-09)

### Bug Fixes

- improve tile grid computation logic ([a1c394b](https://github.com/cgi-italy/oida/commit/a1c394b9d760fcfc83f9a66cb86c3b5efa18fa43))

### Features

- add getMissingIntervals method in TimeIntervalSet ([f8f0660](https://github.com/cgi-italy/oida/commit/f8f0660da30ce9ffb68dc24133dfe388ab5c26db))
- add method to check if an interval is included in TimeIntervalSet ([1c116cd](https://github.com/cgi-italy/oida/commit/1c116cd81cef680a9b24d7f35932daea59d7b3dd))
- add support for minimum resolution constraint in tile grid ([d707caa](https://github.com/cgi-italy/oida/commit/d707caa0a1037457ff95eddf7f8c38fec55150eb))
- add util to check for geometries equality ([908ff8d](https://github.com/cgi-italy/oida/commit/908ff8d7f640be3a23822f1fe45a3c061e765b6a))
- add util to convert a geometry to a wkt string ([35199f9](https://github.com/cgi-italy/oida/commit/35199f94d59348dd5fdd05e5b4b59bd12f357b07))

## [4.0.1](https://github.com/cgi-italy/oida/compare/@oidajs/core@4.0.0...@oidajs/core@4.0.1) (2021-12-21)

**Note:** Version bump only for package @oidajs/core

# 4.0.0 (2021-12-21)

### Bug Fixes

- add missing Color export ([5d7da73](https://github.com/cgi-italy/oida/commit/5d7da7386035f4f50379f2996d1145d5fad40672))
- add missing return statement in fliGeometryCoords function ([7582d93](https://github.com/cgi-italy/oida/commit/7582d932d743699531849486c1522fcd6ae63788))
- add missing TileSource definition ([002bf8f](https://github.com/cgi-italy/oida/commit/002bf8fcec21764c092f0f52a70728357440e541))
- fix area unit labels ([22f5543](https://github.com/cgi-italy/oida/commit/22f5543d72cdbd836f62eea6a98eef889929448a))
- minor fixes and improvements ([bd78b2c](https://github.com/cgi-italy/oida/commit/bd78b2c1b783283753e957d5abcfe722bb2916fd))
- solve issue in cancelable promise implementation ([92413a3](https://github.com/cgi-italy/oida/commit/92413a3fb2ab6ec477d3105792e6a640f6d65477))
- typing issues ([8db52dd](https://github.com/cgi-italy/oida/commit/8db52dd222a065614d81cf9feec976448fe2bebe))

### Build System

- change packages name scope ([a8d721d](https://github.com/cgi-italy/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))

### Code Refactoring

- refactor ui library ([665be09](https://github.com/cgi-italy/oida/commit/665be09f9c21304be371273ff55b51e1ea481fa3))
- reimplement cancelable promises ([f2d7249](https://github.com/cgi-italy/oida/commit/f2d72494849661151744fe843123b196ff002ff7))
- rename and restructure some packages ([9cbba7d](https://github.com/cgi-italy/oida/commit/9cbba7d3276b3156510c15aca77d79263ae7393b))

### Features

- accept string as formatNumber input value ([ed8a18a](https://github.com/cgi-italy/oida/commit/ed8a18a0a8f68e77bda65e6a3ca835b740a5480f))
- add additional actions to aoi field ([6b7de40](https://github.com/cgi-italy/oida/commit/6b7de40e47d5844a114a9d0f3adfac4d1e33387c))
- add additional enum field renderer using dropdown ([52489b2](https://github.com/cgi-italy/oida/commit/52489b239ebc7dad786855d6f53c6ceb38861462))
- add aoi field factory ([6bf45be](https://github.com/cgi-italy/oida/commit/6bf45beedd40001d930c69090b8b2ed18aec0d00))
- add color utils in core ([0219ce7](https://github.com/cgi-italy/oida/commit/0219ce75aefe67ff1b534eba192bc821da7321da))
- add common number formatting utility ([afda2ab](https://github.com/cgi-italy/oida/commit/afda2ab139d1855704662375fe26013b5f52e2d5))
- add date form field ([e946019](https://github.com/cgi-italy/oida/commit/e946019e77239cfd3862e55b3d2f64a2649161c0))
- add description in form field definition ([dc5ff4b](https://github.com/cgi-italy/oida/commit/dc5ff4bfebb71e6ae406076819643223ab452973))
- add feature hover/select map interactions ([d8d26a9](https://github.com/cgi-italy/oida/commit/d8d26a921db4b37cb74e5c57363162b7f11f23a5))
- add filter type in data filtering state ([2819562](https://github.com/cgi-italy/oida/commit/2819562cdedb9ba1ebdd1c36b790878e41deff0c))
- add geo-image layer ([33c0d4d](https://github.com/cgi-italy/oida/commit/33c0d4dfd72c27c26a4e02a061c74c4a40c58bf8))
- add getGeometryCenter util ([54e8ec7](https://github.com/cgi-italy/oida/commit/54e8ec7d5d9aa4ce7a2b1ddc6e183561665f79a8))
- add getTextColorForBackground util ([8c70311](https://github.com/cgi-italy/oida/commit/8c70311681e3fc847fb835cf5241dbb52fe0e565))
- add getViewportExtent and fitExtent methods to map renderer ([5819ff5](https://github.com/cgi-italy/oida/commit/5819ff5dd7f13461c374b378ff0ae0126b93e705))
- add initial support for image layers ([6aab5fd](https://github.com/cgi-italy/oida/commit/6aab5fd56c3709bb21b95fd5d71227fc7e1b8d71))
- add initial support for map feature draw ([90307a6](https://github.com/cgi-italy/oida/commit/90307a68b6a07f5e9f0ecc1c2c6d7f4d77080e6f))
- add last click tracking in mouse coord interaction ([674aae6](https://github.com/cgi-italy/oida/commit/674aae6cce3a842e7b7e6272212fe1addd0b778e))
- add map and layers renderer implementation in volatile state ([4335eff](https://github.com/cgi-italy/oida/commit/4335effa0bf02e4b8e33d5591e8015cd846166c0))
- add map aoi field component ([aacdecf](https://github.com/cgi-italy/oida/commit/aacdecff3248b8e1e513dafe77bab2decda35f08))
- add min/max zoom support in tile layer ([159df4f](https://github.com/cgi-italy/oida/commit/159df4f729d81c3326a2b5e30c92e233701eddfc))
- add new types and mixins ([3990d8f](https://github.com/cgi-italy/oida/commit/3990d8f681c38eafc33f5af60ad7816f7d2cf597))
- add promise wrapper helper function ([17f5bdb](https://github.com/cgi-italy/oida/commit/17f5bdb146a6545769235ed6becb1f5b3706a305))
- add some basic url utilities ([bb0a839](https://github.com/cgi-italy/oida/commit/bb0a839c33d24d2f081b0d2d0cf22bb546447417))
- add some basic xml parsing utils ([fd67ad6](https://github.com/cgi-italy/oida/commit/fd67ad6bcbe008f1a67a9d6f2425691883c214e0))
- add support for async data in enum field ([70c8d54](https://github.com/cgi-italy/oida/commit/70c8d5448387e3fb2ea6cf5f6d4d0299554e4a48))
- add support for force refreshing a tile source ([8730093](https://github.com/cgi-italy/oida/commit/87300931e5896b42108508ecefbd0f09292ba8c1))
- add support for layer extent ([7e62e06](https://github.com/cgi-italy/oida/commit/7e62e065e28573e11968ad848b20b922d40c3ab1))
- add support for limiting date/time selection in date picker ([d95a006](https://github.com/cgi-italy/oida/commit/d95a006fc52ad598bbbc12efa36de57d2c56a69f))
- add support for line and draw constraints in aoi field ([45b6527](https://github.com/cgi-italy/oida/commit/45b6527e3ae17e0958828f50da32228acd27846b))
- add support for map layer zIndex ([b6ec75b](https://github.com/cgi-italy/oida/commit/b6ec75b3d4a3b53f5f59c34ce2c2156852265fbd))
- add support for rendering props update ([42a9703](https://github.com/cgi-italy/oida/commit/42a97032ac9a5ba3071809a217e64d4c6e847d2a))
- add support for volume layers ([97be351](https://github.com/cgi-italy/oida/commit/97be351670c9d5fe38ab9a707d04722f5c874790))
- add utility class to retrieve srs defs from spatialreference.org ([573f267](https://github.com/cgi-italy/oida/commit/573f267f5e44e37949aefaf9b8f230d7ea010f7a))
- add utility to check extent validity ([a0afa8b](https://github.com/cgi-italy/oida/commit/a0afa8be43b54c8f85b0fa4f682ee7d1df4189f8))
- add vertical profile layer ([5cea9c9](https://github.com/cgi-italy/oida/commit/5cea9c99a25412ee795fc869398f670ea43d8320))
- add vertical profile layer selection ([1a1da62](https://github.com/cgi-italy/oida/commit/1a1da62589d3ac33267ce5a26dab571f71c47f55))
- allow disabling picking for a geometry from its style ([4eae42d](https://github.com/cgi-italy/oida/commit/4eae42d24a23e9149ac579bc5a9bfd5a1cd09277))
- enable slice loading function in volumesource ([c8403f7](https://github.com/cgi-italy/oida/commit/c8403f79ef4a9a99b18e27fd0d815ce11b50ae96))
- extend axios instance with cancelable request ([b4c520b](https://github.com/cgi-italy/oida/commit/b4c520b9c37e54683c616323238c8515cfdeb0ed))
- extend geometry with bbox and circle types ([0612690](https://github.com/cgi-italy/oida/commit/0612690fdf26a53fd236d2de3d36a04953503043))
- improve dataset analysis support ([53320bb](https://github.com/cgi-italy/oida/commit/53320bbea16c52f8e9cb19235c601fa8f2ceabef))
- improve dataset time navigation ([0b055d2](https://github.com/cgi-italy/oida/commit/0b055d2fa5f232766c7408394df04e2bf6b67f85))
- improve support for layer feature hovering and selecting ([d794e65](https://github.com/cgi-italy/oida/commit/d794e65b8eb6adea2b5badbb5400cc62882f4b27))
- listen for resize events in map component ([42fe879](https://github.com/cgi-italy/oida/commit/42fe8791e757b4d0d82ef2fc55abdd916a2341b6))
- move form field definition in core ([0509f7c](https://github.com/cgi-italy/oida/commit/0509f7c0a191d6220d1cbfa04ac13a3504402a79))
- **core:** add file size formatter ([1ebdffe](https://github.com/cgi-italy/oida/commit/1ebdffe9faf2baf6467d4c59d76994795bf9c036))
- **state-mst:** add MaybeType ([e8a0518](https://github.com/cgi-italy/oida/commit/e8a051824ad0392885b6cf4d5cf62da477d41172))
- minor types updates ([7d194c1](https://github.com/cgi-italy/oida/commit/7d194c1d0e8d36852f4db049d1f535f917ef52aa))
- **ui-react-mst:** add formatters module ([0ad31f7](https://github.com/cgi-italy/oida/commit/0ad31f767cc431b927235cfb8eaf25cc832a92c7))

### Reverts

- revert commit of WIP feature ([459d907](https://github.com/cgi-italy/oida/commit/459d907bad39df1d5f9e006e40d50e06ae75c401))

### BREAKING CHANGES

- all import to @oida/\* packages shall be updated with @oidajs/\*
- CancelablePromise type is not defined anymore. New methods merged on Promise
  interface
  Cancelation doesn't throw anymore. Use finally for cleanup operations
- removed legacy ui library
- Changed npm package namespace from @cgi-eo to @oida. Renamed map-core to core and
  map-mobx to state-mst. Changed packages internal directory structure

# [3.0.0](https://github.com/cgi-italy/oida/compare/@oida/core@2.2.0...@oidajs/core@3.0.0) (2021-12-15)

### Build System

- change packages name scope ([a8d721d](https://github.com/cgi-italy/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))

### Features

- accept string as formatNumber input value ([ed8a18a](https://github.com/cgi-italy/oida/commit/ed8a18a0a8f68e77bda65e6a3ca835b740a5480f))
- add additional enum field renderer using dropdown ([52489b2](https://github.com/cgi-italy/oida/commit/52489b239ebc7dad786855d6f53c6ceb38861462))

### BREAKING CHANGES

- all import to @oida/\* packages shall be updated with @oidajs/\*

# [2.2.0](https://github.com/cgi-italy/oida/compare/@oida/core@2.1.0...@oida/core@2.2.0) (2021-09-28)

### Features

- add description in form field definition ([dc5ff4b](https://github.com/cgi-italy/oida/commit/dc5ff4bfebb71e6ae406076819643223ab452973))
- add getTextColorForBackground util ([8c70311](https://github.com/cgi-italy/oida/commit/8c70311681e3fc847fb835cf5241dbb52fe0e565))

# [2.1.0](https://github.com/cgi-italy/oida/compare/@oida/core@2.0.0...@oida/core@2.1.0) (2021-06-18)

### Bug Fixes

- add missing return statement in fliGeometryCoords function ([7582d93](https://github.com/cgi-italy/oida/commit/7582d932d743699531849486c1522fcd6ae63788))
- add missing TileSource definition ([002bf8f](https://github.com/cgi-italy/oida/commit/002bf8fcec21764c092f0f52a70728357440e541))
- minor fixes and improvements ([bd78b2c](https://github.com/cgi-italy/oida/commit/bd78b2c1b783283753e957d5abcfe722bb2916fd))
- typing issues ([8db52dd](https://github.com/cgi-italy/oida/commit/8db52dd222a065614d81cf9feec976448fe2bebe))

### Features

- add aoi field factory ([6bf45be](https://github.com/cgi-italy/oida/commit/6bf45beedd40001d930c69090b8b2ed18aec0d00))
- add color utils in core ([0219ce7](https://github.com/cgi-italy/oida/commit/0219ce75aefe67ff1b534eba192bc821da7321da))
- add common number formatting utility ([afda2ab](https://github.com/cgi-italy/oida/commit/afda2ab139d1855704662375fe26013b5f52e2d5))
- add geo-image layer ([33c0d4d](https://github.com/cgi-italy/oida/commit/33c0d4dfd72c27c26a4e02a061c74c4a40c58bf8))
- add getGeometryCenter util ([54e8ec7](https://github.com/cgi-italy/oida/commit/54e8ec7d5d9aa4ce7a2b1ddc6e183561665f79a8))
- add last click tracking in mouse coord interaction ([674aae6](https://github.com/cgi-italy/oida/commit/674aae6cce3a842e7b7e6272212fe1addd0b778e))
- add map aoi field component ([aacdecf](https://github.com/cgi-italy/oida/commit/aacdecff3248b8e1e513dafe77bab2decda35f08))
- add min/max zoom support in tile layer ([159df4f](https://github.com/cgi-italy/oida/commit/159df4f729d81c3326a2b5e30c92e233701eddfc))
- add some basic url utilities ([bb0a839](https://github.com/cgi-italy/oida/commit/bb0a839c33d24d2f081b0d2d0cf22bb546447417))
- add some basic xml parsing utils ([fd67ad6](https://github.com/cgi-italy/oida/commit/fd67ad6bcbe008f1a67a9d6f2425691883c214e0))
- add support for async data in enum field ([70c8d54](https://github.com/cgi-italy/oida/commit/70c8d5448387e3fb2ea6cf5f6d4d0299554e4a48))
- add support for limiting date/time selection in date picker ([d95a006](https://github.com/cgi-italy/oida/commit/d95a006fc52ad598bbbc12efa36de57d2c56a69f))
- add utility class to retrieve srs defs from spatialreference.org ([573f267](https://github.com/cgi-italy/oida/commit/573f267f5e44e37949aefaf9b8f230d7ea010f7a))
- add utility to check extent validity ([a0afa8b](https://github.com/cgi-italy/oida/commit/a0afa8be43b54c8f85b0fa4f682ee7d1df4189f8))
- improve support for layer feature hovering and selecting ([d794e65](https://github.com/cgi-italy/oida/commit/d794e65b8eb6adea2b5badbb5400cc62882f4b27))

# [2.0.0](https://github.com/cgi-italy/oida/compare/@oida/core@1.2.0...@oida/core@2.0.0) (2020-09-11)

### Bug Fixes

- solve issue in cancelable promise implementation ([92413a3](https://github.com/cgi-italy/oida/commit/92413a3fb2ab6ec477d3105792e6a640f6d65477))

### Code Refactoring

- reimplement cancelable promises ([f2d7249](https://github.com/cgi-italy/oida/commit/f2d72494849661151744fe843123b196ff002ff7))

### Features

- add date form field ([e946019](https://github.com/cgi-italy/oida/commit/e946019e77239cfd3862e55b3d2f64a2649161c0))
- allow disabling picking for a geometry from its style ([4eae42d](https://github.com/cgi-italy/oida/commit/4eae42d24a23e9149ac579bc5a9bfd5a1cd09277))
- improve dataset analysis support ([53320bb](https://github.com/cgi-italy/oida/commit/53320bbea16c52f8e9cb19235c601fa8f2ceabef))
- improve dataset time navigation ([0b055d2](https://github.com/cgi-italy/oida/commit/0b055d2fa5f232766c7408394df04e2bf6b67f85))

### BREAKING CHANGES

- CancelablePromise type is not defined anymore. New methods merged on Promise
  interface
  Cancelation doesn't throw anymore. Use finally for cleanup operations

# [1.2.0](https://github.com/cgi-italy/oida/compare/@oida/core@1.1.0...@oida/core@1.2.0) (2020-05-22)

### Features

- add support for force refreshing a tile source ([8730093](https://github.com/cgi-italy/oida/commit/87300931e5896b42108508ecefbd0f09292ba8c1))
- add support for line and draw constraints in aoi field ([45b6527](https://github.com/cgi-italy/oida/commit/45b6527e3ae17e0958828f50da32228acd27846b))
- add support for rendering props update ([42a9703](https://github.com/cgi-italy/oida/commit/42a97032ac9a5ba3071809a217e64d4c6e847d2a))
- add support for volume layers ([97be351](https://github.com/cgi-italy/oida/commit/97be351670c9d5fe38ab9a707d04722f5c874790))
- add vertical profile layer ([5cea9c9](https://github.com/cgi-italy/oida/commit/5cea9c99a25412ee795fc869398f670ea43d8320))
- add vertical profile layer selection ([1a1da62](https://github.com/cgi-italy/oida/commit/1a1da62589d3ac33267ce5a26dab571f71c47f55))
- enable slice loading function in volumesource ([c8403f7](https://github.com/cgi-italy/oida/commit/c8403f79ef4a9a99b18e27fd0d815ce11b50ae96))
- listen for resize events in map component ([42fe879](https://github.com/cgi-italy/oida/commit/42fe8791e757b4d0d82ef2fc55abdd916a2341b6))
- move form field definition in core ([0509f7c](https://github.com/cgi-italy/oida/commit/0509f7c0a191d6220d1cbfa04ac13a3504402a79))

# [1.1.0](https://github.com/cgi-italy/oida/compare/@oida/core@1.0.0...@oida/core@1.1.0) (2020-02-12)

### Bug Fixes

- fix area unit labels ([22f5543](https://github.com/cgi-italy/oida/commit/22f5543d72cdbd836f62eea6a98eef889929448a))

### Features

- **core:** add file size formatter ([1ebdffe](https://github.com/cgi-italy/oida/commit/1ebdffe9faf2baf6467d4c59d76994795bf9c036))
- **state-mst:** add MaybeType ([e8a0518](https://github.com/cgi-italy/oida/commit/e8a051824ad0392885b6cf4d5cf62da477d41172))
- add filter type in data filtering state ([2819562](https://github.com/cgi-italy/oida/commit/2819562cdedb9ba1ebdd1c36b790878e41deff0c))
- add initial support for image layers ([6aab5fd](https://github.com/cgi-italy/oida/commit/6aab5fd56c3709bb21b95fd5d71227fc7e1b8d71))
- add promise wrapper helper function ([17f5bdb](https://github.com/cgi-italy/oida/commit/17f5bdb146a6545769235ed6becb1f5b3706a305))
- add support for layer extent ([7e62e06](https://github.com/cgi-italy/oida/commit/7e62e065e28573e11968ad848b20b922d40c3ab1))
- add support for map layer zIndex ([b6ec75b](https://github.com/cgi-italy/oida/commit/b6ec75b3d4a3b53f5f59c34ce2c2156852265fbd))
- extend axios instance with cancelable request ([b4c520b](https://github.com/cgi-italy/oida/commit/b4c520b9c37e54683c616323238c8515cfdeb0ed))
- extend geometry with bbox and circle types ([0612690](https://github.com/cgi-italy/oida/commit/0612690fdf26a53fd236d2de3d36a04953503043))

# 1.0.0 (2019-04-09)

### Bug Fixes

- add missing Color export ([5d7da73](https://github.com/cgi-italy/oida/commit/5d7da73))

### Code Refactoring

- refactor ui library ([665be09](https://github.com/cgi-italy/oida/commit/665be09))
- rename and restructure some packages ([9cbba7d](https://github.com/cgi-italy/oida/commit/9cbba7d))

### Features

- add feature hover/select map interactions ([d8d26a9](https://github.com/cgi-italy/oida/commit/d8d26a9))
- add getViewportExtent and fitExtent methods to map renderer ([5819ff5](https://github.com/cgi-italy/oida/commit/5819ff5))
- add initial support for map feature draw ([90307a6](https://github.com/cgi-italy/oida/commit/90307a6))
- add map and layers renderer implementation in volatile state ([4335eff](https://github.com/cgi-italy/oida/commit/4335eff))
- add new types and mixins ([3990d8f](https://github.com/cgi-italy/oida/commit/3990d8f))
- **ui-react-mst:** add formatters module ([0ad31f7](https://github.com/cgi-italy/oida/commit/0ad31f7))
- minor types updates ([7d194c1](https://github.com/cgi-italy/oida/commit/7d194c1))

### Reverts

- revert commit of WIP feature ([459d907](https://github.com/cgi-italy/oida/commit/459d907))

### BREAKING CHANGES

- removed legacy ui library
- Changed npm package namespace from @cgi-eo to @oida. Renamed map-core to core and
  map-mobx to state-mst. Changed packages internal directory structure

<a name="0.3.0"></a>

# [0.3.0](https://github.com/cgi-italy/oida/compare/@cgi-eo/map-core@0.2.0...@cgi-eo/map-core@0.3.0) (2018-09-26)

### Features

- add support for feature layers ([626922f](https://github.com/cgi-italy/oida/commit/626922f))

<a name="0.2.0"></a>

# [0.2.0](https://github.com/cgi-italy/oida/compare/@cgi-eo/map-core@0.1.0...@cgi-eo/map-core@0.2.0) (2018-09-21)

### Features

- **map-core:** add declaration for bbox, mapcoord and size map types ([f16387e](https://github.com/cgi-italy/oida/commit/f16387e))

<a name="0.1.0"></a>

# 0.1.0 (2018-09-20)

### Features

- **map-core:** add map renderer factory ([8784658](https://github.com/cgi-italy/oida/commit/8784658))
- **map-core:** add subscription tracker helper class ([26e1cff](https://github.com/cgi-italy/oida/commit/26e1cff))
- **map-core:** define basic map interfaces ([5ba7f65](https://github.com/cgi-italy/oida/commit/5ba7f65))
- add support for tile layers ([d53b17d](https://github.com/cgi-italy/oida/commit/d53b17d))
