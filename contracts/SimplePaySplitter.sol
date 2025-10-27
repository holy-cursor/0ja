// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./@openzeppelin/contracts/access/Ownable.sol";
import "./@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./@openzeppelin/contracts/interfaces/IERC20.sol";

contract SimplePaySplitter is Ownable, ReentrancyGuard {
    address public platformReceiver;
    uint256 public platformFeeBps; // in basis points (100 = 1%)
    IERC20 public usdcToken;

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

    constructor(
        address _platformReceiver,
        address _usdcToken,
        uint256 _platformFeeBps
    ) Ownable(msg.sender) {
        require(_platformReceiver != address(0), "Invalid platform receiver");
        require(_usdcToken != address(0), "Invalid USDC token");
        require(_platformFeeBps <= 1000, "Fee too high"); // Max 10%
        
        platformReceiver = _platformReceiver;
        usdcToken = IERC20(_usdcToken);
        platformFeeBps = _platformFeeBps;
    }

    function payUSDC(
        bytes32 productId,
        address creator,
        uint256 amount
    ) external nonReentrant {
        require(creator != address(0), "Invalid creator");
        require(amount > 0, "Amount must be positive");

        // Calculate fees
        uint256 platformFee = (amount * platformFeeBps) / 10000;
        uint256 creatorAmount = amount - platformFee;

        // Transfer USDC from buyer to this contract
        require(
            usdcToken.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );

        // Transfer platform fee
        if (platformFee > 0) {
            require(
                usdcToken.transfer(platformReceiver, platformFee),
                "Platform fee transfer failed"
            );
        }

        // Transfer creator amount
        if (creatorAmount > 0) {
            require(
                usdcToken.transfer(creator, creatorAmount),
                "Creator payment failed"
            );
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
            bytes32(0) // txHash will be set by frontend
        );
    }

    function calculateFees(uint256 amount) external view returns (uint256 platformFee, uint256 creatorAmount) {
        platformFee = (amount * platformFeeBps) / 10000;
        creatorAmount = amount - platformFee;
    }
}