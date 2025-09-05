import React from 'react'
import MainHeading from './Headings/MainHeading'
import Sec9Card from './cards/Sec9Card'

const Section9 = () => {
    return (
        <div className='pt-12 pb-20 overflow-hidden'>
            <div className='px-3 md:px-10 main-container'>
                <MainHeading
                    text='Frequently Asked Questions'
                    text2='Got questions? We’ve got answers. Here are some of the most common questions about SlayCanvas and how it works.'
                    fontSize='text-2xl sm:text-3xl md:text-4xl'
                    width='max-w-190'
                    subFontSize='text-[18px] md:text-[20px]'
                    leading='pb-2.5'
                />

                <Sec9Card />
            </div>

        </div>
    )
}

export default Section9