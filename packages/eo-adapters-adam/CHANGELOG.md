# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-adapters-adam@3.0.0...@oidajs/eo-adapters-adam@3.0.1) (2022-10-05)


### Bug Fixes

* force specify time subsetting parameter for fixed date datasets ([5141e72](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5141e72ac165540814f7131316a6c0346b223d5c))





# [3.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-adapters-adam@2.3.0...@oidajs/eo-adapters-adam@3.0.0) (2022-07-13)


### Bug Fixes

* return image data instead of canvas in GeoTiffRenderer rendering methods ([e70a0cc](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e70a0cc28e17a98b96b2d45bac0de766435797b6))


### Features

* add support for adam opensearch vector data download ([2030337](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/2030337fb2ab5ba49eb4cc9e0d4b9da672e0c6b0))
* add support for setting download options in dataset download config ([16f9b64](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/16f9b64c59448690f31aaa9c44ddd4d4be88a629))


### BREAKING CHANGES

* The GeotiffRenderer renderFromUrl and renderFromBuffer methods now return an image
data string instead of a canvas instance





# [2.3.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-adapters-adam@2.2.0...@oidajs/eo-adapters-adam@2.3.0) (2022-05-16)


### Features

* improve dataset dimensions management ([3f1d0d8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3f1d0d8c1539166694976ea8ba893d826c8ea652))





# [2.2.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-adapters-adam@2.1.0...@oidajs/eo-adapters-adam@2.2.0) (2022-04-14)


### Bug Fixes

* add download link as last property in Adam feature descriptor ([2cd3533](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/2cd353375458eea52855c985dad4975b7854910e))
* check for server side page limits on dataset product search response ([3f3017c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3f3017cff258ecc3b2b91ca1ec2a483c08cbad22))
* force usage of configured coverage srs for adam dataset extent computation ([643dec7](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/643dec7fe7ed0521cc27f52227b86fd0eac1c7dc))
* prevent products retrieval when no time is specified in adam vector data provider ([58a091c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/58a091c2e5625ccebf0b615df79023d506f3243e))


### Features

* add preliminary support for adam opensearch vector datasets ([ca27437](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/ca274373160c494080bd67174685dc3a38472ce9))
* add support for dimensions in adam vertical profile dataset ([3434d4b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3434d4b3d6e9aeb99409cbf29991d77e07f1c8a4))





# [2.1.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-adapters-adam@2.0.1...@oidajs/eo-adapters-adam@2.1.0) (2022-03-09)


### Bug Fixes

* add additional checks in adam series analysis tool initialization ([3a83efc](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3a83efc066c9bf538041820ce871b5a1918c26c7))
* disable adam dataset subset dimension when only one subset is available ([80f56f1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/80f56f1c9bbfddac69d9333585addfbb0bb3cde5))
* enable dataset discovery pagination/sorting for latest adam opensearch version ([339403b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/339403bb3f4df21938b3882177154030d6937a4e))
* enable filters when searching for nearest item in adam time distribution provider ([b84ceb4](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b84ceb4435c65619b1752e205c7150af07fbaf5d))
* improve adam opensearch filters convertion ([895699e](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/895699e183e5d0e1d9b5e008018035252ded1e37))


### Features

* enable adam time distribution computation from catalogue data ([3d11b18](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3d11b18d6a16d0158f29b0029a4c04bc1c20ca9c))
* improve adam opensearch dataset discovery ([ce187e3](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/ce187e396d1fef7e64da7472e10a2acf99bf1e23))


### Performance Improvements

* use aoi subset in adam spatial coverage provider ([17e0042](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/17e0042ce89f520c077c28c758c673bedec27308))





## [2.0.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/eo-adapters-adam@2.0.0...@oidajs/eo-adapters-adam@2.0.1) (2021-12-21)

**Note:** Version bump only for package @oidajs/eo-adapters-adam






# 2.0.0 (2021-12-21)


### Bug Fixes

