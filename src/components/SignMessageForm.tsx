import type { FormEvent } from "react";
import { useState } from "react";
import { useSignMessage } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { type FC } from "react";

interface SignMessageFormProps {
  className?: string;
}

export const SignMessageForm: FC<SignMessageFormProps> = ({ className = "" }) => {
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const { signMessage, isPending, error } = useSignMessage({
    mutation: {
      onSuccess(signature: `0x${string}`) {
        setSignature(signature);
      },
      onError(error: Error) {
        console.error("Failed to sign message:", error);
      }
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      signMessage({ message });
    }
  };

  return (
    <div className={`${className} flex flex-col gap-4 p-4 bg-base-100 rounded-2xl shadow-md`}>
      <h2 className="text-2xl font-bold">Sign Message</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label htmlFor="message" className="text-sm font-medium mb-1 block">
            Message to Sign
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter a message to sign"
            className="textarea textarea-bordered w-full h-24"
            disabled={isPending}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isPending}
          className={`btn btn-primary ${isPending ? "loading" : ""}`}
        >
          {isPending ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" /> Signing...
            </>
          ) : (
            "Sign Message"
          )}
        </button>
      </form>

      {error && (
        <div className="alert alert-error">
          <p className="text-sm">Error: {error?.message || "Failed to sign message"}</p>
        </div>
      )}

      {signature && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Signature</h3>
          <div className="bg-base-200 p-4 rounded-lg break-all">
            <code className="text-sm">{signature}</code>
          </div>
        </div>
      )}
    </div>
  );
}
