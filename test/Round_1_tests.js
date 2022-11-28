const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const { ZERO_BYTES32 } = require('@openzeppelin/test-helpers/src/constants');
const NeverShare = artifacts.require('NeverShare');
const NST_offering = artifacts.require('NST_offering');

contract('Round_1_TestSuite', function ([ creator, other, other2 ]) {

  const TOTAL_SUPPLY = new BN('10000000000000000000000');

  beforeEach(async function () {
    this.token = await NeverShare.new({ from: creator });
    this.contract = NST_offering.new(creator);
  });

  it('rejects bids for 1 share < 1 Eth', async function () {
    
    await contract.bid(1, 0.5, true, 5, {from: other});
    expect(await contract.round1bids[other].to.be.equal(ZERO_BYTES32));

    // no coins distributed
    expect(await this.token.balanceOf(creator)).to.be.bignumber.equal(TOTAL_SUPPLY);
    
  });

  it('accepts bids for 1 share > 1 Eth before Apr 20, share-creation time', async function () {
    
    await contract.bid(2, 2, true, 5, {from: other});
    const expectedHash = keccak256(abi.encodePacked(2, 2, true, 5));
    expect(await contract.round1bids[other].to.be.equal(expectedHash));

    // no coins distributed
    expect(await this.token.balanceOf(creator)).to.be.bignumber.equal(TOTAL_SUPPLY);
  });

  it('rejects bids after Apr 20, share-creation time', async function () {
    
    await time.increaseTo(1650559436);
    await contract.bid(2, 2, true, 5, {from: other});
    expect(await contract.round1bids[other].to.be.equal(ZERO_BYTES32));

  });

  it('accepts bid withdrawals before Apr 20, share-creation time', async function () {

    const prices = [2];
    const quantities = [2];
    const fake = [true];
    const secret = [5];

    await time.increaseTo(1650559436);
    await contract.bid(2, 2, true, 5, {from: other2});
    const expectedHash = keccak256(abi.encodePacked(2, 2, true, 5));
    expect(await contract.round1bids[other].to.be.equal(expectedHash));

    await contract.withdrawBid(prices[0], quantities[0], fake[0], secret[0]);
    expect(await contract.round1bids[other].to.be.equal(ZERO_BYTES32));

  });

  it('rejects bid withdrawals after Apr 20, share-creation time', async function () {
    
    const prices = [2];
    const quantities = [2];
    const fake = [true];
    const secret = [5];

    await time.increaseTo(1650559436);
    await contract.bid(2, 2, true, 5, {from: other2});
    const expectedHash = keccak256(abi.encodePacked(2, 2, true, 5));
    expect(await contract.round1bids[other].to.be.equal(expectedHash));

    await contract.withdrawBid(prices[0], quantities[0], fake[0], secret[0]);
    expect(await contract.round1bids[other].to.be.equal(expectedHash));

  });

});
