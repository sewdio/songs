var currentSong;

main();
function main(){
    var songs;
    fetch("./ressources/db.json")
    .then(response => response.json())
    .then(parsed => sortByKey(parsed, "date_created", "descending"))
    .then(sorted => displaySongList(sorted.reverse()))
    .then(addListeners);

    var title = document.getElementById('title');
    title.addEventListener('click', titleClick);

    var timeline = document.getElementById('timeline');
    timeline.addEventListener('click', timelineClick);
}

function sortByKey(array, key, direction="ascending") {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
function displaySongList(songs){
    var songList = document.getElementById('song-list');
    songs.forEach(function(song){
        var div = document.createElement('div');
        div.className = "song";
        div.innerHTML = makeSongHTML(song);
        songList.appendChild(div);
    })
}
function makeSongHTML(song){
    var html = "";

    const artwork = '<img class="artwork" src=./'+song.artwork_path+'>\n';
    const controlIcon = '<img class="control-icon"></div>\n';
    const coverBox = '<div class="cover-box">\n'+artwork+controlIcon+'</div>\n';

    const audio = '<audio class="audio" src='+song.audio_path+'>\n</audio>';

    const dateCreated = '<div class="date">'+song.date_created+'</div>\n';
    const duration = '<div class="duration"></div>\n';
    const name = '<div class="name">'+song.name+'</div>\n';
    const descBox = '<div class="desc-box">\n'+dateCreated+duration+name+'</div>\n';

    return coverBox+audio+descBox;
}

function addClassEventListener(classStr, eventStr, fn){
    var nodeList = document.getElementsByClassName(classStr);
    for(var i = 0; i < nodeList.length; i++){
       nodeList.item(i).addEventListener(eventStr, fn);
    }
}
function addListeners(){
    addClassEventListener('cover-box','click',coverBoxClick);
    addClassEventListener('audio','ended',playNextSong);
    addClassEventListener('audio','loadedmetadata',addSongDuration);
}

function getAudio(song){
    return song.getElementsByClassName('audio')[0];
}
function stopSong(song){
    var audio = getAudio(song);
    pauseSong(song);
    audio.currentTime = 0;
    song.classList.remove('active');
}
function playSong(song){
    getAudio(song).play();
    getAudio(song).currentTime = 0;
    song.classList.add('active');
    song.classList.add('playing');
}
function pauseSong(song){
    var audio = getAudio(song);
    audio.pause();
    song.classList.remove('playing');
}
function togglePlay(requestedSong, previousSong = null){
    currentSong = requestedSong;
    if(previousSong && previousSong != currentSong){
        stopSong(previousSong);
        playSong(currentSong);
    }
    else if(getAudio(currentSong).paused)
        playSong(currentSong);
    else
        pauseSong(currentSong);
}

function coverBoxClick(){
    console.log('mouseup');
    var previousSong = currentSong;
    requestedSong = this.parentNode;
    togglePlay(requestedSong, previousSong);
}
function playNextSong(){
    var nextSong = this.parentNode.nextSibling;
    togglePlay(nextSong);
}
function addSongDuration(){
    // *this* is an audio node
    var song = this.parentNode;
    var durationNode = song.getElementsByClassName('duration')[0];
    var d = this.duration;
    durationNode.innerHTML = Math.trunc(d/60) +':'+ Math.trunc(d%60);
}

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
    var progressBar = document.getElementById('progress-bar');
    progressBar.style.width = pct+'%';
}
