"use client";
import React from "react";
import assets from "../assets";
import Image from "next/image";
import Link from "next/link";
import PricingPlan from "@/components/cards/PricingPlan";

const PricingSection = () => {
    return (
        <div className='bg-gradient-to-r from-[#8e5eff] to-[#4596ff] w-full min-h-screen relative px-5 overflow-hidden pb-10 md:pn-0'>
            <div className='pt-8 pb-4 md:pb-0 md:px-1 mb-6 flex items-center justify-center md:justify-start flex-shrink'>
                <Link href='/'>
                    <Image src={assets.whiteLogo} alt='whiteLogo' height={40} width={140} />
                </Link>
            </div>

            <>
                <div className="text-center text-white flex flex-col items-center mb-6">
                    <h2 className="text-3xl font-bold leading-15">Plans & Pricing</h2>
                    <p className="max-w-190">Choose the plan that fits your needs. All plans include essential features to get you started, with options to scale as you grow. No hidden fees and the flexibility to change anytime.</p>
                </div>

                <PricingPlan />
            </>
        </div>
    );
};

export default PricingSection;
