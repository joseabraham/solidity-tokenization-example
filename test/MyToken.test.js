const Token = artifacts.require("MyToken");
const TokenSale = artifacts.require("MyTokenSale");
const KycContract = artifacts.require("KycContract");
require("dotenv").config({ path: "../.env" });

const chai = require("./chaisetup.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("Token Test", async (accounts) => {
  const [deployer, investor, wallet, purchaser] = accounts;
  let rate = 1;
  beforeEach(async () => {
    this.myToken = await Token.new({ from: deployer });
    this.KycInstance = await KycContract.deployed();
    this.crowdsale = await TokenSale.new(
      rate,
      wallet,
      this.myToken.address,
      this.KycInstance.address
    );
    await this.myToken.addMinter(this.crowdsale.address, { from: deployer });
    await this.myToken.renounceMinter({ from: deployer });
  });

  it("All tokens should be in my account", async () => {
    let instance = this.myToken;
    let totalSupply = await instance.totalSupply();
    await expect(
      instance.balanceOf(deployer)
    ).to.eventually.be.a.bignumber.equal(totalSupply);
  });


  it("I can send tokens from Account 1 to Account 2", async () => {
    const purchaseTokens = 10;
    const sendTokens = 1;
    let instance = this.myToken;
    let totalSupply = await instance.totalSupply();
    await expect(
      instance.balanceOf(deployer)
    ).to.eventually.be.a.bignumber.equal(totalSupply);
    
    // WHITELIST AND ADD INVESTOR/PURCHASER TO THE KYC
    await this.KycInstance.setKycCompleted(investor);
    await this.KycInstance.setKycCompleted(purchaser);
    // INVESTOR BUY TOKENS
    await expect(this.crowdsale.sendTransaction({from: investor, value: web3.utils.toWei(purchaseTokens.toString(), "wei")})).to.eventually.be.fulfilled;
        
    // SEND TOKENS FROM INVESTOR TO PURCHASER
    // let balanceOfInvestor = await instance.balanceOf(investor);
    // console.log("balanceOfInvestor", balanceOfInvestor)
    await instance.transfer(purchaser, web3.utils.toWei(sendTokens.toString(), "wei"), {from: investor})
    let totalBalanceOfPurchaser = await instance.balanceOf(purchaser);
    await expect(totalBalanceOfPurchaser).to.be.bignumber.equal(new BN(sendTokens));

  });

  it("It's not possible to send more tokens than account 1 has", async () => {
    let instance = this.myToken;
    let balanceOfAccount = await instance.balanceOf(deployer);

    await expect(instance.transfer(investor, new BN(balanceOfAccount + 1))).to
      .eventually.be.rejected;

    //check if the balance is still the same
    await expect(
      instance.balanceOf(deployer)
    ).to.eventually.be.a.bignumber.equal(balanceOfAccount);
  });
});
