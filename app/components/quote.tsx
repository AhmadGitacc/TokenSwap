import { useEffect } from "react";
import { formatUnits } from "ethers";
import {
  useSignTypedData,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWalletClient,
  type BaseError,
} from "wagmi";
import { Address, concat, numberToHex, size, type Hex } from "viem";
import type { PriceResponse, QuoteResponse } from "../../src/utils/types";
import {
  MAINNET_TOKENS_BY_ADDRESS,
  AFFILIATE_FEE,
  FEE_RECIPIENT,
} from "../../src/constants";
import Image from "next/image";
import qs from "qs";

export default function QuoteView({
  taker,
  price,
  quote,
  setQuote,
  chainId,
}: {
  taker: Address | undefined;
  price: PriceResponse;
  quote: QuoteResponse | undefined;
  setQuote: (price: any) => void;
  chainId: number;
}) {
  console.log("price", price);

  const sellTokenInfo = (chainId: number) => {
    if (chainId === 1) {
      return MAINNET_TOKENS_BY_ADDRESS[price.sellToken.toLowerCase()];
    }
    return MAINNET_TOKENS_BY_ADDRESS[price.sellToken.toLowerCase()];
  };

  const buyTokenInfo = (chainId: number) => {
    if (chainId === 1) {
      return MAINNET_TOKENS_BY_ADDRESS[price.buyToken.toLowerCase()];
    }
    return MAINNET_TOKENS_BY_ADDRESS[price.buyToken.toLowerCase()];
  };

  const { signTypedDataAsync } = useSignTypedData();
  const { data: walletClient } = useWalletClient();

  // Fetch quote data
  useEffect(() => {
    const params = {
      chainId: chainId,
      sellToken: price.sellToken,
      buyToken: price.buyToken,
      sellAmount: price.sellAmount,
      taker,
      swapFeeRecipient: FEE_RECIPIENT,
      swapFeeBps: AFFILIATE_FEE,
      swapFeeToken: price.buyToken,
      tradeSurplusRecipient: FEE_RECIPIENT,
    };

    async function main() {
      const response = await fetch(`/api/quote?${qs.stringify(params)}`);
      const data = await response.json();
      setQuote(data);
    }
    main();
  }, [
    chainId,
    price.sellToken,
    price.buyToken,
    price.sellAmount,
    taker,
    setQuote,
    FEE_RECIPIENT,
    AFFILIATE_FEE,
  ]);

  const {
    data: hash,
    isPending,
    error,
    sendTransaction,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  if (!quote) {
    return <div>Getting best quote...</div>;
  }

  console.log("quote", quote);

  // Helper function to format tax basis points to percentage
  const formatTax = (taxBps: string) => (parseFloat(taxBps) / 100).toFixed(2);

  return (
    <div className="container max-w-sm px-4 py-6 mx-auto sm:max-w-md md:max-w-2xl sm:px-6 sm:py-12">
      <form>
        {/* You Pay Section */}
        <div className="p-4 mb-4 border border-gray-700 shadow-2xl bg-gray-800/60 backdrop-blur-lg rounded-2xl sm:p-6 md:p-8 sm:mb-6">
          <div className="mb-3 text-lg font-medium text-gray-300 sm:mb-4 sm:text-xl">You pay</div>
          <div className="flex items-center text-lg text-white sm:text-2xl md:text-3xl">
            <img
              alt={sellTokenInfo(chainId).symbol}
              className="flex-shrink-0 mr-3 rounded-full shadow-lg ring-2 ring-gray-600"
              src={sellTokenInfo(chainId || 1)?.logoURI}
              width={36}
              height={36}
            />
            <div className="flex flex-col flex-1 min-w-0 gap-1 sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold truncate">
                {formatUnits(quote.sellAmount, sellTokenInfo(chainId).decimals)}
              </span>
              <div className="text-base text-gray-400 sm:text-lg md:text-xl">
                {sellTokenInfo(chainId).symbol}
              </div>
            </div>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="p-2 bg-gray-700 rounded-full">
            <svg className="w-5 h-5 text-gray-300 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* You Receive Section */}
        <div className="p-4 mb-4 border border-gray-700 shadow-2xl bg-gray-800/60 backdrop-blur-lg rounded-2xl sm:p-6 md:p-8 sm:mb-6">
          <div className="mb-3 text-lg font-medium text-gray-300 sm:mb-4 sm:text-xl">You receive</div>
          <div className="flex items-center text-lg text-white sm:text-2xl md:text-3xl">
            <img
              alt={
                MAINNET_TOKENS_BY_ADDRESS[price.buyToken.toLowerCase()].symbol
              }
              className="flex-shrink-0 mr-3 rounded-full shadow-lg ring-2 ring-gray-600"
              src={
                MAINNET_TOKENS_BY_ADDRESS[price.buyToken.toLowerCase()].logoURI
              }
              width={36}
              height={36}
            />
            <div className="flex flex-col flex-1 min-w-0 gap-1 sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold truncate">
                {formatUnits(quote.buyAmount, buyTokenInfo(chainId).decimals)}
              </span>
              <div className="text-base text-gray-400 sm:text-lg md:text-xl">
                {buyTokenInfo(chainId).symbol}
              </div>
            </div>
          </div>
        </div>

        {/* Fee and Tax Information */}
        <div className="p-4 mb-6 border border-gray-700 shadow-2xl bg-gray-800/60 backdrop-blur-lg rounded-2xl sm:p-6 md:p-8 sm:mb-8">
          {/* Affiliate Fee */}
          {quote &&
            quote.fees &&
            quote.fees.integratorFee &&
            quote.fees.integratorFee.amount && (
              <div className="flex items-center justify-between p-3 mb-3 text-xs border border-gray-700 rounded-lg sm:text-sm bg-gray-900/30">
                <span className="text-gray-400">Affiliate Fee:</span>
                <span className="font-medium text-right text-gray-300">
                  {Number(
                    formatUnits(
                      BigInt(quote.fees.integratorFee.amount),
                      buyTokenInfo(chainId).decimals
                    )
                  ) + " " + buyTokenInfo(chainId).symbol}
                </span>
              </div>
            )}

          {/* Tax Information Display */}
          <div className="space-y-2">
            {quote.tokenMetadata.buyToken.buyTaxBps &&
              quote.tokenMetadata.buyToken.buyTaxBps !== "0" && (
                <div className="flex items-center justify-between p-3 text-xs border rounded-lg sm:text-sm bg-yellow-500/10 border-yellow-500/20">
                  <span className="text-yellow-400">
                    {buyTokenInfo(chainId).symbol} Buy Tax:
                  </span>
                  <span className="font-medium text-yellow-300">
                    {formatTax(quote.tokenMetadata.buyToken.buyTaxBps)}%
                  </span>
                </div>
              )}

            {quote.tokenMetadata.sellToken.sellTaxBps &&
              quote.tokenMetadata.sellToken.sellTaxBps !== "0" && (
                <div className="flex items-center justify-between p-3 text-xs border rounded-lg sm:text-sm bg-yellow-500/10 border-yellow-500/20">
                  <span className="text-yellow-400">
                    {sellTokenInfo(chainId).symbol} Sell Tax:
                  </span>
                  <span className="font-medium text-yellow-300">
                    {formatTax(quote.tokenMetadata.sellToken.sellTaxBps)}%
                  </span>
                </div>
              )}
          </div>
        </div>
      </form>

      {/* Action Button */}
      <button
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm sm:text-base mb-6"
        disabled={isPending}
        onClick={async () => {
          console.log("submitting quote to blockchain");
          console.log("to", quote.transaction.to);
          console.log("value", quote.transaction.value);

          // On click, (1) Sign the Permit2 EIP-712 message returned from quote
          if (quote.permit2?.eip712) {
            let signature: Hex | undefined;
            try {
              signature = await signTypedDataAsync(quote.permit2.eip712);
              console.log("Signed permit2 message from quote response");
            } catch (error) {
              console.error("Error signing permit2 coupon:", error);
            }

            // (2) Append signature length and signature data to calldata

            if (signature && quote?.transaction?.data) {
              const signatureLengthInHex = numberToHex(size(signature), {
                signed: false,
                size: 32,
              });

              const transactionData = quote.transaction.data as Hex;
              const sigLengthHex = signatureLengthInHex as Hex;
              const sig = signature as Hex;

              quote.transaction.data = concat([
                transactionData,
                sigLengthHex,
                sig,
              ]);
            } else {
              throw new Error("Failed to obtain signature or transaction data");
            }
          }

          // (3) Submit the transaction with Permit2 signature

          sendTransaction &&
            sendTransaction({
              account: walletClient?.account.address,
              gas: !!quote?.transaction.gas
                ? BigInt(quote?.transaction.gas)
                : undefined,
              to: quote?.transaction.to,
              data: quote.transaction.data, // submit
              value: quote?.transaction.value
                ? BigInt(quote.transaction.value)
                : undefined, // value is used for native tokens
              chainId: chainId,
            });
        }}
      >
        {isPending ? "Confirming..." : "Place Order"}
      </button>

      {/* Status Messages */}
      {isConfirming && (
        <div className="p-4 mb-4 text-center text-gray-300 rounded-lg bg-gray-800/40">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-b-2 border-blue-400 rounded-full animate-spin"></div>
            <span>Waiting for confirmation...</span>
          </div>
        </div>
      )}

      {isConfirmed && (
        <div className="p-4 mb-4 text-center text-green-300 border rounded-lg bg-green-900/20 border-green-500/30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">🎉</span>
            <span className="font-semibold">Transaction Confirmed!</span>
          </div>
          <a
            href={`https://etherscan.io/tx/${hash}`}
            className="text-sm text-blue-400 underline transition-colors hover:text-blue-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Etherscan
          </a>
        </div>
      )}

      {error && (
        <div className="p-4 text-center text-red-300 border rounded-lg bg-red-900/20 border-red-500/30">
          <div className="mb-1 font-semibold">Error</div>
          <div className="text-sm">
            {(error as BaseError).shortMessage || error.message}
          </div>
        </div>
      )}
    </div>
  );
}
