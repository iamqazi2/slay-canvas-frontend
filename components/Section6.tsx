import assets from '@/app/assets'
import Image from 'next/image'
import React from 'react'
import Sec6Card from './cards/Sec6Card'
import Sec6Heading from './Headings/Sec6Heading'

const Section6 = () => {
    return (
        <div className='px-3 md:px-10 main-container overflow-hidden'>
            <div className='mb-20 flex-row md:flex  items-center justify-between'>
                {/* left */}
                <Sec6Heading />

                {/* right */}
                <div>
                 <Sec6Card />
                </div>

            </div>
        </div>
    )
}

export default Section6