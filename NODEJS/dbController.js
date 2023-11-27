var express = require('express');
var router = express.Router();
var db = require('./dbConn');
var odbc = require('odbc');
// let dbname = global.dbname; //NEOTCS

/*  TEST  */
router.get('/GET_TEST', async function(req, res){
    
    var result = await db.select(`SELECT * FROM ${dbname}NTCS_M_LINK_DETAIL WHERE LINK_ID = 6`);
    if(result.length) {
        console.log('조회 완료');
    } else {
        console.log('조회 실패');
    }
    //var result = await db.update(`INSERT INTO ${dbname}NTCS_M_LINK_DETAIL VALUES ('7', 1, 786, (SELECT A.NODE_LAT FROM ${dbname}NTCS_M_NODE_NEW A WHERE A.NODE_ID = '9999000100'), (SELECT A.NODE_LNG FROM ${dbname}NTCS_M_NODE_NEW A WHERE A.NODE_ID = '9999000100'), '9999000100')`);
    console.log(result);
    res.send({'data': result});
})

router.get('/test', async function (req, res) {
    const now = new Date()
    const param = [now.getMonth()+1, now.getDate(), now.getHours(), 9999, now.getDay()]
    console.log('/test')
    // let result = await db.procedure(null, null, 'SP_SPLIT', param);
    let result = await db.procedure('NEODB', null, 'SP_SPLIT', param);
    console.log(param)
    console.log(result)
    res.send({'data' : result});
})

/*  노드 링크 / 빈 그룹 조회  */
router.get('/GET_ETGROUP', async function (req, res){ // req : x

    var result = await db.select(`SELECT A.SA_NO, A.SA_NAME FROM ${dbname}NTCS_M_SAOPRATE A WHERE A.SA_NO NOT IN (SELECT B.SA_NO FROM ${dbname}NTCS_M_LC B);`);
    
    res.send({'data' : result});
})

/*  노드 링크 / 모든 그룹 정보 조회  */
router.get('/GET_SUMGROUP', async function (req, res){ // req : x
    
    var result = await db.select(`select A.LCNO,  A.LCNAME, B.NODE_ID, B.NODE_NAME, B.NODE_LAT, B.NODE_LNG, C.SA_NO, C.SA_NAME, D.LINK_ID, D.NUM
    from ${dbname}NTCS_M_LC A, ${dbname}NTCS_M_NODE_NEW B, ${dbname}NTCS_M_SAOPRATE C, ${dbname}NTCS_M_LINK_DETAIL D
    where A.SA_NO = C.SA_NO AND A.NODE_ID = B.NODE_ID AND B.NODE_ID = D.NODE_ID`);
    var result_b = await db.select(`select DISTINCT B.LINK_ID ,A.SA_NO, A.SA_NAME
    from ${dbname}NTCS_M_SAOPRATE A, ${dbname}NTCS_M_LINK_DETAIL B
    where A.SA_NO = B.GROUP_NUM`)
    console.log(result)
    console.log(result_b)
    res.send({'data' : result, 'data1' : result_b});
})

/*  노드 링크 / NODE_ID 세부 정보 조회  */
router.post('/GET_GROUP_BY_NODEID', async function (req, res){ // req = nodeids: []
    const body = req.body; 
    const jb = JSON.stringify(body).trim();
    const data = JSON.parse(jb).nodeids;
    let query = '';

    for(var i=0; i < data.length; i++) {
        if(i == 0) {
            query += `(B.NODE_ID = '${data[i]}'`
        } else {
            query += ` OR B.NODE_ID = '${data[i]}'`
        }
    }

    const s_query = `select A.LCNO, A.LCNAME, B.NODE_ID, B.NODE_NAME from ${dbname}NTCS_M_LC A, ${dbname}NTCS_M_NODE_NEW B where A.NODE_ID = B.NODE_ID AND ` 
    var result = await db.select(s_query + query + ')');
    console.log(result)
    res.send({'data' : result});
})

