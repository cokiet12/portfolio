let tcp = require('./tcp');
// let index = require('./index');
let fs = require('fs');
const path = require('path');
let fetch = require('node-fetch');

let prePhase = new Object();
let curPhase = new Object();

function savePhase() {
  if (Object.keys(curPhase).length) {
     fs.writeFile(path.join(__dirname, 'curPhase.json'), JSON.stringify(curPhase), 'utf8', (err)=>{
        if (err) {
           cs.error(err)
        } else {
           console.log('curPhase save succeed')
        }
     })
  }
  if (Object.keys(prePhase).length) {
    //  console.error(Object.keys(prePhase).length)
     fs.writeFile(path.join(__dirname, 'prePhase.json'), JSON.stringify(prePhase), 'utf8', (err)=>{
        if (err) {
           cs.error(err)
        } else {
           console.log('prePhase save succeed')
        }
     })
  }
}

function loadTfdt() { //검지기 파일 전체 리턴
  try {
     fs.accessSync(path.join(__dirname, 'tfdt.json'), fs.constants.R_OK)
     return JSON.parse(fs.readFileSync(path.join(__dirname, 'tfdt.json')).toString());
  } catch (err) {
     console.error('No Read access TFDT : ' + err);
     return err;
  }
}

function saveTfdt(tfdt) { //검지기 파일 전체 받아서 해당 lc검지기 삽입 후 저장
  if (Object.keys(tfdt).length) {
     fs.writeFile(path.join(__dirname, 'tfdt.json'), JSON.stringify(tfdt), 'utf8', (err)=>{
        if (err) {
           console.error(err)
           return err;
        } else {
           console.log('tfdt save succeed')
        }
     })
  }
}

/* 프로토콜 정의 */
//충작
function Struct_MProtocol() {
  // 헤더 - 제어 ~ WAS 
  let STX1_M = 0xFE; //1byte
  let STX2_M = 0xFF; //1byte 
  let DATA_LEN_M = 0;//2byte un short 
  let RESULT_VALUE_M = 0;//1byte 결과값
  let OPCODE_M = 0;//1byte 오피코드
  let LCNO_M = 0;//4byte lcno
  let BODY_M = new Array();// body
  let CHECKSUM_M = 0; // 1 byte CHECKSUM
}

function MProtocol() {
  // 헤더 - 제어 ~ WAS 
  var Protocol = new Struct_MProtocol();
  Protocol.STX1_M = 0xFE; //1byte
  Protocol.STX2_M = 0xFF; //1byte 
  Protocol.DATA_LEN_M = 0;//2byte un short 
  Protocol.RESULT_VALUE_M = -1;//1byte 결과값
  Protocol.OPCODE_M = 0;//1byte 오피코드
  Protocol.LCNO_M = -1;//4byte lcno
  Protocol.BODY_M = new Array();// body
  Protocol.CHECKSUM_M = 0; // 1 byte CHECKSUM
  return Protocol;
}

function Struct_SProtocol() {
  // 제어기 ~ 통신 
  let STX1_S;
  let STX2_S;
  let DATA_LEN_S;
  let LCNO_S;
  let OPCODE_S;
  let BODY_S = new Array();// body
  let CHECKSUM_S;
}
function SProtocol() {
  var Protocol = new Struct_MProtocol();
  // 제어기 ~ 통신 
  Protocol.STX1_S = 0x7E; //1. 1byte
  Protocol.STX2_S = 0x7E; //2. 1byte 
  Protocol.DATA_LEN_S = 0; //3. 1byte 
  Protocol.LCNO_S = 0; // 4. lcno
  Protocol.OPCODE_S = 0; // 5. 1byte
  Protocol.BODY_S = new Array();// body
  Protocol.CHECKSUM_S = 0; //7. 1byte
  return Protocol;
}

function Struct_DevProtocol() {
  // 헤더 - 제어 ~ WAS 
  let STX1_S = 0xFE; //1byte
  let STX2_S = 0xFF; //1byte 
  let DATA_LEN_S = 0;//2byte un short 
  let DIR_S = 0;//1byte 결과값
  let OPCODE_S = 0;//1byte 오피코드
  let BODY_S = new Array();// body
  let CHECKSUM_S = 0; // 2 byte CHECKSUM
}

function DeviceProtocol() {
  var DevProtocol = new Struct_DevProtocol();
  // 제어기 ~ 통신 
  DevProtocol.STX1_S = 0x7E; //1. 1byte
  DevProtocol.STX2_S = 0x7E; //2. 1byte 
  DevProtocol.DATA_LEN_S = 0; //3. 1byte 
  DevProtocol.DIR_S = 0; // 4. 1byte
  DevProtocol.OPCODE_S = 0; // 5. 1byte
  DevProtocol.BODY_S = new Array();// body
  DevProtocol.CHECKSUM_S = 0; //7. 1byte
  return DevProtocol;
}

let M_MIN_LEN = 11;
let S_MIN_LEN = 6;

//OPCODE 정의
let OP_M_DEFAULT = 0x40; //신호제어기 관련 프로토콜
let OP_M_DEFAULT_RSP = 0x41;
let OP_M_SIGNAL_UPDATE_REQ = 0x42; //신호제어 업데이트 
let OP_M_SIGNAL_UPDATE_RSP = 0x43; //신호제어 업데이트 응답



function TFDT_INFO() {
  let TFDT_DETECTOR = Array.from({ length: 32 }, (v, i) => 0);
  let TFDT_DETECTOR_UNOCCUP = Array.from({ length: 32 }, (v, i) => 0);
  let TFDT_DETECTOR_OCCUP = Array.from({ length: 32 }, (v, i) => 0);
  let TFDT_DETECTOR_TRAFFIC = Array.from({ length: 32 }, (v, i) => 0);
  let TFDT_DETECTOR_SATRUATION = Array.from({ length: 32 }, (v, i) => 0);
  let TFDT_DETECTOR_SATRUATION_RATE = Array.from({ length: 32 }, (v, i) => 0);
  let TFDT_DETECTOR_SATRUATION_OCCUP_TIME = Array.from({ length: 32 }, (v, i) => 0);
}

function TFDT_CONFIG() {
  let TFDT_DETECTOR_CONFIG = Array.from({ length: 32 }, (v, i) => 0);
  for (let j = 0; j < TFDT_DETECTOR_CONFIG.length; j++) {
    TFDT_DETECTOR_CONFIG[j] = Array.from({ length: 7 }, (v, i) => 0);
  }
  return TFDT_DETECTOR_CONFIG;
}


// function responseSSE(res, id, data, type) {
//   console.log(type)
//   res.write('id: ' + id + '\n');
//   res.write('event: ' + type + '\n');
//   if (typeof data != 'string') { data = JSON.stringify(data) }
//   data.split('\n').forEach((v, i, d) => {
//     if (i != d.length - 1) {
//       res.write("data: " + v + '\n');
//     } else {
//       res.write("data: " + v + '\n\n');
//     }
//   })
// }

tcp.client.on('data', function (data) {
  console.log('데이타오는지')
  console.log(data)
  
  queueObj.enqueue(data);
  return;
  if (data.length < M_MIN_LEN) {
    //최소길이 적합성
    return;
  }

  var mProtocol = new MProtocol();
  let index = 0;

  if (mProtocol.STX1_M == data[index] && mProtocol.STX2_M == data[index + 1]) {
    //STX 시작 확인 여부
    index += 2;
  }
  else {
    return;
  }

  mProtocol.DATA_LEN_M = bytesToNum(data, index, index + 2); index += 2;

  if (mProtocol.DATA_LEN_M + 2 != data.length) {
    //길이 적합성 여부
    return;
  }
  mProtocol.RESULT_VALUE_M = data[index++];
  mProtocol.OPCODE_M = data[index++];
  mProtocol.LCNO_M = bytesToNum(data, index, index + 4); index += 4;
  if ((mProtocol.DATA_LEN_M + 2) - M_MIN_LEN > 0) {
    //바디체크
    mProtocol.BODY_M = data.slice(index, data.length - 1);

    index += (data.length - 1);
  }
  mProtocol.CHECKSUM_M = data[index];

  switch (mProtocol.OPCODE_M) {
    case OP_M_DEFAULT:
      //console.error('40 제어기 :')
      //console.error(data)
      //제어서버 || 제어기 확인
      /*
      for (i in sseCli) 
      {
        let v = sseCli[i];
        let id = (new Date()).toLocaleTimeString();
        let lcno = bytesToNum(data, 6, 10);
        let _data;
        let type;
          //제어기 데이타
          console.log('2. 제어기 응답')
          console.log(data)
          let lcdt = data.slice(14, data.length - 1);
          console.log(lcdt)
          type = 'lcRes';
          _data = `{
                      "ticketno" : ${data[13]},
                      "data" : {
                          "1" : [${sliceByte(lcdt[1], 1,3,1,2,1)}],
                          "2" : [${sliceByte(lcdt[2], 4,4)}],
                          "3" : [${sliceByte(lcdt[3], 8)}],
                          "4" : [${sliceByte(lcdt[4])}],
                          "5" : [${sliceByte(lcdt[5], 8)}],
                          "6" : [${sliceByte(lcdt[6], 8)}],
                          "7" : [${sliceByte(lcdt[7], 8)}],
                          "8" : [${sliceByte(lcdt[8], 8)}],
                          "9" : [${sliceByte(lcdt[9], 8)}],
                          "10" : [${sliceByte(lcdt[10], 8)}],
                          "11" : [${sliceByte(lcdt[11], 8)}],
                          "12" : [${sliceByte(lcdt[12], 8)}],
                          "13" : [${sliceByte(lcdt[13], 8)}],
                          "14" : [${sliceByte(lcdt[14], 1,1,1,5)}],
                          "15" : [${sliceByte(lcdt[15], 2,1,1,3,1)}],
                          "16" : [${sliceByte(lcdt[16], 8)}],
                          "17" : [${sliceByte(lcdt[17], 8)}],
                          "18" : [${sliceByte(lcdt[18], 1,1,2,2,2)}],
                          "19" : [${sliceByte(lcdt[19], 2,3,3)}]
                        }
                    }`
          //fe ff 00 28 f0 40 00 00 27 0f / 7e 7e 1d 01 a3 01 01 01 22 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 9d b0
        
        responseSSE(v.res, id, _data, type);
      }
      
      LogWrite(logTrace, "0x40 | OP_M_DEFAULT_REQ : ", data);
      for (i in sseCli) //??
      {
        let v = sseCli[i];
        let id = (new Date()).toLocaleTimeString();

        MainBodySignalParser(v, id, mProtocol, mProtocol.LCNO_M);
      }*/
	  let id = (new Date()).toLocaleTimeString();
	  LogWrite(logTrace, "0x40 | OP_M_DEFAULT_REQ : ", data);
	  MainBodySignalParser(id , mProtocol, mProtocol.LCNO_M);
      break;
    case OP_M_DEFAULT_RSP: //41
      LogWrite(logTrace, "0x41 | OP_M_DEFAULT_RSP : ", data);
      let lcno = bytesToNum(data, 6, 10);
      let _data = bytesToNum(data[10]);

      let type = 'ctlRes';
      for (i in sseCli) {
        let v = sseCli[i];
        let id = (new Date()).toLocaleTimeString();
        responseSSE(v.res, id, _data, type);
      }

      break;
  }
});

function MainBodySignalControlParserCVIB(id, mProtocol, lcno) {
  // LogWrite(logInfo, "MainBodySignalParser");

  var devProtocol = new DeviceProtocol();
  let mIndex = 0;
  //var _data = `{}`;

  if (mProtocol.BODY_M.length > 0) {
    if (mProtocol.BODY_M.length < S_MIN_LEN)
      return;

    if (!(devProtocol.STX1_S == mProtocol.BODY_M[mIndex] && devProtocol.STX2_S == mProtocol.BODY_M[mIndex + 1]))
      return;

    mIndex += 2;
    //LogWrite(logError ,"mProtocol.LCNO_M " ,mProtocol.LCNO_M);
    devProtocol.DATA_LEN_S = bytesToNum( mProtocol.BODY_M ,mIndex, mIndex+2);
    if (devProtocol.DATA_LEN_S + 2 != mProtocol.BODY_M.length)
      return;

      mIndex += 2;

      devProtocol.DIR_S = mProtocol.BODY_M[mIndex++];
      devProtocol.OPCODE_S = mProtocol.BODY_M[mIndex++];

    if ((devProtocol.DATA_LEN_S + 2) - S_MIN_LEN > 0) {
      //바디체크
      devProtocol.BODY_S = mProtocol.BODY_M.slice(mIndex, mProtocol.BODY_M.length - 2);

      mIndex += (mProtocol.BODY_M.length - 2);
    }
    devProtocol.CHECKSUM_S = bytesToNum( mProtocol.BODY_M ,mIndex, mIndex+2);
  }
  else
    return;
  SubBodySignalControlParserCVIB(id, devProtocol, lcno);
}

