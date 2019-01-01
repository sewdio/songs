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
    const artwork = '<img src=./'+song.artwork_path+' class="artwork">\n';
    const controlIcon = '<div class="control-icon"></div>\n';
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
    addClassEventListener('artwork','click',togglePlay);
    addClassEventListener('control-icon','click',togglePlay);
    addClassEventListener('artwork','mouseenter',styleArtworkSelected);
    addClassEventListener('artwork','mouseleave',unstyleArtworkSelected);
    addClassEventListener('control-icon','mouseenter',styleArtworkSelected);
    addClassEventListener('control-icon','mouseleave',unstyleArtworkSelected);
    addClassEventListener('audio','ended',audioEnded);
}

function getAudio(song){
    return song.getElementsByClassName('audio')[0];
}
function getArtwork(song){
    return song.getElementsByClassName('artwork')[0];
}
function getControlIcon(song){
    return song.getElementsByClassName('control-icon')[0];
}

function updateControlIcon(song){
    var controlIcon = getControlIcon(song);
    if(getAudio(song).paused){
        controlIcon.classList.remove('pause');
        controlIcon.classList.add('play');
    }
    else{
        controlIcon.classList.remove('play');
        controlIcon.classList.add('pause');
    }
}

function togglePlay(){
    var previousSong = currentSong;
    currentSong = this.parentNode.parentNode;
    if(previousSong && previousSong != currentSong){
        stopSong(previousSong);
        playSong(currentSong);
    }
    else if(getAudio(currentSong).paused)
        playSong(currentSong);
    else{
        pauseSong(currentSong);
    }
    updateControlIcon(currentSong);
}
function stopSong(song){
    var audio = getAudio(song);
    audio.pause();
    audio.currentTime = 0;
    song.classList.remove('selected');
}
function playSong(song){
    getAudio(song).play();
    getAudio(song).currentTime = 60;
    song.classList.add('selected');
    updateControlIcon(song);
}
function pauseSong(song){
    var audio = getAudio(song);
    audio.pause();
}

function styleArtworkSelected(){
    var song = this.parentNode.parentNode;
    getArtwork(song).classList.add('selected');
    updateControlIcon(song);
}
function unstyleArtworkSelected(){
    var song = this.parentNode.parentNode;
    getArtwork(song).classList.remove('selected');
    getControlIcon(song).classList.remove('play');
    getControlIcon(song).classList.remove('pause');
}

function audioEnded(){
    this.parentNode.classList.remove('selected');
}
