"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import type { ThirdwebContract } from "thirdweb";
import {
  ConnectButton,
  MediaRenderer,
  NFTProvider,
  NFTMedia,
  useActiveAccount,
  useContract,
  useContractWrite,
} from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import React from "react";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

type Props = {
  contract: ThirdwebContract;
  displayName: string;
  description: string;
  contractImage: string;
  pricePerToken: number | null;
  currencySymbol: string | null;
  isERC1155: boolean;
  isERC721: boolean;
  tokenId: bigint;
};

export function NftMint(props: Props) {
  // console.log(props);
  const [isMinting, setIsMinting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState("");
  const { theme, setTheme } = useTheme();
  const account = useActiveAccount();

  // Hook para o contrato (usa o endereço das env vars)
  const { contract: lotteryContract } = useContract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as string, "custom");

  // Hook para chamar buyTicket (função do seu contrato Lottery)
  const { mutate: buyTicket, isPending: isBuying } = useContractWrite(lotteryContract, "buyTicket");

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
    // Assuming a max of 10 NFTs can be minted at once
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!Number.isNaN(value)) {
      setQuantity(Math.min(Math.max(1, value)));
    }
  };

  // Função custom pro botão de buy (1 USDC por bilhete)
  const handleBuyTicket = async () => {
    if (!lotteryContract || !account) return;
    setIsMinting(true);
    try {
      // Chama buyTicket com value 1 USDC (1000000n pra 6 decimals)
      await buyTicket({
        args: [], // Ajusta args se precisar (ex: quantity)
        overrides: { value: 1000000n }, // 1 USDC
      });
      toast.success("Bilhete comprado! Você tá no sorteio na Arc Testnet!");
    } catch (error) {
      toast.error("Erro no buy: " + (error as Error).message);
    } finally {
      setIsMinting(false);
    }
  };

  // const toggleTheme = () => {
  //   setTheme(theme === "dark" ? "light" : "dark");
  // };

  if (props.pricePerToken === null || props.pricePerToken === undefined) {
    console.error("Invalid pricePerToken");
    return null;
  }

  return (
    <NFTProvider contract={props.contract}>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <ConnectButton />
        <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
          <div className="mt-8">
            <h1 className="text-6xl font-bold">
              Sorteio Semana 1
              <br />
              <span className="text-[#1E90FF]">na Arc Testnet</span>
            </h1>

            <p className="mt-3 text-2xl">
              {props.description || "Pague 1 USDC pra comprar seu bilhete e concorrer ao prêmio!"}
            </p>

            <Card className="w-[500px] mt-8">
              <CardContent className="pt-6">
                {props.isERC1155 ? (
                  <NFTMedia
                    contract={props.contract}
                    tokenId={props.tokenId}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MediaRenderer
                    src={props.contractImage}
                    className="w-full h-full object-cover"
                  />
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <h2 className="text-xl font-bold">{props.displayName}</h2>
                  <p className="text-sm text-muted-foreground">{props.description}</p>
                </div>
                <div className="text-xl font-bold">
                  {props.pricePerToken} {props.currencySymbol}/each
                </div>
              </CardFooter>
            </Card>

            <div className="flex flex-col items-center mt-8">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decreaseQuantity}
                  disabled={isMinting}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-16 text-center"
                  disabled={isMinting}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={increaseQuantity}
                  disabled={isMinting}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Botão Custom pra Buy Ticket (substitui ClaimButton) */}
              <Button
                onClick={handleBuyTicket}
                disabled={!account || isMinting || isBuying}
                className="mt-4 w-[200px]"
              >
                {isMinting || isBuying ? "Comprando..." : `Buy Ticket (1 USDC)`}
              </Button>

              <div className="flex items-center space-x-2 mt-4">
                <Switch
                  id="custom-address"
                  checked={useCustomAddress}
                  onCheckedChange={setUseCustomAddress}
                />
                <Label htmlFor="custom-address">Mint to custom address</Label>
              </div>
              {useCustomAddress && (
                <Input
                  placeholder="0x..."
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  className="mt-2 w-[300px]"
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </NFTProvider>
  );
}
