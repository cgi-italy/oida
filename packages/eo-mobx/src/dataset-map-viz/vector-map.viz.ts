import { action, autorun, computed, IObservableArray, makeObservable, observable, reaction, runInAction } from 'mobx';
import chroma from 'chroma-js';

import {
    FeatureClusteringConfig,
    Geometry,
    getTextColorForBackground,
    LoadingState,
    randomColorFactory,
    SubscriptionTracker
} from '@oidajs/core';
import {
    DataFilters,
    DataFiltersProps,
    FeatureLayer,
    FeatureStyleGetter,
    HasVisibility,
    Hovered,
    HoveredProps,
    IsHoverable,
    IsSelectable,
    Selected,
    SelectedProps,
    Visible,
    VisibleProps
} from '@oidajs/state-mobx';

import {
    ColorMap,
    ColorMapProps,
    ColorScale,
    DatasetDimension,
    DatasetViz,
    DatasetVizProps,
    DimensionDomainType,
    DiscreteColorMap,
    DiscreteColorMapProps
} from '../common';
import { EnumFeaturePropertyDescriptor, VectorFeatureDescriptor, VectorFeatureProperties } from './vector-feature-descriptor';
import { createPropertiesDescriptorFromFeatures, exctractVectorFeaturePropertiesFromDescriptor } from '../utils';

export type VectorFeatureStyleFactoryConfig = {
    color?: string;
    pointIconUrl?: string;
};

/**
 * Default feature style factory for {@link DatasetVectorMapViz}. Used when no featureStyleFactory is
 * provided in {@link DatasetVectorMapVizConfig}
 * @param color A color string. In a nominal scenario the Dataset color is passed here.
 * @returns The map layer feature style function
 */
export const defaultVectoreFeatureStyleFactory = (config?: VectorFeatureStyleFactoryConfig) => {
    const defaultColor = chroma(config?.color || '0000AA');

    const featureStyleGetter: FeatureStyleGetter<DatasetVectorFeature> = (feature: DatasetVectorFeature) => {
        let color = feature.color ? chroma(feature.color) : defaultColor;
        let opacity = 0.7;

        if (feature.selected.value) {
            color = chroma(1.0, 1.0, 0.0, 'gl').alpha(1);
            opacity = 1;
        } else if (feature.hovered.value) {
            color = color.brighten(0.3);
            opacity = 1;
        }

        let zIndex = 0;
        if (feature.selected.value) {
            zIndex = 1;
        }
        if (feature.hovered.value) {
            zIndex = 2;
        }

        return {
            point: config?.pointIconUrl
                ? {
                      visible: feature.visible.value,
                      zIndex: zIndex,
                      url: config.pointIconUrl,
                      color: color.gl()
                  }
                : {
                      visible: feature.visible.value,
                      zIndex: zIndex,
                      radius: 5,
                      fillColor: color.gl()
                  },
            line: {
                visible: feature.visible.value,
                zIndex: zIndex,
                width: feature.selected.value ? 3 : 2,
                color: color.gl()
            },
            polygon: {
                visible: feature.visible.value,
                strokeColor: color.darken(0.3).gl(),
                strokeWidth: feature.selected.value ? 3 : 2,
                fillColor: color.alpha(color.alpha() * opacity).gl(),
                zIndex: zIndex
            },
            ...(feature.label && {
                label: {
                    text: feature.label,
                    visible: feature.visible.value,
                    zIndex: zIndex,
                    fillColor: chroma('FEFEFE').gl(),
                    strokeColor: chroma('333').gl(),
                    strokeWidth: 1,
                    offsetY: 16 + feature.label.split('\n').length * 12,
                    scale: 1.4
                }
            })
        };
    };

    return featureStyleGetter;
};

const defaultClusterImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAA9GAAAPRgFoUyCCAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAE5RJREFUeJztXety4rwSbEg2+73/y55dCHB+kAntdrckbglkPVUu2cYxiqen5yJZrA6HA364rKhdybHK/qM90Paj5fW7O3BDKeWuAbzQvip+LX/DSj5QW9ue2j0d/whwPDMAWNlr2V9Ju6a/UQY4YAoEtX5Weu3vzP5TAuLZALDCUcm6qfJ5P22l+JKDafem3X3s7+i49t8/tqeRZwHAK45K5ZaVzkCoTVmg5/+BqdVXm9zATtp3and4EjA8MgBKsb9wUnoB4AVzILDlMwgKAMDUFXALTGm/FQM462cQsPJ5v0D1UPKIAGBll/KrZRZQF7D++Iz9vlq/AqBEA0FmArV8xwC8vUu7xQkEWzwYEB4JAGsAb5gq/xVTy3csoDEAZwAt5XMsAExBwJE+swAHf0z7CQDvH/8HA+AdwAYPAoRHAMAax4dUCn/DyeqVCep8WTu3Sv8vH/cvQLg0UKXlAnayzwyQ/D8zwPajr+8f7RZHIHxr9vDdAHjDSfkMAMcAav28rwyQ6D8FgsoCLgh0/t9Zv2OALU5MsJH/Z/Px+bfIdwHgBSflKwhK8S0AuGwguYCUDjpR3+8KQMn3qwvYUqvKLzao/2Hzse3GH+Ft5DsA8BtTxfcAUO2L7Kd6gLoDVrqLA1oB4F721fqZ9pUFXj+Oi/ZL6dW+0nH1fwvg7+iDvIV8JQDWOCn/N6aKdyBwDFD+X7MCVwtILABMA0AHAlX8CAOk4I+t/536XEBm0Nbxl7HBVwGglPyGKQMoC7zKvgaCI9mACwiBsWIQDwbV/o6OuQrolM8A0MifrZ+tvlyABrNfEht8BQDK2hkAfMwWn4Dg4gBmgdGKoBsRdC6gNRA0Yv0c/Tufr7FMK429q0u4JwBWAP6DV7oCwIEhxQKj2QCPC6j/dwNC3KYg0JV+1erruHx/ZQEFgrL2lvtSAP/FndLFewFgjbnyGQQcC2gMoCwwmhJyTcBtgAcBxwGjANDSr7P+Urzz+3WulO76rWMZf3CH4tE9AFDK/42T0gsMqnxlgHMyAgaCSwXTmECKAVIRqMUAzgVwwecXpqkf+3zuc2IvjVv+4sbB4a0B8IKsfD6nMYFavwOCVgd7NQGl/9aQ8OhEkFYGoNE/0z6nfhtMFZ9illTD+IMbguCWAGDlV6sAYKU7N1AbB4GaEqYBIlcS1nkBzAAlGgi6cYAU/LkAsGhffb8GfK3ClfZT+3wzENwKAKV8tn7e3sJxCgqVBTQeUBdwzsAQMK8GpskgyQUk6y//zxmA9o9ZILkr7qMCoY5vAoJbAKCifafoxAYjmYEDgboDdQEKhNbQsBOmfmYAV//XYV/2/xUDaM1fiz+9dBWmrX4CwP9wZWB4LQCquqfK1v3EBq2swLmCXkbgAqteLQA4KXuF+SwgnQL2Lvsa+av/d/7+nHqFS1l5uyo7uBYALs1LQHAB4Uh9IJWHU2XQuYBUC+B5gb0iUJr9U4M+WvPXev9f5MAvMZTLVDRg3eMIgovkGgAk/86KTy5Bg0FlgN84WX9yA6km0IquR2YF9TIATf+45s/5f4pNepYP03IfXa3igAsrhpcCoKzTUTkfJ5eg16bAsMcCGhSmYPAacQygIOCgz/l+BaaLTYA8XK3spLFK9fHssYNLAPCCqYIcnWtQ6NigVSl0AGgFhBoI3lJKUfWs0sifzvhJ/j+lqCkuGdl4ePqszOASACQfrv5eGcDFBAkIrkzsSsTMAl8lpUxgmvtr3t9KTV1FUmMSJ60qJccDw+MG5wLAlW5ZecoISfktFtB7pcGiUv53CoPQ1fwVCInu3QjlCO1zmsoB6nA8cM4DLOpnpShtt/y7ugHNDjQYdGViZoFHEo34XVXSDfAkFkjRfipI6blyUUMdH5UUmKkbUEAwGFrVQr3uTe5f39eiyO8Wtvg1Havvb81LOCc1TQyww7FINNThEXHVOQWEKkwV6jKA/xqfK6BuHdzdS1Y49Tfl+3Wd+n1mAFVyb1qaY4BNr7MjAFhhnpO7aD1V9xIjtAJDBcMzSo2PpHRP2+TrW5NSejOUt+gEhCMAcAGYMoIesy9vFYtcivif3OOZZYXj/9EqQinNA3lSqk5IcYNSXJB6Qycg7AGgIlmn/JSrqytwWUIrRazPHi3Qu0be4GMXNx/RWbqzen3t7A0nMNR+933E3kPWCpwrx7pgzbkK5+NdDeH3QL+eUVwAm8rPaR6CzkVsDU0zC8SxgtaDrihWlZ4CwhQb6DlNDTUdfJZg7xJ5xfF/ZJ8PjM1AUjCU8elIJDNCVSXXCCzQAkCv/q5MoNcr9avlu4zgJyu/pJ65+vyW5bOFs+LLDbxhXpIundR5GwskAFTk72KAFhOkADEpnt3HT6T9JK84/s/nBHkODMwAtV9Kd+8fzjKC9NDZqnXMXT9L4HiDdx0uLnj2aP8S+YVpusc0r7OOdOhZKb/2laW30s7qAgkALZpvgSC5Aqd8Pv5X5Q3t4WZu32SfFe6AscFJ6QWCWV3AAcANZrhxd52e5TKFVD9gIDxyaffeUlVDVjZPOuHPmNbreaYZSDVnkgFRweBkjMABgGev6uiWWn7P+l26yGD4F4K+ntQgGzPBL8wVz8GeWj8DY2M+K53WfT9FAbCCR5NOw05bcg2pcrjIUdTStZDjKF8jfmblUjpPQ6trJu9B6HQpN6+OA0G+kaaGCoRe6vgvU7+TxJzset2x7juDVZ1+igIg/YFT+AgztFzCIlNRQ0mZVmJdtyV3/imOAdbyBzqdybHAuS5iES+cOiuTqnU7I9VNg/kamfwUPlAlq4XrFzM4eiBQlC7iRQPt9Ex759NcRL4OwBwAafYqKzyhseWDGAiLtMU906RkNkJ99jojqdp6UQaAZwCndIemREU9gCzSFufTVanOv6vxvpp9vgbAFAA6iTEp3X2WrF+Pl8h/TJK7VYt2incM7vQI4AQA9we94xQgtrZFxiTRfVK6guNVWjczeQ2cAPBiPtTNfbk7dp1a6P88cc8zGRXPNFY9ruTv9Z4TBliZL1TkrJBB4twBn1/kPGlZe6L4FebG6Sz/MxAsxaSFFLjlzigInJvQc4ucJ+45toDgrDzptXQ4AwB/qNbO5xw7rOVvFTSLnCeatjl34Px70p22EwD0KF4/S25AwTEJOBY5S9Sq9fk742yBwgLBXQBz7CiohzZmhEUuk2Rw6XkDU93UPZTVJwzAF/NNtQOsyBZTOMZY5DLReMu9YOKedc+oPzc94W7asnKYv0Xo7CKXSc+nOx05fcKcW7Fy3B85JeuN9HoHqkUuE6doyD5bOeTzBJLP+zjK531dsSIxBeCVvTDAdcIGCNrvsTbker3H598oA6g4YLibpvhgYYDbSE+5us9/07rukOjj0uMWiBY5X0qJBzmn1wDzdQbS/SbtGvO3Rdz75HVz7Yy7ud5neMGiRWZSz84xsAOCumxddWS2CokDAMLFB3OtvuConV7keklrBjl9JLZIYJkEaPquunaidcwdq5vvw3WLjItTeu8a3t/3rlMA6Je0LNwhUb+Ur1/kMkmsmwy2df3sujV9oLSvry+zchMl6ZfuEd5LX2RIkrG11hNyRqn3nDBA70aq9F5n9uZei1wmbiVQoK0D97nTyQEEgL35Y5aWst0XAPNOL3K+JL+uy8kcwrnkvj/vt5YP3SoVqlymdYcq18FFLhNdMIINqqX8ZJiq088swFF+WqvOfWla6WLyZYucJfUM63nv6Fif7QgrRxcAc7MdMpLcl6fPFgBcLvxsFQjpubvgUP+e9Ya1fJnzK0nhaulO+bzqxSLnSVoG1j131ZVjX8cIUAZwX+DcQMvStbMLAC6TpPCWDpi9eUv6mgHA+XS3QtUBGaG1sMEe00WOFhCMCz/Td/hnrBbvANI6PwsCEwO0qL2OVdGucwsAxqVWBtFFo0bcglN6ChgnAFDLVupwHXg31+jv6fD+khKOSVK2A4KeO5i/c8YMYDoYlCjFuQDXMadwBcTCAn1Ry+dfJUuGmHSjfzOLyRgALXpJfsgpmrfqOLeLtIV/eVSfKZ9zz12VnlxxFwAOTerrW/upowsLtMWxKRuPMzzWS9LJEAPAXKQdUmW2aF8tf2GBvvBzepf90WeeYgRmh09RALiI3t1Qkabr1Lvz9dnmY3+RqbDCN+gDQEHilM7ugK/5FAWAu5FDXUKfs/zNx7awQFu2ZjuHCTTeSswwefYKgIN8qboEp3DtqPsH9LMCxSJHSUaSjh04emxt4y+3ZJveQJccd79OwWvV6rm0zAkvY/Ivyw5T5ad9VbYG2j0WmFk/4B9+z+eoRfNqVrVGra5yVec3mL9l/K+/QVxK3ph9dqPqVh1LJJbmeGAiyfp4geKW4pkh2OrdDyintW3WeN7fBrxW/uKkbN4cA/A5DRR3yEzBuptVYhMAeopnd8AK1+XhlPaT9a/x7y0iWcrugSCl0goCV3TT/ZkkABww9evO/6vS1b/zOvUt6+f3CP+VeKCU9xdzELALcADpBYcuSNwhjMO0Hrha+UbatHZt/QOl5NZ6NsD8xcefDoIdjkqtLQFBATESJKbYIGZcrYe9h88AXuB9fCmdrTsBIC1mMNKvZ5Z3HJX8B1n53LKSW0GicwHMALPgr6T3oNXvvzb2mf51FdFVo4W0B/y8n44Fjsr4g5NylQVaMUGdcwzQCxqt7y/pPeRigbQ0uW68XOkK3vJ5waIS90brT/o5OVVksQDvMys4xbOC03nNFprWD4xZmRZ0WumdcwFuXZsStXxgPv/w2X9ZjJWufp+BsOlcp4Gicw/vdK7p+0tGALDHNABU356WK3dr1OiSJ2r56Q2kZ/yFsarwqTUnN6CsoHFAa0sBYncG1qifrRtqwNdaMdQFfel9dX2VyU1QrV8cewbRgI2t1/l/BwbnNlJw6ILEpu8vOSfQYgC0ijspynfRfombeu7mJezw2L87pKVb9tdJmc76OVNIgWLLLXSpv+ScB1nlRo3sWytStyifVx1pvdHiJpvWjyk9iltII56OvltW30oRVen6HQyG4VlX51pSKvCw4pUFgLblV7s3rU550hFK/kWt7wgUW8Phapkpwk8MkKx/S+e34ZphORcAh48vS9buLN4pJlk9T0V389rS4NNX/jCFG3GrcmspXl2BC9xcJbCsn+lf9zlr+GO+4yy5xJdWVpBoPy1kyJJSPvdySj3oGp2s378tIGiK6tLQayS9F6HDrVqN07RMlb+FV+YfuU7pXT/j/bMn3F4aTG2RLX+E9lsA4BnI9Ru6DAIdpEq/qZPiE+C0NA6vsad9qwGU1tRqnZzhBmc4R28pkhnBBYDKBPr3Q1G/yjXRdLmC3nq0LOrz3atnOxyrgMoAZfkV/GmFUjOUlWnT2sfcN319Svv5jmlcUvTvhmCZBRITpMjeZQKt6y+Sa9OpPx/tOZbPD5jPOyC4n1Ev63ejkWr5CgDnmrhYMpKNuKDUzZtIWYEWd3oRPwPBMcNf+R/OkmsBoEEhMAXAwbTuVXP1+y7Iqt/VrZlIOvVMqd/9uEVaGFuZCdQfBoEGqDVWon1VACgTMBg4JtBqoWYGrnZw1fuWtyio7KkjvXTPVfjU77tA6xe1DgBuXILrFKp8FxiOsNJoMJhiAY0LUizQqhPw1hzoGZFbVdRqkgOvV9sr8jjrUgsry9d5CRt4+lcWKPoHfKzCfUWnv9o/Fwg6ACgTuLJtqhG4GKAs/+yI38ktS6o7TCnJ+VbHAO7BluLL8isFHJl/6OYbusknvEJaD7A7TBlBYwCXEbTiAAeE1hjAXZQP3L6mXkwA5EJPj1I1+HultjIA/mn11pxDTVMZBAfaZypN4xKuvwUGnX6tAHDFIRcQpiIRbzdTPnCfQRVmAmdRbE2O9nk6urqA8v0p/3cDU4kBzhmR1Aqlq1QmBnAuwJWLR1zB1T5f5V6jahUYAnNrSsUVV+/n6l+d0+h/TW1rAmqqUbhU0I1LaLCqbSsWSK6gxwLc3lz5wH2HVQ84gsAVU1y5V6Pqon6u+KXcP81IShNTgDkDVJ9144pgqgoyeNnyNRhsjRO0ikRXpXotufe4etUJ0sNz5V4NALnmr4pP+b9W/0bmJTD1V9uqCPbSQbX+Fgu4tPDi8u458lUTK7boB38u8n/B1Pf35ia2ZimBWucCqk0A0NilBYJRAPBgEbuCu/h7J185s2YH4H/I9MmRPxd+egyg8xPU+nsDVqkUzGBwbiBtW9OOlIjZ6u9G+SrfMbXqL+a5syv8cM2/VfnjMQAtAF0zRA3MM4De4JCWhzUTcBVCVv5NU7wRWR0OXwa22XfjpOSi/ldMa/466ONG/RIDtN5A0uFgYB4DtLKXYoR3OpcGiDQo5ECQGeBb5DsBULLGaXpXKZxbN+jDylcGcFt9zyVT1FwtwNUDar+sfyQlvGuEPyKPAIASBkJvyDelfxUTuOhfA0EnLQD0qoLFAG6E0Cn/S4K8njwSAEoKCOwGeiN/LgYYDQC5ZfoH5vTPTNDLBjQTqP2HUHzJIwKgZIV59O/m/rVKwKNBYMoEeizgxgU0HdzS5w8njwwAFkf9I+XfXh1Ah4JB+60RTC4JczDoAsGHlmcBQElF+A4AOgdQQQBMAaBZADBPAatNIFDrZ1A8hTwbAFh4xk+qALbGAXouAPD+P41lPKU8MwBUSqm9eQBq9c4NaCVQ00AGyVPLTwJAS9T3cyqYJoQADxq43VL+D+xR1hG+fgPhAAAAAElFTkSuQmCC';

