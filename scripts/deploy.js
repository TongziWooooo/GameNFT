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
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });