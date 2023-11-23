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
        for (uint256 i = 0; i < utilities_.length; i++) {
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
        tokenID = tokenID + 1;
        _safeMint(receiver, tokenID);
        _tokenUtilities[tokenID] = _tokenUtilities[tokenId];
        delete _tokenUtilities[tokenId]; // deleting mapping
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
