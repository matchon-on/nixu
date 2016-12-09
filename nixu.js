/* 使用立即执行的匿名函数 */

(function nixu() {

    // 设置PI常数

    var PI = Math.PI ? Math.PI : 3.14159;
    var playerID = uuid.v4();
    var requestID;
    // matchon fq
    var gameID = "1069c931-7d71-4364-b43c-99ab265fabdd";

    var secrete = "44e9f2bbc6e6093f9a7682ee9d1476087d14fc50";


    var timeout = 40;
    var algo = "0";
    var initiated = false;
    var delayedMatchHandler, delayedGameHandler, clockHandler = false,
        clockStartTime;
    var matchID = undefined;
    var colors = [0x292f36, 0x4ecdc6, 0xff6b6b, 0xf1db3b, 0x6e2594, 0x5a352a, 0x7284a8, 0x2c4251, 0xf0c987];
    var options = {
        gameID: gameID,
        secrete: secrete,
        timeout: timeout
    };
    var gameType = "s";
    var myScore = 0;
    var hisScore = 0;
    var gameClockTime = 60;
    var mo = new MatchOn(options);

    //Create the stage and renderer

    var stage = new PIXI.Container(),
        renderer = PIXI.autoDetectRenderer(256, 256, {
            transparent: true,
            antialias: true
        });

    renderer.view.style.position = "absolute";
    renderer.view.style.width = window.innerWidth + "px";
    renderer.view.style.height = window.innerHeight + "px";
    renderer.view.style.display = "block";
    renderer.resize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.view);

    var stageWidth = renderer.width;
    var stageHeight = renderer.height;

    // 支持Retina设备高像素密度

    var ratio = (window.devicePixelRatio || 1) > 1 ? 2 : 1;

    var baseStyle = {
        fontSize: 64 * ratio,
        fontWeight: "bold",
        fill: '#8b1a1a',
        align: 'center'
    };

    var titleText = new PIXI.Text("逆 序 击 破", baseStyle);

    stage.addChild(titleText);

    titleText.anchor.x = 0.5;
    titleText.anchor.y = 0.5;

    titleText.x = renderer.width / 2;
    titleText.y = stageHeight * (1 - 0.618);

    var buttonStyle = {

        fontSize: 30 * ratio,
        fontWeight: "bold",
        align: 'center'

    };

    var startMulti = new PIXI.Text("对战模式", buttonStyle);

    startMulti.anchor.x = 0.5;
    startMulti.anchor.y = 0.5;
    startMulti.x = renderer.width / 2 - 100 * ratio;
    startMulti.y = stageHeight * (1 - 0.618) + 150 * ratio;
    stage.addChild(startMulti);
    startMulti.visible = false;

    startMulti.on("touchend", function() {
        startMultiHandler();
    });
    startMulti.on("click", function() {
        startMultiHandler();
    });


    function startMultiHandler() {

        clearTimeout(delayedMatchHandler);
        clearTimeout(delayedGameHandler);
        titleText.visible = false;

        startMulti.visible = false;
        startSingle.visible = false;
        initiatingText.visible = true;
        cancleMatch.visible = true;
        cancleMatch.interactive = true;
        myScoreText.x = stageWidth / 4;
        myScoreText.text = "我: 0";
        if (initiated)
            matchPlayer();
        else
            initiate();

    };

    var cancleMatch = new PIXI.Text("取消", {

        fontSize: 40 * ratio,
        fontWeight: "bold",
        align: 'center'

    });

    cancleMatch.anchor.x = 0.5;
    cancleMatch.anchor.y = 0.5;
    cancleMatch.x = renderer.width / 2;
    cancleMatch.y = stageHeight * (1 - 0.618) + 250 * ratio;
    cancleMatch.visible = false;
    stage.addChild(cancleMatch);

    cancleMatch.on("touchend", function() {
        cancleMatchHandler();
    });

    cancleMatch.on("click", function() {
        cancleMatchHandler();
    });

    function cancleMatchHandler() {
        cancleMatch.visible = false;
        cancleMatch.interactive = false;
        initiatingText.text = "取消匹配中";
        var req = {
            cancelID: uuid.v4(),
            playerID: playerID,
            originalAlgo: algo,
            originalRequestID: requestID
        }
        mo.cancelMatchingRequest(req);
        console.log("取消匹配中");
    }

    var cancleGame = new PIXI.Text("退出游戏", buttonStyle);

    cancleGame.anchor.x = 0.5;
    cancleGame.anchor.y = 0.5;
    cancleGame.x = renderer.width / 2;
    cancleGame.y = stageHeight * (1 - 0.618) + 350 * ratio;
    cancleGame.visible = false;
    stage.addChild(cancleGame);

    cancleGame.on("touchend", function() {
        cancleGameHandler();
    });
    cancleGame.on("click", function() {
        cancleGameHandler();
    });

    function cancleGameHandler() {
        cancleGame.visible = false;
        cancleGame.interactive = false;
        if (gameType == "m") {
            mo.sendMessage("08", {
                score: myScore
            });
        }
        exitGame();

        console.log("退出游戏");
    }

    var startSingle = new PIXI.Text("单机模式", buttonStyle);

    // startSingle.anchor.x = 0.5;
    startSingle.anchor.y = 0.5;
    startSingle.x = renderer.width / 2 + 150 * ratio - startSingle.width;
    startSingle.y = stageHeight * (1 - 0.618) + 150 * ratio;
    stage.addChild(startSingle);
    startSingle.visible = false;
    startSingle.on("click", function(e) {
        playSingle();
    });
    startSingle.on("touchend", function(e) {
        playSingle();
    });



    var titleScale = {
        x: 0.2
    };
    var buttonScale = {
        x: 0.2
    };

    titleText.scale = {
        x: 0.2,
        y: 0.2
    };
    titleText.skew = {
        x: -0.2,
        y: -0.15
    };

    var titleTween = new TWEEN.Tween(titleScale).to({
        x: 1
    }, 800).easing(TWEEN.Easing.Back.Out).onUpdate(function() {
        titleText.scale.x = titleScale.x;
        titleText.scale.y = titleScale.x;
        titleText.rotation = titleScale.x * PI * 2;
    }).onComplete(function() {
        startSingle.visible = true;
        startMulti.visible = true;
    });

    var buttonTween = new TWEEN.Tween(buttonScale).to({
        x: 1
    }, 60).onUpdate(function() {
        startSingle.scale.x = buttonScale.x;
        startSingle.scale.y = buttonScale.x;
        startMulti.scale.x = buttonScale.x;
        startMulti.scale.y = buttonScale.x;
    }).onComplete(function() {
        startSingle.interactive = true;
        startMulti.interactive = true;
    });

    titleTween.chain(buttonTween);

    titleTween.start();

    var loadingText = new PIXI.Text("加载中...", baseStyle);

    stage.addChild(loadingText);

    loadingText.anchor.x = 0.5;
    loadingText.anchor.y = 0.5;

    loadingText.x = renderer.width / 2;
    loadingText.y = stageHeight * (1 - 0.618);
    loadingText.visible = false;


    var initiatingText = new PIXI.Text("连 接 中...", baseStyle);

    stage.addChild(titleText);

    initiatingText.anchor.x = 0.5;
    initiatingText.anchor.y = 0.5;

    initiatingText.x = renderer.width / 2;
    initiatingText.y = stageHeight * (1 - 0.618);

    stage.addChild(initiatingText);
    initiatingText.visible = false;

    var backgroundSquares = new Array(9);

    var square;
    var squareWidth = 90;
    var gap = 20;

    console.log(stageWidth);

    var topx = (stageWidth - squareWidth * ratio * 3 - gap) / 2;

    var topy = stageHeight * 0.25;

    var scoreTextStyle = {
        fontSize: 30 * ratio,
        fill: '#8b1a1a'
    };

    //计时状态栏
    var gameClock = new PIXI.Text("计时开始", {
        fontSize: 30 * ratio,
        fill: 0xfb2222,
        fontWeight: 'bold',
        align: 'center'
    });

    gameClock.anchor.x = 0.5;
    gameClock.x = renderer.width / 2;;
    gameClock.y = 50 * ratio;
    stage.addChild(gameClock);
    gameClock.visible = false;

    //对战状态栏
    var gamePkStatus = new PIXI.Text("对战中", {
        fontSize: 30 * ratio,
        fill: 0x2b8236,
        fontWeight: "bold",
        align: "center"
    });

    gamePkStatus.anchor.x = 0.5;
    gamePkStatus.x = renderer.width / 2;
    gamePkStatus.y = renderer.height * 0.25 - 60 * ratio;
    stage.addChild(gamePkStatus);
    gamePkStatus.visible = false;

    //分数栏
    var myScoreText = new PIXI.Text("我 : 0", scoreTextStyle);
    var hisScoreText = new PIXI.Text("对方 : 0", scoreTextStyle);
    console.log(myScoreText.width);

    myScoreText.anchor.x = 0.5;

    myScoreText.x = stageWidth / 4;

    myScoreText.y = topy - 100 * ratio;

    myScoreText.visible = false;

    hisScoreText.anchor.x = 0.5;

    hisScoreText.x = stageWidth / 4 * 3;
    // hisScoreText.x = stageWidth / 2 + (squareWidth * 3 + gap) * ratio / 2 - myScoreText.width;

    hisScoreText.y = topy - 100 * ratio;

    hisScoreText.visible = false;

    stage.addChild(myScoreText);
    stage.addChild(hisScoreText);

    var startRowX = (stageWidth - squareWidth * 3 + gap * 2) * ratio / 2 + squareWidth * ratio / 2;

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {

            square = new PIXI.Graphics();
            square.pivot.x = 0.5;
            square.pivot.y = 0.5;
            square.beginFill(0xbdbdbd);
            square.drawRoundedRect(0, 0, squareWidth * ratio, squareWidth * ratio);
            square.x = i * (squareWidth + gap) * ratio + topx;
            square.y = j * (squareWidth + gap) * ratio + topy;
            stage.addChild(square);
            backgroundSquares[i * 3 + j] = square;
            square.visible = false;
            square.nixuIndex = i * 3 + j;
            square.on("click", hit);
            square.on("tap", hit);
        }
    }

    var foregroundSquares = new Array(9);

    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {

            square = new PIXI.Graphics();
            square.pivot.x = 0.5;
            square.pivot.y = 0.5;
            square.beginFill(colors[i * 3 + j]);
            square.drawRoundedRect(0, 0, squareWidth * ratio, squareWidth * ratio);
            square.x = i * (squareWidth + gap) * ratio + topx;
            square.y = j * (squareWidth + gap) * ratio + topy;
            stage.addChild(square);
            foregroundSquares[i * 3 + j] = square;
            square.visible = false;
            square.nixuIndex = i * 3 + j;

        }
    }


    renderer.render(stage);

    console.log(generateSequence(9));

    gameLoop();


    function gameLoop() {

        if (clockHandler) {
            var timeNumber = gameClockTime - Math.floor((new Date().getTime() - clockStartTime) / 1000);
            if (timeNumber < 0) {
                clockHandler = false;
                if (myScore >= hisScore) {
                    gamePkStatus.text = "你赢了";
                } else {
                    gamePkStatus.text = "你输了";
                }
                mo.disconnect();
            } else {
                var timeStr = Math.floor(timeNumber / 60) < 10 ? "0" + Math.floor(timeNumber / 60) : Math.floor(timeNumber / 60);
                timeStr += ":";
                timeStr += (timeNumber % 60) < 10 ? ("0" + timeNumber % 60) : timeNumber % 60;
                gameClock.text = timeStr;
            }
        }

        window.requestAnimationFrame(gameLoop);

        TWEEN.update();

        renderer.render(stage);


    }

    //退出游戏 初始化样式
    function exitGame() {
        clockHandler = false;
        clearTimeout(delayedGameHandler);
        hiddenAll();
        initiatingText.visible = false;
        myScoreText.visible = false;
        hisScoreText.visible = false;
        myScoreText.text = "我: 0";
        hisScoreText.text = "对方: 0";
        titleText.visible = true;
        startMulti.visible = true;
        startSingle.visible = true;
        mo.disconnect();
        hisScore = 0;
        myScore = 0;
        level = 3;
        errorCount = 0;
        nextHit = -1;
        gameClockTime = 60;
        gamePkStatus.visible = false;
        gameClock.visible = false;
        gamePkStatus.text = "对战中";
    }

    //生成点击的序列

    function generateSequence(n) {

        var sequence = new Array(n);
        var next = 0;
        var r;
        var generated;
        for (var i = 0; i < n; i++) {
            generated = false;
            while (!generated) {
                r = getRandomInt(0, 9);
                if (!checkInSequence(sequence, r, i)) {
                    generated = true;
                    sequence[i] = r;
                }

            }
        }
        return sequence;
    }

    //检查数字n是否包含在数组seq中, size为已生成的随机数个数
    function checkInSequence(seq, n, size) {

        for (var i = 0; i < size; i++) {
            if (seq[i] === n)
                return true;

        }
        return false;

    }

    //生成随机整数
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    };


    mo.on("initSucceeded", function() {
        initiated = true;
        console.log("Inited");
        initiatingText.text = " 匹 配 对 手 中... ";
        matchPlayer();

    });

    mo.on("newMatchError", function() {

        console.log("matching failed");
        matchingFailed(1);

    });

    mo.on("newMatchTimeout", function() {

        console.log("matching timedout");
        matchingFailed(0);

    });

    mo.on("cancelMatchingSucceeded", function() {
        console.log("cancelMatchingSucceeded");
        initiatingText.visible = false;
        initiatingText.text = "匹配对手中...";
        titleText.visible = true;
        startMulti.visible = true;
        startSingle.visible = true;
    });



    function matchingFailed(e) {
        if (!cancleMatch.visible) return;
        cancleMatch.visible = false;
        cancleMatch.interactive = false;
        if (e) {
            initiatingText.text = "未找到对手";
        } else {
            initiatingText.text = "匹配超时";

        }

        delayedMatchHandler = setTimeout(function() {
            if (!initiatingText.visible) return;
            startSingle.visible = true;
            startMulti.visible = true;
            initiatingText.visible = false;
            initiatingText.text = "匹配对手中...";
            titleText.visible = true;
        }, 2000);

    }

    mo.on("newMatchSucceeded", function(e) {
        console.log("newMatchSucceeded");
        console.log(e);
        matchID = e.data.matchID;
        playMulti();
        gameType = "m";
        cancleMatch.interactive = false;
        cancleMatch.visible = false;
    });

    function matchPlayer() {

        console.log("matchingPlayer");
        requestID = uuid.v4();
        mo.newMatch({
            playerID: playerID,
            requestID: requestID,
            algo: algo
        });

    }


    function initiate() {
        console.log("initiate");
        mo.init();
    }

    mo.on("openSocketSucceeded", function() {
        console.log("Connected");
    });

    mo.on("message", function(e) {
        console.log("received message");
        console.log(e);
        if (e.message.data.type === "01") {
            hisScore = e.message.data.content.score;
            hisScoreText.text = "对方: " + hisScore;
        } else if (e.message.data.type === "08") {
            gamePkStatus.text = "对方已退出对战";
            console.log("对方已经退出");
        }
    });

    function playMulti() {
        initiatingText.text = "匹配对手中...";
        myScore = 0;
        hisScore = 0;
        mo.openSocket({
            playerID: playerID,
            matchID: matchID
        });
        cancleGame.visible = true;
        cancleGame.interactive = true;
        myScoreText.visible = true;
        hisScoreText.visible = true;
        initiatingText.visible = false;
        gamePkStatus.visible = true;
        gamePkStatus.text = "对战中";
        gameClock.text = "开始计时";
        gameClock.visible = true;
        play();
        clockStartTime = new Date().getTime();
        clockHandler = true;
    }

    function playSingle() {
        gameType = "s";
        myScoreText.text = "得分: 0";
        myScoreText.x = stageWidth / 2;
        cancleGame.visible = true;
        cancleGame.interactive = true;
        myScoreText.visible = true;
        hisScoreText.visible = false;
        initiatingText.visible = false;
        titleText.visible = false;
        startSingle.visible = false;
        startMulti.visible = false;
        play();
    }

    var level = 3;
    var seq;
    var myScore = 0;
    var hisScore = 0;
    var nextHit = -1;
    var errorCount = 0;

    function play() {

        console.log("playing");

        errorCount = 0;
        disableAll();

        seq = generateSequence(level);
        console.log(seq);
        var hitTweenScales = new Array(level);
        var hitTweens = new Array(level);
        var animateSqures = new Array(level);
        var positions = new Array(level);
        for (i = 0; i < level; i++) {

            hitTweenScales[i] = {
                x: 0,
                y: 0,
                target: foregroundSquares[seq[i]]
            };

            foregroundSquares[seq[i]].visible = true;
            foregroundSquares[seq[i]].scale.x = 0;
            foregroundSquares[seq[i]].scale.y = 0;
            console.log(foregroundSquares[seq[i]].x);

            hitTweens[i] = new TWEEN.Tween(hitTweenScales[i]).
            to({
                x: 1,
                y: 1
            }, 350).delay(i * 300).onUpdate(function() {
                this.target.scale.x = this.x;
                this.target.scale.y = this.y;
            }).start();
        }

        hitTweens[i - 1].onComplete(
            function() {
                setTimeout(function() {
                    if (!cancleGame.visible) return;
                    for (var j = 0; j < foregroundSquares.length; j++) {
                        backgroundSquares[j].interactive = true;
                        foregroundSquares[j].visible = false;
                    }
                    for (j = 0; j < backgroundSquares.length; j++) {
                        delete backgroundSquares[j].nixuHitcheck_;
                        backgroundSquares[j].visible = true;
                    }

                    for (j = 0; j < seq.length; j++) {
                        backgroundSquares[seq[j]].nixuHitcheck_ = j;
                    }
                    nextHit = level - 1;

                }, 200);
            });

        console.log(backgroundSquares);

    }

    function hit(e) {
        console.log("点击");
        if (this.nixuHitcheck_ === nextHit && nextHit != 0) {

            errorCount = 0;
            foregroundSquares[this.nixuIndex].visible = true;
            nextHit = nextHit - 1;

        } else if (this.nixuHitcheck_ === nextHit && nextHit == 0) {

            console.log("all correct");

            foregroundSquares[this.nixuIndex].visible = true;

            myScore += 1000 + (level - 3) * 500;

            updateScore();

            delayedGameHandler = setTimeout(function() {

                for (var j = 0; j < backgroundSquares.length; j++) {
                    foregroundSquares[j].visible = false;
                    backgroundSquares[j].visible = false;
                }

                play();

            }, 1000);

        } else {

            errorCount += 1;
            for (var j = 0; j < backgroundSquares.length; j++) {
                foregroundSquares[j].visible = false;
            }

            console.log("error");
            nextHit = seq.length - 1;
            if (errorCount === 4) {

                for (var j = 0; j < backgroundSquares.length; j++) {
                    foregroundSquares[j].visible = false;
                    backgroundSquares[j].visible = false;
                }

                play();
            }

        }
    }

    function updateScore() {
        if (gameType === "m") {
            myScoreText.text = "我: " + myScore;
            mo.sendMessage("01", {
                score: myScore
            });
        } else {
            myScoreText.text = "得分: " + myScore;
        }

        if (myScore > 1000 + (level - 2) * (level - 2) * 3000)
            level += 1;

    }

    function disableAll() {
        var len = backgroundSquares.length;
        for (var i = 0; i < len; i++) {
            backgroundSquares[i].interactive = false;
            foregroundSquares[i].interactive = false;
        }
    }

    function hiddenAll() {
        var len = backgroundSquares.length;
        for (var i = 0; i < len; i++) {
            backgroundSquares[i].visible = false;
            foregroundSquares[i].visible = false;
        }
    }

    function gameClockHandler() {
        var timeStr;
        if (gameClockTime < 0) {
            clearInterval(delayClockHandler);
            if (myScore >= hisScore) {
                gamePkStatus.text = "你赢了";
            } else {
                gamePkStatus.text = "你输了";
            }
            mo.disconnect();
        } else {
            timeStr = Math.floor(gameClockTime / 60) < 10 ? "0" + Math.floor(gameClockTime / 60) : Math.floor(gameClockTime / 60);
            timeStr += ":";
            timeStr += (gameClockTime % 60) < 10 ? ("0" + gameClockTime % 60) : gameClockTime % 60;
            console.log(timeStr);
            // gameClock.text = timeStr;
            gameClockTime--;

        }

    }
}());
