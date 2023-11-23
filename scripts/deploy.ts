import { ethers } from "hardhat";
async function main() {
  const name = "MyMultilityToken";
  const symbol = "MMT";

  const utilities = [
    [1, "Utility A", "0x1234567890abcdef1234567890abcdef12345678", true],
    [2, "Utility B", "0xf11d8A2BF17D04C50CfB6ba505e1e88c4BD4b673", false],
  ];

  const mContract = await ethers.deployContract("Multiutility", [
    name,
    symbol,
    utilities,
  ]);

  console.log(`Multility contract deployed to: ${mContract.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
