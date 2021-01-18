import { formFieldRendererFactory, setDefaultFormFieldRendererFactory } from '@oida/ui-react-core';

export const antdFormFieldRendererFactory = formFieldRendererFactory();

setDefaultFormFieldRendererFactory(antdFormFieldRendererFactory);
