export const AdamServiceParamsSerializer = (params) => {
    let urlParams: string[] = [];
    for (let key in params) {
        if (Array.isArray(params[key])) {
            params[key].forEach((param) => {
                urlParams.push(`${key}=${param}`);
            });
        } else {
            if (params[key] !== undefined) {
                urlParams.push(`${key}=${params[key]}`);
            }
        }
    }
    return urlParams.join('&');
};
