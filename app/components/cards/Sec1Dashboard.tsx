"use client"
import assets from '@/app/assets'
import Image from 'next/image'
import React from 'react'
import { motion } from "framer-motion";
import { fadeIn } from '@/app/variants';

const Sec1Dashboard = () => {
    return (
        <motion.div
            variants={fadeIn({ direction: "up", delay: 0.1 })}
            initial="hidden"
            whileInView="show"

            className='flex justify-center my-10 md:mt-20 mb-12 relative'>

            <div className='shadow-xl flex items-center gap-3 h-[85px] sm:h-[100px] w-[234px] sm:w-[277px] bg-white rounded-xl px-3.5 absolute left-1/2 -translate-x-1/2 lg:left-1/6 lg:-translate-x-1/6 -top-6 lg:-top-2'>
                <Image src={assets.AI} alt="AI" width={60} height={60} />
                <div>
                    <h4 className='font-semibold text-sm mb-1'>AI Chat Active</h4>
                    <p className='text-xs text-[#666666]'>Getting insights....</p>
                </div>
            </div>

            <Image src={assets.dashboard} alt="Logo" width={700} height={40} />

            <div className=' flex flex-col justify-center h-[60px] sm:h-[85px] w-[180px] sm:w-[224px] shadow-xl bg-white rounded-xl px-3.5 absolute bottom-0 lg:bottom-16 right-1/2 translate-1/2 lg:right-1/6 lg:translate-x-1/6'>
                <h4 className='font-semibold text-sm mb-1'>Real Time Collboration</h4>
                <Image src={assets.users} alt="AI" width={60} height={60} />
            </div>

        </motion.div>
    )
}

export default Sec1Dashboard