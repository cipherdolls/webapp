import { useFetcher, useNavigate, type ActionFunctionArgs } from "react-router";
import { ethers } from 'ethers';
import { useLocalStorage } from "usehooks-ts";
import { useEffect, useState } from "react";
import type { Route } from "./+types/signIn";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "SignIn" },
  ];
}

const backendUrl = 'https://api.cipherdolls.com';


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
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ signedMessage, message, address }),
        });

        const signinData = await signinRes.json();
        const token = signinData?.token;
        if (!token) {
          throw new Error('No token returned from signin');
        }
        return { token };
    } catch (error) {
        console.error('Error:', error);
    }
}


export default function SignInRoute() {
    const fetcher = useFetcher();
    const [token, setToken] = useLocalStorage('token', undefined);
    const [connected, setConnected] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        if (fetcher.data?.token) {
          setToken(fetcher.data.token);
        }
        if (fetcher.data?.error) {
          console.error('Sign-in error:', fetcher.data.error);
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
          console.log('Connected and token is set');
          navigate('/');
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
          const localToken = localStorage.getItem('token')?.replaceAll('"', '');
          const res = await fetch(`${backendUrl}/auth/verify`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localToken}` 
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
          console.error('Verify token error:', err);
          return false;
        }
      };

    return (
        <div>
          <div className=''>
            <fetcher.Form method="post">
              <button type="submit">
                <span>Sign in via MetaMask</span>
              </button>
            </fetcher.Form>
          </div>
        </div>
      );
}
