import Navbar from '@/components/Navbar'
import Section1 from '@/components/Section1'
import Section2 from '@/components/Section2'
import Section3 from '@/components/Section3'
import Section4 from '@/components/Section4'
import Section5 from '@/components/Section5'
import Section6 from '@/components/Section6'
import Image from 'next/image'
import React from 'react'
import assets from '../assets'
import Section7 from '@/components/Section7'
import Section8 from '@/components/Section8'
import Section9 from '@/components/Section9'
import Footer from '@/components/Footer'

const Home = () => {
  return (
    <div className=''>
      <Image className="absolute top-0 left-1/2 -translate-x-1/2 hidden sm:block" src={assets.halfCircle} alt="Logo" width={130} height={45} />
      <Image className="absolute top-15 left-10 hidden sm:block" src={assets.circle} alt="Logo" width={130} height={45} />
      <Navbar />
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <Section6 />
      <Section7 />
      <Section8 />
      <Section9 />
      <Footer />
    </div>
  )
}

export default Home