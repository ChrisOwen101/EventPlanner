import React from 'react'
import moment from 'moment'
import { generateGoogleCalendarUrl, generateICSFile, generateOutlookCalendarUrl, generateYahooCalendarUrl } from '../tools/Calendar'
import { Menu, rem } from '@mantine/core'
import { FaGoogle } from "react-icons/fa"
import { TfiMicrosoftAlt } from "react-icons/tfi"
import { FaYahoo } from "react-icons/fa"
import { FaFileDownload } from "react-icons/fa"


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
        <Menu.Dropdown>
            <Menu.Item
                leftSection={<FaGoogle style={{ width: rem(14), height: rem(14) }} />}
                onClick={() => window.open(calendarUrl, '_blank')}
            >
                Add to Google
            </Menu.Item>
            <Menu.Item
                leftSection={<TfiMicrosoftAlt style={{ width: rem(14), height: rem(14) }} />}
                onClick={() => window.open(outlookUrl, '_blank')}
            >
                Add to Outlook
            </Menu.Item>
            <Menu.Item
                leftSection={<FaYahoo style={{ width: rem(14), height: rem(14) }} />}
                onClick={() => window.open(yahooUrl, '_blank')}
            >
                Add to Yahoo
            </Menu.Item>
            <Menu.Item
                leftSection={<FaFileDownload style={{ width: rem(14), height: rem(14) }} />}
                component="a"
                href={icsFileUrl}
                download={`${location}_${title}.ics`}
            >
                Download ICS
            </Menu.Item>
        </Menu.Dropdown>
    )
}

export default CalendarButtons
