import { IModelType, IAnyModelType } from 'mobx-state-tree';

//export internal mobx-state-tree model type utils
export type ExtractPropsFromModel<T extends IAnyModelType> = T extends IModelType<infer P, any, any, any> ? P : never;
export type ExtractOthersFromModel<T extends IAnyModelType> = T extends IModelType<any, infer O, any, any> ? O : never;
