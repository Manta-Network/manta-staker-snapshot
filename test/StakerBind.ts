const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
import { ethers, network } from "hardhat";
import { generateStakerSignature } from "../scripts/utils/utils";
import { ZeroAddress } from "ethers";

const testAtlanticAddress = "dfabGCMsPPryBnXEkJK64wx5VDRFb1YM5DXxEyinZHrQ1qbHB";

describe("Staker Bind", function () {
  async function deployStaker() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const hardhatStaker = await ethers.deployContract("Staker");

    // Fixtures can return anything you consider useful for your tests
    return { hardhatStaker, owner, addr1, addr2, addr3 };
  }

  it("set admin, handler zero address check", async function () {
    const { hardhatStaker, owner, addr1, addr2 } = await loadFixture(
      deployStaker
    );

    await expect(
      hardhatStaker.connect(owner).setAdmin(ZeroAddress)
    ).to.be.revertedWith("Staker: invalid new admin");

    await expect(
      hardhatStaker.connect(owner).setHandler(ZeroAddress, true)
    ).to.be.revertedWith("Staker: invalid handler");
  });

  it("should fail if sender is not handler", async function () {
    // We use loadFixture to setup our environment, and then assert that
    // things went well
    const { hardhatStaker, owner, addr1, addr2 } = await loadFixture(
      deployStaker
    );

    // set handlers
    await expect(
      hardhatStaker.connect(addr1).setHandler(addr1.address, true)
    ).to.be.revertedWith("Staker: Only Admin");

    await expect(hardhatStaker.connect(owner).setHandler(addr1.address, true))
      .to.not.be.reverted;
  });

  it("only handler can sign claim treasure nft signature", async function () {
    const { hardhatStaker, owner, addr1, addr2 } = await loadFixture(
      deployStaker
    );

    await hardhatStaker.connect(owner).setHandler(addr1.address, true);

    // generate signature
    const { atlanticAddress, pacificAddress, nonce, sig } =
      await generateStakerSignature(
        addr2,
        testAtlanticAddress,
        addr2.address,
        Number(await hardhatStaker.getNonceByAtlanticAddress(addr2.address)) +
          1,
        network.config.chainId as number,
        await hardhatStaker.getAddress()
      );

    await expect(
      hardhatStaker
        .connect(addr2)
        .bindPacificAddress(
          atlanticAddress,
          pacificAddress,
          nonce,
          sig.v,
          sig.r,
          sig.s
        )
    ).to.be.revertedWith("Staker: Only handler can sign the signature");
  });

  it("should be able to bind pacific addresses", async function () {
    const { hardhatStaker, owner, addr1, addr2 } = await loadFixture(
      deployStaker
    );

    await hardhatStaker.connect(owner).setHandler(addr1.address, true);

    // generate signature
    const { atlanticAddress, pacificAddress, nonce, sig } =
      await generateStakerSignature(
        addr1,
        testAtlanticAddress,
        addr2.address,
        Number(
          await hardhatStaker.getNonceByAtlanticAddress(testAtlanticAddress)
        ) + 1,
        network.config.chainId as number,
        await hardhatStaker.getAddress()
      );

    // bind pacific address
    await expect(
      hardhatStaker
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
      await hardhatStaker.getRecordByAtlanticAddress(testAtlanticAddress)
    ).to.be.equal(addr2.address);
    expect(
      await hardhatStaker.getNonceByAtlanticAddress(testAtlanticAddress)
    ).to.be.equal(1);
  });

  it("should fail if nonce is not updated", async function () {
    const { hardhatStaker, owner, addr1, addr2 } = await loadFixture(
      deployStaker
    );

    await hardhatStaker.connect(owner).setHandler(addr1.address, true);

    // generate signature
    const { atlanticAddress, pacificAddress, nonce, sig } =
      await generateStakerSignature(
        addr1,
        testAtlanticAddress,
        addr2.address,
        Number(
          await hardhatStaker.getNonceByAtlanticAddress(testAtlanticAddress)
        ) + 1,
        network.config.chainId as number,
        await hardhatStaker.getAddress()
      );

    // bind pacific address
    await expect(
      hardhatStaker
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
      hardhatStaker
        .connect(addr2)
        .bindPacificAddress(
          atlanticAddress,
          pacificAddress,
          nonce,
          sig.v,
          sig.r,
          sig.s
        )
    ).to.be.revertedWith("Staker: The nonce is expired");
  });

  it("should be able to update pacific address", async function () {
    const { hardhatStaker, owner, addr1, addr2, addr3 } = await loadFixture(
      deployStaker
    );

    await hardhatStaker.connect(owner).setHandler(addr1.address, true);

    // generate signature
    const { atlanticAddress, pacificAddress, nonce, sig } =
      await generateStakerSignature(
        addr1,
        testAtlanticAddress,
        addr2.address,
        Number(
          await hardhatStaker.getNonceByAtlanticAddress(testAtlanticAddress)
        ) + 1,
        network.config.chainId as number,
        await hardhatStaker.getAddress()
      );

    // bind pacific address
    await expect(
      hardhatStaker
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
    const newSignature = await generateStakerSignature(
      addr1,
      testAtlanticAddress,
      addr3.address,
      Number(
        await hardhatStaker.getNonceByAtlanticAddress(testAtlanticAddress)
      ) + 1,
      network.config.chainId as number,
      await hardhatStaker.getAddress()
    );

    // bind pacific address
    await expect(
      hardhatStaker
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
      await hardhatStaker.getRecordByAtlanticAddress(
        newSignature.atlanticAddress
      )
    ).to.be.equal(addr3.address);
    expect(
      await hardhatStaker.getNonceByAtlanticAddress(
        newSignature.atlanticAddress
      )
    ).to.be.equal(2);
  });

  it("should be able to unbind pacific addresses", async function () {
    const { hardhatStaker, owner, addr1, addr2 } = await loadFixture(
      deployStaker
    );

    await hardhatStaker.connect(owner).setHandler(addr1.address, true);

    // generate signature
    const { atlanticAddress, pacificAddress, nonce, sig } =
      await generateStakerSignature(
        addr1,
        testAtlanticAddress,
        addr2.address,
        Number(
          await hardhatStaker.getNonceByAtlanticAddress(testAtlanticAddress)
        ) + 1,
        network.config.chainId as number,
        await hardhatStaker.getAddress()
      );

    // bind pacific address
    await expect(
      hardhatStaker
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
      await hardhatStaker.getRecordByAtlanticAddress(testAtlanticAddress)
    ).to.be.equal(addr2.address);
    expect(
      await hardhatStaker.getNonceByAtlanticAddress(testAtlanticAddress)
    ).to.be.equal(1);

    ///////////////////////////////////////////////////
    // unbind address
    // generate signature
    const newSignature = await generateStakerSignature(
      addr1,
      testAtlanticAddress,
      ZeroAddress,
      Number(
        await hardhatStaker.getNonceByAtlanticAddress(testAtlanticAddress)
      ) + 1,
      network.config.chainId as number,
      await hardhatStaker.getAddress()
    );

    // bind pacific address
    await expect(
      hardhatStaker
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
      await hardhatStaker.getRecordByAtlanticAddress(testAtlanticAddress)
    ).to.be.equal(ZeroAddress);
    expect(
      await hardhatStaker.getNonceByAtlanticAddress(testAtlanticAddress)
    ).to.be.equal(2);
  });
});
