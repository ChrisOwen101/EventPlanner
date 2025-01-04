import React from 'react'
import { renderStartEndTime } from '../tools/TimeRenderer'
import { getFavourites } from '../tools/LocalStorage'
import { Location } from '../networks/GoogleSheets'
import './FavouritesView.css'

interface FavouritesViewProps {
    allEvents: Location[]
}

const FavouritesView: React.FC<FavouritesViewProps> = ({ allEvents }) => {

    const favourites = getFavourites()

    return (
        <div className="offcanvas offcanvas-end" tabIndex={-1} id="offCanvasFavourites" aria-labelledby="offcanvasExampleLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="offcanvasExampleLabel">Your Favourites</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
                {favourites.length === 0 && (
                    <p>You have no favourites</p>
                )}
                {favourites.map((id: number) => {
                    const event = allEvents.flatMap((location) => location.events).find((event) => event.id === id)

                    if (!event) return null

                    return <div key={event.id} className="favourite-item">
                        <h5>{event.name}</h5>
                        <p>{renderStartEndTime(event.start, event.end)}</p>
                        <button type="button" className="btn btn-primary" onClick={() => window.open(event.url, '_blank')}>View Event</button>
                    </div>
                })}

            </div>
        </div>
    )
}

export default FavouritesView
