import React from 'react'
import MainHeading from './Headings/MainHeading'
import Sec1Btn from './ui/Sec1Btn'
import Image from 'next/image'
import assets, { users } from '@/app/assets'
import Sec1Dashboard from './cards/Sec1Dashboard'

const Section1 = () => {

    const totalStars = 4;

    return (
        <div className='md:py-10 main-container px-3 relative overflow-hidden'>
            <MainHeading text='Your Creative Command Center'
                text2='Merge moodboards, AI chat, and research notebooks into one powerful workspace'
                fontSize='text-2xl sm:text-3xl md:text-5xl'
                subFontSize='text-[18px] md:text-[22px]'
                width='max-w-135'
                leading='leading-14 md:leading-20'
            />

            <Sec1Btn text="Start Free" text2="Get Demo" width='101px' variant1='default' variant2='default' />

            <Sec1Dashboard />

            <div className='flex flex-col sm:flex-row items-center justify-center gap-3 mb-4'>
                <div className='flex -space-x-4'>
                    {users.map((item) => (
                        <Image key={item.id} className='rounded-full border-2 transition-all duration-300 border-white hover:border-[#1279ff]' src={item.src} alt="user1" width={80} height={80} />
                    ))}
                </div>

                <div>
                    <div className='flex gap-2 mb-2 justify-center sm:justify-start'>
                        {Array.from({ length: totalStars }).map((_, idx) => (
                            <Image key={idx} src={assets.star} alt='star' width={22} height={21} />
                        ))}
                    </div>

                    <p className='font-medium'>Trusted by 100000+ Users</p>
                </div>
            </div>
        </div>
    )
}

export default Section1