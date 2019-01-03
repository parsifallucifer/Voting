App = {
    web3Provider: {},
    contracts: {},//����ط���ʵ�ʱ���ʱ�ᱨ�������{}������Ϊ��
    account: '0x0',
    //��ʼ��
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
    },//��һ���ֱȽϼ򵥲���׸��
    reander: function () {
        var electionInstance;
        var $loader = $("#loader"); //���ؽ���
        var $content = $("#content");//����
        $loader.show(); //��ʾ�������
        $content.hide(); //��������
        // ����˺���Ϣ��������ʾ�ڽ���ײ�����Ϊ��ʾ
        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {  
                App.account = account;
                $("#accountAddress").html("����ǰ���˺�: " + account);
            }
        });
        // �������� 
        App.contracts.Election.deployed().then(function (instance) { //����һ��������ES6�ĺ���������ʵ������ԼElection������Ѿ�ʵ������ֱ��ִ��then��������ݣ��������ݴ�����һ��then
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
                    //�����˺�Լ�е����ݣ����ҷ��ظ��˱���� 
                    var cadidateOption = "<option value='" + id + "'>" + name + "</option>";
                    $cadidatesSelect.append(cadidateOption); //������е�������ӵ�<select>��option��
                });
            }
            return electionInstance.voters(App.account);
        }).then(function (hasVoted) {
            if (hasVoted) {
                $('form').hide();  //������������û��Ѿ�Ͷ��Ʊ�ˣ���ô����form�е�����
            }
            $loader.hide(); //�����ؽ�������
            $content.show(); //��������ʾ����
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

    //���ͶƱ��
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

    // �����¼� 
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