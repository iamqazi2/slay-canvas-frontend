import React from 'react'
import FormBtn from '../ui/FormBtn';
import Input from '../ui/Input';
import FormHeading from '../Headings/FormHeading';
import GoogleBtn from '../ui/GoogleBtn';
import { useRouter } from 'next/navigation';

type LogoutProps = {
    setCreateAccount: React.Dispatch<React.SetStateAction<boolean>>;
    formData: {
        email: string;
        password: string;
        first: string;
        last: string;
    }
    setFormData: React.Dispatch<React.SetStateAction<any>>
};

const Logout: React.FC<LogoutProps> = ({ setCreateAccount, formData, setFormData }) => {

    const router = useRouter()

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("signup", formData)

        setFormData({
            first: "",
            last: "",
            email: "",
            password: "",
        });

        router.push('/')
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
                            value={formData.first ?? ""}
                            onChange={(e)=> setFormData({...formData, first: e.target.value})}
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <span className='text-xs'>Last name</span>
                            <input className='w-full rounded-lg bg-[#f5f5f5] px-3 py-2 border border-gray-200' 
                            type="text" 
                            placeholder='Your last name' 
                            value={formData.last ?? ""}
                            onChange={(e)=> setFormData({...formData, last: e.target.value})}
                            />
                        </div>
                    </div>

                    <Input formData={formData} setFormData={setFormData}/>

                    <div className='flex items-center gap-2'>
                        <div className='h-4.5 w-4.5 border-1 border-black rounded rotate-10' />
                        <span className='text-xs'>Agree with <span className='font-bold'>terms & conditions</span></span>
                    </div>

                    <FormBtn text='Sign up' />

                    <div className="flex items-center gap-2">
                        <hr className="flex-grow border-gray-400" />
                        <p className="text-gray-600">or</p>
                        <hr className="flex-grow border-gray-400" />
                    </div>


                    <GoogleBtn />

                    <span className='text-center text-sm '>already have an account? <span onClick={() => setCreateAccount(false)} className='font-semibold text-[#1279ff] cursor-pointer'>Log In</span></span>

                </form>
            </div>
        </div>
    )
}

export default Logout