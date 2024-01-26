import fetch from 'node-fetch';
import fs from 'fs';

let skip = 0;
let first = 500;
let bindRecords = {};

// snapshot file
const writeStream = fs.createWriteStream("./snapshot.csv", { encoding: "utf-8" });

writeStream.on("open", async () => {
  writeStream.write("pacificAddress, atlanticAddress,stakedBlockNumber\n", "utf-8");
  queryStakedRecord();
});

async function queryStakedRecord() {
  //set the query url
  var queryURL = "https://api.goldsky.com/api/public/project_clnv4qr7e30dv33vpgx7y0f1d/subgraphs/testnet-staker/1.0.6/gn"

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

  //get the response
  const response = await fetch(queryURL, options);

  //parsing the body text as JSON
  const queryResult = await response.json();

  // override old bind record
  const records = queryResult.data.bindPacificAddresses;
  records.map((item) => {
    bindRecords[item.atlanticAddress] = item;
  })

  // fetch next records
  if (records.length == first) {
    skip = 500 + skip;
    await queryStakedRecord();
  } else {
    // save bind record into file
    for (const [key, value] of Object.entries(bindRecords)) {
      const records = [];
      records.push(value.atlanticAddress);
      records.push(value.pacificAddress);
      records.push(value.blockNumber);

      const toString = records.join(",")

      writeStream.write(toString + "\n", "utf-8");
    }
  }
}
