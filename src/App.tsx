import './App.css'
import { useState, useCallback, useEffect } from 'react';
import NavBar from './NavBar';
import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader
} from 'react-calendar-timeline'
import moment from 'moment'
import { getEventsFromSheet, Location, } from './networks/GoogleSheets';

const App = () => {

  const [events, setEvents] = useState<Location[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const events = await getEventsFromSheet()
      setEvents(events)
    };
    fetchData();
  }, [])

  const getGroups = useCallback(() => {
    return events.map((location) => ({
      id: location.id,
      title: location.name,
      stackItems: true
    }))
  }, [events])

  const getItems = useCallback(() => {
    return events.flatMap((location) => location.events.map((event) => ({
      id: event.id,
      group: location.id,
      title: event.name,
      start_time: event.start,
      end_time: event.end,
      canMove: false,
      canResize: false,
      canChangeGroup: false,
      url: event.url,
      itemProps: {
        style: {
          background: '#53815c',
          borderRadius: '4px',
          border: '1px solid #53815c',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          overflow: 'hidden',
        }
      }
    })))
  }, [events])


  return (
    <div>
      <NavBar />
      {events.length === 0 ? <div>Loading...</div> :
        <div style={{ marginLeft: '24px', marginRight: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
          <Timeline
            groups={getGroups()}
            items={getItems()}
            defaultTimeStart={moment().add(-1, 'day').valueOf()}
            defaultTimeEnd={moment().add(3, 'week').valueOf()}
            lineHeight={40}
            itemHeightRatio={0.75}
            groupRenderer={({ group }) => {
              return <div style={{ paddingLeft: '16px' }}>{group.title}</div>
            }}
            minZoom={1000 * 60 * 60 * 24 * 14}
            maxZoom={1000 * 60 * 60 * 24 * 14}
            onItemSelect={(itemId: number) => {
              const item = getItems().find(item => item.id === itemId)
              if (item) {
                window.open(item.url)
              }
            }}
          >
            <TimelineHeaders className='header'>
              <SidebarHeader>
                {({ getRootProps }) => {
                  return <div {...getRootProps()} className='header'></div>
                }}
              </SidebarHeader>
              <DateHeader unit="primaryHeader" className='header'></DateHeader>
              <DateHeader className='header' />
            </TimelineHeaders>
          </Timeline>
        </div>
      }

    </div >
  );
}
export default App
