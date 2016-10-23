var Media = (function() {
    'use strict';
    var self = {};
    
    // variables privées
    var playBackLength = '1000'; // lenght of playback tone for each note
   
    // méthodes publiques
    self.playBackNote = function(note) {
        // visualisation de la clé pressée
        // son renvoyé
        console.log('playBackNote:', note);
        // durée, jusqu'à 'mouseout'
    };
   
    self.stopPlayBackNote = function(){
    };
   
    self.playSong = function(notes, duration) {
        for (var note=0; note< notes.length; note++){
            self.playBackNote(note);
        }
        console.log('je joue les notes', notes);
    };
   
    self.showMessage = function(message) {
        console.log(message);
    };

    self.buzzer = function() {
        console.log('Buzzer ring!');
    };
    self.victory = function() {
        console.log('It\'s a victory!');
    };

    self.initKeyBoard = function(nb_keys){
        // cercle avec angles variant selon nombre de clés à accomoder
    };

    return self;
})();


var Simon = (function() {
    'use strict';

    var self = {};

    // variables privées
    var setting = {
        nb_keys: 4,
        //difficulty: 20
        difficulty: 5
    };
    var song = generateSong(setting.difficulty);
    console.log('song:', typeof song, song);
    
    var currentChallenge = 1;
    var lengthPlayed = 0;
    

    // méthodes publiques
   
    self.startGame = function(){
        Media.playSong(song.slice(0, currentChallenge));
    };
   
    self.playNote = function(notePlayed) { 
        // input: note just keyed
        // increase challenge and announce it if notePlayed is correct
        // sound buzzer and reset challenge to 1 if not

        if (notePlayed === song[lengthPlayed]) { // note jouée correcte
            Media.playBackOne(notePlayed);
            lengthPlayed += 1;
            if (lengthPlayed === currentChallenge) {
                console.log('currentChallenge atteint', currentChallenge);
                currentChallenge += 1;
                lengthPlayed = 0;
                if (currentChallenge > song.length) {
                    Media.victory();
                } else {
                    // console.log('appel de playSong(song.slice(0,' + currentChallenge + '))', song.slice(0, currentChallenge));
                    Media.playSong(song.slice(0, currentChallenge));
                }
            }
        } else {
            Media.buzzer();
            // reset ? depend du mode strict
            lengthPlayed = 0;
        }
    };
    
    self.incrementDifficulty = function() {
        setting.difficulty += 1; 
        return setting.difficulty;
    };
    
    self.decrementDifficulty = function() {
        if (setting.difficulty > 2) {
            setting.difficulty -= 1; 
        } else {
            Media.showMessage('Cannot go easier than that!');
        }
        return setting.dificulty;
    };

    self.incrementKeys = function() { 
        if (setting.nb_keys < 8) {
            setting.nb_keys += 1;
            Media.initKeyBoard(setting.nb_keys);
        } else {
            Media.showMessage('This is the maximum number of keys.');
        }
    };
    self.decrementKeys = function() { 
        if (setting.nb_keys > 4) {
            setting.nb_keys -= 1;
            Media.initKeyBoard(setting.nb_keys);
        } else {
            Media.showMessage('The minimum number of keys is 4.');
        }
    };

    // méthodes privées
    function generateSong(len) {
        var s = '';
        while(len) {
            s += Math.floor(Math.random() * setting.nb_keys);
            len--;
        }
        return s;
    }

    return self;
})();

// inutile?
$(function() {
//    Simon.test();
});


/*************** SVG ****************/

