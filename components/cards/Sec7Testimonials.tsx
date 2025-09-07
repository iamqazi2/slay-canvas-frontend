import assets, { testimonials } from '@/app/assets'
import Image from 'next/image'
import React from 'react'

const Sec7Testimonials = () => {
  return (
    <div className='overflow-x-auto slider'>
      <div className='flex items-center gap-7 animate-slider pt-10'>
        {testimonials.map((item) => {
          return (
            <div key={item.id} className='bg-white w-[330px] md:w-[350px] pt-8  px-4 pb-6 rounded-xl relative' >
              <Image className=' absolute -right-3 -top-3' src={assets.reviewElem} height={45} width={45} alt="" />
              <p className='w-78 text-sm mb-4'>{item.review}</p>
              <div className='flex items-center gap-2'>
                <Image className=' rounded-full h-[60px] object-cover object-bottom-0' src={item.img} width={60} height={60} alt="client" />
                <div className=''>
                  <h5 className='font-semibold'>{item.name}</h5>
                  <div className='flex gap-0.5 items-center'>
                    <Image width={15} height={15} src={assets.star} alt="star" />
                    <Image width={15} height={15} src={assets.star} alt="star" />
                    <Image width={15} height={15} src={assets.star} alt="star" />
                    <Image width={15} height={15} src={assets.star} alt="star" />
                    <Image width={15} height={15} src={assets.halfStar} alt="star" />
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