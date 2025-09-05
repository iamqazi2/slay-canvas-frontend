"use client"
import assets from '@/app/assets';
import React from 'react'
import { motion } from "framer-motion";
import { fadeIn } from '@/app/variants';

const Sec6Heading = () => {

        const text = [
        { id: 1, icon: assets.tick, text: "Summarize long videos, documents, or articles in seconds" },
        { id: 2, icon: assets.tick, text: "Get context-aware answers from your uploaded resources" },
        { id: 3, icon: assets.tick, text: "Generate structured notes, blogs, or scripts instantly" },
    ];

    return (
        <motion.div
        variants={fadeIn({ direction: "right", delay: 0.1 })}
        initial="hidden"
        whileInView="show"
        
        className='flex flex-col gap-4 items-center md:items-start'>
            <h2 className='font-bold text-xl md:text-3xl text-center md:text-left max-w-100 bg-gradient-to-r from-[#8e5eff] to-[#4596ff] bg-clip-text text-transparent'>Turn Hours of Content Into Seconds of Insight</h2>
            <p className='max-w-[395px] text-center md:text-left text-[#666666]'>Upload any file or link, ask what you need, and get clear, accurate answers in seconds. With InsightNotes, your content becomes interactive—like having a personal research assistant ready 24/7.</p>

            <ul className='mt-5 md:mt-0'>
                {text.map((item) => {
                    return (
                        <li key={item.id} className='flex flex-col items-center md:flex-row gap-1 md:gap-4 mb-5 text-center md:text-left'>
                            <img className='md:w-[24px] w-[30px]' src={item.icon} alt="tick" />
                            <span className='text-[#666666]'>{item.text}</span>
                        </li>
                    )
                })}
            </ul>
        </motion.div>
    )
}

export default Sec6Heading