# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/ui-react-antd@3.0.0...@oida/ui-react-antd@4.0.0) (2021-09-28)


### Bug Fixes

* ignore time in date range field min/max limits enforcement ([d9ccf2a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d9ccf2a948e9f26464ee835a70e865709290a15f))


### Features

* add description in form field definition ([dc5ff4b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/dc5ff4bfebb71e6ae406076819643223ab452973))
* add goToHome action in map nav controls ([a541a3f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a541a3f33900843e999d325e7358e7349f06ebdc))
* add layer group icon ([e6117e8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e6117e8f060e0d9b79e454171f5ee6e6de4a533f))
* add support for primary actions in data collection ([fd50491](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/fd50491e6c51da3b36c9f87054f692132b959145))


### BREAKING CHANGES

* MapNavControls component renamed to MapNavTools





# [3.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/ui-react-antd@2.2.0...@oida/ui-react-antd@3.0.0) (2021-06-18)


### Bug Fixes

* allow css coloring of draw-line icon ([2bbd138](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/2bbd13866c930a63263edddda15484c72de0e4a4))
* minor adjustments ([beac7f5](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/beac7f5995ca070536cdadf83fbfd6ce829fc64a))
* minor data collection components improvements ([dbad63c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/dbad63c06d76b98a17f3f3b8e29768d231c8520f))
* minor fixes and improvements ([bd78b2c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bd78b2c1b783283753e957d5abcfe722bb2916fd))
* minor layout updates ([adb97cd](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/adb97cdf2d89bd426ea83544253b146fa37719b8))
* minor ui fixes and improvements ([99c5a0f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/99c5a0ff6e5e54da182429198501f94c663965ba))
* use multiline break on filter input overflow ([aae71e3](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/aae71e3d28357e2c9f54ff69ba3a9c0e37c795a8))


### Code Refactoring

* improve data collection components ([6b54259](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6b542593300a06cc6fff16a0c0100a99ab786b31))


### Features

* add empty message to data collection list ([9c104c5](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9c104c5b371123fd084954e7af37cffa2be606ee))
* add generic list item component ([342636c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/342636cab8b555e17a652ad5819c25836da10b84))
* add map aoi field component ([aacdecf](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/aacdecff3248b8e1e513dafe77bab2decda35f08))
* add new data filtering widget ([52bc638](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/52bc638c2ed7129624be61c5cfab91f316aab4df))
* add support for async data in enum field ([70c8d54](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/70c8d5448387e3fb2ea6cf5f6d4d0299554e4a48))
* add support for custom breadcrumb item render content ([f938507](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f9385079309786a577249eaf4bfcc95d19440602))
* add support for limiting date/time selection in date picker ([d95a006](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d95a006fc52ad598bbbc12efa36de57d2c56a69f))
* add support for list item description ([d7d9938](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d7d993865bb1037eb4a0fafe2eecc0cd3abe3825))
* breadcrumb improvements ([e697429](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e697429c074d0df585a3178b5061e4d39d4f20ff))
* collection list improvements ([21ac452](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/21ac452483fd8318c9a2bc86a7acfc574e8862df))
* improve analysis ux ([8c2f075](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8c2f075570f1e7c0f04c849ec3daf32d6fc35fbe))
* improve aoi import management ([907c9df](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/907c9df0c119821803d74b225a19909d1f605ad1))
* minor component updates ([4b5b23c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4b5b23cc05173f59b46f5d456868ecca56aec28d))
* minor improvements to search filter control ([ee9fdd4](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/ee9fdd4f8b1a08dc2ec07702d838ccce38ae4bd0))
* use search filterer as default list filter renderer ([9b27b67](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9b27b67295e77bcbbacd3ab8654af08b50c56799))


### BREAKING CHANGES

* Removed icon from collection item props: icons should be added in table column or
list item content





# [2.2.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/ui-react-antd@2.1.0...@oida/ui-react-antd@2.2.0) (2020-09-11)


### Features

* add date form field ([e946019](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e946019e77239cfd3862e55b3d2f64a2649161c0))
* improve dataset time navigation ([0b055d2](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0b055d2fa5f232766c7408394df04e2bf6b67f85))





# [2.1.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/ui-react-antd@2.0.0...@oida/ui-react-antd@2.1.0) (2020-05-22)


### Features

* add boolean form field ([1b7adea](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1b7adea115d290ec2474a2e6f89b8675ac821c6d))
* add extension filter on aoi import ([b21adb8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b21adb813b777f15f6832688a1cb14ed323cd723))
* add generic form renderer ([4e29978](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4e29978f774a0ae8fc2bf99fcb4cf44d63fa64c2))
* add support for line and draw constraints in aoi field ([45b6527](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/45b6527e3ae17e0958828f50da32228acd27846b))
* move form field definition in core ([0509f7c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0509f7c0a191d6220d1cbfa04ac13a3504402a79))





# [2.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/ui-react-antd@1.0.0...@oida/ui-react-antd@2.0.0) (2020-02-12)


### Bug Fixes

* **ui-react-antd:** missing icons in npm package ([01cda65](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/01cda651a20c55e534b4947642ff9fca7f26ad5b))
* fix samples and feature-layer-controller typing error ([441f677](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/441f677df296dba458e536702dcde3e16966ecbb))
* fix scss import ([f77e5a8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f77e5a8c16dae0f2e700858e7307d7893e9f01dc))
* minor fixes ([470fa4a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/470fa4aa19578e6a2bcb77fe12c8cd1e560bf688))


### Code Refactoring

* dynamiclayout module renamings ([0f79a43](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0f79a4344fea852ce0cb27f3bb6e6e91a2e958e2))
* use react hooks in data collection state management ([626e14d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/626e14d20d4460b327b1f502e39ae8a7ca7b925f))


### Features

* add initial dataset tools support ([8d0cb1f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8d0cb1fba2a47c211fe56b61baaf2501b547de9e))
* add linkToViewport action on AoiField ([153033c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/153033cba2b60725a578f9c3bdd0e1e8e0e9b5b6))
* add numeric range field ([e005475](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e005475744a4cee15fc665dc2ffc906c6e1919b3))
* add point support to aoi drawer ([e569b25](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e569b253e195eca08a9ae608355d9de28aed0dca))
* add preliminary aoi import support ([1e11eb3](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1e11eb3fd026c134fbd62ddc39463557edd8c2f5))
* minor ui improvements ([c5280d3](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c5280d348cf2c43296a5615c884527aeab4f1e59))


### BREAKING CHANGES

* use DynamicSections new namings in place of old DynamicLayout ones
* data collection related components are now based on hooks. Old renderProps based
components were removed





# 1.0.0 (2019-04-09)


### Bug Fixes

* add missing sass utils in ui-react-core ([d28eced](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d28eced))


### Code Refactoring

* refactor ui library ([665be09](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/665be09))


### Features

* add initial data filtering support ([b7e564f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b7e564f))
* add map nav controls ([d37d477](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d37d477))
* add optional icon and actions to datacollectionitems ([68b5da1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/68b5da1))
* **ui-react-antd:** add support for custom svg icons ([5337a3a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5337a3a))
* add support for dynamic sections ([95ea58d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/95ea58d))
* minor types updates ([7d194c1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7d194c1))
* track active action in AOI field ([b6ea172](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b6ea172))


### BREAKING CHANGES

* removed legacy ui library
