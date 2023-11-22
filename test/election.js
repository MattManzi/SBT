var Election = artifacts.require("./Election.sol");

contract("Election", function(accounts) {
  var electionInstance;

  it("initializes with two candidates", function() {
    return Election.deployed().then(function(instance) {
      return instance.candidatesCount();
    }).then(function(count) {
      assert.equal(count, 2);
    });
  });

  it("it initializes the candidates with the correct values", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidates(1);
    }).then(function(candidate) {
      assert.equal(candidate[0], 1, "contains the correct id");
      assert.equal(candidate[1], "Candidate 1", "contains the correct name");
      assert.equal(candidate[2], 0, "contains the correct votes count");
      return electionInstance.candidates(2);
    }).then(function(candidate) {
      assert.equal(candidate[0], 2, "contains the correct id");
      assert.equal(candidate[1], "Candidate 2", "contains the correct name");
      assert.equal(candidate[2], 0, "contains the correct votes count");
    });
  });

  it("allows a voter to cast a vote", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 1;
      return electionInstance.vote(candidateId, { from: accounts[0] });
    }).then(function(receipt) {
      return electionInstance.voters(accounts[0]);
    }).then(function(voted) {
      assert(voted, "the voter was marked as voted");
      return electionInstance.candidates(candidateId);
    }).then(function(candidate) {
      var voteCount = candidate[2];
      assert.equal(voteCount, 1, "increments the candidate's vote count");
    })
  });

  it("throws an exception for double voting", async function() {
    const instance = await Election.deployed();
    const candidateId = 2;

    // First vote
    await instance.vote(candidateId, { from: accounts[1] });
    const candidate = await instance.candidates(candidateId);
    const voteCount = candidate[2];
    assert.equal(voteCount, 1, "accepts first vote");

    // Try to vote again
    try {
        await instance.vote(candidateId, { from: accounts[1] });
        assert.fail("Expected an exception");
    } catch (error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
    }

    // Check vote counts
    const candidate1 = await instance.candidates(1);
    const voteCount1 = candidate1[2];
    assert.equal(voteCount1, 0, "candidate 1 did not receive any votes");

    const candidate2 = await instance.candidates(2);
    const voteCount2 = candidate2[2];
    assert.equal(voteCount2, 1, "candidate 2 did not receive any votes");
});

});