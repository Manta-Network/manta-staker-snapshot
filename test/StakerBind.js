const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

const testSubstrateAddress1 = "dfabGCMsPPryBnXEkJK64wx5VDRFb1YM5DXxEyinZHrQ1qbHB";
const testSubstrateAddress2 = "dfbmUJG9739gqaxXrLwuGaVjSEcUTkvSYwwyBibrhL2HqXWnh";
const testSubstrateAddress3 = "dfafqAJkRGRy4B5kSttFyysPYz4V1jCgcuvqgdYk2sWN9sCjF";

const emptyEvmAddress = "0x0000000000000000000000000000000000000000";

describe("Staker Bind", function () {

  async function deployStakerBind() {
    const [owner, addr1] = await ethers.getSigners();

    const hardhatStakerBind = await ethers.deployContract("StakerBind");

    // Fixtures can return anything you consider useful for your tests
    return { hardhatStakerBind, owner, addr1 };
  }

  it("Should be able to bind multiple addresses", async function () {
    const { hardhatStakerBind, owner, addr1 } = await loadFixture(deployStakerBind);

    // query record
    let atlanticRecord = await hardhatStakerBind.getRecordByPacificAddress(addr1.address);
    let pacificRecord1 = await hardhatStakerBind.getRecordByAtlanticAddress(testSubstrateAddress1);

    // should be empty
    expect(atlanticRecord.length).to.equal(0);
    expect(pacificRecord1).to.equal(emptyEvmAddress);

    // bind atlantic address
    await hardhatStakerBind.connect(addr1).bindAtlanticAddress(testSubstrateAddress1);
    await hardhatStakerBind.connect(addr1).bindAtlanticAddress(testSubstrateAddress2);
    await hardhatStakerBind.connect(addr1).bindAtlanticAddress(testSubstrateAddress3);

    // query record again
    atlanticRecord = await hardhatStakerBind.getRecordByPacificAddress(addr1.address);
    pacificRecord1 = await hardhatStakerBind.getRecordByAtlanticAddress(testSubstrateAddress1);
    const pacificRecord2 = await hardhatStakerBind.getRecordByAtlanticAddress(testSubstrateAddress2);
    const pacificRecord3 = await hardhatStakerBind.getRecordByAtlanticAddress(testSubstrateAddress3);

    // expect bind successfully
    expect(atlanticRecord.length).to.equal(3);

    expect(atlanticRecord[0][0]).to.equal(testSubstrateAddress1);
    expect(atlanticRecord[1][0]).to.equal(testSubstrateAddress2);
    expect(atlanticRecord[2][0]).to.equal(testSubstrateAddress3);

    expect(pacificRecord1).to.equal(addr1.address);
    expect(pacificRecord2).to.equal(addr1.address);
    expect(pacificRecord3).to.equal(addr1.address);
  });

  it("Should be able to unbind multiple addresses", async function () {
    const { hardhatStakerBind, owner, addr1 } = await loadFixture(deployStakerBind);

    // bind atlantic address
    await hardhatStakerBind.connect(addr1).bindAtlanticAddress(testSubstrateAddress1);
    await hardhatStakerBind.connect(addr1).bindAtlanticAddress(testSubstrateAddress2);
    await hardhatStakerBind.connect(addr1).bindAtlanticAddress(testSubstrateAddress3);

    // unbind atlantic address 1
    await hardhatStakerBind.connect(addr1).unbindAtlanticAddress(testSubstrateAddress1);
    // query record
    let atlanticRecord = await hardhatStakerBind.getRecordByPacificAddress(addr1.address);
    let pacificRecord1 = await hardhatStakerBind.getRecordByAtlanticAddress(testSubstrateAddress1);

    expect(atlanticRecord[0][0]).to.equal(testSubstrateAddress3);
    expect(pacificRecord1).to.equal(emptyEvmAddress);

    // unbind atlantic address 2
    await hardhatStakerBind.connect(addr1).unbindAtlanticAddress(testSubstrateAddress2);
    // query record
    atlanticRecord = await hardhatStakerBind.getRecordByPacificAddress(addr1.address);
    pacificRecord2 = await hardhatStakerBind.getRecordByAtlanticAddress(testSubstrateAddress2);

    expect(atlanticRecord[0][0]).to.equal(testSubstrateAddress3);
    expect(pacificRecord2).to.equal(emptyEvmAddress);

    // unbind atlantic address 3
    await hardhatStakerBind.connect(addr1).unbindAtlanticAddress(testSubstrateAddress3);
    // query record
    atlanticRecord = await hardhatStakerBind.getRecordByPacificAddress(addr1.address);
    pacificRecord3 = await hardhatStakerBind.getRecordByAtlanticAddress(testSubstrateAddress3);

    expect(atlanticRecord.length).to.equal(0);
    expect(pacificRecord3).to.equal(emptyEvmAddress);
  });
});