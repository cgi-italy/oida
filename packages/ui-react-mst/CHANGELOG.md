# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/ui-react-mst@2.0.0...@oida/ui-react-mst@3.0.0) (2020-05-22)


### Bug Fixes

* switch from deprecated needsConfig to hasConfig in app modules ([d0439ca](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d0439ca62efdd60c38df4c30bc70a1516e50a3a4))


### Features

* add extension filter on aoi import ([b21adb8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b21adb813b777f15f6832688a1cb14ed323cd723))
* add support for line and draw constraints in aoi field ([45b6527](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/45b6527e3ae17e0958828f50da32228acd27846b))
* listen for resize events in map component ([42fe879](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/42fe8791e757b4d0d82ef2fc55abdd916a2341b6))
* move form field definition in core ([0509f7c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0509f7c0a191d6220d1cbfa04ac13a3504402a79))


### BREAKING CHANGES

* App module configuration shall be specified in the initial state snapshot





# [2.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/ui-react-mst@1.0.0...@oida/ui-react-mst@2.0.0) (2020-02-12)


### Bug Fixes

* allow undefined in custom hooks ([23a300f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/23a300f81c82e6d9695b83821e0e61b31ef5418a))
* minor fixes ([470fa4a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/470fa4aa19578e6a2bcb77fe12c8cd1e560bf688))


### Code Refactoring

* dynamiclayout module renamings ([0f79a43](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0f79a4344fea852ce0cb27f3bb6e6e91a2e958e2))
* use react hooks in data collection state management ([626e14d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/626e14d20d4460b327b1f502e39ae8a7ca7b925f))


### Features

* add filter type in data filtering state ([2819562](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/2819562cdedb9ba1ebdd1c36b790878e41deff0c))
* add initial dataset tools support ([8d0cb1f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8d0cb1fba2a47c211fe56b61baaf2501b547de9e))
* add linkToViewport action on AoiField ([153033c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/153033cba2b60725a578f9c3bdd0e1e8e0e9b5b6))
* add point support to aoi drawer ([e569b25](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e569b253e195eca08a9ae608355d9de28aed0dca))
* add preliminary aoi import support ([1e11eb3](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1e11eb3fd026c134fbd62ddc39463557edd8c2f5))
* add some useful map hooks ([d579671](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d57967138baf7cac0020053e27d2638fb41dad8b))


### BREAKING CHANGES

* use DynamicSections new namings in place of old DynamicLayout ones
* data collection related components are now based on hooks. Old renderProps based
components were removed





# 1.0.0 (2019-04-09)


### Code Refactoring

* refactor ui library ([665be09](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/665be09))
* **state-mst:** refactor DynamicUnion into TaggedUnion type ([d018219](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d018219))


### Features

* add initial data filtering support ([b7e564f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b7e564f))
* add map nav controls ([d37d477](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d37d477))
* **ui-react-mst:** add breadcrumb module ([7ded6fb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7ded6fb))
* track active action in AOI field ([b6ea172](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b6ea172))
* **ui-react-mst:** add container for EntityCollection rendering ([7b4e17e](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7b4e17e))
* **ui-react-mst:** add default state injection in map module components ([392f104](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/392f104))
* **ui-react-mst:** add formatters module ([0ad31f7](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/0ad31f7))
* **ui-react-mst:** add map aoi module ([7851f98](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/7851f98))
* **ui-react-mst:** introduce support for app modules ([9f7ef7c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9f7ef7c))


### BREAKING CHANGES

* **state-mst:** Removed DynamicUnion. Use TaggedUnion instead. MapEntity, MapEntityCollection moved
into Entity and EntityCollection
* removed legacy ui library
