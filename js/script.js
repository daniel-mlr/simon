var Media = (function() {
    'use strict';
    var self = {};
    
    // variables privées
    var colors = ['blue', 'red', 'yellow', 'green'];
    var playBackLength = '1000'; // lenght of playback tone for each note
   
    // méthodes publiques
    self.playBackOne = function(note) {
        // visualisation de la clé pressée
        // son renvoyé
        console.log('la note qui est renvoyée (playBackOne):', note);
        // durée, jusqu'à 'onUnclick'
    };
   
    self.playSong = function(notes) {
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
    
    // console.log('song partial:', song.slice(0, currentChallenge));

    Media.playSong(song.slice(0, currentChallenge));

    // méthodes publiques
   
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
            // reset ?
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

var vbox = 200;   // viewbox side length
var padding = 10; // between outer circle and viewbox edge
var outer_circle = vbox / 2 - padding; // outer circle radius
var inner_circle = vbox / 4 - padding; // inner circle radius

// experimental
var nb_keys = 5;
var theta = Math.PI * 2 / nb_keys;

var colors = ['red', 'green', 'yellow', 'blue', 'cyan', 'magenta', 'pink'];

var draw = SVG('simon').size("100%", "100%").viewbox(0,0, vbox, vbox);

function touchedNote(){
    console.log('note jouée:', this.position());
}

// circles path coordinates delimiting the game pads
var touch_path = 'M' + vbox/2 + ' ' + vbox/20 + 'A' + // starting point
    outer_circle  + ' ' + outer_circle + ' 0 0 1 ' +  // arc parameters
    (vbox/2 + Math.sin(theta) * (vbox/2 - padding)) + 
    ' ' + (vbox/2 - Math.cos(theta) * (vbox/2 - padding)) +    //  "    "
    'L' + (vbox/2 + Math.sin(theta) * inner_circle) + ' ' + 
     (vbox/2 - Math.cos(theta) * inner_circle) +     // line to inner circle
    'A' + inner_circle + ' ' + inner_circle + ' 0 0 0 ' +
    vbox/2 + ' ' + (vbox/2 - inner_circle) + 'Z';
 
console.log(touch_path);

// var dm_arc = draw.path( 'M100 10 A 90 90 0 0 1 190 100' +
//         'L 140 100 A 40 40 0 0 0 100 60 Z'
//         ).stroke({color: 'black', opacity: 1, width: 5 })
var dm_arc = draw.path(touch_path).stroke({color: 'black', opacity: 1, width: 5 })
// .fill('green').click(function() {console.log('cliqué vert');})
.fill(colors[0]).click(touchedNote) 
.style('cursor', 'pointer');
for (var i = 1; i < nb_keys ; i++) {
    console.log('itération: ', i);
   dm_arc.clone().rotate(-i * 360 / nb_keys, 100, 100).fill(colors[i]).click(touchedNote);
}
// dm_arc.clone().rotate(1 * 360 / nb_keys, 100, 100).fill('yellow').click(touchedNote);
// dm_arc.clone().rotate(2 * 360 / nb_keys, 100, 100).fill('blue').click(touchedNote);
// dm_arc.clone().rotate(3 * 360 / nb_keys, 100, 100).fill('red').click(touchedNote);
// dm_arc.clone().rotate(4 * 360 / nb_keys, 100, 100).fill('cyan').click(touchedNote);

draw.text('Simon').font({family: 'Impact', size: 12}).move(85, 67);

// svg switch
var toggleSwitch = draw.group();
toggleSwitch.text('OFF').font({family: 'Impact', size: 7}).move(-11, 0.5);
toggleSwitch.text('ON').font({family: 'Impact', size: 7}).move(21.5, 0.5);
toggleSwitch.rect(20, 10).radius(2).fill('gray');
var tip = toggleSwitch.group();
tip.rect(8, 8).radius(1).stroke({color:'darkblue', width: 1}).fill('blue').move(1,1);
var line = tip.line(3, 1, 3, 9).stroke({color: 'darkblue', opacity: 0.7, width: 1});
tip.use(line).move(2,0);
tip.use(line).move(4,0);
toggleSwitch.move(90, 120);
toggleSwitch.click(function() {
    var pos;
    if (tip.hasClass('on')) {
        pos = 0;
    } else {
        pos = 10;
    }
    tip.animate(100, '<', 0).move(pos, 0);
    tip.toggleClass('on');
});

// score
var scoreBox = draw.group();
scoreBox.rect(12, 12).radius(2).fill('#33060C').stroke({color: 'black', width: 1});
scoreBox.text('12').font({family: 'Helvetica', size: 8}).
stroke({color: 'red', width:0.5}).fill('red').move(1, 1.5);
scoreBox.text('count').font({size: 8}).move(-4, 12);
scoreBox.move(70, 94);

var startButton = draw.group();
startButton.circle(10).stroke({width: 2}).fill('red');
startButton.text('start').font({size: 8}).move(-2.5, 11);
startButton.move(95, 95);

var strictButton = draw.group();
strictButton.circle(2).stroke({width: 2}).move(4, -6);
strictButton.circle(10).stroke({width: 2}).fill('yellow');
strictButton.text('strict').font({size: 8}).move(-2.5, 11);
strictButton.move(118, 95);
