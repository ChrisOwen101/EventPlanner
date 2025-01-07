import moment from "moment"

export interface Event {
    id: string
    name: string
    cost: string
    location: string
    url: string
    description?: string
    start: moment.Moment
    end: moment.Moment
    image?: string
    importance: number,
    tags: string[] | undefined
}

export interface Location {
    id: number
    name: string
    events: Event[]
}

export interface SheetRow {
    id: string
    name: string
    cost: string
    location: string
    description: string
    url: string
    start: string
    end: string
    image: string
    importance: string,
    tags: string
}


export async function getEventsFromSheet(): Promise<Location[]> {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    const sheetId = "19-KrNeRa1HxWm-ePh88WiQBVFnKaWe-xzKnL9huvQXM"
    const range = "Events!A1:K"
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    const rows = data.values
    if (!rows || rows.length === 0) {
        return []
    }

    const convertToTitleCase = (str: string) => {
        return str.replace(
            /\w\S*/g,
            function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            }
        )
    }

    function parseRow(row: SheetRow): Event {
        return {
            id: row.id,
            name: row.name,
            cost: row.cost,
            location: row.location,
            url: row.url,
            description: row.description,
            start: moment(row.start, "DD/MM/YYYY"),
            end: moment(row.end, "DD/MM/YYYY"),
            image: row.image,
            importance: parseInt(row.importance),
            tags: row.tags?.split(',').map(tag => convertToTitleCase(tag.trim()))
        }
    }

    const events: Event[] = rows
        .slice(1)
        .filter((row: string[]) => row.length > 1)
        .map((row: string[]): Event => parseRow({
            id: row[0],
            url: row[1],
            location: row[2],
            name: convertToTitleCase(row[3]),
            cost: row[4],
            description: row[5],
            start: row[6],
            end: row[7],
            image: row[8],
            importance: row[9],
            tags: row[10]
        }))

    return groupByLocation(events)
}

const groupByLocation = (events: Event[]): Location[] => {
    const locations: Location[] = []
    events.forEach(event => {
        const location = locations.find(location => location.name === event.location)
        if (location) {
            location.events.push(event)
        } else {
            locations.push({ id: locations.length + 1, name: event.location, events: [event] })
        }
    })
    return locations
}
