let express = require('express');
let router = express.Router();
let fetch = require('node-fetch');
let tcp = require('./tcp');
let fs = require('fs');
const session = require('express-session')
const cors = require('cors');

tcp.tcp();

// saLogin(()=>{
  setTfdtInfo();
  setLcAllList();
// })

/* login */
router.use(cors());
router.use(session({
  key: 'id',
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  // cookie: {
  //   signed: true //암호화
  //   //maxAge: 1000 * 60 * 60 * 2400 // 쿠키 유효기간 100일
  // }
}));

router.get('/login', function(req, res, next) {
  res.render('login', {projectName : projectName});
});

router.get('/lcAllListUpdate', async function(req, res, next) {
  const result = await setLcAllList();
  res.send({'data':result});
});

router.get('/getCurTOD', async function(req, res, next) {
  console.log('params')
  const {lcno, sano} = req.query;
  const result = await getCurTOD(lcno, sano);
  console.log('result123123')
  console.log(result[0])
  // console.log(result)
  res.send({'data':result});
});

router.get('/logout', function(req, res) {
  const a = req.session.user_id;
  const b = req.session.user_name;
  req.session.destroy(function(err){
    if(err) console.error('err', err);
    res.send('<script>alert("로그아웃 되었습니다!");location.href="/login";</script>');
    setLog(4, 160, 1, 0, a, a, b, '운영자 로그아웃');
  });
});

/* GET home page. */
router.post('/login', function(req, res){ // login process
  req.session.user_id = req.body.id; // superadmin
  req.session.user_pw = req.body.pw; // sa

  res.redirect('/')
})

