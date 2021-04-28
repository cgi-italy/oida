/**
 * Given a file url return the container directory location
 * @param fileUrl The file url
 */
export const getFileLocation = (fileUrl: string) => {
    return fileUrl.replace(/\/[^\/]+$/, '');
};

/**
 * Test if a url is absolute (a full url or a path starting with a /)
 * @param url: the url to test
 */
export const isAbsoluteUrl = (url: string) => {
    return /^([a-z]+:\/)?\//.test(url);
};

/**
 * Get the full url for a path (relative or absolute) starting from a file url
 * If the url is absolute it will be returned as it is. Otherwise the full url
 * will be computed starting from the file location
 * @param url a relative or absolute url
 * @param fileUrl the file url used as the reference location to resolve relative urls
 */
export const getFullUrlStartingFromFile = (url, fileUrl) => {
    if (isAbsoluteUrl(url)) {
        return url;
    } else {
        return `${getFileLocation(fileUrl)}/${url}`;
    }
};

export type UrlParamsSerializerOptions = {
    arrayExpandMode?: 'repeat'
};

/**
 * Serialize a set of string parameters into a query string
 * @param params The parameters object to serialize
 * @param options The serialization options
 * @returns the serialized query string
 */
export const urlParamsSerializer = (params: Record<string, string | string[]>, options?: UrlParamsSerializerOptions) => {
    let urlParams: string[] = [];
    for (let key in params) {
        const value = params[key];
        if (Array.isArray(value)) {
            value.forEach((param) => {
                urlParams.push(`${key}=${param}`);
            });
        } else {
            if (value !== undefined) {
                urlParams.push(`${key}=${value}`);
            }
        }
    }
    return urlParams.join('&');
};
