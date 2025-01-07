import React from 'react'
import moment from 'moment'
import { generateGoogleCalendarUrl, generateICSFile, generateOutlookCalendarUrl, generateYahooCalendarUrl } from '../tools/Calendar'

interface CalendarButtonsProps {
    title: string
    description: string
    location: string
    start: moment.Moment
    end: moment.Moment
}

const CalendarButtons: React.FC<CalendarButtonsProps> = ({ title, description, location, start, end }) => {
    const calendarUrl = generateGoogleCalendarUrl(title, description, location, start, end)
    const icsFileUrl = generateICSFile(title, description, location, start, end)
    const outlookUrl = generateOutlookCalendarUrl(title, description, location, start, end)
    const yahooUrl = generateYahooCalendarUrl(title, description, location, start, end)

    return (
        <div className="calendar-buttons">
            <button type="button" className="btn btn-secondary" onClick={() => window.open(calendarUrl, '_blank')}>Add to Google Calendar</button>
            <button type="button" className="btn btn-secondary" onClick={() => window.open(outlookUrl, '_blank')}>Add to Outlook</button>
            <button type="button" className="btn btn-secondary" onClick={() => window.open(yahooUrl, '_blank')}>Add to Yahoo</button>
            <a href={icsFileUrl} download={`${location}_${title}.ics`} className="btn btn-secondary">Download ICS</a>
        </div>
    )
}

export default CalendarButtons
