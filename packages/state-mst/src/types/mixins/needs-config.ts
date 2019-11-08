import { types } from 'mobx-state-tree';

export const needsConfig = <CONFIG>() => types.model(
    'needsConfig', {}
)
.volatile((self) => (
    {
        config: undefined as unknown as CONFIG
    }
))
.actions((self) => (
    {
        init: (config: CONFIG) => {
            self.config = config;
        },
        afterAttach: () => {
            if (!self.config) {
                throw new Error('No config specified for node');
            }
        }
    }
));
