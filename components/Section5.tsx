"use client"
import React from 'react'
import MainHeading from './Headings/MainHeading'
import Image from 'next/image'
import assets, { head } from '@/app/assets'
import { motion } from "framer-motion";
import { fadeIn } from '@/app/variants'

const Section5 = () => {
    return (
        <div className='px-[7.5px] bg-gradient-to-r from-[#8e5eff2f] to-[#4596ff2e] py-10 mx-3 md:mx-10 mb-15 md:mb-20 rounded-3xl overflow-hidden'>
            <div className='main-container'>
                <MainHeading
                text='Create, Collaborate, and Conquer—All in One Place'
                text2='Drag and drop your favorite content to create scripts, blogs, and strategies in minutes—collaborate with your team, Figma style.'
                fontSize='text-2xl sm:text-3xl md:text-4xl'
                width='max-w-200'
                subFontSize='text-[18px] md:text-[20px]'
                leading='pb-2.5'
            />

            <div className='px-5 py-4'>
                <div className='flex flex-col md:flex-row justify-between items-center'>

                <Image src={assets.Sec5Img} alt='section5Img' width={1131} height={933}/>

                </div>
            </div>
            </div>
        </div>
    )
}

export default Section5 