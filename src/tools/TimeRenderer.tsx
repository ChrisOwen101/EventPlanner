

import moment from 'moment'

export const renderStartEndTime = (startString: string, endString: string) => {
    const start = moment(startString)
    const end = moment(endString)

    const startFormat = start.year() === end.year() ? 'Do MMM' : 'Do MMM YYYY'
    const endFormat = 'Do MMM YYYY'
    return `${start.format(startFormat)} - ${end.format(endFormat)}`
}
