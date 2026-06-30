// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract WatchVault is Ownable, ReentrancyGuard {
    struct Watch {
        uint256 id;
        string brand;
        string model;
        uint256 year;
        string description;
        string imageUrl;
        uint256 purchasePrice;
        uint256 totalShares;
        uint256 sharesSold;
        bool sold;
        uint256 salePrice;
    }

    uint256 public nextWatchId;
    mapping(uint256 => Watch) public watches;
    mapping(uint256 => mapping(address => uint256)) public shares;
    mapping(uint256 => mapping(address => bool)) public claimed;
    mapping(uint256 => bool) public platformRevenueWithdrawn;

    event WatchRegistered(
        uint256 indexed watchId,
        string brand,
        string model,
        uint256 purchasePrice,
        uint256 totalShares
    );
    event SharesPurchased(
        uint256 indexed watchId,
        address indexed investor,
        uint256 amount,
        uint256 totalCost
    );
    event WatchSold(uint256 indexed watchId, uint256 salePrice);
    event RevenueClaimed(
        uint256 indexed watchId,
        address indexed investor,
        uint256 amount
    );
    event PlatformRevenueWithdrawn(uint256 indexed watchId, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function registerWatch(
        string calldata brand,
        string calldata model,
        uint256 year,
        string calldata description,
        string calldata imageUrl,
        uint256 purchasePrice,
        uint256 totalShares
    ) external onlyOwner returns (uint256 watchId) {
        require(purchasePrice > 0, "Invalid purchase price");
        require(totalShares > 0, "Invalid total shares");

        watchId = nextWatchId++;
        watches[watchId] = Watch({
            id: watchId,
            brand: brand,
            model: model,
            year: year,
            description: description,
            imageUrl: imageUrl,
            purchasePrice: purchasePrice,
            totalShares: totalShares,
            sharesSold: 0,
            sold: false,
            salePrice: 0
        });

        emit WatchRegistered(watchId, brand, model, purchasePrice, totalShares);
    }

    function buyShares(uint256 watchId, uint256 amount) external payable {
        require(amount > 0, "Amount must be greater than zero");
        Watch storage watch = watches[watchId];
        require(watch.totalShares > 0, "Watch does not exist");
        require(!watch.sold, "Watch already sold");
        require(watch.sharesSold + amount <= watch.totalShares, "Not enough shares");

        uint256 price = sharePrice(watchId);
        uint256 cost = amount * price;
        require(msg.value == cost, "Incorrect payment amount");

        watch.sharesSold += amount;
        shares[watchId][msg.sender] += amount;

        emit SharesPurchased(watchId, msg.sender, amount, cost);
    }

    function sellWatch(uint256 watchId) external payable onlyOwner {
        Watch storage watch = watches[watchId];
        require(watch.totalShares > 0, "Watch does not exist");
        require(!watch.sold, "Watch already sold");
        require(msg.value > 0, "Sale price required");

        watch.sold = true;
        watch.salePrice = msg.value;

        emit WatchSold(watchId, msg.value);
    }

    function claimRevenue(uint256 watchId) external nonReentrant {
        Watch storage watch = watches[watchId];
        require(watch.sold, "Watch not sold yet");
        require(shares[watchId][msg.sender] > 0, "No shares owned");
        require(!claimed[watchId][msg.sender], "Already claimed");

        uint256 payout = claimableAmount(watchId, msg.sender);
        require(payout > 0, "Nothing to claim");

        claimed[watchId][msg.sender] = true;

        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Transfer failed");

        emit RevenueClaimed(watchId, msg.sender, payout);
    }

    function withdrawPlatformRevenue(uint256 watchId) external onlyOwner nonReentrant {
        Watch storage watch = watches[watchId];
        require(watch.sold, "Watch not sold yet");
        require(!platformRevenueWithdrawn[watchId], "Already withdrawn");

        uint256 unsoldShares = watch.totalShares - watch.sharesSold;
        require(unsoldShares > 0, "No unsold shares");

        uint256 payout = (watch.salePrice * unsoldShares) / watch.totalShares;
        require(payout > 0, "Nothing to withdraw");

        platformRevenueWithdrawn[watchId] = true;

        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Transfer failed");

        emit PlatformRevenueWithdrawn(watchId, payout);
    }

    function getWatch(uint256 watchId) external view returns (Watch memory) {
        require(watches[watchId].totalShares > 0, "Watch does not exist");
        return watches[watchId];
    }

    function getWatchCount() external view returns (uint256) {
        return nextWatchId;
    }

    function remainingShares(uint256 watchId) external view returns (uint256) {
        Watch storage watch = watches[watchId];
        require(watch.totalShares > 0, "Watch does not exist");
        return watch.totalShares - watch.sharesSold;
    }

    function sharePrice(uint256 watchId) public view returns (uint256) {
        Watch storage watch = watches[watchId];
        require(watch.totalShares > 0, "Watch does not exist");
        return watch.purchasePrice / watch.totalShares;
    }

    function claimableAmount(
        uint256 watchId,
        address investor
    ) public view returns (uint256) {
        Watch storage watch = watches[watchId];
        if (!watch.sold || claimed[watchId][investor]) {
            return 0;
        }

        uint256 investorShares = shares[watchId][investor];
        if (investorShares == 0) {
            return 0;
        }

        return (watch.salePrice * investorShares) / watch.totalShares;
    }
}
