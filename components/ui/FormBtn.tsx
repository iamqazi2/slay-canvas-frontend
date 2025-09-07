import React from 'react'

type BtnProps = {
  text: string;
}

const FormBtn: React.FC<BtnProps> = ({ text }) => {
  return (
    <button
      className='bg-gradient-to-r from-[#8e5eff] to-[#4596ff] text-white py-3 rounded-xl cursor-pointer mt-2 w-full'
    >
      {text}
    </button>
  )
}

export default FormBtn