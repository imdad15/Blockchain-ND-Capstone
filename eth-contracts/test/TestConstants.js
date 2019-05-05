const util = require("util");
const url = require("url");
const fs = require("fs");

module.exports = function (accounts, web3){
    var result;
    let correctProofFile = fs.readFileSync(
        "/Users/py/IdeaProjects/Blockchain-ND-Capstone/zokrates/code/square/proof3.json",
        "utf-8"
    );
    let badProofFile = fs.readFileSync(
        "/Users/py/IdeaProjects/Blockchain-ND-Capstone/zokrates/code/square/badProof.json",
        "utf-8"
    );
    let secondCorrectProofFile = fs.readFileSync(
        "/Users/py/IdeaProjects/Blockchain-ND-Capstone/zokrates/code/square/proof12.json",
        "utf-8"
    );
    let correctProof = JSON.parse(correctProofFile);
    let badProof = JSON.parse(badProofFile);
    let secondCorrectProof = JSON.parse(secondCorrectProofFile);

    try {
        result = {
            contractOwner: accounts[0],
            firstTokenRecipient: accounts[1],
            secondTokenRecipient: accounts[2],
            tokenName: "My Test Token",
            tokenSymbol: "TSTKN",
            baseTokeURI: "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/",
            tokenRecipients: [accounts[1], accounts[2], accounts[3], accounts[4], accounts[5]],
            firstToken: {
                id: 1
            },
            secondToken: {
                id: 2,
                url: "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/2"
            },
            addressWithoutToken: accounts[6],
            whomever: accounts[9],
            asUrl: function(str){
                return new url.URL(str);
            },
            currentBalanceAsBN: async function(address){
                let balanceString = await web3.eth.getBalance(address);
                return web3.utils.toBN(balanceString);
            },
            correctProof: correctProof.proof,
            correctInput: correctProof.input,
            badProof: badProof.proof,
            badInput: badProof.input,
            secondCorrectProof: secondCorrectProof.proof,
            secondCorrectInput: secondCorrectProof.input,
            toBN: function(str){
                return web3.utils.toBN(str);
            },
            asyncTestForError: async function(testCall, args, errorMessage){
                try {
                    await testCall.apply(this, args);
                } catch (e) {
                    // console.log(e.message);
                    try {
                        assert.equal(e.message.includes(errorMessage), true, "Unexpected error message");
                    } catch (err) {
                        console.log(e);
                        throw err;
                    }
                }
            },

            ERROR: {
                CALLER_NOT_CONTRACT_OWNER: "Only contract owner can invoke this operation",
            }
        }
    } catch (e) {
        console.log(e);
        assert.fail("The TEST setup has failed");
    }
    return result;
};