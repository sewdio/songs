var currentSong;
var draggingPlayhead = false;

main();
function main(){
    var songs;
    fetch("./ressources/db.json")
    .then(response => response.json())
    .then(parsed => jsonParsed(parsed));

    var timeline = document.getElementById('timeline');
    timeline.addEventListener('mousedown', timelineMouseDown, false);
    window.addEventListener('mouseup', mouseUp, false);

    var playBtn = document.getElementById('play-btn');
    playBtn.addEventListener('click',playBtnClick);
    var volumeBtn = document.getElementById('volume-btn');
    volumeBtn.addEventListener('click',volumeBtnClick);

    var mainAudio = document.getElementById('main-audio');
    mainAudio.addEventListener('timeupdate',timeUpdate);
    mainAudio.addEventListener('ended',playNextSong);
    mainAudio.addEventListener('playing',mainAudioPlaying);
    mainAudio.addEventListener('pause',mainAudioPaused);
}

// Utility

function sortByKey(array, key, direction="ascending") {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
function addClassEventListener(classStr, eventStr, fn){
    var nodeList = document.getElementsByClassName(classStr);
    for(var i = 0; i < nodeList.length; i++){
       nodeList.item(i).addEventListener(eventStr, fn);
    }
}
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

// Json parse and html fill

function jsonParsed(json){
    var sorted = sortByKey(json, "date_created", "descending");
    fillSongList(sorted.reverse());
    initPlayer();
    addClassListeners();
}

function makeSongHTML(song){
    var html = "";

    const artwork = '<img class="artwork" src=./'+song.artwork_path+'>\n';
    const controlIcon = '<img class="control-icon"></div>\n';
    const coverBox = '<div class="cover-box">\n'+artwork+controlIcon+'</div>\n';

    const audio = '<audio class="audio" preload="none" src='+song.audio_path+'></audio>\n';

    const dateCreated = '<div class="date">'+song.date_created+'</div>\n';
    const duration = '<div class="duration">--:--</div>\n';
    const name = '<a class="name" href="song.html?name='+song.name+'">'+song.name+'</a>\n';
    const descBox = '<div class="desc-box">\n'+dateCreated+duration+name+'</div>\n';

    return coverBox+audio+descBox;
}
function fillSongList(songs){
    var songList = document.getElementById('song-list');
    songs.forEach(function(song){
        var div = document.createElement('div');
        div.className = "song";
        div.innerHTML = makeSongHTML(song);
        div.setAttribute('data-src',song.audio_path);
        songList.appendChild(div);
    })
}

function initPlayer(){
    var mainAudio = getMainAudio();
    if(mainAudio.src)
        return;

    var firstSong = document.getElementsByClassName('song')[0];
    currentSong = firstSong;
    firstSong.classList.add('active');
    mainAudio.src = firstSong.dataset.src;
    mainAudio.load();

    //add background image to overview
    var overviewBox = document.getElementById('overview-box');
    var firstSongArtwork = firstSong.getElementsByClassName('artwork')[0];
    overviewBox.style.backgroundImage = 'url('+firstSongArtwork.src+')';

    // add song name to overview
    var overviewName = document.getElementById('overview-name');
    var firstSongName = firstSong.getElementsByClassName('name')[0].innerHTML;
    overviewName.innerHTML = firstSongName;

    // add total duration to player
    firstSongAudio = getAudio(firstSong);
    firstSongAudio.addEventListener('loadedmetadata',function(){
        var totalTime = document.getElementById('total-time');
        var duration = firstSongAudio.duration;
        totalTime.innerHTML = durationToMinSec(duration);
    });
}

// Songs event listeners

function addClassListeners(){
    addClassEventListener('cover-box','click',coverBoxClick);
    addClassEventListener('audio','loadedmetadata',addSongDuration);
}

function stopSong(song){
    pauseSong(song);
    getMainAudio().currentTime = 0;
    song.classList.remove('active');
}
function playSong(song){
    getMainAudio().play();
    song.classList.add('active');
    song.classList.add('playing');
}
function pauseSong(song){
    getMainAudio().pause();
    song.classList.remove('playing');
}
function updateBannerBox(song){
    var mainAudio = getMainAudio();
    var totalTime = document.getElementById('total-time');
    var overviewBox = document.getElementById('overview-box');
    var overviewName = document.getElementById('overview-name');

    var currentSongDuration = getAudio(currentSong).duration;
    var currentSongArtwork = currentSong.getElementsByClassName('artwork')[0];
    var currentSongName = currentSong.getElementsByClassName('name')[0];

    mainAudio.src = currentSong.dataset.src;
    totalTime.innerHTML = durationToMinSec(currentSongDuration);
    overviewBox.style.backgroundImage = 'url('+currentSongArtwork.src+')';
    overviewName.innerHTML = currentSongName.innerHTML;
}
function togglePlay(requestedSong){
    previousSong = currentSong;
    currentSong = requestedSong;
    if(previousSong && previousSong != currentSong){
        updateBannerBox(currentSong)
        stopSong(previousSong);
        playSong(currentSong);
    }
    else if(getMainAudio().paused)
        playSong(currentSong);
    else
        pauseSong(currentSong);
}

function coverBoxClick(){
    requestedSong = this.parentNode;
    togglePlay(requestedSong);
}
function addSongDuration(){
    var song = this.parentNode;
    var durationNode = song.getElementsByClassName('duration')[0];
    durationNode.innerHTML = durationToMinSec(this.duration);
}

// Main event listeners

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

function playNextSong(){
    var nextSong = currentSong.nextSibling;
    if(nextSong)
        togglePlay(nextSong);
}
function mainAudioPlaying(){
    var playBtn = document.getElementById('play-btn');
    playBtn.classList.add('paused');
}
function mainAudioPaused(){
    var playBtn = document.getElementById('play-btn');
    playBtn.classList.remove('paused');
}
