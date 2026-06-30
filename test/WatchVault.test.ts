import { expect } from "chai";
import { ethers } from "hardhat";
import { WatchVault } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("WatchVault", function () {
  let vault: WatchVault;
  let owner: HardhatEthersSigner;
  let investor: HardhatEthersSigner;
  let investor2: HardhatEthersSigner;

  const purchasePrice = ethers.parseEther("10");
  const totalShares = 1000n;
  const sharePrice = purchasePrice / totalShares;

  async function registerDefaultWatch() {
    return vault.registerWatch(
      "Rolex",
      "Daytona",
      2022,
      "Luxury chronograph",
      "https://example.com/daytona.jpg",
      purchasePrice,
      totalShares
    );
  }

  beforeEach(async function () {
    [owner, investor, investor2] = await ethers.getSigners();
    const WatchVault = await ethers.getContractFactory("WatchVault");
    vault = await WatchVault.deploy();
    await vault.waitForDeployment();
  });

  it("registers a watch", async function () {
    await registerDefaultWatch();

    const watch = await vault.getWatch(0);
    expect(watch.brand).to.equal("Rolex");
    expect(watch.model).to.equal("Daytona");
    expect(watch.purchasePrice).to.equal(purchasePrice);
    expect(watch.totalShares).to.equal(totalShares);
    expect(watch.sharesSold).to.equal(0);
    expect(watch.sold).to.equal(false);
    expect(await vault.getWatchCount()).to.equal(1);
  });

  it("allows investor to buy shares", async function () {
    await registerDefaultWatch();

    const amount = 50n;
    const cost = amount * sharePrice;

    await expect(vault.connect(investor).buyShares(0, amount, { value: cost }))
      .to.emit(vault, "SharesPurchased")
      .withArgs(0, investor.address, amount, cost);

    expect(await vault.shares(0, investor.address)).to.equal(amount);
    expect(await vault.remainingShares(0)).to.equal(totalShares - amount);
    expect(await vault.getAddress()).to.be.properAddress;
  });

  it("reverts when buying more than available shares", async function () {
    await registerDefaultWatch();

    const amount = totalShares + 1n;
    const cost = amount * sharePrice;

    await expect(
      vault.connect(investor).buyShares(0, amount, { value: cost })
    ).to.be.revertedWith("Not enough shares");
  });

  it("records watch sale", async function () {
    await registerDefaultWatch();

    const salePrice = ethers.parseEther("12");
    await expect(vault.connect(owner).sellWatch(0, { value: salePrice }))
      .to.emit(vault, "WatchSold")
      .withArgs(0, salePrice);

    const watch = await vault.getWatch(0);
    expect(watch.sold).to.equal(true);
    expect(watch.salePrice).to.equal(salePrice);
  });

  it("distributes revenue correctly on claim", async function () {
    await registerDefaultWatch();

    const amount = 50n;
    const cost = amount * sharePrice;
    await vault.connect(investor).buyShares(0, amount, { value: cost });

    const salePrice = ethers.parseEther("12");
    await vault.connect(owner).sellWatch(0, { value: salePrice });

    const expectedPayout = (salePrice * amount) / totalShares;
    expect(await vault.claimableAmount(0, investor.address)).to.equal(
      expectedPayout
    );

    const balanceBefore = await ethers.provider.getBalance(investor.address);
    const tx = await vault.connect(investor).claimRevenue(0);
    const receipt = await tx.wait();
    const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
    const balanceAfter = await ethers.provider.getBalance(investor.address);

    expect(balanceAfter + gasUsed - balanceBefore).to.equal(expectedPayout);
    expect(await vault.claimableAmount(0, investor.address)).to.equal(0);
  });

  it("reverts on double claim", async function () {
    await registerDefaultWatch();

    const amount = 50n;
    await vault
      .connect(investor)
      .buyShares(0, amount, { value: amount * sharePrice });

    const salePrice = ethers.parseEther("12");
    await vault.connect(owner).sellWatch(0, { value: salePrice });

    await vault.connect(investor).claimRevenue(0);

    await expect(
      vault.connect(investor).claimRevenue(0)
    ).to.be.revertedWith("Already claimed");
  });

  it("allows platform to withdraw unsold share revenue", async function () {
    await registerDefaultWatch();

    const amount = 700n;
    await vault
      .connect(investor)
      .buyShares(0, amount, { value: amount * sharePrice });

    const salePrice = ethers.parseEther("12");
    await vault.connect(owner).sellWatch(0, { value: salePrice });

    const unsoldShares = totalShares - amount;
    const expectedPayout = (salePrice * unsoldShares) / totalShares;

    await expect(vault.connect(owner).withdrawPlatformRevenue(0))
      .to.emit(vault, "PlatformRevenueWithdrawn")
      .withArgs(0, expectedPayout);

    await expect(
      vault.connect(owner).withdrawPlatformRevenue(0)
    ).to.be.revertedWith("Already withdrawn");
  });

  it("reverts buy when watch is sold", async function () {
    await registerDefaultWatch();
    await vault
      .connect(owner)
      .sellWatch(0, { value: ethers.parseEther("12") });

    await expect(
      vault
        .connect(investor2)
        .buyShares(0, 10n, { value: 10n * sharePrice })
    ).to.be.revertedWith("Watch already sold");
  });
});