router.get('/', function(req, res, next) {
  if(req.session.hasOwnProperty('user_id') == false){
    res.redirect('login');
  } else {
    if (req.headers.host) {
      global.nodejsIP = 'http://' + req.headers.host.split(':')[0];
    } 
    setTimeout(function () {
      fetch(_ctrlSv + 'Auth/LoginNew', {
        method : 'POST',
        body : `{
          "username" : "${req.session.user_id}", 
          "password" : "${req.session.user_pw}", 
          "macaddress" : "string"
        }`,
        headers : APIheader()
      }).then(async result => {
        let jsondt = await result.json();
        // setTimeout(async ()=>{
        if(jsondt.success == false){
          res.send('<script>alert("비밀번호 혹은 아이디가 잘못입력되었습니다.");location.href="/login";</script>');
        } else {
          // console.log('json!!!!!!!!!!! ' + JSON.stringify(jsondt))
          // console.log('json!!!!!!!!!!! ' + (Buffer.from(jsondt.data.token, 'base64').toString('utf8').split('}')[1] + '"}').replace(/\\\"/gi,"'"))
          // console.log((Buffer.from(jsondt.data.token, 'base64').toString('utf8').split('}')[1] + '"}').replace(/\\\"/gi,"'").replace(`""}`,'"}'))
          let user_token = jsondt.data.token;
          let a = Buffer.from(user_token, 'base64').toString('utf8')

          let _user_token = JSON.parse(a)
  
          req.session.user_no = _user_token.user_id;
          req.session.user_name = _user_token.user_name;
          req.session.authority = 4 - _user_token.is_system_admin;
          req.session.token = "Bearer " + user_token;
          req.session.user_json = _user_token.user_json != "''"? _user_token.user_json.replace(/\'/gi, '"') : null;

          fs.readdir('./public/stylesheets/pages', function(error, filelist){
            res.render('index', { 
              // token: svtoken,
              token: req.session.token,
              user_name: req.session.user_name,
              user_id: req.session.user_id,
              user_no: req.session.user_no,
              authority: req.session.authority,
              user_json: req.session.user_json,
      
              css: filelist,
              ctrlSv: _ctrlSv,
              nodejsIP: nodejsIP,
              mapsetup: JSON.stringify(mapsetup),
              projectName : projectName,
              isDev : isDev,
              SSEport : SSEport,

            });
          })

          setLog(4, 160, 0, 0, req.session.user_id, req.session.user_id, req.session.user_name, '운영자 로그인');
        }
      })
    })
  }
})

router.post('/updateSession', function (req, res, next) {
  console.log(req.session.user_json)
  console.log('updateSession!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  console.log(JSON.stringify(req.body))
  if (typeof req.session.user_json != 'undefined') {
    req.session.user_json = JSON.stringify(req.body);
  }
  res.send({'data':true})
})

router.post('/setLog', function(req, res, next) {
  console.log(req.body.data)
  setLog(...req.body.data)
  res.send({'data':true})
})

router.get('/getWAStime', function(req, res, next) {
  res.send({'data':new Date()})
})

router.get('/timeSyncUp', function(req, res, next) {
  res.send({'data':timeSync});
})

router.get('/setTfdtInfo', function(req, res, next) {
  setTfdtInfo();
  res.send({'data':true})
})

/*
for (var key in obj){
    console.log(key, obj[key]);
}

let OP_S_TFDT_CONFIG_UP1_REQ = 0xC6;
let OP_S_TFDT_CONFIG_UP1_RSP = 0xC7;

let OP_S_TFDT_INFO_UP2_REQ = 0xC8;
let OP_S_TFDT_INFO_UP2_RSP = 0xC9;
*/

function rqnoTask (res){
  //rqno += rqno > 250 ? -250 : 1;
  rqno++;
  if(rqno > 200)
    rqno = 0;
  tcpRqs[rqno] = res;
}

//---------------------------------------------------------------------------
router.post('/startup_up', function(req, res, next) {
  console.log('resasdfasdfasdfasd')
  console.log(req.body.data)
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    tcp.makeit(req.body.data, reqopcode.STARTUP_UP_REQ, rqno);
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
});
const lctype_2010 = 2;
const lctype_2004 = 1;

router.post('/startup_down', function(req, res, next) {
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    let lcno = req.body.data;
    // console.error(req.headers["authorization"])
    fetch(_ctrlSv + `NTCS_M_STARTUP/GetBy?LCNO=${lcno}`, {
      headers : APIheader(req.headers["authorization"])
    }).then(async (res)=>{
      let _r = await res.json()
      let r = _r.data[0];

      let lctype = lctype_2010;

      if (typeof(lcAllList[lcno]) != 'undefined') {
        lctype = lcAllList[lcno].lctype
      }
      LogWrite(logError,r);
      if (lctype == lctype_2004)
      {
        console.error(lctype)

        let _data = Buffer.alloc(8);

        _data[0] = arrToByte([r.dualtime,r.spillcont,r.ring], 4,3,1)
        _data[1] = arrToByte([r.actyn,r.genmain], 4,4)
        _data[2] = arrToByte([r.gendual], 8)
        _data[3] = arrToByte([r.manualopt] , 8)

        _data[4] = arrToByte([r.spcmain], 8)
        _data[5] = arrToByte([r.spcdual], 8)
        _data[6] = arrToByte([r.gaptime], 8)
        _data[7] = arrToByte([r.lmtlos], 8)
        LogWrite(logError,_data);
        tcp.makeit(lcno, reqopcode.STARTUP_DW_REQ, rqno, _data);
      }
      else
      {
        let _data = Buffer.alloc(25);
        _data[0] = arrToByte([r.fullact,r.dualtime,r.spillproc,r.spillcont,r.ring], 1,3,1,2,1)
        _data[1] = arrToByte([r.actyn,r.genmain], 4,4)
        _data[2] = arrToByte([r.gendual], 8)
        _data[3] = arrToByte([r.actphase2,r.actphase1,r.sigmapmtd,r.pushcycle,r.flashpushop,r.flashpush,r.normalpush,r.manualopt])
        _data[4] = arrToByte([r.spcmain], 8)
        _data[5] = arrToByte([r.spcdual], 8)
        _data[6] = arrToByte([r.gaptime], 8)
        _data[7] = arrToByte([r.lmtlos], 8)
        _data[8] = arrToByte([r.spc1dual], 8)
        _data[9] = arrToByte([r.spc2dual], 8)
        _data[10] = arrToByte([r.spc3dual], 8)
        _data[11] = arrToByte([r.spc4dual], 8)
        _data[12] = arrToByte([r.spc5dual], 8)
        _data[13] = arrToByte([r.preemergency, r.jumpphase, r.prebus, 0], 1,1,1,5)
        _data[14] = arrToByte([0, r.powerflash, r.powerdim, 0, r.checkmonth], 2,1,1,3,1)
        _data[15] = arrToByte([r.aringact], 8)
        _data[16] = arrToByte([r.bringact], 8)
        _data[17] = arrToByte([r.voice_res_yn, r.voiceyn, r.nightvol, r.dayvol, r.voicecycle], 1,1,2,2,2)
        _data[18] = arrToByte([r.time_res_yn, r.nightend, r.nightstart], 2,3,3)
        tcp.makeit(lcno, reqopcode.STARTUP_DW_REQ, rqno, _data);
      }
      
      
    })




  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
}); 
//---------------------------------------------------------------------------

//CH_JOB
//---------------------------------------------------------------------------
//검지기구성다운로드완료
router.post('/detector_config_down', function(req, res, next) {
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    let lcno = req.body.data;
    // console.error(req.headers["authorization"])
    //getAjax(_ctrlSv + 'NTCS_M_TFDTOPERATE/GetBy', `?LCNO=${lcno}`).then(result => {
    fetch(_ctrlSv + `NTCS_M_TFDTOPERATE/GetBy?LCNO=${lcno}`, {
      headers : APIheader(req.headers["authorization"])
    }).then(async (res)=>{
      let _r = await res.json()
      console.log('_r')
      console.log(lcno)
      console.log(_r)
      
      //let r = _r.data;
      // LogWrite(logDebug , JSON.stringify(_r.data[0]));
      let _data = Buffer.alloc(224);

      _r.data.forEach((v,i)=>{
        if(i>=32)
        {
         return;
        }
        
        let j = 0;
        console.log(lcno)
        LogWrite(logDebug , JSON.stringify(v));
        _data[(i * 7) + j] = typeof(v.tfdt_type) == "undefined" ? 0 : v.tfdt_type; j++;
        _data[(i * 7) + j] = typeof(v.tfdt_dir) == "undefined" ? 0 : v.tfdt_dir; j++;
        _data[(i * 7) + j] = typeof(v.tfdt_position) == "undefined" ? 0 : v.tfdt_position; j++;
        _data[(i * 7) + j] = typeof(v.tfdt_lane) == "undefined" ? 0 : v.tfdt_lane; j++;
        _data[(i * 7) + j] = typeof(v.tfdt_use) == "undefined" ? 0 : v.tfdt_use; j++;
        _data[(i * 7) + j] = typeof(v.tfdt_ring) == "undefined" ? 0 : v.tfdt_ring; j++;
        _data[(i * 7) + j] = typeof(v.tfdt_phase) == "undefined" ? 0 : v.tfdt_phase; j++;

        /*
        for(let j=2; j < 9; j++) {
          if(Object.keys(v).length  > j) // 2  > 2
          {
            _data[ (i * 7) + (j-2) ] = Object.values(v)[j];
          }
          else
          {
            _data[ (i * 7) + (j-2) ] = 0;

          }
        }
        */
      });

      LogWrite(logInfo , _data);
      tcp.makeit(lcno, reqopcode.TFDT_CONFIG_DW1_REQ, rqno, _data);
    })
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
}); 


//------------------------------------------------------------------------------
//스페셜커멘드
//교차로 온라인제어
router.post('/specialcmd_down', function(req, res, next) {
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    let datas = req.body.data; //?제이슨으로 받기 변경 필요
    console.log(datas)
    LogWrite(logInfo, "specialcmd_down ***************************************************************");
    let _data = Buffer.alloc(20);


    let td1 = arrToByte([
      datas.SHUTDOWN //소등
      ,datas.FLASH //점멸
      ,datas.LIGHT //조광
      ,datas.CONFLICT //모순사용
      ,datas.MANUAL //수동허용
      ,datas.CONFLICT_RESET //모순해제
      ,datas.SCU_RESET //SCU리셋
      ,datas.MCU_RESET //MCU리셋
    ] , 1,1,1,1,1,1,1,1);
    // let td1 = arrToByte([
    //   datas.MCU_RESET //MCU리셋
    //   ,datas.SCU_RESET //SCU리셋
    //   ,datas.CONFLICT_RESET //모순해제
    //   ,datas.MANUAL //수동허용
    //   ,datas.CONFLICT //모순사용
    //   ,datas.LIGHT //조광
    //   ,datas.FLASH //점멸
    //   ,datas.SHUTDOWN //소등
    // ] , 1,1,1,1,1,1,1,1);

    _data[0] = td1;


    let td2 = arrToByte([
      datas.TIME_CONROL //시차제적용
      ,datas.TRC_CONTROL //감응제어
      ,datas.PHASE_HOLD //현시유지
      ,datas.PHASE_OMIT //현시생략
      ,datas.SPILLBACK //앞막힘제어
      ,datas.XCONTROL //
      ,datas.PED_BUTTON //보행자버튼
      ,datas.PPC_CONTROL //PPC제어
    ] , 1,1,1,1,1,1,1,1);
    // let td2 = arrToByte([
    //   datas.PPC_CONTROL //PPC제어
    //   ,datas.PED_BUTTON //보행자버튼
    //   ,datas.XCONTROL //
    //   ,datas.SPILLBACK //앞막힘제어
    //   ,datas.PHASE_OMIT //현시생략
    //   ,datas.PHASE_HOLD //현시유지
    //   ,datas.TRC_CONTROL //감응제어
    //   ,datas.TIME_CONROL //시차제적용
    // ] , 1,1,1,1,1,1,1,1);

    _data[1] = td2;

    _data[2] = datas.EXECUTE; //0(disable/off) 1(enable/on)   2(ppc control only)  -> 8B~13B

    _data[3] = datas.EXECUTE_PHASE; //해당현시번호
    _data[4] = datas.PLANCLSS; //시차제 플랜번호
    _data[5] = datas.SPILLBACK_DIR; //spill back 방향


    let td7 = arrToByte([
      datas.MAIN_SPILLBACK //spill back 적용 주현시
      ,datas.SUB_SPILLBACK //spill back 적용 부현시
    ] , 4,4);

    _data[6] = td7;

    //여기서부터는 관리 기관코드 명령어 내리기
    /*
    let td8 = arrToByte([
      0 //PPC제어
      ,0 //보행자버튼
      ,datas[7].VEH_LIST // 기관등록차량목록응답요청
      ,datas[7].CODE_REG //관리기관코드등록
      ,datas[7].CODE_DEL //관리기관코드삭제
      ,datas[7].VEH_NO_REG //긴급우선차량번호/노선버스번호등록
      ,datas[7].VEH_NO_DEL //긴급우선차량번호/버스노선번호삭제
      ,datas[7].EMG_VEH //0:기급차량 , 1:기타
    ] , 1,1,1,1,1,1,1,1);
    _data[7] = td8;
    _data[8] = datas[8].AGENCY_CODE; //관리기관코드
    _data[9] = datas[9].VEH_NO1; //관리기관코드
    _data[10] = datas[10].VEH_NO2; //관리기관코드
    _data[11] = datas[11].VEH_NO3; //관리기관코드
    _data[12] = datas[12].VEH_NO4; //관리기관코드
    */

    _data[7] = 0;
    _data[8] = 0; //관리기관코드
    _data[9] = 0; //관리기관코드
    _data[10] = 0; //관리기관코드
    _data[11] = 0; //관리기관코드
    _data[12] = 0; //관리기관코드
    //여기서부터는 예비
    _data[13] = 0;
    _data[14] = 0;
    _data[15] = 0;
    _data[16] = 0;
    _data[17] = 0;
    _data[18] = 0;
    _data[19] = 0;
    console.log(_data)
    tcp.makeit(Number(datas.LCNO), reqopcode.SP_CMD_DOWN_REQ, rqno, _data);
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
}); 

//------------------------------------------------------------------------------
//그룹 온라인제어
router.post('/lccontrol_down', function(req, res, next) {
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    let datas = req.body.data;
    LogWrite(logInfo, "lccontrol_down ***************************************************************");
    LogWrite(logInfo, datas);
    LogWrite(logInfo, datas.RING);
    LogWrite(logInfo, datas.CODE);
    LogWrite(logInfo, datas.LCNO);
    let _data = Buffer.alloc(4);
    let td1 = arrToByte([
      datas.RING, //datas.RING_MODE //
      datas.CODE//,datas.CONTROL_CMD //
    ], 1,7);
    LogWrite(logInfo, td1);
    console.log(td1);
    _data[0] = td1;

    /*
    let td2 = arrToByte([
      datas.RING_B_ADVANCE //PPC제어
      ,datas.RING_A_ADVANCE //보행자버튼
    ] , 4,4);

    _data[1] = td2;
    */
    _data[1] = 0; //안씀
    _data[2] = 0; //예비
    _data[3] = 0; //예비


    // let lcs = datas[4].LcList.length;
    // for(let i=0; i<lcs; i++)
    // {
      tcp.makeit(Number(datas.LCNO), reqopcode.LC_CTL_DOWN_REQ, rqno, _data);
    //}
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
}); 

//01 01 01 22 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
//fe ff 00 28 f0 40 00 00 27 0f 7e 7e 1d 02 a3 01 01 01 22 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 9e b0
//충작
router.post('/detectorconfig_up', function(req, res, next) {
  console.log("detectorconfig_up");
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    tcp.makeit(req.body.data, reqopcode.TFDT_CONFIG_UP1_REQ, rqno);
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
});
//---------------------------------------------------------------------------
//시그널맵업로드
router.post('/signalmap_up', function(req, res, next) {
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    //let datas = req.body.data.split(',');
    let datas = JSON.parse(req.body.data);
    LogWrite(logInfo, datas);
    LogWrite(logInfo, "signalmap_up ***************************************************************");
    LogWrite(logDebug, reqopcode.SIGNAL_MAP_UP_REQ);
    LogWrite(logDebug, datas.LCNO);
    let _data = Buffer.alloc(1);

    //for(let i=0; i<2; i++)
    {
      _data[0] = Number(datas.ring);
      tcp.makeit(Number(datas.LCNO), reqopcode.SIGNAL_MAP_UP_REQ, rqno, _data);
    }
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
});


//다운로드
router.post('/signalmap_dw', function(req, res, next) {
  //LogWrite(logDebug, tcp.client);
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    let datas = req.body.data.split(',');
    // console.error(req.headers["authorization"])
    //getAjax(_ctrlSv + 'NTCS_M_TFDTOPERATE/GetBy', `?LCNO=${lcno}`).then(result => {
      
    fetch(_ctrlSv + `signal-map?lcno=${Number(datas[0])}&planclss=${Number(datas[3])}`, {
      headers : APIheader(req.headers["authorization"])
    }).then(async (res)=>{
      let _r = await res.json()
      //let r = _r.data;

      let lctype = lctype_2010;

      if (typeof(lcAllList[Number(datas[0])]) != 'undefined') {
        lctype = lcAllList[Number(datas[0])].lctype
      }
      LogWrite(logError,JSON.stringify(_r));
      if (lctype == lctype_2004)
      {
        var temp = sigCompress2004( JSON.stringify(_r));
        //var temp = sigCompress( sigData );
        LogWrite(logDebug , JSON.stringify(temp));
        //for(let j=0; j<2; j++)
        {
          let _dataA = Buffer.alloc(temp['aRing'].length + 2);
          // _dataA[0] = Number(datas[1]) +  Number(datas[3]);
          _dataA[0] = Number(datas[1]);
          _dataA[1] = temp['aRing'].length;
          for(let i=0; i<temp['aRing'].length; i++)
          {
            _dataA[i + 2] = temp['aRing'][i];
          }

          LogWrite(logInfo , _dataA);
          tcp.makeit(Number(datas[0]), reqopcode.SIGNAL_MAP_DW_REQ, rqno, _dataA);
        }


        {
          let _dataB = Buffer.alloc(temp['bRing'].length + 2);
          //_dataB[0] = Number(datas[2]) +  Number(datas[3]);
          _dataB[0] = Number(datas[2]);
          _dataB[1] = temp['bRing'].length;
          for(let i=0; i<temp['bRing'].length; i++)
          {
            _dataB[i + 2] = temp['bRing'][i];
          }

          LogWrite(logInfo , _dataB);
          tcp.makeit(Number(datas[0]), reqopcode.SIGNAL_MAP_DW_REQ, rqno, _dataB);
        }
      }
      else
      {

        var temp = sigCompress( JSON.stringify(_r));
        //var temp = sigCompress( sigData );
        LogWrite(logDebug , JSON.stringify(temp));
        //for(let j=0; j<2; j++)
        {
          let _dataA = Buffer.alloc(temp['aRing'].length + 2);
          _dataA[0] = Number(datas[1]) +  Number(datas[3]);
          _dataA[1] = temp['aRing'].length;
          for(let i=0; i<temp['aRing'].length; i++)
          {
            _dataA[i + 2] = temp['aRing'][i];
          }

          LogWrite(logInfo , _dataA);
          tcp.makeit(Number(datas[0]), reqopcode.SIGNAL_MAP_DW_REQ, rqno, _dataA);
        }


        {
          let _dataB = Buffer.alloc(temp['bRing'].length + 2);
          _dataB[0] = Number(datas[2]) +  Number(datas[3]);
          _dataB[1] = temp['bRing'].length;
          for(let i=0; i<temp['bRing'].length; i++)
          {
            _dataB[i + 2] = temp['bRing'][i];
          }

          LogWrite(logInfo , _dataB);
          tcp.makeit(Number(datas[0]), reqopcode.SIGNAL_MAP_DW_REQ, rqno, _dataB);
        }

      }
    })
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
}); 
function sigCompress(jData) {
  var aRingArr = new Array(32*19);
  var bRingArr = new Array(32*19);
  var sigJson = JSON.parse(jData);
  var dataArr = sigJson["data"];
  var aRingCompress;
  var bRingCompress;
  var i4A;
  var i4B;

  // lsu 순서로 된 json 데이터를 압축 할수 있는 step 순서 array 형태로 재 배열
  for(let i=0;i<32;i++) {
      i4A = i;
      i4B = i+32;
      if (dataArr[i4A]["ring"] == 1) {
          for (let j=1;j<9;j++) {
              aRingArr[i4A + ((2*j - 2)*32)] = dataArr[i4A]["veh" + j];
              aRingArr[i4A + ((2*j - 1)*32)] = dataArr[i4A]["ped" + j];
          }
          aRingArr[i + 16*32] = dataArr[i4A]["minsplit"];
          aRingArr[i + 17*32] = dataArr[i4A]["maxsplit"];
          aRingArr[i + 18*32] = dataArr[i4A]["eop"];
      }
      if (dataArr[i4B]["ring"] == 2) {
          for (let j=1;j<9;j++) {
              bRingArr[i + ((2*j - 2)*32)] = dataArr[i4B]["veh" + j];
              bRingArr[i + ((2*j - 1)*32)] = dataArr[i4B]["ped" + j];
          }
          bRingArr[i + 16*32] = dataArr[i4B]["minsplit"];
          bRingArr[i + 17*32] = dataArr[i4B]["maxsplit"];
          bRingArr[i + 18*32] = dataArr[i4B]["eop"];
      }
  }

  aRingCompress = codeCompress(aRingArr);
  bRingCompress = codeCompress(bRingArr);
  //console.log(aRingCompress);
  
  return {aRing: aRingCompress, bRing: bRingCompress};
}

function codeCompress(dArr) {
  var sp = 192; // 개수바이트 구별값,  hex 'C'
  var preNo = 10; // 이전(마지막) 값
  var curNo = dArr[0]; // 현재 값
  var cnt = 1; // 동일 개수 카운트
  var bArr = new Array(); 
  var arrCnt = 0;

  /********** LSU 부분 압축 시작 ***********/
  for (let i=1;i<32*16;i++) {
      if (dArr[i] == curNo) {
          if (i == 31 && curNo != 0) {

          } else {
              cnt++;
          }                    
      } else { 
          if (i == 31 && curNo == 0) break; // 마지막 0 인 경우 압축 생략
          if (cnt == 1) {    // 개수가 1 인 경우 개수 기록 생략 
              if (preNo == 0 || curNo == 0) { // 직전 숫자가 0 이거나 현재 숫자가 0 인 경우 개수 기록 
                  bArr[arrCnt++] =  sp + cnt;
              }
              if (curNo != 0) { // 0이 아닌 경우 값을 기록
                  bArr[arrCnt++] = parseInt(curNo,16);
              }
          } else if (cnt > 31) { // 개수가 31이 넘는 경우 1 byte 추가해서 개수 기록
              bArr[arrCnt++] = sp + 32 + parseInt(cnt / 256);
              bArr[arrCnt++] = parseInt(cnt%256);
          } else {
              bArr[arrCnt++] =  sp + cnt; // 개수가 2~31 인경우 1 byte 로 개수 기록
          }

          if (cnt > 1 && curNo != 0) {  // 개수가 2개 이상이고 현재 숫자가 0이 아닌 경우 값을 기록
              bArr[arrCnt++] = parseInt(curNo,16);
          }  
          
          //console.log(preNo + "," + curNo + "," + parseInt(bArr[arrCnt-2]).toString(16) + "," + parseInt(bArr[arrCnt-1]).toString(16)); 

          preNo = curNo;
          curNo = dArr[i]; 
          cnt = 1;                    
      }
  }
  bArr[arrCnt++] = 0; // LSU 와 Ring 속성 압축 구분자

  /********** Ring 속성 부분 압축 시작 ***********/
  
  var bProp = ""; // 비트값 결합용 임시 변수
  var fEOP = "11"; // min 3초 고정 EOP 
  var f3S = "10"; // min 3초 고정 not EOP
  var fN3S = "01"; // min 고정 , not 3초
  var vMax = "00"; // 가변 (max 값 할당됨)
  var ringValueArr = new Array(); // Ring Value 기록
  var rvArrCnt = 0;
  var minValue = 0; // min 값
  var maxValue = 0; // max 값
  var eopValue = 0; // eop 값
  var checkSum = 0;

  for (let i=0;i<32;i++) {
      minValue = dArr[i + (16*32)];
      maxValue = dArr[i + (17*32)];
      eopValue = dArr[i + (18*32)];

      if (maxValue == 0) {
          if (minValue== 3) {
              if (eopValue == 0)
                  bProp = f3S + bProp; // 3초 고정 (not EOP) 
              else
                  bProp = fEOP + bProp; // 3초의 고정 EOP
          } else if (minValue > 0) {
              bProp =  fN3S + bProp; // 3초외 시간으로 고정
              if (eopValue == 0) 
                  ringValueArr[rvArrCnt++] = minValue; // Ring 값 추가 (not eop)
              else 
                  ringValueArr[rvArrCnt++] = 128 + minValue; // Ring 값 추가 (eop)                        
          } else {
              if (i%4 != 0) {
                  bArr[arrCnt++] = parseInt(bProp, 2);
              }    
              break; // min,max 둘다 0 인 경우 압축 종료
          }
      } else{
          
          if (minValue == 0 && eopValue == 0) {
              bProp = vMax + bProp; // 가변 (MAX 값 지정)
              ringValueArr[rvArrCnt++] = maxValue; // Ring 값 추가 (not eop)
          } else if(minValue == 0) { 
              bProp = vMax + bProp; // 가변 (MAX 값 지정)
              ringValueArr[rvArrCnt++] = 1; 
              ringValueArr[rvArrCnt++] = maxValue; // Ring 값 추가 (eop) -> 2 bytes   
          } else {
              //bProp = vMax + bProp; // 가변 (MAX 값 지정)
              bProp = fN3S + bProp; // 2021.11.04 고정+가변+EOP 의 경우 '01'로 표기
              ringValueArr[rvArrCnt++] = 128 + minValue; 
              ringValueArr[rvArrCnt++] = maxValue; // Ring 값 추가 (eop) -> 2 bytes                       
          }

      }

      if ((i+1)%4 == 0) { // 1 byte가 만들어지면 배열에 추가하고 임시 변수 리셋
          bArr[arrCnt++] = parseInt(bProp, 2);
          bProp = "";
      } 

  }     

  bArr[arrCnt++] = 0; // Ring 속성과 Ring Value 압축 구분자 추가
  ringValueArr[rvArrCnt++] = 0; // 압축 종료 구분자 추가

  bArr = bArr.concat(ringValueArr); // 전체 압축 배열에 ring value 배열 병합
  
  checkSum = sigCheckSum(dArr);
  bArr[bArr.length] = parseInt(checkSum/256);
  bArr[bArr.length] = parseInt(checkSum%256);
  return bArr;
}


function sigCompress2004(jData) {
  var aRingArr = new Array(32*19);
  var bRingArr = new Array(32*19);
  var sigJson = JSON.parse(jData);
  var dataArr = sigJson["data"];
  var aRingCompress;
  var bRingCompress;
  var i4A;
  var i4B;

  // lsu 순서로 된 json 데이터를 압축 할수 있는 step 순서 array 형태로 재 배열
  for(let i=0;i<32;i++) {
      i4A = i;
      i4B = i+32;
      if (dataArr[i4A]["ring"] == 1) {
          for (let j=1;j<9;j++) {
              aRingArr[i*19 + ((2*j) - 2)] = parseInt(nullToZero(dataArr[i4A]["veh" + j]),16); // 10진수로 기록된 LSU 값을 16진수로 변경
              aRingArr[i*19 + ((2*j) - 1)] = parseInt(nullToZero(dataArr[i4A]["ped" + j]),16);
          }
          aRingArr[i*19 + 16] = nullToZero(dataArr[i4A]["minsplit"]);
          aRingArr[i*19 + 17] = nullToZero(dataArr[i4A]["maxsplit"]);
          aRingArr[i*19 + 18] = nullToZero(dataArr[i4A]["eop"]);
      }
      if (dataArr[i4B]["ring"] == 2) {
          for (let j=1;j<9;j++) {
              bRingArr[i*19 + ((2*j) - 2)] = parseInt(nullToZero(dataArr[i4B]["veh" + j]),16); // 10진수로 기록된 LSU 값을 16진수로 변경
              bRingArr[i*19 + ((2*j) - 1)] = parseInt(nullToZero(dataArr[i4B]["ped" + j]),16);
          }
          bRingArr[i*19 + 16] = nullToZero(dataArr[i4B]["minsplit"]);
          bRingArr[i*19 + 17] = nullToZero(dataArr[i4B]["maxsplit"]);
          bRingArr[i*19 + 18] = nullToZero(dataArr[i4B]["eop"]);
      }
  }

  aRingCompress = codeCompress2004(aRingArr,1);
  bRingCompress = codeCompress2004(bRingArr,1);
  //console.log(aRingCompress);
  
  return {aRing: aRingCompress, bRing: bRingCompress};
}

function nullToZero(value) {
  if (value == null || NaN || undefined) 
      return 0;
  else
      return value;
}

function codeCompress2004(dArr,opt) {
  const sp = 255; // 개수바이트 구별값,  hex 'FF'
  const B10 = "00";
  const B01 = "10";
  const B20 = "01";
  const BXX = "11";
  const idxEnd = "11";
  var bTxt = "";
  var idxTxt = "";
  var arr = new Array();
  var arrCnt = 0;
  var idxArr = new Array();
  var idxCnt = 0;
  var etcArr = new Array();
  var etcCnt = 0;

  /********** BitMap 부분 압축 시작 ***********/
  for (let i=0;i<32*19;i++) {
        if (dArr[i] == 0){ // 0 인 경우 bit 0 으로 기록
              bTxt = "0" + bTxt ;
        } else { 0 // 0 이 아닌 경우 bit 1 로 기록 
              bTxt = "1" + bTxt; 
              /************* 인덱스부 압축 시작 *******/
              switch (dArr[i]) {
                  case 1:
                      idxTxt = B01 + idxTxt;
                      break;
                  case 16:
                      idxTxt = B10 + idxTxt;
                      break;
                  case 32:
                      idxTxt = B20 + idxTxt;
                      break;
                  default:
                      idxTxt = BXX + idxTxt;
                      etcArr[etcCnt++] = dArr[i]; // 기타값 배열에 값 추가
                      break;
              }
              if (idxTxt.length == 8) {
                  if (opt == 0 && idxTxt == "11111111") idxTxt = "00000000"; // 인덱스부 "0xFF" 를 "0x00"으로 변환
                  idxArr[idxCnt++] = parseInt(idxTxt, 2);
                  idxTxt = "";
              }                    
        }

        if ((i+1)%8 == 0) {
            arr[arrCnt++] = parseInt(bTxt, 2);
            bTxt = "";
        }        
  }

  arr[arrCnt++] = 1; // 규격서에는 없지만 구분자 앞에 추가됨
  arr[arrCnt++] = sp; // bitmap 압축 종료 구분자

  idxTxt = idxEnd + idxTxt; // 인덱스부 끝을 나타내는 2bit '11' 을 추가   
  idxArr[idxCnt++] = parseInt(idxTxt, 2); // 인덱스부에 추가

  arr = arr.concat(idxArr);
  arr = arr.concat(sp); // 인덱스 부 구분자 추가

  arr = arr.concat(etcArr); // 기타 값 추가
  arr = arr.concat(0); // 기타값 종료 구분자 추가
  LogWrite(logFatal, arr);
  return arr;
}

function sigCheckSum(arr) {
  var rtVal = 0;
  var tArr = new Array(19*32);
  var idx = 0;
  /*
  for (let i=0;i<19*32;i++) {
      tArr[i] = arr[i];  
  }
  */

  for (let i=0;i<19*32;i++) {
      idx = parseInt(i/32) + parseInt(i%32)*19 + 1;
      if (arr[i] == 0) continue;
      if (i<16*32){
          rtVal = rtVal + parseInt(arr[i],16)*idx;
          //console.log(idx + "," + parseInt(arr[i],16) );
      }
      else {
          rtVal = rtVal + parseInt(arr[i])*idx;
          //console.log(idx + "," + parseInt(arr[i]) );
      }
  }

  if (rtVal >= 65536)
      rtVal = rtVal - 65536;

  return rtVal;

}
//---------------------------------------------------------------------------
//플래시맵
//업로드
router.post('/flashmap_up', function(req, res, next) {
  LogWrite(logInfo, "flashmap_up ***************************************************************");
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    tcp.makeit(req.body.data, reqopcode.FLASH_MAP_UP_REQ, rqno);
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
});
//다운로드
router.post('/flashmap_dw', function(req, res, next) {
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    let lcno = req.body.data;
    // console.error(req.headers["authorization"])
    //getAjax(_ctrlSv + 'NTCS_M_TFDTOPERATE/GetBy', `?LCNO=${lcno}`).then(result => {
    fetch(_ctrlSv + `NTCS_M_FLSMAP/GetBy?LCNO=${lcno}`, {
      headers : APIheader(req.headers["authorization"])
    }).then(async (res)=>{
      let _r = await res.json()

      
      //let r = _r.data;
      let lctype = lctype_2010;

      if (typeof(lcAllList[lcno]) != 'undefined') {
        lctype = lcAllList[lcno].lctype
      }
      LogWrite(logError,_r);
      if (lctype == lctype_2004)
      {
        let _data = Buffer.alloc(14);
        let index = 0;
        Object.values(_r.data[0]).forEach((v,i)=>{

          if(i==0 || i == 14)
          {
          ;
          }
          else
          {
            LogWrite(logInfo , v);
            _data[index++] = v;
          }
        });

        LogWrite(logInfo , _data);
        tcp.makeit(lcno, reqopcode.FLASH_MAP_DW_REQ, rqno, _data);
      }
      else
      {

        let _data = Buffer.alloc(17);
        let index = 0;
        Object.values(_r.data[0]).forEach((v,i)=>{

          if(i==0 || i == 17)
          {
          ;
          }
          else
          {
            LogWrite(logInfo , v);
            _data[index++] = v;
          }
        });

        LogWrite(logInfo , _data);
        tcp.makeit(lcno, reqopcode.FLASH_MAP_DW_REQ, rqno, _data);
      }
    })
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
}); 


//---------------------------------------------------------------------------
//일계획
//업로드
router.post('/dayplan_up', function(req, res, next) {
  LogWrite(logInfo, "dayplan_up ***************************************************************");
  if (typeof tcp.client != 'undefined') {
    var temp = req.body.data.split(',');

    rqnoTask(res);
    let _data = Buffer.alloc(1);
    // for(let i=0; i<2; i++)
    // {
      _data[0] = arrToByte([Number(temp[1]),temp[2]], 4,4);
      tcp.makeit(temp[0], reqopcode.DAY_PLAN_UP_REQ, rqno , _data);
    // }
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
});

//다운로드
router.post('/dayplan_dw', function(req, res, next) {
  LogWrite(logInfo, "dayplan_dw ***************************************************************");
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    var datas = req.body.data.split(',');
    // console.error(datas);
    //getAjax(_ctrlSv + 'NTCS_M_TFDTOPERATE/GetBy', `?LCNO=${lcno}`).then(result => {
    // fetch(_ctrlSv + `work-plan?lcno=${datas[0]}&tplan=${Number(datas[1])}`, {
    fetch(_ctrlSv + `work-plan/GetPLAN?lcno=${datas[0]}&tplan=${Number(datas[1])}`, {
      headers : APIheader(req.headers["authorization"])
    }).then(async (res)=>{
      let _r = await res.json()

      
      let r = _r.data;
      let _data = Buffer.alloc(161);
      let startindex = 0;
      let index = 0;
      for(let i=0; i<2; i++)
      {
        if( i % 2 == 1)
        {
          startindex = 8;
          index = 0;
        }
        _data[index++] = arrToByte( [Number(datas[1]),i], 4,4);
        for(let j=startindex; j<8 + startindex; j++)
        {
          if(j < r.length)
          {
            _data[index++] = r[j].starthour;
            _data[index++] = r[j].startmin;
            //_data[index++] = r[j].sa_cycle; 
            _data[index++] = r[j].asum;
            _data[index++] = r[j].offset;
            _data[index++] = r[j].asplit1;
            _data[index++] = r[j].bsplit1;
            _data[index++] = r[j].asplit2;
            _data[index++] = r[j].bsplit2;
            _data[index++] = r[j].asplit3;
            _data[index++] = r[j].bsplit3;
            _data[index++] = r[j].asplit4;
            _data[index++] = r[j].bsplit4;
            _data[index++] = r[j].asplit5;
            _data[index++] = r[j].bsplit5;
            _data[index++] = r[j].asplit6;
            _data[index++] = r[j].bsplit6;
            _data[index++] = r[j].asplit7;
            _data[index++] = r[j].bsplit7;
            _data[index++] = r[j].asplit8;
            _data[index++] = r[j].bsplit8;
          }
          else
          {
            _data[index++] = 0;
            _data[index++] = 0;     
            //_data[index++] = r[j].sa_cycle; 
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;
            _data[index++] = 0;

          }
        }
        
        tcp.makeit(datas[0], reqopcode.DAY_PLAN_DW_REQ, rqno, _data);
      }

      //LogWrite(logInfo , _data);
      
    })
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
}); 

//---------------------------------------------------------------------------
//주간
//업로드
router.post('/weekplan_up', function(req, res, next) {
  LogWrite(logInfo, "weekplan_up ***************************************************************");
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    tcp.makeit(req.body.data, reqopcode.WEEK_PLAN_UP_REQ, rqno);
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
});

//다운로드
router.post('/weekplan_dw', function(req, res, next) {
  LogWrite(logInfo, "weekplan_dw ***************************************************************");
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    let lcno = req.body.data;
    // console.error(datas);
    //getAjax(_ctrlSv + 'NTCS_M_TFDTOPERATE/GetBy', `?LCNO=${lcno}`).then(result => {
    fetch(_ctrlSv + `weekly-plan?lcno=${lcno}`, {
      headers : APIheader(req.headers["authorization"])
    }).then(async (res)=>{
      let _r = await res.json()

      
      let r = _r.data;
      //
      let _data = Buffer.alloc(7);
      let startindex = 0;
      let index = 0;

        for(let j=0; j<r.length; j++)
        {
          _data[r[j].sa_week] = r[j].sa_dplan;
      }
      LogWrite(logInfo ,"주간계획다운로드" ,_data);
      tcp.makeit(lcno, reqopcode.WEEK_PLAN_DW_REQ, rqno, _data);
      
      
    })
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
}); 


//---------------------------------------------------------------------------
//특수계획
//업로드
router.post('/holiplan_up', function(req, res, next) {
  LogWrite(logInfo, "holiplan_up ***************************************************************");
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    tcp.makeit(req.body.data, reqopcode.HOLI_PLAN_UP_REQ, rqno);
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
});

//다운로드
router.post('/holiplan_dw', function(req, res, next) {
  LogWrite(logInfo, "holiplan_dw ***************************************************************");
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    let lcno = req.body.data;
    // console.error(datas);
    //getAjax(_ctrlSv + 'NTCS_M_TFDTOPERATE/GetBy', `?LCNO=${lcno}`).then(result => {
    fetch(_ctrlSv + `holiday-plan?lcno=${lcno}`, {
      headers : APIheader(req.headers["authorization"])
    }).then(async (res)=>{
      let _r = await res.json()

      
      let r = _r.data;
      //
      let _data = Buffer.alloc(90);
      let startindex = 0;
      let index = 0;

      for(let j=0; j<r.length; j++)
      {
        let setindex = (r[j].sa_hplanindex - 1) * 3;
        _data[setindex++] = r[j].sa_mon;
        _data[setindex++] = r[j].sa_day;
        _data[setindex++] = r[j].sa_dplan;
      }
      LogWrite(logInfo ,"특수계획다운로드" ,_data);
      tcp.makeit(lcno, reqopcode.HOLI_PLAN_DW_REQ, rqno, _data);
      
      
    })
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
}); 

//---------------------------------------------------------------------------
//예약계획
//업로드
router.post('/rplan_up', function(req, res, next) {
  LogWrite(logInfo, "rplan_up ***************************************************************");
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    tcp.makeit(req.body.data, reqopcode.RESE_PLAN_UP_REQ, rqno);
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
});

//다운로드
router.post('/rplan_dw', function(req, res, next) {
  LogWrite(logInfo, "rplan_dw ***************************************************************");
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    let lcno = req.body.data;
    // console.error(datas);
    //getAjax(_ctrlSv + 'NTCS_M_TFDTOPERATE/GetBy', `?LCNO=${lcno}`).then(result => {
    fetch(_ctrlSv + `NTCS_M_RPLAN/GetBy?lcno=${lcno}`, {
      headers : APIheader(req.headers["authorization"])
    }).then(async (res)=>{
      let _r = await res.json()

      let r = _r.data;
      let _data = Buffer.alloc(80);
      let startindex = 0;
      let index = 0;

        for(let j=0; j<r.length; j++)
        {
          let setindex = (r[j].fplanindex - 1) * 8;
          _data[setindex++] = r[j].rsrvmonth;
          _data[setindex++] = r[j].rsrvday;
          _data[setindex++] = r[j].rsrvwkd;
          _data[setindex++] = r[j].cntlstarthour;
          _data[setindex++] = r[j].cntlstartmin;
          _data[setindex++] = r[j].cntlendhour;
          _data[setindex++] = r[j].cntlendmin;
          
          if (typeof r[j].cntlspcno != 'undefined') {
            //있을경우
            
            _data[setindex++] = arrToByte([r[j].cntlspcno,r[j].cntltype], 4,4);
          }
          else
          {
            //없을경우
            _data[setindex++] = r[j].cntltype;
          }
          
          

      }
      LogWrite(logInfo ,"예약제어다운로드" ,_data);
      tcp.makeit(lcno, reqopcode.RESE_PLAN_DW_REQ, rqno, _data);
      
      
    })
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
}); 

//---------------------------------------------------------------------------
//방향별출력맵
//업로드
router.post('/dirped_up', function(req, res, next) {
  LogWrite(logInfo, "dirped_up ***************************************************************");
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    tcp.makeit(req.body.data, reqopcode.DIR_PED_UP_REQ, rqno);
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
});

//다운로드
router.post('/dirped_dw', function(req, res, next) {
  LogWrite(logInfo, "dirped_dw ***************************************************************");
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    let lcno = req.body.data;
    // console.error(datas);
    //getAjax(_ctrlSv + 'NTCS_M_TFDTOPERATE/GetBy', `?LCNO=${lcno}`).then(result => {
    fetch(_ctrlSv + `ntcs_m_outped/${lcno}`, {
      headers : APIheader(req.headers["authorization"])
    }).then(async (res)=>{
      fetch(_ctrlSv + `ntcs_m_lsu/get-by-lcno?lcNo=${lcno}`, {
        headers : APIheader(req.headers["authorization"])
      }).then(async (res2)=>{
        let _r = await res.json()
        let _r2 = await res2.json();
        console.log('sddf')
        console.log(_r)
        console.log(_r2)
        let r = _r.data;
        let r2 = _r2.data;
        let _data = Buffer.alloc(119);
        let startindex = 0;
        let index = 0;

        for(let j=0; j<r.length; j++)
        {
          let setindex = (r[j].outdir - 1) * 11;
          _data[setindex++] = arrToByte([
            r[j].insdir
            , r[j].insyn
            , r[j].pedyn == true || r[j].pedyn == 'TRUE' ? 1 : 0
            , r[j].pedbikeyn == true || r[j].pedbikeyn == 'TRUE' ? 1 : 0
            , r[j].vehyn == true || r[j].vehyn == 'TRUE' ? 1 : 0 
          ], 3,2,1,1,1);
          _data[setindex++] = arrToByte([
              typeof( r[j].golsu )== 'undefined' ? 0 : r[j].golsu
              ,typeof( r[j].gosort )== 'undefined' ? 0 : r[j].gosort 
                                        ], 4,4);
          _data[setindex++] = arrToByte([
            typeof r[j].leftlsu == 'undefined' ? 0 : r[j].leftlsu
            ,typeof r[j].leftsort == 'undefined' ? 0 : r[j].leftsort
          ], 4,4);
          _data[setindex++] = arrToByte([
            typeof r[j].pedlsu == 'undefined' ? 0 : r[j].pedlsu
            ,typeof r[j].pedsort == 'undefined' ? 0 : r[j].pedsort
          ], 4,4);
          _data[setindex++] = arrToByte([
            typeof r[j].bikelsu == 'undefined' ? 0 : r[j].bikelsu
            ,typeof r[j].bikesort == 'undefined' ? 0 : r[j].bikesort
          ], 4,4);
          _data[setindex++] = arrToByte([
            typeof r[j].rightlsu == 'undefined' ? 0 : r[j].rightlsu
            ,typeof r[j].rightsort == 'undefined' ? 0 : r[j].rightsort
          ], 4,4);
          _data[setindex++] = arrToByte([
            typeof r[j].buslsu == 'undefined' ? 0 : r[j].buslsu
            ,typeof r[j].bussort == 'undefined' ? 0 : r[j].bussort
          ], 4,4);
          _data[setindex++] = arrToByte([
            
            typeof r[j].spcphase == 'undefined' ? 0 : r[j].spcphase
            ,typeof r[j].genphase == 'undefined' ? 0 : r[j].genphase
          ], 4,4);
          _data[setindex++] = r[j].pedsolid;
          _data[setindex++] = r[j].pedflash;
          _data[setindex++] = arrToByte([
            
            typeof r[j].spcring == 'undefined' ? 0 : r[j].spcring
            ,typeof r[j].genring == 'undefined' ? 0 : r[j].genring
          ], 4,4);
        }
        index = 110;
        _data[index++] = arrToByte([r2[0].lsu08lamp,r2[0].lsu07lamp,r2[0].lsu06lamp,r2[0].lsu05lamp,r2[0].lsu04lamp,r2[0].lsu03lamp,r2[0].lsu02lamp,r2[0].lsu01lamp], 1,1,1,1,1,1,1,1);
        _data[index++] = arrToByte([r2[0].lsu16lamp,r2[0].lsu15lamp,r2[0].lsu14lamp,r2[0].lsu13lamp,r2[0].lsu12lamp,r2[0].lsu11lamp,r2[0].lsu10lamp,r2[0].lsu09lamp], 1,1,1,1,1,1,1,1);

        tcp.makeit(lcno, reqopcode.DIR_PED_DW_REQ, rqno, _data);
      })  
      
      
      
    })
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
}); 



//---------------------------------------------------------------------------
//모순맵
//업로드
router.post('/conflict_up', function(req, res, next) {
  LogWrite(logInfo, "conflict_up ***************************************************************");
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    tcp.makeit(req.body.data, reqopcode.CONFLICT_UP_REQ, rqno);
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
});

//다운로드
router.post('/conflict_dw', function(req, res, next) {
  LogWrite(logInfo, "conflict_dw ***************************************************************");
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    let lcno = req.body.data;
    // console.error(datas);
    //getAjax(_ctrlSv + 'NTCS_M_TFDTOPERATE/GetBy', `?LCNO=${lcno}`).then(result => {
    fetch(_ctrlSv + `ntcs_m_conflict/${lcno}`, {
      headers : APIheader(req.headers["authorization"])
    }).then(async (res)=>{
      let _r = await res.json()

      let r = _r.data;
      let _data = Buffer.alloc(128);
      let startindex = 0;
      let index = 0 , j;

      if(r.length != 1024)
      {
        LogWrite(logError ,"모순맵다운로드 LENGTH ERROR");
        res.send({'ticketno':rqno})
        return;
      }

        for( j=0; j<r.length; j++)
        {

          //LogWrite(logInfo ,"jjjjjjjjjjjjjjjjjjjjjjjj : " ,j);
          let td = arrToByte([
            // r[j + 7].conflictyn
            // ,r[j + 6].conflictyn
            // ,r[j + 5].conflictyn
            // ,r[j + 4].conflictyn
            // ,r[j + 3].conflictyn
            // ,r[j + 2].conflictyn
            // ,r[j + 1].conflictyn
            // ,r[j + 0].conflictyn
            r[j + 0].conflictyn
            ,r[j + 1].conflictyn
            ,r[j + 2].conflictyn
            ,r[j + 3].conflictyn
            ,r[j + 4].conflictyn
            ,r[j + 5].conflictyn
            ,r[j + 6].conflictyn
            ,r[j + 7].conflictyn
          ] , 1,1,1,1,1,1,1,1);
            

            //if(startindex > 30 && startindex < 40)
            // {
              
              
            //   if(td > 0)
            //   {
            //     LogWrite(logInfo ,"startindex : " ,startindex);
            //     LogWrite(logInfo ,"j : " ,j);
            //     LogWrite(logInfo ,"모순맵다운로드 td" ,td);
            //     LogWrite(logInfo ,"conflictyn 0  : " ,r[j + 0].conflictyn);
            //     LogWrite(logInfo ,"conflictyn x  : " ,r[j + 0].xno);
            //     LogWrite(logInfo ,"conflictyn y  : " ,r[j + 0].yno);
            //     LogWrite(logInfo ,"conflictyn 1  : " ,r[j + 1].conflictyn);
            //     LogWrite(logInfo ,"conflictyn x  : " ,r[j + 1].xno);
            //     LogWrite(logInfo ,"conflictyn y  : " ,r[j + 1].yno);
            //     LogWrite(logInfo ,"conflictyn 2  : " ,r[j + 2].conflictyn);
            //     LogWrite(logInfo ,"conflictyn x  : " ,r[j + 2].xno);
            //     LogWrite(logInfo ,"conflictyn y  : " ,r[j + 2].yno);
            //     LogWrite(logInfo ,"conflictyn 3  : " ,r[j + 3].conflictyn);
            //     LogWrite(logInfo ,"conflictyn x  : " ,r[j + 3].xno);
            //     LogWrite(logInfo ,"conflictyn y  : " ,r[j + 3].yno);
            //     LogWrite(logInfo ,"conflictyn 4  : " ,r[j + 4].conflictyn);
            //     LogWrite(logInfo ,"conflictyn x  : " ,r[j + 4].xno);
            //     LogWrite(logInfo ,"conflictyn y  : " ,r[j + 4].yno);
            //     LogWrite(logInfo ,"conflictyn 5  : " ,r[j + 5].conflictyn);
            //     LogWrite(logInfo ,"conflictyn x  : " ,r[j + 5].xno);
            //     LogWrite(logInfo ,"conflictyn y  : " ,r[j + 5].yno);
            //     LogWrite(logInfo ,"conflictyn 6  : " ,r[j + 6].conflictyn);
            //     LogWrite(logInfo ,"conflictyn x  : " ,r[j + 6].xno);
            //     LogWrite(logInfo ,"conflictyn y  : " ,r[j + 6].yno);
            //     LogWrite(logInfo ,"conflictyn 7  : " ,r[j + 7].conflictyn);
            //     LogWrite(logInfo ,"conflictyn x  : " ,r[j + 7].xno);
            //     LogWrite(logInfo ,"conflictyn y  : " ,r[j + 7].yno);
            //   }
            // }
            // LogWrite(logInfo ,"MAIN startindex : " ,startindex);
            _data[startindex]  = td;
            startindex++;
            j += 7;
          
      }
      LogWrite(logInfo ,"모순맵다운로드" ,_data);
      
      //LogWrite(logInfo ,"j : " ,j);
      tcp.makeit(lcno, reqopcode.CONFLICT_DW_REQ, rqno, _data);
      
      
    })
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
}); 

//---------------------------------------------------------------------------
//디바이스
//업로드
router.post('/device_up', function(req, res, next) {
  LogWrite(logInfo, "device_up ***************************************************************");
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    tcp.makeit(req.body.data, reqopcode.DEVICE_UP_REQ, rqno);
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
});

//---------------------------------------------------------------------------
//시간설정
//업로드
router.post('/clock_up', function(req, res, next) {
  LogWrite(logInfo, "clock_up ***************************************************************");
  console.log(req.body)
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    LogWrite(logInfo, JSON.stringify(req.body.data.LCNO));
    tcp.makeit(Number(req.body.data.LCNO), reqopcode.CLOCK_UP_REQ, rqno);
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno, 'sendTime':new Date()})
});
//다운로드

router.post('/clock_dw', function(req, res, next) {
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    let tempData = req.body.data;
    let _data = Buffer.alloc(7);

    LogWrite(logInfo, JSON.stringify(tempData));

    _data[0] = Number( tempData.srvyear); // srvyear
    _data[1] = Number( tempData.srvmonth); // srvmonth
    _data[2] = Number( tempData.srvday); // srvday
    _data[3] = Number( tempData.srvhour); // srvhour
    _data[4] = Number( tempData.srvminute); // srvmin
    _data[5] = Number( tempData.srvsecond); // srvsec
    _data[6] = Number( tempData.srvdate); // srvdate
    
    timeSync.year = Number( tempData.srvyear); // srvyear
    timeSync.mon = Number( tempData.srvmonth); // srvmonth
    timeSync.day = Number( tempData.srvday); // srvday
    timeSync.hour = Number( tempData.srvhour); // srvhour
    timeSync.min = Number( tempData.srvminute); // srvmin
    timeSync.sec = Number( tempData.srvsecond); // srvsec
    timeSync.date = Number( tempData.srvdate); // srvdate

    tcp.makeit(tempData.LCNO, reqopcode.CLOCK_DW_REQ, rqno, _data);
  } else {
    // console.error('소켓 없음')
  }
  // res.send({'ticketno':rqno})
  res.send({'ticketno':999})
}); 

