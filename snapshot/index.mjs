import fetch from 'node-fetch';
import fs from 'fs';
import { ApiPromise, WsProvider } from '@polkadot/api';

const snapshotBlockNumber = 1227264;

let skip = 0;
let first = 500;
let bindRecords = {};

const main = async () => {
  // Construct API provider
  const wsProvider = new WsProvider('wss://ws.manta.systems');
  const api = await ApiPromise.create({ provider: wsProvider, noInitWarn: true });

  // generate snapshot file
  const writeStream = fs.createWriteStream("./snapshot.csv", { encoding: "utf-8" });

  writeStream.on("open", async () => {
    writeStream.write("pacificAddress,atlanticAddress,bindBlockNumber,stakingAmount\n", "utf-8");
    await queryStakedRecord(api, writeStream);
  });
}

main();

async function queryStakedRecord(api, writeStream) {
  //set the query url
  var queryURL = "https://api.goldsky.com/api/public/project_clnv4qr7e30dv33vpgx7y0f1d/subgraphs/mainnet-staker/1.0.0/gn"

  //define the query to fetch a list of stake record
  const graphQuery = `query {
    bindPacificAddresses(first:${first},skip:${skip}, orderBy:blockNumber){
      id,
      atlanticAddress,
      pacificAddress,
      blockNumber
    }
  }`

  //set the request options
  var options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: graphQuery
    })
  };

  console.log(`query bind records from subgraph, first:${first}, skip:${skip}`);
  //get the response
  const response = await fetch(queryURL, options);

  //parsing the body text as JSON
  const queryResult = await response.json();

  // override old bind record
  const records = queryResult.data.bindPacificAddresses;
  records.map((item) => {
    if (item.blockNumber <= snapshotBlockNumber) {
      item.stakingAmount = 0;
      bindRecords[item.atlanticAddress] = item;
    }
  })

  let atlanticAddressArray = Object.keys(bindRecords);

  console.log(`query staking amount on Atlantic network, first:${first}, skip:${skip}`);
  // query staking amount
  const delegatorState = await api.query.parachainStaking.delegatorState.multi(
    atlanticAddressArray
  );

  for (let i = 0; i < atlanticAddressArray.length; i++) {
    const currentDelegatorState = delegatorState[i];

    const delegationsRaw = currentDelegatorState.isSome
      ? currentDelegatorState.value.delegations
      : [];

    let currentAccountStakingAmount = 0;
    await delegationsRaw.map((delegationRaw) => {
      currentAccountStakingAmount = Number(currentAccountStakingAmount) + parseInt(delegationRaw.amount / 1e18);
    });

    // update staking amount of bind record
    bindRecords[atlanticAddressArray[i]].stakingAmount = currentAccountStakingAmount;
  }

  // fetch next records
  if (records.length == first) {
    skip = 500 + skip;
    await queryStakedRecord(api, writeStream);
  } else {
    // save bind record into file
    for (const [key, value] of Object.entries(bindRecords)) {
      const records = [];
      records.push(value.pacificAddress);
      records.push(value.atlanticAddress);
      records.push(value.blockNumber);
      records.push(value.stakingAmount);

      const toString = records.join(",")

      writeStream.write(toString + "\n", "utf-8");
    }
    console.log(`snapshot records saved into snapshot.csv`);
    writeStream.end();
    await api.disconnect();
  }
}
