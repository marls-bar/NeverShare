pragma solidity ^0.8.0;

import "./NeverShare.sol";
import "../DataStructures/BokkyPooBahsRedBlackTreeLibrary.sol";
import "../DataStructures/DateTime.sol";


contract NST_offering {
    
    using BokkyPooBahsRedBlackTreeLibrary for BokkyPooBahsRedBlackTreeLibrary.Tree;
    BokkyPooBahsRedBlackTreeLibrary.Tree bidsTree;

    struct BlindedBid {
        bytes32 blindedBid;
    }

    struct RevealedBid {
        address bidder;
        uint quantity;
    }

    NeverShare token;

    address payable public NeverShareAddress;

    uint public Round1End;

    uint public Round2End;

    bool public ended;

    mapping(address => BlindedBid[]) round1Bids;

    mapping(uint => RevealedBid[] ) values;

    modifier onlyBefore(uint _time) { require(block.timestamp < _time);
        _;}
    modifier onlyAfter(uint _time) { require(block.timestamp > _time);
        _;}

    
    //event Round2Ended(BokkyPooBahsRedBlackTreeLibrary.Tree bidsTree);

    constructor(address payable _NeverShareAddress) {
        NeverShareAddress = _NeverShareAddress;
        token = new NeverShare();
        Round1End = DateTime.timestampFromDateTime(2022,4,20, DateTime.getHour(block.timestamp), DateTime.getMinute(block.timestamp), DateTime.getSecond(block.timestamp));
        Round2End = DateTime.timestampFromDateTime(2022,4,27, DateTime.getHour(block.timestamp), DateTime.getMinute(block.timestamp), DateTime.getSecond(block.timestamp));
    }

    function bid(uint _quantity, uint _price, bool _fake, bytes32[] memory _secret) onlyBefore(Round1End) public {
        require(_price < 1);
        bytes32 hashedBid  = keccak256(abi.encodePacked(_quantity, _price, _fake, _secret));
        round1Bids[msg.sender].push(BlindedBid({
        blindedBid : hashedBid
        }));
    }

    function reveal(
        uint[] memory _prices, 
        uint[] memory _quantities, 
        bool[] memory _fake,
        bytes32[] memory _secret
    ) 
        public onlyAfter(Round1End) onlyBefore(Round2End) 
    {
        uint length = round1Bids[msg.sender].length;
        require(_prices.length == length);
        require(_quantities.length == length);

        for (uint i=0; i<length; i++) {
            BlindedBid storage bidToCheck = round1Bids[msg.sender][i];
            (uint price, uint quantity, bool fake, bytes32 secret) = (_prices[i], _quantities[i], _fake[i], _secret[i]);
            if (bidToCheck.blindedBid != keccak256(abi.encodePacked(quantity, price, fake, secret))) {
                continue;
            }
            
            if (!fake) {
                submitBid(msg.sender, price, quantity);
            }
            bidToCheck.blindedBid = bytes32(0);
        }
    }

    function issueCoins() public payable onlyAfter(Round2End) {
        require(!ended);
        //emit Round2Ended(bidsTree);

        RevealedBid storage currentBid = values[bidsTree.last()][0];
        uint NeverShareHoldings = token.balanceOf(NeverShareAddress);
        while (NeverShareHoldings - bidsTree.last() > 0) {
            token.transfer(currentBid.bidder, currentBid.quantity);
            delete values[bidsTree.last()];
            bidsTree.remove(bidsTree.last());
        }

        uint refundAmount = ( currentBid.quantity - NeverShareHoldings ) * bidsTree.last();
        token.transfer(currentBid.bidder, NeverShareHoldings);
        token.transfer(currentBid.bidder, refundAmount * (1 ether));
        delete values[bidsTree.last()];
        bidsTree.remove(bidsTree.last());

        while (NeverShareHoldings - bidsTree.last() > 0) {
            token.transfer(currentBid.bidder, currentBid.quantity);
            delete values[bidsTree.last()];
            bidsTree.remove(bidsTree.last());
        }
        ended = true;      

    }

    // Investors can withdraw bids before Round 1 ends
    function withdrawBid(
        uint[] memory _prices, 
        uint[] memory _quantities, 
        bool[] memory _fake,
        bytes32[] memory _secret
    ) onlyBefore(Round1End) public {
        uint length = round1Bids[msg.sender].length;
        for (uint i=0; i<length; i++) {
            BlindedBid storage bidToCheck = round1Bids[msg.sender][i];
            (uint price, uint quantity, bool fake, bytes32 secret) = (_prices[i], _quantities[i], _fake[i], _secret[i]);
            if (bidToCheck.blindedBid != keccak256(abi.encodePacked(quantity, price, fake, secret))) {
                continue;
            }
            if(!fake) {
                round1Bids[msg.sender][i].blindedBid = 0;
            }
        }
    }

    function submitBid(address _bidder, uint _price, uint _quantity) onlyBefore(Round2End) internal returns(bool success)
    {
        payable(msg.sender).transfer(_price * _quantity * (1 ether));
        bidsTree.insert(_price);
        values[_price].push(RevealedBid({bidder : _bidder, quantity : _quantity}));

        return true;
    }
}