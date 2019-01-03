var currentSong;

main();
function main(){
    var songs;
    fetch("./ressources/db.json")
    .then(response => response.json())
    .then(parsed => jsonParsed(parsed));

    var title = document.getElementById('title');
    title.addEventListener('click', titleClick);

    var timeline = document.getElementById('timeline');
    timeline.addEventListener('click', timelineClick);

    var playBtn = document.getElementById('play-btn');
    playBtn.addEventListener('click',playBtnClick);

    var mainAudio = document.getElementById('main-audio');
    mainAudio.addEventListener('timeupdate',timeUpdate);
    mainAudio.addEventListener('ended',playNextSong);
    mainAudio.addEventListener('playing',mainAudioPlaying);
    mainAudio.addEventListener('pause',mainAudioPaused);
}

// Json parse and html fill

function jsonParsed(json){
    var sorted = sortByKey(json, "date_created", "descending");
    fillSongList(sorted.reverse());
    initPlayer();
    addListeners();
}

function sortByKey(array, key, direction="ascending") {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
function makeSongHTML(song){
    var html = "";

    const artwork = '<img class="artwork" src=./'+song.artwork_path+'>\n';
    const controlIcon = '<img class="control-icon"></div>\n';
    const coverBox = '<div class="cover-box">\n'+artwork+controlIcon+'</div>\n';

    const dateCreated = '<div class="date">'+song.date_created+'</div>\n';
    const duration = '<div class="duration"></div>\n';
    const name = '<div class="name">'+song.name+'</div>\n';
    const descBox = '<div class="desc-box">\n'+dateCreated+duration+name+'</div>\n';

    return coverBox+descBox;
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
}

// Songs event listeners

function addClassEventListener(classStr, eventStr, fn){
    var nodeList = document.getElementsByClassName(classStr);
    for(var i = 0; i < nodeList.length; i++){
       nodeList.item(i).addEventListener(eventStr, fn);
    }
}
function addListeners(){
    addClassEventListener('cover-box','click',coverBoxClick);
    addClassEventListener('audio','loadedmetadata',addSongDuration);
}

function getMainAudio(){
    return document.getElementById('main-audio');
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
function togglePlay(requestedSong, previousSong = null){
    currentSong = requestedSong;
    if(previousSong && previousSong != currentSong){
        getMainAudio().src = currentSong.dataset.src;
        stopSong(previousSong);
        playSong(currentSong);
    }
    else if(getMainAudio().paused)
        playSong(currentSong);
    else
        pauseSong(currentSong);
}

function coverBoxClick(){
    var previousSong = currentSong;
    requestedSong = this.parentNode;
    togglePlay(requestedSong, previousSong);
}
function addSongDuration(){
    // *this* is an audio node
    var song = this.parentNode;
    var durationNode = song.getElementsByClassName('duration')[0];
    var d = this.duration;
    durationNode.innerHTML = Math.trunc(d/60) +':'+ Math.trunc(d%60);
}

// Main event listeners

function titleClick(){
    scroll(0,0);
}

function getMouseXPercent(e, element){
    var bounds = element.getBoundingClientRect();
    var x = e.clientX - bounds.left;
    var pct = x * 100 / e.currentTarget.offsetWidth;
    return pct;
}
function timelineClick(e){
    var pct = getMouseXPercent(e, this);
    var progressBar = document.getElementById('progressbar');
    progressBar.style.width = pct+'%';
    var mainAudio = getMainAudio();
    mainAudio.currentTime = pct*mainAudio.duration/100;
}

function playBtnClick(){
    togglePlay(currentSong);
}

function timeUpdate() {
    var pct = 100 * (this.currentTime / this.duration);
	var progressbar = document.getElementById('progressbar');
    progressbar.style.width = pct + "%";
}
function playNextSong(){
    var nextSong = currentSong.parentNode.nextSibling;
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
