const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    const Greeter = await hre.ethers.getContractFactory("Greeter");
    const MyNFT = await hre.ethers.getContractFactory("MyNFT");

    const greeter = await Greeter.deploy("Hello, World!");
    const myNFT = await MyNFT.deploy();

    await greeter.deployed();
    await myNFT.deployed();

    console.log("Greeter deployed to:", greeter.address);
    console.log("MyNFT deployed to:", myNFT.address);

    // Deploy Marketplace
    const Marketplace = await hre.ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy();

    // Deploy GameNFT
    const GameNFT = await hre.ethers.getContractFactory("GameNFT");
    const gameNFT = await GameNFT.deploy(marketplace.address);

    //Deploy ArenaGame
    const ArenaGame = await hre.ethers.getContractFactory("ArenaGame");
    const arenaGame = await ArenaGame.deploy(gameNFT.address);

    await marketplace.deployed();
    await gameNFT.deployed();
    await arenaGame.deployed();

    console.log("Marketplace deployed to:", marketplace.address);
    console.log("GameNFT deployed to:", gameNFT.address);
    console.log("ArenaGame deployed to:", arenaGame.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
