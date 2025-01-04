import './App.css'
import { useState, useCallback, useEffect } from 'react'
import NavBar from './NavBar'
import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader,
  TodayMarker
} from 'react-calendar-timeline'
import moment from 'moment'
import { getEventsFromSheet, Location, Event } from './networks/GoogleSheets'
import ItemView from './components/ItemView'
import { Offcanvas } from 'bootstrap'
import { renderStartEndTime } from './tools/TimeRenderer'
import { getFavourites } from './tools/LocalStorage'

const App = () => {

  const [events, setEvents] = useState<Location[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [search, setSearch] = useState<string>('')
  const [favourites, setFavourites] = useState<number[]>(getFavourites())

  useEffect(() => {
    const handleStorageChange = () => {
      // When local storage changes, update the favourites list
      setFavourites(getFavourites())
    }


    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const events = await getEventsFromSheet()
      setEvents(events)
    }
    fetchData()
  }, [])

  const getFilteredEvents = useCallback(() => {
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
  }, [events, search])

  const getGroups = useCallback(() => {
    const filteredEvents = getFilteredEvents()

    const groups = filteredEvents.map((location) => {
      const averageImportance = location.events.reduce((sum, event) => {
        return sum + event.importance
      }, 0) / location.events.length


      return {
        id: location.id,
        title: location.name,
        stackItems: true,
        averageImportance
      }
    })

    return groups.sort((a, b) => a.averageImportance - b.averageImportance)
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

  const getNoEventsFound = useCallback(() => {
    return <div className="alert alert-warning" role="alert" style={{ marginLeft: '24px', marginRight: '24px', borderRadius: '12px', overflow: 'hidden', }}>
      <h6>No events could be found for the search term "{search}"</h6>
    </div>
  }, [search])

  const getLoading = useCallback(() => {
    return <div className="alert alert-secondary" role="alert" style={{ marginLeft: '24px', marginRight: '24px', borderRadius: '12px', overflow: 'hidden', }}>
      <h5>Loading...</h5>
    </div>
  }, [])

  const onClick = (itemId: number) => {
    const item = getItems().find(item => item.id === itemId)
    if (item) {
      setSelectedEvent(item.event)
      const offcanvasElement = document.getElementById('offcanvasExample')
      if (offcanvasElement) {
        const offcanvas = new Offcanvas(offcanvasElement)
        offcanvas.show()
      }
    }
  }

  const calculateBackgroundColor = (end: moment.Moment) => {
    if (end.isBefore(moment())) {
      return '#bdbdbd'
    }

    const now = moment()
    const duration = moment.duration(end.diff(now))
    const daysRemaining = duration.asDays()
    const maxDays = 30 // Maximum days to consider for darkest color
    const percentage = Math.max(0, Math.min(1, daysRemaining / maxDays))

    const startColor = { r: 189, g: 189, b: 189 } // #bdbdbd
    const endColor = { r: 83, g: 129, b: 92 } // #53815c

    let r = Math.round(startColor.r + percentage * (endColor.r - startColor.r))
    let g = Math.round(startColor.g + percentage * (endColor.g - startColor.g))
    let b = Math.round(startColor.b + percentage * (endColor.b - startColor.b))

    return `rgb(${r}, ${g}, ${b})`
  }

  const groups = getGroups()
  const items = getItems()
  const noEventsSearched = (groups.length === 0 || items.length === 0) && search !== ''

  const startTime = window.innerWidth <= 576 ? moment().add(-2, 'week') : moment().add(-2.5, 'month')
  const endTime = window.innerWidth <= 576 ? moment().add(5, 'month') : moment().add(8, 'month')

  const minZoom = window.innerWidth <= 576 ? 1000 * 60 * 60 * 24 * 60 : 1000 * 60 * 60 * 24 * 90
  const maxZoom = window.innerWidth <= 576 ? 1000 * 60 * 60 * 24 * 270 : 1000 * 60 * 60 * 24 * 270

  return (
    <div>
      <NavBar onSearch={(search) => {
        setSearch(search)
      }} />
      {events.length === 0 ? getLoading() : noEventsSearched ? getNoEventsFound() :
        <div className="timeline-container">
          <Timeline
            groups={getGroups()}
            items={getItems()}
            defaultTimeStart={startTime.valueOf()}
            defaultTimeEnd={endTime.valueOf()}
            minZoom={minZoom}
            maxZoom={maxZoom}
            lineHeight={54}
            itemHeightRatio={0.75}
            sidebarWidth={window.innerWidth <= 576 ? 100 : 150}
            groupRenderer={({ group }) => {
              return <div className='group'><p>{group.title}</p></div>
            }}
            itemRenderer={({ item,
              itemContext,
              getItemProps,
            }) => {

              let borderColor = itemContext.selected ? '2px solid #a3b18a' : item.itemProps.style.border

              if (item.event.end.isBefore(moment())) {
                borderColor = '2px solid #d8d8d8'
              } else if (favourites.includes(item.event.id)) {
                borderColor = '2px solid gold'
              }

              if (item.event.end.isBefore(moment())) {
                borderColor = '2px solid #d8d8d8'
              }

              const backgroundColor = calculateBackgroundColor(item.event.end)
              const textColor = item.event.end.isBefore(moment()) ? 'rgb(216, 216, 216)' : item.itemProps.style.color

              return (
                <div {...getItemProps({
                  ...item.itemProps,
                  style: {
                    ...item.itemProps.style,
                    border: borderColor,
                    background: backgroundColor,
                    color: textColor,
                  }
                })} title={itemContext.title}>

                  <div
                    className="rct-item-content poppins-medium"
                    style={{ maxHeight: `${itemContext.dimensions.height}`, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
                  >
                    {itemContext.title}  <span className="item-dates">
                      ({renderStartEndTime(item.event.start, item.event.end)})
                    </span>
                  </div>

                </div>
              )
            }}
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
            <TimelineHeaders className='header sticky'>
              <TodayMarker />
              <SidebarHeader>
                {({ getRootProps }) => {
                  return <div {...getRootProps()} className='header'></div>
                }}
              </SidebarHeader>
              <DateHeader unit="primaryHeader" className='header' ></DateHeader>
              <DateHeader className='header' />
            </TimelineHeaders>
          </Timeline>
          <ItemView selectedEvent={selectedEvent} onClose={() => setSelectedEvent(null)} />
        </div>
      }

    </div >
  )
}
export default App
