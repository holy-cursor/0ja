const { expect } = require("chai");
const { ethers } = require("hardhat");

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

  it("Should calculate fees correctly", async function () {
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
    
    const amount = ethers.utils.parseUnits("100", 6); // 100 USDC
    const [platformFee, creatorAmount] = await paySplitter.calculateFees(amount);
    
    const expectedPlatformFee = amount.mul(platformFeeBps).div(10000);
    const expectedCreatorAmount = amount.sub(expectedPlatformFee);
    
    expect(platformFee).to.equal(expectedPlatformFee);
    expect(creatorAmount).to.equal(expectedCreatorAmount);
  });
});
