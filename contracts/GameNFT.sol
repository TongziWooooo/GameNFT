pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";


contract GameNFT is ERC721URIStorage{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenID;
    // uint8 tokenType;
    address mkplaceAddress;

    enum _tokenType{
        GameProp,
        Artwork
    }

    struct NFTInfo {
        uint tokenID;
        string tokenURI;
        address owner;
        _tokenType tokenType;
    }

    event NFTCreated (
        uint indexed tokenID,
        string indexed tokenURI,
        address indexed owner,
        _tokenType tokenType
    );

    struct PlayerInfo{
        uint attack;
        uint speed;
        uint armor;
        uint level;
    }

    mapping(uint256 => NFTInfo) public tokenInfos;

    constructor(address marketplaceAddress) ERC721("Equipment", "ITEM"){
        mkplaceAddress = marketplaceAddress;
    }

    function mintItem(string memory tokenURI, _tokenType tokenTypeInput) public returns (uint){
        address user = msg.sender;

        // Start from 1
        _tokenID.increment();

        uint newTokenId = _tokenID.current();
        _mint(user, newTokenId);

        // This tokenURI should resolve to a JSON document.
        //    {
        //    "name": "Thor's hammer",
        //    "tokenType": "Game",
        //    "description": "the legendary hammer of the Norse god of thunder.",
        //    "image": "https://game.example/item-id-8u5h2m.png",
        //    "strength": 20
        //    }
        _setTokenURI(newTokenId, tokenURI);

        tokenInfos[newTokenId] = NFTInfo(newTokenId, tokenURI, user, tokenTypeInput);

        setApprovalForAll(mkplaceAddress, true);

        emit NFTCreated(
            newTokenId,
            tokenURI,
            user,
            tokenTypeInput
        );

        return newTokenId;
    }

    function fetchAllNFT() public view returns(NFTInfo[] memory){
        uint totalTokenNum = _tokenID.current();
        NFTInfo[] memory tokenList = new NFTInfo[](totalTokenNum);
        for(uint i = 1; i <= totalTokenNum; i++){
            NFTInfo storage curTokenInfo = tokenInfos[i];
            tokenList[i - 1] = curTokenInfo;
        }
        return tokenList;
    }

    function fetchUserNFT() public view returns(NFTInfo[] memory){
        uint totalTokenNum = _tokenID.current();
        uint tokenNum = 0;
        uint curIndex = 0;

        // Cannot use NFTInfo[] memory tokenList; & tokenList.push
        // Only when use storage, array could be dynamic.

        for(uint i = 1; i <= totalTokenNum; i++){
            if(tokenInfos[i].owner == msg.sender){
                tokenNum += 1;
            }
        }

        NFTInfo[] memory tokenList = new NFTInfo[](tokenNum);
        for(uint i = 1; i <= totalTokenNum; i++){
            if(tokenInfos[i].owner == msg.sender){
                tokenNum += 1;
                NFTInfo storage curTokenInfo = tokenInfos[i];
                tokenList[curIndex] = curTokenInfo;
                curIndex += 1;
            }
        }

        return tokenList;
    }

    function addr2ItemID(address userAddress) public returns (uint [] memory){
        uint[] memory itemsID;
        return itemsID;
    }

    function _createRandomNum(uint256 _mod) internal view returns (uint256) {
        uint256 randomNum = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
        return randomNum % _mod;
    }

    function transferItem(address from, address to, uint itemID) public{
        // If stored in blockchain, Use storage, else use memory
        // transferMessage broadcast, API in ERC721
        transferFrom(from, to, itemID);
        // Update the item list in the database, both msg.sender & to
        NFTInfo storage tmp = tokenInfos[itemID];
        tmp.owner = to;
    }

//    function transferItem(address to, uint itemID) public{
//        // If stored in blockchain, Use storage, else use memory
//        uint[] memory itemsID = addr2ItemID(msg.sender);
//        address owner = ownerOf(itemID);
//
//        // To check if user = msg.sender has this itemID
//        bool isExist = owner == msg.sender;
//
//        require(isExist, "Account should have this Item");
//
//        // Update the item list in the database, both msg.sender & to
//
//        // transferMessage broadcast, API in ERC721
//        transferFrom(msg.sender, to, itemID);
//    }

    function getProperty(uint tokenID) public view returns (PlayerInfo memory){
        _tokenType tokenType = tokenInfos[tokenID].tokenType;
        // require(tokenType == _tokenType.GameProp, "Only Game Prop has Property");
        string memory tokenURI = tokenInfos[tokenID].tokenURI;
        PlayerInfo memory playerInfo = extractURI(tokenURI);
        return playerInfo;
    }

    function extractURI(string memory tokenURI) public view returns (PlayerInfo memory){
        // how to extract json info from URI?
        PlayerInfo memory playerInfo;
        return playerInfo;
    }

    function burn(uint tokenID) private returns (uint){
        delete tokenInfos[tokenID];
        _burn(tokenID);
        return tokenID;
    }

    function reforge(uint tokenID1, uint tokenID2) public returns (uint){
        burn(tokenID1);
        burn(tokenID2);
        string memory tokenURI = "Reforged";
        _tokenType tokenType = _tokenType.GameProp;
        uint newTokenID = mintItem(tokenURI, tokenType);
        return newTokenID;
    }
}
