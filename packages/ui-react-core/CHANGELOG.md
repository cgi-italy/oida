# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.0.0](https://github.com/cgi-italy/oida/compare/@oida/ui-react-core@4.0.0...@oidajs/ui-react-core@5.0.0) (2021-12-15)


### Bug Fixes

* cancel loading indicator before setting error state in AsyncImage ([22151b9](https://github.com/cgi-italy/oida/commit/22151b9293e2a507d847f6d2f4beb91233d5bf52))
* replace all setImmediate (non standard) calls with setTimeout ([e991548](https://github.com/cgi-italy/oida/commit/e9915486859236b2bfa37760ef4508d0f467dc77))


### Build System

* change packages name scope ([a8d721d](https://github.com/cgi-italy/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))


### Features

* make item action content optional ([8d94652](https://github.com/cgi-italy/oida/commit/8d94652544ce858c5fffff3078f5823c27e8c7d2))


### BREAKING CHANGES

* all import to @oida/\* packages shall be updated with @oidajs/\*





# [4.0.0](https://github.com/cgi-italy/oida/compare/@oida/ui-react-core@3.0.0...@oida/ui-react-core@4.0.0) (2021-09-28)


### Features

* add goToHome action in map nav controls ([a541a3f](https://github.com/cgi-italy/oida/commit/a541a3f33900843e999d325e7358e7349f06ebdc))
* add support for primary actions in data collection ([fd50491](https://github.com/cgi-italy/oida/commit/fd50491e6c51da3b36c9f87054f692132b959145))


### BREAKING CHANGES

* MapNavControls component renamed to MapNavTools





# [3.0.0](https://github.com/cgi-italy/oida/compare/@oida/ui-react-core@2.1.1...@oida/ui-react-core@3.0.0) (2021-06-18)


### Bug Fixes

* minor fixes ([5bf1c5d](https://github.com/cgi-italy/oida/commit/5bf1c5d8e62fef3c7eb7c0cf9a268e014e572031))
* minor fixes and improvements ([bd78b2c](https://github.com/cgi-italy/oida/commit/bd78b2c1b783283753e957d5abcfe722bb2916fd))
* minor layout updates ([adb97cd](https://github.com/cgi-italy/oida/commit/adb97cdf2d89bd426ea83544253b146fa37719b8))


### Code Refactoring

* improve data collection components ([6b54259](https://github.com/cgi-italy/oida/commit/6b542593300a06cc6fff16a0c0100a99ab786b31))


### Features

* add map aoi field component ([aacdecf](https://github.com/cgi-italy/oida/commit/aacdecff3248b8e1e513dafe77bab2decda35f08))
* add new data filtering widget ([52bc638](https://github.com/cgi-italy/oida/commit/52bc638c2ed7129624be61c5cfab91f316aab4df))
* add support for custom breadcrumb item render content ([f938507](https://github.com/cgi-italy/oida/commit/f9385079309786a577249eaf4bfcc95d19440602))
* allow aoi import in dataset analyses ([9ffd9aa](https://github.com/cgi-italy/oida/commit/9ffd9aa8f9572876be74c348026c4e6a46fb4189))
* asyncImage improvements ([ffd1f49](https://github.com/cgi-italy/oida/commit/ffd1f494b3bc90d0f011a5fcc535a027601599fc))
* breadcrumb improvements ([e697429](https://github.com/cgi-italy/oida/commit/e697429c074d0df585a3178b5061e4d39d4f20ff))
* collection list improvements ([21ac452](https://github.com/cgi-italy/oida/commit/21ac452483fd8318c9a2bc86a7acfc574e8862df))
* improve analysis dashboard widget positioning ([f56db5d](https://github.com/cgi-italy/oida/commit/f56db5d87fad5c10b7a68dbe5b019ce3113aeed2))
* minor component updates ([4b5b23c](https://github.com/cgi-italy/oida/commit/4b5b23cc05173f59b46f5d456868ecca56aec28d))


### BREAKING CHANGES

* Removed icon from collection item props: icons should be added in table column or
list item content





## [2.1.1](https://github.com/cgi-italy/oida/compare/@oida/ui-react-core@2.1.0...@oida/ui-react-core@2.1.1) (2020-09-11)

**Note:** Version bump only for package @oida/ui-react-core





# [2.1.0](https://github.com/cgi-italy/oida/compare/@oida/ui-react-core@2.0.0...@oida/ui-react-core@2.1.0) (2020-05-22)


### Features

* add boolean form field ([1b7adea](https://github.com/cgi-italy/oida/commit/1b7adea115d290ec2474a2e6f89b8675ac821c6d))
* add extension filter on aoi import ([b21adb8](https://github.com/cgi-italy/oida/commit/b21adb813b777f15f6832688a1cb14ed323cd723))
* add generic form renderer ([4e29978](https://github.com/cgi-italy/oida/commit/4e29978f774a0ae8fc2bf99fcb4cf44d63fa64c2))
* add support for line and draw constraints in aoi field ([45b6527](https://github.com/cgi-italy/oida/commit/45b6527e3ae17e0958828f50da32228acd27846b))
* move form field definition in core ([0509f7c](https://github.com/cgi-italy/oida/commit/0509f7c0a191d6220d1cbfa04ac13a3504402a79))





# [2.0.0](https://github.com/cgi-italy/oida/compare/@oida/ui-react-core@1.0.0...@oida/ui-react-core@2.0.0) (2020-02-12)


### Code Refactoring

* dynamiclayout module renamings ([0f79a43](https://github.com/cgi-italy/oida/commit/0f79a4344fea852ce0cb27f3bb6e6e91a2e958e2))
* use react hooks in data collection state management ([626e14d](https://github.com/cgi-italy/oida/commit/626e14d20d4460b327b1f502e39ae8a7ca7b925f))


### Features

* add linkToViewport action on AoiField ([153033c](https://github.com/cgi-italy/oida/commit/153033cba2b60725a578f9c3bdd0e1e8e0e9b5b6))
* add numeric range field ([e005475](https://github.com/cgi-italy/oida/commit/e005475744a4cee15fc665dc2ffc906c6e1919b3))
* add point support to aoi drawer ([e569b25](https://github.com/cgi-italy/oida/commit/e569b253e195eca08a9ae608355d9de28aed0dca))
* add preliminary aoi import support ([1e11eb3](https://github.com/cgi-italy/oida/commit/1e11eb3fd026c134fbd62ddc39463557edd8c2f5))
* add reusable app layouts ([48ad1e9](https://github.com/cgi-italy/oida/commit/48ad1e9fdb11916184083e0cf43e2e216cac7406))


### BREAKING CHANGES

* use DynamicSections new namings in place of old DynamicLayout ones
* data collection related components are now based on hooks. Old renderProps based
components were removed





# 1.0.0 (2019-04-09)


### Bug Fixes

* add missing sass utils in ui-react-core ([d28eced](https://github.com/cgi-italy/oida/commit/d28eced))
* **ui-react-core:** fix for async image state update after unmount ([ff8524a](https://github.com/cgi-italy/oida/commit/ff8524a))
* **ui-react-core:** rename interface definitions from tsx to ts ([c175a0e](https://github.com/cgi-italy/oida/commit/c175a0e))


### Code Refactoring

* refactor ui library ([665be09](https://github.com/cgi-italy/oida/commit/665be09))


### Features

* add canBeScrolledIntoView hoc ([73c5375](https://github.com/cgi-italy/oida/commit/73c5375))
* add initial data filtering support ([b7e564f](https://github.com/cgi-italy/oida/commit/b7e564f))
* add map nav controls ([d37d477](https://github.com/cgi-italy/oida/commit/d37d477))
* add optional icon and actions to datacollectionitems ([68b5da1](https://github.com/cgi-italy/oida/commit/68b5da1))
* **ui-react-core:** add asyncimage component ([aa8f8c2](https://github.com/cgi-italy/oida/commit/aa8f8c2))
* add support for dynamic sections ([95ea58d](https://github.com/cgi-italy/oida/commit/95ea58d))
* minor types updates ([7d194c1](https://github.com/cgi-italy/oida/commit/7d194c1))
* track active action in AOI field ([b6ea172](https://github.com/cgi-italy/oida/commit/b6ea172))


### BREAKING CHANGES

* removed legacy ui library