//---------------------------------------------------------------------------
//네트워크
//업로드
router.post('/network_up', function(req, res, next) {
  LogWrite(logInfo, "network_up ***************************************************************");
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    let _data = Buffer.alloc(40);
    tcp.makeit(req.body.data, reqopcode.NETWORK_REQ, rqno , _data);
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
});
//다운로드
router.post('/network_dw', function(req, res, next) {
  if (typeof tcp.client != 'undefined') {
    rqnoTask(res);
    let tempData = req.body.data.split(',');
    let index = 0;
    let _data = Buffer.alloc(40);
    var LOCALIP =  tempData[1].split('.');
    _data[index++] = Number( LOCALIP[0]);
    _data[index++] = Number( LOCALIP[1]);
    _data[index++] = Number( LOCALIP[2]);
    _data[index++] = Number( LOCALIP[3]);
    var NETMASK =  tempData[2].split('.');
    _data[index++] = Number( NETMASK[0]);
    _data[index++] = Number( NETMASK[1]);
    _data[index++] = Number( NETMASK[2]);
    _data[index++] = Number( NETMASK[3]);
    var GATEWAY =  tempData[3].split('.');
    _data[index++] = Number( GATEWAY[0]);
    _data[index++] = Number( GATEWAY[1]);
    _data[index++] = Number( GATEWAY[2]);
    _data[index++] = Number( GATEWAY[3]);    
    var CENTERIP =  tempData[4].split('.');
    _data[index++] = Number( CENTERIP[0]);
    _data[index++] = Number( CENTERIP[1]);
    _data[index++] = Number( CENTERIP[2]);
    _data[index++] = Number( CENTERIP[3]);    
    var PORTNO =  toBytesInt16(Number(tempData[5]));
    _data[index++] = PORTNO[1];
    _data[index++] = PORTNO[0];
    index+=2;
    var MACADDR =  tempData[6];
    index+=18;
    var COMMAND =  tempData[7];
    _data[index++] = Number(COMMAND);
    var COMMODE =  tempData[8];
    _data[index++] = Number(COMMODE);
    tcp.makeit( Number(tempData[0]), reqopcode.NETWORK_REQ, rqno, _data);
  } else {
    console.error('소켓 없음')
  }
  res.send({'ticketno':rqno})
}); 


