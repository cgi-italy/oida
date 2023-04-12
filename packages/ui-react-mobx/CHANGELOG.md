# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.4.3](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/ui-react-mobx@4.4.2...@oidajs/ui-react-mobx@4.4.3) (2023-04-12)

**Note:** Version bump only for package @oidajs/ui-react-mobx

## [4.4.2](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/ui-react-mobx@4.4.1...@oidajs/ui-react-mobx@4.4.2) (2023-04-06)

**Note:** Version bump only for package @oidajs/ui-react-mobx

## [4.4.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/ui-react-mobx@4.4.0...@oidajs/ui-react-mobx@4.4.1) (2023-01-13)

**Note:** Version bump only for package @oidajs/ui-react-mobx

# [4.4.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/ui-react-mobx@4.3.0...@oidajs/ui-react-mobx@4.4.0) (2022-12-22)

### Features

- add preliminary workspace save/load support ([508f00a](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/508f00a7b360c0e4283a5d472750c8ee54fd1a58))

# [4.3.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/ui-react-mobx@4.2.0...@oidajs/ui-react-mobx@4.3.0) (2022-10-05)

### Bug Fixes

- add readonly support in aoi field ([14b0ee6](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/14b0ee6b239ac8bb585ecd6c5a1cf1071281118d))
- check if an aoi have already been instantiated before creating a new one in bindAoiValueToMap ([9a3aef2](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9a3aef20da0c9786e3b8152b41d4f95e27f6ed22))
- force setting aoi field instance id on disequality in bindAoiValueToMap util ([145941c](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/145941ce3d8988dca18c6813c3e78fbc45a15cca))
- implement workaround for multiple map components target stealing ([511aca1](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/511aca14d41295dd933b9a95f973743c80688d33))
- prevent url param override in useRouteSearchStateBinding ([005938d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/005938daf2529198346684e84d3a0cf212fcb831))
- solve issue with aoi field re-created at each rendering cycle ([bfd97a4](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bfd97a4434089bd29adec7ec619fdd3881c426b4))
- sync url params with state on missing param in useRouteSearchStateBinding ([6af392d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6af392dba36ba2b5aa8a3355e53399c63cb643a1))

### Features

- add utility for string capitalization ([cba4ebe](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/cba4ebe38f65b6bb4f857f5c1dd29b47fa4f6154))
- allow disabling aoi map picking ([2211164](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/2211164e4af67e09bdd499167a86aa0eec292b27))
- allow usage of non observable arrays in UseEntityCollectionList hook ([f5ee000](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f5ee0001983dd346dbad43ac14c16a78ff7bfc89))

# [4.2.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/ui-react-mobx@4.1.1...@oidajs/ui-react-mobx@4.2.0) (2022-07-13)

### Bug Fixes

- solve a few issues with history back/forward navigation in StatePathRouter ([4df7bb5](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/4df7bb557da5e4cc513c2a70c66e11641df2f0c7))
- solve some state routing issue ([35707e9](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/35707e916543eb5dd1e88c06ec3b16ad11676f67))

### Features

- add support for embedding a map into an aoi field ([6def987](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6def9877e6071d108883527eb66cde78186b8acb))
- improve state path routing components ([94033e2](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/94033e23a08e29390d2654042053ac041aae601c))

## [4.1.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/ui-react-mobx@4.1.0...@oidajs/ui-react-mobx@4.1.1) (2022-05-16)

**Note:** Version bump only for package @oidajs/ui-react-mobx

# [4.1.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/ui-react-mobx@4.0.1...@oidajs/ui-react-mobx@4.1.0) (2022-03-09)

### Features

- update routing utils ([8533a76](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/8533a76b4220417d811b4114ff770223d26906d8))

## [4.0.1](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oidajs/ui-react-mobx@4.0.0...@oidajs/ui-react-mobx@4.0.1) (2021-12-21)

**Note:** Version bump only for package @oidajs/ui-react-mobx

# 4.0.0 (2021-12-21)

### Bug Fixes

- add support for selector returning a function in useSelector hook ([9fef225](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9fef22532323fb329cd900c8c66ce0845673fa42))
- aoi name and color are now correctly propagated from aoi instance ([3a4525b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3a4525b2ba6821e02d6d1bb465ca433397455929))
- make aoi binded from filter invisible by default ([31194ec](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/31194ec613dc8725bd9f24188e8085e6014297bd))
- minor fixes ([5bf1c5d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5bf1c5d8e62fef3c7eb7c0cf9a268e014e572031))
- solve centerOnMap hook not working on map renderer change ([66202c0](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/66202c0fbf1e5c238bd0a5f42fe37f920fdc1dac))
- use form serializer for filter serialization to url ([ac05a91](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/ac05a915fc08546679386a6efdf1c6b5d4ed60b1))

### Build System

- change packages name scope ([a8d721d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))

### Code Refactoring

- improve data collection components ([6b54259](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6b542593300a06cc6fff16a0c0100a99ab786b31))

### Features

