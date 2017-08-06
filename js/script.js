var Media = (function() {
    'use strict';
    var self = {};
    
    // variables publiques  

    self.notes = [];
    
    // variables privées
   
    var instrument = 'sax';
    var gamut = ['c', 'd', 'e', 'f', 'g', 'a', 'b', 'c1'];
    
    // creating Howl objects (sounds)
    for(var i=0, l = gamut.length; i<l; i++){
        self.notes.push(new Howl({
            src: [
                'media/' + instrument + '-' + gamut[i] + '.ogg', 
                'media/' + instrument + '-' + gamut[i] + '.mp3', 
                'media/' + instrument + '-' + gamut[i] + '.webm', 
            ],
            autoplay: false,
            loop: true,
            /* à réparer (probleme: DrawSVG pas encore défini
            onplay: DrawSVG.turnOnLightKey,
            onstop: DrawSVG.turnOffLightKey,
            */
        }));
    }
    var crash = new Howl({src: [
        'media/crash.ogg', 'media/crash.mp3', 'media/crash.webm'
    ]});
    var applaud = new Howl({src: [
        'media/applaud.ogg', 'media/applaud.mp3', 'media/applaud.webm'
    ]});
    var crowdohh = new Howl({src: [
        'media/crowdohh.ogg', 'media/crowdohh.mp3', 'media/crowdohh.webm'
    ]});
   
    // méthodes publiques
   
    self.playSong = function(song, note_duration, gap) {
        /* play a serie of notes (in string song) in sequence */
        var note = song.slice(0,1);
        setTimeout(function() {
            self.notes[note].play();
            DrawSVG.turnOnLightKey(note);
        }, gap);
        setTimeout(function() {
            self.notes[note].stop();
            DrawSVG.turnOffLightKey(note);
           if ( song.length > 1 ) {
               song = song.slice(1, song.length);
               self.playSong(song, note_duration, gap);
           }
        }, note_duration);
    };

    self.fail = function() {
        crash.play();
    };
    
    self.failNonStrict= function(callback){
        crowdohh.play();
        if (callback) {
            crowdohh.on('end', callback);
        }
    };
   
    self.victory = function() {
        DrawSVG.flashKeyPads();
        applaud.play();
    };

    return self;
})();


