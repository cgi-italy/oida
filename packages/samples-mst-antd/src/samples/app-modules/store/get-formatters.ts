import { formatMapCoord, MapCoordQuantity, formatDate, DateQuantity, formatFilesize, FilesizeQuantity, FilesizeUnit } from '@oida/core';

export const getFormatters = () => {
    return [
        {
            quantity: MapCoordQuantity,
            formatter: formatMapCoord,
            formatterOptions: [
                {
                    id: 'dms',
                    name: 'DMS',
                    options: {
                        format: 'dms',
                    }
                },
                {
                    id: 'deg',
                    name: 'Decimal',
                    options: {
                        format: 'dec',
                        precision: 2
                    }
                }
            ],
            initialOptions: 'dms'
        }, {
            quantity: DateQuantity,
            formatter: formatDate,
            formatterOptions: [
                {
                    id: 'utc',
                    name: 'UTC',
                    options: {
                        format: 'YYYY-MM-DD HH:mm:ss',
                    }
                }
            ],
            initialOptions: 'utc'
        }, {
            quantity: FilesizeQuantity,
            formatter: formatFilesize,
            formatterOptions: [
                {
                    id: 'auto',
                    name: 'Auto',
                    options: {
                        inputUnits: FilesizeUnit.Byte,
                        precision: 0,
                        appendUnits: true
                    }
                }
            ],
            initialOptions: 'auto'
        }
    ];
};
