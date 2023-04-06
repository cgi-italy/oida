export const extractWCSParamsFromLink = (link: string) => {
    const [url, paramsStr] = link.split('?');

    const params = paramsStr.split('&').reduce((acc, param) => {
        const [key, value] = param.split('=');

        const currentKeyValue = acc[key.toLowerCase()];
        if (currentKeyValue) {
            const newKeyValue = Array.isArray(currentKeyValue) ? currentKeyValue : [currentKeyValue];
            return {
                ...acc,
                [key.toLowerCase()]: [...newKeyValue, decodeURIComponent(value)]
            };
        } else {
            return {
                ...acc,
                [key.toLowerCase()]: decodeURIComponent(value)
            };
        }
    }, {} as { [x: string]: string | string[] });

    const { service, version, request, coverageid, subdataset, subset, scale, format, ...parameters } = params;

    return { url, service, version, request, coverageId: coverageid, subdataset, scale, format, subset, parameters };
};
