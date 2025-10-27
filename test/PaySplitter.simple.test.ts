import { expect } from "chai";
import { ethers } from "hardhat";

describe("PaySplitter", function () {
  it("Should deploy successfully", async function () {
    const PaySplitter = await ethers.getContractFactory("PaySplitter");
    
    const platformFeeBps = 200; // 2%
    const platformReceiver = "0x0000000000000000000000000000000000000000";
    const usdcAddress = "0x0000000000000000000000000000000000000000";
    
    const paySplitter = await PaySplitter.deploy(
      platformFeeBps,
      platformReceiver,
      usdcAddress
    );
    
    await paySplitter.deployed();
    
    expect(paySplitter.address).to.not.equal(ethers.constants.AddressZero);
    expect(await paySplitter.platformFeeBps()).to.equal(platformFeeBps);
  });
});
