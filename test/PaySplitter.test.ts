import { expect } from "chai";
import { ethers } from "hardhat";
import { PaySplitter } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("PaySplitter", function () {
  let paySplitter: PaySplitter;
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;
  let buyer: SignerWithAddress;
  let platformReceiver: SignerWithAddress;
  let mockUSDC: any;

  const PLATFORM_FEE_BPS = 200; // 2%
  const USDC_DECIMALS = 6;
  const PAYMENT_AMOUNT = ethers.utils.parseUnits("100", USDC_DECIMALS); // 100 USDC

  beforeEach(async function () {
    [owner, creator, buyer, platformReceiver] = await ethers.getSigners();

    // Deploy mock USDC token
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    await mockUSDC.deployed();

    // Deploy PaySplitter
    const PaySplitter = await ethers.getContractFactory("PaySplitter");
    paySplitter = await PaySplitter.deploy(
      PLATFORM_FEE_BPS,
      platformReceiver.address,
      mockUSDC.address
    );
    await paySplitter.deployed();

    // Mint USDC to buyer
    await mockUSDC.mint(buyer.address, ethers.utils.parseUnits("1000", USDC_DECIMALS));
  });

  describe("Deployment", function () {
    it("Should set the correct platform fee", async function () {
      expect(await paySplitter.platformFeeBps()).to.equal(PLATFORM_FEE_BPS);
    });

    it("Should set the correct platform receiver", async function () {
      expect(await paySplitter.platformReceiver()).to.equal(platformReceiver.address);
    });

    it("Should set the correct USDC address", async function () {
      expect(await paySplitter.usdcToken()).to.equal(mockUSDC.address);
    });
  });

  describe("USDC Payments", function () {
    it("Should process USDC payment correctly", async function () {
      // Approve contract to spend USDC
      await mockUSDC.connect(buyer).approve(paySplitter.address, PAYMENT_AMOUNT);

      // Get initial balances
      const creatorInitialBalance = await mockUSDC.balanceOf(creator.address);
      const platformInitialBalance = await mockUSDC.balanceOf(platformReceiver.address);

      // Process payment
      const productId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-product"));
      await paySplitter.connect(buyer).payUSDC(productId, creator.address, PAYMENT_AMOUNT);

      // Check balances
      const creatorFinalBalance = await mockUSDC.balanceOf(creator.address);
      const platformFinalBalance = await mockUSDC.balanceOf(platformReceiver.address);

      const expectedPlatformFee = PAYMENT_AMOUNT.mul(PLATFORM_FEE_BPS).div(10000);
      const expectedCreatorAmount = PAYMENT_AMOUNT.sub(expectedPlatformFee);

      expect(creatorFinalBalance.sub(creatorInitialBalance)).to.equal(expectedCreatorAmount);
      expect(platformFinalBalance.sub(platformInitialBalance)).to.equal(expectedPlatformFee);
    });

    it("Should emit PaymentReceived event", async function () {
      await mockUSDC.connect(buyer).approve(paySplitter.address, PAYMENT_AMOUNT);

      const productId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-product"));
      
      await expect(paySplitter.connect(buyer).payUSDC(productId, creator.address, PAYMENT_AMOUNT))
        .to.emit(paySplitter, "PaymentReceived")
        .withArgs(
          productId,
          buyer.address,
          creator.address,
          PAYMENT_AMOUNT,
          mockUSDC.address,
          PAYMENT_AMOUNT.mul(PLATFORM_FEE_BPS).div(10000),
          PAYMENT_AMOUNT.sub(PAYMENT_AMOUNT.mul(PLATFORM_FEE_BPS).div(10000)),
          ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [buyer.address, await ethers.provider.getBlockNumber()]))
        );
    });

    it("Should revert with insufficient allowance", async function () {
      const productId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-product"));
      
      await expect(
        paySplitter.connect(buyer).payUSDC(productId, creator.address, PAYMENT_AMOUNT)
      ).to.be.revertedWith("InsufficientBalance");
    });

    it("Should revert with zero amount", async function () {
      const productId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-product"));
      
      await expect(
        paySplitter.connect(buyer).payUSDC(productId, creator.address, 0)
      ).to.be.revertedWith("ZeroAmount");
    });
  });

  describe("ETH Payments", function () {
    it("Should process ETH payment correctly", async function () {
      const ethAmount = ethers.utils.parseEther("1"); // 1 ETH

      // Get initial balances
      const creatorInitialBalance = await creator.getBalance();
      const platformInitialBalance = await platformReceiver.getBalance();

      // Process payment
      const productId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-product"));
      await paySplitter.connect(buyer).payETH(productId, creator.address, { value: ethAmount });

      // Check balances (accounting for gas)
      const creatorFinalBalance = await creator.getBalance();
      const platformFinalBalance = await platformReceiver.getBalance();

      const expectedPlatformFee = ethAmount.mul(PLATFORM_FEE_BPS).div(10000);
      const expectedCreatorAmount = ethAmount.sub(expectedPlatformFee);

      expect(creatorFinalBalance.sub(creatorInitialBalance)).to.be.closeTo(expectedCreatorAmount, ethers.utils.parseEther("0.01"));
      expect(platformFinalBalance.sub(platformInitialBalance)).to.equal(expectedPlatformFee);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update platform fee", async function () {
      const newFee = 300; // 3%
      await paySplitter.connect(owner).setPlatformFee(newFee);
      expect(await paySplitter.platformFeeBps()).to.equal(newFee);
    });

    it("Should allow owner to update platform receiver", async function () {
      const newReceiver = buyer.address;
      await paySplitter.connect(owner).setPlatformReceiver(newReceiver);
      expect(await paySplitter.platformReceiver()).to.equal(newReceiver);
    });

    it("Should not allow non-owner to update platform fee", async function () {
      await expect(
        paySplitter.connect(buyer).setPlatformFee(300)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Fee Calculation", function () {
    it("Should calculate fees correctly", async function () {
      const [platformFee, creatorAmount] = await paySplitter.calculateFees(PAYMENT_AMOUNT);
      
      const expectedPlatformFee = PAYMENT_AMOUNT.mul(PLATFORM_FEE_BPS).div(10000);
      const expectedCreatorAmount = PAYMENT_AMOUNT.sub(expectedPlatformFee);

      expect(platformFee).to.equal(expectedPlatformFee);
      expect(creatorAmount).to.equal(expectedCreatorAmount);
    });
  });
});
