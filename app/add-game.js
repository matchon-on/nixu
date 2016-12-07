
    (function () {
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
                window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                                           timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    }());


    var PIXI = require("pixi.js");

    var time = 0;

    var myScore = 0;
    var hisCore = 0;

    var startTime = Date.now();

    var renderer = PIXI.autoDetectRenderer(256, 256,{transparent: true});

    renderer.view.style.position = "absolute";
    renderer.view.style.display = "block";
    renderer.autoResize = true;
    renderer.resize(window.innerWidth, window.innerHeight);

    console.log(renderer.width, renderer.height);

    //Add the canvas to the HTML document
    document.body.appendChild(renderer.view);

    //Create a container object called the `stage`
    var stage = new PIXI.Container();

    var stageWidth = renderer.width;
    var stageHeight = renderer.height;
    var top = 30;
    var width = 400;

    var gameStarted = false;

    var timer = 0;

    function setup() {

        var textOptions = {
            font: "bold 64px Roboto", // Set style, size and font
            fill: '#8b1a1a', // Set fill color to blue
            align: 'center', // Center align the text, since it's multiline
            stroke: '#030303', // Set stroke color to a dark blue-gray color
            strokeThickness: 20, // Set stroke thickness to 20
            lineJoin: 'round' // Set the lineJoin to round instead of 'miter'
        };

        // Create middleText with the textOptions. Use \n to make the line break
        var middleText = new PIXI.Text('智 力 体 操', textOptions);

        // Set anchor to the center of the text
        middleText.anchor.x = 0.5;
        middleText.anchor.y = 0.5;

        // Place text in the center of our stage
        middleText.x = renderer.width / 2;
        middleText.y = stageHeight * (1 - 0.618);

        // Add middleText to the stage
        stage.addChild(middleText);


        var textStartGame = {
            font: "bold 48px Roboto", // Set style, size and font
            fill: '#b22222', // Set fill color to blue
            align: 'center', // Center align the text, since it's multiline
            lineJoin: 'round' // Set the lineJoin to round instead of 'miter'
        };

        var playerOneText = new PIXI.Text("");

        playerOneText.text = "我：" + myScore;

        // Position the text
        playerOneText.x = (stageWidth - width) / 2;
        playerOneText.y = top;

        playerOneText.visible = false;

        // Add Player one Text to the stage
        stage.addChild(playerOneText);

        // Player Two Text
        var playerTwoText = new PIXI.Text("");

        playerTwoText.text = "对手：" + myScore;

        // Place the anchor at the top right corner of the text
        playerTwoText.anchor.x = 1;

        // Position the player two text at the same y position as player one
        // But with the x position at, full width (660) minus 20. (640)
        playerTwoText.x = stageWidth / 2 + width /2;
        playerTwoText.y = top;
        playerTwoText.visible = false;

        // Add player two text to the stage
        stage.addChild(playerTwoText);
        stage.interactive = true;

        // Create the timer text
        var timerText = new PIXI.Text("");
        timerText.text = "" + time;
//        timerText.visible = false;
        // Place the anchor in the top center of the text
        timerText.anchor.x = 0.5;

        // Position the timer text at the top center of our stage
        timerText.x = renderer.width / 2;
        timerText.y = top;

        // Add timer text to the stage
        stage.addChild(timerText);


        var startGame = new PIXI.Text('开 始 游 戏', textStartGame);

        // Set anchor to the center of the text
        startGame.anchor.x = 0.5;
        startGame.anchor.y = 0.5;

        // Place text in the center of our stage
        startGame.x = renderer.width / 2;
        startGame.y = stageHeight * (1 - 0.618) + 160;

        startGame.interactive = true;

        startGame.on("click", ()=> play());

        startGame.on("tap", ()=> play());

        // Add middleText to the stage
        stage.addChild(startGame);

        renderer.render(stage);

//        gameLoop();

        setTimeout(gameLoop, 1000 / 60);

        function gameLoop() {
            //Loop this function at 60 frames per second
//            window.requestAnimationFrame(gameLoop);

//            if(gameStarted) {

            time = Math.trunc((Date.now() - startTime)/1000) ;
            timerText.text = "" + time;

//            }

            renderer.render(stage);

            setTimeout(gameLoop, 1000/60);
        };

        function play() {


            middleText.visible = false;
            gameStarted = true;
            startGame.visible = false;
            playerOneText.visible = true;
            playerTwoText.visible = true;
            timerText.visible = true;

            startTime = Date.now();

            var q = generateQuestion(1,10, 3);


            var questionStyle = {
                font: "bold 48px" // Set style, size and font
            };

            var answerStyle = {
                font: "32px" // Set style, size and font
            };
            var questionText = new PIXI.Text(q.question,questionStyle);

            var answerTexts = new Array(4);
            var opts = "ABCD";
            var i = 0;
            for(i = 0; i < 4; i++) {

                answerTexts[i] = new PIXI.Text(opts[i] + " :   " + q.randomAnswers[i], answerStyle);
                answerTexts[i].__n = q.randomAnswers[i];

                answerTexts[i].on("click",(data)=> {

                    if( data.target.__n === q.answer) {

                        for(var w = 0; w <4; w++)
                            answerTexts[w].interactive =false;

                        myScore += 1000;
                        playerOneText.text = "我：" + myScore;                        
                        q = generateQuestion(1, 10, 3);
                        questionText.text = q.question;
                        for( var j = 0; j < 4; j++) {
                            
                            answerTexts[j].text = opts[j] + " :   " + q.randomAnswers[j];
                            answerTexts[j].__n = q.randomAnswers[j];
                        }
                        for(w = 0; w <4; w++)
                            answerTexts[w].interactive = true;

                        console.log("correct");
                        
                    } else
                        console.log("wrong");
                });

                answerTexts[i].on("touchend",(data)=> {

                    if( data.target.__n === q.answer) {

                        for(var w = 0; w <4; w++)
                            answerTexts[w].interactive =false;

                        myScore += 1000;
                        playerOneText.text = "我：" + myScore;                        
                        q = generateQuestion(1, 10, 3);
                        questionText.text = q.question;
                        for( var j = 0; j < 4; j++) {
                            
                            answerTexts[j].text = opts[j] + " :   " + q.randomAnswers[j];
                            answerTexts[j].__n = q.randomAnswers[j];
                        }
                        for(w = 0; w <4; w++)
                            answerTexts[w].interactive = true;

                        console.log("correct");
                        
                    } else
                        console.log("wrong");
                });

                stage.addChild(answerTexts[i]);
            };

            for( i = 0; i <4; i++)
                answerTexts[i].interactive = true;

            questionText.anchor.x = 0.5;
            questionText.anchor.y = 0.5;

            questionText.x = stageWidth / 2;
            questionText.y = top + stageHeight / 3;

            answerTexts[0].x = stageWidth / 2 - width /2 + 20;
            answerTexts[0].y = stageHeight / 3 + 120;

            answerTexts[1].x = stageWidth / 2 +  40;
            answerTexts[1].y = stageHeight / 3 + 120;

            answerTexts[2].x = stageWidth / 2 - width /2 + 20;
            answerTexts[2].y = stageHeight / 3 + 160;

            answerTexts[3].x = stageWidth / 2 +  40;
            answerTexts[3].y = stageHeight / 3 + 160;

            stage.addChild(questionText);

        }
    }

    setup();

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

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    };

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



                while( !generated) {

                    r = getRandomInt(answer - 40, answer + 40);

                    if( r === answer )
                        r += 1;

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


