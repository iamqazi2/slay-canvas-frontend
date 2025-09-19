"use client";
import assets, { faqData } from "@/app/assets";
import Image from "next/image";
import React, { useState } from "react";

const Sec9Card = () => {

  // jo question select hoga uska index save karenge
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col md:flex-row items-center gap-3">
      {/* Left Side Questions */}
      <div className="bg-white shadow px-3 pt-5 pb-3 w-[93vw] sm:w-150 rounded-2xl lg:h-[360px]">
        <h3 className="font-semibold text-3xl">FAQ’s.</h3>

        <div className="w-full flex flex-col gap-3 mt-6 ">
          {faqData.map((faq, i) => (
            <div
              key={i}
              onClick={() => setSelected(i)}
              className={`py-7 px-5 cursor-pointer bg-gradient-to-r from-[#7c45fc2f] to-[#2b87ff2e] flex justify-between items-center rounded-3xl font-medium ${selected === i ? "border-2 border-[#7c45fc]" : ""
                }`}
            >
              <span>{faq.question}</span>
              {selected === i && (
                <Image src={assets.elem} alt="elem" width={20} height={20} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side Answer */}
      <div className="bg-white shadow px-3 pt-5 pb-3 sm:w-150 rounded-2xl lg:h-[360px]">
        <h3 className="font-semibold text-3xl">Ans.</h3>
        <div className="lg:h-[264px] bg-gradient-to-r from-[#7c45fc2f] to-[#2b87ff2e] mt-6 py-5 px-3 rounded-3xl ">
          <Image src={assets.elem} alt="elem" width={20} height={20} />
          <p className="mx-10 my-4">{faqData[selected].answer}</p>
        </div>
      </div>
    </div>
  );
};

export default Sec9Card;
