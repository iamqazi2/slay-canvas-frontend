import assets from '@/app/assets'
import React from 'react'

const Sec9Card = () => {
    return (
        <div className='flex flex-col md:flex-row items-center gap-3'>
            <div className='bg-white shadow px-3 pt-5 pb-3 w-[93vw] sm:w-150 rounded-2xl lg:h-[360px]'>
                <h3 className='font-semibold text-3xl'>FAQ’s.</h3>

                <div className='w-full flex flex-col gap-3 mt-6 '>
                    <div className='py-7 px-5 bg-gradient-to-r from-[#7c45fc2f] to-[#2b87ff2e] flex justify-between items-center rounded-3xl font-medium'>
                        <span>What is SlayCanvas and who is it for?</span>
                        <img src={assets.elem} alt="elem" />
                    </div>

                    <div className='py-7 px-5 bg-gradient-to-r from-[#7c45fc2f] to-[#2b87ff2e] flex justify-between items-center rounded-3xl font-medium'>
                        <span>Do I need design experience to use SlayCanvas?</span>
                    </div>

                    <div className='py-7 px-5 bg-gradient-to-r from-[#7c45fc2f] to-[#2b87ff2e] flex justify-between items-center rounded-3xl font-medium'>
                        <span>Do I need design experience to use SlayCanvas?</span>
                    </div>

                </div>
            </div>

            <div className='bg-white shadow px-3 pt-5 pb-3 sm:w-150 rounded-2xl lg:h-[360px]'>
                <h3 className='font-semibold text-3xl'>Ans.</h3>
                <div className='lg:h-[264px] bg-gradient-to-r from-[#7c45fc2f] to-[#2b87ff2e] mt-6 py-5 px-3 rounded-3xl '>
                    <img src={assets.elem} alt="elem" />
                    <p className='mx-10 my-4'>SlayCanvas is an AI-powered creative workspace that combines moodboards, research notebooks, and AI chat into one platform. It’s designed for creators, researchers, and teams who want to collect resources, brainstorm ideas, and organize everything visually in one place.</p>
                </div>
            </div>
        </div>
    )
}

export default Sec9Card