/**
 * Default cluster style function. Used when clustering is enabled but no clustering
 * style is defined in the {@link DatasetVectorMapVizConfig} mapLayerOptions
 * @param features the cluster features
 * @returns the style for the cluster
 */
export const defaultClusterStyleFactory = (config?: VectorFeatureStyleFactoryConfig) => {
    const clusterStyler: FeatureClusteringConfig<DatasetVectorFeature>['style'] = (features) => {
        const defaultClusterColor = config?.color || '#7777DD';

        let allSelected = true;
        let someSelected = false;
        //let featuresColor = chroma(features[0].model.color || defaultClusterColor);
        features.forEach((feature) => {
            allSelected = allSelected && feature.model.selected.value;
            someSelected = someSelected || feature.model.selected.value;
            // mix cluster features color.
            // TODO: currently disabled since it creates a loop in rendering function. investigate
            //featuresColor = chroma.mix(featuresColor, feature.model.color || defaultClusterColor);
        });
        const clusterColor = allSelected ? chroma([255, 255, 0]) : someSelected ? chroma([255, 127, 0]) : chroma(defaultClusterColor);

        return {
            label: {
                text: `${features.length}`,
                visible: true,
                fillColor: chroma(getTextColorForBackground(clusterColor.hex())).gl()
            },
            point: {
                url: defaultClusterImage,
                scale: 0.1 + 0.05 * `${features.length}`.length,
                color: clusterColor.gl(),
                visible: true,
                zIndex: allSelected ? 1 : 0
            }
        };
    };

    return clusterStyler;
};

