const { ethers } = require("ethers");
const fs = require('fs');
const readline = require('readline'); // Modul untuk input pengguna
require('dotenv/config'); 

// --- KONFIGURASI JARINGAN ---
const GIWA_SEPOLIA_RPC_URL = "https://sepolia-rpc.giwa.io"; 
const GIWA_SEPOLIA_CHAIN_ID = 91342; 

// --- ALAMAT KONTRAK (VERIFIED) ---
const NFT_CONTRACT_ADDRESS = "0xC3257F47853FB7f56d9d2cA93286cB92F31130Ea"; 
const QUEST_CONTRACT_ADDRESS = "0x3854135c547aC00e117B06cba828C5bB0757852d"; 

// --- ABI ---
const NFT_ABI = [
    "function nextTokenId() view returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "function mint() public",
];
const QUEST_ABI = [
    "function recordMyAction(uint8 actionType) public",
    "function incrementNFTMint(address user) public",
];

const ACTION_TYPE_MINT_NFT = 2; 
const ACTION_TYPE_MAKE_TX = 4;

// --- UTILITY ---
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function getNextTokenId(provider) {
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
    try {
        return (await contract.nextTokenId()).toString();
    } catch (e) {
        try {
            const totalSupply = await contract.totalSupply();
            return totalSupply.add(1).toString();
        } catch (e2) {
            return "0";
        }
    }
}

function getPrivateKeysFromEnv() {
    const pks = [];
    let i = 1;
    while (process.env[`PRIVATE_KEY_${i}`]) {
        let pk = process.env[`PRIVATE_KEY_${i}`].trim();
        if (pk) pks.push(pk);
        i++;
    }
    return pks;
}

// --- FUNGSI UTAMA ---
async function mintNFTBot() {
    console.log("🚀 NFT Minting Bot Starting...");

    // 1. Input Pengguna
    const inputLoop = await askQuestion("\n🔁 Berapa kali ingin melakukan Minting per akun? (Masukkan angka): ");
    const loopCount = parseInt(inputLoop);

    if (isNaN(loopCount) || loopCount <= 0) {
        console.error("❌ Input tidak valid. Harap masukkan angka lebih besar dari 0.");
        return;
    }

    console.log(`\n✅ Bot akan berjalan sebanyak ${loopCount} putaran untuk setiap akun.\n`);

    // 2. Setup Provider
    const giwaNetwork = new ethers.Network("giwa-sepolia", GIWA_SEPOLIA_CHAIN_ID);
    const provider = new ethers.JsonRpcProvider(GIWA_SEPOLIA_RPC_URL, giwaNetwork);
    
    try {
        await provider.getNetwork();
    } catch (e) {
        console.error("❌ Gagal terhubung ke RPC. Cek koneksi internet atau RPC URL.");
        return;
    }

    const privateKeys = getPrivateKeysFromEnv();
    
    if (privateKeys.length === 0) {
        console.error("\n❌ ERROR: Tidak ada PRIVATE_KEY ditemukan di file .env.");
        return;
    }
    
    console.log(`Found ${privateKeys.length} accounts to process.`);

    // Interface untuk encode data
    const nftInterface = new ethers.Interface(NFT_ABI);
    const questInterface = new ethers.Interface(QUEST_ABI);

    // --- LOOP UTAMA (Berdasarkan Input User) ---
    for (let currentLoop = 1; currentLoop <= loopCount; currentLoop++) {
        console.log(`\n====================================================`);
        console.log(`🔄 PUTARAN KE-${currentLoop} DARI ${loopCount}`);
        console.log(`====================================================`);

        // Loop Akun
        for (let i = 0; i < privateKeys.length; i++) {
            const pk = privateKeys[i];
            let wallet;
            let botAddress;
            
            try {
                const pkWithPrefix = pk.startsWith("0x") ? pk : "0x" + pk;
                wallet = new ethers.Wallet(pkWithPrefix, provider);
                botAddress = await wallet.getAddress();
            } catch (e) {
                console.error(`\n❌ Account ${i + 1} Invalid. Skipped.`);
                continue; 
            }
            
            console.log(`\n👤 Account ${i + 1}: ${botAddress}`);

            try {
                // Cek Token ID Sebelum Mint
                const initialTokenId = await getNextTokenId(provider);
                console.log(`   [Info] Next Token ID: ${initialTokenId}`);

                // ---------------------------------------------------------
                // LANGKAH 1: MINTING NFT
                // ---------------------------------------------------------
                console.log("   1. Minting NFT...");
                
                const mintData = nftInterface.encodeFunctionData("mint", []);
                
                const txMint = await wallet.sendTransaction({
                    to: NFT_CONTRACT_ADDRESS,
                    data: mintData,
                    gasLimit: 300000,
                    from: botAddress
                });
                
                console.log(`      ⏳ Hash: ${txMint.hash}`);
                await txMint.wait();
                console.log("      ✅ NFT Minted.");

                // ---------------------------------------------------------
                // LANGKAH 2: RECORDING QUEST (MINT NFT)
                // ---------------------------------------------------------
                console.log("   2. Recording Quest (Mint NFT)...");
                const questData1 = questInterface.encodeFunctionData("recordMyAction", [ACTION_TYPE_MINT_NFT]);
                
                const txRecord1 = await wallet.sendTransaction({
                    to: QUEST_CONTRACT_ADDRESS,
                    data: questData1,
                    gasLimit: 200000,
                    from: botAddress
                });
                
                await txRecord1.wait();
                console.log("      ✅ Quest Recorded.");

                // ---------------------------------------------------------
                // LANGKAH 3: RECORDING QUEST (MAKE TX)
                // ---------------------------------------------------------
                console.log("   3. Recording Quest (Transaction)...");
                const questData2 = questInterface.encodeFunctionData("recordMyAction", [ACTION_TYPE_MAKE_TX]);
                
                try {
                    const txRecord2 = await wallet.sendTransaction({
                        to: QUEST_CONTRACT_ADDRESS,
                        data: questData2,
                        gasLimit: 200000,
                        from: botAddress
                    });
                    await txRecord2.wait();
                    console.log("      ✅ Quest Recorded.");
                } catch (e) {
                    console.log("      ⚠️ Quest skipped (already done).");
                }

                // ---------------------------------------------------------
                // LANGKAH 4: CHECKING ACHIEVEMENTS
                // ---------------------------------------------------------
                console.log("   4. Checking Achievements...");
                try {
                    const achievementData = questInterface.encodeFunctionData("incrementNFTMint", [botAddress]);
                    const txAchieve = await wallet.sendTransaction({
                        to: QUEST_CONTRACT_ADDRESS,
                        data: achievementData,
                        gasLimit: 5000000, 
                        from: botAddress
                    });
                    await txAchieve.wait();
                    console.log("      ✅ Achievements Updated.");
                } catch (e) {
                     console.log("      ⚠️ Achievement check skipped.");
                }
                
                console.log(`   🎉 Account ${i + 1} Loop ${currentLoop} Done!`);
                // Jeda antar akun agar tidak terlalu spam
                await new Promise(resolve => setTimeout(resolve, 2000)); 

            } catch (error) {
                console.error(`\n   ❌ Error: ${error.message}`);
                // Jeda lebih lama jika error
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        if (currentLoop < loopCount) {
            console.log(`\n⏳ Menunggu 5 detik sebelum putaran berikutnya...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    console.log("\n✅ SEMUA PROSES SELESAI. Bot finished.");
}

mintNFTBot();
