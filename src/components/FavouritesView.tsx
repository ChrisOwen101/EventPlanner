import React from 'react'
import { Button, Title, Text } from '@mantine/core'
import { renderStartEndTime } from '../tools/TimeRenderer'
import { getFavourites } from '../tools/LocalStorage'
import { Location } from '../networks/GoogleSheets'
import './FavouritesView.css'
import { FaHeart } from 'react-icons/fa6'


interface FavouritesViewProps {
    allEvents: Location[]
}

const FavouritesView: React.FC<FavouritesViewProps> = ({ allEvents }) => {
    const favourites = getFavourites()

    return (
        <div className="favourites-view">
            <Title order={3}>Your Favourites</Title>
            <br />
            {favourites.length === 0 && <Text>You currently have no favourites. Click the <FaHeart /> on any Event to favourite it.</Text>}
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
