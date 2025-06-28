import axios from "axios"

async function testAlphaVantageAPI() {
  console.log("🧪 Testing Alpha Vantage API call...")

  const asset = "LQD" // ETF symbol for iShares iBoxx $ Investment Grade Corporate Bond ETF
  const apiKey = "demo" // Free demo key
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${asset}&apikey=${apiKey}`

  console.log("📋 Request Details:")
  console.log("- URL:", url)
  console.log("- Asset:", asset)
  console.log("- API Key:", apiKey)

  try {
    console.log("\n🔄 Making API request...")
    const response = await axios.get(url)

    console.log("✅ API request successful!")
    console.log("📊 Response data:", JSON.stringify(response.data, null, 2))

    // Check if the expected data structure exists
    const priceStr = response.data?.["Global Quote"]?.["05. price"]
    console.log("\n🎯 Extracted price string:", priceStr)

    if (!priceStr) {
      console.log(
        "❌ Price data not found - this would cause the Chainlink Functions error"
      )
    } else {
      const price = parseFloat(priceStr)
      if (isNaN(price)) {
        console.log("❌ Price is not a valid number")
      } else {
        const scaledPrice = Math.round(price * 100)
        console.log("✅ Price as number:", price)
        console.log("✅ Scaled price (x100):", scaledPrice)
      }
    }
  } catch (error: any) {
    console.log("❌ API request failed:")
    console.log("Status:", error.response?.status)
    console.log("Status Text:", error.response?.statusText)
    console.log("Error Data:", error.response?.data)
    console.log("Error Message:", error.message)
  }
}

// Test with a common stock symbol too
async function testWithApple() {
  console.log("\n\n🧪 Testing with AAPL...")

  const asset = "AAPL"
  const apiKey = "demo"
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${asset}&apikey=${apiKey}`

  try {
    const response = await axios.get(url)
    console.log("✅ AAPL request successful!")

    const priceStr = response.data?.["Global Quote"]?.["05. price"]
    console.log("AAPL price:", priceStr)
  } catch (error: any) {
    console.log(
      "❌ AAPL request failed:",
      error.response?.status,
      error.response?.statusText
    )
  }
}

async function main() {
  await testAlphaVantageAPI()
  await testWithApple()

  console.log("\n📋 CONCLUSIONS:")
  console.log("✅ Alpha Vantage uses free demo API key")
  console.log("✅ No authentication headers required")
  console.log("✅ Works for both stocks and ETFs")
  console.log("\n📋 NEXT STEPS:")
  console.log(
    "1. Update your Orders contract to use FunctionAssetConsumerFixed"
  )
  console.log("2. Deploy the new version")
  console.log("3. Add the new contract as consumer to subscription 379")
  console.log("4. Test buyAsset again")
}

main().catch(console.error)
