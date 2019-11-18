(function ($) {
    const synth = window.speechSynthesis;
    let voices = [];
    const debug = false;

    const AI_players = 15;
    let players;
    let names = [];
    let alias = [];

    let turn = null;
    let SpeakText;


    // -- GAME FUNCTIONS -- //


    function setupNewGame(){

        //TODO: debug only, remove this later..
        //$("#next").off().on('click', nextTurn);

        names = buildPlayerNamesList(AI_players);
        alias = buildPlayerAliasList(AI_players);

        let player_name = window.prompt("Hello, what is your name","Player");
        let player_alias = window.prompt("Please type in your alias(name) for players to guess","Alias");

        players = [{index:0, eliminated:false, name: player_name, alias: player_alias}];

        for (let i=1; i < AI_players + 1; i++)
        {
            players.push({'index':i, eliminated:false, 'name':names[i - 1], 'alias':alias[i - 1], 'voice':voices[Math.floor(Math.random() * voices.length)], 'pitch':(Math.random() * 0.2) + 0.9, 'rate':(Math.random() * 0.2) + 0.9});
        }

        alias.push(player_alias);
        buildPlayerCircle();

        turn = Math.floor(Math.random() * players.length);
        let listString = "";

        // List speak all the aliases..
        alias.forEach(function(ele, index){
            listString += ele + ". ";
        });

        console.log({listString});

        SpeakText = new SpeechSynthesisUtterance(listString);
        SpeakText.lang = 'en-US';
        SpeakText.voice = voices[0];
        SpeakText.pitch = 1;
        SpeakText.rate = 1;
        synth.speak(SpeakText);

        SpeakText.onend = function(){
            SpeakText = null;
            nextTurn();
        };

    }

    function nextTurn(){
        const player = players[Math.floor(Math.random() * players.length)];
        const guess_name = player.name;
        const guess_alias_index = Math.floor(Math.random() * alias.length );
        const guess_alias = alias[guess_alias_index];

        console.log({alias});

        console.log("Turn:" + turn);

        $(".player").removeClass("current");

        if(turn === 0){
            console.log("Player Turn");
            playerGuess();
            return;
        }

        if(players[turn].eliminated) {
            console.log("Player has been eliminated. Next Person.");
            turn = ((turn + 1) >= AI_players) ? 0 : turn + 1;
            nextTurn();
            return;
        }

        if(player.index === turn){
            console.log("A.I Picked self.");
            nextTurn();
            return;
        }

        if(player.eliminated){
            console.log("Picked a player that has been eliminated.");
            nextTurn();
            return;
        }


        // update graphics..
        $(".player[data-player-index="+ turn +"]").addClass("current");

        // ask question..
        SpeakText = new SpeechSynthesisUtterance(guess_name + ",are you," + guess_alias + "?");
        SpeakText.lang = 'en-US';
        SpeakText.voice = players[turn].voice;
        SpeakText.pitch = players[turn].pitch;
        SpeakText.rate = players[turn].rate;

        // wait for speech to finish
        synth.speak(SpeakText);

        SpeakText.onend = function(){
            SpeakText = null;
            let answer = "No, Sorry";
            let correct = false;

            if(player.alias === guess_alias){
                answer = "Yes, Congratulations";
                correct = true;
                alias.splice(guess_alias_index, 1);
            }

            if(player.index === 0){
                if(correct) {
                    alert("Someone guessed your alias.. sorry :(");
                    setupNewGame();
                    return;
                }

                turn = (turn === AI_players) ? 0 : turn + 1;
                nextTurn();
                return;
            }


            SpeakText = new SpeechSynthesisUtterance(answer);
            SpeakText.lang = 'en-US';
            SpeakText.voice = player.voice;
            SpeakText.pitch = player.pitch;
            SpeakText.rate = player.rate;
            synth.speak(SpeakText);

            SpeakText.onend = function(){
                SpeakText = null;
                if (!correct) {
                    turn = (turn === AI_players) ? 0 : turn + 1;
                }else{
                    $(".player[data-player-index="+ player.index +"]").addClass("eliminated");
                    player.eliminated = true;
                }

                nextTurn();
            };
        };
    }

    function playerGuess(){
        $('.player').not(".eliminated").not(".human").off().on('click', function(){
            const opt = $(this).attr("data-player-index");
            const guess = window.prompt("Who do you think this player is?");
            let answer = "No, Sorry";
            let correct = false;
            let player = players[opt];

            if (player.alias.toLowerCase() === guess.toLowerCase()) {
                $(this).addClass("eliminated");
                player.eliminated = true;
                answer = "Yes, Congratulations";
                correct = true;
                alias_index = alias.indexOf(player.alias.toLowerCase());
                alias.splice(alias_index);
            }

            SpeakText = new SpeechSynthesisUtterance(answer);
            SpeakText.lang = 'en-US';
            SpeakText.voice = player.voice;
            SpeakText.pitch = player.pitch;
            SpeakText.rate = player.rate;
            synth.speak(SpeakText);

            SpeakText.onend = function(){
                SpeakText = null;
                if (!correct) {
                    turn++;
                    nextTurn();
                }else{
                    playerGuess();
                }
            };
        });
    }

    function buildPlayerCircle() {
        var radius = 160;
        var container = $('#players'),
            width = container.width(),
            height = container.height(),
            angle = 0;

        $("#players").empty();

        for (let i=0; i < players.length; i++)
        {
            if(i === 0){
                $("#players").append("<div class=\"player human\" data-player-index=\"" + players[i].index + "\" title=\"" + players[i].name + "\">" + players[i].name.charAt(0) + "</div>");
            }else {
                $("#players").append("<div class=\"player\" data-player-index=\"" + players[i].index + "\" title=\"" + players[i].name + "\">" + players[i].name.charAt(0) + "</div>");
            }
        }

        let $players = $('.player');
        let step = (2*Math.PI) / $players.length;

        $players.each(function() {
            var x = Math.round(width/2 + radius * Math.cos(angle) - $(this).width()/2);
            var y = Math.round(height/2 + radius * Math.sin(angle) - $(this).height()/2);

            $(this).css({
                left: x + 'px',
                top: y + 'px'
            });
            angle += step;
        });
    }

    function buildPlayerNamesList(numberOfPlayers){
        let list = [];
        let names = [
            'Ben',
            'Alex',
            'Josh',
            'Romeo',
            'Steph',
            'Dan',
            'Bronwen',
            'Weijia',
            'Zhouzen',
            'Paulo',
            'Nicole',
            'Edward',
            'Justin',
            'Kat',
            'Holly',
            'Jillian',
            'John',
            'A.J',
            'Eric',
            'Ashley',
            'Tao',
            'Joel',
            'Cuong',
            'Ivan',
            'Ania',
            'James',
            'Fred',
            'George',
            'Bill',
            'Henry',
            'Ann',
            'Audrey',
            "Angela",
        ];

        for (let i=0; i < numberOfPlayers; i++) {
            list.push(names.splice(Math.random() * names.length, 1)[0]);
        }

        return list;
    }

    function buildPlayerAliasList(numberOfPlayers){
        let list = [];
        let names = [
            "3D Waffle",
            "Hightower",
            "Papa Smurf",
            "57 Pixels",
            "Hog Butcher",
            "Pepper Legs",
            "101",
            "Houston",
            "Pinball Wizard",
            "Accidental Genius",
            "Hyper",
            "Pluto",
            "Alpha",
            "Jester",
            "Pogue",
            "Airport Hobo",
            "Jigsaw",
            "Prometheus",
            "Bearded Angler",
            "Joker's Grin",
            "Psycho Thinker",
            "Beetle King",
            "Judge",
            "Pusher",
            "Bitmap",
            "Junkyard Dog",
            "Riff Raff",
            "Blister",
            "K-9",
            "Roadblock",
            "Bowie",
            "Keystone",
            "Rooster",
            "Bowler",
            "Kickstart",
            "Sandbox",
            "Breadmaker",
            "Kill Switch",
            "Scrapper",
            "Broomspun",
            "Kingfisher",
            "Screwtape",
            "Buckshot",
            "Kitchen",
            "Sexual Chocolate",
            "Bugger",
            "Knuckles",
            "Shadow Chaser",
            "Cabbie",
            "Lady Killer",
            "Sherwood Gladiator",
            "Candy Butcher",
            "Liquid Science",
            "Shooter",
            "Capital F",
            "Little Cobra",
            "Sidewalk Enforcer",
            "Captain Peroxide",
            "Little General",
            "Skull Crusher",
            "Celtic Charger",
            "Lord Nikon",
            "Sky Bully",
            "Cereal Killer",
            "Lord Pistachio",
            "Slow Trot",
            "Chicago Blackout",
            "Mad Irishman",
            "Snake Eyes",
            "Chocolate Thunder",
            "Mad Jack",
            "Snow Hound",
            "Chuckles",
            "Mad Rascal",
            "Sofa King",
            "Commando",
            "Manimal",
            "Speedwell",
            "Cool Whip",
            "Marbles",
            "Spider Fuji",
            "Cosmo",
            "Married Man",
            "Springheel Jack",
            "Crash Override",
            "Marshmallow",
            "Squatch",
            "Crash Test",
            "Mental",
            "Stacker of Wheat",
            "Crazy Eights",
            "Mercury Reborn",
            "Sugar Man",
            "Criss Cross",
            "Midas",
            "Suicide Jockey",
            "Cross Thread",
            "Midnight Rambler",
            "Swampmasher",
            "Cujo",
            "Midnight Rider",
            "Swerve",
            "Dancing Madman",
            "Mindless Bobcat",
            "Tacklebox",
            "Dangle",
            "Mr. 44",
            "Take Away",
            "Dark Horse",
            "Mr. Fabulous",
            "Tan Stallion",
            "Day Hawk",
            "Mr. Gadget",
            "The China Wall",
            "Desert Haze",
            "Mr. Lucky",
            "The Dude",
            "Digger",
            "Mr. Peppermint",
            "The Flying Mouse",
            "Disco Thunder",
            "Mr. Spy",
            "The Happy Jock",
            "Disco Potato",
            "Mr. Thanksgiving",
            "The Howling Swede",
            "Dr. Cocktail",
            "Mr. Wholesome",
            "Thrasher",
            "Dredd",
            "Mud Pie Man",
            "Toe",
            "Dropkick",
            "Mule Skinner",
            "Toolmaker",
            "Drop Stone",
            "Murmur",
            "Tough Nut",
            "Drugstore Cowboy",
            "Nacho",
            "Trip",
            "Easy Sweep",
            "Natural Mess",
            "Troubadour",
            "Electric Player",
            "Necromancer",
            "Turnip King",
            "Esquire",
            "Neophyte Believer",
            "Twitch",
            "Fast Draw",
            "Nessie",
            "Vagabond Warrior",
            "Flakes",
            "New Cycle",
            "Voluntary",
            "Flint",
            "Nickname Master",
            "Vortex",
            "Freak",
            "Nightmare King",
            "Washer",
            "Gas Man",
            "Night Train",
            "Waylay Dave",
            "Glyph",
            "Old Man Winter",
            "Wheels",
            "Grave Digger",
            "Old Orange Eyes",
            "Wooden Man",
            "Guillotine",
            "Old Regret",
            "Woo Woo",
            "Gunhawk",
            "Onion King",
            "Yellow Menace",
            "High Kingdom Warrior",
            "Osprey",
            "Zero Charisma",
            "Highlander Monk",
            "Overrun",
            "Zesty Dragon",
            "Zod",
        ];

        for (let i=0; i < numberOfPlayers; i++) {
            list.push(names.splice(Math.random() * names.length, 1)[0]);
        }

        return list;
    }




    // -- DEBUG FUNCTIONS -- //

    function buildDebugVoiceList() {
        for(let i = 0; i < voices.length; i++) {
            let option = "<option data-lang=\"voices[i].lang\" data-name=\"" + voices[i].name + "\" value=\""+ voices[i].name +"\">" + voices[i].name + " (" + voices[i].lang + ")" + "</option>";
            $("#debugVoiceList").append(option);
        }
    }

    function debugSpeak(){
        console.log(voices);
        SpeakText = new SpeechSynthesisUtterance("Hello, My name is Ben!");
        let selectedOption = $('#debugVoiceList').find(":selected").attr('data-name');

        for(let i = 0; i < voices.length ; i++) {
            if(voices[i].name === selectedOption) {
                SpeakText.voice = voices[i];
                console.log(voices[i]);
            }
        }

        SpeakText.pitch = $("#pitch").val();
        SpeakText.rate = $("#rate").val();

        console.log({selectedOption, 'voice':SpeakText.voice, 'pitch':SpeakText.pitch, 'rate':SpeakText.rate});

        synth.speak(SpeakText);
    }

    function launchDebugMenu() {
        $("#debugMenu").show();
    }

    function init() {
        voices = synth.getVoices();

        if (debug) {
            buildDebugVoiceList();
            $("#testVoice").on('click', debugSpeak);
            launchDebugMenu();
        }else{
            $("#start").off().on('click', setupNewGame);
        }
    }

    $(document).ready(init);
}(jQuery));