import assets from '@/app/assets'
import React from 'react'

const GoogleBtn = () => {
    return (
        <button className='border border-gray-300 py-2.5 flex justify-center items-center gap-2 rounded-xl'>
            <img src={assets.google} alt="google" />
            <span>Continue with Google</span>
        </button>
    )
}

export default GoogleBtn