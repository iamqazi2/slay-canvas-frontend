import { cards } from '@/app/assets'
import Image from 'next/image'
import React from 'react'

const WorkCards = () => {

  const allCards = [...cards, ...cards]

  return (
    <div className="overflow-hidden pt-10 pb-6">
      <div className="flex gap-4 animate-slider">
        {allCards.map((item, index) => (
          <div key={index} className="overflow-hidden bg-white w-[290px] sm:w-[315px] h-[263px] rounded-xl border border-gray-200 py-6 px-7 relative shrink-0 hover:-translate-y-8 hover:scale-101 transition-all ease-in-out duration-500">
            <Image className='mb-4.5' src={item.img} alt='img' width={60} height={60} />
            <div className='w-[253px]'>
              <h4 className='font-bold mb-2.5 text-sm sm:text-lg'>{item.heading}</h4>
              <p className='text-xs sm:text-sm font-medium text-[#666666]'>{item.para}</p>
              <div className='bg-gradient-to-r from-[#814bff] to-[#4596ff] rounded-[60%] h-15 w-50 sm:w-65 absolute left-11 sm:left-7 -bottom-7'></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WorkCards
