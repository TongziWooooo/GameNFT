pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./GameNFT.sol";
import "hardhat/console.sol";

contract Arena {
    using Counters for Counters.Counter;
    Counters.Counter private _playerNum;

    address payable Player;
    uint _trophyPrice = 0.01 ether;

    address[] arenaPlayerAddress;
    mapping(uint => address) indexToAddress;
    mapping(address => bool) arenaPlayerExist;
    mapping(address => ArenaPlayer) arenaPlayers;

    constructor(){
    }

    struct ArenaPlayer{
        address playerAddress;
        uint playerNum;
        uint tokenID;
        address nftContract;
    }

    event ArenaPlayerCreated (
        address playerAddress,
        uint indexed playerNum,
        uint indexed tokenID,
        address nftContract
    );

    function createPlayer(address nftContract, uint tokenID) public payable{
        // require(msg.value >= _trophyPrice, "You have to pay for Arena Ticket");
        address tokenOwner = GameNFT(nftContract).ownerOf(tokenID);
        require(tokenOwner == msg.sender, "You don't own this token");

        _playerNum.increment();
        uint playerNum = _playerNum.current();
        address playerAddress = msg.sender;


        if (!arenaContain(playerAddress)){
            setArenaPlayerExist(playerAddress, true);
            arenaPlayerAddress.push(playerAddress);
        }

        arenaPlayers[playerAddress] = ArenaPlayer(
            playerAddress,
            playerNum,
            tokenID,
            nftContract
        );

        indexToAddress[playerNum] = playerAddress;

        emit ArenaPlayerCreated(
            playerAddress,
            playerNum,
            tokenID,
            nftContract
        );
    }

    function setArenaPlayerExist(address playerAddress, bool isExist) private{
        arenaPlayerExist[playerAddress] = isExist;
    }

    function arenaContain(address playerAddress) private view returns(bool){
        return arenaPlayerExist[playerAddress];
    }

    function arenaIndex(address playerAddress) private view returns(uint){
        uint index = 2**256 - 1;
        if(arenaContain(playerAddress)){
            uint arrLen = arenaPlayerAddress.length;
            for(uint i = 0; i < arrLen; i++){
                if(arenaPlayerAddress[i] == playerAddress){
                    index = i;
                    break;
                }
            }
        }
        return index;
    }

    function arenaRemove(address playerAddress) private{
        bool tmp = arenaContain(playerAddress);
        if(arenaContain(playerAddress)){
            uint index = arenaIndex(playerAddress);
            uint arrLen = arenaPlayerAddress.length;
            arenaPlayerAddress[index] = arenaPlayerAddress[arrLen - 1];
            arenaPlayerAddress.pop();
        }
    }

    function fetchPlayerTeamIndex(uint teamIndex) public view returns(ArenaPlayer memory){
        address playerAddress = indexToAddress[teamIndex];
        if(arenaContain(playerAddress)){
            return arenaPlayers[playerAddress];
        }
        else{
            return ArenaPlayer(address(0), 0, 0, address(0));
        }
    }

    function fetchPlayerTeamAddress(address playerAddress) public view returns(ArenaPlayer memory){
        if(arenaContain(playerAddress)){
            return arenaPlayers[playerAddress];
        }
        else{
            return ArenaPlayer(address(0), 0, 0, address(0));
        }
    }

    function fetchAllPlayers() public view returns(ArenaPlayer[] memory){
        uint leftPlayerNum = arenaPlayerAddress.length;
        ArenaPlayer[] memory playerList = new ArenaPlayer[](leftPlayerNum);
        for(uint i = 0; i < leftPlayerNum; i++){
            playerList[i] = arenaPlayers[arenaPlayerAddress[i]];
        }

        return playerList;
    }

    function quitArena() public{
        arenaRemove(msg.sender);
        setArenaPlayerExist(msg.sender, false);
    }

    function _createRandomNum(uint256 _mod) internal view returns (uint256) {
        uint256 randomNum = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
        return randomNum % _mod;
    }


}