import moment from "moment";

export interface Event {
    id: number;
    name: string;
    location: 'London' | 'Manchester' | 'Glasgow' | 'Liverpool' | 'Birmingham';
    url: string;
    description?: string;
    start: moment.Moment;
    end: moment.Moment;
}

export interface Location {
    id: number;
    name: Event['location'];
    events: Event[];
}

export interface SheetRow {
    id: string;
    name: string;
    location: string;
    description: string;
    url: string;
    start: string;
    end: string;
}


export async function getEventsFromSheet(): Promise<Location[]> {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const sheetId = "19-KrNeRa1HxWm-ePh88WiQBVFnKaWe-xzKnL9huvQXM"
    const range = "Events!A1:G";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    const rows = data.values;
    if (!rows || rows.length === 0) {
        return [];
    }

    console.log(rows);

    function parseRow(row: SheetRow): Event {
        return {
            id: parseInt(row.id),
            name: row.name,
            location: row.location as Event['location'],
            url: row.url,
            description: row.description,
            start: moment(row.start, "DD/MM/YYYY HH:mm:ss"),
            end: moment(row.end, "DD/MM/YYYY HH:mm:ss"),
        };
    }

    const events = rows.slice(1).map((row: string[]): Event => parseRow({
        id: row[0],
        name: row[1],
        location: row[2],
        url: row[3],
        description: row[4],
        start: row[5],
        end: row[6],
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
