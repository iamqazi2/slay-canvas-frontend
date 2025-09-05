"use client"
import Link from 'next/link';
import React from 'react'
import { motion } from "framer-motion";
import { fadeIn } from '@/app/variants';
import { img } from 'motion/react-client';

type ButtonProps = {
  text: string;
  text2: string;
  width?: string;
  link?: string;
  variant1?: "default" | "inverted";
  variant2?: "default" | "inverted";
  icon1?: string;
  icon2?: string;
}

const Sec1Btn: React.FC<ButtonProps> = ({ text, text2, width, link, variant1, variant2, icon1, icon2 }) => {
  return (
    <motion.div
      variants={fadeIn({ direction: "up", delay: 0.2 })}
      initial="hidden"
      whileInView="show"

      className='flex gap-4 justify-center'
    >

      <button
        className={`
      flex items-center gap-2 px-3 text-xs md:px-4.5 py-2.5 rounded-xl font-medium sm:text-sm cursor-pointer
      ${variant1 === "default"
            ? "bg-gradient-to-r from-[#8e5eff] to-[#4596ff] text-white"
            : "bg-white text-[#1279ff] hover:bg-[#9c73fa] hover:text-white transition-all duration-300"}
    `}
      >
        {icon1 && <img src={icon1} alt="btn-icon1" className="w-4 h-4" />}
        {text}
      </button>

      {link ? (
        <Link href={link}>
          <button
            className="px-3 text-xs md:px-4.5 py-[10.5px] rounded-xl text-[#1279ff] sm:text-sm font-medium w-25 border-1 border-[#1279ff] hover:bg-gradient-to-r from-[#8e5eff] to-[#4596ff] hover:text-white transition-all duration-1000 cursor-pointer hover:border-gray-400"
            style={{ width }}
          >
            {text2}
          </button>
        </Link>
      ) : (
        <button
          className={`
            flex items-center gap-2 px-3 text-xs md:px-4.5 py-2 rounded-xl sm:text-sm font-medium w-25 border border-[#1279ff] transition-all duration-1000 cursor-pointer hover:border-gray-400
            ${variant2 === "default"
              ? "text-[#1279ff] hover:bg-gradient-to-r from-[#8e5eff] to-[#4596ff] hover:text-white"
              : "bg-white text-[#1279ff] hover:bg-[#9c73fa] hover:text-white transition-all duration-300"}
          `}
          style={{ width }}
        >
          {icon2 && <img src={icon2} alt="btn-icon2" className="w-4 h-4" />}
          {text2}
        </button>
      )}
    </motion.div>
  )
}

export default Sec1Btn