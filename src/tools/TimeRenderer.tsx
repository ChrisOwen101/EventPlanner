export const renderStartEndTime = (start: moment.Moment, end: moment.Moment) => {
    const startFormat = start.year() === end.year() ? 'Do MMM' : 'Do MMM YYYY'
    const endFormat = 'Do MMM YYYY'
    return `${start.format(startFormat)} - ${end.format(endFormat)}`
}
