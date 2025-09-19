import assets from "@/app/assets";
import Image from "next/image";
import React, { useState } from "react";

type Feature = {
  text: string;
  highlight?: boolean;
};

type PlanType = {
  title: string;
  subtitle: string;
  buttonText: string;
  features: Feature[];
  isPopular?: boolean;
  monthly: {
    price: string;
    priceSuffix?: string;
  };
  annual: {
    price: string;
    priceSuffix?: string;
  };
};

const plans: PlanType[] = [
  {
    title: "Starter",
    subtitle: "Individuals just getting started",
    buttonText: "Try for Free",
    features: [
      { text: "1 Board" },
      { text: "Up to 10 uploads (images, docs, or links)" },
      { text: "Basic AI Chat (limited queries)" },
      { text: "Visual moodboards" },
      { text: "Community support" },
    ],
    monthly: { price: "Free", priceSuffix: "" },
    annual: { price: "Free", priceSuffix: "" },
  },
  {
    title: "Pro",
    subtitle: "Freelancers & small teams.",
    buttonText: "Select Plan",
    isPopular: true,
    features: [
      { text: "All starter features +", highlight: true },
      { text: "Unlimited Boards" },
      { text: "Unlimited uploads (images, docs, links, videos)" },
      { text: "Advanced AI Chat (summaries, Q&A)" },
      { text: "Mind maps & visual organization" },
      { text: "Real-time collaboration" },
    ],
    monthly: { price: "$19", priceSuffix: "/per month" },
    annual: { price: "$190", priceSuffix: "/per year" },
  },
  {
    title: "Team",
    subtitle: "Teams & agencies.",
    buttonText: "Select Plan",
    features: [
      { text: "Everything in Pro +", highlight: true },
      { text: "Up to 10 team members" },
      { text: "Shared workspaces" },
      { text: "Role-based permissions" },
      { text: "Premium support (chat + email)" },
      { text: "Custom integration support" },
      { text: "Early access to new features" },
    ],
    monthly: { price: "$49", priceSuffix: "/per month" },
    annual: { price: "$490", priceSuffix: "/per year" },
  },
];

const PricingPlan = () => {
  const [paymentPlan, setpaymentPlan] = useState<"monthly" | "annual">("monthly");

  return (
    <div>
      <div className="bg-[#E1E1E1] rounded-full p-1 w-[240px] flex items-center gap-1.5 m-auto mt-5">
        <button
          onClick={() => setpaymentPlan("monthly")}
          className={`w-full text-center py-2 rounded-full font-medium text-[15px] ${paymentPlan === "monthly" ? "bg-white" : "bg-transparent"
            }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setpaymentPlan("annual")}
          className={`w-full text-center py-2 rounded-full font-medium text-[15px] ${paymentPlan === "annual" ? "bg-white" : "bg-transparent"
            }`}
        >
          Annual
        </button>
      </div>

      <div className="flex items-center flex-col md:flex-row md:items-start gap-5 justify-center mt-16">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`${plan.isPopular
              ? "bg-black pt-2 pb-1 px-1 rounded-3xl md:relative bottom-10 "
              : "flex-shrink-3"
              }`}
          >
            {plan.isPopular && (
              <h4 className="text-center font-semibold text-sm text-white mb-2">
                MOST POPULAR PLAN
              </h4>
            )}
            <div className="bg-white border border-[#E1E1E1] rounded-3xl pt-7.5 pb-8 px-8 w-[320px] md:w-auto lg:w-[320px]">
              <div className="text-left">
                <div className="mb-3">
                  <h3 className="font-bold text-xl">{plan.title}</h3>
                  <p className="text-sm text-[#666666]">{plan.subtitle}</p>
                </div>
                <div className=" mb-4 flex items-start">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-[#8e5eff] to-[#378cfc] bg-clip-text text-transparent inline-block">
                    {plan[paymentPlan].price}
                  </h3>
                  {plan[paymentPlan].priceSuffix && (
                    <span className=" font-bold text-xl ml-1 bg-gradient-to-r from-[#8e5eff] to-[#378cfc] bg-clip-text text-transparent inline-block">
                      {plan[paymentPlan].priceSuffix}
                    </span>
                  )}
                </div>

                <ul className="flex flex-col gap-2.5 mb-6">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex text-[15px] gap-1.5  md:w-[19vw]">
                      <Image
                        src={f.highlight ? assets.bluePlanTick : assets.planTick}
                        alt="planTick"
                        width={20}
                        height={20}
                      />
                      <span
                        className={`${f.highlight ? "font-bold" : ""
                          }`}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button className="font-medium text-sm text-center text-white py-4 rounded-xl bg-gradient-to-r from-[#8e5eff] to-[#378cfc] w-full">
                  {plan.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPlan;
