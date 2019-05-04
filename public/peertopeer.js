 // var socket = io.connect('http://localhost:4200');
 var socket = io();
 var configuration = {
     iceServers: [
         {urls: "stun:23.21.150.121"},
         {urls: "stun:stun.l.google.com:19302"}
     ]
 };

 var pc;

 // run start(true) to initiate a call
 function start(isCaller) {
     pc = new RTCPeerConnection(configuration);

     // send any ice candidates to the other peer
     pc.onicecandidate = function (evt) {
         console.log('emit candidate');
         socket.emit('candidate', {"candidate": evt.candidate});
     };
     // once remote stream arrives, show it in the remote video element
     pc.ontrack = function (evt) {
         console.log("add remote stream");
         console.log("evt:", evt);
         remoteView.srcObject = evt.streams[0];
         console.log('evt.streams: ', evt.streams);
     };

     // get the local stream, show it in the local video element and send it
     navigator.mediaDevices.getUserMedia({"audio": true, "video": true}).then((stream) => {
                 console.log("start streaming");
                 console.log(stream);

                 selfView.srcObject = stream;
                 
                 pc.addStream(stream);

                 if (isCaller){
                     pc.createOffer().then((desc)=>  gotDescription(desc));
                     console.log('emit sdp 1');
                 }
                 else{
                     pc.createAnswer().then((desc)=> gotDescription(desc));
                     console.log('emit sdp 2');
                 }

                 function gotDescription(desc) {
                     pc.setLocalDescription(desc);
                     socket.emit('sdp', {"sdp": desc});
                 }
             }
     );

     // console.log('pc: ', pc);
 }

 call.addEventListener('click', ()=> {
     console.log('webrtc start');
     start(true);
 });

 socket.on('msg', function (data) {
     console.log(data);
     if (!pc)
         start(false);
     if (data.sdp)
         pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
     else if (data.candidate)
         pc.addIceCandidate(new RTCIceCandidate(data.candidate));
 });

 socket.on('news', (data) => {
 // console.log('news!',data)
 newone.innerHTML = data.userId;        
 });