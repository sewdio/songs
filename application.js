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
    .then(addControlListeners);

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
    const audio = '<audio class="player" src='+song.audio_path+'>\n</audio>';
    const name = '<p class="title">'+song.name+'</p>\n';
    const dateCreated = '<p class="date">'+song.date_created+'</p>';
    return coverBox+audio+name+dateCreated;
}

function addClassEventListener(classStr, eventStr, fn){
    var nodeList = document.getElementsByClassName(classStr);
    for(var i = 0; i < nodeList.length; i++)
    {
       nodeList.item(i).addEventListener(eventStr, fn);
    }
}

function addControlListeners(){
    addClassEventListener('artwork','click',togglePlay);
    addClassEventListener('control-icon','click',togglePlay);
    addClassEventListener('artwork','mouseenter',styleArtworkSelected);
    addClassEventListener('artwork','mouseleave',unstyleArtworkSelected);
    addClassEventListener('control-icon','mouseenter',styleArtworkSelected);
    addClassEventListener('control-icon','mouseleave',unstyleArtworkSelected);
}

function getPlayer(song){
    return song.getElementsByClassName('player')[0];
}
function getArtwork(song){
    return song.getElementsByClassName('artwork')[0];
}
function getControlIcon(song){
    return song.getElementsByClassName('control-icon')[0];
}

function updateControlIcon(song){
    var controlIcon = getControlIcon(song);
    if(getPlayer(song).paused){
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
    else if(getPlayer(currentSong).paused)
        playSong(currentSong);
    else{
        pauseSong(currentSong);
    }
    updateControlIcon(currentSong);
}
function stopSong(song){
    var player = getPlayer(song);
    player.pause();
    player.currentTime = 0;
    song.classList.remove('selected');
}
function playSong(song){
    getPlayer(song).play();
    song.classList.add('selected');
    updateControlIcon(song);
}
function pauseSong(song){
    var player = getPlayer(song);
    player.pause();
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
