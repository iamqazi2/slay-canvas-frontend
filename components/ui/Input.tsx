import assets from '@/app/assets'
import React, { useState } from 'react'

type InputProps = {
      formData: {
    email: string;
    password: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const Input: React.FC<InputProps> = ({formData, setFormData}) => {

    const [showPassword, setShowPassword] = useState(false)

    return (
        <>
            <div className='flex flex-col'>
                <span className='text-xs mb-1.5'>Email</span>
                <input className='w-full outline-[#005EA0] py-2 px-3 rounded-lg bg-[#f5f5f5] border-1 border-gray-300' 
                type="email" 
                placeholder='alma.lawson@example.com' 
                value={formData.email ?? ""}
                onChange={(e)=> setFormData({...formData, email: e.target.value})}
                />
            </div>

            <div className='flex flex-col relative'>
                <span className='text-xs mb-1.5'>Password</span>
                <input className='w-full outline-[#005EA0] py-2 px-3 rounded-lg bg-[#f5f5f5] border-1 border-gray-300' 
                type={showPassword ? 'text' : 'password'} 
                placeholder='Enter your password' 
                value={formData.password ?? ""}
                onChange={(e)=> setFormData({...formData, password: e.target.value})}
                />

            <img onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-sm text-black"
                src={assets.inputEye} />
                    
                
            </div>
        </>
    )
}

export default Input