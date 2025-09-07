"use client"
import assets from '@/app/assets'
import React from 'react'
import { motion } from "framer-motion";
import { fadeIn } from '@/app/variants';

const Sec6Card = () => {
    return (
        <motion.div
            variants={fadeIn({ direction: "left", delay: 0.3 })}
            initial="hidden"
            whileInView="show"

            className="relative group w-full flex justify-center">
            <div
                className="w-[72vw] h-[280px] sm:w-[80vw] sm:h-[450px] md:h-[350px] md:w-[50vw] lg:h-[450px] lg:w-[500px] absolute z-10 left-6 top-3 bg-gradient-to-r from-[#edeaf2] to-[#f7faff] rounded-3xl  transition-all duration-500 ease-in-out group-hover:-rotate-12 group-hover:left-0"
            />

            <img
                className="relative z-20 lg:max-w-[550px] transition-all duration-500 ease-in-out"
                src={assets.noteBook}
                alt="notebook"
            />
        </motion.div>
    )
}

export default Sec6Card