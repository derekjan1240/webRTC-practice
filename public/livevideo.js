// Make connection 
// const socket = io.connect('http://localhost:5000'); 
var socket = io();
let who;

// Query DOM
let getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
let btn = document.getElementById('send'),
    videoA = document.getElementById('videoA'), // 攝影鏡頭即時畫面
    videoB = document.getElementById('videoB'), // 廣播畫面
    newone = document.getElementById('newone');

let webcamstream, streamRecorder;
let recordedChunks = [];

socket.on('news', (data) => {
  // console.log('news!',data)
  newone.innerHTML = data.userId;        
});

//identify the role of client 
if(videoA){
  who = 'host';
}else{
  who = 'audience';
}

if(who === 'host'){

  if(btn){
    btn.addEventListener('click', () => {
      socket.emit('readyStream'); 
    });
  }

  socket.on('startStream', (data) => {
    console.log('startStream!');
    getMedia();
  });

  socket.on('againStream', (data) => {
    console.log('againStream!');
    socket.emit('readyStream');  
  });

} 


socket.on('showStream', (data) => {

  console.log('showStream ing!');
  videoB.src = window.URL.createObjectURL(new Blob([new Uint8Array(data)]));
  
  //Reset recordedChunks
  recordedChunks =[];

  if(who === 'host'){
    socket.emit('againStream');
  }

});

function getMedia(){
  getUserMedia.call(navigator, {
        video: true,
        audio: true
    }, (localMediaStream) => {

        webcamstream = localMediaStream;

        startRecording();
        
        // 顯示攝影鏡頭即時畫面(直播主)
        videoA.srcObject = localMediaStream;

    }, function(e) {
        console.log('Reeeejected!', e);
    });
}
   
function startRecording() {
  console.log('startRecording!');
  
  //設定格式
  let options = {mimeType: 'video/webm;'};

  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    options = {mimeType: 'video/webm; codecs=vp9'};
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
     options = {mimeType: 'video/webm; codecs=vp8'};
  } else {
    console.log('options wrong')
  }

  //設定錄影
  streamRecorder = new MediaRecorder(webcamstream, options);
  streamRecorder.ondataavailable = handleDataAvailable;

  //開始錄影
  streamRecorder.start();
  //設定每段錄影長度
  setTimeout(stopRecording, 5000);
}

function stopRecording() {
  // console.log('stopRecording!');
  streamRecorder.stop();
}

function handleDataAvailable(event) {
  if (event.data.size > 0) {

    recordedChunks.push(event.data);
    // console.log('recordedChunks:',recordedChunks);

    let superBuffer = new Blob(recordedChunks,{type: 'video/webm'});
    // console.log('superBuffer:',superBuffer);

    postVideoToServer(superBuffer);
  }
}

function postVideoToServer(superBuffer) {
  // console.log('postemit!')
  socket.emit('sendStream', {
    stream: superBuffer
  });  
}