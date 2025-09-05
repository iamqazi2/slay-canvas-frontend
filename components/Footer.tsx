import assets from '@/app/assets'
import Image from 'next/image'
import React from 'react'

const Footer = () => {
  return (
    <div className='bg-[#111827] pt-14 pb-10 '>
      <div className='flex flex-col items-center main-container'>
        <div className='flex flex-col items-center gap-2 mb-10'>
          <Image src={assets.slayCanvas} alt='slayCanvas' width={135} height={24}/>
          <h6 className='text-[#BDB3B3]'>Your Creative Command Center</h6>
        </div>

        <ul className='flex flex-col sm:flex-row items-center gap-4 text-[#666666] mb-8 '>
          <li className='cursor-pointer hover:underline'>About</li>
          <li className='cursor-pointer hover:underline'>Contact</li>
          <li className='cursor-pointer hover:underline'>Privacy Policy</li>
          <li className='cursor-pointer hover:underline'>Terms of Services</li>
        </ul>

        <div className='flex items-center gap-2 mb-8'>
          <div className='bg-white/6 backdrop-blur-md p-3 rounded-full hover:bg-white'>
            <img className='w-5 h-5' src={assets.linkedin} alt="linkedin" />
          </div>
          <div className='bg-white/6 backdrop-blur-md p-3 rounded-full hover:bg-white'>
            <img className='w-5 h-5' src={assets.twitter} alt="twitter" />
          </div>
          <div className='bg-white/6 backdrop-blur-md p-3 rounded-full hover:bg-white'>
            <img className='w-5 h-5' src={assets.email} alt="twitter" />
          </div>
        </div>

        <hr className='bg-[#666666] h-[1.5px] w-[95%] ' />

        <span className='mt-8 text-[#BDB3B3] text-sm'>© 2025 SlayCanvas. All rights reserved. </span>
      </div>

    </div>
  )
}

export default Footer