var DrawSVG = (function(){

    var vbox = 200;   // viewbox side length
    var padding = 10; // between outer circle and viewbox edge
    var outer_circle = vbox / 2 - padding; // outer circle radius
    var inner_circle = vbox / 4 - padding; // inner circle radius
    var center = vbox / 2;

    var led_on = '#EC1100';
    var led_off = '#70020B';


    var colors = ['red', 'green', 'yellow', 'blue', 'cyan', 'magenta', 'pink'];

    var draw = SVG('simon').size("100%", "100%").viewbox(0,0, vbox, vbox);

    drawKeys(4);

    function touchedNoteStart(){
        console.log('note jouée - début:', this.position());
        // (remplace playBackOne(note)
    }
    function touchedNoteEnd(){
        console.log('note jouée - fin:', this.position());
        // (remplace playBackOne(note)
    }

    function powerOn() {
        console.log('Je joue une petite musique de bienvenue');
        score_digits.stroke({color: led_on}).fill(led_on);
        // pour test
        score_digits.text('88');
    }

    function powerOff() {
        console.log('J\'éteins les lumières');
        mode_indicator.removeClass('strictMode');
        score_digits.text('00');
        score_digits.stroke({color: led_off}).fill(led_off);
    }
    function startPlay() {
        console.log('je commence le jeu en jouant la première note ' +
               'si le jeu n\'est pas déjà commencé! ');
        Simon.startGame();
    }

    function powerMeOnMessage() {
        console.log('I am old style: Power me on first!');
    }

    function toggleMode() {
        if (tip.hasClass('on')) {
            mode_indicator.toggleClass('strictMode');
        } else {
            powerMeOnMessage();
        }
    }

    function drawKeys(nb_keys) {
        /* draw the key pads in circle */
       
        var theta = Math.PI * 2 / nb_keys;
   
        // circles path coordinates delimiting the game pads
        // var touch_path = 'M' + center + ' ' + center/10 + 'A' + // starting point
        var touch_path = 'M' + center + ' ' + padding + 'A' + // starting point
            outer_circle  + ' ' + outer_circle + ' 0 0 1 ' +  // arc parameters
            (center + Math.sin(theta) * (center - padding)) +       //  "    "
            ' ' + (center - Math.cos(theta) * (center - padding)) + //  "    "
            'L' + (center + Math.sin(theta) * inner_circle) + ' ' + 
             (center - Math.cos(theta) * inner_circle) +     // line to inner circle
            'A' + inner_circle + ' ' + inner_circle + ' 0 0 0 ' + // arc parameter
            center + ' ' + (center - inner_circle) + 'Z';         // for inner circle
   
        // creation of the first key pad
        var dm_arc = draw.path(touch_path)
            .stroke({color: 'black', opacity: 1, width: 5 })
            .fill(colors[0]).mousedown(touchedNoteStart).mouseup(touchedNoteEnd)
            .touchstart(touchedNoteStart).touchend(touchedNoteEnd)
            .style('cursor', 'pointer');
    
        // creation of the other key pads
        for (var i = 1; i < nb_keys ; i++) {
            dm_arc.clone().rotate(-i * 360 / nb_keys, center, center)
                .fill(colors[i]).mousedown(touchedNoteStart)
                .mouseup(touchedNoteEnd).touchstart(touchedNoteStart)
                .touchend(touchedNoteEnd);
        }
   
    }
     

    /*********  drawing controls and buttons in the center circle ******/
    
    draw.text('Simon').font({family: 'Impact', size: 12}).move(82, 69);
    draw.text('®').font({family: 'Impact', size: 8}).move(114, 69);

    // svg power on switch
    var powerSwitch = draw.group();
    powerSwitch.text('OFF').font({family: 'Impact', size: 7}).move(-11, 0.5);
    powerSwitch.text('ON').font({family: 'Impact', size: 7}).move(21.5, 0.5);
    powerSwitch.rect(20, 10).radius(2).fill('gray');
    var tip = powerSwitch.group();
    tip.rect(8, 8).radius(1).stroke({color:'darkblue', width: 1}).fill('blue').move(1,1);
    var line = tip.line(3, 1, 3, 9).stroke({color: 'darkblue', opacity: 0.7, width: 1});
    tip.use(line).move(2,0);
    tip.use(line).move(4,0);
    powerSwitch.move(90, 120);
    powerSwitch.click(function() {
        var pos;
        if (tip.hasClass('on')) {
            pos = 0;
            powerOff();
        } else {
            pos = 10;
            powerOn();
        }
        tip.animate(100, '<', 0).move(pos, 0);
        tip.toggleClass('on');
    });

    // score indicator group
    var scoreBox = draw.group();
    scoreBox.rect(12, 12).radius(2).fill('#33060C').stroke({color: 'black', width: 1});
    var score_digits = scoreBox.text('00').font({family: 'Helvetica', size: 8}).
        stroke({color: led_off, width:0.5}).fill(led_off).move(1.4, 1.5);
    scoreBox.text('count').font({size: 8}).move(-4, 12);
    scoreBox.move(70, 94);

    // start game button
    var startButton = draw.group();
    startButton.circle(10).stroke({width: 2}).fill('red').click(startPlay);
    startButton.text('start').font({size: 8}).move(-2.5, 11);
    startButton.move(95, 95);

    // strict button and indicator
    var strictButton = draw.group();
    var mode_indicator = strictButton.circle(2).move(4, -6)
        .stroke({width: 2}).stroke({color: led_off});
    strictButton.circle(10).stroke({width: 2}).fill('yellow').click(toggleMode);
    strictButton.text('strict').font({size: 8}).move(-2.5, 11);
    strictButton.move(118, 95);

})();

