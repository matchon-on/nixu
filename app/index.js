/**
 * 画笔（上海）网络科技有限公司
 * 这是一个用于演示如何使用MatchOn API快速开发网络对战游戏的H5 APP
 * 支持最新的Chrome, Firefox, IE和Edge，并未在旧版IE上进行充分测试
 * 本游戏使用PIXIJS作为画图工具
 * 本游戏采用标准的 MIT
 */

(function() {

    //引入PIXI对象
    var PIXI = require("pixi.js");

    //引入MatchOn对象
    var MatchOn = require("../lib/matchon-core.js");

    // 生成唯一的玩家和请求编号
    var uuid = require("node-uuid");

    var gameLength = 30, gameEnded = false,  gameStarted = false;

    // 演示游戏的gameID和secrete．开发者在matchon.cn注册开发者账号后，创建新的游戏时，自动生成．
    var options = {

        gameID: 'e21766fc-1e86-4735-9216-bf4ab3a7d882',
        secrete: '01717aa4cd7eecfe125939cef3fc33e432175c93'

    };


    // 支持Retina设备高像素密度

    var ratio = (window.devicePixelRatio || 1) > 1 ? 2 : 1;

    //　创建新的MatchOn对象，通过该对象调用服务
    var mo = new MatchOn(options);

    var time = 0, myScore = 0, hisScore = 0;

    var startTime = Date.now();

    var renderer = PIXI.autoDetectRenderer(256, 256,{transparent: true});

    // 将Canvas设为全屏

    renderer.view.style.position = "absolute";
    renderer.view.style.display = "block";
    renderer.autoResize = true;
    renderer.resize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.view);

    var stage = new PIXI.Container();

    var stageWidth = renderer.width;
    var stageHeight = renderer.height;

    var top = 60;

    var width = 400 * ratio;

    var timer = 0;
    var smallFont = 32;
    var largeFont = 48;

    // 创建答案选项按钮
    var answerTexts = new Array(4);

    var initingStyle = {
        font: "bold " + 64 * ratio + "px Roboto", 
        fill: '#8b1a1a', 
        align: 'center' 
    };

    var initingText = new PIXI.Text('Hello', initingStyle);

    initingText.anchor.x = 0.5;
    initingText.anchor.y = 0.5;

    initingText.x = renderer.width / 2;
    initingText.y = stageHeight * (1 - 0.618);

    stage.addChild(initingText);

    renderer.render(stage);


    //　订阅初始化成功事件
    mo.on("initSucceeded", ()=> {
        console.log("inited");
        initingText.visible = false;
        initingText.interactive = false;
        setup();
    });

    //　订阅初始化超时事件
    mo.on("initTimeout", ()=> {
        initingText.text = "初始化失败．重试？";
        initingText.interactive = true;
        for(var w = 0; w <4; w++) {
            answerTexts[w].interactive =false;
            answerTexts[w].visible = false;
        }

    });

    // 订阅初始化失败事件
    mo.on("initError", ()=> {
        initingText.text = "初始化失败．重试？";
        initingText.interfactive = true;
        for(var w = 0; w <4; w++) {
            answerTexts[w].interactive =false;
            answerTexts[w].visible = false;
        }
    });

    //处理按钮触摸／点击事件
    initingText.on("touchend", ()=> mo.init());
    initingText.on("click",()=>mo.init());

    //开始初始化
    setTimeout(mo.init.bind(mo),800);

    var playerID = uuid.v4();
    var requestID = uuid.v4();
    var algo = "0";

    var matchID;


    // 设置游戏元素和内容
    function setup() {

        var textOptions = {
            font: "bold " + 64 * ratio + "px Roboto", 
            fill: '#8b1a1a', 
            align: 'center', 
            stroke: '#030303',
            strokeThickness: 20,
            lineJoin: 'round' 
        };

        var middleText = new PIXI.Text('智 力 体 操', textOptions);

        middleText.anchor.x = 0.5;
        middleText.anchor.y = 0.5;

        middleText.x = renderer.width / 2;
        middleText.y = stageHeight * (1 - 0.618);

        stage.addChild(middleText);

        var textStartGame = {
            font: "bold "+ largeFont * ratio + "px Roboto", 
            fill: '#b22222', 
            align: 'center', 
            lineJoin: 'round'
        };

        var textScore = {
            font: smallFont * ratio + "px"
        };

        var playerOneText = new PIXI.Text("",textScore);

        playerOneText.text = "我：" + myScore;

        playerOneText.x = (stageWidth - width) / 2;
        playerOneText.y = top;

        playerOneText.visible = false;

        stage.addChild(playerOneText);

        var playerTwoText = new PIXI.Text("",textScore);

        playerTwoText.text = "对手：" + myScore;

        //mo对象负责建立与后台的连接，接受消息．如果收到新消息，读取消息里的对手得分信息，在对手得分栏显示

        mo.on("message", (e)=> {

            hisScore = JSON.parse(e.message).data.score;
            playerTwoText.text = "对手：" + hisScore;

        });

        playerTwoText.anchor.x = 1;

        playerTwoText.x = stageWidth / 2 + width /2;
        playerTwoText.y = top;
        playerTwoText.visible = false;

        stage.addChild(playerTwoText);
        stage.interactive = true;

        var textTimerStyle = {
            font: smallFont * ratio + "px"
        };


        var timerText = new PIXI.Text("", textTimerStyle);

        timerText.text = "" + time;
        timerText.visible = false;
        timerText.anchor.x = 0.5;

        timerText.x = renderer.width / 2;

        timerText.y = top;

        stage.addChild(timerText);

        var startGame = new PIXI.Text('开 始 游 戏', textStartGame);
        var questionText;

        startGame.anchor.x = 0.5;
        startGame.anchor.y = 0.5;

        startGame.x = renderer.width / 2;
        startGame.y = stageHeight * (1 - 0.618) + 160 * ratio;

        startGame.interactive = true;

        //处理用户点击开始游戏按钮，匹配对手
        startGame.on("click", match);
        startGame.on("tap", match);

        stage.addChild(startGame);

        renderer.render(stage);

        // 开始游戏循环
        gameLoop();

        mo.on("newMatchSucceeded", (e)=> {

            startGame.visible = false;
            startGame.interactive = false;
            console.log("匹配成功");
            matchID = e.data.matchID;
            requestID = uuid.v4();
            gameStarted = true;
            gameEnded = false;
            startTime = Date.now();
            mo.openSocket({
                playerID: playerID,
                matchID: matchID
            });
            play();
        });



        mo.on("newMatchTimeout", (e) => {

            if(e.para.requestID !== requestID)
                return;  // 并不对应最新一次提交

            console.log(e.playerID + e.matchID + e.code);
            startGame.text = "匹配失败, 重试？" ;
            startGame.interactive = true;
            for(var w = 0; w <4; w++) {
                answerTexts[w].interactive =false;
                answerTexts[w].visible = false;
            }

        });

        mo.on("newMatchError", (e)=>{
            startGame.text = "匹配失败，重试？";

            if(e.para.requestID !== requestID)
                return;  // 并不对应最新一次提交

            console.log(e.playerID + e.matchID + e.code);
            for(var w = 0; w <4; w++) {
                answerTexts[w].interactive =false;
                answerTexts[w].visible = false;
            }
        });

        mo.on("gameEnded", ()=> {
            for(var w = 0; w <4; w++) {
                answerTexts[w].interactive =false;
                answerTexts[w].visible = false;
            }
            var text =
                    myScore >= hisScore ? "您赢了！\n\n再来一盘？" : "您输了！\n\n继续挑战？";

            startGame.text = text;
            startGame.visible = true;
            startGame.interactive = true;
            questionText.visible = false;

        });

        //订阅建立Socket连接事件
        mo.on("openSocketSucceeded", ()=> console.log("socket openned"));

        //订阅建立Socket错误事件
        mo.on("openSocketError", ()=> console.log("socket error"));

        //订阅建立Socket超时事件
        mo.on("openSocketTimeout", ()=> console.log("socket timeout"));

        function match() {

            console.log("match..");
            middleText.visible = false;

            startGame.text = "匹配对手...";
            startGame.interactive = false;
            myScore = 0;

            requestID = uuid.v4();
            
            hisScore = 0;

            playerOneText.text = "我：" + myScore;                        
            playerTwoText.text = "对手：" + hisScore;                        

            mo.newMatch({playerID: playerID,
                         requestID: requestID,
                         algo: algo});

        };


        function gameLoop() {
            window.requestAnimationFrame(gameLoop);
            if(gameStarted && !gameEnded) {
                time = Math.floor((Date.now() - startTime)/1000) ;
                timerText.text = "" + time;
                // 本次游戏结束
                if(time >= gameLength) {
                    gameEnded = true;
                    mo.emit("gameEnded");
                }
            }
            renderer.render(stage);
        };

        function play() {

            middleText.visible = false;
            gameStarted = true;
            startGame.visible = false;
            playerOneText.visible = true;
            playerTwoText.visible = true;
            timerText.visible = true;

            startTime = Date.now();

            //生成简单加，减，乘的算术题目

            var q = generateQuestion(1,20, 2);

            var questionStyle = {
                font: "bold "+ largeFont * ratio + "px"
            };

            var answerStyle = {
                font: smallFont * ratio +  "px" 
            };

            questionText = new PIXI.Text(q.question,questionStyle);

            var opts = "ABCD";

            var i = 0;

            for(i = 0; i < 4; i++) {

                answerTexts[i] = new PIXI.Text(opts[i] + " :   " + q.randomAnswers[i], answerStyle);
                answerTexts[i].__n = q.randomAnswers[i];

                //点击
                answerTexts[i].on("click",(data)=> {

                    if( data.target.__n === q.answer) {

                        for(var w = 0; w <4; w++)
                            answerTexts[w].interactive =false;

                        myScore += 1000;
                        playerOneText.text = "我：" + myScore;                        
                        q = generateQuestion(1, 10, 2);
                        questionText.text = q.question;
                        for( var j = 0; j < 4; j++) {
                            
                            answerTexts[j].text = opts[j] + " :   " + q.randomAnswers[j];
                            answerTexts[j].__n = q.randomAnswers[j];
                        }
                        for(w = 0; w <4; w++)
                            answerTexts[w].interactive = true;

                        //通过mo对象，向后端发送新的得分
                        sendScore(mo, myScore);
                        
                    } 
                });

                //触摸
                answerTexts[i].on("touchend",(data)=> {

                    if( data.target.__n === q.answer) {

                        for(var w = 0; w <4; w++)
                            answerTexts[w].interactive =false;

                        myScore += 1000;
                        playerOneText.text = "我：" + myScore;                        
                        q = generateQuestion(1, 10, 2);
                        questionText.text = q.question;
                        for( var j = 0; j < 4; j++) {
                            
                            answerTexts[j].text = opts[j] + " :   " + q.randomAnswers[j];
                            answerTexts[j].__n = q.randomAnswers[j];
                        }
                        for(w = 0; w <4; w++)
                            answerTexts[w].interactive = true;

                        //向后端发送最新得分
                        sendScore(mo, myScore);
                    }
                });

                stage.addChild(answerTexts[i]);
            };

            for( i = 0; i <4; i++)
                answerTexts[i].interactive = true;

            questionText.anchor.x = 0.5;
            questionText.anchor.y = 0.5;

            questionText.x = stageWidth / 2;
            questionText.y = top + stageHeight / 3;

            answerTexts[0].x = stageWidth / 2 - width /2 + 20 * ratio;
            answerTexts[0].y = stageHeight / 3 + 120 * ratio;

            answerTexts[1].x = stageWidth / 2 +  40 * ratio;
            answerTexts[1].y = stageHeight / 3 + 120 * ratio;

            answerTexts[2].x = stageWidth / 2 - width /2 + 20 * ratio;
            answerTexts[2].y = stageHeight / 3 + 180 * ratio;

            answerTexts[3].x = stageWidth / 2 +  40 * ratio;
            answerTexts[3].y = stageHeight / 3 + 180 * ratio;

            stage.addChild(questionText);

        }
    }

    var scoreMessage = { type: "01", score: 0 };

    //通过mo对象，向发送游戏得分消息
    function sendScore(mo, newScore) {
        
        scoreMessage.score = newScore;

        if(mo.sendMessage(JSON.stringify(scoreMessage)) === -1)
            console.log("连接已关闭，发送错误")
    }

    //生成游戏问题
    function generateQuestion(low,high, factors) {
        
        var n1 = getRandomInt(low, high);

        var n2 = getRandomInt(low, high);

        var n3 = getRandomInt(low,high);

        var operators = ["+","-","*"];

        var op1 = operators[getRandomInt(0,3)];
        var op2 = operators[getRandomInt(0,3)];
        var ops = factors == 3 ? " " + op2 +" " +  n3 + "" : "";
        var question  = n1 + " " +  op1 + " " +  n2 + ops + "";
        var answer = eval(question);
        return {
            question: question,
            answer : answer,
            randomAnswers : generateRandomAnswers(answer)
        };
    };

    //生成随机整数
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    };

    //生成随机答案
    function generateRandomAnswers ( answer) {
        var whichCorrect = getRandomInt(0,4);
        var randomAnswers = [0,0,0,0];
        var i = 0;
        var j = 0;
        var r = 0;
        var generated = false;
        for(i = 0; i < 4; i++) {
            generated = false;
            if( i === whichCorrect) {

                randomAnswers[i] = answer;
                generated = true;

            } else {

                //确保新的随机数与已生成的不同
                while( !generated) {

                    r = getRandomInt(answer - 40, answer + 40);

                    j = 0;
                    while( j < i && randomAnswers[j] != r)
                        j += 1;

                    if( j == i) {
                        randomAnswers[j] = r;
                        generated = true;
                    }
                }
            }

        }

        return randomAnswers;
    }

})();
