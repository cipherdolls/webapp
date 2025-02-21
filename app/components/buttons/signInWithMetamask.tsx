import type { ButtonHTMLAttributes, FC } from "react";
import { cn } from "utils/cn";

const SignInWithMetamask: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = "",
  ...props
}) => {
  return (
    <button
      className={cn(
        "bg-base-black rounded-full py-3 px-6 max-w-max text-body-lg text-base-white flex items-center",
        className
      )}
      {...props}
    >
      <img
        src="/metamask.svg"
        alt="Metamask Icon"
        className="mr-4 inline-block size-8"
      />
      <p>
        Sign in via <span className="font-semibold"> MetaMask</span>
      </p>
    </button>
  );
};

export default SignInWithMetamask;
