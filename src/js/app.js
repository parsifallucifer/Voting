App = {
    web3Provider: {},
    contracts: {},//这个地方在实际编译时会报错，添加了{}，不能为空
    account: '0x0',
    //初始化
    init: function () {
        return App.initWeb3();
    },
    initWeb3: function () {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            console.warn("Meata");
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545/');
        }
        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },
    initContract: function () {
        $.getJSON("Election.json", function (election) {
            App.contracts.Election = TruffleContract(election);
            App.contracts.Election.setProvider(App.web3Provider);
            App.listenForEvents();
            return App.reander();
        })
    },//这一部分比较简单不再赘述
    reander: function () {
        var electionInstance;
        var $loader = $("#loader"); //加载界面
        var $content = $("#content");//正文
        $loader.show(); //显示载入界面
        $content.hide(); //隐藏正文
        // 获得账号信息，并且显示在界面底部，作为提示
        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {  
                App.account = account;
                $("#accountAddress").html("您当前的账号: " + account);
            }
        });
        // 加载数据 
        App.contracts.Election.deployed().then(function (instance) { //这是一个类似于ES6的函数，可以实例化合约Election，如果已经实例化，直接执行then后面的内容，返回内容传给下一个then
            electionInstance = instance;
            return electionInstance.candidateCount();
        }).then(function (candidatesCount) {
            var $candidatesResults = $("#candidatesResults");
            $candidatesResults.empty();
            var $cadidatesSelect = $("#cadidatesSelect");
            $cadidatesSelect.empty();
            for (var i = 1; i <= candidatesCount; i++) {
                electionInstance.candidates(i).then(function (candidate) {
                    var id = candidate[0];
                    var name = candidate[1];
                    var voteCount = candidate[2];
                    var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>";
                    $candidatesResults.append(candidateTemplate);
                    //导入了合约中的数据，并且返回给了表格中 
                    var cadidateOption = "<option value='" + id + "'>" + name + "</option>";
                    $cadidatesSelect.append(cadidateOption); //将表格中的数据添加到<select>的option中
                });
            }
            return electionInstance.voters(App.account);
        }).then(function (hasVoted) {
            if (hasVoted) {
                $('form').hide();  //如果该区块链用户已经投过票了，那么隐藏form中的内容
            }
            $loader.hide(); //将加载界面隐藏
            $content.show(); //将正文显示出来
        }).catch(function (err) {
            console.warn(err);
        });
    },
    
    castVote: function () {
        var $loader = $("#loader");
        var $content = $("#content");
        var candidateId = $('#cadidatesSelect').val();
        App.contracts.Election.deployed().then(function (instance) {
            return instance.vote(candidateId, {from: App.account});
        }).then(function (result) {
            $content.hide();
            $loader.show();
        }).catch(function (err) {
            console.warn(err);
        });
    },

    //添加投票人
    addVoter: function () {
        var $loader = $("#loader");
        var $content = $("#content");
        var candidateName = $('#cadidatesAdd').val();
        App.contracts.Election.deployed().then(function (instance) {
            return instance.addCandidate(candidateName);
        }).then(function () {
            $content.hide();
            $loader.show();
            }).catch(function (err) {
                console.warn(err);
            })
    },

    // 监听事件 
    listenForEvents: function () {
        App.contracts.Election.deployed().then(function (instance) {
            instance.votedEvent({}, {formBlock: 0, toBlock: 'latest'}).watch(function (error, event) {
                console.log("event triggered", event);
                App.reander();
            });
        })
    }
};
$(function () {
    $(window).load(function () {
        App.init();
    });
});