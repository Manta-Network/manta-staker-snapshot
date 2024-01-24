const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
import { ethers, network } from "hardhat";
import { generateStakerBindSignature } from "../scripts/utils/utils";
import { ZeroAddress } from "ethers";

const testAtlanticAddress = "dfabGCMsPPryBnXEkJK64wx5VDRFb1YM5DXxEyinZHrQ1qbHB";

describe("Staker Bind", function () {
  async function deployStakerBind() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const hardhatStakerBind = await ethers.deployContract("StakerBind");

    // Fixtures can return anything you consider useful for your tests
    return { hardhatStakerBind, owner, addr1, addr2, addr3 };
  }

  it("set admin, handler zero address check", async function () {
    const { hardhatStakerBind, owner, addr1, addr2 } = await loadFixture(
      deployStakerBind
    );

    await expect(
      hardhatStakerBind.connect(owner).setAdmin(ZeroAddress)
    ).to.be.revertedWith("StakerBind: invalid new admin");

    await expect(
      hardhatStakerBind.connect(owner).setHandler(ZeroAddress, true)
    ).to.be.revertedWith("StakerBind: invalid handler");
  });

  it("should fail if sender is not handler", async function () {
    // We use loadFixture to setup our environment, and then assert that
    // things went well
    const { hardhatStakerBind, owner, addr1, addr2 } = await loadFixture(
      deployStakerBind
    );

    // set handlers
    await expect(
      hardhatStakerBind.connect(addr1).setHandler(addr1.address, true)
    ).to.be.revertedWith("StakerBind: Only Admin");

    await expect(
      hardhatStakerBind.connect(owner).setHandler(addr1.address, true)
    ).to.not.be.reverted;
  });

  it("only handler can sign claim treasure nft signature", async function () {
    const { hardhatStakerBind, owner, addr1, addr2 } = await loadFixture(
      deployStakerBind
    );

    await hardhatStakerBind.connect(owner).setHandler(addr1.address, true);

    // generate signature
    const { atlanticAddress, pacificAddress, nonce, sig } =
      await generateStakerBindSignature(
        addr2,
        testAtlanticAddress,
        addr2.address,
        Number(
          await hardhatStakerBind.getNonceByAtlanticAddress(addr2.address)
        ) + 1,
        network.config.chainId as number,
        await hardhatStakerBind.getAddress()
      );

    await expect(
      hardhatStakerBind
        .connect(addr2)
        .bindPacificAddress(
          atlanticAddress,
          pacificAddress,
          nonce,
          sig.v,
          sig.r,
          sig.s
        )
    ).to.be.revertedWith("StakerBind: Only handler can sign the signature");
  });

  it("should be able to bind pacific addresses", async function () {
    const { hardhatStakerBind, owner, addr1, addr2 } = await loadFixture(
      deployStakerBind
    );

    await hardhatStakerBind.connect(owner).setHandler(addr1.address, true);

    // generate signature
    const { atlanticAddress, pacificAddress, nonce, sig } =
      await generateStakerBindSignature(
        addr1,
        testAtlanticAddress,
        addr2.address,
        Number(
          await hardhatStakerBind.getNonceByAtlanticAddress(testAtlanticAddress)
        ) + 1,
        network.config.chainId as number,
        await hardhatStakerBind.getAddress()
      );

    // bind pacific address
    await expect(
      hardhatStakerBind
        .connect(addr2)
        .bindPacificAddress(
          atlanticAddress,
          pacificAddress,
          nonce,
          sig.v,
          sig.r,
          sig.s
        )
    ).to.not.be.reverted;

    // verify contract state
    expect(
      await hardhatStakerBind.getRecordByAtlanticAddress(testAtlanticAddress)
    ).to.be.equal(addr2.address);
    expect(
      await hardhatStakerBind.getNonceByAtlanticAddress(testAtlanticAddress)
    ).to.be.equal(1);
  });

  it("should fail if nonce is not updated", async function () {
    const { hardhatStakerBind, owner, addr1, addr2 } = await loadFixture(
      deployStakerBind
    );

    await hardhatStakerBind.connect(owner).setHandler(addr1.address, true);

    // generate signature
    const { atlanticAddress, pacificAddress, nonce, sig } =
      await generateStakerBindSignature(
        addr1,
        testAtlanticAddress,
        addr2.address,
        Number(
          await hardhatStakerBind.getNonceByAtlanticAddress(testAtlanticAddress)
        ) + 1,
        network.config.chainId as number,
        await hardhatStakerBind.getAddress()
      );

    // bind pacific address
    await expect(
      hardhatStakerBind
        .connect(addr2)
        .bindPacificAddress(
          atlanticAddress,
          pacificAddress,
          nonce,
          sig.v,
          sig.r,
          sig.s
        )
    ).to.not.be.reverted;

    await expect(
      hardhatStakerBind
        .connect(addr2)
        .bindPacificAddress(
          atlanticAddress,
          pacificAddress,
          nonce,
          sig.v,
          sig.r,
          sig.s
        )
    ).to.be.revertedWith("StakerBind: The nonce is expired");
  });

  it("should be able to update pacific address", async function () {
    const { hardhatStakerBind, owner, addr1, addr2, addr3 } = await loadFixture(
      deployStakerBind
    );

    await hardhatStakerBind.connect(owner).setHandler(addr1.address, true);

    // generate signature
    const { atlanticAddress, pacificAddress, nonce, sig } =
      await generateStakerBindSignature(
        addr1,
        testAtlanticAddress,
        addr2.address,
        Number(
          await hardhatStakerBind.getNonceByAtlanticAddress(testAtlanticAddress)
        ) + 1,
        network.config.chainId as number,
        await hardhatStakerBind.getAddress()
      );

    // bind pacific address
    await expect(
      hardhatStakerBind
        .connect(addr2)
        .bindPacificAddress(
          atlanticAddress,
          pacificAddress,
          nonce,
          sig.v,
          sig.r,
          sig.s
        )
    ).to.not.be.reverted;

    ///////////////////////////////////////////////////
    // bind address again
    // generate signature
    const newSignature = await generateStakerBindSignature(
      addr1,
      testAtlanticAddress,
      addr3.address,
      Number(
        await hardhatStakerBind.getNonceByAtlanticAddress(testAtlanticAddress)
      ) + 1,
      network.config.chainId as number,
      await hardhatStakerBind.getAddress()
    );

    // bind pacific address
    await expect(
      hardhatStakerBind
        .connect(addr2)
        .bindPacificAddress(
          newSignature.atlanticAddress,
          newSignature.pacificAddress,
          newSignature.nonce,
          newSignature.sig.v,
          newSignature.sig.r,
          newSignature.sig.s
        )
    ).to.not.be.reverted;

    // verify contract state
    expect(
      await hardhatStakerBind.getRecordByAtlanticAddress(
        newSignature.atlanticAddress
      )
    ).to.be.equal(addr3.address);
    expect(
      await hardhatStakerBind.getNonceByAtlanticAddress(
        newSignature.atlanticAddress
      )
    ).to.be.equal(2);
  });

  it("should be able to unbind pacific addresses", async function () {
    const { hardhatStakerBind, owner, addr1, addr2 } = await loadFixture(
      deployStakerBind
    );

    await hardhatStakerBind.connect(owner).setHandler(addr1.address, true);

    // generate signature
    const { atlanticAddress, pacificAddress, nonce, sig } =
      await generateStakerBindSignature(
        addr1,
        testAtlanticAddress,
        addr2.address,
        Number(
          await hardhatStakerBind.getNonceByAtlanticAddress(testAtlanticAddress)
        ) + 1,
        network.config.chainId as number,
        await hardhatStakerBind.getAddress()
      );

    // bind pacific address
    await expect(
      hardhatStakerBind
        .connect(addr2)
        .bindPacificAddress(
          atlanticAddress,
          pacificAddress,
          nonce,
          sig.v,
          sig.r,
          sig.s
        )
    ).to.not.be.reverted;

    // verify contract state
    expect(
      await hardhatStakerBind.getRecordByAtlanticAddress(testAtlanticAddress)
    ).to.be.equal(addr2.address);
    expect(
      await hardhatStakerBind.getNonceByAtlanticAddress(testAtlanticAddress)
    ).to.be.equal(1);

    ///////////////////////////////////////////////////
    // unbind address
    // generate signature
    const newSignature = await generateStakerBindSignature(
      addr1,
      testAtlanticAddress,
      ZeroAddress,
      Number(
        await hardhatStakerBind.getNonceByAtlanticAddress(testAtlanticAddress)
      ) + 1,
      network.config.chainId as number,
      await hardhatStakerBind.getAddress()
    );

    // bind pacific address
    await expect(
      hardhatStakerBind
        .connect(addr2)
        .bindPacificAddress(
          newSignature.atlanticAddress,
          newSignature.pacificAddress,
          newSignature.nonce,
          newSignature.sig.v,
          newSignature.sig.r,
          newSignature.sig.s
        )
    ).to.not.be.reverted;

    // verify contract state
    expect(
      await hardhatStakerBind.getRecordByAtlanticAddress(testAtlanticAddress)
    ).to.be.equal(ZeroAddress);
    expect(
      await hardhatStakerBind.getNonceByAtlanticAddress(testAtlanticAddress)
    ).to.be.equal(2);
  });
});