var Simon = (function() {
    'use strict';

    var self = {};

    // variables privées
    var setting = {
        nb_keys: 4,
        difficulty: 6,
        strict_mode: false,
    };
    var game_started = false;
    var song, currentChallenge, lengthPlayed; 
    var success = false;
    var seqPlayBack; // setTimeout 

    // méthodes publiques
   
    self.initialise = function() {
        game_started = false;
        song = generateSong(setting.difficulty);
        currentChallenge = 1;
        lengthPlayed = 0;
    };

    self.startGame = function(){
        if (game_started) {
            alertify.confirm( 'This will reinitialise the game', function(e) {
                if (e) {
                    self.initialise();
                    game_started = true;
                    Media.playSong(song.slice(0, currentChallenge), 1000, 200);
                }
            });
        } else {
            self.initialise();
            game_started = true;
            Media.playSong(song.slice(0, currentChallenge), 1000, 200);
        }
    };
   
    self.startNote = function(note_id) {
       
        if (!game_started) {
            alertify.alert('Press the red button \'start\' to begin the game');
            return;
        }
        
        note_id = note_id.toString();
        
        if (note_id === song[lengthPlayed]) { // note played correct
            DrawSVG.turnOnLightKey(note_id);
            Media.notes[note_id].play();
            success = true;
            DrawSVG.showScore(++lengthPlayed);

        } else {
            DrawSVG.flashDigitScore(lengthPlayed);
            if (setting.strict_mode) {
                clearTimeout(seqPlayBack);
                Media.fail();
                game_started = false;
            } else {
                Media.failNonStrict(function() {
                    playBackChallenge();
                });
            }
            lengthPlayed = 0;
        }
    };
  
    self.releaseNote = function(note_id) {
        DrawSVG.turnOffLightKey(note_id);
        Media.notes[note_id].stop();
        if (success) {
            if (lengthPlayed === currentChallenge) {
                currentChallenge += 1;
                lengthPlayed = 0;
                if (currentChallenge > song.length) {
                    Media.victory();
                    DrawSVG.flashDigitScore(song.length);
                    game_started = false;
                } else {
                    playBackChallenge();
                }
            }
        }
    };
    
    self.incrementDifficulty = function() {
        if (DrawSVG.power) {
            mustPowerOff();
        } else {
            if (setting.difficulty == 25) {
                alertify.log('You will need a phenomenal memory!!!');
            } else if (setting.difficulty == 20) {
                alertify.log('You will need a very good memory!');
            } else if (setting.difficulty == 15) {
                alertify.log('You will need a good memory!');
            }
            setting.difficulty += 1; 
        }
        return setting.difficulty;
    };
    
    self.decrementDifficulty = function() {
        var mess = [
            'C\'mon, that\'s way too easy for you!',
            'Sorry, cannot go easier than that!'
        ];
        if (DrawSVG.power) {
            mustPowerOff();
        } else {
            switch (setting.difficulty) {
                case 5: alertify.error(mess[0]); setting.difficulty--; break;
                case 3: alertify.error(mess[1]); break;
                default: setting.difficulty--;
            }
        }
        /*
        } else if (setting.difficulty < 4) {
            alertify.error('Sorry, cannot go easier than that!');
        } else if (setting.difficulty == 5) {
            alertify.error('C\'mon, that\'s way too easy for you!');
        } else {
            setting.difficulty -= 1; 
        }
        */
        return setting.difficulty;
    };

    self.incrementKeys = function() { 
        if (DrawSVG.power) {
            mustPowerOff();
        } else if (setting.nb_keys < 7) {
            DrawSVG.reDrawKeys(++setting.nb_keys); 
        } else {
            alertify.error('Sorry, no more room for another key.');
        }
        return setting.nb_keys;
    };
   
    self.decrementKeys = function() { 
        if (DrawSVG.power) {
            mustPowerOff();
        } else if (setting.nb_keys > 3) {
            DrawSVG.reDrawKeys(--setting.nb_keys); 
        } else {
            alertify.error('You don\'t want the whole toy disappear, do you?');
        }
        return setting.nb_keys;
    };
    
    self.setStrictMode = function(on){
        setting.strict_mode = (on) ? true: false;
    };

    self.generateIntroMusic = function () {
        /* repeat ascending notes 3 times */
        var ret = '';
        for (var i=0; i<3; i++){
            ret += '01234567'.slice(0, setting.nb_keys);
        }
        return ret;
    };
    
    // méthodes privées
    
    function playBackChallenge(){
        clearTimeout(seqPlayBack);
        seqPlayBack = setTimeout(function() {
            Media.playSong(song.slice(0, currentChallenge), 
                    600/Math.log(currentChallenge + 1), 
                    200/currentChallenge);
        }, 1000);
    }
   
    function mustPowerOff(){
        alertify.alert('You must turn power off ' + 
                'before changing those settings ' +
                'or you risk being electrocuted.');
    }
    
    function generateSong(len) {
        /* generate a string of random number with lenght *len*
         * and upper limit *setting.nb_keys* */
        var s = '';
        while(len) {
            s += Math.floor(Math.random() * setting.nb_keys);
            len--;
        }
        return s;
    }

    return self;
})();


/*******************************
 *           SVG               *
 *******************************/

