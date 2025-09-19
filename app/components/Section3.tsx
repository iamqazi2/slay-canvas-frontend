import React from 'react'
import MainHeading from './Headings/MainHeading'
import Sec3Cards from './cards/Sec3Cards'

const Section3 = () => {
  return (
    <div className='pt-16 pb-14 md:pb-18 px-3 md:px-10 main-container relative overflow-hidden'>
      <MainHeading text='Why SlayCanvas?'
        text2='Everything you need to organize, collaborate, and create in one powerful workspace.'
        fontSize='text-2xl sm:text-3xl md:text-4xl'
        width='max-w-140'
        subFontSize='text-[18px] md:text-[20px]'
        leading='pb-2.5'
      />

      <Sec3Cards />
    </div>
  )
}

export default Section3