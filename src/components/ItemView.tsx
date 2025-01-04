import React from 'react'
import { Event } from '../networks/GoogleSheets'
import { FaHeart } from 'react-icons/fa'
import { renderStartEndTime } from '../tools/TimeRenderer'
import { getFavourites, toggleFavourite } from '../tools/LocalStorage'
import CalendarButtons from './CalendarButtons'

interface ItemViewProps {
    selectedEvent: Event | null
    onClose: () => void
}

const ItemView: React.FC<ItemViewProps> = ({ selectedEvent, onClose }) => {

    const onFavouriteClicked = () => {
        if (selectedEvent) {
            toggleFavourite(selectedEvent.id)
        }
    }

    const getFavouriteIcon = () => {
        if (selectedEvent) {
            if (getFavourites().includes(selectedEvent.id)) {
                return <FaHeart style={{ color: 'red' }} />
            } else {
                return <FaHeart style={{ color: 'grey' }} />
            }
        }
    }

    if (!selectedEvent) return null

    return (
        <div className="offcanvas offcanvas-start" tabIndex={-1} id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
            {selectedEvent?.image ? <img src={selectedEvent?.image} alt="" className="offcanvas-image" /> : <></>}
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="offcanvasExampleLabel">{selectedEvent?.name}</h5>
                <button type="button" className="btn" aria-label="Favourite" onClick={onFavouriteClicked}>{getFavouriteIcon()}</button>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" onClick={onClose}></button>
            </div>
            <div className="offcanvas-body">
                {selectedEvent && (
                    <div>
                        <p><strong>Running:</strong> {renderStartEndTime(selectedEvent.start, selectedEvent.end)}</p>
                        <p><strong>Venue:</strong> {selectedEvent.location}</p>
                        <p><strong>Entry:</strong> {selectedEvent.cost}</p>
                        <p>{selectedEvent.description}</p>
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => window.open(selectedEvent.url, '_blank')}>View Event</button>
                            <CalendarButtons
                                title={selectedEvent.name}
                                description={selectedEvent.description || ''}
                                location={selectedEvent.location}
                                start={selectedEvent.start}
                                end={selectedEvent.end}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ItemView
