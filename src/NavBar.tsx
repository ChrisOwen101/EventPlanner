import { FaFilter, FaHeart } from 'react-icons/fa6'
import { BiSolidDonateHeart } from "react-icons/bi"
import { MdMarkEmailUnread } from "react-icons/md"


import './navbar.css'
import { Group, Button, TextInput } from '@mantine/core'


function NavBar({ onSearch, onFilter, onFavourite, onDonate, onMailingList }: { onSearch: (search: string) => void, onFilter: () => void, onFavourite: () => void, onDonate: () => void, onMailingList: () => void }) {

    const iconSize = 18

    return (
        <div
            className='custom-navbar'
            style={{
                backgroundColor: '#324d37',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                padding: '8px 24px',
                minHeight: 64,
            }}
        >
            <div
                style={{
                    marginRight: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'white',
                    fontSize: '30px'
                }}
            >
                Exhibitions<b>London</b>
            </div>

            <Group
                style={{ marginLeft: 'auto' }}
            >
                <Button variant="filled" onClick={onFavourite}><FaHeart size={iconSize} /></Button>
                <Button variant="filled" onClick={onFilter}><FaFilter size={iconSize} /></Button>
                <Button variant="filled" onClick={onDonate}><BiSolidDonateHeart size={iconSize} /></Button>
                <Button variant="filled" onClick={onMailingList}><MdMarkEmailUnread size={iconSize} /></Button>
                <TextInput
                    placeholder="Search"
                    onChange={(e) => onSearch(e.currentTarget.value)}
                    styles={{ input: { backgroundColor: '#628674', color: 'white' } }}
                />
            </Group>
        </div>
    )
}

export default NavBar