function MainBodySignalControlParserPPC(id, mProtocol, lcno) {
  
  var devProtocol = new DeviceProtocol();
  let mIndex = 0;
  //var _data = `{}`;

  if (mProtocol.BODY_M.length > 0) {
    if (mProtocol.BODY_M.length < S_MIN_LEN)
      return;

    if (!(devProtocol.STX1_S == mProtocol.BODY_M[mIndex] && devProtocol.STX2_S == mProtocol.BODY_M[mIndex + 1]))
      return;

    mIndex += 2;
    //LogWrite(logError ,"mProtocol.LCNO_M " ,mProtocol.LCNO_M);
    devProtocol.DATA_LEN_S = bytesToNum( mProtocol.BODY_M ,mIndex, mIndex+2);
    if (devProtocol.DATA_LEN_S + 2 != mProtocol.BODY_M.length)
      return;

      mIndex += 2;

      devProtocol.DIR_S = mProtocol.BODY_M[mIndex++];
      devProtocol.OPCODE_S = mProtocol.BODY_M[mIndex++];

    if ((devProtocol.DATA_LEN_S + 2) - S_MIN_LEN > 0) {
      //바디체크
      devProtocol.BODY_S = mProtocol.BODY_M.slice(mIndex, mProtocol.BODY_M.length - 2);

      mIndex += (mProtocol.BODY_M.length - 2);
    }
    devProtocol.CHECKSUM_S = bytesToNum( mProtocol.BODY_M ,mIndex, mIndex+2);
  }
  else
    return;
  SubBodySignalControlParserPPC(id, devProtocol, lcno);
}


function SubBodySignalControlParserCVIB(id, devProtocol, lcno) {
  var _data = `{}`;
  switch (devProtocol.OPCODE_S) {
    case 0x10:
      let typelc = 'cvibstat';
      console.log(typelc)
      {
        _data = MakeCvibStatus(devProtocol.BODY_S, lcno);
      }
      for (i in sseCli) //??
      {
        let v = sseCli[i];
        constructSSE(v.res, id, _data, typelc);
      }	  
      return;
      
    default:
      {
        LogWrite(logError, "CVIB default OP", devProtocol.OPCODE_S);
      }
      return;
  }
}

function SubBodySignalControlParserPPC(id, devProtocol, lcno) {
  var _data = `{}`;
  switch (devProtocol.OPCODE_S) {
    case 0x33:
      let typelc = 'ppcstat';
      console.log(typelc)
      {
        _data = MakePpcStatus(devProtocol.BODY_S, lcno);
      }
      for (i in sseCli) //??
      {
        let v = sseCli[i];
        constructSSE(v.res, id, _data, typelc);
      }	  
      return;
      
    default:
      {
        LogWrite(logError, "CVIB default OP", devProtocol.OPCODE_S);
      }
      return;
  }
}


function MakePpcStatus(lcdt, lcno) {
	//console.log('Make_LC_STATUS')
  let mIndex = 0;
  // if (typeof lcInfo[lcno] != 'object'){
  //   lcInfo[lcno] = new Object();
  // }

  let _data = `{"csid":${lcno},`;
  mIndex+=24;//시간정보
  mIndex+=16;//보드정보
  mIndex+=20;//Compile날짜
  mIndex+=20;//Compile시간
  mIndex+=16;//헤더정보

  mIndex+=8;//방향별신호등출력상태
  mIndex+=8;//보행신호잔여시간

  _data += `"aringPhCount1":${lcdt[mIndex++]},`;
  _data += `"aringPhCount2":${lcdt[mIndex++]},`;
  _data += `"aringPhCount3":${lcdt[mIndex++]},`;
  _data += `"aringPhCount4":${lcdt[mIndex++]},`;
  _data += `"aringPhCount5":${lcdt[mIndex++]},`;
  _data += `"aringPhCount6":${lcdt[mIndex++]},`;
  _data += `"aringPhCount7":${lcdt[mIndex++]},`;
  _data += `"aringPhCount8":${lcdt[mIndex++]},`;

  
  _data += `"bringPhCount1":${lcdt[mIndex++]},`;
  _data += `"bringPhCount2":${lcdt[mIndex++]},`;
  _data += `"bringPhCount3":${lcdt[mIndex++]},`;
  _data += `"bringPhCount4":${lcdt[mIndex++]},`;
  _data += `"bringPhCount5":${lcdt[mIndex++]},`;
  _data += `"bringPhCount6":${lcdt[mIndex++]},`;
  _data += `"bringPhCount7":${lcdt[mIndex++]},`;
  _data += `"bringPhCount8":${lcdt[mIndex++]},`;

  _data += `"dirStraight1":${lcdt[mIndex++]},`;
  _data += `"dirStraight2":${lcdt[mIndex++]},`;
  _data += `"dirStraight3":${lcdt[mIndex++]},`;
  _data += `"dirStraight4":${lcdt[mIndex++]},`;
  _data += `"dirStraight5":${lcdt[mIndex++]},`;
  _data += `"dirStraight6":${lcdt[mIndex++]},`;
  _data += `"dirStraight7":${lcdt[mIndex++]},`;
  _data += `"dirStraight8":${lcdt[mIndex++]},`;

  _data += `"dirLeft1":${lcdt[mIndex++]},`;
  _data += `"dirLeft2":${lcdt[mIndex++]},`;
  _data += `"dirLeft3":${lcdt[mIndex++]},`;
  _data += `"dirLeft4":${lcdt[mIndex++]},`;
  _data += `"dirLeft5":${lcdt[mIndex++]},`;
  _data += `"dirLeft6":${lcdt[mIndex++]},`;
  _data += `"dirLeft7":${lcdt[mIndex++]},`;
  _data += `"dirLeft8":${lcdt[mIndex++]},`;

  _data += `"cycleCount":${lcdt[mIndex++]},`;
{
  var data = sliceByte(lcdt[mIndex++], 4,4);

  _data += `"bringPhnumber":${data[0]},`;
  _data += `"aringPhnumber":${data[1]},`;
}
  _data += `"aringcycleCount":${lcdt[mIndex++]},`;
  _data += `"bringcycleCount":${lcdt[mIndex++]},`;

  mIndex++; //감응설정상태
  mIndex++;
  
  _data += `"aringMinGreen1":${lcdt[mIndex++]},`;
  _data += `"aringMinGreen2":${lcdt[mIndex++]},`;
  _data += `"aringMinGreen3":${lcdt[mIndex++]},`;
  _data += `"aringMinGreen4":${lcdt[mIndex++]},`;
  _data += `"aringMinGreen5":${lcdt[mIndex++]},`;
  _data += `"aringMinGreen6":${lcdt[mIndex++]},`;
  _data += `"aringMinGreen7":${lcdt[mIndex++]},`;
  _data += `"aringMinGreen8":${lcdt[mIndex++]},`;


  _data += `"bringMinGreen1":${lcdt[mIndex++]},`;
  _data += `"bringMinGreen2":${lcdt[mIndex++]},`;
  _data += `"bringMinGreen3":${lcdt[mIndex++]},`;
  _data += `"bringMinGreen4":${lcdt[mIndex++]},`;
  _data += `"bringMinGreen5":${lcdt[mIndex++]},`;
  _data += `"bringMinGreen6":${lcdt[mIndex++]},`;
  _data += `"bringMinGreen7":${lcdt[mIndex++]},`;
  _data += `"bringMinGreen8":${lcdt[mIndex++]},`;
  mIndex += 8;
  mIndex += 8; //포화도
  _data += `"timet":${bytesToNum(lcdt ,mIndex, mIndex+4)},`;
  mIndex+=4;
  {
    var data = sliceByte(lcdt[mIndex++], 4,4);
  
    _data += `"trans":${data[0]},`;
    _data += `"mainPh":${data[1]},`;
  }
  _data += `"offset":${lcdt[mIndex++]},`;

  for(let i=0; i<16; i++)
  {

    var data = sliceByte(lcdt[mIndex++], 1, 1,1,1,1,1,1,1);
    _data += `"lsu${i+1}_7":${data[0]},`;
    _data += `"lsu${i+1}_6":${data[1]},`;
    _data += `"lsu${i+1}_5":${data[2]},`;
    _data += `"lsu${i+1}_4":${data[3]},`;
    _data += `"lsu${i+1}_3":${data[4]},`;
    _data += `"lsu${i+1}_2":${data[5]},`;
    _data += `"lsu${i+1}_1":${data[6]},`;
    _data += `"lsu${i+1}_0":${data[7]}`;

    if (i + 1 != 16)
    _data += ",";

  }
  _data += `}
  `;

  console.log('22')
  console.log(_data)
  return _data;
}

function MakeCvibStatus(lcdt, lcno) {
	//console.log('Make_LC_STATUS')
  let mIndex = 0;
  // if (typeof lcInfo[lcno] != 'object'){
  //   lcInfo[lcno] = new Object();
  // }

  let _data = `{"csid":${lcno},`;

  _data += `"node_id":${bytesToNum(lcdt ,mIndex, mIndex+4)},`;
  //for(let i=4; i<lcdt.length; i++)
  mIndex+=4;
  let forea = 0;
  for(let i=mIndex; i<mIndex+4; i++)
  {
    switch(i)
    { //START
      case 4:
        {
          let idx = 0;
          var data = sliceByte(lcdt[i], 3, 1, 1, 1, 1, 1);
          idx++;
          //_data += `"pp_psving":${data[idx++]},`
          //_data += `"pp_psv":${data[idx++]},`
          //_data += `"pp_flash":${data[idx++]},`
          _data += `"transition":${data[idx++]},`
          _data += `"actuation":${data[idx++]},`
          _data += `"shutdown":${data[idx++]},`
          _data += `"flash":${data[idx++]},`
          _data += `"manual":${data[idx++]},`
        }
        break;

      case 5:
        {
          let idx = 0;
          var data = sliceByte(lcdt[i], 5, 1, 1,1);
          _data += `"scu_fail":${data[idx++]},`
          _data += `"onl_fail":${data[idx++]},`
          _data += `"conf_fail":${data[idx++]},`

        }
        break;
      case 6:
        {
          
          _data += `"cycle_count":${lcdt[i]},` //보행상태
        }
        break;
      case 7:
        {
          let idx = 0;
          var data = sliceByte(lcdt[i], 1, 7);
          _data += `"splitFlag":${data[idx++]},`
          forea = data[idx++];
          _data += `"ea":${forea},`
        }
        break;
    }
  }
  mIndex+=4;
  _data += `"timet":${bytesToNum(lcdt ,mIndex, mIndex+4)},`;
  mIndex+=4;

  let spatmain = `"spat":[`;
  for(let i=0; i<forea; i++)
  {
    let subdata = `{`;

    var data = sliceByte(lcdt[mIndex], 4, 4); mIndex++;
    subdata += `"type":${data[0]},`;
    subdata += `"direction":${data[1]},`;

    var data2 = sliceByte(lcdt[mIndex], 1,1,3,3); mIndex++;
    subdata += `"notTrust":${data2[0]},`;
    subdata += `"autoDetect":${data2[1]},`;
    subdata += `"color":${data2[3]},`;

    subdata += `"dispTime":${lcdt[mIndex]},`;mIndex++;
    subdata += `"dispCounter":${lcdt[mIndex]},`;mIndex++;
    subdata += `"mappingDir":${lcdt[mIndex]}`;mIndex++;
    subdata += `}`;
    if (i + 1 != forea)
    subdata += ",";
    spatmain += subdata;
  }
  spatmain += `]`
  _data += spatmain;
  _data += `}
  `;
  console.log('22')
  console.log(_data)
  return _data;
}


function MainBodySignalParser(id, mProtocol, lcno) {
  // LogWrite(logInfo, "MainBodySignalParser");

  var sProtocol = new SProtocol();
  let mIndex = 0;
  //var _data = `{}`;

  if (mProtocol.BODY_M.length > 0) {
    if (mProtocol.BODY_M.length < S_MIN_LEN)
      return;

    if (!(sProtocol.STX1_S == mProtocol.BODY_M[mIndex] && sProtocol.STX2_S == mProtocol.BODY_M[mIndex + 1]))
      return;

    mIndex += 2;

    sProtocol.DATA_LEN_S = mProtocol.BODY_M[mIndex++];
    if (sProtocol.DATA_LEN_S + 2 != mProtocol.BODY_M.length)
      return;

    sProtocol.LCNO_S = mProtocol.BODY_M[mIndex++];
    sProtocol.OPCODE_S = mProtocol.BODY_M[mIndex++];

    if ((sProtocol.DATA_LEN_S + 2) - S_MIN_LEN > 0) {
      //바디체크
      sProtocol.BODY_S = mProtocol.BODY_M.slice(mIndex, mProtocol.BODY_M.length - 1);

      mIndex += (mProtocol.BODY_M.length - 1);
    }
    sProtocol.CHECKSUM_S = mProtocol.BODY_M[mIndex++];
  }
  else
    return;

  SubBodySignalParser(id, sProtocol, lcno);
}

