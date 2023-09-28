import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

//전역 변수들
let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a"); //html에 링크 생성
  a.href = fileUrl; //비디오파일로 갈 수 있는 url과 연결된 링크
  a.download = fileName; //다운로드 속성 추가하기 & .webm이라는 확장자로 다운되게 하기
  document.body.appendChild(a); //링크를 body태그 내부의 맨 뒤에 위치하게 함
  a.click(); //유저가 링크(a)를 클릭한 것처럼 자동으로 다운로드 됌
};

//다운로드
const handleDownload = async () => {
  //다운로드 된 뒤, 버튼의 변화
  actionBtn.removeEventListener("click", handleDownload); //버튼을 누르면 함수가 작동된 뒤, eventlistener기능이 사라짐
  actionBtn.innerText = "Transcoding..";
  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({ log: true }); //ffmpeg의 인스턴스 &  {log:true}는 무슨일이 벌어지고 있는지 콘솔로 보여지게 하기 위함

  //1.ffmpeg소프트웨어 로드
  await ffmpeg.load(); //유저가 js가 아닌 다른 소프트웨어를 설치해서 코드를 사용할꺼라서 load함(우리 웹사이트에서 유저가 다른 소프트웨어 사용)
  //유저의 브라우저(컴퓨터)를 사용하는 상황임을 잊지 말기! => 처리할 부분 없음

  //2.ffmpeg에 파일 만들기
  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile)); //.FileSystem(method, filename, await binaryData function)

  //3.input명령어 사용 : 가상컴퓨터에 이미 존재하는 recording.webm파일을 input으로 받고, mp4로 변환하는 명령어
  await ffmpeg.run("-i", files.input, "-r", "60", files.output); // "-r", "60" = 영상을 초당 60프레임으로 인코딩해주는 명령어(액션영화같이 더 빠른 영상 인코딩을 가능하게 해줌)

  //7.썸네일 따기
  //7-1.-ss명령어 : 영상의 특정 시간대로 가게 해줌 & -frames:v, 1 명령어 : 이동한 시간의 스크린샷 1장을 찍어줌
  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  );

  //4.readFile명령어 사용 : mp4 파일 가져오기
  const mp4File = ffmpeg.FS("readFile", files.output);
  //7-2.thumbFile 읽기
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  //console.log(mp4File);//=>Unit8Array(8bit의 양수 array)타입의 파일 배열 반환
  //console.log(mp4File.buffer);//=>binary data에 접근하기 위해 buffer사용=>buffer은 ArrayBuffer 반환=영상을 나타내는 bytes의 배열
  //=>결론: binary data를 쓰고 싶은면 buffer을 쓰자

  //5.blob 생성하기
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  //7-3 thumbFile blob 생성
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  //6.mp4 url 만들기
  const mp4Url = URL.createObjectURL(mp4Blob);
  //7-4.thumbFile url 만들기
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  //요기서 브라우저 보안정책으로 에러남 => 추후 해결하기!
  //다운로드 후, 파일 연결 끊기
  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);
  //다운로드 후, url 연결끊기
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStart);
};

// //녹화 중지
// const handleStop = () => {
//   actionBtn.innerText = "Download Recording";
//   actionBtn.removeEventListener("click", handleStop);
//   actionBtn.addEventListener("click", handleDownload);
//   recorder.stop(); //ondataavailable 이벤트리스너 감지
// };

//녹화 시작
const handleStart = () => {
  // actionBtn.innerText = "Stop Recording";
  actionBtn.innerText = "Recording";
  actionBtn.disabled = true;
  actionBtn.removeEventListener("click", handleStart);
  // actionBtn.addEventListener("click", handleStop);
  //받아온 stream으로 new MediaRecorder 이벤트핸들러생성해주기
  recorder = new MediaRecorder(stream); //MediaRecorder.ondataavailable = ondataavailable 이벤트의 이벤트핸들러
  //ondataavailable 이벤트리스너
  recorder.ondataavailable = (event) => {
    //ondataavailable 이벤트 = MediaRecorder.stop()이 실행될 때 발생하는 이벤트(녹화가 멈추면 발생되는 event)
    videoFile = URL.createObjectURL(event.data); //event.data = 비디오 file
    //createObjectURL= URL을 만든게 아니라, 브라우저의 메모리 상에 파일을 저장해두고, 브라우저가 그 파일에 접근할 수 있는 URL을 준다.
    video.srcObject = null; //미리보기화면에 설정한 stream값 없애기
    video.src = videoFile; //비디오파일을 src값으로 넣어주기
    video.loop = true; //반복재생되게 하기
    video.play(); //자동 플레이
    actionBtn.innerText = "Download";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload);
  };
  recorder.start();
  setTimeout(() => {
    recorder.stop();
  }, 5000);
};

//녹화 미리보기 화면
const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    //getUserMedia = mediaDevices라는 객체의 function으로 마이크,카메라와 같은 미디어 장비들에 접근하게 함
    //stream = 어딘가에 넣어둘 0과 1로 이루어진 데이터 (실시간으로 재생되는 무언가)
    //카메라가 stream을 받아오고, 그걸 video 요소에 담아주는 방식
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });
  video.srcObject = stream; //stream이 object라서 src대신 srcObject에 담아줌
  video.play(); //비디오 재생
};

init();

actionBtn.addEventListener("click", handleStart);
