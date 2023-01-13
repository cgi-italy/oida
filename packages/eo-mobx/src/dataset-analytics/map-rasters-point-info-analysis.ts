import { action, makeObservable, observable, reaction } from 'mobx';

import { SubscriptionTracker, MouseCoords, FeatureDrawMode } from '@oidajs/core';
import { ArrayTracker, FeatureDrawInteraction, MouseCoordsInteraction, SelectionManager } from '@oidajs/state-mobx';

import { DatasetToolConfig } from '../common';
import { DatasetExplorer, DatasetExplorerItem } from '../dataset-explorer';
import { DatasetRasterPointInfo, RASTER_POINT_INFO_PRCESSING } from './dataset-raster-point-info';
import { DatasetAnalysis } from './dataset-analysis';

export const MAP_RASTERS_POINT_INFO_ANALYSIS = 'map_rasters_point_info_analysis';

/**
 * The {@link MapRastersPointInfo} configuration
 */
export type MapRasterInfoProps = {
    id?: string;
    name: string;
    datasetExplorer: DatasetExplorer;
    mouseCoordsInteraction: MouseCoordsInteraction;
    /** If provided it will prevent info display to appear when map click occurs during an aoi drawing operation */
    featureDrawInteraction?: FeatureDrawInteraction;
    /** If provider it will prevent info display to appear when the map click is related to a feature select event */
    mapSelection?: SelectionManager;
};

/**
 * An analysis that collects the values of datasets currently on the map
 * every time the user clicks on a map location. A dataset shall have a
 * {@link DatasetRasterPointInfo} amongst its tools to be queried through this analysis.
 */
export class MapRastersPointInfo extends DatasetAnalysis<typeof MAP_RASTERS_POINT_INFO_ANALYSIS, DatasetRasterPointInfo> {
    @observable.ref location: MouseCoords | undefined;

    protected datasetExplorer_: DatasetExplorer;
    protected mouseCoordsInteraction_: MouseCoordsInteraction;
    protected featureDrawInteraction_: FeatureDrawInteraction | undefined;
    protected mapSelection_: SelectionManager | undefined;
    protected datasetsTracker_: ArrayTracker<DatasetExplorerItem, (() => void) | undefined>;
    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: MapRasterInfoProps) {
        super({
            ...props,
            type: MAP_RASTERS_POINT_INFO_ANALYSIS,
            destroyOnClose: false,
            visible: false
        });

        this.datasetExplorer_ = props.datasetExplorer;
        this.mouseCoordsInteraction_ = props.mouseCoordsInteraction;
        this.featureDrawInteraction_ = props.featureDrawInteraction;
        this.mapSelection_ = props.mapSelection;

        this.subscriptionTracker_ = new SubscriptionTracker();

        this.datasetsTracker_ = new ArrayTracker({
            idGetter: (item) => item.dataset.id,
            items: this.datasetExplorer_.items,
            onItemAdd: (item, idx) => {
                //check if the dataset provides a DatasetRasterPointInfo tool
                const rasterInfoTool = item.dataset.config.tools?.find(
                    (tool) => tool.type === RASTER_POINT_INFO_PRCESSING
                ) as DatasetToolConfig<typeof RASTER_POINT_INFO_PRCESSING>;
                if (rasterInfoTool) {
                    //create an instance of the point info tool and add it to the
                    //combo analyses
                    const rasterPointInfo = new DatasetRasterPointInfo({
                        dataset: item.dataset,
                        parent: item.mapViz,
                        trackParentViz: true,
                        config: rasterInfoTool.config,
                        color: 'white',
                        aoi:
                            this.visible.value && this.location
                                ? {
                                      geometry: {
                                          type: 'Point',
                                          coordinates: [this.location.lon, this.location.lat]
                                      }
                                  }
                                : undefined
                    });

                    this.addProcessing(rasterPointInfo, idx);

                    return () => {
                        this.removeProcessing(rasterPointInfo);
                    };
                }
                return undefined;
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

    addProcessing(processing: DatasetRasterPointInfo, idx?: number) {
        if (!this.processings.length) {
            processing.visible.setValue(this.visible.value);
        } else {
            processing.visible.setValue(false);
        }
        super.addProcessing(processing, idx);
    }

    removeProcessing(processing: DatasetRasterPointInfo) {
        super.removeProcessing(processing);
        if (!this.processings.length) {
            this.visible.setValue(false);
        } else {
            this.processings[0].visible.setValue(this.visible.value);
        }
    }

    @action
    setLocation(location: MouseCoords | undefined) {
        this.location = location;

        this.processings.forEach((processing, idx) => {
            if (location) {
                processing.setAoi({
                    geometry: {
                        type: 'Point',
                        coordinates: [location.lon, location.lat]
                    }
                });
            } else {
                processing.setAoi(undefined);
            }
            // all analysis have the same location. show only the geometry of the first analysis on the map
            processing.visible.setValue(idx === 0);
        });
        if (location && this.processings.length) {
            this.visible.setValue(true);
        } else {
            this.visible.setValue(false);
        }
    }

    getSnapshot() {
        return {
            ...super.getSnapshot(),
            location: this.location
        };
    }

    applySnapshot(snapshot) {
        this.setLocation(snapshot.location);
    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
        this.datasetsTracker_.destroy();
    }

    protected afterInit_() {
        let isDrawing = false;

        const drawModeTrackerDisposer = reaction(
            () => this.featureDrawInteraction_?.drawMode,
            (drawMode) => {
                if (drawMode && drawMode !== FeatureDrawMode.Off) {
                    isDrawing = true;
                }
            }
        );

        let mapFeatureSelected = false;
        const selectionTrackerDisposer = reaction(
            () => this.mapSelection_?.selection.items.length,
            (numSelected) => {
                if (numSelected) {
                    mapFeatureSelected = true;
                }
            }
        );

        const clickTrackerDisposer = reaction(
            () => this.mouseCoordsInteraction_.lastClickCoords,
            (coords) => {
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
            }
        );

        const visibleTrackerDisposer = reaction(
            () => this.visible.value,
            (visible) => {
                if (!visible) {
                    this.setLocation(undefined);
                }
            }
        );

        this.subscriptionTracker_.addSubscription(clickTrackerDisposer);
        this.subscriptionTracker_.addSubscription(visibleTrackerDisposer);
        this.subscriptionTracker_.addSubscription(drawModeTrackerDisposer);
        this.subscriptionTracker_.addSubscription(selectionTrackerDisposer);
    }
}
