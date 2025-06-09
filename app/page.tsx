"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import PriceView from "./components/price";
import QuoteView from "./components/quote";

import { useState } from "react";
import { useAccount, useChainId } from "wagmi";

import type { PriceResponse } from "../src/utils/types";

function Page() {
  const { address } = useAccount();

  const chainId = useChainId() || 1;
  console.log("chainId: ", chainId);

  const [finalize, setFinalize] = useState(false);
  const [price, setPrice] = useState<PriceResponse | undefined>();
  const [quote, setQuote] = useState();

  return (
    <div className="w-full max-w-4xl min-h-screen px-4 mx-auto sm:px-3 lg:px-8">
      <div className="flex flex-col items-center justify-center py-8 space-y-6">

        <div className="w-full max-w-2xl">
          {finalize && price ? (
            <QuoteView
              taker={address}
              price={price}
              quote={quote}
              setQuote={setQuote}
              chainId={chainId}
            />
          ) : (
            <PriceView
              taker={address}
              price={price}
              setPrice={setPrice}
              setFinalize={setFinalize}
              chainId={chainId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
