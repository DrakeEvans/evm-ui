"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, useWalletClient } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address, AddressInput, InputBase } from "~~/components/scaffold-eth";
import { useState } from "react";
import type { Address as AddressType, TransactionRequest } from "viem";
import { parseGwei } from "viem";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const [toAddress, setToAddress] = useState<AddressType>();
  const [data, setData] = useState<`0x${string}`>("0x");
  const [nonce, setNonce] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [maxFeePerGas, setMaxFeePerGas] = useState<string>("150000000000");
  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState<string>("1000000000");
  const [value, setValue] = useState<string>("0");

  const { data: walletClient } = useWalletClient();
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string>();

  const validateInputs = () => {
    if (!walletClient || !connectedAddress || !toAddress) {
      setError("Please connect wallet and provide recipient address");
      return false;
    }

    try {
      // Validate numeric inputs
      if (nonce && !Number.isInteger(Number(nonce))) {
        setError("Nonce must be a valid integer");
        return false;
      }

      // Validate gas parameters
      if (!maxFeePerGas || !maxPriorityFeePerGas) {
        setError("Gas parameters are required");
        return false;
      }

      try {
        BigInt(maxFeePerGas);
        BigInt(maxPriorityFeePerGas);
        BigInt(value);
      } catch {
        setError("Invalid number format for gas or value fields");
        return false;
      }

      // Validate hex data
      if (data && !data.startsWith("0x")) {
        setError("Transaction data must be a hex string starting with 0x");
        return false;
      }

      return true;
    } catch (err) {
      setError("Input validation failed");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setTxHash(undefined);

    if (!validateInputs()) return;
    setIsSubmitting(true);

    try {
      const request: TransactionRequest = {
        from: connectedAddress,
        to: toAddress,
        data: data || "0x",
        nonce: nonce ? Number(nonce) : undefined,
        maxFeePerGas: BigInt(maxFeePerGas),
        maxPriorityFeePerGas: BigInt(maxPriorityFeePerGas),
        value: BigInt(value),
        type: "eip1559",
      };
      
      // Chain ID is handled by the wallet client based on the connected network

      if (!walletClient) {
        throw new Error("Wallet client not connected");
      }

      const serializedTransaction = await walletClient.signTransaction(request);
      const hash = await walletClient.sendRawTransaction({ serializedTransaction });
      setTxHash(hash);
    } catch (err) {
      console.error("Transaction failed:", err);
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Transaction Form</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mb-4">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 max-w-lg mx-auto">
            <div>
              <label className="label">
                <span className="label-text">From Address (Connected Wallet)</span>
              </label>
              <Address address={connectedAddress} />
            </div>

            <div>
              <label className="label">
                <span className="label-text">To Address</span>
                <span className="label-text-alt text-error">{!toAddress && "Required"}</span>
              </label>
              <AddressInput
                value={toAddress ?? ""}
                onChange={value => setToAddress(value as AddressType)}
                placeholder="0x..."
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Transaction Data (Optional)</span>
                <span className="label-text-alt">{!data.startsWith("0x") && data !== "0x" && "Must start with 0x"}</span>
              </label>
              <InputBase
                value={data}
                onChange={value => setData(value.startsWith("0x") ? (value as `0x${string}`) : `0x${value}`)}
                placeholder="0x..."
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Nonce (Optional)</span>
              </label>
              <InputBase
                value={nonce}
                onChange={setNonce}
                placeholder="69"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Chain ID (Optional)</span>
              </label>
              <InputBase
                value={chainId}
                onChange={setChainId}
                placeholder="1"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Max Fee Per Gas (wei)</span>
                <span className="label-text-alt text-error">{!maxFeePerGas && "Required"}</span>
              </label>
              <InputBase
                value={maxFeePerGas}
                onChange={setMaxFeePerGas}
                placeholder="150000000000"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Max Priority Fee Per Gas (wei)</span>
                <span className="label-text-alt text-error">{!maxPriorityFeePerGas && "Required"}</span>
              </label>
              <InputBase
                value={maxPriorityFeePerGas}
                onChange={setMaxPriorityFeePerGas}
                placeholder="1000000000"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Value (wei)</span>
              </label>
              <InputBase
                value={value}
                onChange={setValue}
                placeholder="1000000000000000000"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-4"
              disabled={isSubmitting || !walletClient || !connectedAddress || !toAddress}
            >
              {isSubmitting ? "Signing & Broadcasting..." : "Sign & Broadcast Transaction"}
            </button>

            {error && (
              <div className="alert alert-error mt-4">
                <span>{error}</span>
              </div>
            )}

            {txHash && (
              <div className="alert alert-success mt-4">
                <span>Transaction sent! Hash: {txHash}</span>
              </div>
            )}
          </form>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