export type DatasetVectorFeatureProps<T extends VectorFeatureProperties = VectorFeatureProperties> = {
    id: string;
    geometry: Geometry;
    properties: T;
    color?: string;
    label?: string;
} & VisibleProps &
    SelectedProps &
    HoveredProps;

export class DatasetVectorFeature<T extends VectorFeatureProperties = VectorFeatureProperties>
    implements HasVisibility, IsSelectable, IsHoverable
{
    readonly id: string;
    readonly visible: Visible;
    readonly selected: Selected;
    readonly hovered: Hovered;
    readonly geometry: Geometry;
    readonly properties: T;
    @observable.ref color: string | undefined;
    @observable.ref label: string | undefined;

    constructor(props: DatasetVectorFeatureProps<T>) {
        this.id = props.id;
        this.visible = new Visible(props);
        this.selected = new Selected(props);
        this.hovered = new Hovered(props);
        this.geometry = props.geometry;
        this.properties = props.properties;
        this.color = props.color;
        this.label = props.label;

        makeObservable(this);
    }

    @action
    setColor(color: string | undefined) {
        this.color = color;
    }

    @action
    setLabel(label: string | undefined) {
        this.label = label;
    }
}

export const VECTOR_VIZ_TYPE = 'dataset_vector_viz';

/**
 * The vector data provider type.
 */
