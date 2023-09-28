import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

//전역 변수들
let stream;
let recorder;
let videoFile;


//다운로드
const handleDownload = async() => {

    const ffmpeg = createFFmpeg({ log: true });//ffmpeg의 인스턴스 &  {log:true}는 무슨일이 벌어지고 있는지 콘솔로 보여지게 하기 위함
    
    //1.ffmpeg소프트웨어 로드
    await ffmpeg.load();//유저가 js가 아닌 다른 소프트웨어를 설치해서 코드를 사용할꺼라서 load함(우리 웹사이트에서 유저가 다른 소프트웨어 사용)
    //유저의 브라우저(컴퓨터)를 사용하는 상황임을 잊지 말기! => 처리할 부분 없음

    //2.ffmpeg에 파일 만들기
    ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));//.FileSystem(method, filename, await binaryData function)

    //3.input명령어 사용 : 가상컴퓨터에 이미 존재하는 recording.webm파일을 input으로 받고, mp4로 변환하는 명령어
    await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4"); // "-r", "60" = 영상을 초당 60프레임으로 인코딩해주는 명령어(액션영화같이 더 빠른 영상 인코딩을 가능하게 해줌)

    const a = document.createElement("a");//링크 생성
    a.href = videoFile;//비디오파일로 갈 수 있는 url과 연결된 링크
    a.download = "MyRecording.webm"//다운로드 속성 추가하기 & .webm이라는 확장자로 다운되게 하기
    document.body.appendChild(a);//링크를 body태그 내부의 맨 뒤에 위치하게 함
    a.click();//유저가 링크(a)를 클릭한 것처럼 자동으로 다운로드 됌
}

//녹화 중지
const handleStop = () => {
    startBtn.innerText = "Download Recording";
    startBtn.removeEventListener("click", handleStop);
    startBtn.addEventListener("click", handleDownload);
    recorder.stop();//ondataavailable 이벤트리스너 감지
}


//녹화 시작
const handleStart = () => {
    startBtn.innerText = "Stop Recording";
    startBtn.removeEventListener("click", handleStart);
    startBtn.addEventListener("click", handleStop);
    //받아온 stream으로 new MediaRecorder 이벤트핸들러생성해주기
    recorder = new MediaRecorder(stream);//MediaRecorder.ondataavailable = ondataavailable 이벤트의 이벤트핸들러
    //ondataavailable 이벤트리스너
    recorder.ondataavailable = (event) => { //ondataavailable 이벤트 = MediaRecorder.stop()이 실행될 때 발생하는 이벤트(녹화가 멈추면 발생되는 event)
        videoFile = URL.createObjectURL(event.data) //event.data = 비디오 file
        //createObjectURL= URL을 만든게 아니라, 브라우저의 메모리 상에 파일을 저장해두고, 브라우저가 그 파일에 접근할 수 있는 URL을 준다.
        video.srcObject = null;//미리보기화면에 설정한 stream값 없애기
        video.src = videoFile;//비디오파일을 src값으로 넣어주기
        video.loop = true;//반복재생되게 하기
        video.play();//자동 플레이
    };
    recorder.start();
};


//녹화 미리보기 화면
const init = async( ) => {
    stream = await navigator.mediaDevices.getUserMedia({ //getUserMedia = mediaDevices라는 객체의 function으로 마이크,카메라와 같은 미디어 장비들에 접근하게 함
    //stream = 어딘가에 넣어둘 0과 1로 이루어진 데이터 (실시간으로 재생되는 무언가)
    //카메라가 stream을 받아오고, 그걸 video 요소에 담아주는 방식
        audio: false,
        video: true
    });
    video.srcObject = stream;//stream이 object라서 src대신 srcObject에 담아줌
    video.play();//비디오 재생
};

init();

startBtn.addEventListener("click", handleStart)
