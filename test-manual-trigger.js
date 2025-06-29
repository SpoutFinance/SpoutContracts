const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Testing manual trigger with account:", deployer.address);

    // Connect to ReserveAutomation contract
    const automationAddress = "0xE7173fb008c3FBff52B5B02b0D0c57f0C35fC59C";
    const ReserveAutomation = await ethers.getContractFactory("ReserveAutomation");
    const automation = ReserveAutomation.attach(automationAddress);

    console.log("\n📊 Current State:");
    const lastUpdate = await automation.lastUpdateTime();
    const interval = await automation.updateInterval();
    const currentTime = Math.floor(Date.now() / 1000);
    
    console.log("Last Update:", new Date(lastUpdate * 1000).toISOString());
    console.log("Update Interval:", interval.toString(), "seconds");
    console.log("Current Time:", new Date(currentTime * 1000).toISOString());
    console.log("Time Since Last:", currentTime - lastUpdate, "seconds");
    console.log("Ready for update?", (currentTime - lastUpdate) >= interval);

    // Test checkUpkeep
    console.log("\n🔍 Testing checkUpkeep:");
    const [upkeepNeeded, performData] = await automation.checkUpkeep("0x");
    console.log("Upkeep Needed:", upkeepNeeded);

    // Manual trigger (only if you're the owner)
    console.log("\n🚀 Triggering manual update...");
    try {
        const tx = await automation.triggerNow();
        console.log("Transaction hash:", tx.hash);
        await tx.wait();
        console.log("✅ Manual trigger successful!");
        
        // Check new state
        const newLastUpdate = await automation.lastUpdateTime();
        console.log("New Last Update:", new Date(newLastUpdate * 1000).toISOString());
    } catch (error) {
        console.log("❌ Error:", error.message);
    }
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
});
