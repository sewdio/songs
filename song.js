var currentSong;
var draggingPlayhead = false;

main()
function main(){
    fetch("./ressources/db.json")
    .then(response => response.json())
    .then(parsedJson => jsonParsed(parsedJson));

    var timeline = document.getElementById('timeline');
    timeline.addEventListener('mousedown', timelineMouseDown, false);
    window.addEventListener('mouseup', mouseUp, false);

    var playBtn = document.getElementById('play-btn');
    playBtn.addEventListener('click',playBtnClick);
    var volumeBtn = document.getElementById('volume-btn');
    volumeBtn.addEventListener('click',volumeBtnClick);

    var mainAudio = document.getElementById('main-audio');
    mainAudio.addEventListener('timeupdate',timeUpdate);
    mainAudio.addEventListener('playing',mainAudioPlaying);
    mainAudio.addEventListener('pause',mainAudioPaused);
}


// Utility for song specific webpage //

function getParams(param) {
	var vars = {};
	window.location.href.replace( location.hash, '' ).replace(
		/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
		function( m, key, value ) { // callback
			vars[key] = value !== undefined ? value : '';
		}
	);

	if ( param ) {
		return vars[param] ? vars[param] : null;
	}
	return vars;
}

function jsonParsed(json){
    var name = getParams('name');
    var song = document.getElementsByClassName('song')[0];
    var songJson = json.find(function(elt){return elt.name == name});
    song.innerHTML = makeSongHTML(songJson);
    song.setAttribute('data-src',songJson.audio_path);

    currentSong = song;

    initPlayer();

    var coverBox = document.getElementsByClassName('cover-box')[0];
    coverBox.addEventListener('click',function(){
        requestedSong = this.parentNode;
        togglePlay(requestedSong);
    });
}

function makeSongHTML(song){
    var html = "";

    const artwork = '<img class="artwork" src=./'+song.artwork_path+'>\n';
    const controlIcon = '<img class="control-icon"></div>\n';
    const coverBox = '<div class="cover-box">\n'+artwork+controlIcon+'</div>\n';

    const audio = '<audio class="audio" src='+song.audio_path+'></audio>\n';

    const name = '<div class="name">'+song.name+'</div>\n';
    const descBox = '<div class="desc-box">\n'+name+'</div>\n';

    return descBox+coverBox+audio;
}

// Utility //

function getAudio(song){
    return song.getElementsByClassName('audio')[0];
}
function getMainAudio(){
    return document.getElementById('main-audio');
}
function durationToMinSec(d){
    // add leading zeros and middle colon
    var min = ("0" + Math.trunc(d/60)).slice(-2);
    var sec = ("0" + Math.trunc(d%60)).slice(-2);
    return  min+":"+sec;
}
function getMouseXPercent(e, element){
    var bounds = element.getBoundingClientRect();
    var x = e.clientX - bounds.left;
    var pct = x * 100 / element.offsetWidth;
    // clip between 0 and 100
    pct = pct < 0 ? 0 : (pct > 100 ? 100 : pct);
    return pct;
}

// Audio Player

function initPlayer(){
    var mainAudio = getMainAudio();
    if(mainAudio.src)
        return;

    var song = document.getElementsByClassName('song')[0];

    mainAudio.src = song.dataset.src;
    mainAudio.load();

    songAudio = getAudio(song);
    songAudio.addEventListener('loadedmetadata',function(){
        var totalTime = document.getElementById('total-time');
        var duration = songAudio.duration;
        totalTime.innerHTML = durationToMinSec(duration);
    });
}

function playSong(song){
    getMainAudio().play();
    song.classList.add('playing');
}
function pauseSong(song){
    getMainAudio().pause();
    song.classList.remove('playing');
}
function updatePlayer(){
    var mainAudio = getMainAudio();
    var totalTime = document.getElementById('total-time');
    var currentSongDuration = getAudio(currentSong).duration;

    mainAudio.src = currentSong.dataset.src;
    totalTime.innerHTML = durationToMinSec(currentSongDuration);
    overviewBox.style.backgroundImage = 'url('+currentSongArtwork.src+')';
    overviewName.innerHTML = currentSongName.innerHTML;
}
function togglePlay(requestedSong){
    previousSong = currentSong;
    currentSong = requestedSong;
    if(previousSong && previousSong != currentSong){
        updatePlayer(currentSong)
        stopSong(previousSong);
        playSong(currentSong);
    }
    else if(getMainAudio().paused)
        playSong(currentSong);
    else
        pauseSong(currentSong);
}
function playBtnClick(){
    togglePlay(currentSong);
}
function volumeBtnClick(){
    var mainAudio = getMainAudio();
    if(mainAudio.muted){
        mainAudio.muted = false;
        this.classList.remove('muted');
    }
    else {
        mainAudio.muted = true;
        this.classList.add('muted');
    }
}
function timeUpdate(){
    var pct = 100 * (this.currentTime / this.duration);
	var progressbar = document.getElementById('progressbar');
    progressbar.style.width = pct + "%";

    var timePassed = document.getElementById('time-passed');
    var timePassedFormatted = durationToMinSec(this.currentTime);
    if(timePassed.innerHTML != timePassedFormatted)
        timePassed.innerHTML = timePassedFormatted;
}
function timelineMouseDown(){
    draggingPlayhead = true;
    var playhead = document.getElementById('playhead');
    playhead.classList.add('dragging');
    window.addEventListener('mousemove', movePlayhead);
    getMainAudio().removeEventListener('timeupdate', timeUpdate);
}
function mouseUp(e){
    if (draggingPlayhead) {
        var mainAudio = getMainAudio();

        // undo the classes changes from mouse down
        var playhead = document.getElementById('playhead');
        playhead.classList.remove('dragging');
        window.removeEventListener('mousemove', movePlayhead);
        mainAudio.addEventListener('timeupdate', timeUpdate);

        // move playhead and sync audio
        movePlayhead(e);
        var timeline = document.getElementById('timeline');
        var pct = getMouseXPercent(e, timeline);
        mainAudio.currentTime = mainAudio.duration * pct / 100;
        draggingPlayhead = false;
    }
}
function movePlayhead(e) {
    var timeline = document.getElementById('timeline');
    var pct = getMouseXPercent(e, timeline);
    var progressBar = document.getElementById('progressbar');
    progressBar.style.width = pct+'%';
}
function mainAudioPlaying(){
    var playBtn = document.getElementById('play-btn');
    playBtn.classList.add('paused');
}
function mainAudioPaused(){
    var playBtn = document.getElementById('play-btn');
    playBtn.classList.remove('paused');
}
