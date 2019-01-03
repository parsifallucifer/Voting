//var Migrations = artifacts.require("./Migrations.sol");
var Election = artifacts.require("./Election.sol");

module.exports = function(deployer) {
    //deployer.deploy(Migrations);
    deployer.deploy(Election);
};
