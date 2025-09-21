import assets from "@/app/assets";
import Image from "next/image";
import Link from "next/link";

const GoogleBtn = () => {
  return (
    <Link
      href={`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/login`}
      className="border border-gray-300 py-2.5 flex justify-center items-center gap-2 rounded-xl cursor-pointer"
      type="button"
    >
      <Image src={assets.google} width={25} height={25} alt="google" />
      <span>Continue with Google</span>
    </Link>
  );
};

export default GoogleBtn;
