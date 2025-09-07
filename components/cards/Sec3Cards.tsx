"use client";

import assets from '@/app/assets';
import Image from 'next/image';
import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/app/variants';

const features = [
    {
        title: "Creators",
        subtitle: "Design boards for inspiration and campaigns.",
        description:
            "Perfect for designers, content creators, and marketers who need to organize visual inspiration and collaborate on creative projects.",
        icon: assets.paint,
        image: assets.creators,
        gradient: "from-[#c3a9fe2f] to-[#98c2f82e]",
    },
    {
        title: "Researchers",
        subtitle: "Compile resources and get AI-driven summaries.",
        description:
            "Ideal for academics, analysts, and professionals who need to organize research materials and extract key insights quickly.",
        icon: assets.book,
        image: assets.researchers,
        gradient: "from-[#c3a9fe2f] to-[#98c2f82e]",
        reverse: true,
    },
    {
        title: "Teams",
        subtitle: "Collaborate in real-time on creative projects.",
        description:
            "Built for teams that need to share ideas, provide feedback, and work together seamlessly across different projects.",
        icon: assets.groupElem,
        image: assets.team,
        gradient: "from-[#c3a9fe2f] to-[#98c2f82e]",
    },
];

const Sec3Cards: React.FC = () => {
    return (
        <div className="flex flex-col gap-10">
            {features.map((item, idx) => (
                <div key={idx} className={`flex flex-col md:flex-row justify-between items-center ${item.reverse ? "md:flex-row-reverse" : ""}`}>

                    {/* Text Section */}
                    <motion.div
                        variants={fadeIn({ direction: "up", delay: 0 })}
                        initial="hidden"
                        whileInView="show"

                        className={`flex flex-col items-center md:items-start gap-2 lg:gap-3 max-w-[542px] h-[274px] sm:h-[240px] ${item.reverse ? "md:ml-10" : "md:mr-10"}`}
                    >
                        <Image src={item.icon} width={60} height={60} alt={item.title} />
                        <h2 className='font-bold text-xl lg:text-2xl leading-8'>{item.title}</h2>
                        <h6 className='text-center md:text-left font-medium text-lg md:text-xl leading-8'>{item.subtitle}</h6>
                        <p className='text-center md:text-left text-sm md:text-lg lg:max-w-[540px]'>{item.description}</p>
                    </motion.div>

                    {/* Image Section */}
                    <motion.div
                        variants={fadeIn({ direction: "up", delay: 0.4 })}
                        initial="hidden"
                        whileInView="show"

                        className={`relative rounded-3xl bg-gradient-to-r ${item.gradient} p-8 w-full max-w-[550px]`}
                    >
                        <div className='relative w-full aspect-[578/371]'>
                            <Image src={item.image} alt={item.title} fill style={{ objectFit: "contain" }} />
                        </div>
                    </motion.div>
                </div>
            ))}
        </div>
    );
};

export default Sec3Cards;
