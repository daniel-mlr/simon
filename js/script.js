var Media = (function() {
    'use strict';
    var self = {};
    
    // variables publiques  

    self.notes = [];
    var instrument = 'sax';
    var gamut = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    // var gamut = ['c', 'd', 'e', 'f'];
    for(var i=0, l = gamut.length; i<l; i++){
        self.notes.push(new Howl({
            src: [
                'media/' + instrument + '-' + gamut[i] + '.ogg', 
                'media/' + instrument + '-' + gamut[i] + '.mp3', 
                'media/' + instrument + '-' + gamut[i] + '.webm', 
            ],
            autoplay: false,
            loop: true
        }));
    }
    
    // variables privées
   
    var playBackLength = '1000'; // lenght of playback tone for each note
   
    
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

    self.showMessage = function(message) {
        console.log(message);
    };

    self.buzzer = function() {
        console.log('Buzzer ring!');
    };
    self.victory = function() {
        console.log('It\'s a victory!');
    };

    return self;
})();


var Simon = (function() {
    'use strict';

    var self = {};

    // variables privées
    var setting = {
        nb_keys: 4,
        difficulty: 5
    };
    var game_started = false;
    var song, currentChallenge, lengthPlayed;

    // initialise game
    initialise();

    function initialise() {
        song = generateSong(setting.difficulty);
        console.log('song:', typeof song, song);
        
        currentChallenge = 1;
        lengthPlayed = 0;
    }
   

    // méthodes publiques
   
    self.startGame = function(){
        if (game_started) {
            console.log('rcommencer le jeu?');
            alertify.confirm('This will reinitialise the game', function(e) {
                if (e) {
                    initialise();
                    Media.playSong(song.slice(0, currentChallenge), 1000, 200);
                }
            });
        } else {
            game_started = true;
            Media.playSong(song.slice(0, currentChallenge), 1000, 200);
        }
    };
   
    self.playNote = function(notePlayed) { 
        // input: note just keyed
        // increase challenge and announce it if notePlayed is correct
        // sound buzzer and reset challenge to 1 if not

        if (!game_started) {
            alertify.alert('Press the red button \'start\' to begin the game');
            return;
        }

        notePlayed = notePlayed.toString();
       
        if (notePlayed === song[lengthPlayed]) { // note jouée correcte
            lengthPlayed += 1;
            if (lengthPlayed === currentChallenge) {
                console.log('currentChallenge atteint', currentChallenge);
                currentChallenge += 1;
                lengthPlayed = 0;
                if (currentChallenge > song.length) {
                    Media.victory();
                } else {
                    Media.playSong(song.slice(0, currentChallenge), 1000, 200);
                }
            }
        } else {
            Media.buzzer();
            // reset ? depend du mode strict
            lengthPlayed = 0;
        }
        return;
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
        if (setting.nb_keys < 7) {
            setting.nb_keys += 1;
            DrawSVG.reDrawKeys(setting.nb_keys); 
        } else {
            alertify.error('The Maximum number of keys is 7.');
        }
        return setting.nb_keys;
    };
    self.decrementKeys = function() { 
        if (setting.nb_keys > 3) {
            setting.nb_keys -= 1;
            DrawSVG.reDrawKeys(setting.nb_keys); 
        } else {
            alertify.error('The minimum number of keys is 3.');
        }
        return setting.nb_keys;
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
    var dark_colors = ['darkred', 'darkolivegreen', 'sandybrown', 'darkblue', 'cyan', 'magenta', 'pink'];
    var light_colors = ['#FF8080', '#00FF00', '#FFFF80', '#8080FF', 
    '#BFFFFF', '#FFBFFF', '#FFEBEE'];

    var draw = SVG('simon').size("100%", "100%").viewbox(0,0, vbox, vbox);

    var nb_keys;
    
    var arcs = draw.group();
    console.log('arcs défini', arcs);
    
    // initialisation
    drawKeys(4);

    self.reDrawKeys = function(nb) {
        if ((nb < 8) && (nb > 2)) {
            drawKeys(nb);
        } else {
            throw 'nb keys must be between 3 and 7';
        }
    };

    self.turnOnLightKey = function(nkey){
        console.log('a allumer, clé', nkey, arcs.get(nkey));
        arcs.get(nkey).fill(light_colors[nkey]);
    };
    
    self.turnOffLightKey = function(nkey){
        arcs.get(nkey).fill(colors[nkey]);
    };
   
    function touchedNoteStart(){
        console.log(this);
        console.log('note jouée - début:', this.position());
        
        if (tip.hasClass("on")) {
            Media.notes[this.position()].play();
            this.fill(light_colors[this.position()]);
        } else {
            powerMeOnMessage();
        }
    }
    
    function touchedNoteEnd(){
        console.log('note jouée - fin:', this.position());
        Media.notes[this.position()].stop();
        this.fill(colors[this.position()]);
        Simon.playNote(this.position());
        console.log('je sors de Simon');
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
            .touchstart(touchedNoteStart).touchend(touchedNoteEnd)
            .style('cursor', 'pointer');
    
        // creation of the other key pads
        for (var i = nb - 1; i > 0 ; i--) {
            dm_arc.clone().rotate(-i * 360 / nb, center, center)
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

    /*
    increaseKeys.onclick = function() {
        if (nbKeys.innerHTML >= 7) {
            console.log('message: maximum atteint');
            alertify.error("Maximum number of keys is 7");
        } else {
            nbKeys.innerHTML = parseInt(nbKeys.innerHTML) + 1;
            DrawSVG.reDrawKeys(nbKeys.innerHTML); 
        }
    };
    decreaseKeys.onclick = function() {
        if (nbKeys.innerHTML <= 3) {
            console.log('message: minimum atteint');
            alertify.error("Minimum number of keys is 3");
        } else {
            nbKeys.innerHTML = parseInt(nbKeys.innerHTML) - 1;
            DrawSVG.reDrawKeys(nbKeys.innerHTML); 
        }
    };
    */
    increaseKeys.onclick = function(){nbKeys.innerHTML = Simon.incrementKeys();};
    decreaseKeys.onclick = function(){nbKeys.innerHTML = Simon.decrementKeys();};
};
