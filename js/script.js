console.log('lets write javascript');

let currentSong = new Audio()
let songs;
let currentFolder; //make it available for all

function convertToMinuteSecond(totalSeconds) {
    // Calculate minutes and seconds.
    if (totalSeconds < 0 || isNaN(totalSeconds)) {
        return "00:00"
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    // Format seconds to always be two digits.
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder
    // http://127.0.0.1:3000/
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text() //! in object form
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a") //return NOde collection
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }



    // show the all the song in play list
    let songUL = document.querySelector(".songList").querySelector("ul")
    songUL.innerHTML = ""
    for (const song of songs) {
        let name = song.replaceAll("%20", " ")
        songUL.innerHTML += `
                         <li>
                             <img class="invert" src="img/music.svg" alt="">
                             <div class="info">
                                 <div>${name}</div>
                                 <div>Ansh</div>
                             </div>
                             <div class="playnow">
                                 <span>Play Now</span>
                                 <img src="img/play.svg" class="invert" alt="">
                             </div>
                         </li>
         `
    }

    // Attach an Eventlistener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", () => {
            let music = e.querySelector(".info > div").innerHTML.trim()
            playMusic(music);
        })
    })

    return songs;
}


function playMusic(track, pause = false) {
    currentSong.src = `/${currentFolder}/${track}`
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = `<span> ${decodeURI(track)}</span>`
    document.querySelector(".songtime").innerHTML = ` 00:00 / 00:00`
}

async function displayAlbums() {
    let promise = await fetch("/songs")
    let response = await promise.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder_name = e.href.split('/').slice(-2)[0];  // slice return the array
            console.log(folder_name);
            let a = await fetch(`songs/${folder_name}/info.json`)
            let info_obj = await a.json()
            console.log(info_obj);

            document.querySelector(".cardContainer").innerHTML += `
            <div data-folder="${folder_name}" class="card ">
            <div class="play">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" fill="#1ed760" />
            <polygon points="30,50 50,70 70,50" fill="black"
            transform="translate(-10, 0) rotate(-90, 50, 50)" />
            </svg>
            </div>
            
            <img src="/songs/${folder_name}/cover.jpg" alt="">
            <h2>${info_obj.title}</h2>
            <p>${info_obj.description}</p>
            </div>
            `
        }
    }


    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (e) => {
            songs = await getSongs(`songs/${e.currentTarget.dataset.folder}`)
            playMusic(songs[0])

            if (screen.width <= 1400) {
                document.querySelector(".left").style.left = 0
            }
        })
    })

}

async function main() {
    //  get the list of songs
    await getSongs("songs/indian_songs") //default song
    playMusic(songs[0], true)

    // Display all the albums on the page

    displayAlbums();

    // Attach event listener in play/pause previous next
    //! with id we can directly give name no need to document.queryseleclt()..............
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        } else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeUpdate function

    currentSong.addEventListener("timeupdate", () => { //! jo currentSong no timeupdate thay to
        document.querySelector(".songtime")
            .innerHTML = `${convertToMinuteSecond(currentSong.currentTime)} / ${convertToMinuteSecond(currentSong.duration)}`

        document.querySelector('.circle').style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%` //simple math 

        if (currentSong.currentTime === currentSong.duration) {
            currentSong.currentTime = 0;
            currentSong.play()
        }
    })


    // Add an event listener to seekbar

    document.querySelector(".seekbar").addEventListener("click", e => {
        let total_width = e.target.getBoundingClientRect().width  //todo ===>  getboudingclientrect function give hum website pe kha pe hai
        let x = e.offsetX
        let percent = (x / total_width) * 100;
        document.querySelector(".circle").style.left = `${percent}%`

        currentSong.currentTime = (currentSong.duration * percent) / 100;

    })

    // Add an event listener to hamburger

    document.querySelector(".hamburger").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = 0
    })

    // Add an event listener for close 
    document.querySelector(".close").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = "-130%"
    })

    // Add an event listener in previous
    previous.addEventListener("click", e => {
        let index = songs.indexOf(currentSong.src.split(`/${currentFolder}/`)[1])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }

    })

    // Add an event listener in next
    next.addEventListener("click", e => {
        // console.log(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentSong.src.split(`/${currentFolder}/`)[1])

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => { //! because getElementsByTagName return array bhai
        console.log(`Volume set to    ${e.target.value} / 100`);
        currentSong.volume = parseInt(e.target.value) / 100;
    })


    document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click", (e) => {
        let inpTag = document.querySelector(".volume").getElementsByTagName("input")[0]
        if (currentSong.volume != 0) {
            e.target.src = "img/mute.svg"
            currentSong.volume = 0
            inpTag.value = 0
        } else {
            e.target.src = "img/volume.svg"
            currentSong.volume = 0.2
            inpTag.value = 20
        }
    })
}

main()


