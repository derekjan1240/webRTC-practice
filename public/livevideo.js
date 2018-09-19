// Make connection 
// const socket = io.connect('http://localhost:5000'); 
var socket = io();

// Query DOM
let getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
let btn = document.getElementById('send'),
    videoA = document.getElementById('videoA'), // 攝影鏡頭即時畫面
    videoB = document.getElementById('videoB'), // 廣播畫面
    newone = document.getElementById('newone');

let webcamstream, streamRecorder;
let recordedChunks = [];

// Emit events
if(btn){
  btn.addEventListener('click', () => {
    socket.emit('readyStream'); 
  });

}

// Listen for events
socket.on('againStream', (data) => {
    // console.log('againStream!');
    socket.emit('readyStream');  
});

socket.on('news', (data) => {
    // console.log('news!',data)
    newone.innerHTML = data.userId;        
});

socket.on('startStream', (data) => {
  // console.log('startStream!');
  //判段是不是host
  if(videoA){
    getMedia();
  }
});

socket.on('showStream', (data) => {
    // console.log('showStream ing!')
    // videoB.srcObject = data;
    // console.log('Blob: ',new Blob([new Uint8Array(data)]))
    videoB.src = window.URL.createObjectURL(new Blob([new Uint8Array(data)]));

    recordedChunks =[];
    socket.emit('againStream');
});

function getMedia(){
  getUserMedia.call(navigator, {
        video: true,
        audio: true
    }, (localMediaStream) => {

        webcamstream = localMediaStream;

        startRecording();
        
        // 顯示攝影鏡頭即時畫面
        videoA.srcObject = localMediaStream;
        // videoA.src = window.URL.createObjectURL(localMediaStream);

        // videoA.onloadedmetadata = function(e) {
          // console.log("Label: " + localMediaStream.label);
          // console.log("AudioTracks" , localMediaStream.getAudioTracks());
          // console.log("VideoTracks" , localMediaStream.getVideoTracks());
        // };
    }, function(e) {
        console.log('Reeeejected!', e);
    });
}
   

function startRecording() {
  console.log('startRecording!');

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
  setTimeout(stopRecording, 5000);
}

function handleDataAvailable(event) {
  if (event.data.size > 0) {

    recordedChunks.push(event.data);
    // console.log('recordedChunks:',recordedChunks);

    let superBuffer = new Blob(recordedChunks,{type: 'video/webm'});
    // console.log('superBuffer:',superBuffer);

    postVideoToServer(superBuffer);

  } else {
    // ...
  }
}

function stopRecording() {
  // console.log('stopRecording!');
  streamRecorder.stop();
}

function postVideoToServer(superBuffer) {
  // console.log('postemit!')

  socket.emit('sendStream', {
    stream: superBuffer
  });  
}