export const cartesianProduct = <T>(...items: T[][]): T[][] => {
    return items.reduce<T[][]>(
        (results, entries) =>
            results
                .map((result) => entries.map((entry) => [...result, entry]))
                .reduce((subResults, result) => [...subResults, ...result], []),
        [[]]
    );
};
