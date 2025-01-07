import './App.css'
import { useState, useCallback, useEffect, useMemo } from 'react'
import NavBar from './NavBar'
import moment from 'moment'
import { getEventsFromSheet, Location, Event } from './networks/GoogleSheets'
import { Offcanvas, Collapse } from 'bootstrap'
import ItemView from './components/ItemView'
import FavouritesView from './components/FavouritesView'
import FilterView from './components/FilterView'
import { getFavourites } from './tools/LocalStorage'
import DonationView from './components/DonationView'
import { useEpg, Epg, Layout, Channel, Program } from '@nessprim/planby-pro'
import { CustomEvent } from './components/CustomEvent'
import { CustomGroup } from './components/CustomGroup'


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

  const groups = useMemo(() => {
    const filteredEvents = getFilteredEvents()

    const groups = filteredEvents.map((location) => {
      const averageImportance = location.events.reduce((sum, event) => {
        return sum + event.importance
      }, 0) / location.events.length


      return {
        uuid: location.id.toString(),
        title: location.name
      }
    })

    return groups
  }, [events, search, filterSettings])

  const items = useMemo(() => {
    return getFilteredEvents().flatMap((location) => location.events.map((event) => ({
      channelUuid: location.id.toString(),
      description: event.description || 'No description available',
      id: event.id,
      image: event.image || 'https://via.placeholder.com',
      since: moment(event.start).format('YYYY-MM-DDTHH:mm:ss'),
      till: moment(event.end).format('YYYY-MM-DDTHH:mm:ss'),
      title: event.name,
      event: event,
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
    const item = items.find(item => item.id === itemId)
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

  const onDonationClicked = () => {
    const offcanvasElement = document.getElementById('offCanvasDonation')
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

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    const offcanvasElement = document.getElementById('offcanvasExample')
    if (offcanvasElement) {
      const offcanvas = new Offcanvas(offcanvasElement)
      offcanvas.show()
    }
  }

  const noEventsSearched = (groups.length === 0 || items.length === 0) && search !== ''

  const {
    getEpgProps,
    getLayoutProps,
    onScrollToNow,
    onScrollLeft,
    onScrollRight,
  } = useEpg({
    epg: items,
    channels: groups,
    startDate: '2024-12-01T00:00:00', // or 2022-02-02T00:00:00
    endDate: '2026-12-31T00:00:00', // or 2022-02-02T00:00:00
    mode: { type: 'month', style: 'modern' },
    overlap: {
      enabled: true,
      mode: "stack"
    },
  })

  return (
    <div>
      <NavBar
        onSearch={setSearch}
        onFilter={handleFilterClick}
        onFavourite={onFavouriteClicked}
        onDonate={onDonationClicked} />

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
        <Epg {...getEpgProps()} >
          <Layout
            {...getLayoutProps()}
            renderProgram={({ program, ...rest }) => (
              <CustomEvent key={program.data.id} program={program} onEventClick={onClick} {...rest} />
            )}
            renderChannel={({ channel, ...rest }) => (
              <CustomGroup key={channel.uuid} channel={channel} {...rest} />
            )}
          />
        </Epg>
      }
      {selectedEvent && <ItemView selectedEvent={selectedEvent} onClose={() => {
        setSelectedEvent(null)
      }} />}
      <FavouritesView allEvents={events} />
      <DonationView />
    </div>
  )
}
export default App
