(function ($) {
    const synth = window.speechSynthesis;
    let voices = [];
    const debug = true;


    // -- DEBUG FUNCTIONS -- //
    function buildDebugVoiceList() {
        for(let i = 0; i < voices.length; i++) {
            let option = "<option data-lang=\"voices[i].lang\" data-name=\"" + voices[i].name + "\" value=\""+ voices[i].name +"\">" + voices[i].name + " (" + voices[i].lang + ")" + "</option>";
            $("#debugVoiceList").append(option);
        }
    }

    function debugSpeak(){
        console.log(voices);
        let SpeakText = new SpeechSynthesisUtterance("Hello, My name is Ben!");
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
        }
    }

    $(document).ready(init);
}(jQuery));