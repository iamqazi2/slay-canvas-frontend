"use client"
import Image from 'next/image'
import React, { useState } from 'react'
import assets from '../assets'
import Login from '@/components/auth/Login'
import Signup from '@/components/auth/Signup'
import Forget from '@/components/auth/Forget'
import Authentication from '@/components/auth/Authentication'
import Reset from '@/components/auth/Reset'
import Link from 'next/link'

type View = "login" | "signup" | "forget" | "otp" | "reset";

interface FormState {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    otp: [string, string, string, string, string, string]; // Tuple for exactly 6 strings
    newPassword: string;
    confirmPassword: string;
}

const Form = () => {

    const [formData, setFormData] = useState<FormState>({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        otp: ["", "", "", "", "", ""],
        newPassword: "",
        confirmPassword: "",
    })

    const [currentView, setCurrentView] = useState<View>("login")

    return (
        <div className='bg-gradient-to-r from-[#8e5eff] to-[#4596ff] w-full min-h-screen relative px-5'>
            <div className='pt-8 pb-4 md:pb-0 md:px-1 flex items-center justify-center md:justify-start'>
                <Link href='/'>
                    <Image src={assets.whiteLogo} alt='whiteLogo' height={40} width={140} />
                </Link>
            </div>

            {currentView === "login" && (
                <Login setCurrentView={setCurrentView} formData={formData} setFormData={setFormData} />
            )}
            {currentView === "signup" && (
                <Signup setCurrentView={setCurrentView} formData={formData} setFormData={setFormData} />
            )}
            {currentView === "forget" && (
                <Forget setCurrentView={setCurrentView} formData={formData} setFormData={setFormData} />
            )}
            {currentView === "otp" && (
                <Authentication setCurrentView={setCurrentView} formData={formData} setFormData={setFormData} />
            )}
            {currentView === "reset" && (
                <Reset setCurrentView={setCurrentView} formData={formData} setFormData={setFormData} />
            )}
        </div>
    )
}

export default Form
