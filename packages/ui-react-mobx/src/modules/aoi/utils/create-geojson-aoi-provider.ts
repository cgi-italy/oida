import { QueryParams, createAxiosInstance } from '@oida/core';

import { createInMemoryAoiProvider } from './create-in-memory-aoi-provider';

export const GeoJsonAoiParser = (input: File | string, nameProp?: string) => {

    const axios = createAxiosInstance();

    const parseGeoJsonData = (data: GeoJSON.GeoJSON, inputName) => {
        if (data.type === 'FeatureCollection') {
            return data.features.map((feature, idx) => {
                let properties = feature.properties || {};
                let name = properties[nameProp || 'name'] || `${inputName}.${idx}`;
                return {
                    id: feature.id || `feature_${idx}`,
                    name: name,
                    geometry: feature.geometry,
                    properties: feature.properties
                };
            });
        } else if (data.type === 'Feature') {
            let properties = data.properties || {};
            let name = properties[nameProp || 'name'] || inputName;
            return [{
                id: data.id || inputName,
                name: name,
                geometry: data.geometry,
                properties: data.properties
            }];
        } else if (data.type === 'GeometryCollection') {
            return data.geometries.map((geometry, idx) => {
                return {
                    id: `geom_${idx}`,
                    name: `Geometry ${idx}`,
                    geometry: geometry,
                    properties: {}
                };
            });
        } else {
            return [data];
        }
    };

    return new Promise<any>((resolve, reject) => {
        if (input instanceof File) {
            let reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    let data = JSON.parse(reader.result as string);
                    resolve(parseGeoJsonData(data, input.name));
                } catch (error) {
                    reject(new Error('Error parsing GeoJSON data'));
                }
            };
            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsText(input);
        } else {
            axios.get(input).then((response) => {
                try {
                    resolve(parseGeoJsonData(response.data, input));
                } catch (error) {
                    reject(new Error('Error parsing GeoJSON data'));
                }
            }).catch((error) => {
                reject(error);
            });
        }
    });
};

export const createGeoJsonAoiProvider = (geojsonLocation, nameProp?: string) => {
    let inMemoryProvider;

    return (queryParams: QueryParams) => {
        if (!inMemoryProvider) {
            let promise = GeoJsonAoiParser(geojsonLocation, nameProp).then((aois) => {
                inMemoryProvider = createInMemoryAoiProvider(aois);
                return inMemoryProvider(queryParams);
            });
            return promise;
        } else {
            return inMemoryProvider(queryParams);
        }
    };
};
