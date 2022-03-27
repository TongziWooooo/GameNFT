pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Arena {
    using Counters for Counters.Counter;
    Counters.Counter private _playerNum;

    address payable Player;
    uint _trophyPrice = 0.01 ether;

    constructor(){
    }

    event arenaPlayerCreated (
        address indexed player,
        uint indexed tokenID,
        uint indexed itemID,
        address nftContract
    );

    function createPlayer(address nftContract, uint tokenID) public payable{
        require(msg.value >= _trophyPrice, "You have to pay for Arena Ticket");
        uint randDNA = _createRandomNum(10 ** 10);
    }

    function _createRandomNum(uint256 _mod) internal view returns (uint256) {
        uint256 randomNum = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
        return randomNum % _mod;
    }


}