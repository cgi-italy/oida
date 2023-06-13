import { PLANETARY_COMPUTER_API_URL } from './planetary-computer-api-client';
import { PlanetaryComputerCollectionConfig } from './planetary-computer-collections';

export const PLANETARY_COMPUTER_SENTINEL2_COLLECTION_ID = 'sentinel-2-l2a';

export const PlanetaryComputerS2CollectionConfig: PlanetaryComputerCollectionConfig = {
    bands: [
        {
            id: 'B01',
            name: 'B01',
            domain: {
                min: 0,
                max: 20000
            },
            default: {
                range: {
                    min: 1000,
                    max: 3000
                },
                colorScale: 'gray'
            }
        },
        {
            id: 'B02',
            name: 'B02',
            domain: {
                min: 0,
                max: 20000
            },
            default: {
                range: {
                    min: 1000,
                    max: 3000
                },
                colorScale: 'gray'
            }
        },
        {
            id: 'B03',
            name: 'B03',
            domain: {
                min: 0,
                max: 20000
            },
            default: {
                range: {
                    min: 1000,
                    max: 3000
                },
                colorScale: 'gray'
            }
        },
        {
            id: 'B04',
            name: 'B04',
            domain: {
                min: 0,
                max: 20000
            },
            default: {
                range: {
                    min: 1000,
                    max: 3000
                },
                colorScale: 'gray'
            }
        },
        {
            id: 'B05',
            name: 'B05',
            domain: {
                min: 0,
                max: 20000
            },
            default: {
                range: {
                    min: 1000,
                    max: 4000
                },
                colorScale: 'gray'
            }
        },
        {
            id: 'B06',
            name: 'B06',
            domain: {
                min: 0,
                max: 20000
            },
            default: {
                range: {
                    min: 1200,
                    max: 6000
                },
                colorScale: 'gray'
            }
        },
        {
            id: 'B07',
            name: 'B07',
            domain: {
                min: 0,
                max: 20000
            },
            default: {
                range: {
                    min: 1200,
                    max: 7000
                },
                colorScale: 'gray'
            }
        },
        {
            id: 'B08',
            name: 'B08',
            domain: {
                min: 0,
                max: 20000
            },
            default: {
                range: {
                    min: 1000,
                    max: 7000
                },
                colorScale: 'gray'
            }
        },
        {
            id: 'B8A',
            name: 'B8A',
            domain: {
                min: 0,
                max: 20000
            },
            default: {
                range: {
                    min: 1000,
                    max: 7000
                },
                colorScale: 'gray'
            }
        },
        {
            id: 'B09',
            name: 'B09',
            domain: {
                min: 0,
                max: 20000
            },
            default: {
                range: {
                    min: 1000,
                    max: 7000
                },
                colorScale: 'gray'
            }
        },
        {
            id: 'B11',
            name: 'B11',
            domain: {
                min: 0,
                max: 20000
            },
            default: {
                range: {
                    min: 1000,
                    max: 5000
                },
                colorScale: 'gray'
            }
        },
        {
            id: 'B12',
            name: 'B12',
            domain: {
                min: 0,
                max: 20000
            },
            default: {
                range: {
                    min: 1000,
                    max: 4000
                },
                colorScale: 'gray'
            }
        }
    ],
    minZoomLevel: 7,
    presets: {
        true_color: {
            id: 'true_color',
            name: 'True Color',
            dataParameters: {
                assets: ['visual'],
                format: 'png',
                nodata: 0
            }
        },
        false_color: {
            id: 'false_color',
            name: 'False Color',
            dataParameters: {
                assets: ['B08', 'B04', 'B03'],
                color_formula: 'Gamma RGB 3.7 Saturation 1.5 Sigmoidal RGB 15 0.35',
                format: 'png',
                nodata: 0
            }
        },
        ndvi: {
            id: 'ndvi',
            name: 'NDVI',
            dataParameters: {
                asset_as_band: true,
                expression: '(B08-B04)/(B08+B04)',
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
                expression: '(B8A-B11)/(B8A+B11)',
                colormap_name: 'rdbu',
                rescale: '-1,1',
                format: 'png'
            },
            legend: `${PLANETARY_COMPUTER_API_URL}/data/v1/legend/colormap/rdbu?height=0.25`,
            legendValues: [-1, 0, 1]
        }
    }
};
