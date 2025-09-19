import assets from '@/app/assets'
import Image from 'next/image'
import React, { Dispatch, SetStateAction, useState } from 'react'

interface FormData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    otp: [string, string, string, string, string, string];
    newPassword: string;
    confirmPassword: string;
}

type InputProps = {
    formData: FormData;
    setFormData: Dispatch<SetStateAction<FormData>>;
};


const Input: React.FC<InputProps> = ({ formData, setFormData }) => {

    const [showPassword, setShowPassword] = useState(false)

    return (
        <>
            <div className='flex flex-col'>
                <span className='text-xs mb-1.5'>Email</span>
                <input
                    className='w-full outline-[#005EA0] py-2 px-3 rounded-lg bg-[#f5f5f5] border-1 border-gray-300'
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder='alma.lawson@example.com'
                />
            </div>

            <div className='flex flex-col relative'>
                <span className='text-xs mb-1.5'>Password</span>
                <input className='w-full outline-[#005EA0] py-2 px-3 rounded-lg bg-[#f5f5f5] border-1 border-gray-300'
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder='Enter your password'
                />

                <Image onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-sm text-black"
                    alt='' src={assets.inputEye} width={20} height={20} />

            </div>
        </>
    )
}

export default Input