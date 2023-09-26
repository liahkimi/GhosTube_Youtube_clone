const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls  = document.getElementById("videoControls");



//global variable
let volumeValue = 0.5;
video.volume = volumeValue; //js에 한번더 설정

let controlsTimeout = null;

let controlsMovementTimeout = null; 



//play&pause btn
const handlePlayClick = (e) => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
  };

//mute&unmute btn
    const handleMuteClick = (e) => {
    if(video.muted){
        video.muted = false;
    }else{
        video.muted = true;
    }
    muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : volumeValue;
};

//volume range 조절 기능
const handleVolumeChange = (event) => {
    const { 
        target: {value},
     } = event;
    //음소거였던 상태에서, range 올리면 Mute버튼으로 바뀌게하기
    if(video.muted){
        video.muted = false;
        muteBtn.innerText = "Mute";
    }
    //글로벌 변수 volumeValue값 업뎃
    volumeValue = Number(value); //볼륨상태 업뎃
    video.volume = value;

    if (volumeValue === 0) {
        video.muted = true;
        muteBtn.innerText = "Unmute";
        }
}

const formatTime = (seconds) => 
  new Date(seconds * 1000).toISOString().substring(14, 20);

//비디오 상태바 기능
const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);//비디오 상태바 max길이 설정
}

//현재시간 실시간 업데이트
const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime); //비디오 상태바 실시간 이동
}

//타임라인 바로 비디오 조정하기
const handleTimelineChange = (event) => {
 const {target : {value},
} = event;
video.currentTime = value;//비디오 타임 세팅
}


//큰화면 보여주기
const handleFullScreen = () => {
  const fullscreen = document.fullscreenElement;
  //fullscreen일때, => 작은화면으로 돌아가고 + enter full screen btn 보여야함
  if(fullscreen){
    document.exitFullscreen();//작은화면으로 돌아가기
    fullScreenIcon.classList = "fas fa-expand";
  }else{
    videoContainer.requestFullscreen();//fullscreen 만들어주기
    fullScreenIcon.classList = "fas fa-compress";//작은화면으로 돌아가는 버튼 보이기
  }
};


const hideControls = () => videoControls.classList.remove("showing");

//mouse move
//1.controlsTimeout과 controlsMovementTimeout의 값을 전역으로 null로 기본값을 찍어줬기 때문에, 
//맨처음 handleMouseMove 함수로 진입했을 때 if (controlsTimeout) 조건문과 if (controlsMovementTimeout) 조건문은 지나치게 됨
const handleMouseMove = () => {
  //4.마우스가 비디오 위로 3초내에 다시 올라온다면, 다시 handleMouseMove함수 다시 읽게됨
  //5.3번에서 발생된 각각의 controlsMovementTimeout/Timeout 변수에 값이 할당되어 있으므로(= true) 각각의 if 조건문을 실행하게 됨.

  //6.setTimeout 동작 캔슬과 동시에 다시 null값 재부여(=초기화)
  if(controlsTimeout){
    clearTimeout(controlsTimeout); 
    controlsTimeout = null;
  }
  /*
  7.setTimeout 동작 캔슬과 동시에 다시 null값 재부여(=초기화)
  = 마우스가 움직이는 현상을 1초 단위 따위의 프레임이 이어진 것으로 생각하면 편함.
  8. 이때, 비디오 위에서 마우스가 이탈하지 않고 계속 움직인다면 똑같이 1번이 실행될 것이며, 
  마우스 커서의 위치가 변화(=움직일 때)할 때마다 if (controlsMovementTimeout) 조건문이 발동되어 값을 초기화시키고, 
  그 아래 setTimeout() 함수가 이어서 실행되면서 새로운 value를 할당시키고, 또 커서의 위치가 변화하면 if문으로 돌아가 값을 지우고 setTimeout이 새 값을 할당하고... 
  무한 반복됨  => 마우스 움직일 대마다, 오래된 timeout을 취소하고, 새로운 timeout을 만들고 반복한다.
  */
  if(controlsMovementTimeout){
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing"); //2.video 위로 마우스 움직이는 즉시, showing 클래스 추가되고
  controlsMovementTimeout = setTimeout(hideControls, 3000)
  //3.3초짜리 showing을 지우는 타이머 시작시키며,이때 발생된 id 숫자값을 controlsMovementTimeout 변수에 할당시켜줌
};

//mouser leave
const handleMouseLeave = () =>{
  controlsTimeout = setTimeout(hideControls, 3000);
};

//스페이스바로 재생/일시정지 제어
const handleKeydown = (event) => {
  console.log(event);
  if (event.code === "Space") {
  handlePlayClick();
   event.preventDefault();//스페이스바를 누르면 브라우저가 아래로 스크롤 되는 것을 방지하기 위해
  }
  };

//클릭으로 재생/일시정지 제어
const handleVideoClickPlay = () => {
  handlePlayClick();
  }

playBtn.addEventListener("click",handlePlayClick);
muteBtn.addEventListener("click",handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadeddata", handleLoadedMetadata);
video.addEventListener("timeupdate",handleTimeUpdate);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click",handleFullScreen);
document.addEventListener("keydown", handleKeydown);
video.addEventListener("click", handleVideoClickPlay);

