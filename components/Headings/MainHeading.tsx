"use client";
import React from 'react'
import { motion } from "framer-motion";
import { fadeIn } from '@/app/variants';

type HeadingProps = {
  text: string;
  text2: string;
  fontSize?: string;
  width?: string;
  subFontSize?: string;
  leading?: string;
  color1?: string; // 👈 heading color
  color2?: string; // 👈 subtext color
}

const MainHeading: React.FC<HeadingProps> = ({text, text2, fontSize, width, subFontSize, leading, color1, color2}) => {
  return (
    <motion.div
      variants={fadeIn({ direction: "up", delay: 0 })}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.7 }}
      className="flex flex-col items-center pb-6"
    >

      <h1
        className={`text-center font-bold ${fontSize} ${leading} ${color1
            ? color1 
            : "bg-gradient-to-r from-[#8e5eff] to-[#4596ff] bg-clip-text text-transparent"
          }`}
      >
        {text}
      </h1>

      <p
        className={`text-center ${width} ${subFontSize} leading-7 ${color2 ? color2 : "text-[#666666]" // default gray, agar na chahiye to override white
          }`}
      >
        {text2}
      </p>
    </motion.div>
  )
}

export default MainHeading;
