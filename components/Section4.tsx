import React from 'react'
import MainHeading from './Headings/MainHeading'
import Sec1Dashboard from './cards/Sec1Dashboard'
import Sec4Card from './cards/Sec4Card'
import Sec1Btn from './ui/Sec1Btn'
import assets from '@/app/assets'

const Section4 = () => {
  return (
    <div className='px-3 md:px-10 relative main-container overflow-hidden'>
      <MainHeading text='See SlayCanvas in Action'
        text2='Experience the power of our AI-powered creative workspace with real product demonstrations.'
        fontSize='text-2xl sm:text-3xl md:text-4xl'
        width='max-w-155'
        subFontSize='text-[18px] md:text-[20px]'
        leading='pb-2.5'
      />

      <Sec1Btn text='See Demo' text2='Watch Video' variant1="default" variant2="default" icon1={assets.eye} width='140px' icon2={assets.play} />

      <Sec1Dashboard />

      <Sec4Card />

    </div>
  )
}

export default Section4