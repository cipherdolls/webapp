import React, { useState } from 'react';
import { ethers } from 'ethers';
import * as Button from '~/components/ui/button/button';

interface PermitButtonProps {
  tokenAddress: string;
  tokenName: string;
  tokenVersion: string;
  spender: string;
  amount: string; // human-readable
  deadlineSeconds?: number;
  onSigned: (permit: {
    owner: string;
    spender: string;
    value: string;
    nonce: string;
    deadline: number;
    v: number;
    r: string;
    s: string;
  }) => void;
}

const ERC20_ABI = [
  'function nonces(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

export const PermitButton: React.FC<PermitButtonProps> = ({
  tokenAddress,
  tokenName,
  tokenVersion,
  spender,
  amount,
  deadlineSeconds = 3600,
  onSigned,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleClick = async () => {
    if (!window.ethereum) {
      setError('No Ethereum provider found');
      return;
    }

    try {
      setError(undefined);
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const owner = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Check if we're on Optimism mainnet (chainId: 10)
      if (chainId !== 10) {
        // Try to switch to Optimism automatically
        try {
          await provider.send('wallet_switchEthereumChain', [
            { chainId: '0xa' }, // Optimism mainnet
          ]);
          // Refresh the network info after switching
          const newNetwork = await provider.getNetwork();
          const newChainId = Number(newNetwork.chainId);
          if (newChainId !== 10) {
            setError('Failed to switch to Optimism mainnet');
            return;
          }
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Chain not added to wallet, try to add it
            try {
              await provider.send('wallet_addEthereumChain', [
                {
                  chainId: '0xa',
                  chainName: 'Optimism',
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://mainnet.optimism.io'],
                  blockExplorerUrls: ['https://optimistic.etherscan.io'],
                },
              ]);
            } catch (addError) {
              setError('Please manually switch to Optimism mainnet');
              return;
            }
          } else {
            setError('Please switch to Optimism mainnet (Chain ID: 10)');
            return;
          }
        }
      }

      const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

      // Check if contract exists and has the required functions
      try {
        const code = await provider.getCode(tokenAddress);
        if (code === '0x') {
          setError('Token contract not found on this network');
          return;
        }

        // Verify it's an ERC20 token by checking basic functions
        const testContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        try {
          await testContract.symbol();
        } catch (symbolErr) {
          setError('This does not appear to be a valid ERC20 token contract');
          return;
        }
      } catch (err) {
        setError('Failed to verify token contract');
        return;
      }

      let nonce, decimals, value;
      try {
        // Try nonces first
        try {
          nonce = await token.nonces(owner);
        } catch (nonceErr: any) {
          console.error('Nonces call failed:', nonceErr);
          throw new Error('Failed to get nonces. This token might not support EIP-2612 permits.');
        }

        // Try decimals
        try {
          decimals = await token.decimals();
        } catch (decimalsErr: any) {
          console.error('Decimals call failed:', decimalsErr);
          throw new Error('Failed to get token decimals.');
        }

        value = ethers.parseUnits(amount, decimals);
      } catch (err: any) {
        console.error('Contract call error:', err);
        setError(err.message || "Failed to read token contract. Make sure you're on Optimism mainnet.");
        return;
      }

      const deadline = Math.floor(Date.now() / 1000) + deadlineSeconds;

      const domain = {
        name: tokenName,
        version: tokenVersion,
        chainId,
        verifyingContract: tokenAddress,
      };

      const types = {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      };

      const message = {
        owner,
        spender,
        value,
        nonce,
        deadline,
      };

      const signature = await signer.signTypedData(domain, types, message);
      const { v, r, s } = ethers.Signature.from(signature);

      onSigned({
        owner,
        spender,
        value: value.toString(),
        nonce: nonce.toString(),
        deadline,
        v,
        r,
        s,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Signing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-2 w-full'>
      <Button.Root className='w-full' onClick={handleClick} disabled={loading}>
        {loading ? (
          <>
            <span className='animate-spin'>⏳</span>
            Signing...
          </>
        ) : (
          'Sign Message'
        )}
      </Button.Root>
      {error && (
        <div className='text-xs text-specials-danger bg-specials-danger/5 p-2 rounded-lg'>
          <p className='font-medium mb-1'>Error:</p>
          <p>{error}</p>
          {error.includes('network') && (
            <p className='mt-1 text-neutral-01'>Make sure you're connected to Optimism mainnet in your wallet.</p>
          )}
        </div>
      )}
    </div>
  );
};
