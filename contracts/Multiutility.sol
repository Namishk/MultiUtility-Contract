// SPDX-License-Identifier: CC0
pragma solidity ^0.8.20;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Multiutility is ERC721 {
    struct Utility {
        uint256 id;
        string name;
        address issuer;
        bool transferable;
    }

    address private owner;
    uint256 private tokenID = 0;
    Utility[] private _utilities;
    uint256[] private _utilityIDs;
    mapping(uint256 => Utility) private _utilityMap;
    mapping(uint256 => uint256[]) private _tokenUtilities;

    constructor(
        string memory name_,
        string memory symbol_,
        Utility[] memory utilities_
    ) ERC721(name_, symbol_) {
        owner = msg.sender;
        for (uint256 i = 0; i < utilities_.length; i++) {
            require(
                utilities_[i].issuer == address(0),
                "Error: utility issuer cannot be zero address"
            );
            _utilities.push(utilities_[i]);
            _utilityIDs.push(_utilities[i].id);
            _utilityMap[_utilities[i].id] = _utilities[i];
        }
    }

    function _checkUtilityIndex(
        uint256[] memory utilityIndex
    ) internal view virtual returns (bool) {
        for (uint256 i = 0; i < utilityIndex.length; i++) {
            if (_utilityMap[utilityIndex[i]].issuer == address(0)) {
                return false;
            }
        }
        return true;
    }

    function mintUtilityNFT(uint256[] memory utilityIndex) public {
        require(
            _checkUtilityIndex(utilityIndex) == true,
            "Error: invalid IDs passed"
        );
        tokenID = tokenID + 1;
        _safeMint(msg.sender, tokenID);
        _tokenUtilities[tokenID] = utilityIndex;
    }

    function mintFullNFT() public {
        tokenID = tokenID + 1;
        _safeMint(msg.sender, tokenID);
        _tokenUtilities[tokenID] = _utilityIDs;
    }

    function transferUtilities(uint256 tokenId, address receiver) public {
        require(
            msg.sender == ownerOf(tokenId),
            "Error: caller is not the owner of the token"
        );
        require(
            _tokenUtilities[tokenId].length != 0,
            "Error: caller doesn't have any utilities to transfer"
        );
        require(
            receiver != address(0),
            "Error: receiver address cannot be zero address"
        );

        tokenID = tokenID + 1;
        _safeMint(receiver, tokenID);
        _tokenUtilities[tokenID] = _tokenUtilities[tokenId];
        delete _tokenUtilities[tokenId]; // deleting mapping
    }

    function addUtilities(Utility memory utility) public {
        require(
            msg.sender == owner,
            "Error: caller is not the owner of the contract"
        );
        require(
            _utilityMap[utility.id].issuer == address(0),
            "Error: utility ID already exists"
        );
        require(
            utility.issuer != address(0),
            "Error: utility issuer cannot be zero address"
        );
        require(
            utility.transferable == true || utility.transferable == false,
            "Error: utility transferable value can only be true or false"
        );
        _utilities.push(utility);
        _utilityIDs.push(utility.id);
        _utilityMap[utility.id] = utility;
    }

    function mintNewUtilityToNFT(uint256 tokenId, uint256 utilityIndex) public {
        require(
            msg.sender == owner,
            "Error: caller is not the owner of the contract"
        );
        require(
            _utilityMap[utilityIndex].issuer != address(0),
            "Error: invalid utility ID passed"
        );
        require(
            _tokenUtilities[tokenId].length < _utilities.length,
            "Error: all utilities already minted"
        );
        require(
            _checkUtilityIndex(new uint256[](utilityIndex)) == true,
            "Error: invalid utility ID passed"
        );
        require(
            _check(tokenId, utilityIndex) == false,
            "Error: utility already minted to this token"
        );

        _tokenUtilities[tokenId].push(utilityIndex);
    }

    function _check(
        uint256 tokenId,
        uint256 index
    ) internal view returns (bool) {
        require(
            _tokenUtilities[tokenId].length == 0,
            "Error: This token has no utilites"
        );
        for (uint256 i = 0; i < _tokenUtilities[tokenId].length; i++) {
            if (_tokenUtilities[tokenId][i] == index) {
                return true;
            }
        }
        return false;
    }

    function _getUtilitiesOf(
        uint256 _tokenID
    ) internal view virtual returns (uint256[] memory) {
        return _tokenUtilities[_tokenID];
    }

    function _allUtilitiesList()
        internal
        view
        virtual
        returns (Utility[] memory)
    {
        return _utilities;
    }

    function _allUtilityIndexList()
        internal
        view
        virtual
        returns (uint256[] memory)
    {
        return _utilityIDs;
    }

    function getUtilitiesOf(
        uint256 _tokenID
    ) public view virtual returns (uint256[] memory) {
        return _getUtilitiesOf(_tokenID);
    }

    function allUtilitiesList() public view virtual returns (Utility[] memory) {
        return _allUtilitiesList();
    }

    function allUtilityIndexList()
        public
        view
        virtual
        returns (uint256[] memory)
    {
        return _allUtilityIndexList();
    }

    function utilityMap(
        uint256 id
    ) public view virtual returns (Utility memory) {
        return _utilityMap[id];
    }
}
