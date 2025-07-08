# Fix Wagmi Wallet Connection Issue

## Problem

Your React frontend is experiencing "Permissions: Sender does not have claim signer key" because contract calls are being made with the wrong address context.

## Root Cause

- User wallet `0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717` HAS correct permissions
- But contract calls are executing under a different address context
- This suggests Wagmi configuration issues

## Solution 1: Check Wagmi Configuration

Make sure your Wagmi config looks like this:

```typescript
// wagmi.config.ts or similar
import { createConfig, http } from "wagmi"
import { baseSepolia } from "wagmi/chains"
import { metaMask, walletConnect, coinbaseWallet } from "wagmi/connectors"

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    metaMask(),
    walletConnect({ projectId: "your-project-id" }),
    coinbaseWallet({ appName: "Your App" }),
  ],
  transports: {
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_RPC_URL ||
        "https://base-sepolia.g.alchemy.com/v2/jZMXG1ZQfY6Yvu_PmDJxWrasqdnym3Uy"
    ),
  },
})
```

## Solution 2: Verify Account Connection

In your React component, add debugging:

```typescript
import { useAccount } from "wagmi"

export default function KYCFlow() {
  const { address, isConnected, connector } = useAccount()

  // Add this debugging
  useEffect(() => {
    console.log("🔍 Wallet Debug Info:")
    console.log("  Connected:", isConnected)
    console.log("  Address:", address)
    console.log("  Connector:", connector?.name)
    console.log("  Expected:", "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717")

    if (
      address?.toLowerCase() !==
      "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717".toLowerCase()
    ) {
      console.log("❌ WRONG WALLET CONNECTED!")
    }
  }, [address, isConnected, connector])

  // ... rest of your component
}
```

## Solution 3: Ensure Correct Chain

Make sure you're connected to Base Sepolia (chain ID 84532):

```typescript
import { useChainId, useSwitchChain } from "wagmi"
import { baseSepolia } from "viem/chains"

const chainId = useChainId()
const { switchChain } = useSwitchChain()

useEffect(() => {
  if (chainId !== baseSepolia.id) {
    console.log(
      "❌ Wrong chain! Current:",
      chainId,
      "Expected:",
      baseSepolia.id
    )
    switchChain({ chainId: baseSepolia.id })
  }
}, [chainId])
```

## Solution 4: Fix Contract Call Context

Make sure your `writeContract` calls include the correct account:

```typescript
const { writeContract } = useWriteContract()

const handleAddClaim = async () => {
  // Verify we have the right address before calling
  if (
    !address ||
    address.toLowerCase() !==
      "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717".toLowerCase()
  ) {
    console.error("❌ Wrong wallet connected!")
    return
  }

  writeContract({
    address: onchainIDAddress as `0x${string}`,
    abi: onchainidABI as any,
    functionName: "addClaim",
    args: contractArgs,
    // Make sure account is correct
    account: address as `0x${string}`,
  })
}
```

## Solution 5: Check Provider Configuration

If using a custom RPC, make sure it's configured correctly:

```typescript
// In your environment variables
NEXT_PUBLIC_RPC_URL=https://base-sepolia.g.alchemy.com/v2/jZMXG1ZQfY6Yvu_PmDJxWrasqdnym3Uy

// In your Wagmi config
const config = createConfig({
  // ... other config
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL)
  }
})
```

## Temporary Workaround

If the above doesn't work immediately, you can add the Hardhat default signer as a claim key to your OnchainID:

```bash
cd /path/to/hardhat/project
npx hardhat run scripts/userops/add-signer-as-claim-key.ts --network base-sepolia
```

This will allow the frontend to work while you fix the wallet configuration.

## Verification

After implementing fixes, verify with:

```typescript
// In your component
console.log("Final verification:")
console.log("  Wallet address:", address)
console.log("  Chain ID:", chainId)
console.log("  OnchainID:", onchainIDAddress)
console.log("  Expected wallet: 0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717")
console.log("  Expected chain: 84532 (Base Sepolia)")
```

The key is ensuring that when `writeContract` executes, it's using your actual connected wallet (`0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717`) and not some other address.
