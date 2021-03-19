import { IObservableArray, observable, action, makeObservable, ObservableMap } from 'mobx';
import chroma from 'chroma-js';

import { IFeatureStyle } from '@oida/core';
import { FeatureLayer, FeatureStyleGetter } from '@oida/state-mobx';

import { ComboAnalysis, generateComboAnalysisName } from './combo-analysis';
import { DatasetAnalysis } from './dataset-analysis';

const placeHolderIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAuJAAALiQE3ycutAAAAB3RJTUUH5AEcFScmdItkoAAABF9JREFUeNrt3c1rFVcYx/HfEwULUlOJt7ShKilaKA3SQqmgFLusSnFjESG+/QOFuCwICnGhCzfuuuq+a7PooosiWN+K76VvCTR1YyIa3cRuni4ywiWKnpk75945Z76fjYmezHNynmfOzLn33NGUKXeXmT3/eq+kzyV9JOlDSe9JWrPiR55J+lfSb5LuSvrJzH5ceSykUwD73H3aezft7nsY0QTO+OLPA+4+7/V74O4HumOhQcl392F3v+bxXStiMfANKoAvvP92MfLNSP4xH5wJMjDY5O/2wdud8hhaoomXpC2S/qzw408l/SDphqRHxd+tl/SxpK8lvVnhmFsl/cVSsb9FsFjyTL3i7jtXrhpe8vXOom0Zi2Skv8k/UzJB+0OXb13Lyf0lY5whM/1Z7nVKJGXJ3Ud7iDdaHCNUh+Vh/CL4vkRCRt3deohl7r65RLzvyFD8Agh1uMaYh0ODkqG40//RwDzcjhD/78DYR6mDeEVwMXRtXmcSiuL7KjD2RV4HiDj9B/1SkRbkg44fw1BCyf80sOl0xG5M19xXCiB0Cpa0I7D5rxG7cj2w3Y5U7gOSKIBiRh0PbH4/YlfmA9uNp3IVSOYSIOmDwHZrI/Zhbc19pQBK2BDY7t2IfRgJbDdMAdTvncB2n0Tsw/bAdptYBtZ/I7gQegYOehko6aGZbWAGGFBf3f1IhOQfyXRck5kBfi6zgzdC/Acl4v/CPUD97pRo23H3qRqTPyWpE+H1AgQmQO4+MYj9ehX3HU7whlD9RTDS702b7v5lxZgjZCxOEcxWTMi5CrHOVYw1S6biFcDpHrZvL7n7pLuvWnFp6T7+qqLNUg9xTqc0pqm9HdyRVMcd/h9a3hb+/MZyXMvbwut4CfdtM5unAOIVwWVJnzW0e1fMbHtK4zmUWPIl6WyDu3g2tbv/VD8ZtKQXH/AwaP+Z2ZrUxjLVlyynGtinEykOZLIfZmvaFmxL9IOBKb9pcYq+tHgGaNIsYAl/LDj1ty1P0YcWzwBNmAUs8YcC5LBx4ZuWxmYG6JoF5hW+abQuC2bWSX3sctm6dKwlMfGKWeBqHx8MdTWXccvlEiBJGyX906eQmyTN5fBQqCwuAWYmM5uTdL4P4c6b2VwuTwTL7rlmkd8oemZmb+Q0XkOZJV+SDkUMcYjNnmkUwqUIN36XchyrHC8B0vJHyBZqPvSwpCe5PQ00u48wFTeEDyUdr/Gwx83sCY+CTW82mKlh6v895zGyjJMvSWOSZno81PuSZjn70y2Ekz2c/ScZwfZeCmYYuUwuBe4+VqEAxljz51UIkyWSP8mI5VkE9wKSf7NNY2ItSr4krZP0uv/d4y1Ji9z151sIB19x9h9khNpRBBdekvwLjEx7LgVy98ddyX/c/W9ox9JwW1cBbGtr8le38ZcubvBuufu3xfe3OC0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBV/wM1KMOVyuaRJwAAAABJRU5ErkJggg==';

