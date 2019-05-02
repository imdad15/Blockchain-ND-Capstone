var CustomERC721Token = artifacts.require('CustomERC721Token');

contract('CustomERC721Token', (accounts, web3) => {

    let TEST;
    try {
        TEST = require("./TestConstants")(accounts, web3);
    } catch (e) {
        console.log(`TEST setup failed\n${e.message}`);
    }


    describe('match erc721 spec', function () {
        beforeEach(async function () { 
            this.contract = await CustomERC721Token.new(TEST.tokenName, TEST.tokenSymbol,{from: TEST.contractOwner});

            // TODO:[+] mint multiple tokens
            console.log("    - Log: 5 tokens minted and given to 5 recipients");
            for(let i = 0; i < 5; i ++){
                await this.contract.mint(TEST.tokenRecipients[i], i + 1, {from: TEST.contractOwner});
            }
        });

        it('should return total supply', async function () { 
            let totalSupply = await this.contract.totalSupply();
            assert.strictEqual(totalSupply.toNumber(), 5, "Unexpected total supply");
        });

        it('should get token balance', async function () { 
            let balanceOfAccountOne = await this.contract.balanceOf(TEST.tokenRecipients[0]);
            assert.strictEqual(balanceOfAccountOne.toNumber(), 1, "Unexpected balance of account 1");
        });

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () { 
            // let firstTokenURI = await this.contract.tokenURI(TEST.firstToken.id);
            let secondTokenURI = await this.contract.tokenURI(TEST.secondToken.id);
            assert.strictEqual(secondTokenURI.includes(TEST.secondToken.url), true,
                "Unexpected token URI");
        });

        it('should transfer token from one owner to another', async function () { 
            await this.contract.safeTransferFrom(
                TEST.tokenRecipients[0],
                TEST.addressWithoutToken,
                TEST.firstToken.id,
                {from: TEST.tokenRecipients[0]}
                );
            let balanceOfAddressSix = await this.contract.balanceOf(TEST.addressWithoutToken);
            assert.strictEqual(balanceOfAddressSix.toNumber(), 1, "Unexpected balance after transfer");
        });
    });

    describe('have ownership properties', function () {
        beforeEach(async function () { 
            this.contract = await CustomERC721Token.new(TEST.tokenName, TEST.tokenSymbol, {from: TEST.contractOwner});
        });

        it('should fail when minting when address is not contract owner', async function () {
            await TEST.asyncTestForError(
                this.contract.mint,
                [TEST.tokenRecipients[0], 1, {from: TEST.whomever}],
                TEST.ERROR.CALLER_NOT_CONTRACT_OWNER
            );
        });

        it('should return contract owner', async function () { 
            let owner = await this.contract.getOwner();
            assert.strictEqual(owner, TEST.contractOwner, "Unexpected contract owner");
        });
    });
})