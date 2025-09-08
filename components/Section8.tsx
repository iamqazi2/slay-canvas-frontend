import React from "react";
import MainHeading from "./Headings/MainHeading";
import Sec1Btn from "./ui/Sec1Btn";
import assets from "@/app/assets";
import Image from "next/image";

const Section8 = () => {
  return (
    <div className="w-full bg-gradient-to-r from-[#8e5eff] to-[#4596ff] relative overflow-hidden">
      <div className="bg-white/10 backdrop-blur-md w-20 h-20 rounded-full absolute hidden md:block top-20 left-10" />
      <div className="bg-white/10 backdrop-blur-md w-12 h-12 rounded-full absolute bottom-20 right-10" />

      <div className="py-12 main-container">
        <div
          className="py-4 px-5 rounded-full text-white flex gap-2.5 
                bg-white/10 backdrop-blur-md w-[360px] m-auto mb-10"
        >
          <Image
            src="/humbleIcon.png"
            alt="humbleIcon"
            height={10}
            width={20}
          />
          <span className="font-medium">
            Join thousands of creative professionals
          </span>
        </div>

        <MainHeading
          text="Ready to Create Smarter?"
          text2="Join thousands of creators, researchers, and teams using SlayCanvas to transform their creative workflow."
          fontSize="text-2xl sm:text-3xl md:text-5xl"
          subFontSize="text-[18px] md:text-[22px]"
          width="max-w-200"
          leading="leading-14 md:leading-20"
          color1="text-white"
          color2="text-white"
        />

        <div className="mt-5">
          <Sec1Btn
            text="Start Free"
            text2="Watch Video"
            variant1="inverted"
            variant2="inverted"
            width="140px"
            icon1={assets.arrowRight}
            icon2={assets.play}
          />
        </div>

        <div className="flex items-center gap-10 justify-center mt-12">
          <div className="flex items-center gap-2 text-white font-medium text-xs sm:text-lg">
            <div className="sm:w-4 sm:h-4 w-2 h-2 bg-green-600 rounded-full" />
            <span className="md:text-[12px] text-[11px] ">Free to start</span>
          </div>
          <div className="flex items-center gap-2 text-white font-medium text-xs sm:text-lg">
            <div className="sm:w-4 sm:h-4 w-2 h-2 bg-blue-600 rounded-full" />
            <span className="md:text-[12px] text-[11px] ">Free to start</span>
          </div>
          <div className="flex items-center gap-2 text-white font-medium text-xs sm:text-lg">
            <div className="sm:w-4 sm:h-4 w-2 h-2 bg-purple-600 rounded-full" />
            <span className="md:text-[12px] text-[11px] ">Free to start</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section8;
