const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const NeverShare = artifacts.require('NeverShare');

contract('TestSuite', function ([ creator, other ]) {

  const NAME = 'NeverShare';
  const SYMBOL = 'NST';
  const TOTAL_SUPPLY = new BN('10000000000000000000000');

  before(async function () {
    this.token = await NeverShare.new({ from: creator });
  });

  it('initialises 10000 shares', async function () {
    // Use large integer comparisons
    expect(await this.token.totalSupply()).to.be.bignumber.equal(TOTAL_SUPPLY);
  });

  it('has the name NeverShare', async function () {
    expect(await this.token.name()).to.be.equal(NAME);
  });

  it('has the symbol NST', async function () {
    expect(await this.token.symbol()).to.be.equal(SYMBOL);
  });

  it('assigns the 10000 shares to the creator', async function () {
    expect(await this.token.balanceOf(creator)).to.be.bignumber.equal(TOTAL_SUPPLY);
  });
});