const defaultAnalysisStyleGetter = (analysis: DatasetAnalysis<any>): IFeatureStyle => {

    let color = chroma(analysis.color);
    if (analysis.selected.value) {
        color = color.alpha(0.3);
    } else {
        color = color.alpha(0.1);
    }

    let zIndex = 0;
    if (analysis.selected.value) {
        zIndex = 1;
    }
    if (analysis.hovered.value) {
        zIndex = 2;
    }

    return {
        point: {
            visible: analysis.visible.value,
            url: placeHolderIcon,
            scale: 0.5,
            color: color.alpha(1).gl(),
            zIndex: zIndex
        },
        line: {
            visible: analysis.visible.value,
            color: color.alpha(1).gl(),
            width: analysis.hovered.value ? 3 : 2,
            zIndex: zIndex
        },
        polygon: {
            visible: analysis.visible.value,
            fillColor: color.gl(),
            strokeColor: color.alpha(1).gl(),
            strokeWidth: analysis.hovered ? 3 : 2,
            zIndex: zIndex
        }
    };
};

export type DatasetAnalysesProps = {
    analysisGeometryStyle?: FeatureStyleGetter<DatasetAnalysis<any>>
    active?: boolean;
};

export class DatasetAnalyses {

    @observable.ref active: boolean;
    geometryLayer: FeatureLayer<DatasetAnalysis<any>>;
    analyses: ObservableMap<string, ComboAnalysis>;
    protected items_: IObservableArray<DatasetAnalysis<any>>;

    constructor(props?: DatasetAnalysesProps) {

        this.active = props?.active || false;

        this.items_ = observable.array([], {
            deep: false
        });

        this.analyses = observable.map([], {
            deep: false
        });

        this.geometryLayer = new FeatureLayer({
            id: 'analysis-geometry',
            source: this.items_,
            config: {
                geometryGetter: (analysis => analysis.geometry),
                styleGetter: props?.analysisGeometryStyle || defaultAnalysisStyleGetter,
                onFeatureHover: (feature, coord) => {
                    feature.onGeometryHover(coord);
                }
            }
        });

        makeObservable(this);
    }

    @action
    setActive(active: boolean) {
        this.active = active;
    }

    @action
    addAnalysis(analysis: DatasetAnalysis<any>, parent: ComboAnalysis, idx?: number) {
        if (!this.analyses.has(parent.id)) {
            this.analyses.set(parent.id, parent);
        }

        if (this.items_.indexOf(analysis) === -1) {
            this.items_.push(analysis);
        }

        if (typeof(idx) === 'number' && idx < parent.analyses.length) {
            parent.analyses.splice(idx, 0, analysis);
        } else {
            parent.analyses.push(analysis);
        }
    }

    @action
    removeAnalysis(analysis: DatasetAnalysis<any>, parent: ComboAnalysis) {
        this.items_.remove(analysis);
        parent.analyses.remove(analysis);
        if (!parent.analyses.length) {
            this.analyses.delete(parent.id);
        }
        analysis.dispose();
    }

    @action
    removeComboAnalysis(analysis: ComboAnalysis) {
        analysis.analyses.forEach(analysis => {
            this.items_.remove(analysis);
            analysis.dispose();
        });
        this.analyses.delete(analysis.id);
    }

    @action
    moveAnalysis(analysis: DatasetAnalysis<any>, options: {source: ComboAnalysis, target?: ComboAnalysis, idx?: number}) {
        let target = options.target;
        if (!target) {
            target = new ComboAnalysis({
                parent: this,
                name: generateComboAnalysisName(options.source.type),
                type: options.source.type
            });
        }

        options.source.analyses.remove(analysis);
        if (!options.source.analyses.length) {
            this.analyses.delete(options.source.id);
        }
        this.addAnalysis(analysis, target, options.idx);
    }
}
