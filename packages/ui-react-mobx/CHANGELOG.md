# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.1.1](https://github.com/cgi-italy/oida/compare/@oidajs/ui-react-mobx@4.1.0...@oidajs/ui-react-mobx@4.1.1) (2022-05-16)

**Note:** Version bump only for package @oidajs/ui-react-mobx





# [4.1.0](https://github.com/cgi-italy/oida/compare/@oidajs/ui-react-mobx@4.0.1...@oidajs/ui-react-mobx@4.1.0) (2022-03-09)


### Features

* update routing utils ([8533a76](https://github.com/cgi-italy/oida/commit/8533a76b4220417d811b4114ff770223d26906d8))





## [4.0.1](https://github.com/cgi-italy/oida/compare/@oidajs/ui-react-mobx@4.0.0...@oidajs/ui-react-mobx@4.0.1) (2021-12-21)

**Note:** Version bump only for package @oidajs/ui-react-mobx






# 4.0.0 (2021-12-21)


### Bug Fixes

* add support for selector returning a function in useSelector hook ([9fef225](https://github.com/cgi-italy/oida/commit/9fef22532323fb329cd900c8c66ce0845673fa42))
* aoi name and color are now correctly propagated from aoi instance ([3a4525b](https://github.com/cgi-italy/oida/commit/3a4525b2ba6821e02d6d1bb465ca433397455929))
* make aoi binded from filter invisible by default ([31194ec](https://github.com/cgi-italy/oida/commit/31194ec613dc8725bd9f24188e8085e6014297bd))
* minor fixes ([5bf1c5d](https://github.com/cgi-italy/oida/commit/5bf1c5d8e62fef3c7eb7c0cf9a268e014e572031))
* solve centerOnMap hook not working on map renderer change ([66202c0](https://github.com/cgi-italy/oida/commit/66202c0fbf1e5c238bd0a5f42fe37f920fdc1dac))
* use form serializer for filter serialization to url ([ac05a91](https://github.com/cgi-italy/oida/commit/ac05a915fc08546679386a6efdf1c6b5d4ed60b1))


### Build System

* change packages name scope ([a8d721d](https://github.com/cgi-italy/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))


### Code Refactoring

* improve data collection components ([6b54259](https://github.com/cgi-italy/oida/commit/6b542593300a06cc6fff16a0c0100a99ab786b31))


### Features

* add additional actions to aoi field ([6b7de40](https://github.com/cgi-italy/oida/commit/6b7de40e47d5844a114a9d0f3adfac4d1e33387c))
* add eo video ui controls ([bf73759](https://github.com/cgi-italy/oida/commit/bf73759716b156b152e3b09aa97fedfe1effe082))
* add fetch paramters in AsyncDataFetcher ([588b994](https://github.com/cgi-italy/oida/commit/588b9940e2fa071125654288868bd5d5092f49d8))
* add goToHome action in map nav controls ([a541a3f](https://github.com/cgi-italy/oida/commit/a541a3f33900843e999d325e7358e7349f06ebdc))
* add initial viewport in map module config ([ad94b5f](https://github.com/cgi-italy/oida/commit/ad94b5fc6f74c4e1fd8854300cada210105730c2))
* add map aoi field component ([aacdecf](https://github.com/cgi-italy/oida/commit/aacdecff3248b8e1e513dafe77bab2decda35f08))
* add support for custom breadcrumb item render content ([f938507](https://github.com/cgi-italy/oida/commit/f9385079309786a577249eaf4bfcc95d19440602))
* allow aoi import in dataset analyses ([9ffd9aa](https://github.com/cgi-italy/oida/commit/9ffd9aa8f9572876be74c348026c4e6a46fb4189))
* allow dynamic actions in entity collection list ([c56a693](https://github.com/cgi-italy/oida/commit/c56a69383cddd9bd1691227bf914f3c9360f0add))
* allow to use numbers as identifiers ([e04eb42](https://github.com/cgi-italy/oida/commit/e04eb420fa84a0749f473eb599e201ef6941bf0c))
* automatic binding of aoi filters to map aoi instance ([e6952aa](https://github.com/cgi-italy/oida/commit/e6952aa1ad9c3e2a575f8572852a274bc5a474e3))
* breadcrumb improvements ([e697429](https://github.com/cgi-italy/oida/commit/e697429c074d0df585a3178b5061e4d39d4f20ff))
* improve aoi import management ([907c9df](https://github.com/cgi-italy/oida/commit/907c9df0c119821803d74b225a19909d1f605ad1))


### BREAKING CHANGES

* all import to @oida/\* packages shall be updated with @oidajs/\*
* MapNavControls component renamed to MapNavTools
* Removed icon from collection item props: icons should be added in table column or
list item content





# [3.0.0](https://github.com/cgi-italy/oida/compare/@oida/ui-react-mobx@1.0.0...@oida/ui-react-mobx@2.0.0) (2021-12-15)


### Bug Fixes

* use form serializer for filter serialization to url ([ac05a91](https://github.com/cgi-italy/oida/commit/ac05a915fc08546679386a6efdf1c6b5d4ed60b1))


### Build System

* change packages name scope ([a8d721d](https://github.com/cgi-italy/oida/commit/a8d721db395a8a9f9c52808c5318c392096cc2a3))


### BREAKING CHANGES

* all import to @oida/\* packages shall be updated with @oidajs/\*





# [2.0.0](https://github.com/cgi-italy/oida/compare/@oida/ui-react-mobx@1.0.0...@oida/ui-react-mobx@2.0.0) (2021-09-28)


### Bug Fixes

* add support for selector returning a function in useSelector hook ([9fef225](https://github.com/cgi-italy/oida/commit/9fef22532323fb329cd900c8c66ce0845673fa42))


### Features

* add goToHome action in map nav controls ([a541a3f](https://github.com/cgi-italy/oida/commit/a541a3f33900843e999d325e7358e7349f06ebdc))
* add initial viewport in map module config ([ad94b5f](https://github.com/cgi-italy/oida/commit/ad94b5fc6f74c4e1fd8854300cada210105730c2))
* allow dynamic actions in entity collection list ([c56a693](https://github.com/cgi-italy/oida/commit/c56a69383cddd9bd1691227bf914f3c9360f0add))


### BREAKING CHANGES

* MapNavControls component renamed to MapNavTools





# 1.0.0 (2021-06-18)


### Bug Fixes

* aoi name and color are now correctly propagated from aoi instance ([3a4525b](https://github.com/cgi-italy/oida/commit/3a4525b2ba6821e02d6d1bb465ca433397455929))
* make aoi binded from filter invisible by default ([31194ec](https://github.com/cgi-italy/oida/commit/31194ec613dc8725bd9f24188e8085e6014297bd))
* minor fixes ([5bf1c5d](https://github.com/cgi-italy/oida/commit/5bf1c5d8e62fef3c7eb7c0cf9a268e014e572031))
* solve centerOnMap hook not working on map renderer change ([66202c0](https://github.com/cgi-italy/oida/commit/66202c0fbf1e5c238bd0a5f42fe37f920fdc1dac))


### Code Refactoring

* improve data collection components ([6b54259](https://github.com/cgi-italy/oida/commit/6b542593300a06cc6fff16a0c0100a99ab786b31))


### Features

* add eo video ui controls ([bf73759](https://github.com/cgi-italy/oida/commit/bf73759716b156b152e3b09aa97fedfe1effe082))
* add fetch paramters in AsyncDataFetcher ([588b994](https://github.com/cgi-italy/oida/commit/588b9940e2fa071125654288868bd5d5092f49d8))
* add map aoi field component ([aacdecf](https://github.com/cgi-italy/oida/commit/aacdecff3248b8e1e513dafe77bab2decda35f08))
* add support for custom breadcrumb item render content ([f938507](https://github.com/cgi-italy/oida/commit/f9385079309786a577249eaf4bfcc95d19440602))
* allow aoi import in dataset analyses ([9ffd9aa](https://github.com/cgi-italy/oida/commit/9ffd9aa8f9572876be74c348026c4e6a46fb4189))
* allow to use numbers as identifiers ([e04eb42](https://github.com/cgi-italy/oida/commit/e04eb420fa84a0749f473eb599e201ef6941bf0c))
* automatic binding of aoi filters to map aoi instance ([e6952aa](https://github.com/cgi-italy/oida/commit/e6952aa1ad9c3e2a575f8572852a274bc5a474e3))
* breadcrumb improvements ([e697429](https://github.com/cgi-italy/oida/commit/e697429c074d0df585a3178b5061e4d39d4f20ff))
* improve aoi import management ([907c9df](https://github.com/cgi-italy/oida/commit/907c9df0c119821803d74b225a19909d1f605ad1))


### BREAKING CHANGES

* Removed icon from collection item props: icons should be added in table column or
list item content