var DrawSVG = (function(){

    // public attributes container
    var self = {};
    
    // private variables
    var vbox = 200;   // viewbox side length
    var padding = 10; // between outer circle and viewbox edge
    var outer_circle = vbox / 2 - padding; // outer circle radius
    var inner_circle = vbox / 4 - padding; // inner circle radius
    var center = vbox / 2;

    var led_on = '#EC1100';
    var led_off = '#70020B';


    var colors = ['red', 'green', 'yellow', 'blue', 'cyan', 'magenta', 'pink'];
    var dark_colors = ['darkred', 'darkolivegreen', 'sandybrown', 'darkblue',
        'cyan', 'magenta', 'pink'];
    var light_colors = ['#FF8080', '#00FF00', '#FFFF80', '#8080FF', 
        '#BFFFFF', '#FFBFFF', '#FFEBEE'];

    var draw = SVG('simon').size("100%", "100%").viewbox(0,0, vbox, vbox);
    var nb_keys; 
    var arcs = draw.group();
    
    // initialisation
    drawKeys(4);

    // variables publiques
    self.power = false;
    
    // méthodes publiques
    
    self.reDrawKeys = function(nb) {
        if ((nb < 8) && (nb > 2)) {
            drawKeys(nb);
        } else {
            throw 'nb keys must be between 3 and 7';
        }
    };

    self.turnOnLightKey = function(nkey){
        arcs.get(nkey).fill(light_colors[nkey]);
    };
    
    self.turnOffLightKey = function(nkey){
        arcs.get(nkey).fill(colors[nkey]);
    };

    self.turnOffAllLights = function() {
        // rendre les touches en echelons de gris
        // todo
    };
   
    self.showScore = function(score){
        // 2 digit format for the score led indicator
        score_digits.text(("0" + score).slice(-2));
    };
    
    self.flashDigitScore = function(score) {
        self.showScore(score);
        var nb_flash = 0, led;
        var flashing = setInterval(function() {
            if (++nb_flash === 7) { clearInterval(flashing); }
            led = (nb_flash % 2) ? led_on: led_off;
            score_digits.stroke({color: led}).fill(led);
        }, 200);
    };

    self.flashKeyPads = function() {
        /* alternate between light and normal colors by pairs */
        var nb_flash = 0, col = [light_colors, colors], odd, even;
        var flashing = setInterval(function(){
            odd = nb_flash%2;
            even = Math.abs(odd - 1);
            arcs.each(function(i, children){
                children[i].fill(col[Math.abs(odd - (i%2))][i]);
                children[i].fill(col[Math.abs((i%2) - even)][i]);
            });
            if (++nb_flash === 21) { // last flashing cycle
                clearInterval(flashing); 
                arcs.each(function(i, children){ // reset to normal colors
                    children[i].fill(col[1][i]);
                });
            }
        }, 200);
       
    };
    
    function touchedNoteStart(){
        if (tip.hasClass("on")) {
            Simon.startNote(this.position());
        } else {
            powerMeOnMessage();
        }
    }
    
    function touchedNoteEnd(){
        var note = this.position();
        // setTimeout(function() {
            Simon.releaseNote(note);
        // }, 20);  // prevent bouncing 
        
    }

    function powerOn() {
        Media.playSong(Simon.generateIntroMusic(), 100, 10);
        score_digits.stroke({color: led_on}).fill(led_on);
        self.flashDigitScore('00');
        self.power = true;
        Simon.initialise();
    }

    function powerOff() {
        mode_indicator.removeClass('strictMode');
        Simon.setStrictMode(false);
        score_digits.text('00');
        score_digits.stroke({color: led_off}).fill(led_off);
        self.power = false;
    }
    function startPlay() {
        if (tip.hasClass('on')) {
            Simon.startGame();
        } else {
            powerMeOnMessage();
        }
    }

    function powerMeOnMessage() {
        alertify.alert('I am old style: Power me on first!');
    }

    function toggleMode() {
        if (tip.hasClass('on')) {
            mode_indicator.toggleClass('strictMode');
            Simon.setStrictMode(mode_indicator.hasClass('strictMode'));
        } else {
            powerMeOnMessage();
        }
    }
    
    function drawKeys(nb) {
        /* draw the key pads in circle */
        arcs.clear();
        nb_keys = nb;
        
        var theta = Math.PI * 2 / nb;

        // circles path coordinates delimiting the game pads
        var touch_path = 'M' + center + ' ' + padding + 'A' + // starting point
            outer_circle  + ' ' + outer_circle + ' 0 0 1 ' +  // arc parameters
            (center + Math.sin(theta) * (center - padding)) +       //  "    "
            ' ' + (center - Math.cos(theta) * (center - padding)) + //  "    "
            'L' + (center + Math.sin(theta) * inner_circle) + ' ' + 
             (center - Math.cos(theta) * inner_circle) +     // line to inner circle
            'A' + inner_circle + ' ' + inner_circle + ' 0 0 0 ' + // arc parameter
            center + ' ' + (center - inner_circle) + 'Z';         // for inner circle
   
        // creation of the first key pad
        var dm_arc = arcs.path(touch_path)
            .stroke({color: 'black', opacity: 1, width: 5 })
            .fill({color: colors[0], opacity: 1})
            .mousedown(touchedNoteStart).mouseup(touchedNoteEnd)
            // problème à régler avec combinaison touch et click
            // .touchstart(touchedNoteStart).touchend(touchedNoteEnd)
            .style('cursor', 'pointer');
    
        // creation of the other key pads
        for (var i = nb - 1; i > 0 ; i--) {
            dm_arc.clone().rotate(-i * 360 / nb, center, center)
                .fill(colors[i])
                // problème à régler avec combinaison touch et click
                // .touchstart(touchedNoteStart).touchend(touchedNoteEnd)
                .mousedown(touchedNoteStart).mouseup(touchedNoteEnd);
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

    return self;
})();

// extra settings
window.onload = function() {
    var increaseKeys = document.getElementById('increaseKeys');
    var decreaseKeys = document.getElementById('decreaseKeys');
    var increaseLevel = document.getElementById('increaseLevel');
    var decreaseLevel = document.getElementById('decreaseLevel');
    var nbKeys = document.getElementById('nbKeys');
    var level = document.getElementById('level');
    increaseKeys.onclick = function(){nbKeys.innerHTML = Simon.incrementKeys();};
    decreaseKeys.onclick = function(){nbKeys.innerHTML = Simon.decrementKeys();};
    increaseLevel.onclick = function(){level.innerHTML = Simon.incrementDifficulty();};
    decreaseLevel.onclick = function(){level.innerHTML = Simon.decrementDifficulty();};
};
