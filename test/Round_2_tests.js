const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const NeverShare = artifacts.require('NeverShare');

contract('Round_2_TestSuite', function ([ creator, other ]) {

    const TOTAL_SUPPLY = new BN('10000000000000000000000');
    const OTHER_SUPPLY = new BN('2000000000000000000');

    const prices = [2];
    const quantities = [2];
    const fake = [true];
    const secret = [5];


  beforeEach(async function () {
    this.token = await NeverShare.new({ from: creator });
  });

  it('rejects submissions if round 1 bid nonexistant', async function () {

    await time.increaseTo(1650612277);
    await contract.reveal(prices[0], quantities[0], fake[0], secret[0], {from:other});
    expect(await contract.values[bidsTree.last()][0].to.be.null);

    await contract.bid(prices[0], quantities[0], fake[0], secret[0], {from: other});
    const expectedHash = keccak256(abi.encodePacked(2, 2, true, 5));
    expect(await contract.round1bids[other].to.be.equal(expectedHash));

    await contract.reveal(prices[0], quantities[0], fake[0], secret[0], {from:other});
    expect(await contract.values[bidsTree.last()][0].to.be.equal(RevealedBid({bidder : other, quantity : quantities[0]})));
    
  });

  it('only accepts bids after the April 20 deadline', async function () {

    await contract.bid(prices[0], quantities[0], fake[0], secret[0], {from: other});
    const expectedHash = keccak256(abi.encodePacked(2, 2, true, 5));
    expect(await contract.round1bids[other].to.be.equal(expectedHash));

    await contract.reveal(prices[0], quantities[0], fake[0], secret[0], {from:other});
    expect(await contract.values[bidsTree.last()][0].to.be.null);
    
    await time.increaseTo(1650612277);

    await contract.reveal(prices[0], quantities[0], fake[0], secret[0], {from:other});
    expect(await contract.values[bidsTree.last()][0].to.be.equal(RevealedBid({bidder : other, quantity : quantities[0]})));

  });

  it('has Investors pay NeverShare correctly', async function () {
    
    await contract.bid(prices[0], quantities[0], fake[0], secret[0], {from: other});
    const expectedHash = keccak256(abi.encodePacked(2, 2, true, 5));
    expect(await contract.round1bids[other].to.be.equal(expectedHash));

    await contract.reveal(prices[0], quantities[0], fake[0], secret[0], {from:other});
    expect (await web3.eth.getBalance(instance.creator).to.be.equal(TOTAL_SUPPLY - OTHERSUPPLY));
    
  });

  it('has NeverShare pay Investors correctly after Apr 27 deadline', async function () {

    await contract.bid(prices[0], quantities[0], fake[0], secret[0], {from: other});
    const expectedHash = keccak256(abi.encodePacked(2, 2, true, 5));
    expect(await contract.round1bids[other].to.be.equal(expectedHash));

    await contract.reveal(prices[0], quantities[0], fake[0], secret[0], {from:other});

    expect (await this.token.balanceOf(other)).to.be.bignumber.equal(OTHER_SUPPLY);

  });

});
