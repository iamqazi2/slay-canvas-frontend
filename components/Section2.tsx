import React from 'react'
import MainHeading from './Headings/MainHeading'
import Image from 'next/image'
import assets from '@/app/assets'
import WorkCards from './cards/WorkCards'

const Section2 = () => {
  return (
    <div className='bg-gradient-to-r from-[#8e5eff2f] to-[#4596ff2e] w-full overflow-hidden'>
        <div className='px-3 md:px-10 pt-12 pb-15 main-container'>
            <MainHeading text='Why SlayCanvas?' 
            text2='Everything you need to organize, collaborate, and create in one powerful workspace.' 
            fontSize='text-2xl sm:text-3xl md:text-4xl' 
            width='max-w-140' 
            subFontSize='text-[18px] md:text-[20px]' 
            leading='pb-2.5' 
            />

            <WorkCards />
        </div>
    </div>
  )
}

export default Section2