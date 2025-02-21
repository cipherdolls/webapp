import { useFetcher, useNavigate, type ActionFunctionArgs } from "react-router";
import { ethers } from "ethers";
import { useLocalStorage } from "usehooks-ts";
import { useEffect, useState } from "react";
import type { Route } from "./+types/signIn";
import SignInWithMetamask from "~/components/buttons/signInWithMetamask";
import HowItWorksModal from "~/components/howItWorksModal";
import SignInPatterns from "~/components/ui/signInPatterns";

export function meta({}: Route.MetaArgs) {
  return [{ title: "SignIn" }];
}

const backendUrl = "https://api.cipherdolls.com";

declare global {
  interface Window {
    ethereum?: any; // or more specific type
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const nonceRes = await fetch(`${backendUrl}/auth/nonce`);
    const res = await nonceRes.json();
    const nonce = res.nonce;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const message = `I am signing this message to prove my identity. Nonce: ${nonce}`;
    const signedMessage = await signer.signMessage(message);
    const signinRes = await fetch(`${backendUrl}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signedMessage, message, address }),
    });

    const signinData = await signinRes.json();
    const token = signinData?.token;
    if (!token) {
      throw new Error("No token returned from signin");
    }
    return { token };
  } catch (error) {
    console.error("Error:", error);
  }
}

export default function SignInRoute() {
  const fetcher = useFetcher();
  const [token, setToken] = useLocalStorage("token", undefined);
  const [connected, setConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (fetcher.data?.token) {
      setToken(fetcher.data.token);
    }
    if (fetcher.data?.error) {
      console.error("Sign-in error:", fetcher.data.error);
    }
  }, [fetcher.data, setToken]);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  useEffect(() => {
    if (connected === true && token !== undefined) {
      console.log("Connected and token is set");
      navigate("/");
    }
    // eslint-disable-next-line
  }, [connected, token]);

  const checkConnection = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) {
      setConnected(false);
    } else {
      setConnected(true);
    }
  };

  const verifyToken = async () => {
    try {
      const localToken = localStorage.getItem("token")?.replaceAll('"', "");
      const res = await fetch(`${backendUrl}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localToken}`,
        },
      });

      // If 200 => token is valid
      if (res.status === 200) {
        return true;
      }
      // If 401 => token invalid
      if (res.status === 401) {
        return false;
      }
      // Otherwise, some other error
      return false;
    } catch (err) {
      console.error("Verify token error:", err);
      return false;
    }
  };

  return (
    <div className="flex items-center justify-center size-full relative">
      <div className="flex flex-col gap-20 mb-[88px] sm:mb-0 relateve z-10">
        <div className="flex flex-col sm:gap-8 gap-5 items-center justify-center">
          <img
            src="/logo.svg"
            alt="Cipherdolls"
            className="sm:w-[234px] sm:h-8 w-[146px] h-5"
            width={234}
            height={32}
          />
          <h1 className="sm:text-heading-h0 text-heading-h2 text-base-black text-center">
            Welcome Here!
          </h1>
        </div>
        <div className="flex flex-col gap-8 justify-center items-center sm:static absolute bottom-[2.125rem]">
          <SignInWithMetamask />
          <HowItWorksModal />
        </div>
      </div>
      <SignInPatterns />
    </div>
  );
}
