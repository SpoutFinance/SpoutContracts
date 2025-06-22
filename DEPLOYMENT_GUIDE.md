# Spout RWA Token Deployment Guide

This guide provides step-by-step instructions for deploying the complete Spout RWA (Real World Asset) token system on Base Sepolia testnet.

## Prerequisites

1. **Node.js and npm** installed
2. **Hardhat** configured with Base Sepolia network
3. **Private key** with sufficient ETH for deployment
4. **Chainlink Functions subscription** (for market data)

## Quick Status Check

Before starting deployment, check if you already have components deployed:

```bash
npx hardhat run scripts/deployment/05-skip-if-already-registered.ts --network base-sepolia
```

## Deployment Steps

### Step 1: Deploy T-REX Infrastructure

First, deploy the T-REX infrastructure components:

```bash
# 1. Deploy token logic
npx hardhat run scripts/deployment/01-deploy-token-logic.ts --network base-sepolia

# 2. Deploy compliance logic
npx hardhat run scripts/deployment/02-deploy-compliance-logic.ts --network base-sepolia

# 3. Deploy registry logics
npx hardhat run scripts/deployment/03-deploy-registry-logics.ts --network base-sepolia

# 4. Deploy implementation authority
npx hardhat run scripts/deployment/04-deploy-implementation-authority.ts --network base-sepolia

# 5. Register implementations (with error handling)
npx hardhat run scripts/deployment/05-register-implementations.ts --network base-sepolia

# 6. Verify implementation authority
npx hardhat run scripts/deployment/06-verify-ia.ts --network base-sepolia

# 7. Deploy TREX factory
npx hardhat run scripts/deployment/07-deploy-trex-factory.ts --network base-sepolia
```

### Step 2: Deploy Spout-Specific Components

```bash
# 8. Deploy Spout token logic
npx hardhat run scripts/deployment/01b-deploy-spout-token-logic.ts --network base-sepolia

# 9. Deploy market data consumer
npx hardhat run scripts/deployment/08-deploy-market-data-consumer.ts --network base-sepolia
```

### Step 3: Deploy Complete Spout Token Suite

```bash
# 10. Deploy complete Spout RWA token suite
npx hardhat run scripts/deployment/09-deploy-spout-token-suite.ts --network base-sepolia
```

## Troubleshooting Common Issues

### Issue: "version already exists" Error

If you encounter this error during step 5, it means the Implementation Authority already has version 1.0.0 registered. This is normal if you've run the deployment before.

**Solution**: Use the status check script instead:

```bash
npx hardhat run scripts/deployment/05-skip-if-already-registered.ts --network base-sepolia
```

If the status shows all implementations are set, you can skip to step 7 (TREX Factory deployment).

### Issue: Gas Estimation Failures

If you encounter gas estimation failures:

1. **Check your ETH balance** - Ensure you have sufficient ETH for deployment
2. **Increase gas limits** - The scripts include dynamic gas adjustment
3. **Check network congestion** - Base Sepolia can be congested during peak times

### Issue: Contract Already Deployed

If a contract is already deployed, the script will show the existing address. You can continue with the next step.

## Configuration Requirements

### Chainlink Functions Setup

1. **Create a Functions subscription**:
   - Go to [Chainlink Functions](https://functions.chain.link/)
   - Create a new subscription
   - Fund it with LINK tokens

2. **Add your contract as consumer**:
   - Use the `FunctionAssetConsumer` address from step 8
   - Add it as an authorized consumer in your subscription

3. **Get your subscription ID**:
   - Note the subscription ID for use in market data requests

### Environment Variables

Create a `.env` file with:

```env
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
CHAINLINK_FUNCTIONS_SUBSCRIPTION_ID=your_subscription_id_here
```

## Contract Addresses

After deployment, you'll have these key addresses:

- **TREX Factory**: Main factory for deploying token suites
- **Spout Token**: Your RWA token contract
- **Market Data Consumer**: Chainlink Functions integration
- **Identity Registry**: KYC/AML management
- **Compliance**: Transfer restrictions and rules

## Post-Deployment Configuration

### 1. Initialize RWA Parameters

```javascript
// Set bond parameters
const maturityDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year
const couponRate = 500; // 5% annual rate
await spoutToken.initializeRWA(maturityDate, couponRate, marketDataConsumerAddress);
```

### 2. Configure Compliance Rules

```javascript
// Add compliance modules as needed
await modularCompliance.addModule(complianceModuleAddress);
```

### 3. Set Up KYC/AML

```javascript
// Add trusted issuers
await trustedIssuersRegistry.addTrustedIssuer(issuerAddress, [1]);
```

## Testing

Run the comprehensive test suite:

```bash
# Test Spout contracts
npx hardhat test test/Spoutv1.ts

# Test all contracts
npx hardhat test
```

## Key Features

### RWA-Specific Functionality

1. **Interest Calculation**: Automatic interest calculation based on time held
2. **Maturity Management**: Bond maturity date tracking
3. **Market Data Integration**: Real-time price feeds via Chainlink
4. **Compliance**: ERC-3643 compliant with KYC/AML support
5. **Transfer Validation**: RWA-specific transfer restrictions
6. **Batch Operations**: Efficient batch interest release

### Bond Parameters

- **Maturity Date**: When the bond matures
- **Coupon Rate**: Annual interest rate in basis points
- **Decimals**: 6 decimals (standard for bond tokens)
- **Initial Supply**: Configurable initial token supply

## Security Considerations

1. **Access Control**: Only owner can initialize RWA parameters
2. **Input Validation**: All parameters are validated
3. **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
4. **Upgradeable**: Uses proxy pattern for future upgrades

## Deployment Status Tracking

Use these scripts to check deployment status:

```bash
# Check Implementation Authority status
npx hardhat run scripts/deployment/05-skip-if-already-registered.ts --network base-sepolia

# Check specific contract deployments
npx hardhat run scripts/deployment/06-verify-ia.ts --network base-sepolia
```

## Verification

Verify your contracts on BaseScan:

```bash
npx hardhat verify --network base-sepolia CONTRACT_ADDRESS
```

## Next Steps

1. **Frontend Integration**: Build a web interface for token management
2. **Compliance Configuration**: Set up specific compliance rules
3. **Market Data**: Configure additional market data sources
4. **Monitoring**: Set up monitoring and alerting systems

## Support

For issues or questions:
1. Check the test files for usage examples
2. Review the contract documentation
3. Open an issue in the repository

---

**Note**: This deployment guide is for Base Sepolia testnet. For mainnet deployment, ensure all security measures are in place and contracts are thoroughly audited. 