/*  노드 링크 / 링크 연결  */
router.post('/CONNECT_LCS', async function (req, res){ // req : {linkId: , GroupNum: , nodes: []}
    const body = req.body;
    const jb = JSON.stringify(body).trim();
    const data = JSON.parse(jb);

    const linkId = data.linkid;
    const GroupNum = data.groupnum;
    const Nodes = data.nodes;
    let result = false;
    let InsertQuery = '';
    let UpdateQuery1 = '';
    let UpdateQuery2 = '';

    for(var i = 0; i < Nodes.length; i++) {
        if(i == 0) {
            InsertQuery += `INSERT INTO ${dbname}NTCS_M_LINK_DETAIL VALUES ('${linkId}', ${i+1}, ${GroupNum}, (SELECT A.NODE_LAT FROM ${dbname}NTCS_M_NODE_NEW A WHERE A.NODE_ID = '${Nodes[i]}'), (SELECT A.NODE_LNG FROM ${dbname}NTCS_M_NODE_NEW A WHERE A.NODE_ID = '${Nodes[i]}'), '${Nodes[i]}'),`
            UpdateQuery1 += `UPDATE ${dbname}NTCS_M_LC SET SA_NO = ${GroupNum} WHERE NODE_ID = '${Nodes[i]}'`
            UpdateQuery2 += `UPDATE ${dbname}NTCS_M_NODE_NEW SET NODE_SANO = ${GroupNum} WHERE NODE_ID = '${Nodes[i]}'`
        } else if(i == Nodes.length-1) {
            InsertQuery += `('${linkId}', ${i+1}, ${GroupNum}, (SELECT A.NODE_LAT FROM ${dbname}NTCS_M_NODE_NEW A WHERE A.NODE_ID = '${Nodes[i]}'), (SELECT A.NODE_LNG FROM ${dbname}NTCS_M_NODE_NEW A WHERE A.NODE_ID = '${Nodes[i]}'), '${Nodes[i]}');`
            UpdateQuery1 += ` OR NODE_ID = '${Nodes[i]}';`
            UpdateQuery2 += ` OR NODE_ID = '${Nodes[i]}';`
        } else {
            InsertQuery += `('${linkId}', ${i+1}, ${GroupNum}, (SELECT A.NODE_LAT FROM ${dbname}NTCS_M_NODE_NEW A WHERE A.NODE_ID = '${Nodes[i]}'), (SELECT A.NODE_LNG FROM ${dbname}NTCS_M_NODE_NEW A WHERE A.NODE_ID = '${Nodes[i]}'), '${Nodes[i]}'),`
            UpdateQuery1 += ` OR NODE_ID = '${Nodes[i]}'`
            UpdateQuery2 += ` OR NODE_ID = '${Nodes[i]}'`
        }
    }

    const a = await db.update(InsertQuery);

    if(!a.error) {
        const b = await db.update(UpdateQuery1);
        const c = await db.update(UpdateQuery2);

        if(!b.error && !c.error) {
            result = true;
        } else {
            console.log('UPDATE ERROR');
        }
    } else {
        console.log('INSERT ERROR');
    }
    
    res.send({'success' : result});
})


