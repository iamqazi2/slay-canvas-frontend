"use client"
import assets, { dashboardCards } from '@/app/assets'
import Image from 'next/image'
import React from 'react'
import { motion } from "framer-motion";
import { fadeIn } from '@/app/variants';

const Sec4Card = () => {
    return (
        <div className='flex flex-col sm:flex-row gap-4.5 pt-15 mb-20'>
            {dashboardCards.map((item) => {
                return (
                    <motion.div 
                    variants={fadeIn({ direction: "up", delay: 0.2 })}
                    initial="hidden"
                    whileInView="show"
                    
                    key={item.id} className='group py-2 px-3 bg-white border border-gray-300 rounded-3xl flex-shrink-0 sm:shrink-3 hover:bg-[#5E63FF] hover:text-white transition-colors duration-300'>
                        <Image src={item.img} alt='item.heading' height={243} width={548} />
                        <div className='pb-6 pt-5 max-w-65 text-center sm:text-left m-auto sm:m-0'>
                            <h4 className='font-semibold text-xl'>{item.heading}</h4>
                            <p className='text-[#666666] group-hover:text-white transition-colors duration-300'>
                                {item.para}
                            </p>
                        </div>
                    </motion.div>
                )
            })}

        </div>
    )
}

export default Sec4Card