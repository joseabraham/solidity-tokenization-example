const Token = artifacts.require("MyToken");
const TokenSale = artifacts.require("MyTokenSale");
const KycContract = artifacts.require("KycContract");

const chai = require("./chaisetup.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("TokenSale", async function(accounts) {
    const [ deployer, investor, wallet, purchaser ] = accounts;
    let rate = 1;
    beforeEach(async () => {        
        this.token = await Token.new({ from: deployer });
        this.KycInstance = await KycContract.deployed();        
        this.crowdsale = await TokenSale.new(rate, wallet, this.token.address, this.KycInstance.address);        
        await this.token.addMinter(this.crowdsale.address, { from: deployer });
        await this.token.renounceMinter({ from: deployer });
      });

    it("there shouldnt be any coins in my account", async () => {
        let instance = await Token.deployed();
        await expect(instance.balanceOf(deployer)).to.eventually.be.a.bignumber.equal(new BN(0));
    });

    it("all coins should be in the tokensale smart contract", async () => {
        let instance = await Token.deployed();
        let balance = await instance.balanceOf(TokenSale.address);
        let totalSupply = await instance.totalSupply();
        expect(balance).to.be.a.bignumber.equal(totalSupply);
    });
   
    it("should be possible to buy tokens by simply sending ether to the smart contract", async () => {
        let tokensToBuy = 30;   
        // ADD INVESTOR TO THE KYC 
        await this.KycInstance.setKycCompleted(investor);
        
        // GET BALANCE OF INVESTOR
        let balanceBeforeAccount = await this.token.balanceOf(investor);
        
        // CHECK BALANCE OF INVESTOR 
        expect(balanceBeforeAccount).to.be.bignumber.equal(await this.token.balanceOf(investor));

        // GET BALANCE OF ACCOUNT DEMO CALL
        // let actualBalance = await web3.eth.getBalance(accounts[1]);
        
        // BUY TOKENS  " MINTED " - FROM INVESTOR
        await expect(this.crowdsale.sendTransaction({from: investor, value: web3.utils.toWei(tokensToBuy.toString(), "wei")})).to.eventually.be.fulfilled;
        
        // CHECK NEW BALANCE OF INVESTOR
        await expect(balanceBeforeAccount + tokensToBuy).to.be.bignumber.equal(await this.token.balanceOf(investor));
    });

});