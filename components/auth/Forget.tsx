import React from "react";
import FormHeading from "../Headings/FormHeading";
import FormBtn from "../ui/FormBtn";
import assets from "@/app/assets";

type ForgetProps = {
  setForget: React.Dispatch<React.SetStateAction<boolean>>;
  setAuth: React.Dispatch<React.SetStateAction<boolean>>;
  formData: {
  email: string;
  }
  setFormData: React.Dispatch<React.SetStateAction<any>>
};

const Forget: React.FC<ForgetProps> = ({ setForget, setAuth, formData, setFormData}) => {

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("forget", formData)
    setFormData({
      email: "",
    })

    setForget(false);
    setAuth(true)
  };

  return (
    <div className="flex m-auto relative items-center justify-center bg-white md:w-110 md:h-100 rounded-2xl mt-8">
      <div
        onClick={() => setForget(false)}
        className="absolute top-4 left-8 flex gap-2 items-center cursor-pointer"
      >
        <img src={assets.arrowleft} alt="arrowleft" />
        <span className="text-sm">Back</span>
      </div>

      <div className="w-[400px] px-8 py-8">
        <img className="m-auto w-20 mb-3" src={assets.lock} alt="Lock" />

        <div className="flex items-center justify-center text-center">
          <FormHeading
            text="Forget Your password ?"
            text2="Enter your email to get reset link"
          />
        </div>

        <form onSubmit={(e)=> {
            submitHandler(e)
        }} className="flex flex-col gap-3">
          <div>
            <span className="text-xs mb-1.5">Email</span>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email ?? ""}
              onChange={(e)=> setFormData({...formData, email: e.target.value})}
              className="w-full rounded-lg bg-[#f5f5f5] px-3 py-2 outline-[#005EA0] border border-gray-200"
            />
          </div>

          <FormBtn text="Submit" />
        </form>
      </div>
    </div>
  );
};

export default Forget;
