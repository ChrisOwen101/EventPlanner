import './App.css'
import '@mantine/core/styles.css'
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
import FavouritesView from './components/FavouritesView'
import FilterView from './components/FilterView'
import { getFavourites, seenMailingList, setSeenMailingList } from './tools/LocalStorage'
import { renderStartEndTime } from './tools/TimeRenderer'
import DonationView from './components/DonationView'
import { Alert, Modal, Collapse, Drawer, Text, Button, Group } from '@mantine/core'
import MailingListView from './components/MailingListView'


const App = () => {

  const [events, setEvents] = useState<Location[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [search, setSearch] = useState<string>('')
  const [filterSettings, setFilterSettings] = useState({ showPaid: true, showFree: true })

  const [favourites, setFavourites] = useState<string[]>(getFavourites())

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [favouritesOpen, setFavouritesOpen] = useState(false)
  const [donationOpen, setDonationOpen] = useState(false)
  const [mailingListOpen, setMailingListOpen] = useState(false)
  const [selectedEventOpen, setSelectedEventOpen] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

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
    if (!seenMailingList()) {
      const timer = setTimeout(() => {
        setShowPopup(true)
      }, 20000)
      return () => clearTimeout(timer)
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
    return (
      <Alert color="yellow" radius="md" m="lg">
        <Text>No events found for "{search}"</Text>
      </Alert>
    )
  }, [search])

  const getLoading = useCallback(() => {
    return (
      <Alert color="gray" radius="md" m="md">
        Loading...
      </Alert>
    )
  }, [])

  const onClick = (itemId: string) => {
    const item = getItems().find(item => item.id === itemId)
    if (item) {
      setSelectedEvent(item.event)
      setSelectedEventOpen(true)
    }
  }

  const onFavouriteClicked = () => {
    setFavouritesOpen(true)
  }

  const onDonationClicked = () => {
    setDonationOpen(true)
  }

  const handleFilterClick = () => {
    setFiltersOpen((prev) => !prev)
  }

  const calculateBackgroundColor = (end: moment.Moment) => {
    if (end.isBefore(moment())) {
      return '#bdbdbd'
    }

    return '#53815c'
  }

  const itemRenderer = ({ item, itemContext, getItemProps }: { item: any; itemContext: any; getItemProps: any }) => {

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

    const props = getItemProps({
      ...item.itemProps,
      style: {
        ...item.itemProps.style,
        border: borderColor,
        background: backgroundColor,
        color: textColor,
      }
    })

    // remove key from props
    delete props.key

    return (
      <div key={item.id} {...props} title={itemContext.title}>

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
  }

  const groups = getGroups()
  const items = getItems()
  const noEventsSearched = (groups.length === 0 || items.length === 0) && search !== ''
  const isPhone = window.innerWidth <= 576

  const startTime = isPhone ? moment().add(-2, 'month') : moment().add(-2.5, 'month')
  const endTime = isPhone ? moment().add(8, 'month') : moment().add(8, 'month')

  const minZoom = isPhone ? 1000 * 60 * 60 * 24 * 60 : 1000 * 60 * 60 * 24 * 90
  const maxZoom = isPhone ? 1000 * 60 * 60 * 24 * 270 : 1000 * 60 * 60 * 24 * 270

  return (
    <div>
      <NavBar
        onSearch={setSearch}
        onFilter={handleFilterClick}
        onFavourite={onFavouriteClicked}
        onDonate={onDonationClicked}
        onMailingList={() => setMailingListOpen(true)}
      />

      <Collapse in={filtersOpen}>
        <FilterView
          onFilterChange={(filterSettings) => {
            setFilterSettings(filterSettings)
          }}
        />
      </Collapse>

      {events.length === 0 ? getLoading() : noEventsSearched ? getNoEventsFound() :
        isPhone ? (
          <div>
            {groups.map(group => {
              const groupItems = items.filter(item => item.group === group.id)
              return (
                <div key={group.id}>
                  <h3 className="title-header">{group.title}</h3>
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
                    itemRenderer={itemRenderer}
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
                    <TimelineHeaders className='header-alt'>
                      <TodayMarker />
                      <DateHeader unit="primaryHeader" className='header-alt'></DateHeader>
                      <DateHeader className='header-alt' />
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
              itemRenderer={itemRenderer}
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
      <Drawer
        opened={selectedEventOpen}
        withCloseButton={false}
        onClose={() => {
          setSelectedEvent(null)
          setSelectedEventOpen(false)
        }}
      >
        {selectedEvent && (
          <ItemView
            selectedEvent={selectedEvent}
            onClose={() => {
              setSelectedEvent(null)
              setSelectedEventOpen(false)
            }}
          />
        )}
      </Drawer>
      <Drawer opened={favouritesOpen} position="right" onClose={() => setFavouritesOpen(false)} withCloseButton={false}>
        <FavouritesView allEvents={events} onClose={
          () => {
            setFavouritesOpen(false)
          }
        } />
      </Drawer>
      <Modal
        opened={donationOpen}
        onClose={() => setDonationOpen(false)}
        title="Support Exhibitions.London"
      >
        <DonationView />
      </Modal>
      <Modal
        opened={mailingListOpen}
        onClose={() => setMailingListOpen(false)}
      >
        <MailingListView />
      </Modal>
      <Modal
        opened={showPopup}
        onClose={() => setShowPopup(false)}
        closeOnClickOutside={false}
        trapFocus={false}
        withOverlay={false}
        lockScroll={false}
        withCloseButton={false}
        onEnterTransitionEnd={() => {
          setSeenMailingList()
        }}
      >
        <Text><b>Email Updates?</b></Text>
        <br />
        <Text>My plan is to update this website every month or two. Want me to email when I update it?</Text>
        <br />
        <Group>
          <Button variant="filled" onClick={() => window.open('https://gaggle.email/join/london.exhibitions@gaggle.email', '_blank')}>Join Mailing List</Button>
          <Button variant="outline" onClick={() => setShowPopup(false)}>Close</Button>
        </Group>
      </Modal>
    </div >
  )
}
export default App
