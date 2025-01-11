import React from 'react'
import { Button, Text } from '@mantine/core'
import './DonationView.css'

interface DonationViewProps {
}

const DonationView: React.FC<DonationViewProps> = () => {
    return (
        <div>
            <Text size="lg" fw="bold" mb="md">
                Thank you for considering a donation to Exhibitions.London
            </Text>
            <Text mb="md">
                Hi! I'm <a href="https://www.linkedin.com/in/chrisowen101/" target="_blank" rel="noopener noreferrer">Chris</a> and I built this website. I built this website because I was perennially missing exhibitions that I wanted to see and I'd rather wrote code than try to change myself.
                <br />
                <br />
                There are some small costs associated with running this website, so - if you find it useful - I would be grateful if you could consider donating. I've made it easy to donate using Stripe.
            </Text>
            <br />
            <Button
                variant="filled"
                onClick={() => window.open("https://donate.stripe.com/6oEcP50X72Gm3rGbIJ", '_blank')}
            >
                Donate
            </Button>
        </div>
    )
}

export default DonationView