function SubBodySignalParser(id, sProtocol, lcno) {
  var _data = `{}`;
  let type = 'lcRes';
  switch (sProtocol.OPCODE_S) {
    case reqopcode.LC_STATUS_RSP:
      let typelc = 'lcStat';
      {
        _data = Make_LC_STATUS(sProtocol.BODY_S, lcno);
      }
for (i in sseCli) //??
{
      let v = sseCli[i];
              //let id = (new Date()).toLocaleTimeString();
      constructSSE(v.res, id, _data, typelc);
              //MainBodySignalParser(v, id, mProtocol, mProtocol.LCNO_M);
            }	  
      return;
    case reqopcode.TFDT_INFO_UP1_RSP:
      {
		    if (typeof phaseTasks[lcno] != 'undefined') {
          let arr = tcp.makeit(lcno, reqopcode.PHASE_DW_REQ, lcno == 9999 ? 1 : 2, phaseTasks[lcno].TCPdata);

          fs.appendFile(path.join(__dirname.replace('\\routes','') + '', 'phaseLog.txt'), 
            `${Date().replace(' GMT+0900 (대한민국 표준시)','')} lcno:${lcno} | buffer:${arr}\n`,
            {encoding : 'utf8'},
            ()=>{return}
          )
        }
        type = 'tfdtStatus'
        // LogWrite(logTrace, "TFDT_INFO_UP1_RSP");
        _data = Make_TFDT_INFO(sProtocol.BODY_S, sProtocol.LCNO_S, lcno);
        // LogWrite(logDebug,"TFDT_INFO_UP1_RSP" , _data);
      }
      break;
  /**  스타트 업  **/
    case reqopcode.STARTUP_UP_RSP: //스타트업 업로드 응답
      {
        _data = Make_STARTUP_UP(sProtocol.BODY_S, sProtocol.LCNO_S, lcno);
      }
      break;
    case reqopcode.STARTUP_DW_RSP: //스타트업 다운로드 응답
      {
        _data = MAKE_ACK_RSP(sProtocol.BODY_S, sProtocol.LCNO_S);
      }
      break;
    /**검지기 구성 */
    case reqopcode.TFDT_CONFIG_DW1_RSP:
      {
        LogWrite(logTrace, "검지기 구성 다운로드 응답");
        _data = MAKE_ACK_RSP(sProtocol.BODY_S, sProtocol.LCNO_S);
      }
      break;
    case reqopcode.TFDT_CONFIG_UP1_RSP: //검지기구성 응답
      {
        _data = Make_DECT(sProtocol.BODY_S, sProtocol.LCNO_S);
        _data['seq'] = true;
      }
      break;
      case reqopcode.SP_CMD_DOWN_RSP: //스페셜 응답완료
      {
        LogWrite(logTrace, "SP_CMD_DOWN_RSP 스페셜 온라인 제어 응답완료 " + lcno);
        _data = MAKE_ACK_RSP(sProtocol.BODY_S, sProtocol.LCNO_S);
        _data['seq'] = true;
      }
      break;
      case reqopcode.LC_CTL_DOWN_RSP: //LC 응답완료
      {
        LogWrite(logTrace, "LC_CTL_DOWN_RSP 교차로 온라인 제어 응답완료 " + lcno);
        _data = MAKE_ACK_RSP(sProtocol.BODY_S, sProtocol.LCNO_S);
        _data['seq'] = true;
      }
      break;
    /* 시그널 맵 */
    case reqopcode.SIGNAL_MAP_UP_RSP:
      {
        LogWrite(logTrace, "시글널 업로드 응답");
        _data = MAKE_SIG_UP_RSP(sProtocol.BODY_S, sProtocol.LCNO_S, lcno);
      }
      break;
    case reqopcode.SIGNAL_MAP_DW_RSP:
      {
        LogWrite(logTrace, "시글널 다운로드 응답");
        _data = MAKE_SIG_DW_RSP(sProtocol.BODY_S, sProtocol.LCNO_S, lcno);
      }
      break;
    /* 플래쉬맵 */
    case reqopcode.FLASH_MAP_UP_RSP:
      {
        LogWrite(logTrace, "FLASH_MAP_UP_RSP");
        _data = Make_FLASH_UP(sProtocol.BODY_S, sProtocol.LCNO_S, lcno);
      }
      break;
    case reqopcode.FLASH_MAP_DW_RSP:
      {
        LogWrite(logTrace, "FLASH_MAP_DW_RSP");
        _data = MAKE_ACK_RSP(sProtocol.BODY_S, sProtocol.LCNO_S);
      }
      break;
    /* 일계획 */
    case reqopcode.DAY_PLAN_UP_RSP:
      {
        LogWrite(logTrace, "DAY_PLAN_UP_RSP");
        _data = Make_DAYPLAN_UP(sProtocol.BODY_S, sProtocol.LCNO_S);
        _data['seq'] = true;
      }
      break;
    case reqopcode.DAY_PLAN_DW_RSP:
      {
        LogWrite(logTrace, "DAY_PLAN_DW_RSP");
        _data = MAKE_ACK_RSP(sProtocol.BODY_S, sProtocol.LCNO_S);
        _data['seq'] = true;
      }
      break;
    /* 주간계획 */
    case reqopcode.WEEK_PLAN_UP_RSP:
      {
        LogWrite(logTrace, "WEEK_PLAN_UP_RSP");
        _data = Make_WEEKPLAN_UP(sProtocol.BODY_S, sProtocol.LCNO_S);
      }
      break;
    case reqopcode.WEEK_PLAN_DW_RSP:
      {
        LogWrite(logTrace, "WEEK_PLAN_DW_RSP");
        _data = MAKE_ACK_RSP(sProtocol.BODY_S, sProtocol.LCNO_S);
      }
      break;
    /* 특수계획 */
    case reqopcode.HOLI_PLAN_UP_RSP:
      {
        LogWrite(logTrace, "HOLI_PLAN_UP_RSP");
        _data = Make_HOLIPLAN_UP(sProtocol.BODY_S, sProtocol.LCNO_S);
      }
      break;
    case reqopcode.HOLI_PLAN_DW_RSP:
      {
        LogWrite(logTrace, "HOLI_PLAN_DW_RSP");
        _data = MAKE_ACK_RSP(sProtocol.BODY_S, sProtocol.LCNO_S);
      }
      break;

    /* 예약계획 */
    case reqopcode.RESE_PLAN_UP_RSP:
      {
        LogWrite(logTrace, "RESE_PLAN_UP_RSP");
        _data = Make_RESEPLAN_UP(sProtocol.BODY_S, sProtocol.LCNO_S, lcno);
      }
      break;
    case reqopcode.RESE_PLAN_DW_RSP:
      {
        LogWrite(logTrace, "RESE_PLAN_DW_RSP");
        _data = MAKE_ACK_RSP(sProtocol.BODY_S, sProtocol.LCNO_S);
      }
      break;

    /* 방향별출력맵 */
    case reqopcode.DIR_PED_UP_RSP:
      {
        LogWrite(logTrace, "DIR_PED_UP_RSP");
        _data = Make_DIR_PED_UP(sProtocol.BODY_S, sProtocol.LCNO_S, lcno);
      }
      break;
    case reqopcode.DIR_PED_DW_RSP:
      {
        LogWrite(logTrace, "DIR_PED_DW_RSP");
        _data = Make_DIR_PED_DW(sProtocol.BODY_S, sProtocol.LCNO_S);
      }
      break;
    /* 모순맵 */
    case reqopcode.CONFLICT_DW_RSP:
      {
        LogWrite(logTrace, "CONFLICT_DW_RSP");
        _data = MAKE_ACK_RSP(sProtocol.BODY_S, sProtocol.LCNO_S);
      }
      break;
    case reqopcode.CONFLICT_UP_RSP:
      {
        LogWrite(logTrace, "CONFLICT_UP_RSP");
        _data = Make_CONFLICT_UP(sProtocol.BODY_S, sProtocol.LCNO_S, lcno);
      }
      break;
    /* 장치정보업로드 */
    case reqopcode.DEVICE_UP_RSP:
      {
        LogWrite(logTrace, "DEVICE_UP_RSP");
        _data = Make_DEVICE_UP(sProtocol.BODY_S, sProtocol.LCNO_S);
      }
      break;
    /* 네트워크정보 업/다운로드 */
    case reqopcode.NETWORK_RSP:
      {
        LogWrite(logTrace, "NETWORK_RSP");
        _data = Make_NETWORK(sProtocol.BODY_S, sProtocol.LCNO_S);
      }
      break;
    /* 시간설정 */
    case reqopcode.CLOCK_DW_RSP:
      {
        LogWrite(logTrace, "CLOCK_DW_RSP");
        //_data = MAKE_ACK_RSP(sProtocol.BODY_S, sProtocol.LCNO_S);
		_data = MAKE_DW_CLOCK_RSP(sProtocol.BODY_S, sProtocol.LCNO_S, lcno);
      }
      break;
    case reqopcode.CLOCK_UP_RSP:
      {
        LogWrite(logTrace, "CLOCK_UP_RSP");
        _data = Make_CLOCK_UP(sProtocol.BODY_S, sProtocol.LCNO_S, lcno);
      }
      break;
    case reqopcode.PHASE_DW_RSP:
      {
        LogWrite(logTrace, `현시 다운로드 완료 [LCNO : ${lcno}]`);
      }
	  if (typeof phaseTasks[lcno] != "undefined") {
        phaseTasks[lcno].stopBomb();
      }
      return;
    default:
      {
        LogWrite(logError, "default OP", sProtocol.OPCODE_S);
        
      }
      return;
  }
  for (i in sseCli) //??
	{
		  let v = sseCli[i];
				 // let id = (new Date()).toLocaleTimeString();
	  responseSSE(v.res, id, _data, type);
	}
}

function sigDecompress(comData, lcno, ring, planclass) {
  var dArr = Array.from({ length: 32 * 19 }, () => 0);
  var arrCnt = 0;
  var fLength = comData.length;
  var nCnt = 0;
  var curNo = 0;
  var dataSlice = sigDataSlice(comData, 0);
  var lsuArr = dataSlice.lsuArr;

  /**************** lsu 코드 데이터 압축 해제 *****************/
  for (let i = 0; i < lsuArr.length; i++) {
    if (lsuArr[i] >= 224) { // 개수가 31개 초과한 경우
      nCnt = (lsuArr[i] - 224) * 256 + lsuArr[i + 1];
      curNo = lsuArr[i + 2];
      if (curNo == 0 || curNo >= 192) {
        curNo = 0;
        i++;
      } else {
        i += 2;
      }

    } else if (lsuArr[i] >= 192) { // 개수가 2~31개 인 경우
      nCnt = lsuArr[i] - 192;
      curNo = lsuArr[i + 1];
      if (curNo == 0 || curNo >= 192) {
        curNo = 0;
      } else {
        i++;
      }
    } else { // 개수가 1개인 경우
      nCnt = 1;
      curNo = lsuArr[i];
    }

    for (j = 0; j < nCnt; j++) {
      dArr[arrCnt++] = parseInt(curNo.toString(16)); // 16진수를 10진수 문자로 변환 후 다시 type 변환
    }
  }

  /**************** Ring 속성 압축 해제 *****************/

  var bProp = ""; // 10진수->2진수 문자열 변환용 변수
  var ringPropertyArr = dataSlice.ringPropertyArr;
  var ringValueArr = dataSlice.ringValueArr;
  var rpArr = new Array();
  var rpStr = "";
  var rpVal;
  var rvCnt = 0;
  var jsonStr = "";

  for (let i = 0; i < ringPropertyArr.length; i++) {
    bProp = convertTo8bit(ringPropertyArr[i]);
    for (let j = 0; j < 4; j++) {
      rpStr = bProp.substring(6 - (2 * j), 8 - (2 * j));
      if (rpStr == "00" && rvCnt >= ringValueArr.length) break;
      rpVal = ringPropertyConvert(rpStr, ringValueArr, rvCnt);
      dArr[(16 * 32) + (4 * i) + j] = rpVal.min;
      dArr[(17 * 32) + (4 * i) + j] = rpVal.max;
      dArr[(18 * 32) + (4 * i) + j] = rpVal.eop;
      rvCnt = rpVal.cnt;
    }
  }

  //testPrint(dArr);

  jsonStr = arrayToJson(dArr, lcno, ring, planclass);

  //console.log(jsonStr);

  return jsonStr;
}


function sigDataSlice(arr, sp) {
  var pos = 0;
  var tPos = 0;
  var lsuArr;
  var ringPropertyArr;
  var ringValueArr;
  var tempArr = new Array();
  for (let i = 0; i < 3; i++) {
    tPos = arr.indexOf(sp, pos);
    if (tPos == -1) {
      break;
    } else {
      tempArr[i] = arr.slice(pos, tPos);
    }
    pos = tPos + 1;
  }
  return { lsuArr: tempArr[0], ringPropertyArr: tempArr[1], ringValueArr: tempArr[2] }
}

function ringPropertyConvert(rp, rvArr, rvCnt) {
  var fEOP = "11"; // min 3초 고정 EOP 
  var f3S = "10"; // min 3초 고정 not EOP
  var fN3S = "01"; // min 고정 , not 3초
  var vMax = "00"; // 가변 (max 값 할당됨)
  var minValue = 0;
  var maxValue = 0;
  var eopValue = 0;

  switch (rp) {
    case fEOP:
      minValue = 3;
      eopValue = 1;
      break;
    case f3S:
      minValue = 3;
      break;
    case fN3S:
      if (rvArr[rvCnt] > 128) {
        minValue = rvArr[rvCnt] - 128;
        eopValue = 1;
      } else {
        minValue = rvArr[rvCnt];
      }
      rvCnt++;
      break;
    case vMax:
      if (rvArr[rvCnt] > 128) {
        maxValue = rvArr[rvCnt];
        // minValue = rvArr[rvCnt] - 128;
        // maxValue = rvArr[++rvCnt];
        // eopValue = 1;
      } else if (rvArr[rvCnt] == 1) {
        maxValue = rvArr[++rvCnt];
        eopValue = 1;
      } else {
        maxValue = rvArr[rvCnt];
      }
      rvCnt++;
      break;
    default:
      break;

  }
  //console.log (minValue + "," + maxValue + "," + eopValue + "," + rvCnt);
  return { min: minValue, max: maxValue, eop: eopValue, cnt: rvCnt };
}



