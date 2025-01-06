import React from 'react'
import { Location } from '../networks/GoogleSheets'
import './FavouritesView.css'

interface DonationViewProps {
    allEvents: Location[]
}

const DonationView: React.FC<DonationViewProps> = () => {
    return (
        <div className="offcanvas offcanvas-bottom" tabIndex={-1} id="offCanvasDonation" aria-labelledby="offcanvasExampleLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="offcanvasExampleLabel">Thank you for considering a donation to Exhibitions.London</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
                <p>Your donation will help us to continue to run the site, keep our database updated and to add new features.</p>
                <button type="button" className="btn btn-secondary" onClick={() => window.open("https://donate.stripe.com/6oEcP50X72Gm3rGbIJ", '_blank')}>Donate</button>
            </div>
        </div>
    )
}

export default DonationView
