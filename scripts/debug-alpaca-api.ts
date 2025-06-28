import axios from "axios"

async function testAlpacaAPI() {
  console.log("🧪 Testing Alpaca Markets API call...")

  const asset = "lqd" // The asset from your buyAsset call
  const url = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${asset}`

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "APCA-API-KEY-ID": "PK4GP2JHLHR1W846ENF9",
      "APCA-API-SECRET-KEY": "4pO04ynDBGWThgERuE0SYApMclOYxumv8ha6gdZq",
    },
  }

  console.log("📋 Request Details:")
  console.log("- URL:", url)
  console.log("- Asset:", asset)
  console.log("- API Key ID:", options.headers["APCA-API-KEY-ID"])

  try {
    console.log("\n🔄 Making API request...")
    const response = await axios(url, options)

    console.log("✅ API request successful!")
    console.log("📊 Response data:", JSON.stringify(response.data, null, 2))

    // Check if the expected data structure exists
    const askPrice = response.data?.quotes?.[asset]?.ap
    console.log("\n🎯 Extracted ask price:", askPrice)

    if (typeof askPrice !== "number") {
      console.log(
        "❌ askPrice is not a valid number - this would cause the Chainlink Functions error"
      )
    } else {
      const scaledPrice = Math.round(askPrice * 100)
      console.log("✅ Scaled price (x100):", scaledPrice)
    }
  } catch (error: any) {
    console.log("❌ API request failed:")
    console.log("Status:", error.response?.status)
    console.log("Status Text:", error.response?.statusText)
    console.log("Error Data:", error.response?.data)
    console.log("Error Message:", error.message)

    if (error.response?.status === 401) {
      console.log("\n🚨 AUTHENTICATION ERROR")
      console.log("- The API credentials are invalid or expired")
      console.log("- You need to update the credentials in the contract")
    }

    if (error.response?.status === 403) {
      console.log("\n🚨 FORBIDDEN ERROR")
      console.log("- The API key doesn't have permission for this endpoint")
      console.log("- You might need a different subscription level")
    }

    if (error.response?.status === 429) {
      console.log("\n🚨 RATE LIMITING ERROR")
      console.log("- Too many requests with these credentials")
      console.log("- Wait and try again later")
    }
  }
}

// Also test with a more common stock symbol
async function testWithCommonSymbol() {
  console.log("\n\n🧪 Testing with common symbol (AAPL)...")

  const asset = "AAPL"
  const url = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${asset}`

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "APCA-API-KEY-ID": "PK4GP2JHLHR1W846ENF9",
      "APCA-API-SECRET-KEY": "4pO04ynDBGWThgERuE0SYApMclOYxumv8ha6gdZq",
    },
  }

  try {
    const response = await axios(url, options)
    console.log("✅ AAPL request successful!")

    const askPrice = response.data?.quotes?.[asset]?.ap
    console.log("AAPL ask price:", askPrice)
  } catch (error: any) {
    console.log(
      "❌ AAPL request also failed:",
      error.response?.status,
      error.response?.statusText
    )
  }
}

async function main() {
  await testAlpacaAPI()
  await testWithCommonSymbol()

  console.log("\n📋 NEXT STEPS:")
  console.log("1. If API credentials are invalid, you need to:")
  console.log("   - Get new Alpaca Markets API credentials")
  console.log("   - Update the SOURCE code in FunctionAssetConsumer.sol")
  console.log("   - Redeploy the Orders contract")
  console.log("2. If 'lqd' is not a valid symbol, try with a different asset")
  console.log(
    "3. Consider using a different price API (CoinGecko, CoinMarketCap, etc.)"
  )
}

main().catch(console.error)
