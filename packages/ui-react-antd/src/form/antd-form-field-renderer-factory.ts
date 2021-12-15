import { formFieldRendererFactory, setDefaultFormFieldRendererFactory } from '@oidajs/ui-react-core';

export const antdFormFieldRendererFactory = formFieldRendererFactory();

setDefaultFormFieldRendererFactory(antdFormFieldRendererFactory);
