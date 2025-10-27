// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PaySplitter
 * @dev A smart contract for handling payments with automatic fee splitting
 * @author Sellify Team
 */
contract PaySplitter is Ownable, ReentrancyGuard {
    // Platform fee in basis points (100 = 1%)
    uint256 public platformFeeBps;
    
    // Platform fee receiver address
    address public platformReceiver;
    
    // USDC token address
    IERC20 public usdcToken;
    
    // Events
    event PaymentReceived(
        bytes32 indexed productId,
        address indexed buyer,
        address indexed creator,
        uint256 amount,
        address token,
        uint256 platformFee,
        uint256 creatorAmount,
        bytes32 txHash
    );
    
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event PlatformReceiverUpdated(address oldReceiver, address newReceiver);
    event USDCAddressUpdated(address oldUSDC, address newUSDC);
    
    // Errors
    error InvalidFee(uint256 fee);
    error InvalidAddress(address addr);
    error InsufficientBalance(uint256 required, uint256 available);
    error TransferFailed();
    error ZeroAmount();
    
    /**
     * @dev Constructor
     * @param _platformFeeBps Platform fee in basis points (e.g., 200 = 2%)
     * @param _platformReceiver Address to receive platform fees
     * @param _usdcAddress USDC token contract address
     */
    constructor(
        uint256 _platformFeeBps,
        address _platformReceiver,
        address _usdcAddress
    ) Ownable(msg.sender) {
        if (_platformFeeBps > 1000) revert InvalidFee(_platformFeeBps); // Max 10%
        if (_platformReceiver == address(0)) revert InvalidAddress(_platformReceiver);
        if (_usdcAddress == address(0)) revert InvalidAddress(_usdcAddress);
        
        platformFeeBps = _platformFeeBps;
        platformReceiver = _platformReceiver;
        usdcToken = IERC20(_usdcAddress);
    }
    
    /**
     * @dev Process USDC payment with automatic fee splitting
     * @param productId Unique product identifier
     * @param creator Creator's wallet address
     * @param amount Payment amount in USDC (with 6 decimals)
     */
    function payUSDC(
        bytes32 productId,
        address creator,
        uint256 amount
    ) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (creator == address(0)) revert InvalidAddress(creator);
        
        // Check if contract has enough USDC allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < amount) revert InsufficientBalance(amount, allowance);
        
        // Transfer USDC from buyer to contract
        bool success = usdcToken.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
        
        // Calculate fee split
        uint256 platformFee = (amount * platformFeeBps) / 10000;
        uint256 creatorAmount = amount - platformFee;
        
        // Transfer creator's share
        if (creatorAmount > 0) {
            success = usdcToken.transfer(creator, creatorAmount);
            if (!success) revert TransferFailed();
        }
        
        // Transfer platform fee
        if (platformFee > 0) {
            success = usdcToken.transfer(platformReceiver, platformFee);
            if (!success) revert TransferFailed();
        }
        
        // Emit event
        emit PaymentReceived(
            productId,
            msg.sender,
            creator,
            amount,
            address(usdcToken),
            platformFee,
            creatorAmount,
            bytes32(uint256(uint160(msg.sender)) ^ uint256(block.timestamp))
        );
    }
    
    /**
     * @dev Process ETH payment with automatic fee splitting
     * @param productId Unique product identifier
     * @param creator Creator's wallet address
     */
    function payETH(
        bytes32 productId,
        address creator
    ) external payable nonReentrant {
        if (msg.value == 0) revert ZeroAmount();
        if (creator == address(0)) revert InvalidAddress(creator);
        
        // Calculate fee split
        uint256 platformFee = (msg.value * platformFeeBps) / 10000;
        uint256 creatorAmount = msg.value - platformFee;
        
        // Transfer creator's share
        if (creatorAmount > 0) {
            (bool success, ) = creator.call{value: creatorAmount}("");
            if (!success) revert TransferFailed();
        }
        
        // Transfer platform fee
        if (platformFee > 0) {
            (bool success, ) = platformReceiver.call{value: platformFee}("");
            if (!success) revert TransferFailed();
        }
        
        // Emit event
        emit PaymentReceived(
            productId,
            msg.sender,
            creator,
            msg.value,
            address(0), // ETH
            platformFee,
            creatorAmount,
            bytes32(uint256(uint160(msg.sender)) ^ uint256(block.timestamp))
        );
    }
    
    /**
     * @dev Update platform fee (only owner)
     * @param newFeeBps New fee in basis points
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > 1000) revert InvalidFee(newFeeBps); // Max 10%
        
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        
        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }
    
    /**
     * @dev Update platform receiver (only owner)
     * @param newReceiver New platform receiver address
     */
    function setPlatformReceiver(address newReceiver) external onlyOwner {
        if (newReceiver == address(0)) revert InvalidAddress(newReceiver);
        
        address oldReceiver = platformReceiver;
        platformReceiver = newReceiver;
        
        emit PlatformReceiverUpdated(oldReceiver, newReceiver);
    }
    
    /**
     * @dev Update USDC token address (only owner)
     * @param newUSDC New USDC token address
     */
    function setUSDCAddress(address newUSDC) external onlyOwner {
        if (newUSDC == address(0)) revert InvalidAddress(newUSDC);
        
        address oldUSDC = address(usdcToken);
        usdcToken = IERC20(newUSDC);
        
        emit USDCAddressUpdated(oldUSDC, newUSDC);
    }
    
    /**
     * @dev Emergency withdraw function (only owner)
     * @param token Token address (address(0) for ETH)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            // Withdraw ETH
            (bool success, ) = owner().call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            // Withdraw ERC20
            IERC20(token).transfer(owner(), amount);
        }
    }
    
    /**
     * @dev Get contract balance for a token
     * @param token Token address (address(0) for ETH)
     * @return balance Contract balance
     */
    function getBalance(address token) external view returns (uint256 balance) {
        if (token == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(token).balanceOf(address(this));
        }
    }
    
    /**
     * @dev Calculate fee amounts for a given payment
     * @param amount Payment amount
     * @return platformFee Platform fee amount
     * @return creatorAmount Creator amount
     */
    function calculateFees(uint256 amount) external view returns (uint256 platformFee, uint256 creatorAmount) {
        platformFee = (amount * platformFeeBps) / 10000;
        creatorAmount = amount - platformFee;
    }
}
