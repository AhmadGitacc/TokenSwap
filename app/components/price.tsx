import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState, ChangeEvent } from "react";
import { formatUnits, parseUnits } from "ethers";
import {
  useReadContract,
  useBalance,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { erc20Abi, Address } from "viem";
import {
  MAINNET_TOKENS,
  MAINNET_TOKENS_BY_SYMBOL,
  MAX_ALLOWANCE,
  AFFILIATE_FEE,
  FEE_RECIPIENT,
} from "../../src/constants";
import { permit2Abi } from "../../src/utils/permit2abi";
import Image from "next/image";
import qs from "qs";

export const DEFAULT_BUY_TOKEN = (chainId: number) => {
  if (chainId === 1) {
    return "weth";
  }
};

export default function PriceView({
  price,
  taker,
  setPrice,
  setFinalize,
  chainId,
}: {
  price: any;
  taker: Address | undefined;
  setPrice: (price: any) => void;
  setFinalize: (finalize: boolean) => void;
  chainId: number;
}) {
  const [sellToken, setSellToken] = useState("weth");
  const [buyToken, setBuyToken] = useState("usdc");
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [tradeDirection, setTradeDirection] = useState("sell");
  const [error, setError] = useState([]);
  const [buyTokenTax, setBuyTokenTax] = useState({
    buyTaxBps: "0",
    sellTaxBps: "0",
  });
  const [sellTokenTax, setSellTokenTax] = useState({
    buyTaxBps: "0",
    sellTaxBps: "0",
  });

  const handleSellTokenChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSellToken(e.target.value);
  };
  function handleBuyTokenChange(e: ChangeEvent<HTMLSelectElement>) {
    setBuyToken(e.target.value);
  }

  const tokensByChain = (chainId: number) => {
    if (chainId === 1) {
      return MAINNET_TOKENS_BY_SYMBOL;
    }
    return MAINNET_TOKENS_BY_SYMBOL;
  };

  const sellTokenObject = tokensByChain(chainId)[sellToken];
  console.log("sellTokenObject", sellTokenObject);
  const buyTokenObject = tokensByChain(chainId)[buyToken];

  const sellTokenDecimals = sellTokenObject.decimals;
  const buyTokenDecimals = buyTokenObject.decimals;
  const sellTokenAddress = sellTokenObject.address;

  const parsedSellAmount =
    sellAmount && tradeDirection === "sell"
      ? parseUnits(sellAmount, sellTokenDecimals).toString()
      : undefined;

  const parsedBuyAmount =
    buyAmount && tradeDirection === "buy"
      ? parseUnits(buyAmount, buyTokenDecimals).toString()
      : undefined;

  // Fetch price data and set the buyAmount whenever the sellAmount changes
  useEffect(() => {
    const params = {
      chainId: chainId,
      sellToken: sellTokenObject.address,
      buyToken: buyTokenObject.address,
      sellAmount: parsedSellAmount,
      buyAmount: parsedBuyAmount,
      taker,
      swapFeeRecipient: FEE_RECIPIENT,
      swapFeeBps: AFFILIATE_FEE,
      swapFeeToken: buyTokenObject.address,
      tradeSurplusRecipient: FEE_RECIPIENT,
    };

    async function main() {
      const response = await fetch(`/api/price?${qs.stringify(params)}`);
      const data = await response.json();

      if (data?.validationErrors?.length > 0) {
        // error for sellAmount too low
        setError(data.validationErrors);
      } else {
        setError([]);
      }
      if (data.buyAmount) {
        setBuyAmount(formatUnits(data.buyAmount, buyTokenDecimals));
        setPrice(data);
      }
      // Set token tax information
      if (data?.tokenMetadata) {
        setBuyTokenTax(data.tokenMetadata.buyToken);
        setSellTokenTax(data.tokenMetadata.sellToken);
      }
    }

    if (sellAmount !== "") {
      main();
    }
  }, [
    sellTokenObject.address,
    buyTokenObject.address,
    parsedSellAmount,
    parsedBuyAmount,
    chainId,
    sellAmount,
    setPrice,
    FEE_RECIPIENT,
    AFFILIATE_FEE,
  ]);

  // Hook for fetching balance information for specified token for a specific taker address
  const { data, isError, isLoading } = useBalance({
    address: taker,
    token: sellTokenObject.address,
  });

  console.log("taker sellToken balance: ", data);

  const inSufficientBalance =
    data && sellAmount
      ? parseUnits(sellAmount, sellTokenDecimals) > data.value
      : true;

  // Helper function to format tax basis points to percentage
  const formatTax = (taxBps: string) => (parseFloat(taxBps) / 100).toFixed(2);

  return (
    <div className=" bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
      <header className="flex items-center justify-between p-4 border-b border-gray-700 sm:p-6 bg-gray-900/50 backdrop-blur-sm">
        <a target="_blank" rel="noopener noreferrer">
        </a>
        <ConnectButton />
      </header>

      <div className="container max-w-sm px-4 py-6 mx-auto sm:max-w-md md:max-w-2xl sm:px-6 sm:py-12">
        <header className="mb-8 text-center sm:mb-12">
          <h1 className="mb-2 text-3xl font-bold text-transparent sm:text-4xl md:text-5xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
            TekSwap
          </h1>
          <p className="text-base text-gray-400 sm:text-lg">Swap tokens with ease</p>
        </header>

        <div className="p-4 border border-gray-700 shadow-2xl bg-gray-800/60 backdrop-blur-lg rounded-2xl sm:p-6 md:p-8">
          {/* FROM Section */}
          <div className="mb-6 sm:mb-8">
            <label htmlFor="sell" className="block mb-3 text-sm font-medium text-gray-300 sm:mb-4">
              From
            </label>
            <div className="p-3 border border-gray-600 bg-gray-900/50 rounded-xl sm:p-4">
              <section className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center flex-1 min-w-0 gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      alt={sellToken}
                      className="rounded-full shadow-lg ring-2 ring-gray-600"
                      src={MAINNET_TOKENS_BY_SYMBOL[sellToken].logoURI}
                      width={32}
                      height={32}
                    />
                  </div>

                  <select
                    value={sellToken}
                    name="sell-token-select"
                    id="sell-token-select"
                    className="flex-1 min-w-0 px-3 py-2 text-sm text-white transition-all duration-200 bg-gray-800 border border-gray-600 rounded-lg sm:px-4 sm:py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-base"
                    onChange={handleSellTokenChange}
                  >
                    {MAINNET_TOKENS.map((token) => {
                      return (
                        <option
                          key={token.address}
                          value={token.symbol.toLowerCase()}
                          className="bg-gray-800"
                        >
                          {token.symbol}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <input
                  id="sell-amount"
                  value={sellAmount}
                  className="bg-gray-900 text-white text-right text-lg sm:text-xl font-semibold rounded-lg px-3 py-2 sm:px-4 sm:py-3 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 w-full sm:min-w-[160px] sm:w-auto"
                  type="number"
                  placeholder="0.0"
                  onChange={(e) => {
                    setTradeDirection("sell");
                    setSellAmount(e.target.value);
                  }}
                />
              </section>
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="p-2 transition-colors duration-200 bg-gray-700 rounded-full cursor-pointer hover:bg-gray-600">
              <svg className="w-5 h-5 text-gray-300 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* TO Section */}
          <div className="mb-6 sm:mb-8">
            <label htmlFor="buy" className="block mb-3 text-sm font-medium text-gray-300 sm:mb-4">
              To
            </label>
            <div className="p-3 border border-gray-600 bg-gray-900/50 rounded-xl sm:p-4">
              <section className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center flex-1 min-w-0 gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      alt={buyToken}
                      className="rounded-full shadow-lg ring-2 ring-gray-600"
                      src={MAINNET_TOKENS_BY_SYMBOL[buyToken].logoURI}
                      width={32}
                      height={32}
                    />
                  </div>

                  <select
                    name="buy-token-select"
                    id="buy-token-select"
                    value={buyToken}
                    className="flex-1 min-w-0 px-3 py-2 text-sm text-white transition-all duration-200 bg-gray-800 border border-gray-600 rounded-lg sm:px-4 sm:py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-base"
                    onChange={(e) => handleBuyTokenChange(e)}
                  >
                    {MAINNET_TOKENS.map((token) => {
                      return (
                        <option
                          key={token.address}
                          value={token.symbol.toLowerCase()}
                          className="bg-gray-800"
                        >
                          {token.symbol}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <input
                  id="buy-amount"
                  value={buyAmount}
                  className="bg-gray-900/50 text-white text-right text-lg sm:text-xl font-semibold rounded-lg px-3 py-2 sm:px-4 sm:py-3 border border-gray-600 cursor-not-allowed w-full sm:min-w-[160px] sm:w-auto"
                  type="number"
                  placeholder="0.0"
                  disabled
                  onChange={(e) => {
                    setTradeDirection("buy");
                    setBuyAmount(e.target.value);
                  }}
                />
              </section>
            </div>
          </div>

          {/* Fee and Tax Information */}
          <div className="mb-6 space-y-2 sm:mb-8">
            {price && price.fees.integratorFee.amount && (
              <div className="flex items-center justify-between p-3 text-xs border border-gray-700 rounded-lg sm:text-sm bg-gray-900/30">
                <span className="text-gray-400">Affiliate Fee:</span>
                <span className="font-medium text-right text-gray-300">
                  {Number(
                    formatUnits(
                      BigInt(price.fees.integratorFee.amount),
                      MAINNET_TOKENS_BY_SYMBOL[buyToken].decimals
                    )
                  )} {MAINNET_TOKENS_BY_SYMBOL[buyToken].symbol}
                </span>
              </div>
            )}

            {buyTokenTax.buyTaxBps !== "0" && (
              <div className="flex items-center justify-between p-3 text-xs border rounded-lg sm:text-sm bg-yellow-500/10 border-yellow-500/20">
                <span className="text-yellow-400">
                  {MAINNET_TOKENS_BY_SYMBOL[buyToken].symbol} Buy Tax:
                </span>
                <span className="font-medium text-yellow-300">
                  {formatTax(buyTokenTax.buyTaxBps)}%
                </span>
              </div>
            )}

            {sellTokenTax.sellTaxBps !== "0" && (
              <div className="flex items-center justify-between p-3 text-xs border rounded-lg sm:text-sm bg-yellow-500/10 border-yellow-500/20">
                <span className="text-yellow-400">
                  {MAINNET_TOKENS_BY_SYMBOL[sellToken].symbol} Sell Tax:
                </span>
                <span className="font-medium text-yellow-300">
                  {formatTax(sellTokenTax.sellTaxBps)}%
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          {taker ? (
            <ApproveOrReviewButton
              sellTokenAddress={MAINNET_TOKENS_BY_SYMBOL[sellToken].address}
              taker={taker}
              onClick={() => {
                setFinalize(true);
              }}
              disabled={inSufficientBalance}
              price={price}
            />
          ) : (
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm sm:text-base"
                            onClick={openConnectModal}
                            type="button"
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openChainModal}
                            type="button"
                            className="w-full px-6 py-3 text-sm font-semibold text-white transition-all duration-200 bg-red-600 hover:bg-red-700 sm:py-4 rounded-xl sm:text-base"
                          >
                            Wrong Network - Switch Chain
                          </button>
                        );
                      }

                      return (
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            onClick={openChainModal}
                            className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-white transition-all duration-200 bg-gray-700 border border-gray-600 rounded-lg sm:justify-start hover:bg-gray-600 sm:text-base"
                            type="button"
                          >
                            {chain.hasIcon && (
                              <div className="flex-shrink-0 w-4 h-4 overflow-hidden bg-gray-800 rounded-full sm:w-5 sm:h-5">
                                {chain.iconUrl && (
                                  <Image
                                    src={chain.iconUrl}
                                    alt={chain.name ?? "Chain icon"}
                                    width={20}
                                    height={20}
                                  />
                                )}
                              </div>
                            )}
                            <span className="font-medium">{chain.name}</span>
                          </button>

                          <button
                            onClick={openAccountModal}
                            type="button"
                            className="flex-1 px-4 py-3 text-sm font-medium text-center text-white transition-all duration-200 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 sm:text-base"
                          >
                            <span className="block sm:inline">{account.displayName}</span>
                            {account.displayBalance && (
                              <span className="block text-xs text-gray-300 sm:inline sm:ml-2 sm:text-sm">
                                ({account.displayBalance})
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          )}
        </div>
      </div>
    </div>
  );

  function ApproveOrReviewButton({
    taker,
    onClick,
    sellTokenAddress,
    disabled,
    price,
  }: {
    taker: Address;
    onClick: () => void;
    sellTokenAddress: Address;
    disabled?: boolean;
    price: any;
  }) {
    // If price.issues.allowance is null, show the Review Trade button
    if (price?.issues.allowance === null) {
      return (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            // fetch data, when finished, show quote view
            onClick();
          }}
          className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-700 disabled:opacity-25"
        >
          {disabled ? "Insufficient Balance" : "Review Trade"}
        </button>
      );
    }

    // Determine the spender from price.issues.allowance
    const spender = price?.issues.allowance.spender;

    // 1. Read from erc20, check approval for the determined spender to spend sellToken
    const { data: allowance, refetch } = useReadContract({
      address: sellTokenAddress,
      abi: erc20Abi,
      functionName: "allowance",
      args: [taker, spender],
    });
    console.log("checked spender approval");

    // 2. (only if no allowance): write to erc20, approve token allowance for the determined spender
    const { data } = useSimulateContract({
      address: sellTokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, MAX_ALLOWANCE],
    });

    // Define useWriteContract for the 'approve' operation
    const {
      data: writeContractResult,
      writeContractAsync: writeContract,
      error,
    } = useWriteContract();

    // useWaitForTransactionReceipt to wait for the approval transaction to complete
    const { data: approvalReceiptData, isLoading: isApproving } =
      useWaitForTransactionReceipt({
        hash: writeContractResult,
      });

    // Call `refetch` when the transaction succeeds
    useEffect(() => {
      if (data) {
        refetch();
      }
    }, [data, refetch]);

    if (error) {
      return <div>Something went wrong: {error.message}</div>;
    }

    if (allowance === 0n) {
      return (
        <>
          <button
            type="button"
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
            onClick={async () => {
              await writeContract({
                abi: erc20Abi,
                address: sellTokenAddress,
                functionName: "approve",
                args: [spender, MAX_ALLOWANCE],
              });
              console.log("approving spender to spend sell token");

              refetch();
            }}
          >
            {isApproving ? "Approving…" : "Approve"}
          </button>
        </>
      );
    }

    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          // fetch data, when finished, show quote view
          onClick();
        }}
        className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-700 disabled:opacity-25"
      >
        {disabled ? "Insufficient Balance" : "Review Trade"}
      </button>
    );
  }
}
