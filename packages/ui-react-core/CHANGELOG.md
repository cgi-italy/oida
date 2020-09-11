# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.1.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/ui-react-core@2.1.0...@oida/ui-react-core@2.1.1) (2020-09-11)

**Note:** Version bump only for package @oida/ui-react-core





# [2.1.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/ui-react-core@2.0.0...@oida/ui-react-core@2.1.0) (2020-05-22)


### Features

* add boolean form field ([1b7adea](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1b7adea115d290ec2474a2e6f89b8675ac821c6d))
* add extension filter on aoi import ([b21adb8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b21adb813b777f15f6832688a1cb14ed323cd723))
* add generic form renderer ([4e29978](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4e29978f774a0ae8fc2bf99fcb4cf44d63fa64c2))
* add support for line and draw constraints in aoi field ([45b6527](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/45b6527e3ae17e0958828f50da32228acd27846b))
* move form field definition in core ([0509f7c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0509f7c0a191d6220d1cbfa04ac13a3504402a79))





# [2.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/ui-react-core@1.0.0...@oida/ui-react-core@2.0.0) (2020-02-12)


### Code Refactoring

* dynamiclayout module renamings ([0f79a43](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0f79a4344fea852ce0cb27f3bb6e6e91a2e958e2))
* use react hooks in data collection state management ([626e14d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/626e14d20d4460b327b1f502e39ae8a7ca7b925f))


### Features

* add linkToViewport action on AoiField ([153033c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/153033cba2b60725a578f9c3bdd0e1e8e0e9b5b6))
* add numeric range field ([e005475](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e005475744a4cee15fc665dc2ffc906c6e1919b3))
* add point support to aoi drawer ([e569b25](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e569b253e195eca08a9ae608355d9de28aed0dca))
* add preliminary aoi import support ([1e11eb3](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1e11eb3fd026c134fbd62ddc39463557edd8c2f5))
* add reusable app layouts ([48ad1e9](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/48ad1e9fdb11916184083e0cf43e2e216cac7406))


### BREAKING CHANGES

* use DynamicSections new namings in place of old DynamicLayout ones
* data collection related components are now based on hooks. Old renderProps based
components were removed





# 1.0.0 (2019-04-09)


### Bug Fixes

* add missing sass utils in ui-react-core ([d28eced](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d28eced))
* **ui-react-core:** fix for async image state update after unmount ([ff8524a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/ff8524a))
* **ui-react-core:** rename interface definitions from tsx to ts ([c175a0e](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c175a0e))


### Code Refactoring

* refactor ui library ([665be09](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/665be09))


### Features

* add canBeScrolledIntoView hoc ([73c5375](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/73c5375))
* add initial data filtering support ([b7e564f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b7e564f))
* add map nav controls ([d37d477](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d37d477))
* add optional icon and actions to datacollectionitems ([68b5da1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/68b5da1))
* **ui-react-core:** add asyncimage component ([aa8f8c2](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/aa8f8c2))
* add support for dynamic sections ([95ea58d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/95ea58d))
* minor types updates ([7d194c1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7d194c1))
* track active action in AOI field ([b6ea172](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b6ea172))


### BREAKING CHANGES

* removed legacy ui library
