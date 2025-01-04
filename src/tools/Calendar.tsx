import moment from 'moment'

export const generateGoogleCalendarUrl = (
    title: string,
    description: string,
    location: string,
    start: moment.Moment,
    end: moment.Moment
): string => {
    const formatDate = (date: moment.Moment) => date.utc().format('YYYYMMDDTHHmmss[Z]')

    const startTime = formatDate(start)
    const endTime = formatDate(end)

    const url = new URL('https://www.google.com/calendar/render')
    url.searchParams.append('action', 'TEMPLATE')
    url.searchParams.append('text', title)
    url.searchParams.append('details', description)
    url.searchParams.append('location', location)
    url.searchParams.append('dates', `${startTime}/${endTime}`)
    url.searchParams.append('sf', 'true')
    url.searchParams.append('output', 'xml')

    return url.toString()
}

export const generateICSFile = (
    title: string,
    description: string,
    location: string,
    start: moment.Moment,
    end: moment.Moment
): string => {
    const formatDate = (date: moment.Moment) => date.utc().format('YYYYMMDDTHHmmss[Z]')

    const startTime = formatDate(start)
    const endTime = formatDate(end)

    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Organization//Your Product//EN
BEGIN:VEVENT
UID:${new Date().getTime()}@yourdomain.com
DTSTAMP:${formatDate(moment())}
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR
    `.trim()

    const blob = new Blob([icsContent], { type: 'text/calendar' })
    return URL.createObjectURL(blob)
}

export const generateOutlookCalendarUrl = (
    title: string,
    description: string,
    location: string,
    start: moment.Moment,
    end: moment.Moment
): string => {
    const formatDate = (date: moment.Moment) => date.utc().format('YYYY-MM-DDTHH:mm:ss[Z]')

    const startTime = formatDate(start)
    const endTime = formatDate(end)

    const url = new URL('https://outlook.live.com/owa/')
    url.searchParams.append('path', '/calendar/action/compose')
    url.searchParams.append('rru', 'addevent')
    url.searchParams.append('subject', title)
    url.searchParams.append('body', description)
    url.searchParams.append('location', location)
    url.searchParams.append('startdt', startTime)
    url.searchParams.append('enddt', endTime)

    return url.toString()
}

export const generateYahooCalendarUrl = (
    title: string,
    description: string,
    location: string,
    start: moment.Moment,
    end: moment.Moment
): string => {
    const formatDate = (date: moment.Moment) => date.utc().format('YYYYMMDDTHHmmss[Z]')

    const startTime = formatDate(start)
    const endTime = formatDate(end)

    const url = new URL('https://calendar.yahoo.com/')
    url.searchParams.append('v', '60')
    url.searchParams.append('view', 'd')
    url.searchParams.append('type', '20')
    url.searchParams.append('title', title)
    url.searchParams.append('st', startTime)
    url.searchParams.append('et', endTime)
    url.searchParams.append('desc', description)
    url.searchParams.append('in_loc', location)

    return url.toString()
}