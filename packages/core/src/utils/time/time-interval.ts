import moment from 'moment';

export class TimeInterval {
    private start_: moment.Moment;
    private end_: moment.Moment;

    constructor(start: moment.MomentInput, end: moment.MomentInput) {
        start = moment.utc(start);
        end = moment.utc(end);

        if (!start.isValid()) {
            throw new Error('TimeInterval: Invalid start date');
        }

        if (!end.isValid()) {
            throw new Error('TimeInterval: Invalid end date');
        }

        if (start.isAfter(end)) {
            throw new Error('TimeInterval: Start date cannot be greater than end date');
        }

        this.start_ = start;
        this.end_ = end;
    }

    get start() {
        return moment.utc(this.start_);
    }

    get end() {
        return moment.utc(this.end_);
    }

    setStart(start: moment.MomentInput) {
        start = moment.utc(start);

        if (!start.isValid()) {
            throw new Error('TimeInterval: Invalid date');
        }
        if (start.isAfter(this.end_)) {
            throw new Error('TimeInterval: Start date cannot be greater than end date');
        }
        this.start_ = start;
    }

    setEnd(end: moment.MomentInput) {
        end = moment.utc(end);

        if (!end.isValid()) {
            throw new Error('TimeInterval: Invalid date');
        }
        if (this.start_.isAfter(end)) {
            throw new Error('TimeInterval: Start date cannot be greater than end date');
        }

        this.end_ = end;
    }

    toISOString() {
        return `${this.start.toISOString()}/${this.end.toISOString()}`;
    }
}
