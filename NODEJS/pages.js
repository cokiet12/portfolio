var express = require('express');
var router = express.Router();

const menus = [
  '3--pages/userConfigModal', // 운영자관리
  '1--pages/lookLogs', // 이력조회
  '1--pages/eventMonitor', // 이벤트조회
  '1--pages/monitoring',
  '1--pages/gMonitoring',
  '2--pages/lcCtl',
  '2--pages/grCtl',
  '2--pages/dbUpDownModal',
  '2--pages/systemModal',
  '2--pages/dbCopyModal',
  '2--pages/nodeLinkModal',
  '2--pages/planModal',
  '2--pages/saConfigModal',
  '2--pages/lcConfigModal',
  '2--pages/lcConfigDetailModal',
  '2--pages/flowConfigModal', // 이동류편집
  '2--pages/signalEditModal',
  '2--pages/algorithmModal',
  '2--pages/firmwareModal',
  '2--pages/signalMapCode',
  '2--pages/Versionseq',
  '2--pages/dayPlanPattern',
  '1--pages/videoMonitorModal',
  '2--pages/todModal',
]

// const menus = [
//   '1--pages/userConfigModal', // 운영자관리
//   '3--pages/lookLogs', // 이력조회
//   '3--pages/eventMonitor', // 이벤트조회
//   '2--pages/monitoring',
//   '2--pages/gMonitoring',
//   '2--pages/lcCtl',
//   '2--pages/grCtl',
//   '2--pages/dbUpDownModal',
//   '2--pages/systemModal',
//   '2--pages/dbCopyModal',
//   '2--pages/nodeLinkModal',
//   '2--pages/planModal',
//   '2--pages/saConfigModal',
//   '2--pages/lcConfigModal',
//   '2--pages/lcConfigDetailModal',
//   '2--pages/flowConfigModal', // 이동류편집
//   '2--pages/signalEditModal',
//   '2--pages/algorithmModal',
//   '2--pages/firmwareModal',
//   '2--pages/signalMapCode',
// ]

console.log('pages');

function auth(userlev, menunm, res) {
  const dt = menus[menunm].split('--');
  console.log(dt);
  const lv = Number(dt[0]);
  const url = dt[1];
  console.log(userlev);

  if (lv <= Number(userlev)) {
    res.render(url);
  } else {
    // res.render('pages/unauth');
    console.log(`요구권한 : ${lv}, 유저권한 : ${userlev}`);
  }
}

router.get('/testmodal', function(req, res, next) {
  res.render('pages/testModal');
});


//운영자 관리
router.get('/userConfigModal', function(req, res, next) {
  
  auth(req.session.authority, 0, res);
  // res.render('pages/userConfigModal');
});

//이력 조회
router.get('/lookLogs', function(req, res, next) {
  
  auth(req.session.authority, 1, res);
  // res.render('pages/lookLogs');
});

//이벤트조회
router.get('/eventMonitor', function(req, res, next) {
  
  auth(req.session.authority, 2, res);
  //res.render('pages/eventMonitor');
});

//교차로모니터링
router.get('/monitoring', function(req, res, next) {

  auth(req.session.authority, 3, res);
  // res.render('pages/monitoring');
});

//그룹모니터링
router.get('/gMonitoring', function(req, res, next) {

  auth(req.session.authority, 4, res);
  // res.render('pages/gMonitoring');
});

router.get('/lcCtl', function(req, res, next) {
  
  auth(req.session.authority, 5, res);
  // res.render('pages/lcCtl');
});

router.get('/grCtl', function(req, res, next) {
  
  auth(req.session.authority, 6, res);
  //res.render('pages/grCtl');
});

router.get('/dbUpDownModal', function(req, res, next) {
  
  auth(req.session.authority, 7, res);
  //res.render('pages/dbUpDownModal');
});

//시스템관리
router.get('/systemModal', function(req, res, next) {
  
  auth(req.session.authority, 8, res);
  //res.render('pages/systemModal');
});

//도구
router.get('/dbCopyModal', function(req, res, next) {
  
  auth(req.session.authority, 9, res);
  //res.render('pages/saCopyModal');
});

router.get('/nodeLinkModal', function(req, res, next) {
  
  auth(req.session.authority, 10, res);
  //res.render('pages/nodeLinkModal');
});

router.get('/planModal', function(req, res, next) {
  
  auth(req.session.authority, 11, res);
  //res.render('pages/planModal');
});

//신호제어편집
router.get('/saConfigModal', function(req, res, next) {
  
  auth(req.session.authority, 12, res);
  //res.render('pages/saConfigModal');
});

router.get('/lcConfigModal', function(req, res, next) {
  
  auth(req.session.authority, 13, res);
  //res.render('pages/lcConfigModal');
});

router.get('/lcConfigDetailModal', function(req, res, next) {
  
  auth(req.session.authority, 14, res);
  //res.render('pages/lcConfigDetailModal');
});

router.get('/flowConfigModal', function(req, res, next) {
  
  auth(req.session.authority, 15, res);
  //res.render('pages/flowConfigModal');
});

router.get('/signalEditModal', function(req, res, next) {
  
  auth(req.session.authority, 16, res);
  //res.render('pages/signalEditModal');
});

router.get('/algorithmModal', function(req, res, next) {
  
  auth(req.session.authority, 17, res);
  //res.render('pages/algorithmModal');
});

router.get('/firmwareModal', function(req, res, next) {
  
  auth(req.session.authority, 18, res);
  //res.render('pages/firmwareModal');
});

router.get('/signalMapCode', function(req, res, next) {
  
  auth(req.session.authority, 19, res);
  //res.render('pages/firmwareModal');
});

router.get('/Versionseq', function(req, res, next) {
  
  auth(req.session.authority, 20, res);
})

router.get('/dayPlanPattern', function(req, res, next) {
  
  auth(req.session.authority, 21, res);
})

router.get('/videoMonitorModal', function(req, res, next) {
  
  auth(req.session.authority, 22, res);
})

router.get('/todModal', function(req, res, next) {
  
  auth(req.session.authority, 23, res);
})

module.exports = router;
