import React from 'react'
import { Button, Text, Input, Stack } from '@mantine/core'
import axios from 'axios'
import './DonationView.css'

interface MailingListViewProps {
}

const MailingListView: React.FC<MailingListViewProps> = () => {

    return (
        <div>
            <Text size="lg" fw="bold" mb="md">
                Join the Mailing List
            </Text>
            <Text mb="md">
                I'm planning on updating this website every month or so with new exhibitions and other event types.
                <br />
                <br />
                If you'd like to be notified when I do, you can join the <a href="https://gaggle.email/join/london.exhibitions@gaggle.email" target="_blank" rel="noopener noreferrer">mailing list</a>.
            </Text>
        </div >
    )
}

export default MailingListView
