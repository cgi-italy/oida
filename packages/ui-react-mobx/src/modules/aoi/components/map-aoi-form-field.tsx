import React, { useEffect, useMemo } from 'react';
import { useLocalObservable } from 'mobx-react';

import { getAoiFieldFactory, AoiFieldFactoryProps, AoiValue, AoiField } from '@oidajs/core';
import { FormFieldRendererFactory, getDefaultFormFieldRendererFactory, AoiImportConfig } from '@oidajs/ui-react-core';

import { useAoiModule } from '../hooks';
import { bindAoiValueToMap } from '../utils/bind-aoi-value-to-map';
import { useSelector } from '../../../core/hooks/use-selector';

export type MapAoiFormFieldProps = AoiFieldFactoryProps & {
    fieldRendererFactory?: FormFieldRendererFactory;
    aoiModuleId?: string;
    value?: AoiValue;
    onChange?: (value: AoiValue | undefined) => void;
};

export const MapAoiFormField = (props: MapAoiFormFieldProps) => {
    const aoi = useLocalObservable(() => ({
        value: props.value,
        setValue(value) {
            this.value = value;
        }
    }));

    const aoiFieldFactory = getAoiFieldFactory();
    const aoiFieldConfig = useMemo(() => {
        return aoiFieldFactory(props);
    }, []);

    const formFieldRendererFactory = props.fieldRendererFactory || getDefaultFormFieldRendererFactory();

    // NB: without the memo the AoiField is recreated every time the dom tree is updated
    const AoiField = useMemo(() => {
        return formFieldRendererFactory.getRenderer<AoiField<AoiImportConfig>>(aoiFieldConfig)?.FormFieldRenderer;
    }, []);

    const aoiModule = useAoiModule(props.aoiModuleId);

    useEffect(() => {
        const filterMapBindingDisposer = bindAoiValueToMap({
            aois: aoiModule.aois,
            getter: () => aoi.value,
            setter: (value) => aoi.setValue(value),
            map: aoiModule.mapModule.map
        });

        return () => {
            filterMapBindingDisposer();
        };
    }, []);

    const aoiValue = useSelector(() => aoi.value);

    if (!AoiField) {
        return null;
    }

    return (
        <AoiField
            value={aoiValue}
            onChange={(value) => {
                aoi.setValue(value);
                if (props.onChange) {
                    props.onChange(value);
                }
            }}
            {...aoiFieldConfig}
            {...props.rendererConfig?.props}
        />
    );
};