export type VectorDataProvider = (vectorViz: DatasetVectorMapViz) => Promise<DatasetVectorFeatureProps[]>;

export type VectorDataGenerator = Generator<Promise<DatasetVectorFeatureProps[]>, void, void>;
export type VectorDataGeneratorFactory = (vectorViz: DatasetVectorMapViz) => VectorDataGenerator;

const isDataGenerator = function <T>(type: Generator<Promise<T>> | Promise<T>): type is Generator<Promise<T>> {
    return typeof (type as Generator<Promise<T>>).next === 'function';
};

/**
 * The configuration for a {@link DatasetVectorMapViz | dataset vector map visualization}
 */
export type DatasetVectorMapVizConfig = {
    /**
     * The function called to retrieve the data. It is called wrapped in a mobx autorun so that every time one of
     * the {@link DatasetVectorMapViz} properties accessed by the provider changes, the function is called again to
     * retrieve the new data
     */
    dataProvider: VectorDataProvider | VectorDataGeneratorFactory;
    /**
     * The feature type descriptor. If provided it will be used for dynamica feature styling, filtering and feature information
     * display.
     */
    featureDescriptor?: VectorFeatureDescriptor | ((vectorViz: DatasetVectorMapViz) => Promise<VectorFeatureDescriptor>);
    /**
     * The color scales to be used for dynamic feature coloring
     */
    colorScales?: Array<
        ColorScale & {
            colors: string[];
        }
    >;
    /**
     * The style factory function. It receive the dataset color as input and shall returns a feature style function
     * used as input for the internal {@link FeatureLayer}.
     */
    featureStyleFactory?: (config: VectorFeatureStyleFactoryConfig) => FeatureStyleGetter<DatasetVectorFeature>;

    mapLayerOptions?: {
        clustering?: Partial<FeatureClusteringConfig<DatasetVectorFeature>>;
        labelProps?: string[];
        iconUrl?: string;
        optimizeSpeed?: boolean;
    };
    dimensions?: DatasetDimension<DimensionDomainType>[];
};

/**
 * The {@link DatasetVectorMapViz} constructor properties type
 */
