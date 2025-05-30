import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AsyncSelect from 'react-select/async';

export function AsyncDropDown(props) {
    const [selectedOption, setSelectedOption] = useState(null);

    const loadOptions = async (inputValue, callback) => {
        //axios.get(`${django_url}/stocks/find_ticker?ticker=${inputValue}`)
        let records = {}
        await axios.get(
            `${props.django_url}/stocks/find_ticker/?ticker=${inputValue}`
        ).then(res => {
            records = res.data['records']
        }).catch(error => {
            console.log('Error fetching data: ', error)
        })
        callback(records.map(i => ({ 
            label: i.ticker + ' - ' + i.name, 
            value: i.url.split('/')[4] + '|' + i.ticker
        })))
    };
    
    const handleSelect = (selectedOption) => {
         setSelectedOption(selectedOption);
         console.groupCollapsed('handleSelect')
         console.log(selectedOption)
         if (selectedOption && selectedOption !== null && props.handleChange){
            const event = {'target': {'value': selectedOption.value, 'name': props.name}}
            try {
                console.log('Handling change')
                props.handleChange(event)
                console.log('Done handling change')
            } catch (err) {
                console.log(err)
            }
            console.group('event')
            console.log(event)
            console.groupEnd()
         }
         console.groupEnd()
    };

    useEffect(() => {
        // Set default value when component is loaded
        if (props.defaultValue && !selectedOption) {
            setSelectedOption({
                'label': props.defaultValue.ticker.toUpperCase(),
                'value': props.defaultValue.id + '|' + props.defaultValue.ticker
            });
        }
    }, [props.defaultValue, selectedOption]);

    return(
        <>
            <AsyncSelect
                name={props.name}
                value={selectedOption}
                onChange={handleSelect}
                loadOptions={loadOptions}
                isClearable
                placeholder="Type to find a symbol..."
                required
                isDisabled ={props.isDisabled ? true : false}
            />
        </>
    )
}

AsyncDropDown.propTypes = {
    django_url: PropTypes.string,
    handleChange: PropTypes.func,
    name: PropTypes.string,
    defaultValue: PropTypes.object,
    isDisabled: PropTypes.bool,
}