# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.0.0](https://github.com/cgi-italy/oida/compare/@oida/ui-react-antd@4.0.0...@oidajs/ui-react-antd@5.0.0) (2021-12-15)


### Bug Fixes

* minor layout updates ([b33062c](https://github.com/cgi-italy/oida/commit/b33062c6a6ea207cdcdde39b4f805beb04aa0429))
* minor ui improvements ([a2fbb7f](https://github.com/cgi-italy/oida/commit/a2fbb7f42ca7fa6600003864c5bd31ffc46fcb8f))
* replace all setImmediate (non standard) calls with setTimeout ([e991548](https://github.com/cgi-italy/oida/commit/e9915486859236b2bfa37760ef4508d0f467dc77))
* solve custom search icon layout issue on AdvancedSearchFilterer ([fd1bc77](https://github.com/cgi-italy/oida/commit/fd1bc777119f4860b01c027d338a946602770d96))
* trigger onChange on input blur ([e9152cf](https://github.com/cgi-italy/oida/commit/e9152cf696f5047459b12de287c04be86cd69214))


### Build System

* change packages name scope ([a8d721d](https://github.com/cgi-italy/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))


### Features

* add a generic AsyncButton component ([44878c3](https://github.com/cgi-italy/oida/commit/44878c38201f2dbd909f67fba86fbfbc947c40ae))
* add additional enum field renderer using dropdown ([52489b2](https://github.com/cgi-italy/oida/commit/52489b239ebc7dad786855d6f53c6ceb38861462))
* add control to perform auto histogram stretch in raster viz ([a441f8f](https://github.com/cgi-italy/oida/commit/a441f8f1471c4876417862d9e6b784d79487135c))
* allow search icon customization in AdvancedSearchFilterer ([b125b4a](https://github.com/cgi-italy/oida/commit/b125b4af35387a50d23025d806ae40c77efc3854))
* make item action content optional ([8d94652](https://github.com/cgi-italy/oida/commit/8d94652544ce858c5fffff3078f5823c27e8c7d2))


### BREAKING CHANGES

* all import to @oida/\* packages shall be updated with @oidajs/\*





# [4.0.0](https://github.com/cgi-italy/oida/compare/@oida/ui-react-antd@3.0.0...@oida/ui-react-antd@4.0.0) (2021-09-28)


### Bug Fixes

* ignore time in date range field min/max limits enforcement ([d9ccf2a](https://github.com/cgi-italy/oida/commit/d9ccf2a948e9f26464ee835a70e865709290a15f))


### Features

* add description in form field definition ([dc5ff4b](https://github.com/cgi-italy/oida/commit/dc5ff4bfebb71e6ae406076819643223ab452973))
* add goToHome action in map nav controls ([a541a3f](https://github.com/cgi-italy/oida/commit/a541a3f33900843e999d325e7358e7349f06ebdc))
* add layer group icon ([e6117e8](https://github.com/cgi-italy/oida/commit/e6117e8f060e0d9b79e454171f5ee6e6de4a533f))
* add support for primary actions in data collection ([fd50491](https://github.com/cgi-italy/oida/commit/fd50491e6c51da3b36c9f87054f692132b959145))


### BREAKING CHANGES

* MapNavControls component renamed to MapNavTools





# [3.0.0](https://github.com/cgi-italy/oida/compare/@oida/ui-react-antd@2.2.0...@oida/ui-react-antd@3.0.0) (2021-06-18)


### Bug Fixes

* allow css coloring of draw-line icon ([2bbd138](https://github.com/cgi-italy/oida/commit/2bbd13866c930a63263edddda15484c72de0e4a4))
* minor adjustments ([beac7f5](https://github.com/cgi-italy/oida/commit/beac7f5995ca070536cdadf83fbfd6ce829fc64a))
* minor data collection components improvements ([dbad63c](https://github.com/cgi-italy/oida/commit/dbad63c06d76b98a17f3f3b8e29768d231c8520f))
* minor fixes and improvements ([bd78b2c](https://github.com/cgi-italy/oida/commit/bd78b2c1b783283753e957d5abcfe722bb2916fd))
* minor layout updates ([adb97cd](https://github.com/cgi-italy/oida/commit/adb97cdf2d89bd426ea83544253b146fa37719b8))
* minor ui fixes and improvements ([99c5a0f](https://github.com/cgi-italy/oida/commit/99c5a0ff6e5e54da182429198501f94c663965ba))
* use multiline break on filter input overflow ([aae71e3](https://github.com/cgi-italy/oida/commit/aae71e3d28357e2c9f54ff69ba3a9c0e37c795a8))


### Code Refactoring

* improve data collection components ([6b54259](https://github.com/cgi-italy/oida/commit/6b542593300a06cc6fff16a0c0100a99ab786b31))


### Features

* add empty message to data collection list ([9c104c5](https://github.com/cgi-italy/oida/commit/9c104c5b371123fd084954e7af37cffa2be606ee))
* add generic list item component ([342636c](https://github.com/cgi-italy/oida/commit/342636cab8b555e17a652ad5819c25836da10b84))
* add map aoi field component ([aacdecf](https://github.com/cgi-italy/oida/commit/aacdecff3248b8e1e513dafe77bab2decda35f08))
* add new data filtering widget ([52bc638](https://github.com/cgi-italy/oida/commit/52bc638c2ed7129624be61c5cfab91f316aab4df))
* add support for async data in enum field ([70c8d54](https://github.com/cgi-italy/oida/commit/70c8d5448387e3fb2ea6cf5f6d4d0299554e4a48))
* add support for custom breadcrumb item render content ([f938507](https://github.com/cgi-italy/oida/commit/f9385079309786a577249eaf4bfcc95d19440602))
* add support for limiting date/time selection in date picker ([d95a006](https://github.com/cgi-italy/oida/commit/d95a006fc52ad598bbbc12efa36de57d2c56a69f))
* add support for list item description ([d7d9938](https://github.com/cgi-italy/oida/commit/d7d993865bb1037eb4a0fafe2eecc0cd3abe3825))
* breadcrumb improvements ([e697429](https://github.com/cgi-italy/oida/commit/e697429c074d0df585a3178b5061e4d39d4f20ff))
* collection list improvements ([21ac452](https://github.com/cgi-italy/oida/commit/21ac452483fd8318c9a2bc86a7acfc574e8862df))
* improve analysis ux ([8c2f075](https://github.com/cgi-italy/oida/commit/8c2f075570f1e7c0f04c849ec3daf32d6fc35fbe))
* improve aoi import management ([907c9df](https://github.com/cgi-italy/oida/commit/907c9df0c119821803d74b225a19909d1f605ad1))
* minor component updates ([4b5b23c](https://github.com/cgi-italy/oida/commit/4b5b23cc05173f59b46f5d456868ecca56aec28d))
* minor improvements to search filter control ([ee9fdd4](https://github.com/cgi-italy/oida/commit/ee9fdd4f8b1a08dc2ec07702d838ccce38ae4bd0))
* use search filterer as default list filter renderer ([9b27b67](https://github.com/cgi-italy/oida/commit/9b27b67295e77bcbbacd3ab8654af08b50c56799))


### BREAKING CHANGES

* Removed icon from collection item props: icons should be added in table column or
list item content





# [2.2.0](https://github.com/cgi-italy/oida/compare/@oida/ui-react-antd@2.1.0...@oida/ui-react-antd@2.2.0) (2020-09-11)


### Features

* add date form field ([e946019](https://github.com/cgi-italy/oida/commit/e946019e77239cfd3862e55b3d2f64a2649161c0))
* improve dataset time navigation ([0b055d2](https://github.com/cgi-italy/oida/commit/0b055d2fa5f232766c7408394df04e2bf6b67f85))





# [2.1.0](https://github.com/cgi-italy/oida/compare/@oida/ui-react-antd@2.0.0...@oida/ui-react-antd@2.1.0) (2020-05-22)


### Features

* add boolean form field ([1b7adea](https://github.com/cgi-italy/oida/commit/1b7adea115d290ec2474a2e6f89b8675ac821c6d))
* add extension filter on aoi import ([b21adb8](https://github.com/cgi-italy/oida/commit/b21adb813b777f15f6832688a1cb14ed323cd723))
* add generic form renderer ([4e29978](https://github.com/cgi-italy/oida/commit/4e29978f774a0ae8fc2bf99fcb4cf44d63fa64c2))
* add support for line and draw constraints in aoi field ([45b6527](https://github.com/cgi-italy/oida/commit/45b6527e3ae17e0958828f50da32228acd27846b))
* move form field definition in core ([0509f7c](https://github.com/cgi-italy/oida/commit/0509f7c0a191d6220d1cbfa04ac13a3504402a79))





# [2.0.0](https://github.com/cgi-italy/oida/compare/@oida/ui-react-antd@1.0.0...@oida/ui-react-antd@2.0.0) (2020-02-12)


### Bug Fixes

* **ui-react-antd:** missing icons in npm package ([01cda65](https://github.com/cgi-italy/oida/commit/01cda651a20c55e534b4947642ff9fca7f26ad5b))
* fix samples and feature-layer-controller typing error ([441f677](https://github.com/cgi-italy/oida/commit/441f677df296dba458e536702dcde3e16966ecbb))
* fix scss import ([f77e5a8](https://github.com/cgi-italy/oida/commit/f77e5a8c16dae0f2e700858e7307d7893e9f01dc))
* minor fixes ([470fa4a](https://github.com/cgi-italy/oida/commit/470fa4aa19578e6a2bcb77fe12c8cd1e560bf688))


### Code Refactoring

* dynamiclayout module renamings ([0f79a43](https://github.com/cgi-italy/oida/commit/0f79a4344fea852ce0cb27f3bb6e6e91a2e958e2))
* use react hooks in data collection state management ([626e14d](https://github.com/cgi-italy/oida/commit/626e14d20d4460b327b1f502e39ae8a7ca7b925f))


### Features

* add initial dataset tools support ([8d0cb1f](https://github.com/cgi-italy/oida/commit/8d0cb1fba2a47c211fe56b61baaf2501b547de9e))
* add linkToViewport action on AoiField ([153033c](https://github.com/cgi-italy/oida/commit/153033cba2b60725a578f9c3bdd0e1e8e0e9b5b6))
* add numeric range field ([e005475](https://github.com/cgi-italy/oida/commit/e005475744a4cee15fc665dc2ffc906c6e1919b3))
* add point support to aoi drawer ([e569b25](https://github.com/cgi-italy/oida/commit/e569b253e195eca08a9ae608355d9de28aed0dca))
* add preliminary aoi import support ([1e11eb3](https://github.com/cgi-italy/oida/commit/1e11eb3fd026c134fbd62ddc39463557edd8c2f5))
* minor ui improvements ([c5280d3](https://github.com/cgi-italy/oida/commit/c5280d348cf2c43296a5615c884527aeab4f1e59))


### BREAKING CHANGES

* use DynamicSections new namings in place of old DynamicLayout ones
* data collection related components are now based on hooks. Old renderProps based
components were removed





# 1.0.0 (2019-04-09)


### Bug Fixes

* add missing sass utils in ui-react-core ([d28eced](https://github.com/cgi-italy/oida/commit/d28eced))


### Code Refactoring

* refactor ui library ([665be09](https://github.com/cgi-italy/oida/commit/665be09))


### Features

* add initial data filtering support ([b7e564f](https://github.com/cgi-italy/oida/commit/b7e564f))
* add map nav controls ([d37d477](https://github.com/cgi-italy/oida/commit/d37d477))
* add optional icon and actions to datacollectionitems ([68b5da1](https://github.com/cgi-italy/oida/commit/68b5da1))
* **ui-react-antd:** add support for custom svg icons ([5337a3a](https://github.com/cgi-italy/oida/commit/5337a3a))
* add support for dynamic sections ([95ea58d](https://github.com/cgi-italy/oida/commit/95ea58d))
* minor types updates ([7d194c1](https://github.com/cgi-italy/oida/commit/7d194c1))
* track active action in AOI field ([b6ea172](https://github.com/cgi-italy/oida/commit/b6ea172))


### BREAKING CHANGES

* removed legacy ui library
