App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
  
    init: function() {
      return App.initWeb3();
    },
  
    initWeb3: function() {
      if (typeof window.ethereum !== 'undefined') {
        // If a web3 instance is already provided by MetaMask.
        App.web3Provider = window.ethereum;
        web3 = new Web3(window.ethereum);
  
        // Request account access if needed
        window.ethereum.enable().then(function(accounts) {
            // Ciclo attraverso tutti gli account
            for (let i = 0; i < accounts.length; i++) {
                let accountDiv = $("<div>").addClass("account-info");
                accountDiv.html("Account " + (i + 1) + ": " + accounts[i]);
                // Aggiungi il nuovo div al corpo del documento
                $("body").append(accountDiv);
              // Puoi eseguire altre azioni con ciascun account se necessario
              
            }
          
            // Nel tuo caso, stai utilizzando solo il primo account
            //App.account = accounts[0];
            //$("#accountAddress").html("Il tuo Account: " + App.account);
          }).catch(function(error) {
            // Gestisci l'errore
            console.error(error);
          });
      } else if (typeof web3 !== 'undefined') {
        // Legacy web3 provider (not recommended)
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        // Fallback to a local development provider
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3 = new Web3(App.web3Provider);
      }
  
      return App.initContract();
    },
  
    initContract: function() {
      return new Promise(function(resolve, reject) {
        $.getJSON("Election.json", function(election) {
          // Instantiate a new truffle contract from the artifact
          App.contracts.Election = TruffleContract(election);
          // Connect provider to interact with the contract
          App.contracts.Election.setProvider(App.web3Provider);
  
          resolve();
        }).fail(function(error) {
          reject(error);
        });
      }).then(function() {
        return App.render();
      });
    },
  
    render: function() {
      var electionInstance;
      var loader = $("#loader");
      var content = $("#content");
    
      loader.show();
      content.hide();
    
      // Load account data
      web3.eth.getCoinbase(function(err, account) {
        if (err === null) {
          App.account = account;
          $("#accountAddress").html("Your Account: " + account);
        }
      });
    
      // Load contract data
      App.contracts.Election.deployed().then(function(instance) {
        electionInstance = instance;
        return electionInstance.candidatesCount();
      }).then(function(candidatesCount) {
        var candidatesResults = $("#candidatesResults");
        candidatesResults.empty();
    
        var candidatesSelect = $('#candidatesSelect');
        candidatesSelect.empty();
    
        for (var i = 1; i <= candidatesCount; i++) {
          electionInstance.candidates(i).then(function(candidate) {
            var id = candidate[0];
            var name = candidate[1];
            var voteCount = candidate[2];
    
            // Render candidate Result
            var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
            candidatesResults.append(candidateTemplate);
    
            // Render candidate ballot option
            var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
            candidatesSelect.append(candidateOption);
          });
        }
        return electionInstance.voters(App.account);
      }).then(function(hasVoted) {
        // Do not allow a user to vote
        if(hasVoted) {
          $('form').hide();
        }
        loader.hide();
        content.show();
      }).catch(function(error) {
        console.warn(error);
      });
    },
    castVote: function() {
      var candidateId = $('#candidatesSelect').val();
      App.contracts.Election.deployed().then(function(instance) {
        return instance.vote(candidateId, { from: App.account });
      }).then(function(result) {
        // Wait for votes to update
        $("#content").hide();
        $("#loader").show();
      }).catch(function(err) {
        console.error(err);
      });
    }
    
  };
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });