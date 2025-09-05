"use client"
import Image from 'next/image'
import React, { useState } from 'react'
import assets from '../assets'
import Login from '@/components/auth/Login'
import Logout from '@/components/auth/Logout'
import Forget from '@/components/auth/Forget'
import Authentication from '@/components/auth/Authentication'
import Reset from '@/components/auth/Reset'
import Link from 'next/link'

type FormDataType = {
    first: string;
    last: string;
    email: string;
    password: string;
    newPassword: string;
    confirmPassword: string;
}

const Form = () => {

    const [forget, setForget] = useState<boolean>(false)
    const [showAuth, setShowAuth] = useState(false)
    const [createAccount, setCreateAccount] = useState<boolean>(false)
    const [reset, setReset] = useState<boolean>(false)

    const [formData, setFormData] = useState<FormDataType>({
        first: "",
        last: "",
        email: "",
        password: "",
        newPassword: "",
        confirmPassword: ""
    });

    return (
        <div className='bg-gradient-to-r from-[#8e5eff] to-[#4596ff] w-full min-h-screen relative px-5'>
            <div className='pt-8 pb-4 md:pb-0 md:px-1 flex items-center justify-center md:justify-start'>
                <Link href='/'><Image src={assets.whiteLogo} alt='whiteLogo' height={40} width={140} /></Link>
            </div>

            {showAuth ? (
                <Authentication setAuth={setShowAuth} setReset={setReset} />
            ) : reset ? (
                <Reset setReset={setReset} formData={formData} setFormData={setFormData} />
            ) : forget ? (
                <Forget setForget={setForget} setAuth={setShowAuth} formData={formData} setFormData={setFormData} />
            ) : createAccount ? (
                <Logout setCreateAccount={setCreateAccount} formData={formData} setFormData={setFormData} />
            ) : (
                <Login setCreateAccount={setCreateAccount} setForget={setForget} formData={formData} setFormData={setFormData} />
            )}
        </div>
    )
}

export default Form
