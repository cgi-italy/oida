# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
