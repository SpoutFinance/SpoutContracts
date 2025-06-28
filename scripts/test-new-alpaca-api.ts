import axios from "axios"

async function testNewAlpacaAPI() {
  console.log("🧪 Testing NEW Alpaca Markets API credentials...")

  const asset = "LQD" // Test with LQD (the asset from buyAsset call)
  const url = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${asset}`

  // These are the NEW credentials from your contract
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "APCA-API-KEY-ID": "PKUAON9P15H5CI7E59O7",
      "APCA-API-SECRET-KEY": "AyjwmRAooIdtF3duPoX6AnfAzmotxikWwgQdFdoU",
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
    console.log("📊 Response status:", response.status)
    console.log("📊 Response data:", JSON.stringify(response.data, null, 2))

    // Check if the expected data structure exists
    const askPrice = response.data?.quotes?.[asset]?.ap
    console.log("\n🎯 Extracted ask price:", askPrice)

    if (typeof askPrice !== "number") {
      console.log(
        "❌ askPrice is not a valid number - this would cause the Chainlink Functions error"
      )
      console.log("📊 Available data structure:")
      console.log(Object.keys(response.data))
    } else {
      const scaledPrice = Math.round(askPrice * 100)
      console.log("✅ Ask price as number:", askPrice)
      console.log("✅ Scaled price (x100):", scaledPrice)
      console.log("🎉 This should work with Chainlink Functions!")
    }
  } catch (error: any) {
    console.log("❌ API request failed:")
    console.log("Status:", error.response?.status)
    console.log("Status Text:", error.response?.statusText)
    console.log("Error Data:", error.response?.data)
    console.log("Error Message:", error.message)

    if (error.response?.status === 401) {
      console.log("\n🚨 AUTHENTICATION ERROR")
      console.log("- The NEW API credentials are also invalid or expired")
      console.log("- You need working Alpaca Markets credentials")
    }

    if (error.response?.status === 403) {
      console.log("\n🚨 FORBIDDEN ERROR")
      console.log("- The NEW API key doesn't have permission for this endpoint")
      console.log("- You might need a different subscription level")
    }
  }
}

// Test with a few different symbols
async function testMultipleSymbols() {
  console.log("\n\n🧪 Testing multiple symbols...")

  const symbols = ["AAPL", "MSFT", "LQD"]

  for (const symbol of symbols) {
    console.log(`\n📊 Testing ${symbol}...`)
    const url = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${symbol}`

    try {
      const response = await axios(url, {
        headers: {
          accept: "application/json",
          "APCA-API-KEY-ID": "PKUAON9P15H5CI7E59O7",
          "APCA-API-SECRET-KEY": "AyjwmRAooIdtF3duPoX6AnfAzmotxikWwgQdFdoU",
        },
      })

      const askPrice = response.data?.quotes?.[symbol]?.ap
      console.log(`✅ ${symbol} ask price:`, askPrice)
    } catch (error: any) {
      console.log(
        `❌ ${symbol} failed:`,
        error.response?.status,
        error.response?.statusText
      )
    }
  }
}

async function main() {
  await testNewAlpacaAPI()
  await testMultipleSymbols()

  console.log("\n📋 NEXT STEPS:")
  console.log(
    "1. If API works: Wait for Chainlink Functions to process the request"
  )
  console.log("2. If API fails: Need to get working Alpaca Markets credentials")
  console.log(
    "3. Consider using a free alternative API (Alpha Vantage, CoinGecko, etc.)"
  )
  console.log("4. Check Chainlink Functions dashboard for request status")
}

main().catch(console.error)
