export const isValidExtent = (extent: any) => {
    if (!Array.isArray(extent)) {
        return false;
    }
    if (extent.length !== 4) {
        return false;
    }
    if (!Number.isFinite(extent[0]) || !Number.isFinite(extent[1]) || !Number.isFinite(extent[2]) || !Number.isFinite(extent[3])) {
        return false;
    }
    if (extent[0] > extent[2] || extent[1] > extent[3]) {
        return false;
    }

    return true;
};
