export const PLANETARY_COMPUTER_SENTINEL1_COLLECTION_ID = 'sentinel-1-grd';

export const PlanetaryComputerS1CollectionConfig = {
    bands: [
        {
            id: 'vv',
            name: 'VV',
            domain: {
                min: 0,
                max: 10000
            },
            default: {
                range: {
                    min: 0,
                    max: 600
                },
                colorScale: 'gist_gray'
            }
        },
        {
            id: 'vh',
            name: 'VH',
            domain: {
                min: 0,
                max: 10000
            },
            default: {
                range: {
                    min: 0,
                    max: 300
                },
                colorScale: 'gist_gray'
            }
        }
    ],
    minZoomLevel: 7,
    presets: {
        'vv-vh': {
            id: 'vv-vh',
            name: 'VV, VH False-color composite',
            dataParameters: {
                asset_as_band: true,
                expression: 'vv;vh;vv/vh',
                rescale: ['0,600', '0,270', '0,9']
            }
        },
        vv: {
            id: 'vv',
            name: 'VV polarization',
            dataParameters: {
                assets: ['vv'],
                colormap_name: 'gray',
                rescale: '0,250'
            }
        },
        vh: {
            id: 'vh',
            name: 'VH polarization',
            dataParameters: {
                assets: ['vh'],
                colormap_name: 'gray',
                rescale: '0,250'
            }
        }
    }
};
