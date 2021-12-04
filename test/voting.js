const voting = artifacts.require("voting");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("voting", function (accounts) {
  var accHasntVoted = accounts[1];
  var accHasVoted = accounts[2];


  it("should assert true", async function () {
    await voting.deployed();
    return assert.isTrue(true);
  });

  it("sets the candidates of the vote", function(){
    return voting.deployed().then((instance) => {
      votingInstance = instance;
      return votingInstance.candidates(1);
    }).then((name) => {
      assert.equal(name, "Michael Scott", 'name of first candidate is correct');
      return votingInstance.candidates(2);
    }).then((name) => {
      assert.equal(name, "Dwight Schrute", 'name of the second candidate is correct');
    })
  });

  it("both candidates should start with no votes", function(){
    return voting.deployed().then((instance) => {
      votingInstance = instance;
      return votingInstance.votes(1);
    }).then((number) => {
      assert.equal(number, 0, 'votes for first candidate starts at 0');
      return votingInstance.votes(2);
    }).then((number) => {
      assert.equal(number, 0, 'votes for the second candidate starts at 0');
    })
  });

  it('can not vote if already has voted', function() {
    return voting.deployed().then((instance) => {
      votingInstance = instance;    
      return votingInstance.vote(1, { from: accHasVoted });
    }).then((receipt) => {
      return votingInstance.vote(1, { from: accHasVoted });
    }).then(assert.fail).catch((error) => {
      assert(error.message.toString().indexOf('revert') >= 0, 'cannot vote more than once');
      return votingInstance.hasVoted(accHasVoted);
    }).then((number) => {
      assert.equal(number.toNumber(), 1, 'acc has already voted');
    })
  });

  it('number of votes for a candidate is updated after a vote', function() {
    return voting.deployed().then((instance) => {
      votingInstance = instance;
      return votingInstance.vote(2, { from: accHasntVoted });
    }).then((receipt) => {
      return votingInstance.votes(2);
    }).then((number) => {
      assert.equal(number.toNumber(), 1, 'number of votes has incremented');
    })
  });

  it('emits event VoteMade when there\'s a new vote', function(){
    return voting.deployed().then((instance) => {
      votingInstance = instance;
      return votingInstance.vote(1, { from: accounts[3] });
    }).then((receipt) => {
      assert.equal(receipt.logs.length, 1, 'one event is being triggered upon voting');
      assert.equal(receipt.logs[0].event, 'VoteMade', 'name of the event is VoteMade');
      assert.equal(receipt.logs[0].args._for, 'Michael Scott', 'the name of the candidate voted for');
      assert.equal(receipt.logs[0].args._by, accounts[3], 'the account that voted');
    })
  });

});
