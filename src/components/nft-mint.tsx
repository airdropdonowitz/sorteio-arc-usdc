"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import {
  ConnectButton,
  useActiveAccount,
  useContract,
  useContractWrite,
} from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import React from "react";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

type Props = {
  contract: any; // Fallback pro custom
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
  const [isMinting, setIsMinting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState("");
  const { theme, setTheme } = useTheme();
  const account = useActiveAccount();

  // Hook pro contrato custom (usa env var)
  const { contract: lotteryContract } = useContract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as string, "custom");

  // Hook pra chamar buyTicket (ajuste se a função for outra)
  const { mutate: buyTicket, isPending: isBuying } = useContractWrite(lotteryContract, "buyTicket");

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!Number.isNaN(value)) {
      setQuantity(Math.min(Math.max(1, value), 10)); // Max 10 bilhetes
    }
  };

  const handleBuyTicket = async () => {
    if (!lotteryContract || !account) {
      toast.error("Conecte a carteira primeiro!");
      return;
    }
    setIsMinting(true);
    try {
      await buyTicket({
        args: [quantity], // Se precisar de quantity como arg; remove se não
        overrides: { value: BigInt(quantity * 1000000) }, // 1 USDC = 1e6 por bilhete
      });
      toast.success(`Bilhete(s) comprado(s)! Você tá no sorteio na Arc Testnet!`);
    } catch (error) {
      toast.error("Erro no buy: " + (error as Error).message + ". Verifique MetaMask e rede Arc.");
    } finally {
      setIsMinting(false);
    }
  };

  if (!lotteryContract) {
    return <div>Carregando contrato... (Verifique env vars)</div>;
  }

  return (
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
            {props.description || "Pague 1 USDC por bilhete pra concorrer ao prêmio!"}
          </p>

          <Card className="w-[500px] mt-8">
            <CardContent className="pt-6">
              <div className="w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">Bilhete do Sorteio</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <h2 className="text-xl font-bold">{props.displayName || "Bilhete Arc"}</h2>
                <p className="text-sm text-muted-foreground">Sorteio com USDC na blockchain Arc</p>
              </div>
              <div className="text-xl font-bold">
                1 USDC / bilhete
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

            {/* Botão de Buy Custom */}
            <Button
              onClick={handleBuyTicket}
              disabled={!account || isMinting || isBuying}
              className="mt-4 w-[200px] bg-blue-500 hover:bg-blue-600"
            >
              {isMinting || isBuying ? "Comprando..." : `Buy ${quantity} Bilhete(s) (1 USDC cada)`}
            </Button>

            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="custom-address"
                checked={useCustomAddress}
                onCheckedChange={setUseCustomAddress}
              />
              <Label htmlFor="custom-address">Enviar pra endereço custom</Label>
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
  );
}
