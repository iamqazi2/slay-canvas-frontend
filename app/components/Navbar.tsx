"use client"
import React from 'react'
import assets from "@/app/assets";
import Image from 'next/image';
import Sec1Btn from './ui/Sec1Btn';
import Link from 'next/link';

const Navbar = () => {

    return (
        <div className='flex gap-4 md:gap-0 flex-col md:flex-row items-center justify-between px-10 py-4 main-container '>
            <Link href="/"><Image src={assets.logo} alt="Logo" width={160} height={45} className="cursor-pointer" /></Link>
            <Sec1Btn text='Get Slay Canvas' text2='Log in' width='139px' link2='/form' link='/payment' variant1="default" variant2="default" />
        </div>
    )
}

export default Navbar