export type DatasetVectorMapVizProps = Omit<
    DatasetVizProps<typeof VECTOR_VIZ_TYPE, DatasetVectorMapVizConfig>,
    'dimensions' | 'currentVariable' | 'initDimensions'
> & {
    /**
     * Optional {@link DatasetVectorMapViz.propertyFilters | DatasetVectorMapViz property filters} initialization
     */
    propertyFilters?: DataFiltersProps | DataFilters;
    colorProperty?: string;
    colorMap?: ColorMap | ColorMapProps;
    discreteColorMap?: DiscreteColorMap | DiscreteColorMapProps;
    labelProperties?: string[];
};

export class DatasetVectorMapViz extends DatasetViz<typeof VECTOR_VIZ_TYPE, FeatureLayer<DatasetVectorFeature>> {
    /** The visualization configuration */
    readonly config: DatasetVectorMapVizConfig;
    /** The feature descriptor */
    @observable.ref featureDescriptor: VectorFeatureDescriptor | undefined;
    /** The color map used for dynamic coloring */
    @observable.ref colorMap: ColorMap | undefined;
    /** The id of the feature property used for dynamic coloring */
    @observable.ref colorProperty: string | undefined;
    /** The color map used if the feature type is enum */
    @observable.ref discreteColorMap: DiscreteColorMap | undefined;
    /** The properties that will be shown by the label */
    @observable.ref labelProperties: string[] | undefined;
    /**
     * The property filters state. It is responsability of the {@link VectorDataProvider} to
     * filter the results based on the current filtering state
     */
    propertyFilters: DataFilters;
    /** The current feature array. Automatically filled from the {@link VectorDataProvider} response */
    protected data_: IObservableArray<DatasetVectorFeature>;
    /** The internal chroma scale used to update the {@link DatasetVectorFeature} color */
    @observable.ref protected chromaScale_: chroma.Scale | undefined;
    /** Internal subscriptions tracker */
    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: Omit<DatasetVectorMapVizProps, 'vizType'>) {
        super({
            ...props,
            dimensionValues: props.dimensionValues,
            dimensions: props.config.dimensions,
            initDimensions: true,
            vizType: VECTOR_VIZ_TYPE
        });

        this.config = props.config;

        this.colorProperty = props.colorProperty;
        if (props.colorMap) {
            this.colorMap = props.colorMap instanceof ColorMap ? props.colorMap : new ColorMap(props.colorMap);
        } else {
            this.colorMap = undefined;
        }
        if (props.discreteColorMap) {
            this.discreteColorMap =
                props.discreteColorMap instanceof DiscreteColorMap ? props.discreteColorMap : new DiscreteColorMap(props.discreteColorMap);
        } else {
            this.discreteColorMap = undefined;
        }
        this.chromaScale_ = undefined;

        this.propertyFilters =
            props.propertyFilters instanceof DataFilters ? props.propertyFilters : new DataFilters(props.propertyFilters);

        this.data_ = observable.array([], {
            deep: false
        });
        this.mapLayer.setSource(this.data_);

        if (typeof props.config.featureDescriptor !== 'function') {
            this.featureDescriptor = props.config.featureDescriptor;
        }
        this.labelProperties = props.labelProperties || props.config.mapLayerOptions?.labelProps;

        this.subscriptionTracker_ = new SubscriptionTracker();

        makeObservable(this);

        this.afterInit_();
    }

    /**
     * Set the feature property used for coloring.
     * @param propertyId the feature property id
     */
    @action
    setColorProperty(propertyId: string | undefined) {
        if (propertyId === this.colorProperty) {
            return;
        }
        if (propertyId) {
            const featureProperty = this.featureDescriptor?.properties.find((feature) => feature.id === propertyId);
            if (featureProperty && featureProperty.type === 'number') {
                if (!this.config.colorScales?.length) {
                    this.colorProperty = undefined;
                    return;
                }
                if (!this.colorMap) {
                    this.colorMap = new ColorMap({
                        colorScale: this.config.colorScales[0].id
                    });
                }
                this.colorMap.setColorMapDomain({
                    mapRange: {
                        min: featureProperty.domain?.min || 0,
                        max: featureProperty.domain?.max || 100
                    },
                    clamp: this.colorMap.domain?.clamp
                });
                this.colorProperty = propertyId;
            } else if (featureProperty && featureProperty.type === 'enum') {
                const randomColor = randomColorFactory();
                this.discreteColorMap = new DiscreteColorMap({
                    items: featureProperty.options.map((option) => {
                        return {
                            value: option.value.toString(),
                            color: option.color ? chroma(option.color).hex() : chroma(randomColor()).hex()
                        };
                    })
                });
                this.colorProperty = propertyId;
            } else {
                this.colorProperty = undefined;
            }
        } else {
            this.colorProperty = undefined;
        }
    }

    @action
    setLabelProperties(labelProperties: string[] | undefined) {
        this.labelProperties = labelProperties;
    }

    /** The currently selected features */
    @computed
    get selectedFeatures() {
        return this.data_.filter((feature) => feature.selected.value);
    }

    getSnapshot() {
        return {
            propertyFilters: {
                values: Object.fromEntries(this.propertyFilters.items.entries())
            },
            colorProperty: this.colorProperty,
            colorMap: this.colorMap?.getSnapshot(),
            discreteColorMap: this.discreteColorMap?.getSnapshot(),
            labelProperties: this.labelProperties,
            ...super.getSnapshot()
        };
    }

    dispose() {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
    }

    /** Automatically called when the color map scale is updated */
    @action
    protected updateChromaScale_() {
        const colorScaleConfig = this.config.colorScales?.find((scale) => scale.id === this.colorMap?.colorScale);
        if (colorScaleConfig) {
            this.chromaScale_ = chroma.scale(colorScaleConfig?.colors);
            if (colorScaleConfig?.positions) {
                this.chromaScale_.domain(colorScaleConfig.positions);
            }
        } else {
            this.chromaScale_ = undefined;
        }
    }

    /**
     * Update feature colors based on the current {@link DatasetVectorMapViz.colorMap}
     * and {@link DatasetVectorMapViz.colorProperty}
     */
    @action
    protected updateFeatureColors_() {
        const colorGetter = this.featureColorGetter;
        this.data_.forEach((feature) => feature.setColor(colorGetter(feature)));
    }

    /**
     * Update the label showed on the map based on the {@link DatasetVectorMapViz.labelProperties}
     */
    @action
    protected updateFeatureLabel_() {
        const labelGetter = this.featureLabelGetter;
        this.data_.forEach((feature) => feature.setLabel(labelGetter(feature)));
    }

    @computed
    protected get featureLabelGetter() {
        if (this.labelProperties) {
            const labelIds: Record<string, string> = {};
            this.featureDescriptor?.properties.forEach((property) => {
                labelIds[property.id] = property.name;
            });
            return (feature) => {
                return this.labelProperties!.map((label) => {
                    return `${labelIds[label]}: ${feature.properties[label]}`;
                }).join('\n');
            };
        } else {
            return (feature) => {
                return undefined;
            };
        }
    }

    /**
     * The function used to update the {@link DatasetVectorFeature}. Every time one of the observable dendencies of this
     * function is updated, the {@link DatasetVectorMapViz.updateFeatureColors_} function is automatically called
     */
    @computed
    protected get featureColorGetter() {
        const colorProperty = this.colorProperty
            ? this.featureDescriptor?.properties.find((property) => property.id === this.colorProperty)
            : undefined;

        const colorMapDomain = this.colorMap?.domain?.mapRange;
        const clamp = this.colorMap?.domain?.clamp;
        const chromaScale = this.chromaScale_;
        if (colorProperty && colorProperty.type === 'number' && colorMapDomain && chromaScale) {
            return (feature) => {
                let value: number = feature.properties[colorProperty.id];
                value = (value - colorMapDomain.min) / (colorMapDomain.max - colorMapDomain.min);
                if (!clamp && (value < 0 || value > 1)) {
                    return 'rgba(255, 255, 255, 0)';
                } else {
                    return chromaScale(value).hex();
                }
            };
        } else if (colorProperty && colorProperty.type === 'enum') {
            return (feature) => {
                return this.discreteColorMap?.mapItems[feature.properties[colorProperty.id]];
            };
        } else {
            return (feature) => {
                return undefined;
            };
        }
    }

    /**
     * Update the feature data. Automatically called when new data is retrieved from the {@link VectorDataProvider}
     * @param data the new feature array
     */
    @action
    protected setData_(data: DatasetVectorFeatureProps[], append?: boolean) {
        if (!this.featureDescriptor && data.length) {
            // infer the feature descriptor from data
            this.featureDescriptor = {
                properties: createPropertiesDescriptorFromFeatures(data.map((feature) => feature.properties))
            };
        }
        const colorGetter = this.featureColorGetter;
        const labelGetter = this.featureLabelGetter;

        const newData = data.map((props) => {
            return new DatasetVectorFeature({
                ...props,
                properties: exctractVectorFeaturePropertiesFromDescriptor(this.featureDescriptor!, props.properties),
                color: colorGetter(props),
                label: labelGetter(props)
            });
        });
        if (append) {
            this.data_.push(...newData);
        } else {
            this.data_.replace(newData);
        }
    }

    protected afterInit_() {
        let runningGenerator: VectorDataGenerator | undefined;
        let runningDataPromise: Promise<DatasetVectorFeatureProps[]> | undefined;

        const onDataError = (error) => {
            runInAction(() => {
                this.data_.clear();
                this.mapLayer.loadingStatus.update({
                    value: LoadingState.Error,
                    message: error.message
                });
            });
        };

        const dataUpdaterDisposer = autorun(
            () => {
                this.mapLayer.loadingStatus.setValue(LoadingState.Loading);
                runInAction(() => {
                    this.data_.clear();
                });

                // cancel any running promise
                if (runningDataPromise) {
                    if (runningDataPromise.cancel) {
                        runningDataPromise.cancel();
                    } else {
                        runningDataPromise.isCanceled = true;
                    }
                    runningDataPromise = undefined;
                }

                // stop any running generator
                if (runningGenerator) {
                    runningGenerator.return();
                }
                const dataRequest = this.config.dataProvider(this);

                if (isDataGenerator(dataRequest)) {
                    // retrieve data in batches until the generator completes
                    let next = dataRequest.next();
                    const handleNextValue = (data: DatasetVectorFeatureProps<VectorFeatureProperties>[]) => {
                        this.setData_(data, true);
                        next = dataRequest.next();
                        if (!next.done) {
                            runningDataPromise = next.value;
                            next.value.then(handleNextValue).catch(onDataError);
                        } else {
                            runningDataPromise = undefined;
                            runningGenerator = undefined;
                            this.mapLayer.loadingStatus.setValue(LoadingState.Success);
                        }
                    };

                    if (!next.done) {
                        runningGenerator = dataRequest;
                        runningDataPromise = next.value;
                        next.value.then(handleNextValue).catch(onDataError);
                    }
                } else {
                    dataRequest
                        .then((data) => {
                            this.setData_(data);
                            this.mapLayer.loadingStatus.setValue(LoadingState.Success);
                        })
                        .catch(onDataError);
                }
            },
            {
                delay: 500
            }
        );

        const chromaScaleUpdateDisposer = reaction(
            () => this.colorMap?.colorScale,
            () => {
                this.updateChromaScale_();
            },
            {
                fireImmediately: true
            }
        );

        const featureColorUpdateDisposer = reaction(
            () => this.featureColorGetter,
            () => {
                this.updateFeatureColors_();
            },
            {
                delay: 100
            }
        );

        const featureLabelUpdateDisposer = reaction(
            () => this.labelProperties,
            () => {
                this.updateFeatureLabel_();
            },
            {
                fireImmediately: true
            }
        );

        const enumColorUpdateDisposer = reaction(
            () => this.discreteColorMap?.mapItems,
            () => {
                const enumProp = this.featureDescriptor?.properties.find(
                    (feature) => feature.id === this.colorProperty
                ) as EnumFeaturePropertyDescriptor;
                if (this.discreteColorMap) {
                    // persist the selected colors in the enum configuration so that
                    // it is restored on property selection
                    enumProp.options.forEach((option) => {
                        option.color = this.discreteColorMap!.mapItems[option.value];
                    });
                }
                this.updateFeatureColors_();
            }
        );

        // enable dataset widget visibility when a feature is selected (i.e. display feature information)
        const widgetVisibilityDisposer = autorun(() => {
            if (this.selectedFeatures.length) {
                this.setWidgetVisible(true);
            } else {
                this.setWidgetVisible(false);
            }
        });

        this.subscriptionTracker_.addSubscription(dataUpdaterDisposer);
        this.subscriptionTracker_.addSubscription(chromaScaleUpdateDisposer);
        this.subscriptionTracker_.addSubscription(featureColorUpdateDisposer);
        this.subscriptionTracker_.addSubscription(widgetVisibilityDisposer);
        this.subscriptionTracker_.addSubscription(enumColorUpdateDisposer);
        this.subscriptionTracker_.addSubscription(featureLabelUpdateDisposer);

        const featureDescriptor = this.config.featureDescriptor;
        if (typeof featureDescriptor === 'function') {
            const featureDescriptorUpdater = autorun(() => {
                featureDescriptor(this).then((featureDescriptor) => {
                    this.featureDescriptor = featureDescriptor;
                });

                this.subscriptionTracker_.addSubscription(featureDescriptorUpdater);
            });
        }
    }

    protected initMapLayer_(props: DatasetVectorMapVizProps) {
        const clusteringConfig = props.config.mapLayerOptions?.clustering;
        const styleFactoryConfig: VectorFeatureStyleFactoryConfig = {
            color: this.dataset.config.color,
            pointIconUrl: props.config.mapLayerOptions?.iconUrl
        };

        return new FeatureLayer<DatasetVectorFeature>({
            id: `${this.id}_layer`,
            config: {
                geometryGetter: (feature) => feature.geometry,
                styleGetter: props.config.featureStyleFactory
                    ? props.config.featureStyleFactory(styleFactoryConfig)
                    : defaultVectoreFeatureStyleFactory(styleFactoryConfig),
                clustering: clusteringConfig?.enabled
                    ? {
                          enabled: true,
                          style: clusteringConfig.style || defaultClusterStyleFactory(styleFactoryConfig),
                          distance: clusteringConfig.distance
                      }
                    : undefined,
                rendererOptions: {
                    ol: {
                        useImageRenderer: props.config.mapLayerOptions?.optimizeSpeed
                    }
                }
            }
        });
    }
}