function sigDataSlice2004(arr, sp) {
  var tPos = 0;
  var tempArr = new Array();
  var tPos = arr.indexOf(sp,0);
  var lastPos = arr.lastIndexOf(sp);
  tempArr[0] = arr.slice(0,tPos);
  tempArr[1] = decToArrayBy2bit(arr.slice(tPos+1,lastPos));
  tempArr[2] = arr.slice(lastPos+1);

  return {bitmapArr: tempArr[0], idxArr: tempArr[1], idxValueArr: tempArr[2]};
}

function sigDecompress2004(comData, lcno, ring, planclass) {
  var dArr = Array.from({length: 32*19}, () => 0);
  const B10 = "00";
  const B01 = "10";
  const B20 = "01";
  const BXX = "11";
  var dataSlice = sigDataSlice2004(comData, 255);
  var bitmapArr = dataSlice.bitmapArr;
  var idxArr = dataSlice.idxArr;
  var idxCnt = 0;
  var idxValueArr = dataSlice.idxValueArr;
  var idxValueCnt = 0;
  
  /**************** bitmap 데이터 압축 해제 *****************/
  for (let i=0;i<4*19;i++) {
      let bNumber = bitmapArr[i];
      for(let j=0;j<8;j++) {
          if((bNumber & (Math.pow(2,j))) > 0) { // 8bit에서 자리별 bit 값 확인
              switch (idxArr[idxCnt++]) {
                  case B10:
                      dArr[(i*8) + j] = 10;
                      break;
                  case B01:
                      dArr[(i*8) + j] = 1;
                      break;
                  case B20:
                      dArr[(i*8) + j] = 20;
                      break;
                  case BXX:    
                      let oNum = idxValueArr[idxValueCnt++]; // 기타값의 경우 기타값 배열에서 값을 참조
                      if (((i*8) + j)%19 < 16) // lsu의 경우 UI 설계상 16진수->10진수로 변경표기
                          oNum = parseInt(oNum.toString(16));
                      dArr[(i*8) + j] = oNum;
                      break;    
                  default:
                      break;
              }
          }
      }
  }
//jsonStr = arrayToJson(dArr, lcno, ring, planclass);
  return arrayToJson2004(dArr, lcno, ring, planclass);
}

function arrayToJson2004(arr, lcno, ring, planclass) {
  var tArr = new Array();
  
  for (let i=0;i<32;i++) {
      let data = new Object();
      data.planclss = planclass;
      data.ring = (ring % 2) == 1 ? 1 : 2;
      data.lcno = lcno;      
      data.stepno = i + 1;
      data.veh1 = arr[i*19 + 0];
      data.ped1 = arr[i*19 + 1];
      data.veh2 = arr[i*19 + 2];
      data.ped2 = arr[i*19 + 3];
      data.veh3 = arr[i*19 + 4];
      data.ped3 = arr[i*19 + 5];
      data.veh4 = arr[i*19 + 6];
      data.ped4 = arr[i*19 + 7];
      data.veh5 = arr[i*19 + 8];
      data.ped5 = arr[i*19 + 9];
      data.veh6 = arr[i*19 + 10];
      data.ped6 = arr[i*19 + 11];
      data.veh7 = arr[i*19 + 12];
      data.ped7 = arr[i*19 + 13];
      data.veh8 = arr[i*19 + 14];
      data.ped8 = arr[i*19 + 15];
      data.minsplit = arr[i*19 + 16];
      data.maxsplit = arr[i*19 + 17];
      data.eop = arr[i*19 + 18];
      LogWrite(logDebug , "i" , i);
      LogWrite(logDebug , "data" , JSON.stringify(data));
      tArr.push(data);
  }
  

  return JSON.stringify(tArr);
}

function decToArrayBy2bit(arr) {
  var dArr = new Array();
  var dArrCnt = 0;
  for(let i=0;i<arr.length;i++) {
      let arrValue = arr[i];
      if (arrValue == 0) arrValue = 255; // 인덱스부 "0x00" 을 "0xFF" 로 변환
      let bStr = convertTo8bit(arrValue);
      for (let j=8;j>0;j-=2) {
          dArr[dArrCnt++] = bStr.substring(j-2,j);
      }
  }
  return dArr;
}

function convertTo8bit(dec) {
  var retVal = dec.toString(2);
  var addNum = 8 - retVal.length;
  for (let i = 0; i < addNum; i++) {
    retVal = "0" + retVal;
  }
  return retVal;
}

function arrayToJson(arr, lcno, ring, planclass) {
  var tArr = new Array();

  for (let i = 0; i < 32; i++) {
    let data = new Object();
    /*
    for (let j=1;j<9;j++) {
        data["veh" + j] = arr[i + ((2*j - 2)*32)];
        data["ped" + j] = arr[i + ((2*j - 1)*32)];
    }
    data["minsplit"] = arr[i + 16*32];
    data["maxsplit"] = arr[i + 17*32];
    data["eop"] = arr[i + 18*32];
    */
    data.planclss = planclass;
    data.ring = (ring % 2) == 1 ? 1 : 2;
    data.lcno = lcno;
    data.stepno = i + 1;
    data.veh1 = arr[i + 0 * 32];
    data.ped1 = arr[i + 1 * 32];
    data.veh2 = arr[i + 2 * 32];
    data.ped2 = arr[i + 3 * 32];
    data.veh3 = arr[i + 4 * 32];
    data.ped3 = arr[i + 5 * 32];
    data.veh4 = arr[i + 6 * 32];
    data.ped4 = arr[i + 7 * 32];
    data.veh5 = arr[i + 8 * 32];
    data.ped5 = arr[i + 9 * 32];
    data.veh6 = arr[i + 10 * 32];
    data.ped6 = arr[i + 11 * 32];
    data.veh7 = arr[i + 12 * 32];
    data.ped7 = arr[i + 13 * 32];
    data.veh8 = arr[i + 14 * 32];
    data.ped8 = arr[i + 15 * 32];
    data.minsplit = arr[i + 16 * 32];
    data.maxsplit = arr[i + 17 * 32];
    data.eop = arr[i + 18 * 32];
    tArr.push(data);
  }

  return JSON.stringify(tArr);

  //console.log(jString);
}

//make DATA 함수 ---------------------------------------------------------

/* 데이터 만들기 함수 */
// 검지기 구성 업다운
function Make_DECT(lcdt, ticketno) {
  var dect_Config = new TFDT_CONFIG();

  console.log(lcdt);
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 7; j++) {
      //dect_Config[i,j] = lcdt[ (i * 7) + j];
      dect_Config[i][j] = lcdt[(i * 7) + j];
    }
  }


  let tempBffuer = "";
  for (let i = 0; i < 32; i++) {
    let buffer = `"${(i + 1)}" : [`;
    for (let j = 0; j < 7; j++) {
      //dect_Config[i,j] = lcdt[ (i * 7) + j];
      //buffer += `${dect_Config[i][j]}` ;
      buffer += `${lcdt[(i * 7) + j]}`;
      if (j != 6) {
        buffer += `,`;
      }
    }
    buffer += `]`;
    tempBffuer += buffer;
    if (i != 31) {
      tempBffuer += ",\n";
    }
  }


  let _data = `{
              "ticketno" : ${ticketno},
              "data" : {
                  ${tempBffuer}
                }
            }`;

  // console.log(_data);
  return _data;
}


