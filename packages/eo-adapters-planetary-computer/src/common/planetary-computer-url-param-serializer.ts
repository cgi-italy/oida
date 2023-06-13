export const PlanetaryComputerUrlParamSerializer = (params) => {
    const urlParams: string[] = [];
    for (const key in params) {
        if (Array.isArray(params[key])) {
            params[key].forEach((param) => {
                urlParams.push(`${key}=${encodeURIComponent(param)}`);
            });
        } else {
            if (params[key] !== undefined) {
                urlParams.push(`${key}=${encodeURIComponent(params[key])}`);
            }
        }
    }
    return urlParams.join('&');
};
