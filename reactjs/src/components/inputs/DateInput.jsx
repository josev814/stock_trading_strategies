import React, { useLayoutEffect, useState } from 'react';
import PropTypes from "prop-types";

export function DateInput(props) {
    // Define state to store the selected date
    const [selectedDate, setSelectedDate] = useState('');

    useLayoutEffect(() => {
        // Get the input element
        const startDateInput = document.getElementById('start_date');

        // Get the current date
        const today = new Date();

        // Format the current date to YYYY-MM-DD
        const formattedDate = today.toISOString().slice(0, 10);

        // Set the maximum date attribute
        startDateInput.setAttribute('max', formattedDate);
    })

    // Define the onChange handler function
    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
        props.handleChange(event)
    };

    return (
        <>
            <label htmlFor={props.id}>
                {props.label}: 
            </label>
            <span className='small text-muted'>
                {props.description}
            </span>
            <input
                type="date"
                id={props.id}
                name={props.name}
                value={selectedDate}
                className='form-control'
                onChange={handleDateChange} // Bind the onChange handler
            />
        </>
    );
}

DateInput.propTypes = {
    id: PropTypes.number,
    name: PropTypes.string,
    label: PropTypes.string,
    description: PropTypes.string,
    handleChange: PropTypes.func,
}