//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function intFromBytes( x ){
  var val = 0;
  for (var i = 0; i < x.length; ++i) {        
      val += x[i];        
      if (i < x.length-1) {
          val = val << 8;
      }
  }
  return val;
}

function toBytesInt32 (num) {
  arr = new Uint8Array([
       (num & 0xff000000) >> 24,
       (num & 0x00ff0000) >> 16,
       (num & 0x0000ff00) >> 8,
       (num & 0x000000ff)
  ]);
  return Buffer.from(arr.buffer);
}

function toBytesInt16 (num) {
  arr = new Uint8Array([
       (num & 0x0000ff00) >> 8,
       (num & 0x000000ff)
  ]);
  return Buffer.from(arr.buffer);
}

function arrToByte (data) {
  let args = Array.isArray(arguments[1]) ? arguments[1] : Array.prototype.slice.call(arguments,1);
  if (arguments.length == 1) {
    args = new Array(8);
    args.fill(1)
  }
  if (args.length && args.reduce((sum, cur)=>{
    return sum + cur;
  }) == 8) {
    let result = '';
    args.forEach((v,i)=>{
      result += numToBit(data[i], v)
    })
    return parseInt(result, 2);

  } else {
    console.error('sliceByte fail args : ' + args)
  }
}

function numToBit (num, size) {
  num = Number(num);
  let res = num.toString(2);
  let _res = '';
  if (res.length < size) {
    let cnt = size - res.length;
    for (let i = 0; i < cnt; i++) {
      _res += '0'; 
    }
  }
  _res += res;
  return _res;
}


module.exports = router;