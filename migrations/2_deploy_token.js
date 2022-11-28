var NeverShare = artifacts.require("NeverShare");

module.exports = async function (deployer) {
    await deployer.deploy(NeverShare);
};