/*  노드 링크 / 링크 순서 변경  */
router.post('/CHANGE_NODENUM', async function (req, res){ // req : {linkId: , GroupNum: , nodes: []}
    const body = req.body;
    const jb = JSON.stringify(body).trim();
    const data = JSON.parse(jb);

    const linkId = data.linkid;
    const GroupNum = data.groupnum;
    const Nodes = data.nodes;
    let result = false;
    let InsertQuery = '';

    for(var i = 0; i < Nodes.length; i++) {
        if(i == 0) {
            InsertQuery += `INSERT INTO ${dbname}NTCS_M_LINK_DETAIL VALUES ('${linkId}', ${i+1}, ${GroupNum}, (SELECT A.NODE_LAT FROM ${dbname}NTCS_M_NODE_NEW A WHERE A.NODE_ID = '${Nodes[i]}'), (SELECT A.NODE_LNG FROM ${dbname}NTCS_M_NODE_NEW A WHERE A.NODE_ID = '${Nodes[i]}'), '${Nodes[i]}'),`
        } else if(i == Nodes.length-1) {
            InsertQuery += `('${linkId}', ${i+1}, ${GroupNum}, (SELECT A.NODE_LAT FROM ${dbname}NTCS_M_NODE_NEW A WHERE A.NODE_ID = '${Nodes[i]}'), (SELECT A.NODE_LNG FROM ${dbname}NTCS_M_NODE_NEW A WHERE A.NODE_ID = '${Nodes[i]}'), '${Nodes[i]}');`
        } else {
            InsertQuery += `('${linkId}', ${i+1}, ${GroupNum}, (SELECT A.NODE_LAT FROM ${dbname}NTCS_M_NODE_NEW A WHERE A.NODE_ID = '${Nodes[i]}'), (SELECT A.NODE_LNG FROM ${dbname}NTCS_M_NODE_NEW A WHERE A.NODE_ID = '${Nodes[i]}'), '${Nodes[i]}'),`
        }
    }

    const a = await db.update(`DELETE FROM ${dbname}NTCS_M_LINK_DETAIL WHERE LINK_ID = '${linkId}'`);

    if(!a.error) {
        const b = await db.update(InsertQuery);

        if(!b.error) {
            result = true;
        } else {
            console.log('INSERT ERROR(링크 순서교체)');
        }
    } else {
        console.log('DELETE ERROR(링크 순서교체)');
    }
    
    res.send({'success' : result});
})


/*  노드 링크 / 링크 삭제  */
router.post('/DELETE_LINK', async function (req, res){ // req = linkId:  
    const body = req.body;
    const jb = JSON.stringify(body).trim();
    const data = JSON.parse(jb);

    const linkId = data.linkid;
    let result = false;
    let UpdateQuery1 = '';
    let UpdateQuery2 = '';

    const a = await db.select(`SELECT NODE_ID FROM ${dbname}NTCS_M_LINK_DETAIL WHERE LINK_ID = '${linkId}'`);

    if(a.length) {
        console.log('해당 링크에 해당하는 노드가 없습니다');
    } else {
        for(var i=0; i < a.length; i++) {
            if(i == 0) {
                UpdateQuery1 += `UPDATE ${dbname}NTCS_M_LC SET SA_NO = 0 WHERE NODE_ID = '${a[i].NODE_ID}'`
                UpdateQuery2 += `UPDATE ${dbname}NTCS_M_NODE_NEW SET NODE_SANO = 0 WHERE NODE_ID = '${a[i].NODE_ID}'`
            } else {
                UpdateQuery1 += ` OR NODE_ID = '${a[i].NODE_ID}'`
                UpdateQuery2 += ` OR NODE_ID = '${a[i].NODE_ID}'`
            }
        }

        const b = await db.update(UpdateQuery1);
        const c = await db.update(UpdateQuery2);
        
        if(!b.error && !c.error) {
            const d = await db.update(`DELETE FROM ${dbname}NTCS_M_LINK_DETAIL WHERE LINK_ID = '${linkId}'`);

            if(!d.error) {
                result = true;
            } else {
                console.log('DELETE ERROR(링크 삭제)');
            }
        } else {
            console.log('UPDATE ERROR(링크 삭제)');
        }
    }
    res.send({'success' : result});
})


/*  세부 이벤트 조회  */
router.post('/GET_EVENT_NAME', async function (req, res){ // req = { M_CODE : , S_CODE : }
    const body = req.body;
    const jb = JSON.stringify(body).trim();
    const data = JSON.parse(jb);

    const a = await db.select(`SELECT M_NAME FROM ${dbname}NTCS_M_EVENT_M WHERE M_CODE = ${data.M_CODE}`);
    const b = await db.select(`SELECT S_NAME FROM ${dbname}NTCS_M_EVENT_S WHERE M_CODE = ${data.M_CODE} AND S_CODE = ${data.S_CODE}`);

    res.send({'data' : {M_NAME : a[0].M_NAME, S_NAME : b[0].S_NAME}});
})

module.exports = router;