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
import { ConnectButton, MediaRenderer, NFTProvider, NFTMedia, useActiveAccount, useContractWrite } from "thirdweb/react";
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

  const { mutate: buyTicket, isPending } = useContractWrite(props.contract, "buyTicket");

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1); // Assuming a max of 10 NFTs can be minted at once
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!Number.isNaN(value)) {
      setQuantity(Math.min(Math.max(1, value)));
    }
  };

  // const toggleTheme = () => {
  //   setTheme(theme === "dark" ? "light" : "dark");
  // };

  if (props.pricePerToken === null || props.pricePerToken === undefined) {
    console.error("Invalid pricePerToken");
    return null;
  }

  const handleBuyTicket = () => {
    if (!account) {
      toast.error("Please connect wallet");
      return;
    }
    setIsMinting(true);
    buyTicket(
      { quantity: BigInt(quantity) },
      {
        value: BigInt(1000000 * quantity),
      },
      {
        onSuccess: () => {
          toast.success("Tickets bought successfully!");
          setIsMinting(false);
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`);
          setIsMinting(false);
        },
      }
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <ConnectButton />
        <div className="flex justify-center">
          {props.isERC1155 ? (
            <MediaRenderer
              src={props.contractImage}
              className="w-full h-full object-cover"
            />
          ) : (
            <NFTMedia src={props.contractImage} />
          )}
        </div>
        <h2 className="text-2xl font-bold">{props.displayName}</h2>
        <p>{props.description}</p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={decreaseQuantity}>
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            className="w-20 text-center"
          />
          <Button variant="outline" size="sm" onClick={increaseQuantity}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div>Price: {props.pricePerToken} {props.currencySymbol}/each</div>
        <Button onClick={handleBuyTicket} disabled={isMinting || isPending}>
          {isMinting || isPending ? "Minting..." : "Buy Ticket"}
        </Button>
      </CardContent>
    </Card>
  );
}
