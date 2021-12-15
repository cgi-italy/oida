import React from 'react';
import { Select } from 'antd';

import { Map } from '@oidajs/state-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';
import { RasterBandModeSingle, RasterBandConfig, getRasterBandSingleConfig, DatasetDimensions } from '@oidajs/eo-mobx';

import { DatasetColorMapSelector } from './dataset-colormap-selector';
import { DatasetInfoTooltip } from './dataset-info-tooltip';


export type DatasetBandSelectorProps = {
    state: RasterBandModeSingle;
    bands: RasterBandConfig[];
    bandSelectorLabel?: string
};

export const DatasetBandSelector = (props: DatasetBandSelectorProps) => {

    let selectedBand = useSelector(() => {
        return props.state.band;
    });

    const selectedBandConfig = props.bands.find((bandConfig) => bandConfig.id === selectedBand);

    const bandOptions = props.bands.map((band) => {
        return (<Select.Option key={band.id} value={band.id}>{band.name}</Select.Option>);
    });

    const setDefaultBandDomain = (band: string) => {
        getRasterBandSingleConfig({
            bands: props.bands,
            default: {
                band: band
            }
        }).then((bandMode) => {
            props.state.colorMap.setColorMapDomain(bandMode.colorMap.domain);
        });
    };

    return (
        <div className='dataset-var-selector dataset-combo-selector'>
            <span>{props.bandSelectorLabel || 'Band'}: </span>
            <Select
                value={selectedBand}
                onChange={(band) => {
                    props.state.setBand(band);
                    setDefaultBandDomain(band);
                }}
            >
                {bandOptions}
            </Select>
            <DatasetInfoTooltip info={selectedBandConfig?.description}/>
        </div>
    );
};

export type DatasetBandSingleSelectorProps = {
    state: RasterBandModeSingle;
    rasterBands: RasterBandConfig | RasterBandConfig[];
    dimensionsState?: DatasetDimensions;
    mapState?: Map;
    bandSelectorLabel?: string;
};

export const DatasetBandSingleSelector = (props: DatasetBandSingleSelectorProps) => {

    const colorScales = useSelector(() => {
        let bandConfig: RasterBandConfig | undefined;
        if (Array.isArray(props.rasterBands)) {
            const selectedBand = props.state.band;
            bandConfig = props.rasterBands.find((band) => band.id === selectedBand);
        } else {
            bandConfig = props.rasterBands;
        }
        if (bandConfig) {
            return bandConfig.colorScales;
        }
    });

    const selectedBand = useSelector(() => {
        return props.state.band;
    });

    let bandSelector: JSX.Element | undefined;

    let selectedBandConfig: RasterBandConfig | undefined;
    if (Array.isArray(props.rasterBands)) {
        bandSelector = <DatasetBandSelector
            state={props.state}
            bands={props.rasterBands}
            bandSelectorLabel={props.bandSelectorLabel}
        />;

        selectedBandConfig = props.rasterBands.find((bandConfig) => bandConfig.id === selectedBand);
    } else {
        selectedBandConfig = props.rasterBands;
    }


    let colorMapSelector: JSX.Element | undefined;
    if (colorScales) {
        colorMapSelector = (
            <DatasetColorMapSelector
                colorMap={props.state.colorMap}
                colorScales={colorScales}
                variable={selectedBandConfig}
                dimensionsState={props.dimensionsState}
                mapState={props.mapState}
            />
        );
    }

    return (
        <div className='dataset-band-single-selector'>
            {bandSelector}
            {colorMapSelector}
        </div>
    );
};
