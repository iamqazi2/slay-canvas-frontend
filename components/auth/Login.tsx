"use client"
import React, { Dispatch, SetStateAction } from 'react'
import Input from '../ui/Input'
import FormBtn from '../ui/FormBtn'
import GoogleBtn from '../ui/GoogleBtn'
import FormHeading from '../Headings/FormHeading'
import { useRouter } from 'next/navigation'


interface FormData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    otp: [string, string, string, string, string, string];
    newPassword: string;
    confirmPassword: string;
}

type LoginProps = {
    setCurrentView: (view: "login" | "signup" | "forget" | "otp" | "reset") => void
    formData: FormData;
    setFormData: Dispatch<SetStateAction<FormData>>;
};


const Login: React.FC<LoginProps> = ({ setCurrentView, formData, setFormData }) => {

    const router = useRouter();

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault()

        console.log("login", formData)

        setFormData({
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            otp: ["", "", "", "", "", ""],
            newPassword: "",
            confirmPassword: "",
        })
        // router.push('/')
    }

    return (
        <div className='flex m-auto items-center justify-center py-8 md:py-0 bg-white md:w-150 md:h-120  rounded-2xl'>
            <div className='w-[400px] px-5 md:px-0'>
                <FormHeading text='Welcome back👋' text2='Enter your credentials to access your account' />

                <form onSubmit={(e) => {
                    submitHandler(e);
                }} className='flex flex-col gap-2'>
                    <Input formData={formData} setFormData={setFormData} />

                    <div className='flex justify-between items-center mt-2'>
                        <div className='flex gap-2 items-center'>
                            <div className='w-4.5 h-4.5 border-1 border-gray-300 rounded-full' />
                            <span className='text-xs'>Remember me</span>
                        </div>

                        <span onClick={() => setCurrentView("forget")} className='text-xs text-red-600 cursor-pointer'>Forget password ?</span>
                    </div>

                    <FormBtn text='Log in' />

                    <div className="flex items-center gap-2">
                        <hr className="flex-grow border-gray-400" />
                        <p className="text-gray-600">or</p>
                        <hr className="flex-grow border-gray-400" />
                    </div>


                    <GoogleBtn />

                    <span className='text-center text-sm '>Don’t have an account? <span onClick={() => setCurrentView("signup")} className='font-semibold text-[#1279ff] cursor-pointer'>Create Account</span></span>

                </form>
            </div>
        </div>
    )
}

export default Login