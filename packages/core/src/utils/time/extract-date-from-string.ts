import moment from 'moment';

export const extractDateFromString = (inputString: string) => {
    const dateRegex = /(\d{4})[^\d]?(\d{2})[^\d]?(\d{2})[^\d]?(\d{2})?[^\d]?(\d{2})?[^\d]?(\d{2})?/;

    const matches = inputString.match(dateRegex);
    if (matches) {
        const dateElements = matches.slice(1, 7);
        const dt = moment.utc({
            year: parseInt(dateElements[0]),
            month: parseInt(dateElements[1]) - 1,
            day: parseInt(dateElements[2]),
            hours: parseInt(dateElements[3] || '0'),
            minutes: parseInt(dateElements[4] || '0'),
            seconds: parseInt(dateElements[5] || '0')
        });
        if (dt.isValid()) {
            return dt.toDate();
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
};
