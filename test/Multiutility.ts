import { ethers } from "hardhat";
import { expect } from "chai";

describe("Multiutility", function () {
  it("should deploy successfully", async function () {
    const utilities = [
      [
        1,
        "Utility A",
        ethers.getAddress("0x1234567890abcdef1234567890abcdef12345678"),
        true,
      ],
      [
        2,
        "Utility B",
        ethers.getAddress("0xf11d8a2bf17d04c50cfb6ba505e1e88c4bd4b673"),
        false,
      ],
    ];
    const MultiutilityFactory = await ethers.getContractFactory("Multiutility");
    const multiutility = await MultiutilityFactory.deploy(
      "Multiutility",
      "MTU",
      utilities
    );
  });

  // it("should not deploy if utilities are not passed", async function () {
  //   const MultiutilityFactory = await ethers.getContractFactory("Multiutility");
  //   await expect(
  //     MultiutilityFactory.deploy("Multiutility", "MTU", [])
  //   ).to.be.revertedWith("Error: utility issuer cannot be zero address");
  // });

  it("should mint Utility NFT", async function () {
    const utilities = [
      [1, "Utility A", "0x1234567890abcdef1234567890abcdef12345678", true],
      [2, "Utility B", "0xf11d8a2bf17d04c50cfb6ba505e1e88c4bd4b673", false],
    ];
    const MultiutilityFactory = await ethers.getContractFactory("Multiutility");
    const multiutility = await MultiutilityFactory.deploy(
      "Multiutility",
      "MTU",
      utilities
    );
    let [user1, user2] = await ethers.getSigners();
    const utilityIndexes = [1, 2];

    const allUtilities = await multiutility
      .connect(user1)
      .allUtilityIndexList();

    const mint = await multiutility
      .connect(user1)
      .mintUtilityNFT(utilityIndexes);

    const tokenUtilities = await multiutility.connect(user1).getUtilitiesOf(1);
    expect(utilityIndexes[0]).equal(parseInt(tokenUtilities[0].toString()));
    expect(utilityIndexes[1]).equal(parseInt(tokenUtilities[1].toString()));
  });

  it("should not mint Utility NFT for utilities not defined in contract", async function () {
    const utilities = [
      [1, "Utility A", "0x1234567890abcdef1234567890abcdef12345678", true],
      [2, "Utility B", "0xf11d8A2BF17D04C50CfB6ba505e1e88c4BD4b673", false],
    ];
    const MultiutilityFactory = await ethers.getContractFactory("Multiutility");
    const multiutility = await MultiutilityFactory.deploy(
      "Multiutility",
      "MTU",
      utilities
    );
    let [user1, user2] = await ethers.getSigners();
    const utilityIndexes = [1, 3];
    await expect(
      multiutility.connect(user1).mintUtilityNFT(utilityIndexes)
    ).to.be.revertedWith("Error: invalid IDs passed");
  });

  it("should mint NFT with all the utilities", async function () {
    const utilities = [
      [1, "Utility A", "0x1234567890abcdef1234567890abcdef12345678", true],
      [2, "Utility B", "0xf11d8A2BF17D04C50CfB6ba505e1e88c4BD4b673", false],
    ];
    let [user1, user2] = await ethers.getSigners();

    const MultiutilityFactory = await ethers.getContractFactory("Multiutility");
    const multiutility = await MultiutilityFactory.deploy(
      "Multiutility",
      "MTU",
      utilities
    );

    const mint = await multiutility.connect(user1).mintFullNFT();
    const tokenUtilities = await multiutility.connect(user1).getUtilitiesOf(1);
    const allUtilities = await multiutility
      .connect(user1)
      .allUtilityIndexList();

    expect(tokenUtilities[0]).equal(allUtilities[0]);
    expect(tokenUtilities[1]).equal(allUtilities[1]);
  });

  it("should transfer Utilities to onother user and mint new NFT for them", async function () {
    const utilities = [
      [1, "Utility A", "0x1234567890abcdef1234567890abcdef12345678", true],
      [2, "Utility B", "0xf11d8A2BF17D04C50CfB6ba505e1e88c4BD4b673", false],
    ];
    const MultiutilityFactory = await ethers.getContractFactory("Multiutility");
    const multiutility = await MultiutilityFactory.deploy(
      "Multiutility",
      "MTU",
      utilities
    );
    let [user1, user2] = await ethers.getSigners();
    const utilityIndexes = [1, 2];
    await multiutility.mintUtilityNFT([1, 2]);
    const mint = await multiutility
      .connect(user1)
      .mintUtilityNFT(utilityIndexes);

    const tokenUtilities = await multiutility.connect(user1).getUtilitiesOf(1);

    const transfer = await multiutility
      .connect(user1)
      .transferUtilities(1, user2.getAddress());

    const tokenUtilitiesReceiver = await multiutility
      .connect(user2)
      .getUtilitiesOf(2);
    expect(tokenUtilities[0]).equal(tokenUtilitiesReceiver[0]);
    expect(tokenUtilities[1]).equal(tokenUtilitiesReceiver[1]);
  });

  it("should not transfer Utilities to onother user if not owner", async function () {
    const utilities = [
      [1, "Utility A", "0x1234567890abcdef1234567890abcdef12345678", true],
      [2, "Utility B", "0xf11d8A2BF17D04C50CfB6ba505e1e88c4BD4b673", false],
    ];
    const MultiutilityFactory = await ethers.getContractFactory("Multiutility");
    const multiutility = await MultiutilityFactory.deploy(
      "Multiutility",
      "MTU",
      utilities
    );
    let [user1, user2, user3] = await ethers.getSigners();
    const utilityIndexes = [1, 2];
    await multiutility.mintUtilityNFT([1, 2]);
    const mint = await multiutility
      .connect(user1)
      .mintUtilityNFT(utilityIndexes);

    const tokenUtilities = await multiutility.connect(user1).getUtilitiesOf(1);

    await expect(
      multiutility.connect(user3).transferUtilities(1, user2.getAddress())
    ).to.be.revertedWith("Error: caller is not the owner of the token");
  });

  it("should not transfer Utilities to onother user if not owned any", async function () {
    const utilities = [
      [1, "Utility A", "0x1234567890abcdef1234567890abcdef12345678", true],
      [2, "Utility B", "0xf11d8A2BF17D04C50CfB6ba505e1e88c4BD4b673", false],
    ];
    const MultiutilityFactory = await ethers.getContractFactory("Multiutility");
    const multiutility = await MultiutilityFactory.deploy(
      "Multiutility",
      "MTU",
      utilities
    );
    let [user1, user2, user3] = await ethers.getSigners();
    const utilityIndexes = [1, 2];
    await multiutility.mintUtilityNFT([1, 2]);
    const mint = await multiutility
      .connect(user1)
      .mintUtilityNFT(utilityIndexes);

    const tokenUtilities = await multiutility.connect(user1).getUtilitiesOf(1);

    await multiutility.connect(user1).transferUtilities(1, user2.getAddress());

    await expect(
      multiutility.connect(user1).transferUtilities(1, user2.getAddress())
    ).to.be.revertedWith(
      "Error: caller doesn't have any utilities to transfer"
    );
  });

  it("should not transfer utilities to zero address", async function () {
    const utilities = [
      [1, "Utility A", "0x1234567890abcdef1234567890abcdef12345678", true],
      [2, "Utility B", "0xf11d8A2BF17D04C50CfB6ba505e1e88c4BD4b673", false],
    ];
    const MultiutilityFactory = await ethers.getContractFactory("Multiutility");
    const multiutility = await MultiutilityFactory.deploy(
      "Multiutility",
      "MTU",
      utilities
    );
    let [user1, user2, user3] = await ethers.getSigners();
    const utilityIndexes = [1, 2];
    await multiutility.mintUtilityNFT([1, 2]);
    const mint = await multiutility
      .connect(user1)
      .mintUtilityNFT(utilityIndexes);

    const tokenUtilities = await multiutility.connect(user1).getUtilitiesOf(1);

    await expect(
      multiutility.connect(user1).transferUtilities(1, ethers.ZeroAddress)
    ).to.be.revertedWith("Error: receiver address cannot be zero address");
  });

  it("owner should be able to add new utility", async function () {
    const utilities = [
      [1, "Utility A", "0x1234567890abcdef1234567890abcdef12345678", true],
      [2, "Utility B", "0xf11d8A2BF17D04C50CfB6ba505e1e88c4BD4b673", false],
    ];
    const MultiutilityFactory = await ethers.getContractFactory("Multiutility");
    const multiutility = await MultiutilityFactory.deploy(
      "Multiutility",
      "MTU",
      utilities
    );

    const addUtility = await multiutility.addUtilities([
      3,
      "Utility C",
      "0x1234567890abcdef1234567890abcdef12345678",
      false,
    ]);

    const allUtilities = await multiutility.allUtilityIndexList();
    expect(allUtilities[2]).equal(3);
  });

  it("non-owner should not be able to add new utility", async function () {
    const utilities = [
      [1, "Utility A", "0x1234567890abcdef1234567890abcdef12345678", true],
      [2, "Utility B", "0xf11d8A2BF17D04C50CfB6ba505e1e88c4BD4b673", false],
    ];
    let [user1, user2, user3] = await ethers.getSigners();
    const MultiutilityFactory = await ethers.getContractFactory("Multiutility");
    const multiutility = await MultiutilityFactory.connect(user2).deploy(
      "Multiutility",
      "MTU",
      utilities
    );

    await expect(
      multiutility
        .connect(user1)
        .addUtilities([
          3,
          "Utility C",
          "0x1234567890abcdef1234567890abcdef12345678",
          false,
        ])
    ).to.be.revertedWith("Error: caller is not the owner of the contract");
  });

  it("should not be able to add utility with same ID", async function () {
    const utilities = [
      [1, "Utility A", "0x1234567890abcdef1234567890abcdef12345678", true],
      [2, "Utility B", "0xf11d8A2BF17D04C50CfB6ba505e1e88c4BD4b673", false],
    ];
    const MultiutilityFactory = await ethers.getContractFactory("Multiutility");
    const multiutility = await MultiutilityFactory.deploy(
      "Multiutility",
      "MTU",
      utilities
    );

    await expect(
      multiutility.addUtilities([
        1,
        "Utility C",
        "0x1234567890abcdef1234567890abcdef12345678",
        false,
      ])
    ).to.be.revertedWith("Error: utility with same ID already exists");
  });

  // it("owner should be able to give utility to another user", async function () {
  //   const utilities = [
  //     [1, "Utility A", "0x1234567890abcdef1234567890abcdef12345678", true],
  //     [2, "Utility B", "0xf11d8a2bf17d04c50cfb6ba505e1e88c4bd4b673", false],
  //   ];
  //   const MultiutilityFactory = await ethers.getContractFactory("Multiutility");
  //   const multiutility = await MultiutilityFactory.deploy(
  //     "Multiutility",
  //     "MTU",
  //     utilities
  //   );
  //   let [user1, user2] = await ethers.getSigners();
  //   const utilityIndexes = [1];

  //   const allUtilities = await multiutility
  //     .connect(user1)
  //     .allUtilityIndexList();

  //   const mint = await multiutility
  //     .connect(user1)
  //     .mintUtilityNFT(utilityIndexes);

  //   const mintToNFT = await multiutility.mintNewUtilityToNFT(1, 2);

  //   const tokenUtilities = await multiutility.connect(user1).getUtilitiesOf(1);

  //   expect(2).equal(parseInt(tokenUtilities[2].toString()));
  // });

  // it("should not transfer Utilities to onother user if not owned", async function () {});

  // it("owner should be able to add new utility", async function () {});

  // it("owner sholud be able to give utility to another user", async function () {});
});
