import React from 'react'
import { Button, Stack, Menu, AspectRatio, Overlay, CloseButton } from '@mantine/core'
import { Event } from '../networks/GoogleSheets'
import { FaHeart } from 'react-icons/fa'
import { renderStartEndTime } from '../tools/TimeRenderer'
import { getFavourites, toggleFavourite } from '../tools/LocalStorage'
import CalendarButtons from './CalendarButtons'
import './ItemView.css' // retains any custom styles, e.g. for chips

interface ItemViewProps {
    selectedEvent: Event | null
    onClose: () => void

}

const ItemView: React.FC<ItemViewProps> = ({ selectedEvent, onClose }) => {
    if (!selectedEvent) return null

    const onFavouriteClicked = () => {
        toggleFavourite(selectedEvent.id)
    }

    const getFavouriteIcon = () => {
        return getFavourites().includes(selectedEvent.id)
            ? <FaHeart style={{ color: 'red', marginLeft: "8px" }} />
            : <></>
    }

    const hasImage = (image: string | null | undefined) => {
        if (!image) {
            return false
        }

        if (image.toLowerCase().includes('error')) {
            return false
        }

        if (image.toLowerCase().includes('no image found')) {
            return false
        }

        if (image.toLowerCase().includes('Do not fill in')) {
            return false
        }

        return true
    }

    console.log(selectedEvent.image)

    return (
        <div>
            {hasImage(selectedEvent.image) && (
                <AspectRatio ratio={1}>
                    <img src={selectedEvent.image} alt="" style={{ width: '100%' }} />
                    <Overlay
                        gradient="linear-gradient(190deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0) 100%)"
                        opacity={0.85}
                    />
                </AspectRatio>

            )}

            <CloseButton size="xl" autoFocus={false} variant="transparent" style={{ zIndex: 1000, position: 'absolute', top: 0, right: 0, color: hasImage(selectedEvent.image) ? 'white' : 'black', }} onClick={onClose} />

            <div style={{ padding: '16px' }}>
                <h1>{selectedEvent.name}</h1>
                {selectedEvent.tags && (
                    <div className="chip-container">
                        {selectedEvent.tags.map((tag, index) => (
                            <span key={index} className="chip">{tag}</span>
                        ))}
                    </div>
                )}
                <p><strong>Running:</strong> {renderStartEndTime(selectedEvent.start, selectedEvent.end)}</p>
                <p><strong>Venue:</strong> {selectedEvent.location}</p>
                <p><strong>Entry:</strong> {selectedEvent.cost}</p>
                <p>{selectedEvent.description}</p>

                <Stack>
                    <Button
                        variant="filled"
                        onClick={() => window.open(selectedEvent.url, '_blank')}
                    >
                        View Event
                    </Button>
                    <Button variant="filled" onClick={onFavouriteClicked}>
                        Favourite Event {getFavouriteIcon()}
                    </Button>
                    <Menu shadow="md" width={200} position="top" trigger="hover">
                        <Menu.Target>
                            <Button variant="filled" onClick={onFavouriteClicked}>
                                Save to Calendar
                            </Button>
                        </Menu.Target>
                        <CalendarButtons
                            title={selectedEvent.name}
                            description={selectedEvent.description || ''}
                            location={selectedEvent.location}
                            start={selectedEvent.start}
                            end={selectedEvent.end}
                        />
                    </Menu>
                </Stack>
            </div>
        </div>
    )
}

export default ItemView
