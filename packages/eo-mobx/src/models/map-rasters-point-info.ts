import { action, makeObservable, observable, reaction } from 'mobx';

import { SubscriptionTracker, MouseCoords, FeatureDrawMode } from '@oida/core';
import { ArrayTracker, FeatureDrawInteraction, MouseCoordsInteraction, SelectionManager } from '@oida/state-mobx';

import { ComboAnalysis } from './combo-analysis';
import { DatasetExplorer, DatasetExplorerItem } from './dataset-explorer';
import { DatasetRasterPointInfo, RASTER_POINT_INFO_TYPE } from './dataset-raster-point-info';
import { DatasetToolConfig } from '../types/dataset-tool-config';


export const MAP_RASTERS_POINT_INFO = 'map_rasters_point_info';

/**
 * The {@link MapRastersPointInfo} configuration
 */
export type MapRasterInfoProps = {
    name: string;
    datasetExplorer: DatasetExplorer;
    mouseCoordsInteraction: MouseCoordsInteraction;
    /**If provided it will prevent info display to appear when map click occurs during an aoi drawing operation */
    featureDrawInteraction?: FeatureDrawInteraction;
    /**If provider it will prevent info display to appear when the map click is related to a feature select event */
    mapSelection?: SelectionManager;
};

/**
 * A combined analysis that collects the values of datasets currently on the map
 * every time the user clicks on a map location. A dataset shall have a
 * {@link DatasetRasterPointInfo} amongst its tools to be queried through this analysis.
 * Once instantiated it is automatically added to {@link DatasetExplorer.analyses}
 */
export class MapRastersPointInfo extends ComboAnalysis<DatasetRasterPointInfo> {

    @observable.ref location: MouseCoords | undefined;

    protected datasetExplorer_: DatasetExplorer;
    protected mouseCoordsInteraction_: MouseCoordsInteraction;
    protected featureDrawInteraction_: FeatureDrawInteraction | undefined;
    protected mapSelection_: SelectionManager | undefined;
    protected datasetsTracker_: ArrayTracker<DatasetExplorerItem, (() => void) | void>;
    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: MapRasterInfoProps) {
        super({
            ...props,
            type: MAP_RASTERS_POINT_INFO,
            destroyOnClose: false,
            visible: false,
            parent: props.datasetExplorer.analyses
        });

        this.datasetExplorer_ = props.datasetExplorer;
        this.mouseCoordsInteraction_ = props.mouseCoordsInteraction;
        this.featureDrawInteraction_ = props.featureDrawInteraction;
        this.mapSelection_ = props.mapSelection;

        this.subscriptionTracker_ = new SubscriptionTracker();
        this.datasetExplorer_.analyses.addComboAnalysis(this);

        this.datasetsTracker_ = new ArrayTracker({
            idGetter: (item) => item.dataset.id,
            items: this.datasetExplorer_.items,
            onItemAdd: (item, idx) => {
                //check if the dataset provides a DatasetRasterPointInfo tool
                const rasterInfoTool = item.dataset.config.tools?.find(
                    (tool) => tool.type === RASTER_POINT_INFO_TYPE
                ) as DatasetToolConfig<typeof RASTER_POINT_INFO_TYPE>;
                if (rasterInfoTool) {
                    //create an instance of the point info tool and add it to the
                    //combo analyses
                    const rasterPointInfo = new DatasetRasterPointInfo({
                        dataset: item.dataset,
                        parent: item.mapViz,
                        trackParentViz: true,
                        config: rasterInfoTool.config,
                        color: 'white',
                        aoi: (this.visible.value && this.location) ? {
                            geometry: {
                                type: 'Point',
                                coordinates: [this.location.lon, this.location.lat]
                            }
                        } : undefined
                    });

                    this.addAnalysis(rasterPointInfo, idx);

                    return () => {
                        this.removeAnalysis(rasterPointInfo);
                    };
                }
            },
            onItemRemove: (disposer) => {
                if (disposer) {
                    disposer();
                }
            }
        });

        makeObservable(this);

        this.afterInit_();
    }

    addAnalysis(analysis: DatasetRasterPointInfo, idx?: number) {
        this.parent_.addAnalysis(analysis);
        if (!this.analyses.length) {
            analysis.visible.setValue(this.visible.value);
        } else {
            analysis.visible.setValue(false);
        }
        if (idx !== undefined && idx < this.analyses.length) {
            this.analyses.splice(idx, 0, analysis);
        } else {
            this.analyses.push(analysis);
        }
    }

    removeAnalysis(analysis: DatasetRasterPointInfo) {
        this.parent_.removeAnalysis(analysis);
        this.analyses.remove(analysis);
        if (!this.analyses.length) {
            this.visible.setValue(false);
        } else {
            this.analyses[0].visible.setValue(this.visible.value);
        }
    }

    @action
    setLocation(location: MouseCoords | undefined) {
        this.location = location;

        this.analyses.forEach((analysis, idx) => {
            if (location) {
                analysis.setAoi({
                    geometry: {
                        type: 'Point',
                        coordinates: [location.lon, location.lat]
                    }
                });
            } else {
                analysis.setAoi(undefined);
            }
            // all analysis have the same location. show only the geometry of the first analysis on the map
            analysis.visible.setValue(idx === 0);
        });
        if (location && this.analyses.length) {
            this.visible.setValue(true);
        } else {
            this.visible.setValue(false);
        }
    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
        this.datasetsTracker_.destroy();
    }

    protected afterInit_() {

        let isDrawing = false;

        const drawModeTrackerDisposer = reaction(() => this.featureDrawInteraction_?.drawMode, (drawMode) => {
            if (drawMode && drawMode !== FeatureDrawMode.Off) {
                isDrawing = true;
            }
        });

        let mapFeatureSelected = false;
        const selectionTrackerDisposer = reaction(() => this.mapSelection_?.selection.items.length, (numSelected) => {
            if (numSelected) {
                mapFeatureSelected = true;
            }
        });

        const clickTrackerDisposer = reaction(() => this.mouseCoordsInteraction_.lastClickCoords, (coords) => {
            // do not update the location if there is a feature selected on the map (the user clicked on a vector feature)
            // or when drawing aois
            if (!mapFeatureSelected && !isDrawing) {
                this.setLocation(coords);
            }

            // check if the drawing tool is still enabled
            const drawMode = this.featureDrawInteraction_?.drawMode || FeatureDrawMode.Off;
            if (drawMode === FeatureDrawMode.Off) {
                isDrawing = false;
            }

            // check for feature selection
            mapFeatureSelected = this.mapSelection_?.selection.items.length ? true : false;
        });

        const visibleTrackerDisposer = reaction(() => this.visible.value, (visible) => {
            if (!visible) {
                this.setLocation(undefined);
            }
        });

        this.subscriptionTracker_.addSubscription(clickTrackerDisposer);
        this.subscriptionTracker_.addSubscription(visibleTrackerDisposer);
        this.subscriptionTracker_.addSubscription(drawModeTrackerDisposer);
        this.subscriptionTracker_.addSubscription(selectionTrackerDisposer);
    }

}
