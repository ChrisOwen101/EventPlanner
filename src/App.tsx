import './App.css'
import { useState, useCallback, useEffect } from 'react';
import NavBar from './NavBar';
import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader
} from 'react-calendar-timeline'
import moment from 'moment'
import { getEventsFromSheet, Location, Event } from './networks/GoogleSheets';
import { Offcanvas, Tooltip } from 'bootstrap';
import { on } from 'events';

const App = () => {

  const [events, setEvents] = useState<Location[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [search, setSearch] = useState<string>('');


  useEffect(() => {
    const fetchData = async () => {
      const events = await getEventsFromSheet()
      setEvents(events)
    };
    fetchData();
  }, [])

  const getFilteredEvents = () => {
    if (search === '') {
      return events
    }

    const filtered = events.map((location) => {
      return {
        ...location,
        events: location.events.filter((event) => {
          return event.name.toLowerCase().includes(search.toLowerCase())
        })
      }
    }).filter((location) => location.events.length > 0)

    return filtered

  }

  useEffect(() => {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new Tooltip(tooltipTriggerEl)
    })
  }, [events, search])

  const getGroups = useCallback(() => {
    return getFilteredEvents().map((location) => ({
      id: location.id,
      title: location.name,
      stackItems: true
    }))
  }, [events, search])

  const getItems = useCallback(() => {
    return getFilteredEvents().flatMap((location) => location.events.map((event) => ({
      id: event.id,
      group: location.id,
      title: event.name,
      start_time: event.start,
      end_time: event.end,
      canMove: false,
      canResize: false,
      canChangeGroup: false,
      event: event,
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
  }, [events, search])

  const getNoEventsFound = () => {
    return <div className="alert alert-warning" role="alert" style={{ marginLeft: '24px', marginRight: '24px', borderRadius: '12px', overflow: 'hidden', }}>
      <h6>No events could be found for the search term "{search}"</h6>
    </div>
  }

  const getLoading = () => {
    return <div className="alert alert-secondary" role="alert" style={{ marginLeft: '24px', marginRight: '24px', borderRadius: '12px', overflow: 'hidden', }}>
      <h5>Loading...</h5>
    </div>
  }

  const onClick = (itemId: number) => {
    const item = getItems().find(item => item.id === itemId);
    if (item) {
      setSelectedEvent(item.event);
      const offcanvasElement = document.getElementById('offcanvasExample');
      if (offcanvasElement) {
        const offcanvas = new Offcanvas(offcanvasElement);
        offcanvas.show();
      }
    }
  }

  const groups = getGroups();
  const items = getItems();
  const noEventsSearched = (groups.length === 0 || items.length === 0) && search !== '';

  return (
    <div>
      <NavBar onSearch={(search) => {
        setSearch(search);
      }} />
      {events.length === 0 ? getLoading() : noEventsSearched ? getNoEventsFound() :
        <div className="timeline-container">
          <Timeline
            groups={getGroups()}
            items={getItems()}
            defaultTimeStart={moment().add(-1, 'day').valueOf()}
            defaultTimeEnd={moment().add(3, 'month').valueOf()}
            lineHeight={40}
            itemHeightRatio={0.75}
            sidebarWidth={window.innerWidth <= 576 ? 100 : 150}
            groupRenderer={({ group }) => {
              return <div className='group'><p>{group.title}</p></div>
            }}
            itemRenderer={({ item,
              itemContext,
              getItemProps,
            }) => {

              const borderColor = itemContext.selected ? '2px solid #a3b18a' : item.itemProps.style.border

              return (
                <div {...getItemProps({
                  ...item.itemProps,
                  style: {
                    ...item.itemProps.style,
                    border: borderColor
                  }
                })} data-bs-toggle="tooltip" data-bs-placement="top" title={itemContext.title}>

                  <div
                    className="rct-item-content"
                    style={{ maxHeight: `${itemContext.dimensions.height}` }}
                  >
                    {itemContext.title}
                  </div>

                </div>
              )
            }}
            minZoom={1000 * 60 * 60 * 24 * 6}
            maxZoom={1000 * 60 * 60 * 24 * 21}
            onItemSelect={(itemId: number) => {
              if (window.innerWidth >= 576) {
                onClick(itemId)
              }
            }}
            onItemClick={(itemId: number) => {
              if (window.innerWidth < 576) {
                onClick(itemId)
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
          <div className="offcanvas offcanvas-start" tabIndex={-1} id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasExampleLabel">{selectedEvent?.name}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
              {selectedEvent && (
                <div>
                  <p><strong>Location:</strong> {selectedEvent.location}</p>
                  <p><strong>Cost:</strong> {selectedEvent.cost}</p>
                  <p><strong>Description:</strong> {selectedEvent.description}</p>
                  <p><strong>Start:</strong> {selectedEvent.start.format('MMMM Do YYYY')}</p>
                  <p><strong>End:</strong> {selectedEvent.end.format('MMMM Do YYYY')}</p>
                  <button type="button" className="btn btn-primary" onClick={() => window.open(selectedEvent.url, '_blank')}>Go to Event</button>
                </div>
              )}
            </div>
          </div>
        </div>
      }

    </div >
  );
}
export default App
