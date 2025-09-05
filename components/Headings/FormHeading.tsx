import React from 'react'

type FormProps = {
    text: string;
    text2: string;
}

const FormHeading: React.FC<FormProps> = ({text, text2}) => {
    return (
        <div className='mb-3'>
            <h2 className='font-bold text-2xl'>{text}</h2>
            <p className='text-[#666666] text-sm'>{text2}</p>
        </div>
    )
}

export default FormHeading