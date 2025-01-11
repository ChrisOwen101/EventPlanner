import React from 'react'
import { Button, Title, Text, CloseButton } from '@mantine/core'
import { renderStartEndTime } from '../tools/TimeRenderer'
import { getFavourites } from '../tools/LocalStorage'
import { Location } from '../networks/GoogleSheets'
import './FavouritesView.css'
import { FaHeart } from 'react-icons/fa6'


interface FavouritesViewProps {
    allEvents: Location[],
    onClose: () => void
}

const FavouritesView: React.FC<FavouritesViewProps> = ({ allEvents, onClose }) => {
    const favourites = getFavourites()

    const getNoFavouritesContent = () => {
        return <div>
            <Text>You currently have no favourites. Click the <FaHeart /> on any Event to favourite it.</Text>
            <br />
            <Text>If nothing on here interests you right now, join the mailing list and I'll email you when I update the events</Text>
            <br />
            <Button variant="filled" onClick={() => window.open('https://gaggle.email/join/london.exhibitions@gaggle.email', '_blank')}>Join Mailing List</Button>
        </div>
    }

    return (
        <div className="favourites-view">
            <CloseButton size="xl" autoFocus={false} variant="transparent" style={{ zIndex: 1000, position: 'absolute', top: 0, right: 0, color: 'black', }} onClick={onClose} />

            <Title order={3}>Your Favourites</Title>
            <br />
            {favourites.length === 0 && getNoFavouritesContent()}
            {favourites.map((id: string) => {
                const event = allEvents
                    .flatMap((location) => location.events)
                    .find((e) => e.id === id)

                if (!event) return null

                return (
                    <div key={event.id} className="favourite-item">
                        <Text fw="bold">{event.location}</Text>
                        <Text>{event.name}</Text>
                        <Text>{renderStartEndTime(event.start, event.end)}</Text>
                        <Button
                            variant="filled"
                            onClick={() => window.open(event.url, '_blank')}
                        >
                            View Event
                        </Button>
                    </div>
                )
            })}
        </div>
    )
}

export default FavouritesView
