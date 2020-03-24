import defineProperties from 'cesium/Source/Core/defineProperties';
import Event from 'cesium/Source/Core/Event';
import GeographicTilingScheme from 'cesium/Source/Core/GeographicTilingScheme';
import WebMercatorTilingScheme from 'cesium/Source/Core/WebMercatorTilingScheme';
import Credit from 'cesium/Source/Core/Credit';
import DeveloperError from 'cesium/Source/Core/DeveloperError';

import { get as getProj } from 'ol/proj';
import TileState from 'ol/TileState';

/*
*    adapted from:
*    https://raw.githubusercontent.com/openlayers/ol-cesium/2df20fb04bba0aa8ac3251c118f272797e667ce3/src/olcs/core/olimageryprovider.js
*
*/

export const CesiumOLImageryProvider = function(this: any, olSource, options) {

    this.source_ = olSource;

    this.projection_ = null;
    this.rectangle_ = undefined;
    this.tilingScheme_ = undefined;
    this.credit_ = undefined;
    this.tileDiscardPolicy_ = options.tileDiscardPolicy;
    this.fallbackProj_ = options.fallbackProj || null;
    this.proxy_ = options.proxy;

    this.ready_ = false;

    this.errorEvent_ = new Event();

    this.emptyCanvas_ = document.createElement('canvas');
    this.emptyCanvas_.width = 1;
    this.emptyCanvas_.height = 1;

    this.source_.on('change', this.handleSourceChanged_, this);

    this.handleSourceChanged_();
};

defineProperties(CesiumOLImageryProvider.prototype, {
    ready: {
        get: function(this: any) {
            return this.ready_;
        }
    },

    rectangle: {
        get: function(this: any) {

            if (!this.ready_) {
                throw new DeveloperError('minimumLevel must not be called before the imagery provider is ready.');
            }

            return this.rectangle_;
        }
    },

    tileWidth: {
        get: function(this: any) {

            if (!this.ready_) {
                throw new DeveloperError('minimumLevel must not be called before the imagery provider is ready.');
            }

            const tg = this.source_.getTileGridForProjection(this.projection_);
            return tg ? (Array.isArray(tg.getTileSize(0)) ? tg.getTileSize(0)[0] : tg.getTileSize(0)) : 256;
        }
    },

    tileHeight: {
        get: function(this: any) {

            if (!this.ready_) {
                throw new DeveloperError('minimumLevel must not be called before the imagery provider is ready.');
            }

            const tg = this.source_.getTileGridForProjection(this.projection_);
            return tg ? (Array.isArray(tg.getTileSize(0)) ? tg.getTileSize(0)[1] : tg.getTileSize(0)) : 256;
        }
    },

    maximumLevel: {
        get: function(this: any) {

            if (!this.ready_) {
                throw new DeveloperError('minimumLevel must not be called before the imagery provider is ready.');
            }

            const tg = this.source_.getTileGridForProjection(this.projection_);
            return tg ? tg.getMaxZoom() : 18;
        }
    },

    minimumLevel: {
        get: function(this: any) {

            if (!this.ready_) {
                throw new DeveloperError('minimumLevel must not be called before the imagery provider is ready.');
            }

            let tg = this.source_.getTileGridForProjection(this.projection_);
            return tg ? tg.getMinZoom() : 0;
        }
    },

    tilingScheme: {
        get: function(this: any) {

            if (!this.ready_) {
                throw new DeveloperError('minimumLevel must not be called before the imagery provider is ready.');
            }

            return this.tilingScheme_;
        }
    },

    tileDiscardPolicy: {
        get: function(this: any) {

            if (!this.ready_) {
                throw new DeveloperError('minimumLevel must not be called before the imagery provider is ready.');
            }

            return this.tileDiscardPolicy_;
        }
    },

    errorEvent: {
        get: function(this: any) {
            return this.errorEvent_;
        }
    },

    credit: {
        get: function(this: any) {
            return this.credit_;
        }
    },

    proxy: {
        get: function(this: any) {
            return this.proxy_;
        }
    },

    hasAlphaChannel: {
        get: function() {
            return true;
        }
    },

});


CesiumOLImageryProvider.prototype.handleSourceChanged_ = function() {
    if (!this.ready_ && this.source_.getState() === 'ready') {
        this.projection_ = this.source_.getProjection() || this.fallbackProj_;
        if (this.projection_ === getProj('EPSG:4326')) {
            this.tilingScheme_ = new GeographicTilingScheme();
        } else if (this.projection_ === getProj('EPSG:3857')) {
            this.tilingScheme_ = new WebMercatorTilingScheme();
        } else {
            this.tilingScheme_ = new GeographicTilingScheme();
            this.projection_ = getProj('EPSG:4326'); // reproject
        }

        this.rectangle_ = this.tilingScheme_.rectangle;

        this.credit_ = CesiumOLImageryProvider.createCreditForSource(this.source_);
        this.ready_ = true;
    }
};


CesiumOLImageryProvider.createCreditForSource = function(source) {
    let text = '';
    let attributions = source.getAttributions();
    if (typeof attributions === 'function') {
        attributions = attributions();
    }
    if (attributions) {
        attributions.forEach((htmlOrAttr) => {
            const html = typeof htmlOrAttr === 'string' ? htmlOrAttr : htmlOrAttr.getHTML();
            text += html;
        });
    }

    return text.length > 0 ? new Credit(text, true) : null;
};

CesiumOLImageryProvider.prototype.getTileCredits = function(x, y, level) {
    return undefined;
};

CesiumOLImageryProvider.prototype.requestImage = function(x, y, level) {

    // 1) Cesium zoom level 0 is OpenLayers zoom level 1 for EPSG:4326
    const z = this.tilingScheme_ instanceof GeographicTilingScheme ? level + 1 : level;

    const tilegrid = this.source_.getTileGridForProjection(this.projection_);
    if (z < tilegrid.getMinZoom() || z > tilegrid.getMaxZoom()) {
        return Promise.resolve(this.emptyCanvas_); // no data
    }

    try {
        const tile = this.source_.getTile(z, x, y, 1, this.projection_);

        const promise = new Promise((resolve, reject) => {

            let onTileChange = () => {
                const state = tile.getState();
                if (state === TileState.LOADED || state === TileState.EMPTY) {
                    resolve(tile.getImage() || this.emptyCanvas_);
                    tile.removeEventListener('change', onTileChange);
                } else if (state === TileState.ERROR) {
                    resolve(undefined); // let Cesium continue retrieving later
                    tile.removeEventListener('change', onTileChange);
                }
            };

            tile.addEventListener('change', onTileChange);

            if (tile.getState() === TileState.IDLE) {
                tile.load();
            } else {
                onTileChange();
            }
        });

        return promise;
    } catch {
        return Promise.resolve(this.emptyCanvas_);
    }
};

CesiumOLImageryProvider.prototype.pickFeatures = function(x, y, level, longitude, latitude) {
    return undefined;
};

