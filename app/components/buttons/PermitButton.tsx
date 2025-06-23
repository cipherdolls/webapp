import React, { useState } from 'react';
import { ethers } from 'ethers';

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

      const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const nonce = await token.nonces(owner);
      const decimals = await token.decimals();
      const value = ethers.parseUnits(amount, decimals);

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
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Signing...' : 'Grant Permit'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
