import moment from 'moment';

export const getXmlNodeValue = <T>(node: Element, parser: (value: string) => T) => {
    try {
        const value = node.childNodes[0].nodeValue;
        if (value) {
            return parser(value);
        }
    } catch (e) {
        return undefined;
    }
};

export const getXmlStringNodeValue = (node: Element) => {
    return getXmlNodeValue(node, (value) => value);
};

export const getXmlIntNodeValue = (node: Element) => {
    return getXmlNodeValue(node, (value) => parseInt(value));
};

export const getXmlFloatNodeValue = (node: Element) => {
    return getXmlNodeValue(node, (value) => parseFloat(value));
};

export const getXmlDateNodeValue = (node: Element) => {
    return getXmlNodeValue(node, (value) => moment.utc(value).toDate());
};
