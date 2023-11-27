// var WebSocketServer = require('ws').Server;
const http = require('http');
const fs = require('fs');
const path = require('path');

global.sseCli = new Array();

let net = require('net');

function debugHeaders(req) {
   console.log('URL: ' + req.url);
   for (let key in req.headers) {
      console.log(key + ': ' + req.headers[key]);
   }
}

function loadPhase() {
   try {
      fs.accessSync(path.join(__dirname, 'curPhase.json'), fs.constants.R_OK)
      let arr = new Array();
      arr.push(JSON.parse(fs.readFileSync(path.join(__dirname, 'prePhase.json')).toString()));
      arr.push(JSON.parse(fs.readFileSync(path.join(__dirname, 'curPhase.json')).toString()));
      return JSON.stringify(arr);
   } catch (err) {
      // console.error('No Read access : ' + err);
   }
}


let client = new net.Socket()
//let client = net.connect(TCPoptions, async () => { // TCP 접속
function Connect(){
   console.log('TCP CONNECT Try....');
       client.connect(TCPoptions, async () => { // TCP 접속
      //console.log('net.connect');
   })

   client.on('connect', function () { //TCP연결성공
      console.log('connect soucess');
      //인증시작
      client.write( Buffer.from('FEFF00090030000000330A' ,'hex') );
      // client.write( Buffer.from('FEFF0009002A000000330C' ,'hex') );
   });

   client.on('close', function () { //TCP연결 종료
      //console.log('good BYE~');

      setTimeout(() => {
         client.removeAllListeners('connect') // the important line that enables you to reopen a connection
         client.removeAllListeners('close') // the important line that enables you to reopen a connection
         client.removeAllListeners('error') // the important line that enables you to reopen a connection
         Connect()
      }, 5000)
   });

   client.on('error', function () {
      //console.log(`socket error`);
      // setTimeout(() => {
      //    client.removeAllListeners() // the important line that enables you to reopen a connection
      //    Connect()
      // }, 5000)
   });
}

function TCPsend(buffer) {
   client.write(buffer) //데이터 전송(send)
}


module.exports = { 
   client : client,
   tcp : async function() {
      Connect();
      let lcStat = new Array();
      let totalLcStat = new Object();

      http.createServer(function(req, res) { // SSE 서버 열기 :80
         debugHeaders(req);
         if (req.headers.accept && req.headers.accept == 'text/event-stream') {
            if (req.url == '/events') {
               let cliIP = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) + ':' + (req.headers['x-forwarded-port'] || req.socket.remotePort)
               let id = (new Date()).toLocaleTimeString();
               req.on('close',()=>{
                  console.error(cliIP + ' sse cli closed')
                  delete sseCli[cliIP];
               })

               res.writeHead(200, {
                  'Content-Type': 'text/event-stream',
                  'Cache-Control': 'no-cache',
                  'Connection': 'keep-alive',
                  'Access-Control-Allow-Origin': '*'
               });

               

               constructSSE(res, id, loadPhase(),'prePhase')
               constructSSE(res, id, loadPhase(),'preStat')
               if (tfdtStat.length) {
                  setTimeout(()=>{
                     console.log('tfdtStat', tfdtStat)
                     tfdtStat.forEach((v,i)=>{
                        responseSSE(res, id, v, 'tfdtStatus');
                     })
                  }, 1500)
               }
               
               sseCli[cliIP] = ({res : res, req : req.socket.remoteAddress});
            } else {
               res.writeHead(404);
               res.end();
            }
         }
      }).listen(SSEport);
      // this.client.on('data', async function (data) {
         
      //    // console.log(Object.keys(sseCli)) //클라이언트 정보
         
      // });
      // setInterval(()=>{
      //    savePhase();
      // }, 600*1.5)
   },
   //TCP 업다운로드 패킷 전송 부분
   makeit : function (lcno, _opcode, id, param) {
      function final (array) {
         let leng = array[0] == 0xFE ? 2 : 1;
         array.splice(2, leng, ...numToBytes((array.length - 2), leng));
         let checkSum = 0;
         for(i=2; i < array.length-1; i++) {
            checkSum ^= array[i]
         }
         array[array.length -1 ] = checkSum;
         if (leng == 2) {
            LogWrite(logInfo,'tcp req :');
            LogWrite(logDebug,Buffer.from(array, 'hex'));
         }
         return array
      }
   
      function wrapit(_opcode, id, param) {
         let STX_CHAR = [0x7E, 0x7E];
         let LENGTH = 0;
         let INTERSECTION_ID = id ? id : 0x00;
         let OPCODE = _opcode;
         let LRC_CODE = 0;
         
         let arr = param ? 
         [...STX_CHAR, LENGTH, INTERSECTION_ID, OPCODE, ...param, LRC_CODE]
         : [...STX_CHAR, LENGTH, INTERSECTION_ID, OPCODE, LRC_CODE]
         return final(arr)
      }   
      let STX = [0xFE, 0xFF];
      let LENGTH = [0, 0];
      let RESULT = 0x00;
      let OPCODE = 0x40;
      let LCNO = numToBytes(lcno, 4);
      let ATS_REQ = wrapit(_opcode, id, param);
      let LRC_CODE = 0;

      let arr = [...STX, ...LENGTH, RESULT, OPCODE, ...LCNO, ...ATS_REQ, LRC_CODE]
      const finalV = final(arr);
      TCPsend(Buffer.from(finalV, 'hex'));
      return finalV
   }//FE FF 00 0F 00 40 00 00 27 0F / 7E 7E 04 00 A2 A6 / 67
}

function numToBytes (num, byte) { //toBytesInt32
   if(byte == 1) {
      arr = new Uint8Array([
         (num & 0x000000ff)
      ]);
   } else if(byte == 2) {
      arr = new Uint8Array([
         (num & 0x0000ff00) >> 8,
         (num & 0x000000ff)
      ]);
   } else if(byte == 4) {
      arr = new Uint8Array([
         (num & 0xff000000) >> 24,
         (num & 0x00ff0000) >> 16,
         (num & 0x0000ff00) >> 8,
         (num & 0x000000ff)
      ]);
   }
   return Buffer.from(arr.buffer,'hex');
}


// function toBuffer(a,b ,ab) {
//    //var buf = Buffer.alloc(ab.byteLength);
//    var view = new Uint8Array(ab);
//    for (var i = 0; i < ab.byteLength; ++i) {
//       a[b+i] = view[i];
//    }
// }

// let stx2 = parseInt('11111110',2).toString(16); //254
// let stx1 = 0xFE;
// let stx = Buffer.from('FE','hex')
// let stx2 = 0xFF; //254
// let stx2 = 0xFF.toString(16); //254
// let buf2 = Buffer.alloc(17);

// let buf2 = Buffer.alloc(17);
// let index = 0;
// buf2[index++] = stx1
// buf2[index++] = stx2

// let len = numTo2bytes(15);
// toBuffer(buf2,index,len)
// index += 2;
// buf2[index++] = 0x01;
// buf2[index++] = 0x40;
// let lcno = numTo4bytes(9999);
// toBuffer(buf2,index,lcno)
// index += 4;
// console.log(stx2)
// console.log(buf2)

// let buf = Buffer.from('FEFF000F0040 0000270F 7E7E0400A2A6 67', 'hex');
// let buf = buf2;
// console.log(buf)

// console.log(buf.toString('hex'))
// console.log(JSON.stringify(buf))