* add active flag initialization in dataset discovery ([590be80](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/590be80098b9c0c9bdad17a8551fcff4df1e36bc))
* add additional checks for adam multiband datasets discovery ([baa40c4](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/baa40c460b9314b4e58e08db17d66985ada464c7))
* add missing subdataset in cesium tile source ([bcf1eb0](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bcf1eb01d926780146523f7ee60453db35be9e7d))
* allow undefined domain in adam dataset coverage config ([a0aaeb6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a0aaeb6d93f77246f706c78a3138c210f90aba48))
* check for timeless flag in adam volume source provider ([db2fc0b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/db2fc0b9dc33aede65e4c58bbfb2c9b67abd1f07))
* delay tile source refresh on ColorScale update in adam raster view ([42c2987](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/42c2987758035a3f0c920a2562b615d2ed628da2))
* disable footprint for esa cci dataset (temporary fix) ([984c525](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/984c5254aada42de31737e0a867adf0fd9f4a340))
* disable series and time navigation for all campaign data ([a668c85](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a668c85270502547630281f9e63b057cd47861d5))
* improve adam opensearch dataset initialization robustness ([073d4a1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/073d4a1708181e236687480d8934820697dad2f2))
* improve robusteness of adam dataset discovery ([498fc5e](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/498fc5e32243ddb9d7cfd47b1120d1f6c58d115e))
* remove reversal of grid dimensions in adam opensearch client ([a841ecb](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a841ecb3b2ab97f421a3cc9636dcb81c8f6fffa1))
* reproject geotiff extent when SRS is different from coverage SRS ([565bce5](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/565bce5bdbbaa843379696246c7a972f3be13cc2))
* retrieve extent information from wcs in adam opensearch discovery ([6aeaf17](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6aeaf170d77e1aa528f90efd394f8c32b3143080))
* solve some vertical profile layer issues ([1c4255c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1c4255c92636a2d3d9ad817b7f017f64a24ac088))


### Build System

* change packages name scope ([a8d721d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))


### Features

* add adam dataset discovery ([fcfde83](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/fcfde83d74b8446caa0f39d6989d304f4bbde204))
* add download url provider in adam dataset download conifg ([566177c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/566177c25ae9ac8241625f493f038e0207155b00))
* add fetch paramters in AsyncDataFetcher ([588b994](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/588b9940e2fa071125654288868bd5d5092f49d8))
* add initial support for opensearch dataset discovery ([bd58dad](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bd58dad47ddcb338ce6f81f4358ab6a6e81d6115))
* add option for static adam opensearch catalogues ([9be792a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9be792a27935fad0dd7e5e11b5bfd403cac79704))
* add support for dataset numeric domain scaling and offset ([29fd19b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/29fd19b19b3b678f5eb81a7457afba3b886bec47))
* add support to adam true color coverages ([37cce94](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/37cce94a89e249f5723a1ef6164b4cb0ccb0d77d))
* allow disabling a dataset from config in adam opensearch discovery ([d23266e](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/d23266e2a27bab55147302ee61cb4a87db8897b8))
* general improvements in adam adapters ([2790490](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/27904909e4a40aac0121d140a22c3bb8bd0152c0))
* port adam wps operations from edav ([71adeb8](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/71adeb845777f429f6edb588c340de5788fc96f6))
* update adam adapters to new opensearch metadata model ([13b12a0](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/13b12a0635e46e6fb8fec9724e5eb568cece938d))
* update to latest adam opensearch version ([ad5dbb6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/ad5dbb652f144528875d0b54c4d971cc087b341a))
* use nearest time granule (forward or backward) in eo explorer ([b77e078](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/b77e07877c717c8a03f27b9154ae4741d134f7f0))


### Performance Improvements

* improve robusteness of adam tile source to service errors ([56d2cbd](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/56d2cbd17e50a357ecbe224842bb593c3de55357))


### BREAKING CHANGES

* all import to @oida/\* packages shall be updated with @oidajs/\*





# [1.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/eo-adapters-adam@0.2.1...@oidajs/eo-adapters-adam@1.0.0) (2021-12-15)


### Bug Fixes

* add missing subdataset in cesium tile source ([bcf1eb0](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bcf1eb01d926780146523f7ee60453db35be9e7d))
* check for timeless flag in adam volume source provider ([db2fc0b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/db2fc0b9dc33aede65e4c58bbfb2c9b67abd1f07))
* delay tile source refresh on ColorScale update in adam raster view ([42c2987](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/42c2987758035a3f0c920a2562b615d2ed628da2))
* disable footprint for esa cci dataset (temporary fix) ([984c525](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/984c5254aada42de31737e0a867adf0fd9f4a340))
* disable series and time navigation for all campaign data ([a668c85](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a668c85270502547630281f9e63b057cd47861d5))
* solve some vertical profile layer issues ([1c4255c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/1c4255c92636a2d3d9ad817b7f017f64a24ac088))


### Build System

* change packages name scope ([a8d721d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))


### Features

* add download url provider in adam dataset download conifg ([566177c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/566177c25ae9ac8241625f493f038e0207155b00))
* add option for static adam opensearch catalogues ([9be792a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9be792a27935fad0dd7e5e11b5bfd403cac79704))
* general improvements in adam adapters ([2790490](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/27904909e4a40aac0121d140a22c3bb8bd0152c0))
* update adam adapters to new opensearch metadata model ([13b12a0](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/13b12a0635e46e6fb8fec9724e5eb568cece938d))


### BREAKING CHANGES

* all import to @oida/\* packages shall be updated with @oidajs/\*





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
