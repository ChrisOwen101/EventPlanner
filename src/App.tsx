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
import { Offcanvas, Collapse } from 'bootstrap'
import ItemView from './components/ItemView'
import FavouritesView from './components/FavouritesView'
import FilterView from './components/FilterView'
import { getFavourites } from './tools/LocalStorage'
import { renderStartEndTime } from './tools/TimeRenderer'


const App = () => {

  const [events, setEvents] = useState<Location[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [search, setSearch] = useState<string>('')
  const [filterSettings, setFilterSettings] = useState({ showPaid: true, showFree: true })

  const [favourites, setFavourites] = useState<string[]>(getFavourites())

  const isPhone = window.innerWidth <= 576

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

  useEffect(() => {
    const rctScroll = document.querySelector('.rct-scroll')

    let startX: number, startY: number

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].pageX
      startY = e.touches[0].pageY
    }

    const handleTouchMove = (e: TouchEvent) => {
      const moveX = e.touches[0].pageX - startX
      const moveY = e.touches[0].pageY - startY

      if (Math.abs(moveY) > Math.abs(moveX)) {
        rctScroll?.classList.add('no-pointer-events')
      } else {
        rctScroll?.classList.remove('no-pointer-events')
      }
    }

    const handleTouchEnd = () => {
      rctScroll?.classList.remove('no-pointer-events')
    }

    rctScroll?.addEventListener('touchstart', handleTouchStart)
    rctScroll?.addEventListener('touchmove', handleTouchMove)
    rctScroll?.addEventListener('touchend', handleTouchEnd)

    return () => {
      rctScroll?.removeEventListener('touchstart', handleTouchStart)
      rctScroll?.removeEventListener('touchmove', handleTouchMove)
      rctScroll?.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  const getFilteredEvents = useCallback(() => {
    const filtered = events
      .map((location) => {
        return {
          ...location,
          events: location.events.filter((event) => {
            return event.name.toLowerCase().includes(search.toLowerCase())
          })
        }
      })
      .map((location) => {
        return {
          ...location,
          events: location.events.filter((event) => {
            if (event.cost === 'Free' && filterSettings.showFree) {
              return true
            }

            if (event.cost === 'Paid' && filterSettings.showPaid) {
              return true
            }

            return false
          })
        }
      })
      .filter((location) => location.events.length > 0)

    return filtered

  }, [events, search, filterSettings])

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
  }, [events, search, filterSettings])

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
  }, [events, search, filterSettings])

  const getNoEventsFound = useCallback(() => {
    return <div className="alert alert-warning" role="alert" style={{ marginLeft: '24px', marginRight: '24px', borderRadius: '12px', overflow: 'hidden', }}>
      <h6>No events could be found for the search term "{search}"</h6>
    </div>
  }, [search, filterSettings])

  const getLoading = useCallback(() => {
    return <div className="alert alert-secondary" role="alert" style={{ marginLeft: '24px', marginRight: '24px', borderRadius: '12px', overflow: 'hidden', }}>
      <h5>Loading...</h5>
    </div>
  }, [])

  const onClick = (itemId: string) => {
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

  const onFavouriteClicked = () => {
    const offcanvasElement = document.getElementById('offCanvasFavourites')
    if (offcanvasElement) {
      const offcanvas = new Offcanvas(offcanvasElement)
      offcanvas.show()
    }
  }

  const handleFilterClick = () => {
    const collapseExample = document.getElementById('collapseExample')
    if (collapseExample) {
      new Collapse(collapseExample).toggle()
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

  console.log(groups)
  return (
    <div>
      <NavBar
        onSearch={(search) => {
          setSearch(search)
        }}
        onFilter={() => {
          handleFilterClick()
        }}
        onFavourite={onFavouriteClicked} />

      <div className="collapse" id="collapseExample" style={{
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingBottom: '24px',
      }}>
        <FilterView
          onFilterChange={(filterSettings) => {
            setFilterSettings(filterSettings)
          }}
        />
      </div>

      {events.length === 0 ? getLoading() : noEventsSearched ? getNoEventsFound() :
        isPhone ? (
          <div>
            {groups.map(group => {
              const groupItems = items.filter(item => item.group === group.id)
              return (
                <div key={group.id}>
                  <h2 className="title-header">{group.title}</h2>
                  <Timeline
                    groups={[group]}
                    items={groupItems}
                    defaultTimeStart={startTime.valueOf()}
                    defaultTimeEnd={endTime.valueOf()}
                    minZoom={minZoom}
                    maxZoom={maxZoom}
                    lineHeight={54}
                    itemHeightRatio={0.75}
                    buffer={7}
                    sidebarWidth={0}
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
                    onItemSelect={(itemId: string) => {
                      if (!isPhone) {
                        onClick(itemId)
                      }
                    }}
                    onItemClick={(itemId: string) => {
                      if (isPhone) {
                        onClick(itemId)
                      }
                    }}
                  >
                    <TimelineHeaders className='header'>
                      <TodayMarker />
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
              )
            })}
          </div>
        ) : (
          <div className="timeline-container">
            <Timeline
              groups={groups}
              items={items}
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
              onItemSelect={(itemId: string) => {
                if (!isPhone) {
                  onClick(itemId)
                }
              }}
              onItemClick={(itemId: string) => {
                if (isPhone) {
                  onClick(itemId)
                }
              }}
            >
              <TimelineHeaders className='header'>
                <TodayMarker />
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
        )
      }
      {selectedEvent && <ItemView selectedEvent={selectedEvent} onClose={() => {
        setSelectedEvent(null)
      }} />}
      <FavouritesView allEvents={events} /> </div>
  )
}
export default App
