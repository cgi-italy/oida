import { PLANETARY_COMPUTER_API_URL } from './planetary-computer-api-client';

export const PLANETARY_COMPUTER_LANDSAT_COLLECTION_ID = 'landsat-c2-l2';

export const PlanetaryComputerLandsatCollection = {
    bands: [
        {
            id: 'blue',
            name: 'B',
            color: 'blue',
            domain: {
                min: 0,
                max: 60000
            },
            default: {
                colorScale: 'gray',
                range: {
                    min: 6000,
                    max: 15000
                }
            }
        },
        {
            id: 'green',
            name: 'G',
            color: 'green',
            domain: {
                min: 0,
                max: 60000
            },
            default: {
                colorScale: 'gray',
                range: {
                    min: 6000,
                    max: 15000
                }
            }
        },
        {
            id: 'red',
            name: 'R',
            color: 'red',
            domain: {
                min: 0,
                max: 60000
            },
            default: {
                colorScale: 'gray',
                range: {
                    min: 6000,
                    max: 15000
                }
            }
        },
        {
            id: 'nir08',
            name: 'NIR',
            domain: {
                min: 0,
                max: 60000
            },
            default: {
                colorScale: 'gray',
                range: {
                    min: 8000,
                    max: 25000
                }
            }
        },
        {
            id: 'swir16',
            name: 'SWIR1',
            domain: {
                min: 0,
                max: 60000
            },
            default: {
                colorScale: 'gray',
                range: {
                    min: 8000,
                    max: 25000
                }
            }
        },
        {
            id: 'lwir11',
            name: 'LWIR',
            domain: {
                min: 0,
                max: 60000
            },
            default: {
                colorScale: 'gray',
                range: {
                    min: 35000,
                    max: 50000
                }
            }
        },
        {
            id: 'swir22',
            name: 'SWIR2',
            domain: {
                min: 0,
                max: 60000
            },
            default: {
                colorScale: 'gray',
                range: {
                    min: 8000,
                    max: 20000
                }
            }
        },
        {
            id: 'coastal',
            name: 'CA',
            domain: {
                min: 0,
                max: 60000
            },
            default: {
                colorScale: 'gray',
                range: {
                    min: 6000,
                    max: 12000
                }
            }
        }
    ],
    minZoomLevel: 7,
    presets: {
        true_color: {
            id: 'true_color',
            name: 'True Color',
            dataParameters: {
                assets: ['red', 'green', 'blue'],
                color_formula: 'gamma RGB 2.7, saturation 1.5, sigmoidal RGB 15 0.55'
            }
        },
        false_color: {
            id: 'false_color',
            name: 'False Color',
            dataParameters: {
                assets: ['nir08', 'red', 'green'],
                color_formula: 'gamma RGB 2.7, saturation 1.5, sigmoidal RGB 15 0.55'
            }
        },
        ndvi: {
            id: 'ndvi',
            name: 'NDVI',
            dataParameters: {
                asset_as_band: true,
                expression: '(nir08-red)/(nir08+red)',
                colormap_name: 'rdylgn',
                rescale: '-1,1',
                format: 'png'
            },
            legend: `${PLANETARY_COMPUTER_API_URL}/data/v1/legend/colormap/rdylgn?height=0.25`,
            legendValues: [-1, 0, 1]
        },
        ndmi: {
            id: 'ndmi',
            name: 'NDMI',
            dataParameters: {
                asset_as_band: true,
                expression: '(nir08-swir16)/(nir08+swir16)',
                colormap_name: 'rdbu',
                rescale: '-1,1',
                format: 'png'
            },
            legend: `${PLANETARY_COMPUTER_API_URL}/data/v1/legend/colormap/rdbu?height=0.25`,
            legendValues: [-1, 0, 1]
        }
    }
};
