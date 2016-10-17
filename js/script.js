var Simon = (function() {
    "use strict";
    var self = {};


    // variables privées
    var setting = {
        nb_key: 4,
        difficulty: 20
    };
    song = "";
    lengthPlayed = 0;


    // méthodes publiques
   
    self.playNote = function(notePlayed) { 
        // note just keyed
        // return scores {rightOne, actual, highest}
    };
   
    self.init = function(setting) {
        // if (typeof setting === 'undefined') {
        console.log(setting);
        if (lengthPlayed) {
            alert('This will reset the current game');
        }
    };
    
    self.playNote = function() { };
    self.playNote = function() { };

    // méthodes privées
    generateSong = function(len) {
    };

});

var Media = (function() {
    var self = {};
    
    // variables privées
    var colors = ['blue', 'red', 'yellow', 'green'];
    var playBackLength = '1000'; // lenght of playback tone for each note
   
    // méthodes publiques
    self.playBackOne = function(note) {
    };

})(jQuery);
