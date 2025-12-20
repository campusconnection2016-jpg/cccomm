import React from 'react'
import '../../../../styles/students.css';

const CustomInput = ({ customInput, setCustomInput }) => {
    return (
        <>
            {" "}
            <textarea
                rows="5"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Custom Input"
                className='cus-ip-container'
            ></textarea>
        </>
    )
}

export default CustomInput;