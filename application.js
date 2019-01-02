var currentSong;

main();
function main(){
    var songs;
    fetch("./ressources/db.json")
    .then(response => response.json())
    .then(parsed => sortByKey(parsed, "date_created", "descending"))
    .then(function(sorted){
        songs = sorted.reverse();
        displaySongList(songs);
        displaySongList(songs);
        displaySongList(songs);
    })
    .then(addListeners);

    document.getElementById('title').addEventListener('click', function(){
        scroll(0,0);
    });
}

function sortByKey(array, key, direction="ascending") {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
function displaySongList(songs){
    var songlist = document.getElementById('songlist');
    songs.forEach(function(song){
        var div = document.createElement('div');
        div.className = "song";
        div.innerHTML = makeSongHTML(song);
        songlist.appendChild(div);
    })
}
function makeSongHTML(song){
    var html = "";

    const artwork = '<img class="artwork" src=./'+song.artwork_path+'>\n';
    const controlIcon = '<img class="control-icon"></div>\n';
    const coverBox = '<div class="cover-box">\n'+artwork+controlIcon+'</div>\n';

    const audio = '<audio class="audio" src='+song.audio_path+'>\n</audio>';

    const name = '<span class="title">'+song.name+'</span>\n';
    const dateCreated = '<span class="date">'+song.date_created+'</span>';
    const descBox = '<div class="desc-box">\n'+dateCreated+name+'</div>\n';

    return coverBox+audio+descBox;
}

function addClassEventListener(classStr, eventStr, fn){
    var nodeList = document.getElementsByClassName(classStr);
    for(var i = 0; i < nodeList.length; i++)
    {
       nodeList.item(i).addEventListener(eventStr, fn);
    }
}

function addListeners(){
    addClassEventListener('cover-box','click',coverBoxClick);
    addClassEventListener('cover-box','mouseover',coverBoxHover);
    addClassEventListener('cover-box','mouseleave',coverBoxLeave);
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
    var previousSong = currentSong;
    requestedSong = this.parentNode;
    togglePlay(requestedSong, previousSong);
}
function coverBoxHover(){
    var song = this.parentNode;
    song.classList.add('selected');
}
function coverBoxLeave(){
    var song = this.parentNode;
    song.classList.remove('selected');
}

function playNextSong(){
    var nextSong = this.parentNode.nextSibling;
    togglePlay(nextSong);
}

function addSongDuration(){
    var song = this.parentNode;
}
