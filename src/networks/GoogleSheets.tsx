import moment from "moment";

export interface Event {
    id: number;
    name: string;
    cost: string
    location: string;
    url: string;
    description?: string;
    start: moment.Moment;
    end: moment.Moment;
}

export interface Location {
    id: number;
    name: string;
    events: Event[];
}

export interface SheetRow {
    id: string;
    name: string;
    cost: string;
    location: string;
    description: string;
    url: string;
    start: string;
    end: string;
}


export async function getEventsFromSheet(): Promise<Location[]> {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const sheetId = "19-KrNeRa1HxWm-ePh88WiQBVFnKaWe-xzKnL9huvQXM"
    const range = "Events!A1:H";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    const rows = data.values;
    if (!rows || rows.length === 0) {
        return [];
    }

    function parseRow(row: SheetRow): Event {
        return {
            id: parseInt(row.id),
            name: row.name,
            cost: row.cost,
            location: row.location,
            url: row.url,
            description: row.description,
            start: moment(row.start, "DD/MM/YYYY"),
            end: moment(row.end, "DD/MM/YYYY"),
        };
    }

    const events: Event[] = rows
        .slice(1)
        .filter((row: string[]) => row.length > 1)
        .map((row: string[]): Event => parseRow({
            id: row[0],
            name: row[1],
            cost: row[2],
            location: row[3],
            url: row[4],
            description: row[5],
            start: row[6],
            end: row[7],
        }));

    return groupByLocation(events)
}

const groupByLocation = (events: Event[]): Location[] => {
    const locations: Location[] = [];
    events.forEach(event => {
        const location = locations.find(location => location.name === event.location);
        if (location) {
            location.events.push(event);
        } else {
            locations.push({ id: locations.length + 1, name: event.location, events: [event] });
        }
    });
    return locations;
}