function Make_LC_STATUS(lcdt, lcno) {
	//console.log('Make_LC_STATUS')
  if (typeof lcInfo[lcno] != 'object'){
    lcInfo[lcno] = new Object();
  }
  
   
  // console.log(typeof lcInfo[lcno])
  // console.log(typeof lcInfo[lcno] == 'object')
  let _data = `{"lcno":${lcno},"time":${Number(new Date())},`;
  for(let i=0; i<lcdt.length; i++)
  {
    switch(i)
    {
      case 0:
        {
          let idx = 0;
          var data = sliceByte(lcdt[i], 1, 1, 1, 1, 1, 3);
          _data += `"power_fail":${data[idx++]},`
          _data += `"com_mscu":${data[idx++]},`
          _data += `"dim_state":${data[idx++]},`
          _data += `"ring_manage":${data[idx++]},`
          _data += `"ppc_state":${data[idx++]},`
          lcInfo[lcno]['제어모드'] = data[idx]; //제어모드
          _data += `"op_mode":${data[idx++]}`
        }
        break;
      case 1:
        {
          let idx = 0;
          var data = sliceByte(lcdt[i], 3, 5);
          _data += `"ring_a_phase":${data[idx++]},`
          _data += `"ring_a_step":${data[idx++]}`
        }
        break;
      case 2:
        {
          let idx = 0;
          var data = sliceByte(lcdt[i], 3, 5);
          _data += `"ring_b_phase":${data[idx++]},`
          _data += `"ring_b_step":${data[idx++]}`
        }
        break;
      case 3:
        {
          let idx = 0;
          var data = sliceByte(lcdt[i], 1, 1, 1, 1, 1, 1, 1, 1);
          _data += `"pp_psving":${data[idx++]},`
          _data += `"pp_psv":${data[idx++]},`
          _data += `"pp_flash":${data[idx++]},`
          _data += `"pp_lightout":${data[idx++]},`
          _data += `"conflict_state":${data[idx++]},`
          _data += `"lightout_state":${data[idx++]},`
          _data += `"flash_state":${data[idx++]},`
          _data += `"db_state":${data[idx++]}`

        }
        break;
      case 4:
        {
          let idx = 0;
          var data = sliceByte(lcdt[i], 1, 3, 1, 1, 1, 1);
          _data += `"pushbtn_state":${data[idx++]},`
          _data += `"flash_reason":${data[idx++]},`
          _data += `"stagger_left_state":${data[idx++]},`
          _data += `"manual_enable":${data[idx++]},`
          _data += `"conflict_enable":${data[idx++]},`
          _data += `"door_state":${data[idx++]}`

        }
        break;

      case 5:
        {
          let idx = 0;
          var data = sliceByte(lcdt[i], 4, 1, 3);
          _data += `"conflict_lsu":${data[idx++]},`
          _data += `"conflict_what":${data[idx++]},`
          _data += `"conflict_circuit":${data[idx++]}`

        }
        break;
      case 6:
        {
          _data += `"walk_lsu_state":${lcdt[i]}` //보행상태
        }
        break;
      case 7:
        {
          _data += `"push_lsu_state":${lcdt[i]}`
        }
        break;
      case 8:
        {
          _data += `"walk_error_lsu_state":${lcdt[i]}` //보행에러
        }
        break;
      case 9:
        {
          _data += `"opboard_error_state":${lcdt[i]}`
        }
        break;
      case 10:
        {
          _data += `"period_counter":${lcdt[i]}`
        }
        break;
      case 11:
        {
          _data += `"prev_period":${lcdt[i]}`
        }
        break;
      case 12:
        {
          _data += `"cur_period":${lcdt[i]}`
          lcInfo[lcno]['주기'] = lcdt[i]; //주기
        }
        break;
      case 13:
        {
          _data += `"offset_value":${lcdt[i]}`
          lcInfo[lcno]['옵셋'] = lcdt[i]; //옵셋
        }
        break;
      case 14:
        {
          _data += `"fixed_phase_no":${lcdt[i]}`
        }
        break;
      case 15:
        {
          _data += `"omit_traffic_no":${lcdt[i]}`
        }
        break;
      case 16:
        {
          let idx = 0;
          var data = sliceByte(lcdt[i], 1, 3, 1,1,1,1);
          _data += `"equalizer_type":${data[idx++]},` //등기종류
          _data += `"cur_map_no":${data[idx++]},` //운영중인 맵(시차제)번호
          // _data += `"앞막힘제어상태정보":${data[idx++]}`
          _data += `"permit_stat":${data[idx++]},` //허용권 상태
          _data += `"MG_stat":${data[idx++]},` //제어방법
          _data += `"mainphase_end":${data[idx++]},` //주현시조기종결
          _data += `"subphase_end":${data[idx++]}` //부현시조기종결
        }
        break;
      case 17:
        {
          _data += `"fw_moudule_id1":${lcdt[i]}`
        }
        break;
      case 18:
        {
          _data += `"fw_moudule_id2":${lcdt[i]}`
        }
        break;
      case 19:
        {
          _data += `"fw_moudule_datagram1":${lcdt[i]}`
        }
        break;
      case 20:
        {
          _data += `"fw_moudule_datagram2":${lcdt[i]}`
        }
        break;
      case 21:
        {
          _data += `"db_error_code":${lcdt[i]}`
        }
        break;
      case 22:
        {
          _data += `"ppc_control_status":${lcdt[i]}`
        }
        break;
      case 23:
        {
          _data += `"ups_control_status":${lcdt[i]}`
        }
        break;
      case 24:
        {
          _data += `"last_data":${lcdt[i]}`
        }
        break;

    }

    if (i + 1 != lcdt.length)
      _data += ",";

  }

  _data += `}
  `;
  //LogWrite(logDebug , _data);
  /*
  _data +=`     }
  }`;
  let _data = `{
    "ticketno" : ${lcno},
    "data" : {
      "1" : [],
      "2" : [${sliceByte(lcdt[1], 4, 4)}],
      "3" : [${sliceByte(lcdt[2], 8)}],
      "4" : [${sliceByte(lcdt[3])}],
      "5" : [${sliceByte(lcdt[4], 8)}],
      "6" : [${sliceByte(lcdt[5], 8)}],
      "7" : [${sliceByte(lcdt[6], 8)}],
      "8" : [${sliceByte(lcdt[7], 8)}],
      "9" : [${sliceByte(lcdt[8], 8)}],
      "10" : [${sliceByte(lcdt[9], 8)}],
      "11" : [${sliceByte(lcdt[10], 8)}],
      "12" : [${sliceByte(lcdt[11], 8)}],
      "13" : [${sliceByte(lcdt[12], 8)}],
      "14" : [${sliceByte(lcdt[13], 1, 1, 1, 5)}],
      "15" : [${sliceByte(lcdt[14], 2, 1, 1, 3, 1)}],
      "16" : [${sliceByte(lcdt[15], 8)}],
      "17" : [${sliceByte(lcdt[16], 8)}],
      "18" : [${sliceByte(lcdt[17], 1, 1, 2, 2, 2)}],
      "19" : [${sliceByte(lcdt[18], 2, 3, 3)}]
    }
  }`;
  */
  //setLog(1, 32, 0, 0, 0, lcno, '교차로', 'SCU');
  // sendAjax(_ctrlSv + 'ntcs_m_lc' + '/GetBy?' + `lcno=${lcno}`).then((res)=>{
    //console.log(JSON.parse(_data));
    const json_data = JSON.parse(_data);
    //const lcname = res.data.lcname;
    if(relcinfo.length != 0) { // 이전 데이터 배열 확인 (데이터가 있을 때)
      
      let pre_data = relcinfo.find((el)=>el.lcno == json_data.lcno);
      if(pre_data) { 
        if(pre_data.op_mode != json_data.op_mode) {
          switch(Number(json_data.op_mode)) {
            case 0:
              console.log('SCU변경');
              setLog(1, 32, 0, 0, 0, lcno, '교차로', 'SCU로 변경');
              break;
            case 1:
              console.log('로컬-무감응 변경');
              setLog(1, 32, 1, 0, 0, lcno, '교차로', '로컬-무감응으로 변경');
              break;
            case 2:
              console.log('로컬-감응 변경');
              setLog(1, 32, 2, 0, 0, lcno, '교차로', '로컬-감응으로 변경');
              break;
            case 4:
              console.log('센터-감응 변경');
              setLog(1, 32, 4, 0, 0, lcno, '교차로', '센터-감응으로 변경');
              break;
            case 5:
              console.log('센터-무감응 변경');
              setLog(1, 32, 5, 0, 0, lcno, '교차로', '센터-무감응으로 변경');
              break;
          }
        }

        if(pre_data.power_fail != json_data.power_fail) {
          if(Number(json_data.power_fail) == 0) {
            setLog(1, 34, 3, 0, 0, lcno, '교차로', '정상');
          } else {
            setLog(1, 34, 3, 0, 0, lcno, '교차로', 'Power FAIL');
          }
        }

        if(pre_data.com_mscu != json_data.com_mscu) {
          if(Number(json_data.com_mscu) == 0) {
            setLog(1, 34, 4, 0, 0, lcno, '교차로', '정상');
          } else {
            setLog(1, 34, 4, 0, 0, lcno, '교차로', 'FAIL');
          }
        }

        if(pre_data.dim_state != json_data.dim_state) {
          if(Number(json_data.dim_state) == 0) {
            setLog(1, 33, 3, 0, 0, lcno, '교차로', '조광제어 종료');
          } else {
            setLog(1, 33, 3, 0, 0, lcno, '교차로', '조광제어 시작');
          }
        }

        if(pre_data.ring_manage != json_data.ring_manage) {
          if(Number(json_data.ring_manage) == 0) {
            setLog(1, 33, 4, 0, 0, lcno, '교차로', 'SINGLE-RING');
          } else {
            setLog(1, 33, 4, 0, 0, lcno, '교차로', 'DUAL-RING');
          }
        }

        if(pre_data.ppc_state != json_data.ppc_state) {
          if(Number(json_data.ppc_state) == 0) {
            setLog(1, 32, 20, 0, 0, lcno, '교차로', 'PPC제어 종료');
          } else {
            setLog(1, 32, 19, 0, 0, lcno, '교차로', 'PPC제어 시작');
          }
        }

        if(pre_data.pp_psving != json_data.pp_psving) {
          if(Number(json_data.pp_psving) == 0) {
            setLog(1, 33, 7, 0, 0, lcno, '교차로', '수동진행S/W OFF');
          } else {
            setLog(1, 33, 7, 0, 0, lcno, '교차로', '수동진행S/W ON');
          }
        }

        if(pre_data.pp_psv != json_data.pp_psv) {
          if(Number(json_data.pp_psv) == 0) {
            setLog(1, 33, 8, 0, 0, lcno, '교차로', '수동S/W OFF');
          } else {
            setLog(1, 33, 8, 0, 0, lcno, '교차로', '수동S/W ON');
          }
        }

        if(pre_data.pp_flash != json_data.pp_flash) {
          if(Number(json_data.pp_flash) == 0) {
            setLog(1, 33, 9, 0, 0, lcno, '교차로', '점멸S/W OFF');
          } else {
            setLog(1, 33, 9, 0, 0, lcno, '교차로', '점멸S/W ON');
          }
        }

        if(pre_data.pp_lightout != json_data.pp_lightout) {
          if(Number(json_data.pp_lightout) == 0) {
            setLog(1, 33, 10, 0, 0, lcno, '교차로', '소등S/W OFF');
          } else {
            setLog(1, 33, 10, 0, 0, lcno, '교차로', '소등S/W ON');
          }
        }

        if(pre_data.conflict_state != json_data.conflict_state) {
          if(Number(json_data.conflict_state) == 0) {
            setLog(1, 34, 2, 0, 0, lcno, '교차로', '모순 해제');
          } else {
            setLog(1, 34, 2, 0, 0, lcno, '교차로', '모순');
          }
        }

        if(pre_data.lightout_state != json_data.lightout_state) {
          if(Number(json_data.lightout_state) == 0) {
            setLog(1, 33, 12, 0, 0, lcno, '교차로', '소등 종료');
          } else {
            setLog(1, 33, 12, 0, 0, lcno, '교차로', '소등');
          }
        }

        if(pre_data.flash_state != json_data.flash_state) {
          if(Number(json_data.flash_state) == 0) {
            setLog(1, 33, 13, 0, 0, lcno, '교차로', '점멸 종료');
          } else {
            switch (Number(json_data.flash_reason)) {
              case 0:
                setLog(1, 33, 13, 0, 0, lcno, '교차로', '알 수 없는 원인');
                break;
              case 1:
                setLog(1, 33, 13, 0, 0, lcno, '교차로', '초기화동작 점멸');
                break;
              case 2:
                setLog(1, 33, 13, 0, 0, lcno, '교차로', '명령에 의한 점멸');
                break;
              case 3:
                setLog(1, 33, 13, 0, 0, lcno, '교차로', '수동 점멸');
                break;
              case 4:
                setLog(1, 33, 13, 0, 0, lcno, '교차로', '모순 점멸');
                break;
              case 5:
                setLog(1, 33, 13, 0, 0, lcno, '교차로', 'DB 에러 점멸');
                break;
              case 6:
                setLog(1, 33, 13, 0, 0, lcno, '교차로', '소등(진입/해제) 점멸');
                break;
              case 7:
                setLog(1, 33, 13, 0, 0, lcno, '교차로', '장치이상');
                break;
            }
            
          }
        }

        if(pre_data.door_state != json_data.door_state) {
          if(Number(json_data.door_state) == 1) {
            setLog(1, 34, 1, 0, 0, lcno, '교차로', '함체 문열림');
          } else {
            setLog(1, 34, 1, 0, 0, lcno, '교차로', '정상');
          }
        }

        if(pre_data.db_state != json_data.db_state) {
          if(Number(json_data.db_state) == 1) {
            switch(json_data.db_error_code) {
              case 0x0f:
                setLog(1, 19, 15, 0, 0, lcno, '교차로', '발생');
                break;
              case 0x01:
                setLog(1, 19, 1, 0, 0, lcno, '교차로', '일반제 주현시 에러');
                break;
              case 0x02:
                setLog(1, 19, 1, 0, 0, lcno, '교차로', '시차제 주현시 에러');
                break;
              case 0x03:
                setLog(1, 19, 2, 0, 0, lcno, '교차로', '날짜 지정 에러');
                break;
              case 0x04:
                setLog(1, 19, 2, 0, 0, lcno, '교차로', '플랜번호 5 초과');
                break;
              case 0x05:
                setLog(1, 19, 2, 0, 0, lcno, '교차로', '일반제 플랜 없음');
                break;
              case 0x06:
                setLog(1, 19, 2, 0, 0, lcno, '교차로', '시차제 플랜 없음');
                break;
              case 0x07:
                setLog(1, 19, 3, 0, 0, lcno, '교차로', '플랜번호 5 초과');
                break;
              case 0x08:
                setLog(1, 19, 3, 0, 0, lcno, '교차로', '일반제 플랜 없음');
                break;
              case 0x09:
                setLog(1, 19, 3, 0, 0, lcno, '교차로', '시차제 플랜 없음');
                break;
              case 0x0A:
                setLog(1, 19, 4, 0, 0, lcno, '교차로', '발생');
                break;
              case 0x10:
                setLog(1, 19, 16, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x11:
                setLog(1, 19, 17, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x12:
                setLog(1, 19, 18, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x13:
                setLog(1, 19, 19, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x14:
                setLog(1, 19, 20, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x15:
                setLog(1, 19, 21, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x16:
                setLog(1, 19, 22, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x17:
                setLog(1, 19, 23, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x18:
                setLog(1, 19, 24, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x19:
                setLog(1, 19, 25, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x20:
                setLog(1, 19, 32, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x21:
                setLog(1, 19, 33, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x22:
                setLog(1, 19, 34, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x23:
                setLog(1, 19, 35, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x24:
                setLog(1, 19, 36, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x25:
                setLog(1, 19, 37, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x26:
                setLog(1, 19, 38, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x27:
                setLog(1, 19, 39, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x28:
                setLog(1, 19, 40, 0, 0, lcno, '교차로', '에러 발생');
                break;
              case 0x29:
                setLog(1, 19, 41, 0, 0, lcno, '교차로', '에러 발생');
                break;
            }
          } else {
            setLog(1, 19, 0, 0, 0, lcno, '교차로', 'DB 에러 정상화');
          }
        }

        if(pre_data.cur_period != json_data.cur_period) {
          if(Math.abs(pre_data.cur_period-json_data.cur_period) > 2) {
            setLog(1, 33, 26, 0, 0, lcno, '교차로', `${pre_data.cur_period}초 -> ${json_data.cur_period}초로 주기 변경`)
          }
        }

        const id = relcinfo.indexOf(pre_data);
        relcinfo.splice(id, 1);
        //console.log('비교 후 삭제완료');
        relcinfo.push(json_data);
      
      } 

      else {
        relcinfo.push(json_data); // 이전 데이터가 없으므로 현재 교차로 lcstatus 정보를 넣는다.
      }

    } else { // 이전 데이터 배열 확인 (배열이 비었을 때)
      console.log('이전 데이터 배열이 비었습니다.');
      relcinfo.push(json_data);
      //console.log(lcname);
    }
  // });
  //console.log(relcinfo);
  return _data;
}

global.relcinfo = new Array();
global.retfdtinfo = new Array();

const lctype_2010 = 2;
const lctype_2004 = 1;

function Make_STARTUP_UP(lcdt, ticketno, lcno) {
  console.log(lcdt);

  let lctype = lctype_2010;
  let  _data = "";
  let index = 0;

  if (typeof(lcAllList[lcno]) != 'undefined') {
    lctype = lcAllList[lcno].lctype
  }
  
  if (lctype == lctype_2010) {
    _data = `{
      "ticketno" : ${ticketno},
      "data" : {
        "1" : [${sliceByte(lcdt[0], 1, 3, 1, 2, 1)}],
        "2" : [${sliceByte(lcdt[1], 4, 4)}],
        "3" : [${sliceByte(lcdt[2], 8)}],
        "4" : [${sliceByte(lcdt[3])}],
        "5" : [${sliceByte(lcdt[4], 8)}],
        "6" : [${sliceByte(lcdt[5], 8)}],
        "7" : [${sliceByte(lcdt[6], 8)}],
        "8" : [${sliceByte(lcdt[7], 8)}],
        "9" : [${sliceByte(lcdt[8], 8)}],
        "10" : [${sliceByte(lcdt[9], 8)}],
        "11" : [${sliceByte(lcdt[10], 8)}],
        "12" : [${sliceByte(lcdt[11], 8)}],
        "13" : [${sliceByte(lcdt[12], 8)}],
        "14" : [${sliceByte(lcdt[13], 1, 1, 1, 5)}],
        "15" : [${sliceByte(lcdt[14], 2, 1, 1, 3, 1)}],
        "16" : [${sliceByte(lcdt[15], 8)}],
        "17" : [${sliceByte(lcdt[16], 8)}],
        "18" : [${sliceByte(lcdt[17], 1, 1, 2, 2, 2)}],
        "19" : [${sliceByte(lcdt[18], 2, 3, 3)}]
      }
    }`;
  } else {

    var ringOpt = sliceByte(lcdt[index++], 1, 3, 3, 1); // {'fullact', 'dualtime', 'spillcont', 'ring'}
    var mainPhase = sliceByte(lcdt[index++], 4, 4);
    var dualPhase = sliceByte(lcdt[index++], 8);
    var manualopt = sliceByte(lcdt[index++], 1,1,1,1,1,1,1,1);
    var spcmain = sliceByte(lcdt[index++], 8);
    var spcdual = sliceByte(lcdt[index++], 8);
    var gaptime = sliceByte(lcdt[index++], 8);
    var lmtlos = sliceByte(lcdt[index++], 8);


    _data = `{
      "ticketno" : ${ticketno},
      "data" : {
        "1" : [${ringOpt[1]}, ${ringOpt[2]}, ${ringOpt[3]}],
        "2" : [${mainPhase[0]}, ${mainPhase[1]}],
        "3" : [${dualPhase[0]}],
        "4" : [${manualopt[7]}],
        "5" : [${spcmain[0]}],
        "6" : [${spcdual[0]}],
        "7" : [${gaptime[0]}],
        "8" : [${lmtlos[0]}]
      }
    }`;
  }
  
  console.log(_data);
  return _data;
}

function MAKE_ACK_RSP(lcdt, ticketno) {
  let _data = `{
              "ticketno" : ${ticketno},
              "data" : 1
            }`;
  return _data;
}

function MAKE_DW_CLOCK_RSP(lcdt, ticketno,lcno) {
  let _data = `{
              "ticketno" : 999,
              "data" : ${lcno}
            }`;
  return _data;
}


function MAKE_SIG_DW_RSP(lcdt, ticketno, lcno) {

  let lctype = lctype_2010;
  let  _data = "";
  if (typeof(lcAllList[lcno]) != 'undefined') {
    lctype = lcAllList[lcno].lctype
  }
  
  if (lctype == lctype_2010) {
    _data = `{
                "ticketno" : ${ticketno},
                "data" : ${lcdt[0]}
              }`;
    return _data;
  }
  else
  {
    _data = `{
      "ticketno" : ${ticketno},
      "data" : 0
        }`;
    return _data;
  }
}



var maptype2004 = 
[
  {ring: 1, planclss : 0, code : 0x08}, 
  {ring: 2, planclss : 0, code : 0x0C},
  {ring: 1, planclss : 1, code : 0xF8}, 
  {ring: 2, planclss : 1, code : 0xFC}
];

function MAKE_SIG_UP_RSP(lcdt, ticketno, lcno) {
  LogWrite(logError ,lcdt);



  var spslspss = Array.prototype.slice.call(lcdt, 2)

  let lctype = lctype_2010;
  let  _data = "";
  if (typeof(lcAllList[lcno]) != 'undefined') {
    lctype = lcAllList[lcno].lctype
  }
  
  if (lctype == lctype_2010) 
  {

  // lcdt.splice(0,2);
  //console.log(  spslspss);
  
  let mappaing = sliceByte(lcdt[0], 4, 4);
  let ring = mappaing[0];
  let planclass = mappaing[1];

    _data = `{
        "ticketno" : ${ticketno},
        "data" : ${sigDecompress(spslspss, lcno, ring, planclass)}
      }`;
  }
  else
  {

    let mappaing = lcdt[0];
    
    let result = maptype2004.filter(value => value.code == mappaing);

    let ring = result[0].ring;
    let planclass = result[0].planclss;

    _data = `{
      "ticketno" : ${ticketno},
      "data" : ${sigDecompress2004(spslspss, lcno, ring, planclass)}
    }`;
  } 

  console.log(_data);
  return _data;
}



function Make_FLASH_UP(lcdt, ticketno, lcno) {
  let index = 0;
  let _data = ""; 

  let lctype = lctype_2010;

  if (typeof(lcAllList[lcno]) != 'undefined') {
    lctype = lcAllList[lcno].lctype
  }

  if (lctype == lctype_2010) {
   _data = `{
      "ticketno" : ${ticketno},
      "data" : {
        "lcno" : ${lcno},
        "veh1" : ${lcdt[index++]},
        "ped1" : ${lcdt[index++]},
        "veh2" : ${lcdt[index++]},
        "ped2" : ${lcdt[index++]},
        "veh3" : ${lcdt[index++]},
        "ped3" : ${lcdt[index++]},
        "veh4" : ${lcdt[index++]},
        "ped4" : ${lcdt[index++]},
        "veh5" : ${lcdt[index++]},
        "ped5" : ${lcdt[index++]},
        "veh6" : ${lcdt[index++]},
        "ped6" : ${lcdt[index++]},
        "veh7" : ${lcdt[index++]},
        "ped7" : ${lcdt[index++]},
        "veh8" : ${lcdt[index++]},
        "ped8" : ${lcdt[index++]},
        "flashtime" : ${lcdt[index++]},
        "variabcntl" : 0
      }
    }`;
  } else {
    _data = `{
      "ticketno" : ${ticketno},
      "data" : {
        "lcno" : ${lcno},
        "veh1" : ${lcdt[index++]},
        "ped1" : ${lcdt[index++]},
        "veh2" : ${lcdt[index++]},
        "ped2" : ${lcdt[index++]},
        "veh3" : ${lcdt[index++]},
        "ped3" : ${lcdt[index++]},
        "veh4" : ${lcdt[index++]},
        "ped4" : ${lcdt[index++]},
        "veh5" : ${lcdt[index++]},
        "ped5" : ${lcdt[index++]},
        "veh6" : ${lcdt[index++]},
        "ped6" : ${lcdt[index++]},
        "variabcntl" :  ${lcdt[index++]},
        "flashtime" : ${lcdt[index++]}
      }
    }`;
  }


  /*
  
          "lcno" : ${lcno},
        "veh1" : ${lcdt[index++]},
        "ped1" : ${lcdt[index++]},
        "veh2" : ${lcdt[index++]},
        "ped2" : ${lcdt[index++]},
        "veh3" : ${lcdt[index++]},
        "ped3" : ${lcdt[index++]},
        "veh4" : ${lcdt[index++]},
        "ped4" : ${lcdt[index++]},
        "veh5" : ${lcdt[index++]},
        "ped5" : ${lcdt[index++]},
        "veh6" : ${lcdt[index++]},
        "ped6" : ${lcdt[index++]},
        "veh7" : ${lcdt[index++]},
        "ped7" : ${lcdt[index++]},
        "veh8" : ${lcdt[index++]},
        "ped8" : ${lcdt[index++]},
        "flashtime" : ${lcdt[index++]},
        "variabcntl" :  ${lcdt[index++]}
  */
  console.log(_data);
  return _data;
}


function Make_DAYPLAN_UP(lcdt, ticketno) {
  //let index = 0;
  var dindex = sliceByte(lcdt[0], 4, 4);
  console.log(dindex);
  var tempbuffer = "";
  for (let i = 0; i < 8; i++) {
    let index = 1;
    var buffer = `
      {
        "sa_starthour": ${lcdt[(i * 20) + index++]},
        "sa_startmin": ${lcdt[(i * 20) + index++]},
        "sa_cycle": ${lcdt[(i * 20) + index++]},
        "offset": ${lcdt[(i * 20) + index++]},
        "asplit1": ${lcdt[(i * 20) + index++]},
        "bsplit1": ${lcdt[(i * 20) + index++]},
        "asplit2": ${lcdt[(i * 20) + index++]},
        "bsplit2": ${lcdt[(i * 20) + index++]},
        "asplit3": ${lcdt[(i * 20) + index++]},
        "bsplit3": ${lcdt[(i * 20) + index++]},
        "asplit4": ${lcdt[(i * 20) + index++]},
        "bsplit4": ${lcdt[(i * 20) + index++]},
        "asplit5": ${lcdt[(i * 20) + index++]},
        "bsplit5": ${lcdt[(i * 20) + index++]},
        "asplit6": ${lcdt[(i * 20) + index++]},
        "bsplit6": ${lcdt[(i * 20) + index++]},
        "asplit7": ${lcdt[(i * 20) + index++]},
        "bsplit7": ${lcdt[(i * 20) + index++]},
        "asplit8": ${lcdt[(i * 20) + index++]},
        "bsplit8": ${lcdt[(i * 20) + index++]},
        "sum_asplit": ${0},
        "sa_offset": ${0},
        "tplanindex": ${(dindex[1] == 1 ? 8 : 0) + i + 1}
      }`;

    if (7 != i) {
      buffer += ",";
    }
    tempbuffer += buffer;
  };


  let _data = `{
      "ticketno" : ${ticketno},
      "data": [
        ${tempbuffer}
      ]
    }`;

  // console.log(_data);
  return _data;
}


function Make_WEEKPLAN_UP(lcdt, ticketno) {
  let index = 0;
  var tempbuffer = "";
  for (let i = 0; i < 7; i++) {

    var buffer = `
      {
        "sa_no": ${0},
        "sa_week": ${i},
        "sa_dplan": ${lcdt[i]}
      }`;

    if (6 != i) {
      buffer += ",";
    }
    tempbuffer += buffer;
  };


  let _data = `{
      "ticketno" : ${ticketno},
      "data": [
        ${tempbuffer}
      ]
    }`;

  console.log(_data);
  return _data;
}


function Make_HOLIPLAN_UP(lcdt, ticketno) {

  var tempbuffer = "";
  for (let i = 0; i < 30; i++) {
    let index = i * 3;
    var buffer = `
      {
        "sa_no": 0,
        "sa_hplanindex": ${i + 1},
        "sa_mon": ${lcdt[index++]},
        "sa_day": ${lcdt[index++]},
        "sa_dplan": ${lcdt[index]}
      }`;

    if (29 != i) {
      buffer += ",";
    }
    tempbuffer += buffer;
  };


  let _data = `{
      "ticketno" : ${ticketno},
      "data": [
        ${tempbuffer}
      ]
    }`;

  console.log(_data);
  return _data;
}

function Make_RESEPLAN_UP(lcdt, ticketno, lcno) {

  var tempbuffer = "";
  for (let i = 0; i < 10; i++) {
    let index = i * 8;
    var buffer = `
      {
        "fplanindex":${i + 1},
        "lcno":${lcno},
        "rsrvmonth":${lcdt[index++]},
        "rsrvday":${lcdt[index++]},
        "rsrvwkd":${lcdt[index++]},
        "cntlstarthour": ${lcdt[index++]},
        "cntlstartmin": ${lcdt[index++]},
        "cntlendhour": ${lcdt[index++]},
        "cntlendmin": ${lcdt[index++]},
        `;
      let type = sliceByte(lcdt[index++], 4, 4);
      buffer +=
      `
        "cntltype": ${type[1]},
        "cntlspcno": ${type[0]}
      }`;

    if (9 != i) {
      buffer += ",";
    }
    tempbuffer += buffer;
  };


  let _data = `{
      "ticketno" : ${ticketno},
      "data": [
        ${tempbuffer}
      ]
    }`;

  console.log(_data);
  return _data;
}


function Make_DIR_PED_UP(lcdt, ticketno, lcno) {

  var tempbuffer = "";
  let index = 0;
  for (let i = 0; i < 10; i++) {

    var buffer = `
      {
        
        "lcno":${lcno},
        "outdir":${i + 1},`;
    var tlWhether = sliceByte(lcdt[index++], 3, 2, 1, 1, 1);
    buffer += `
        "vehyn":${tlWhether[4] == 1 ? true : false},
        "pedbikeyn":${tlWhether[3] == 1 ? true : false},
        "pedyn":${tlWhether[2] == 1 ? true : false},
        "insyn": ${tlWhether[1]},
        "insdir": ${tlWhether[0]},`
    var goCir = sliceByte(lcdt[index++], 4, 4);
    buffer += `
        "golsu": ${goCir[0]},
        "gosort": ${goCir[1]},`
    var leftCir = sliceByte(lcdt[index++], 4, 4);
    buffer += `
        "leftlsu": ${leftCir[0]},
        "leftsort": ${leftCir[1]},`


    var tempArray = sliceByte(lcdt[index++], 4, 4);
    buffer += `
        "pedlsu": ${tempArray[0]},
        "pedsort": ${tempArray[1]},`

    tempArray = sliceByte(lcdt[index++], 4, 4);
    buffer += `
        "bikelsu": ${tempArray[0]},
        "bikesort": ${tempArray[1]},`

    tempArray = sliceByte(lcdt[index++], 4, 4);
    buffer += `
        "rightlsu": ${tempArray[0]},
        "rightsort": ${tempArray[1]},`

    tempArray = sliceByte(lcdt[index++], 4, 4);
    buffer += `
        "buslsu": ${tempArray[0]},
        "bussort": ${tempArray[1]},`

    tempArray = sliceByte(lcdt[index++], 4, 4);
    buffer += `
            "genphase": ${tempArray[1]},
            "spcphase": ${tempArray[0]},`


    buffer += `
    "pedsolid": ${lcdt[index++]},
    "pedflash": ${lcdt[index++]},
  `;

    tempArray = sliceByte(lcdt[index++], 4, 4);
    buffer += `
        "genring": ${tempArray[1]},
        "spcring": ${tempArray[0]}},`

    tempbuffer += buffer;
  };
  let lsu1_8 = sliceByte(lcdt[index++], 1, 1, 1, 1, 1, 1, 1, 1);

  let lsu9_16 = sliceByte(lcdt[index++], 1, 1, 1, 1, 1, 1, 1, 1);

  tempbuffer += `
    {
      "int_lcno": ${lcno},
      "lsu01lamp": ${lsu1_8[7]},
      "lsu02lamp": ${lsu1_8[6]},
      "lsu03lamp": ${lsu1_8[5]},
      "lsu04lamp": ${lsu1_8[4]},
      "lsu05lamp": ${lsu1_8[3]},
      "lsu06lamp": ${lsu1_8[2]},
      "lsu07lamp": ${lsu1_8[1]},
      "lsu08lamp": ${lsu1_8[0]},
      "lsu09lamp": ${lsu9_16[7]},
      "lsu10lamp": ${lsu9_16[6]},
      "lsu11lamp": ${lsu9_16[5]},
      "lsu12lamp": ${lsu9_16[4]},
      "lsu13lamp": ${lsu9_16[3]},
      "lsu14lamp": ${lsu9_16[2]},
      "lsu15lamp": ${lsu9_16[1]},
      "lsu16lamp": ${lsu9_16[0]}
    }`
  let _data = `{
      "ticketno" : ${ticketno},
      "data": [
        ${tempbuffer}
      ]
    }`;
  return _data;
}

function Make_DIR_PED_DW(lcdt, ticketno) {
  let _data = `{
    "ticketno" : ${ticketno},
    "data" : [
      1
    ],
    "ERROR" : "${lcdt[0] == 0 ? "변경 안됨(중복지정 등 데이터 오류)" : " 변경완료"}"
  }`;
  LogWrite(logWarn, "Make_DIR_PED_DW", lcdt[0] == 0 ? "변경 안됨(중복지정 등 데이터 오류)" : " 변경완료");
  return _data;
}

function Make_CONFLICT_UP(lcdt, ticketno, lcno) {

  var tempbuffer = "";
  let index = 0;
  let x = 0, y = 0;
  var datas = sliceByte(lcdt[index++], 1, 1, 1, 1, 1, 1, 1, 1);
  for (let i = 1; i <= 1024; i++) {

    var buffer = `
      {
        "lcno":${lcno},
        "yno":${y},
        "xno":${x + (i - 1) % 32},
        "conflictyn":${datas[(i - 1) % 8]}
      }`;
    if (1024 != i) {
      buffer += ",";

      if (i % 8 == 0) {
        datas = sliceByte(lcdt[index++], 1, 1, 1, 1, 1, 1, 1, 1);
        //index++;
      }

      if (i % 32 == 0) {
        y++;
      }
    }



    tempbuffer += buffer;
  };


  let _data = `{
      "ticketno" : ${ticketno},
      "data": [
        ${tempbuffer}
      ]
    }`;

  //LogWrite(logWarn, "Make_CONFLICT_UP", _data);

  return _data;
}


function Make_DEVICE_UP(lcdt, ticketno) {
  let index = 0;
  let indexLen = 0;

  indexLen = 20;
  let mcu제조사 = bytesToString(lcdt, index, indexLen);
  index += indexLen;
  var mcu버전 = `${lcdt[index++]}.${lcdt[index++]}.${lcdt[index++]}.`; mcu버전 += `${bytesToNum(lcdt, index, index + 2)}`; index += 2;
  var mcu빌드날짜 = `${bytesToNum(lcdt, index, index + 2)}년 ${lcdt[index + 2]}월 ${lcdt[index + 3]}일`;
  index += 4;
  var mcu신호등형태 = `${lcdt[index++] == 0 ? '3색' : '4색'}`
  indexLen = 15;
  let mcu연락처 = bytesToString(lcdt, index, indexLen);
  index += indexLen;
  let DET1 = lcdt[index++];
  let DET2 = lcdt[index++];
  let DET3 = lcdt[index++];
  let DET4 = lcdt[index++];
  let DET5 = lcdt[index++];
  let DET6 = lcdt[index++];
  let DET7 = lcdt[index++];
  let DET8 = lcdt[index++];
  let OPT1 = lcdt[index++];
  let OPT2 = lcdt[index++];
  let OPT3 = lcdt[index++];
  let OPT4 = lcdt[index++];
  let OPT5 = lcdt[index++];
  let OPT6 = lcdt[index++];
  let OPT7 = lcdt[index++];
  let OPT8 = lcdt[index++];
  //index++;

  indexLen = 20;
  var scu제조사 = bytesToString(lcdt, index, indexLen);
  index += indexLen;
  var scu버전 = `${lcdt[index++]}.${lcdt[index++]}.${lcdt[index++]}.`; scu버전 += `${bytesToNum(lcdt, index, index + 2)}`; index += 2;
  var scu빌드날짜 = `${bytesToNum(lcdt, index, index + 2)}년 ${lcdt[index + 2]}월 ${lcdt[index + 3]}일`;
  index += 4;
  var scu신호등형태 = `${lcdt[index++] == 0 ? '3색' : '4색'}`
  indexLen = 15;
  var scu연락처 = bytesToString(lcdt, index, indexLen);
  index += indexLen;
  let LSU01 = lcdt[index++];
  let LSU02 = lcdt[index++];
  let LSU03 = lcdt[index++];
  let LSU04 = lcdt[index++];
  let LSU05 = lcdt[index++];
  let LSU06 = lcdt[index++];
  let LSU07 = lcdt[index++];
  let LSU08 = lcdt[index++];
  let LSU09 = lcdt[index++];
  let LSU10 = lcdt[index++];
  let LSU11 = lcdt[index++];
  let LSU12 = lcdt[index++];
  let LSU13 = lcdt[index++];
  let LSU14 = lcdt[index++];
  let LSU15 = lcdt[index++];
  let LSU16 = lcdt[index++];

  let _data = `{
      "ticketno" : ${ticketno},
      "data":
      {
        "mcu제조사" : "${mcu제조사}",
        "mcu버전" : "${mcu버전}",
        "mcu빌드날짜" : "${mcu빌드날짜}",
        "mcu신호등형태" : "${mcu신호등형태}",
        "mcu연락처" : "${mcu연락처}",
        "DET1" : "${DET1}",
        "DET2" : "${DET2}",
        "DET3" : "${DET3}",
        "DET4" : "${DET4}",
        "DET5" : "${DET5}",
        "DET6" : "${DET6}",
        "DET7" : "${DET7}",
        "DET8" : "${DET8}",
        "CPT1" : "${OPT1}",
        "CPT2" : "${OPT2}",
        "CPT3" : "${OPT3}",
        "CPT4" : "${OPT4}",
        "CPT5" : "${OPT5}",
        "CPT6" : "${OPT6}",
        "CPT7" : "${OPT7}",
        "CPT8" : "${OPT8}",        
        "scu제조사" : "${scu제조사}",
        "scu버전" : "${scu버전}",
        "scu빌드날짜" : "${scu빌드날짜}",
        "scu신호등형태" : "${scu신호등형태}",
        "scu연락처" : "${scu연락처}",
        "LSU01" : "${LSU01}",
        "LSU02" : "${LSU02}",
        "LSU03" : "${LSU03}",
        "LSU04" : "${LSU04}",
        "LSU05" : "${LSU05}",
        "LSU06" : "${LSU06}",
        "LSU07" : "${LSU07}",
        "LSU08" : "${LSU08}",
        "LSU09" : "${LSU09}",
        "LSU10" : "${LSU10}",
        "LSU11" : "${LSU11}",
        "LSU12" : "${LSU12}",
        "LSU13" : "${LSU13}",
        "LSU14" : "${LSU14}",
        "LSU15" : "${LSU15}",
        "LSU16" : "${LSU16}"
      }
    }`;

  return _data;
}




function Make_CLOCK_UP(lcdt, ticketno) {
  let index = 0;
  let 년 = lcdt[index++];
  let 월 = lcdt[index++];
  let 일 = lcdt[index++];
  let 시 = lcdt[index++];
  let 분 = lcdt[index++];
  let 초 = lcdt[index++];
  let 요일 = lcdt[index++];

  let _data = `{
      "ticketno" : ${ticketno},
      "data":
      {
        "년" : "${년}",
        "월" : "${월}",
        "일" : "${일}",
        "시" : "${시}",
        "분" : "${분}",
        "초" : "${초}",
        "요일" : "${요일}"
      }
    }`;


    console.log('재재')
  return _data;
}

function Make_NETWORK(lcdt, ticketno) {
  let index = 0;
  let LOCALIP = `${lcdt[index++]}.${lcdt[index++]}.${lcdt[index++]}.${lcdt[index++]}`;
  let NETMASK = `${lcdt[index++]}.${lcdt[index++]}.${lcdt[index++]}.${lcdt[index++]}`;
  let GATEWAY = `${lcdt[index++]}.${lcdt[index++]}.${lcdt[index++]}.${lcdt[index++]}`;
  let CENTERIP = `${lcdt[index++]}.${lcdt[index++]}.${lcdt[index++]}.${lcdt[index++]}`;
  let PORTNO = `${ReverseEndian(bytesToNum(lcdt, index, index + 2), 2)}`;
  index += 2;
  index += 2; //예비
  let MACADDR = bytesToString(lcdt, index, 18); index += 18;
  let COMMAND = lcdt[index++];
  let COMMODE = lcdt[index++];

  let _data = `{
      "ticketno" : ${ticketno},
      "data":
      {
        "LOCALIP" : "${LOCALIP}",
        "NETMASK" : "${NETMASK}",
        "GATEWAY" : "${GATEWAY}",
        "CENTERIP" : "${CENTERIP}",
        "PORTNO" : "${PORTNO}",
        "MACADDR" : "${MACADDR}",
        "COMMAND" : "${COMMAND}",
        "COMMODE" : "${COMMODE}"
      }
    }`;



  return _data;
}

/* 공통 정의 함수 */

function ReverseEndian(x, len) {
  buf = Buffer.allocUnsafe(len)
  buf.writeUIntLE(x, 0, len)
  return buf.readUIntBE(0, len)
}

function bytesToNum(data, st, end) {
  if (typeof data == 'number') {
    return data;
  } else {
    if (st==null) {
      return Number(parseInt(data.toString('hex'), 16));
    } else {
      return Number(parseInt(data.toString('hex', st, end), 16));
    }
  }
}

function bytesToString(datas, st, end) {
  var splicbuffer = datas.slice(st, st + end);
  const i = splicbuffer.indexOf(0x00);
  return splicbuffer.slice(0, i).toString("utf8");
}

function bitsToNum(data, st, end) {
  if (typeof data == 'number') {
    return data;
  } else {
    if (!st) {
      return Number(parseInt(data.toString('hex'), 2));
    } else {
      return Number(parseInt(data.toString('hex', st, end), 2));
    }
  }
}

function sliceByte(data) {
  let args = Array.isArray(arguments[1]) ? arguments[1] : Array.prototype.slice.call(arguments, 1);
  if (arguments.length == 1) {
    args = new Array(8);
    args.fill(1)
  }
  if (args.length && args.reduce((sum, cur) => {
    return sum + cur;
  }) == 8) {
    let result = new Array();
    let zero = new String();
    let bin = data.toString(2)
    let zeroleng = 8 - String(bin).length;
    for (let i = 0; i < zeroleng; i++) {
      zero += '0';
    }
    bin = zero + bin;
    let sum = 0;
    args.forEach((v, i) => {
      let res = bin.slice(sum, sum + v);
      sum += v;
      result.push(bitsToNum(res))
    })
    return result;

  } else {
    console.error('sliceByte fail args : ' + args)
  }
}


var queueObj = new Queue();
//Queue의 생성자 정의
function Queue(){
  this.dataStore = [];
  this.enqueue = enqueue;
  this.dequeue = dequeue;
  this.front = front;
  this.back = back;
  this.toString = toString;
  this.empty = empty;

  this.addpush = addpush;
  this.tempdata = [];
  setInterval(threadQueue,1)
}

//async function threadQueue()
function threadQueue()
{
  //LogWrite(logError , "TIMER go~");
  //while(true)
  {
    //if(QCount.QCount > 0)
    if(!queueObj.empty())
    {
      queueObj.addpush( queueObj.dequeue() );
      while( MainBody(queueObj.tempdata) == 1)
      {

      }
    }
  }
}
let tempindex = 0;

function findStxIndex(data)
{
  const find_FE = (element) => element == 0xFE;
  const find_FF = (element) => element == 0xFF;
  //let findIndex = -1;
  for(var i = 0; i<data.length; i++)
  {
    if(data[i] == 0xFE)
    {
      if(data.length>i+1)
      {
        if(data[i+1] == 0xFF)
        {
          return i;
        }
      }

    }

  }
  return -1;
}

function MainBody(data)
{
  //LogWrite(logInfo ,"MAIN DATA " ,data);
    let convert_data = Buffer.from(data);
    //let startindex = 0;
    //LogWrite(logInfo , "MainBody");
      //LogWrite(logInfo ,"MainBody " ,convert_data);
      // if (data.length < M_MIN_LEN) {
      //   //최소길이 적합성
      //   return -1;
      // }
      var mProtocol = new MProtocol();
      
      let index = 0;
      let sindex = findStxIndex(convert_data);
        if(sindex == -1)
        {
          LogWrite(logFatal , "STX NOT FIND :" ,convert_data );
          queueObj.tempdata.splice(0);
          return -1;
        }
        else
        {
         // LogWrite(logFatal , "STX FIND I:" ,sindex );
          index = sindex;
        }
    
      
        if (mProtocol.STX1_M == convert_data[index] && mProtocol.STX2_M == convert_data[index + 1]) {
          //STX 시작 확인 여부
          index += 2;
        }
        else {
          LogWrite(logFatal , "STX ERROR");
          queueObj.tempdata.splice(0);
          return -1;
        }


      
      if(convert_data.length >= index + 2)
      {
        mProtocol.DATA_LEN_M = bytesToNum(convert_data, index, index + 2); 
        index += 2;
        //LogWrite(logError ,"mProtocol.DATA_LEN_M " ,mProtocol.DATA_LEN_M);
      }
      else
      {
        LogWrite(logFatal , "DATA_LEN_M ERROR");
        queueObj.tempdata.splice(0);
        return -1;
      }



      
      if(convert_data.length >= 2 + mProtocol.DATA_LEN_M)
      {
        // if (mProtocol.DATA_LEN_M + 2 < data.length) {
        //   //길이 적합성 여부
        //   return -1;
        // }
      }
      else
      {
        //queueObj.tempdata.splice(0);
   LogWrite(logInfo ,"DATA LEN_M OVER " ,convert_data);
        LogWrite(logFatal , "DATA_LEN_M OVER");
        return -1;
      }
      mProtocol.RESULT_VALUE_M = convert_data[index++];
      
      mProtocol.OPCODE_M = convert_data[index++];
      //LogWrite(logError ,"mProtocol.OPCODE_M " ,mProtocol.OPCODE_M);
     // LogWrite(logError ,"index " ,index);
      //LogWrite(logError ,"LCNO_M " ,Number(parseInt(convert_data.toString('hex',sindex == 0?  index : index + 1, sindex == 0? index + 4:index +5), 16)));;
      mProtocol.LCNO_M = bytesToNum(convert_data, index, index + 4);
      //LogWrite(logError ,"mProtocol.LCNO_M " ,mProtocol.LCNO_M);
      index += 4;
      if ((mProtocol.DATA_LEN_M + 2) - M_MIN_LEN > 0) {
        //바디체크
        //mProtocol.BODY_M = convert_data.slice(index, convert_data.length - 1);
        //LogWrite(logFatal , "index " + sindex+index + ", LEN : " + bodyCHECKSUM_M);
        mProtocol.BODY_M = convert_data.slice(sindex+index, sindex + mProtocol.DATA_LEN_M + 1);
        

        //LogWrite(logError ,"mProtocol.BODY_M " ,mProtocol.BODY_M);

        //index += (convert_data.length - 1);
        //index += mProtocol.BODY_M.length;
        index += (mProtocol.DATA_LEN_M - 9)
        //LogWrite(logError ,"BODY index " ,index);
      }
      //mProtocol.CHECKSUM_M = convert_data[index];
      //LogWrite(logFatal , "index :" + index );
      let bodyCHECKSUM_M = convert_data[index++];
      
      
      var packets = convert_data.slice(0 + sindex,sindex + (mProtocol.DATA_LEN_M + 2));
      //LogWrite(logError ,"packets " ,packets);
      //LogWrite(logError , packets.length);
      let checkSum = 0;
         for(var i=2; i < packets.length-1; i++) {
            checkSum ^= packets[i]
         }
      //LogWrite(logFatal , "checkSum :" + checkSum + ", CHECKSUM_M : " + bodyCHECKSUM_M);
      if(bodyCHECKSUM_M == checkSum)
      {

        //LogWrite(logError , index);
        // switch(data[5]) {

        // }
        
        switch (mProtocol.OPCODE_M) {
          case 0x2B:
            console.log("인증(=세션)완료");
            console.log(convert_data);
            break;
          case 0x31:
            console.log("인증절자 응답");
            if(mProtocol.RESULT_VALUE_M == 1)
            {
              console.log("인증(=세션)완료");
            }
            else
            {
              console.log("인증절자 실패");
            }
            break;
          
          case OP_M_DEFAULT:
            {
            let id = (new Date()).toLocaleTimeString();
            MainBodySignalParser(id,mProtocol, mProtocol.LCNO_M);
            }
            break;
          case OP_M_DEFAULT_RSP: //41
            LogWrite(logTrace, "0x41 | OP_M_DEFAULT_RSP : ", packets);
            let lcno = bytesToNum(packets, 6, 10);
            let _data = bytesToNum(packets[10]);
      
            let type = 'ctlRes';
            for (i in sseCli) {
              let v = sseCli[i];
              let id = (new Date()).toLocaleTimeString();
              responseSSE(v.res, id, _data, type);
            }
            break;
          case 0x51: //CVIB
            {       
              let id = (new Date()).toLocaleTimeString();
              MainBodySignalControlParserCVIB(id,mProtocol, mProtocol.LCNO_M);
            }
            break;
          case 0x52: //PPC
            {       
              let id = (new Date()).toLocaleTimeString();
              MainBodySignalControlParserPPC(id,mProtocol, mProtocol.LCNO_M);
            }
            break;
          // case OP_M_SIGNAL_UPDATE_REQ:
          //   LogWrite(logTrace, "0x42 | OP_M_SIGNAL_UPDATE_REQ : ", packets);
          //   // let lcno = bytesToNum(packets, 6, 10);
          //   let _data = bytesToNum(packets[10]);
      
          //   let type = 'ctlRes';
          //   for (i in sseCli) {
          //     let v = sseCli[i];
          //     let id = (new Date()).toLocaleTimeString();
          //     responseSSE(v.res, id, _data, type);
          //   }
          //   break;
          default:
            LogWrite(logTrace, "default MAIN OPCDDE : " + mProtocol.OPCODE_M.toString() );
            break;
        }
      }
      else
      {
        // LogWrite(logFatal , "CHECKSUM ERROR");
        // LogWrite(logInfo ,"ORI DATA " ,convert_data);
        // LogWrite(logInfo ,"CUT DATA " ,packets );
        queueObj.tempdata = queueObj.tempdata.splice(sindex + 2 , convert_data.length - (sindex + 2))
        return 1;
        // queueObj.tempdata.splice(0);
        // return -1;
      }

      //if( convert_data.length - (index + 1) > 0)
      if( convert_data.length - index > 0)
      {
        queueObj.tempdata = queueObj.tempdata.splice(index , convert_data.length - index)
        return 1;
      }
      else
      {
        queueObj.tempdata.splice(0);
        return 0;
      }

}

function addpush(element)
{
  this.tempdata.push(...element);
}

function enqueue(element){
  //여기서 push함수는 Array의 내장함수이다.
  //요소를 배열 맨 뒤에 삽입.
  this.dataStore.push(element);
}

function dequeue(){
  //shift는 Array의 내장함수이다. 
  //배열내의 맨 앞 요소를 반환하고 배열내에서 삭제한다.
  return this.dataStore.shift();
}

//큐의 맨 젓번째 요소 반환
function front(){

  //배열의 첫번째 요소 반환
  return this.dataStore[0];
}


//큐의 맨 끝 요소 반환
function back(){

  //배열의 맨 끝 요소 반환
  return this.dataStore[this.dataStore.length-1];
}


//큐에 저장된 요소 모두 출력
function toString(){
  var retStr="";
  for(var i=0; i<this.dataStore.length; i++)
  {
      retStr=retStr + this.dataStore[i] + "\n";
  }
  return retStr;
}

//큐 비우기
function empty(){
  if(this.dataStore.length==0){
      return true;
  }
  else{
      return false;
  }
}

function Make_TFDT_INFO(lcdt, ticketno, lcno) {
  var strbuffer = "";
  let idx = 0;
  console.wr(`${lcno}교차로 검지기`)
  if (tfdtInfo && tfdtInfo[lcno] && tfdtInfo[lcno].length) {
    for(let i=0; i<32; i++) {
     if (tfdtInfo[lcno][i+1] && tfdtInfo[lcno][i+1].regflag) {
        let j=0;
      
        strbuffer += `{
          'CREATEDATE' : '',
          'TFDT_LC' : '${lcno}',
          'TFDT_CH' : '${i+1}',`;
  
        idx = 1;
        var data1 =  sliceByte(lcdt[i + (j * 32)] , 1,1,1,1,1,1,1,1); j++;
        strbuffer += `'VOLUME_ERROR':${data1[idx++]},`//볼륨 에러
        strbuffer += `'OCC_ERROR':${data1[idx++]},`//점유 에러
        strbuffer += `'NOCC_ERROR':${data1[idx++]},`//비점유 에러
        strbuffer += `'RASH_ERROR':${data1[idx++]},`//발진 상태
        strbuffer += `'SHORT_ERROR':${data1[idx++]},`//루프단락 상태
        strbuffer += `'MONO_ERROR':${data1[idx++]},`//루프단선 상태
        strbuffer += `'CARD_ERROR':${data1[idx++] ? 0 : 1},`//카드 실장 상태
        
        strbuffer += `'TFDT_NOCC':${lcdt[i + (j * 32)]},`; j++; //비점유
        strbuffer += `'TFDT_OCC':${lcdt[i + (j * 32)]},`; j++; //점유
        strbuffer += `'TFDT_REDVOL':${lcdt[i + (j * 32)]},`; j++; //교통량
        strbuffer += `'TFDT_DOCSTATUS':${lcdt[i + (j * 32)]},`; j++; //포화도상태
        strbuffer += `'TFDT_SFR':${lcdt[i + (j * 32)]},`; j++; //직좌:포화교통류율, 속도
        strbuffer += `'TFDT_SMT':${lcdt[i + (j * 32)]}}`; j++; //포화비점유시간
        strbuffer +=","
     }
    }
  }
  
  let _data = `{
      "ticketno" : ${ticketno},
      "data": "[${strbuffer}]"
    }`.replace('},]','}]');
  
  const pre_tfdt = JSON.parse(JSON.stringify(_data));
  const new_tfdt = JSON.parse(JSON.parse(pre_tfdt.replace(/(\r\n|\n|\r)/gm, "")).data.replace(/\'/g,'"'));
  
  if(retfdtinfo.length != 0) {
    if(new_tfdt) {
      for(var i=0; i<new_tfdt.length; i++) {
        const x_tfdt = retfdtinfo.find((el)=>Number(el.TFDT_LC) == Number(new_tfdt[i].TFDT_LC) && Number(el.TFDT_CH) == Number(new_tfdt[i].TFDT_CH));
        if(x_tfdt) {
          if(Number(x_tfdt.VOLUME_ERROR) != Number(new_tfdt[i].VOLUME_ERROR)) {
            if(Number(new_tfdt[i].VOLUME_ERROR) == 1) {
              setLog(3, 96, 1, 0, 0, Number(new_tfdt[i].TFDT_LC), '교차로', '교통량 에러');
            } else {
              setLog(3, 96, 1, 0, 0, Number(new_tfdt[i].TFDT_LC), '교차로', '교통량 에러 정상화');
            }
          }
          if(Number(x_tfdt.OCC_ERROR) != Number(new_tfdt[i].OCC_ERROR)) {
            if(Number(new_tfdt[i].OCC_ERROR == 1)) {
              setLog(3, 96, 1, 0, 0, Number(new_tfdt[i].TFDT_LC), '교차로', '점유 에러');
            } else {
              setLog(3, 96, 1, 0, 0, Number(new_tfdt[i].TFDT_LC), '교차로', '점유 에러 정상화');
            }
          }
          if(Number(x_tfdt.NOCC_ERROR) != Number(new_tfdt[i].NOCC_ERROR)) {
            if(Number(new_tfdt[i].NOCC_ERROR == 1)) {
              setLog(3, 96, 1, 0, 0, Number(new_tfdt[i].TFDT_LC), '교차로', '비점유 에러');
            } else {
              setLog(3, 96, 1, 0, 0, Number(new_tfdt[i].TFDT_LC), '교차로', '비점유 에러 정상화');
            }
          }
          if(Number(x_tfdt.RASH_ERROR) != Number(new_tfdt[i].RASH_ERROR)) {
            if(Number(new_tfdt[i].RASH_ERROR) == 1) {
              setLog(3, 96, 1, 0, 0, Number(new_tfdt[i].TFDT_LC), '교차로', '발진상태 에러');
            } else {
              setLog(3, 96, 1, 0, 0, Number(new_tfdt[i].TFDT_LC), '교차로', '발진상태 에러 정상화');
            }
          }
          if(Number(x_tfdt.SHORT_ERROR) != Number(new_tfdt[i].SHORT_ERROR)) {
            if(Number(new_tfdt[i].SHORT_ERROR) == 1) {
              setLog(3, 96, 1, 0, 0, Number(new_tfdt[i].TFDT_LC), '교차로', '루프 단락');
            } else {
              setLog(3, 96, 1, 0, 0, Number(new_tfdt[i].TFDT_LC), '교차로', '단락 정상화');
            }
          }
          if(Number(x_tfdt.MONO_ERROR) != Number(new_tfdt[i].MONO_ERROR)) {
            if(Number(new_tfdt[i].MONO_ERROR) == 1) {
              setLog(3, 96, 1, 0, 0, Number(new_tfdt[i].TFDT_LC), '교차로', '루프 단선');
            } else {
              setLog(3, 96, 1, 0, 0, Number(new_tfdt[i].TFDT_LC), '교차로', '루프 단선 정상화');
            }
          }
          if(Number(x_tfdt.CARD_ERROR) != Number(new_tfdt[i].CARD_ERROR)) {
            if(Number(new_tfdt[i].CARD_ERROR) == 1) {
              setLog(3, 96, 1, 0, 0, Number(new_tfdt[i].TFDT_LC), '교차로', '카드 실장');
            } else {
              setLog(3, 96, 1, 0, 0, Number(new_tfdt[i].TFDT_LC), '교차로', '카드 실장 에러');
            }
          }
          const id = retfdtinfo.indexOf(x_tfdt);
          retfdtinfo.splice(id, 1);
          retfdtinfo.push(new_tfdt[i]);
          // '비교 후 삭제완료'
        } else {
          retfdtinfo.push(new_tfdt[i]);
        }
      }
    }
  } else {
    console.log('이전 검지기 데이터 빔');
    if(new_tfdt) {
      for(var i=0; i<new_tfdt.length; i++) {
        retfdtinfo.push(new_tfdt[i]);
      }
    }
  }
  
  if (tfdtStat) (tfdtStat[lcno] = _data)
  return _data;
}