// Init SpeechSynth API
const synth = window.speechSynthesis;

// DOM Elements
const textForm = document.querySelector('form');
const textInput = document.querySelector('#text-input');
const voiceSelect = document.querySelector('#voice-select');
const rate = document.querySelector('#rate');
const rateValue = document.querySelector('#rate-value');
const pitch = document.querySelector('#pitch');
const pitchValue = document.querySelector('#pitch-value');
const body = document.querySelector('body');
const dashboard = document.querySelector('#dashboard');

const pauseBtn = document.querySelector("#pauseBtn");
const resumeBtn = document.querySelector("#resumeBtn");
const stopBtn = document.querySelector("#stopBtn");

// Variables
var output = [];
var amIPaused;
var running = false;
var speakerState = "initialized";

//Browser identifier
// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';

// Chrome 1+
var isChrome = !!window.chrome && !!window.chrome.webstore;

// Init voices array
let voices = [];


const getVoices = () => {
    voices = synth.getVoices();

    // Loop through voices and create an option for each one
    voices.forEach(voice => {
        // Create option element
        const option = document.createElement('option');
        // Fill option with voice and language
        option.textContent = voice.name + '(' + voice.lang + ')';

        // Set needed option attributes
        option.setAttribute('data-lang', voice.lang);
        option.setAttribute('data-name', voice.name);
        voiceSelect.appendChild(option);
    });
};

getVoices();
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = getVoices;
}

//Fix for duplication, run code depending on the browser
if (isFirefox) {
    getVoices();
}
if (isChrome) {
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = getVoices;
    }
}

// Speak
const speak = (output, index) => {
    console.log("output: ", output);
    speakerState = "speaking";
    console.log("Speaker que: " + synth.pending);
    console.log("Speaker paused: " + synth.paused);
    console.log("Speaker speaking: " + synth.speaking);
    // Check if speaking
    if (synth.speaking) {
        console.error('Already speaking...');
        return;
    }
    if (output.length != 0) {
        console.log(output.length);
        console.log("Stevilka obvestila: " + index);
        // Add background animation
        dashboard.style.background = '#141414 url(img/wave.gif)';
        dashboard.style.backgroundRepeat = 'repeat-x';
        dashboard.style.backgroundSize = '100% 100%';

        // Get speak text

        console.log(output[index].Description);
        const speakText = new SpeechSynthesisUtterance(output[index].Description);

        // Speak end
        speakText.onend = e => {
            console.log('Done speaking...');
            body.style.background = '#141414';
            if (index < output.length) {
                index = index + 1;
                colorData(index);
                speak(output, index);
            }

        };

        // Speak error
        speakText.onerror = e => {
            console.error('Something went wrong');
        };

        // Selected voice
        const selectedVoice = voiceSelect.selectedOptions[0].getAttribute(
            'data-name'
        );

        // Loop through voices
        voices.forEach(voice => {
            if (voice.name === selectedVoice) {
                speakText.voice = voice;
            }
        });

        // Set rate
        speakText.rate = rate.value;

        // Speak
        synth.speak(speakText);
        console.log("Speaker que: " + synth.pending);
        console.log("Speaker paused: " + synth.paused);
        console.log("Speaker speaking: " + synth.speaking);


    }
};

// EVENT LISTENERS

// Text form submit
textForm.addEventListener('submit', e => {
    console.log("running: ", running);
    console.log("get traffic");
    if (!running) {
        running = true;
        fetchTrafficData();
    }

    e.preventDefault();


});

function fetchTrafficData() {
    console.log("Fetching traffic inforamtion");
    fetch('https://opendata.si/promet/events/?lang=en')
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            JSON.stringify(myJson.Contents[0].Data);
            var prometniPodatki = myJson.Contents[0].Data.Items;
            prometniPodatki.forEach(function (element, key) {
                output.push(element);
                if (key == prometniPodatki.length - 1) {
                    displayInformation(output);
                }
            })
        });
}

function displayInformation(output) {
    var table = document.getElementById("trafficTable");
    table.classList.remove("d-none");
    output.forEach(function (news, key) {
        var table = document.getElementById("myTable");


        var tr = document.createElement("tr");
        var td = document.createElement("td");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        var td3 = document.createElement("td");

        td.innerHTML = key + 1;
        td1.innerHTML = news.Title;
        td2.innerHTML = news.Description;
        td3.innerHTML = news.IsRoadClosed;

        tr.appendChild(td);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);

        table.appendChild(tr);

        if (key == output.length - 1) {
            colorData(0);
            speak(output, 0);
        }
    });
}

function colorData(index) {

    if (index == 0) {
        var tableBody = document.getElementById("myTable");
        var row = tableBody.rows[index];
        row.classList = "bg-danger";
    } else {
        var tableBody = document.getElementById("myTable");
        var row = tableBody.rows[index];
        var row1 = tableBody.rows[index - 1];
        row.classList = "bg-danger";
        row1.classList = "bg-dark";
    }
}


// Rate value change
rate.addEventListener('change', e => (rateValue.textContent = rate.value));

// Pause audio 
pauseBtn.addEventListener("click", function (e) {

    synth.pause();
    amIPaused = synth.paused;
    console.log("Komanda pavza: " + amIPaused);
    dashboard.style.background = '#141414';
    speakerState = "paused"


    e.preventDefault();
})

// Resume audio 
resumeBtn.addEventListener("click", function (e) {
    console.log("resume: " + amIPaused);

    synth.resume();
    speakerState == "speaking"
    dashboard.style.background = '#141414 url(img/wave.gif)';
    dashboard.style.backgroundRepeat = 'repeat-x';
    dashboard.style.backgroundSize = '100% 100%';


    e.preventDefault();
})


// Voice select change
voiceSelect.addEventListener('change', e => speak());