const { ethers } = require("ethers");
// const abi = require("./USDCABI");
const historyModel = require("../models/historyModel");

const usdcContractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const providerUrl = 'https://mainnet.infura.io/v3/270370ea66fa434dac75f33800728a75 ';
const provider = new ethers.providers.JsonRpcProvider(providerUrl);
const abi = [
    'event Transfer(address indexed from, address indexed to, uint256 value)',
];
const usdcContract = new ethers.Contract(usdcContractAddress, abi, provider);


let isListening = false;
let isMigrating = false;
let isMigrated = false;
let flagBlockNumber = 0;
let estimatedBlockNumber = 0;
let migratingBlockNumber = 0;
let percent = 0;
let startTime = 0;
let endTime = 0;
let elapsedTime = 0;
let latestBlockNumber = 0;
const parseHistory = (logs) => {
    const history = [];
    for (const log of logs) {
        const iface = new ethers.utils.Interface(abi);
        const decodedLog = iface.parseLog(log);
        const [from, to, value] = decodedLog.args;
        history.push({
            from: from,
            to: to,
            value: Number(value),
            blockNumber: log.blockNumber,
            txHash: log.transactionHash,
        })
    }
    return history;
}

const startListening = () => {
    if (isListening) return true;
    isListening = true;
    usdcContract.on('Transfer', async (from, to, value, event) => {
        try {
            const data = await historyModel.create({
                from, to, value: Number(value), blockNumber: event.blockNumber, txHash: event.transactionHash
            });
            console.log('Event Logged on.... ', event.transactionHash);
            latestBlockNumber = event.blockNumber;
        } catch (err) {
            console.log('ERROR', err.code);
        }
    }
    );
    return true;
}

module.exports.startApp = async () => {
    if (isMigrated) return { status: "Migrate Finished" }
    if (isMigrating) return { status: "Migrate started" }
    await historyModel.collection.drop();
    isMigrating = true;
    const targetTimestamp = Date.parse('2023-03-01T00:00:00Z') / 1000;
    // Get current block number
    flagBlockNumber = await provider.getBlockNumber();
    startListening();
    startTime = new Date().getTime();
    // Estimate the target block number
    const { timestamp: latestTimeStamp } = await provider.getBlock(flagBlockNumber);
    const secondsPerBlock = 13;
    const secondsDelta = latestTimeStamp - targetTimestamp;
    estimatedBlockNumber = flagBlockNumber - Math.floor(secondsDelta / secondsPerBlock);

    // filter by Transfer events only
    const filter = {
        address: usdcContractAddress,
        topics: [ethers.utils.id("Transfer(address,address,uint256)")],
    };

    // retrieve past Transfer events from 1st March 2023
    let fromBlock = estimatedBlockNumber;
    let toBlock = estimatedBlockNumber + 50; // or specify a block number
    const logs = [];
    while (toBlock < flagBlockNumber) {
        const ret = await provider.getLogs({ ...filter, fromBlock, toBlock });
        logs.push(...ret);
        const parsedLog = parseHistory(ret);
        historyModel.insertMany(parsedLog);
        fromBlock = toBlock;
        migratingBlockNumber = toBlock;
        toBlock += 50;
        percent = (migratingBlockNumber - estimatedBlockNumber) * 100 / (flagBlockNumber - estimatedBlockNumber)
        percent = percent.toFixed(2);
        endTime = new Date().getTime();
        elapsedTime = (endTime - startTime) / 1000 / 60;
        elapsedTime = elapsedTime.toFixed(1);
        console.log("Migrating....", percent, "%")
        console.log("Migrating....", elapsedTime, "min ")
    }
    isMigrated = true;
    isMigrating = false;
}

module.exports.getAppStatus = () => {
    const appStatus = {
        isMigrated,
        isMigrating,
        flagBlockNumber,
        isListening,
        estimatedBlockNumber,
        migratingBlockNumber,
        percent,
        elapsedTime,
        latestBlockNumber,
    }
    console.log('appStatus :>> ', appStatus);
    return appStatus;
}
