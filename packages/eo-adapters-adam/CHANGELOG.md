# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.2.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/eo-adapters-adam@0.2.0...@oida/eo-adapters-adam@0.2.1) (2021-09-28)

**Note:** Version bump only for package @oida/eo-adapters-adam





# 0.2.0 (2021-06-18)


### Bug Fixes

* add active flag initialization in dataset discovery ([590be80](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/590be80098b9c0c9bdad17a8551fcff4df1e36bc))
* add additional checks for adam multiband datasets discovery ([baa40c4](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/baa40c460b9314b4e58e08db17d66985ada464c7))
* allow undefined domain in adam dataset coverage config ([a0aaeb6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a0aaeb6d93f77246f706c78a3138c210f90aba48))
* improve adam opensearch dataset initialization robustness ([073d4a1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/073d4a1708181e236687480d8934820697dad2f2))
* improve robusteness of adam dataset discovery ([498fc5e](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/498fc5e32243ddb9d7cfd47b1120d1f6c58d115e))
* remove reversal of grid dimensions in adam opensearch client ([a841ecb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a841ecb3b2ab97f421a3cc9636dcb81c8f6fffa1))
* reproject geotiff extent when SRS is different from coverage SRS ([565bce5](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/565bce5bdbbaa843379696246c7a972f3be13cc2))
* retrieve extent information from wcs in adam opensearch discovery ([6aeaf17](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6aeaf170d77e1aa528f90efd394f8c32b3143080))


### Features

* add adam dataset discovery ([fcfde83](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/fcfde83d74b8446caa0f39d6989d304f4bbde204))
* add fetch paramters in AsyncDataFetcher ([588b994](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/588b9940e2fa071125654288868bd5d5092f49d8))
* add initial support for opensearch dataset discovery ([bd58dad](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bd58dad47ddcb338ce6f81f4358ab6a6e81d6115))
* add support for dataset numeric domain scaling and offset ([29fd19b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/29fd19b19b3b678f5eb81a7457afba3b886bec47))
* add support to adam true color coverages ([37cce94](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/37cce94a89e249f5723a1ef6164b4cb0ccb0d77d))
* port adam wps operations from edav ([71adeb8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/71adeb845777f429f6edb588c340de5788fc96f6))
* use nearest time granule (forward or backward) in eo explorer ([b77e078](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b77e07877c717c8a03f27b9154ae4741d134f7f0))


### Performance Improvements

* improve robusteness of adam tile source to service errors ([56d2cbd](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/56d2cbd17e50a357ecbe224842bb593c3de55357))
