pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Arena {
    using Counters for Counters.Counter;
    Counters.Counter private _playerNum;

    address payable Player;
    uint _trophyPrice = 0.01 ether;

    address[] arenaPlayerAddress;
    mapping(address => ArenaPlayer) arenaPlayers;

    constructor(){
    }

    struct ArenaPlayer{
        uint playerNum;
        uint[3] tokenTeam;
        address nftContract;
    }

    event ArenaPlayerCreated (
        uint indexed playerNum,
        uint[3] indexed tokenTeam,
        address nftContract
    );

    function createPlayer(address nftContract, uint[3] memory tokenTeam) public payable{
        // require(msg.value >= _trophyPrice, "You have to pay for Arena Ticket");
        _playerNum.increment();
        uint playerNum = _playerNum.current();
        address playerAddress = msg.sender;

        arenaPlayerAddress.push(playerAddress);

        arenaPlayers[playerAddress] = ArenaPlayer(
            playerNum,
            tokenTeam,
            nftContract
        );

        emit ArenaPlayerCreated(
            playerNum,
            tokenTeam,
            nftContract
        );
    }

    function fetchAllPlayer() public view returns(ArenaPlayer[] memory){
        uint leftPlayerNum = arenaPlayerAddress.length;
        ArenaPlayer[] memory playerList = new ArenaPlayer[](leftPlayerNum);
        for(uint i = 0; i < leftPlayerNum; i++){
            playerList[i] = arenaPlayers[arenaPlayerAddress[i]];
        }

        return playerList;
    }

    function quitArena() public{

    }

    function _createRandomNum(uint256 _mod) internal view returns (uint256) {
        uint256 randomNum = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
        return randomNum % _mod;
    }


}