var SolnSquareVerifier = artifacts.require("SolnSquareVerifier");

contract("SolnSquareVerifier", (accounts, web3) =>{
    let TEST;
    try {
        TEST = require("./TestConstants")(accounts, web3);
    } catch (e) {
        console.log(`TEST setup failed\n${e.message}`);
    }

    // console.log(TEST.correctProof);

    beforeEach(async function () {
        this.contract = await SolnSquareVerifier.new(TEST.tokenName, TEST.tokenSymbol,{from: TEST.contractOwner});
        console.log("    Log: Contract is re-instantiated");
    });
    describe("SolnVerifier tests", function () {

        it("can add a solution", async function(){
            this.contract.SolutionAdded().on("data", event => {
                assert.strictEqual(event.returnedValues.submitterAddress, TEST.contractOwner);
            });

            await this.contract.addSolution(
                TEST.correctProof.A,
                TEST.correctProof.A_p,
                TEST.correctProof.B,
                TEST.correctProof.B_p,
                TEST.correctProof.C,
                TEST.correctProof.C_p,
                TEST.correctProof.H,
                TEST.correctProof.K,
                TEST.correctInput,
                {from: TEST.contractOwner}
            );
        });
        it("can not add the same solution again", async function(){
            await this.contract.addSolution(
                TEST.correctProof.A,
                TEST.correctProof.A_p,
                TEST.correctProof.B,
                TEST.correctProof.B_p,
                TEST.correctProof.C,
                TEST.correctProof.C_p,
                TEST.correctProof.H,
                TEST.correctProof.K,
                TEST.correctInput,
                {from: TEST.contractOwner}
            );
            try {
                await this.contract.addSolution(
                    TEST.correctProof.A,
                    TEST.correctProof.A_p,
                    TEST.correctProof.B,
                    TEST.correctProof.B_p,
                    TEST.correctProof.C,
                    TEST.correctProof.C_p,
                    TEST.correctProof.H,
                    TEST.correctProof.K,
                    TEST.correctInput,
                    {from: TEST.contractOwner}
                );
                assert.fail("Existing solution can not be added again. But it has just happened");
            } catch (e) {
                assert.strictEqual(e.message.includes("Solution exists already"), true, "Unexpected error");
            }
        });

        it("can mint a token when there is solution available for to address", async function () {
            await this.contract.addSolution(
                TEST.correctProof.A,
                TEST.correctProof.A_p,
                TEST.correctProof.B,
                TEST.correctProof.B_p,
                TEST.correctProof.C,
                TEST.correctProof.C_p,
                TEST.correctProof.H,
                TEST.correctProof.K,
                TEST.correctInput,
                {from: TEST.firstTokenRecipient}
            );
            let tokensBefore = await this.contract.totalSupply.call();
            await this.contract.mint(TEST.firstTokenRecipient, tokensBefore + 1, {from: TEST.contractOwner});
            let tokensAfter = await this.contract.totalSupply.call();
            assert.strictEqual(tokensAfter - tokensBefore, 1, "Unexpected total token supply");

            let tokenUri = await this.contract.tokenURI.call(tokensBefore + 1);
            assert.strictEqual(tokenUri.includes(`${TEST.baseTokeURI}1`), true, "Unexpected token URI");
        });

        it("can not mint a token when there is no solution for to address", async function () {
            let tokensBefore = await this.contract.totalSupply.call();
            try {
                await this.contract.mint(TEST.firstTokenRecipient, tokensBefore + 1, {from: TEST.contractOwner});
                assert.fail("Token can not be minted when there is no solution available for to address, but it has just happened");
            }catch (e) {
                assert.strictEqual(e.message.includes("Solution does not exist"), true, "Unexpected error message");
            }
        });

        it("can not mint a token when the solution had been used already to mint the token", async function () {
            let tokensBefore = await this.contract.totalSupply.call();
            await this.contract.addSolution(
                TEST.correctProof.A,
                TEST.correctProof.A_p,
                TEST.correctProof.B,
                TEST.correctProof.B_p,
                TEST.correctProof.C,
                TEST.correctProof.C_p,
                TEST.correctProof.H,
                TEST.correctProof.K,
                TEST.correctInput,
                {from: TEST.firstTokenRecipient}
            );
            await this.contract.mint(TEST.firstTokenRecipient, tokensBefore + 1, {from: TEST.contractOwner});
            try {
                await this.contract.mint(TEST.firstTokenRecipient, tokensBefore + 2, {from: TEST.contractOwner});
                assert.fail("Token can not be minted when solution is already used for another token, but it has just happened");
            }catch (e) {
                assert.strictEqual(e.message.includes("Solution had been used for token minting already"), true, "Unexpected error message");
            }
        });
    });
});
