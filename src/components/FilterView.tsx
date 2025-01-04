import React, { useEffect, useState } from 'react'
import './FilterView.css'

interface FilterSettings {
    showPaid: boolean
    showFree: boolean
}

interface FilterViewProps {
    onFilterChange: (filterSettings: FilterSettings) => void
}

const FilterView: React.FC<FilterViewProps> = ({ onFilterChange }) => {
    const [showPaid, setShowPaid] = useState(true)
    const [showFree, setShowFree] = useState(true)

    useEffect(() => {
        onFilterChange({ showPaid, showFree })
    }, [showPaid, showFree])

    const handlePaidChange = () => {
        setShowPaid(!showPaid)
    }

    const handleFreeChange = () => {
        setShowFree(!showFree)
    }

    return (
        <fieldset className="cost-fieldset">
            <p>Cost</p>
            <div className="card card-body">
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={showPaid}
                        onChange={handlePaidChange}
                        id="paidCheckbox"
                    />
                    <label className="form-check-label" htmlFor="paidCheckbox">
                        Paid
                    </label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={showFree}
                        onChange={handleFreeChange}
                        id="freeCheckbox"
                    />
                    <label className="form-check-label" htmlFor="freeCheckbox">
                        Free
                    </label>
                </div>
            </div>
        </fieldset>
    )
}

export default FilterView
