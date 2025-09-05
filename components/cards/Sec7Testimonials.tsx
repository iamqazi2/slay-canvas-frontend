import assets, { testimonials } from '@/app/assets'
import React from 'react'

const Sec7Testimonials = () => {
  return (
    <div className='overflow-x-auto slider'>
      <div className='flex items-center gap-7 animate-slider pt-10'>
      {testimonials.map((item) => {
        return (
          <div key={item.id} className='bg-white w-[330px] md:w-[350px] pt-8  px-4 pb-6 rounded-xl relative' >
            <img className='w-[45px] absolute -right-3 -top-3' src={assets.reviewElem} alt="" />
            <p className='w-78 text-sm mb-4'>{item.review}</p>
            <div className='flex items-center gap-2'>
              <img className='w-[60px] h-[60px] rounded-full' src={item.img} alt="client" />
              <div className=''>
                <h5 className='font-semibold'>{item.name}</h5>
                <div className='flex gap-0.5 items-center'>
                  <img className='w-[15px]' src={assets.star} alt="star" />
                  <img className='w-[15px]' src={assets.star} alt="star" />
                  <img className='w-[15px]' src={assets.star} alt="star" />
                  <img className='w-[15px]' src={assets.star} alt="star" />
                  <img className='w-[17px]' src={assets.halfStar} alt="star" />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
    </div>
  )
}

export default Sec7Testimonials