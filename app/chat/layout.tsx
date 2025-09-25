import { Suspense } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense>{children}</Suspense>;
};

export default Layout;
