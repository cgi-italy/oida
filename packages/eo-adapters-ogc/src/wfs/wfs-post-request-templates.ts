export const WFS_TEMPLATE_FEATURE_TYPENAME_PLACEHOLDER = '__FEATURE_TYPENAME__';
export const WFS_PROPERTY_NAMES_PLACEHOLDER = '__PROPERTY_NAMES_';
export const WFS_TEMPLATE_FILTERS_PLACEHOLDER = '__FES_FILTERS__';
export const WFS_TEMPLATE_OUTPUT_FORMAT_PLACEHOLDER = '__OUTPUT_FORMAT__';
export const WFS_TEMPLATE_OFFSET_ATTR_PLACEHOLDER = '__OFFSET_ATTR__';
export const WFS_TEMPLATE_OFFSET_VALUE_PLACEHOLDER = '__OFFSET_VALUE__';
export const WFS_TEMPLATE_COUNT_ATTR_PLACEHOLDER = '__COUNT_ATTR__';
export const WFS_TEMPLATE_COUNT_VALUE_PLACEHOLDER = '__COUNT_VALUE__';
export const WFS_TEMPLATE_SRSNAME_ATTR_PLACEHOLDER = '__SRSNAME_ATTR__';
export const WFS_TEMPLATE_SRSNAME_VALUE_PLACEHOLDER = '__SRSNAME_VALUE__';
export const WFS_TEMPLATE_SORT_CLAUSE_PLACEHOLDER = '__SORT_CLAUSE__';
export const WFS_TEMPLATE_SORT_BY_PLACEHOLDER = '__SORT_BY__';
export const WFS_TEMPLATE_SORT_ORDER_PLACEHOLDER = '__SORT_ORDER__';

export const WfsSortByClauseTemplate = `
    <fes:SortBy xmlns:fes="http://www.opengis.net/fes/2.0">
        <fes:SortProperty>
            <fes:ValueReference>${WFS_TEMPLATE_SORT_BY_PLACEHOLDER}</fes:ValueReference>
            <fes:SortOrder>${WFS_TEMPLATE_SORT_ORDER_PLACEHOLDER}</fes:SortOrder>
        </fes:SortProperty>
    </fes:SortBy>
`;
export const WfsOffsetAttributeTemplate = `startIndex="${WFS_TEMPLATE_OFFSET_VALUE_PLACEHOLDER}"`;
export const WfsCountAttributeTemplate = `count="${WFS_TEMPLATE_COUNT_VALUE_PLACEHOLDER}"`;
export const WfsSrsNameAttributeTemplate = `srsName="${WFS_TEMPLATE_SRSNAME_VALUE_PLACEHOLDER}"`;

export const WfsGetFeaturesRequestTemplate = `
<wfs:GetFeature 
    service="WFS"
    version="2.0.0"
    ${WFS_TEMPLATE_OFFSET_ATTR_PLACEHOLDER}
    ${WFS_TEMPLATE_COUNT_ATTR_PLACEHOLDER}
    outputFormat="${WFS_TEMPLATE_OUTPUT_FORMAT_PLACEHOLDER}"
    xmlns:wfs="http://www.opengis.net/wfs/2.0"
>
  <wfs:Query
    typeNames="${WFS_TEMPLATE_FEATURE_TYPENAME_PLACEHOLDER}"
    ${WFS_TEMPLATE_SRSNAME_ATTR_PLACEHOLDER}
  >
    ${WFS_PROPERTY_NAMES_PLACEHOLDER}
    ${WFS_TEMPLATE_FILTERS_PLACEHOLDER}
    ${WFS_TEMPLATE_SORT_CLAUSE_PLACEHOLDER}
  </wfs:Query>
</wfs:GetFeature>
`;
