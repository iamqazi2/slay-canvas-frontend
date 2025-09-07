import React, { Dispatch, SetStateAction } from 'react'
import FormBtn from '../ui/FormBtn';
import Input from '../ui/Input';
import FormHeading from '../Headings/FormHeading';
import GoogleBtn from '../ui/GoogleBtn';
import { useRouter } from 'next/navigation';

interface FormData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    otp: [string, string, string, string, string, string];
    newPassword: string;
    confirmPassword: string;
}

type LogoutProps = {
    setCurrentView: (view: "login" | "signup" | "forget" | "otp" | "reset") => void;
    formData: FormData;
    setFormData: Dispatch<SetStateAction<FormData>>;
};

const Signup: React.FC<LogoutProps> = ({ setCurrentView, formData, setFormData }) => {

    const router = useRouter()

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("signup", formData)

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
        <div className='flex m-auto items-center justify-center bg-white md:w-150 md:h-130 py-8 rounded-2xl flex-shrink-3   '>
            <div className='w-[400px] px-5 md:px-0'>
                <FormHeading text='Create account' text2='Enter your credentials to create your account' />

                <form onSubmit={(e) => {
                    submitHandler(e);
                }} className='flex flex-col gap-2'>

                    <div className='flex gap-1.5 max-w-[400px]'>
                        <div className='flex flex-col gap-1'>
                            <span className='text-xs'>First name</span>
                            <input className='w-full rounded-lg bg-[#f5f5f5] px-3 py-2 border border-gray-200'
                                type="text"
                                placeholder='Your first name'
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />

                        </div>
                        <div className='flex flex-col gap-1'>
                            <span className='text-xs'>Last name</span>
                            <input className='w-full rounded-lg bg-[#f5f5f5] px-3 py-2 border border-gray-200'
                                type="text"
                                placeholder='Your last name'
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />

                        </div>
                    </div>

                    <Input formData={formData} setFormData={setFormData} />

                    <div className='flex items-center gap-2'>
                        <div className='h-4.5 w-4.5 border-1 border-black rounded-full' />
                        <span className='text-xs'>Agree with <span className='font-bold'>terms & conditions</span></span>
                    </div>

                    <FormBtn text='Sign up' />

                    <div className="flex items-center gap-2">
                        <hr className="flex-grow border-gray-400" />
                        <p className="text-gray-600">or</p>
                        <hr className="flex-grow border-gray-400" />
                    </div>


                    <GoogleBtn />

                    <span className='text-center text-sm '>already have an account? <span onClick={() => setCurrentView("login")} className='font-semibold text-[#1279ff] cursor-pointer'>Log In</span></span>

                </form>
            </div>
        </div>
    )
}

export default Signup