- add additional actions to aoi field ([6b7de40](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6b7de40e47d5844a114a9d0f3adfac4d1e33387c))
- add eo video ui controls ([bf73759](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bf73759716b156b152e3b09aa97fedfe1effe082))
- add fetch paramters in AsyncDataFetcher ([588b994](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/588b9940e2fa071125654288868bd5d5092f49d8))
- add goToHome action in map nav controls ([a541a3f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a541a3f33900843e999d325e7358e7349f06ebdc))
- add initial viewport in map module config ([ad94b5f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/ad94b5fc6f74c4e1fd8854300cada210105730c2))
- add map aoi field component ([aacdecf](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/aacdecff3248b8e1e513dafe77bab2decda35f08))
- add support for custom breadcrumb item render content ([f938507](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f9385079309786a577249eaf4bfcc95d19440602))
- allow aoi import in dataset analyses ([9ffd9aa](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9ffd9aa8f9572876be74c348026c4e6a46fb4189))
- allow dynamic actions in entity collection list ([c56a693](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c56a69383cddd9bd1691227bf914f3c9360f0add))
- allow to use numbers as identifiers ([e04eb42](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e04eb420fa84a0749f473eb599e201ef6941bf0c))
- automatic binding of aoi filters to map aoi instance ([e6952aa](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e6952aa1ad9c3e2a575f8572852a274bc5a474e3))
- breadcrumb improvements ([e697429](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e697429c074d0df585a3178b5061e4d39d4f20ff))
- improve aoi import management ([907c9df](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/907c9df0c119821803d74b225a19909d1f605ad1))

### BREAKING CHANGES

- all import to @oida/\* packages shall be updated with @oidajs/\*
- MapNavControls component renamed to MapNavTools
- Removed icon from collection item props: icons should be added in table column or
  list item content

# [3.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/ui-react-mobx@1.0.0...@oida/ui-react-mobx@2.0.0) (2021-12-15)

### Bug Fixes

- use form serializer for filter serialization to url ([ac05a91](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/ac05a915fc08546679386a6efdf1c6b5d4ed60b1))

### Build System

- change packages name scope ([a8d721d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))

### BREAKING CHANGES

- all import to @oida/\* packages shall be updated with @oidajs/\*

# [2.0.0](https://gitlab.dev.eoss-cloud.it/frontend/oida/compare/@oida/ui-react-mobx@1.0.0...@oida/ui-react-mobx@2.0.0) (2021-09-28)

### Bug Fixes

- add support for selector returning a function in useSelector hook ([9fef225](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9fef22532323fb329cd900c8c66ce0845673fa42))

### Features

- add goToHome action in map nav controls ([a541a3f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/a541a3f33900843e999d325e7358e7349f06ebdc))
- add initial viewport in map module config ([ad94b5f](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/ad94b5fc6f74c4e1fd8854300cada210105730c2))
- allow dynamic actions in entity collection list ([c56a693](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/c56a69383cddd9bd1691227bf914f3c9360f0add))

### BREAKING CHANGES

- MapNavControls component renamed to MapNavTools

# 1.0.0 (2021-06-18)

### Bug Fixes

- aoi name and color are now correctly propagated from aoi instance ([3a4525b](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/3a4525b2ba6821e02d6d1bb465ca433397455929))
- make aoi binded from filter invisible by default ([31194ec](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/31194ec613dc8725bd9f24188e8085e6014297bd))
- minor fixes ([5bf1c5d](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/5bf1c5d8e62fef3c7eb7c0cf9a268e014e572031))
- solve centerOnMap hook not working on map renderer change ([66202c0](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/66202c0fbf1e5c238bd0a5f42fe37f920fdc1dac))

### Code Refactoring

- improve data collection components ([6b54259](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/6b542593300a06cc6fff16a0c0100a99ab786b31))

### Features

- add eo video ui controls ([bf73759](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/bf73759716b156b152e3b09aa97fedfe1effe082))
- add fetch paramters in AsyncDataFetcher ([588b994](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/588b9940e2fa071125654288868bd5d5092f49d8))
- add map aoi field component ([aacdecf](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/aacdecff3248b8e1e513dafe77bab2decda35f08))
- add support for custom breadcrumb item render content ([f938507](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/f9385079309786a577249eaf4bfcc95d19440602))
- allow aoi import in dataset analyses ([9ffd9aa](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/9ffd9aa8f9572876be74c348026c4e6a46fb4189))
- allow to use numbers as identifiers ([e04eb42](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e04eb420fa84a0749f473eb599e201ef6941bf0c))
- automatic binding of aoi filters to map aoi instance ([e6952aa](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e6952aa1ad9c3e2a575f8572852a274bc5a474e3))
- breadcrumb improvements ([e697429](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/e697429c074d0df585a3178b5061e4d39d4f20ff))
- improve aoi import management ([907c9df](https://gitlab.dev.eoss-cloud.it/frontend/oida/commit/907c9df0c119821803d74b225a19909d1f605ad1))

### BREAKING CHANGES

- Removed icon from collection item props: icons should be added in table column or
  list item content
