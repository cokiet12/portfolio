<script>
    // @ts-nocheck
    import { onMount } from 'svelte';
    import Table from '$lib/nested/table.svelte'
    import Searcher from '$lib/nested/searcher.svelte'
    import Button from '$lib/nested/button.svelte';
    import { ajax } from '$lib/js/functions.mjs'
    import _ from 'lodash'
    import Chart from 'chart.js/auto/auto.js';

    // 창모드 / 싱글, 듀얼모드
    export let winMode = true;
    export let onSize = (wid, hei)=>{
        setTimeout(() => {
            table1.refreshDimensions();
        })
    }

    // CONSTS
    const consts = {
        option1 : [
            {id: 1, text: '5분'},
            {id: 2, text: '15분'},
            {id: 3, text: '1시간'},
            {id: 4, text: '1일'},
            {id: 5, text: '한달'}
        ],
        option2 : [
            {id: 1, text: '시간대'},
            // {id: 2, text: '평일/주말'},
            {id: 3, text: '접근로/이동류'},
            {id: 4, text: '접근로/차종'}
        ],
        date1 : null,
        date2 : null
    }

        // STATS
    export let stats = {
        lcno : 241,
        sano : 1,
        year : 2010
    }

    $:searchEvent(stats)

    // ELEMS
    let elems = {
        table1 : null,
        canvas1 : null,
        canvas2 : null,
        canvas3 : null,
        chart1 : null,
        chart2 : null,
        chart3 : null
    }

    // Table
    let table1;

    // Selected
    let selected1 = 1;
    let selected2 = 1;

    // Datas
    let data1 = []

    // Len
    let len = 40;

    // IDatas
    let iDatas1;
    let iDatas2;

    // Cells
    let optionC = function(row, col, prop) {
        let cellProperties = {};
        cellProperties.readOnly = true
        return cellProperties
    };

    // Option
    let option1 = {
        colWidths: 30,
        rowHeights: 23,
        renderer: 'html',
        renderAllRows: true,
        fixedRowsTop: 2,
        fixedRowsBottom: 1,
        cells: optionC
    }

    let today = new Date();
    let year = today.getFullYear();
    let month = ('0' + (today.getMonth()+1)).slice(-2);
    let day = ('0' + today.getDate()).slice(-2);
    let hours = ('0' + today.getHours()).slice(-2);
    let hours2 = ('0' + (today.getHours() - 5)).slice(-2);
    let minutes = ('0' + today.getMinutes()).slice(-2);

    let firstInput = year + "-" + month + "-" + day + "T" + hours + ":" + minutes;
    let secondInput = year + "-" + month + "-" + day + "T" + hours2 + ":" + minutes;
    consts.date1 = secondInput;
    consts.date2 = firstInput;

    // Search Event
    function searchEvent(stat){
        if(table1){
            initData(selected2);
        }
    }

    // DropDown Event
    function DropDownEvent(){
        if(table1){
            initData(selected2);
            setTimeout(() => {
                table1.refreshDimensions();
            })
        }
        // if(selected2 == 2){
        //     chart3.resize(670, 450);
        // }
        // if(selected2 == 1){
        //     chart1.resize(670, 220);
        // }
    }

    // 데이터 생성
    function makeData(res, sort){
        let _data;

        // TIME, WEEK, HOLIDAY??, FLOW, CAR
        if(sort == 1 || !sort){
            _data = [
                ['교차로명', '수집일시', '교통량', '', '', '', ''],
                ['', '', '좌회전', '직진', '우회전', '유턴', '합계']
            ]

            for(let i=0; i<len; i++){
                _data.push(['-', '-', '-', '-', '-', '-', '-'])
            }

            _data.push(['합계', '-', '-', '-', '-', '-', '-'])
        } else if(sort == 2){
            _data = [
                ['교차로명', '수집일시', '교통량', ''],
                ['', '', '평일', '주말']
            ]

            for(let i=0; i<len; i++){
                _data.push(['-', '-', '-', '-'])
            }

            _data.push(['합계', '-', '-', '-'])
        } else if(sort == 3){
            _data = [
                ['교차로명', '수집일시', 
                '', '', '', '', '',
                '', '', '', '', '',
                '', '', '', '', '',
                '', '', '', '', ''],
                ['', '', 
                '좌회전', '직진', '우회전', '유턴', '소계',
                '좌회전', '직진', '우회전', '유턴', '소계', 
                '좌회전', '직진', '우회전', '유턴', '소계', 
                '좌회전', '직진', '우회전', '유턴', '소계']
            ]

            for(let i=0; i<len; i++){
                _data.push(['-', '-', 
                '-', '-', '-', '-', '-',
                '-', '-', '-', '-', '-',
                '-', '-', '-', '-', '-',
                '-', '-', '-', '-', '-'])
            }

            _data.push(['합계', '-', 
            '-', '-', '-', '-', '-',
            '-', '-', '-', '-', '-',
            '-', '-', '-', '-', '-',
            '-', '-', '-', '-', '-'])
        } else if(sort == 4){
            _data = [
                ['교차로명', '수집일시', 
                '', '', '', '', '', '', '', '', 
                '', '', '', '', '', '', '', '', 
                '', '', '', '', '', '', '', '', 
                '', '', '', '', '', '', '', ''],
                ['', '', 
                '세단', 'SUV', 'VAN', '트럭', '버스', '이륜', '미확', '소계', 
                '세단', 'SUV', 'VAN', '트럭', '버스', '이륜', '미확', '소계', 
                '세단', 'SUV', 'VAN', '트럭', '버스', '이륜', '미확', '소계', 
                '세단', 'SUV', 'VAN', '트럭', '버스', '이륜', '미확', '소계']
            ]

            for(let i=0; i<len; i++){
                _data.push(['-', '-', 
                '-', '-', '-', '-', '-', '-', '-', '-',
                '-', '-', '-', '-', '-', '-', '-', '-', 
                '-', '-', '-', '-', '-', '-', '-', '-', 
                '-', '-', '-', '-', '-', '-', '-', '-'])
            }

            _data.push(['합계', '-', 
            '-', '-', '-', '-', '-', '-', '-', '-', 
            '-', '-', '-', '-', '-', '-', '-', '-', 
            '-', '-', '-', '-', '-', '-', '-', '-', 
            '-', '-', '-', '-', '-', '-', '-', '-'])
        }
        
        if(res) {
            let length;

            if(typeof(res) == 'object'){
                length = Object.keys(res).length;
            } else {
                length = res.length;
            }

            if(length){
                if(sort == 1 || !sort){
                    let sum = ['합계', '-', 0, 0, 0, 0, 0]

                    _data = [
                        ['교차로명', '수집일시', '교통량', '', '', '', ''],
                        ['', '', '좌회전', '직진', '우회전', '유턴', '합계']
                    ]

                    // 방향 탐색
                    let dir = Object.keys(res.reduce(function(result, current) {
                        result[current.dir] = result[current.dir] || [];
                        result[current.dir].push(current);
                        return result;
                    }, {}));

                    // CRE_DATE를 기준으로 GROUP BY
                    let _res = res.reduce(function(result, current) {
                        result[current.cre_date] = result[current.cre_date] || [];
                        result[current.cre_date].push(current);
                        return result;
                    }, {});

                    Object.keys(_res).forEach((v1, i1) => {
                        if(i1 < len){
                            let arr = [document.lcCon.LCs[stats.lcno].lcname, v1.replace('T', ' '), '', '', '', '', '']

                            let leftVal = 0
                            let goVal = 0
                            let rightVal = 0
                            let uTurnVal = 0
                            let sumVal = 0

                            dir.forEach((v2, i2) => {
                                let obj = _res[v1].find(value => value.dir == v2)

                                leftVal += obj ? obj.vcnt1 : 0
                                goVal += obj ? obj.vcnt2 : 0
                                rightVal += obj ? obj.vcnt3 : 0
                                uTurnVal += obj ? obj.vcnt4 : 0
                                sumVal += obj ? obj.sum : 0

                                arr[2] = leftVal;
                                arr[3] = goVal;
                                arr[4] = rightVal;
                                arr[5] = uTurnVal;
                                arr[6] = sumVal;
                            })

                            _data.push(arr);

                            sum[2] += leftVal;
                            sum[3] += goVal;
                            sum[4] += rightVal;
                            sum[5] += uTurnVal;
                            sum[6] += sumVal;
                        }
                    })

                    // 나머지 ROW 채우기
                    if(Object.keys(_res).length < len){
                        for(let i=0; i<len-(Object.keys(_res).length); i++){
                            _data.push(['-', '-', '-', '-', '-', '-', '-'])
                        }
                    }

                    // 마지막 줄에 합계 추가
                    _data.push(sum);

                    // IDATA에 저장
                    iDatas1 = _res;
                    iDatas2 = res;
                } else if(sort == 2){
                    // let sum = ['합계','-',0,0]

                    // _data = [
                    //     ['교차로명', '수집일시', '교통량', ''],
                    //     ['', '', '평일', '주말']
                    // ]

                    // // CRE_DATE를 기준으로 GROUP BY
                    // let _res = res.reduce(function(result, current) {
                    //     result[current.cre_date] = result[current.cre_date] || [];
                    //     result[current.cre_date].push(current);
                    //     return result;
                    // }, {});

                    // Object.keys(_res).forEach((v1, i1) => {
                    //     // 직진
                    //     let go = _res[v1].find(value => value.dir == 10)
                    //     let goDay = go ? go.weekday : 0
                    //     let goEnd = go ? go.weekend : 0

                    //     // 좌회전
                    //     let left = _res[v1].find(value => value.dir == 20)
                    //     let leftDay = left ? left.weekday : 0
                    //     let leftEnd = left ? left.weekend : 0

                    //     // 우회전
                    //     let right = _res[v1].find(value => value.dir == 30)
                    //     let rightDay = right ? right.weekday : 0
                    //     let rightEnd = right ? right.weekend : 0

                    //     // 합계
                    //     let glrDay = goDay + leftDay + rightDay
                    //     let glrEnd = goEnd + leftEnd + rightEnd

                    //     let arr = [document.lcCon.LCs[stats.lcno].lcname, v1.replace('T',' '), glrDay, glrEnd]
                        
                    //     sum[2] += glrDay;
                    //     sum[3] += glrEnd;

                    //     _data.push(arr);
                    // })

                    // if(length < len){
                    //     for(let i=0; i<len-length; i++){
                    //         _data.push(['-', '-', '-', '-'])
                    //     }
                    // }

                    // _data.push(sum);

                    // // IDATA에 저장
                    // iDatas1 = _res;
                } else if(sort == 3){
                    let sum = ['합계','-',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

                    _data = [
                        ['교차로명', '수집일시', 
                        '', '', '', '', '',
                        '', '', '', '', '',
                        '', '', '', '', '',
                        '', '', '', '', ''],
                        ['', '', 
                        '좌회전', '직진', '우회전', '유턴', '소계',
                        '좌회전', '직진', '우회전', '유턴', '소계', 
                        '좌회전', '직진', '우회전', '유턴', '소계', 
                        '좌회전', '직진', '우회전', '유턴', '소계']
                    ]

                    // 방향 탐색
                    let dir = Object.keys(res.reduce(function(result, current) {
                        result[current.dir] = result[current.dir] || [];
                        result[current.dir].push(current);
                        return result;
                    }, {}));

                    dir.forEach((v, i) => {
                        let dirname = v == 10 ? '북' : v == 20 ? '동' : v == 30 ? '남' : v == 40 ? '서' : v == 50 ? '북동' : v == 60 ? '남동' : v == 70 ? '남서' : '북서'
                        _data[0][(i*5)+2] = dirname
                    })

                    // CRE_DATE를 기준으로 GROUP BY
                    let _res = res.reduce(function(result, current) {
                        result[current.cre_date] = result[current.cre_date] || [];
                        result[current.cre_date].push(current);
                        return result;
                    }, {});

                    Object.keys(_res).forEach((v1, i1) => {
                        if(i1 < len){
                            let arr = [document.lcCon.LCs[stats.lcno].lcname, v1.replace('T',' '), 
                            '', '', '', '', 
                            '', '', '', '', 
                            '', '', '', '', 
                            '', '', '', '']

                            dir.forEach((v2, i2) => {
                                let obj = _res[v1].find(value => value.dir == v2)

                                let leftVal = obj ? obj.vcnt1 : 0
                                let goVal = obj ? obj.vcnt2 : 0
                                let rightVal = obj ? obj.vcnt3 : 0
                                let uTurnVal = obj ? obj.vcnt4 : 0
                                let sumVal = obj ? obj.sum : 0

                                arr[(i2*5)+2] = leftVal;
                                arr[(i2*5)+3] = goVal;
                                arr[(i2*5)+4] = rightVal;
                                arr[(i2*5)+5] = uTurnVal;
                                arr[(i2*5)+6] = sumVal;

                                sum[(i2*5)+2] += leftVal;
                                sum[(i2*5)+3] += goVal;
                                sum[(i2*5)+4] += rightVal;
                                sum[(i2*5)+5] += uTurnVal;
                                sum[(i2*5)+6] += sumVal;
                            })

                            _data.push(arr);
                        }
                    })

                    if(length < len){
                        for(let i=0; i<len-length; i++){
                            _data.push(['-', '-', 
                            '-', '-', '-', '-',
                            '-', '-', '-', '-',
                            '-', '-', '-', '-',
                            '-', '-', '-', '-'])
                        }
                    }

                    _data.push(sum);

                    // IDATA에 저장
                    iDatas1 = _res;
                } else if(sort == 4){
                    let sum = ['합계','-',
                    0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0]

                    _data = [
                        ['교차로명', '수집일시', 
                        '-', '', '', '', '', '', '', '', 
                        '-', '', '', '', '', '', '', '', 
                        '-', '', '', '', '', '', '', '', 
                        '-', '', '', '', '', '', '', ''],
                        ['', '', 
                        '미확', '세단', 'SUV', 'VAN', '트럭', '버스', '이륜', '소계', 
                        '미확', '세단', 'SUV', 'VAN', '트럭', '버스', '이륜', '소계', 
                        '미확', '세단', 'SUV', 'VAN', '트럭', '버스', '이륜', '소계', 
                        '미확', '세단', 'SUV', 'VAN', '트럭', '버스', '이륜', '소계']
                    ]

                    // 방향 탐색
                    let dir = Object.keys(res.reduce(function(result, current) {
                        result[current.dir] = result[current.dir] || [];
                        result[current.dir].push(current);
                        return result;
                    }, {}));

                    dir.forEach((v, i) => {
                        let dirname = v == 10 ? '북' : v == 20 ? '동' : v == 30 ? '남' : v == 40 ? '서' : v == 50 ? '북동' : v == 60 ? '남동' : v == 70 ? '남서' : '북서'
                        // 2, 10, 18 26
                        _data[0][i*8+2] = dirname
                    })

                    // CRE_DATE를 기준으로 GROUP BY
                    let _res = res.reduce(function(result, current) {
                        result[current.cre_date] = result[current.cre_date] || [];
                        result[current.cre_date].push(current);
                        return result;
                    }, {});

                    Object.keys(_res).forEach((v1, i1) => {
                        if(i1 < len){
                            let arr = [document.lcCon.LCs[stats.lcno].lcname, v1.replace('T', ' '), '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'];
                    
                            dir.forEach((v2, i2) => {
                                let obj = _res[v1].find(value => value.dir == v2)

                                let undefValue = obj ? obj.vcnt1 : 0
                                let sedanValue = obj ? obj.vcnt2 : 0
                                let suvValue = obj ? obj.vcnt3 : 0
                                let vanValue = obj ? obj.vcnt4 : 0
                                let truckValue = obj ? obj.vcnt5 : 0
                                let busValue = obj ? obj.vcnt6 : 0
                                let twValue = obj ? obj.vcnt7 : 0
                                let sumValue = obj ? obj.vcnt8 : 0

                                arr[(i2*8)+2] = undefValue;
                                arr[(i2*8)+3] = sedanValue;
                                arr[(i2*8)+4] = suvValue;
                                arr[(i2*8)+5] = vanValue;
                                arr[(i2*8)+6] = truckValue;
                                arr[(i2*8)+7] = busValue;
                                arr[(i2*8)+8] = twValue;
                                arr[(i2*8)+9] = sumValue;

                                sum[(i2*8)+2] += undefValue;
                                sum[(i2*8)+3] += sedanValue;
                                sum[(i2*8)+4] += suvValue;
                                sum[(i2*8)+5] += vanValue;
                                sum[(i2*8)+6] += truckValue;
                                sum[(i2*8)+7] += busValue;
                                sum[(i2*8)+8] += twValue;
                                sum[(i2*8)+9] += sumValue;
                            })

                            _data.push(arr);
                        }
                    })

                    // 나머지 ROW 채우기
                    if(Object.keys(_res).length < len){
                        for(let i=0; i<len-(Object.keys(_res).length); i++){
                            _data.push(['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'])
                        }
                    }

                    _data.push(sum);

                    // IDATA에 저장
                    iDatas1 = _res;
                }
            }
        } 

        return _data
    }

    // 옵션 생성
    function makeOption(sort){
        let optionM;
        let colWidths;

        if(sort == 2){
            optionM = [
                {row: 0, col: 0, rowspan: 2, colspan: 1},
                {row: 0, col: 1, rowspan: 2, colspan: 1},
                {row: 0, col: 2, rowspan: 1, colspan: 2},
            ]

            colWidths = [80, 80, 30, 30]
        } else if(sort == 3){
            optionM = [
                {row: 0, col: 0, rowspan: 2, colspan: 1},
                {row: 0, col: 1, rowspan: 2, colspan: 1},
                {row: 0, col: 2, rowspan: 1, colspan: 5},
                {row: 0, col: 7, rowspan: 1, colspan: 5},
                {row: 0, col: 12, rowspan: 1, colspan: 5},
                {row: 0, col: 17, rowspan: 1, colspan: 5},
            ]
            colWidths = [80,80,
            30,30,30,30,30,
            30,30,30,30,30,
            30,30,30,30,30,
            30,30,30,30,30]
        } else if(sort == 4){
            optionM = [
                {row: 0, col: 0, rowspan: 2, colspan: 1},
                {row: 0, col: 1, rowspan: 2, colspan: 1},
                {row: 0, col: 2, rowspan: 1, colspan: 8},
                {row: 0, col: 10, rowspan: 1, colspan: 8},
                {row: 0, col: 18, rowspan: 1, colspan: 8},
                {row: 0, col: 26, rowspan: 1, colspan: 8},
            ]
            colWidths = [80,80,
            30,30,30,30,30,30,30,30,
            30,30,30,30,30,30,30,30,
            30,30,30,30,30,30,30,30,
            30,30,30,30,30,30,30,30]
        } else {
            optionM = [
                {row: 0, col: 0, rowspan: 2, colspan: 1},
                {row: 0, col: 1, rowspan: 2, colspan: 1},
                {row: 0, col: 2, rowspan: 1, colspan: 5},
            ]

            colWidths = [80, 60, 30, 30, 30, 30, 30]
        }

        if(iDatas1){ // 검색
            let length;

            if(typeof(iDatas1) == 'object'){
                length = Object.keys(iDatas1).length;
            } else {
                length = iDatas1.length;
            }

            if(length){
                if(length < len){
                    optionM.push({row: len+2, col: 0, rowspan: 1, colspan: 2})
                } else {
                    optionM.push({row: len+2, col: 0, rowspan: 1, colspan: 2})
                }
            }
        } else { // 초기화
            optionM.push({row: len+2, col: 0, rowspan: 1, colspan: 2})
        }

        return {mergeCells: optionM, colWidths: colWidths}
    }

    // 조회
    function searchData(e){
        let cnt = 1
        let isSuccess = new Array(cnt).fill(0);
        let isData = new Array(cnt).fill(0);

        const starttime = consts.date1.replace('T', ' ');
        const endtime = consts.date2.replace('T', ' ');

        let param1 = [null, '5m', '15m', 'hour', 'day', 'mon']
        let param2 = [null, '/s_dirall_', '/wday_mon', '/s_dirall_', '/s_type_']

        let url = selected2 == 2 ? param2[selected2] : param2[selected2] + param1[selected1]

        ajax(`${url}?starttime=${starttime}&endtime=${endtime}&lcno=${stats.lcno}`).then((res)=>{
            if(res.hasOwnProperty('success')){
                initData();
            } else {
                table1.loadData(makeData(res, selected2));
                table1.updateSettings(makeOption(selected2));

                if(selected2 == 1){
                    elems.chart1.data = makeLineChart1(iDatas1)[0]
                    elems.chart1.update();
                    elems.chart2.data = makeDoughnutChart(iDatas1)[0]
                    elems.chart2.update();
                } else if(selected2 == 2){
                    elems.chart3.data = makeLineChart2(iDatas1)[0]
                    elems.chart3.update();
                }
                
                if(!(_.isEmpty(res))){
                    isData[0] = 1;
                }
                isSuccess[0] = 1;
            }
            if(e){
                if(!isSuccess[0] || !isData[0]){
                    document.isSuccess(res);
                } else {
                    document.isSuccess(stats);
                }
            }
        })
    }

    // 초기화
    function initData(sort){
        table1.loadData(makeData(null, sort));
        table1.updateSettings(makeOption(sort));
    }

    // 선형차트1
    function makeLineChart1(data){
        let clabels = [];
        let leftArr = [];
        let goArr = [];
        let rightArr = [];
        let uTurnArr = [];

        if(data) {
            let length;

            if(typeof(data) == 'object'){
                length = Object.keys(data).length;
            } else {
                length = data.length;
            }

            if(length){
                // 방향 탐색
                let dir = Object.keys(iDatas2.reduce(function(result, current) {
                    result[current.dir] = result[current.dir] || [];
                    result[current.dir].push(current);
                    return result;
                }, {}));

                Object.keys(data).forEach((v1, i1) => {
                    let leftVal = 0
                    let goVal = 0
                    let rightVal = 0
                    let uTurnVal = 0

                    // 시간대
                    let time = v1.replace('T', ' ')

                    dir.forEach((v2, i2) => {
                        let obj = data[v1].find(value => value.dir == v2)

                        leftVal += obj ? obj.vcnt1 : 0
                        goVal += obj ? obj.vcnt2 : 0
                        rightVal += obj ? obj.vcnt3 : 0
                        uTurnVal += obj ? obj.vcnt4 : 0
                    })

                    clabels.push(time)
                    leftArr.push(leftVal);
                    goArr.push(goVal);
                    rightArr.push(rightVal);
                    uTurnArr.push(uTurnVal);
                })
            }
        }

        const cdata = {
            labels: clabels,
            datasets: [{
                label: '좌회전',
                data: leftArr,
                fill: false,
                borderColor: '#00CAD1',
                backgroundColor: '#00CAD1',
                tension: 0.1
            },{
                label: '직진',
                data: goArr,
                fill: false,
                borderColor: '#FFD841',
                backgroundColor: '#FFD841',
                tension: 0.1
            },{
                label: '우회전',
                data: rightArr,
                fill: false,
                borderColor: '#02E587',
                backgroundColor: '#02E587',
                tension: 0.1
            },{
                label: '유턴',
                data: uTurnArr,
                fill: false,
                borderColor: '#E53702',
                backgroundColor: '#E53702',
                tension: 0.1
            }]
        };

        const config = {
            type: 'line',
            data: cdata,
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            boxWidth: 10,
                            boxHeight: 10
                        }
                    }
                }
            }
        };

        return [cdata, config]
    }

    // 선형차트2
    function makeLineChart2(data){
        let clabels = [];
        let dayArr = [];
        let endArr = [];

        Object.keys(data).forEach((v1, i1) => {
            // 시간대
            let time = v1.replace('T', ' ');

            // 직진
            let go = data[v1].find(value => value.dir == 10)
            let goDay = go ? go.weekday : 0
            let goEnd = go ? go.weekend : 0

            // 좌회전
            let left = data[v1].find(value => value.dir == 20)
            let leftDay = left ? left.weekday : 0
            let leftEnd = left ? left.weekend : 0

            // 우회전
            let right = data[v1].find(value => value.dir == 30)
            let rightDay = right ? right.weekday : 0
            let rightEnd = right ? right.weekend : 0

            // 합계
            let glrDay = goDay + leftDay + rightDay
            let glrEnd = goEnd + leftEnd + rightEnd

            clabels.push(time)
            dayArr.push(glrDay);
            endArr.push(glrEnd);
        })

        const cdata = {
            labels: clabels,
            datasets: [{
                label: '평일',
                data: dayArr,
                fill: false,
                borderColor: '#00CAD1',
                tension: 0.1
            },{
                label: '주말',
                data: endArr,
                fill: false,
                borderColor: '#FFD841',
                tension: 0.1
            }]
        };

        const config = {
            type: 'line',
            data: cdata,
            options: {
                maintainAspectRatio: false,
            }
        };

        return [cdata, config]
    }

    function makeDoughnutChart(data){
        let leftSum = 0;
        let goSum = 0;
        let rightSum = 0;
        let uTurnSum = 0;

        if(data) {
            let length;

            if(typeof(data) == 'object'){
                length = Object.keys(data).length;
            } else {
                length = data.length;
            }

            if(length){
                // 방향 탐색
                let dir = Object.keys(iDatas2.reduce(function(result, current) {
                    result[current.dir] = result[current.dir] || [];
                    result[current.dir].push(current);
                    return result;
                }, {}));

                Object.keys(data).forEach((v1, i1) => {
                    let leftVal = 0
                    let goVal = 0
                    let rightVal = 0
                    let uTurnVal = 0

                    dir.forEach((v2, i2) => {
                        let obj = data[v1].find(value => value.dir == v2)

                        leftVal += obj ? obj.vcnt1 : 0
                        goVal += obj ? obj.vcnt2 : 0
                        rightVal += obj ? obj.vcnt3 : 0
                        uTurnVal += obj ? obj.vcnt4 : 0
                    })

                    leftSum += leftVal;
                    goSum += goVal;
                    rightSum += rightVal;
                    uTurnSum += uTurnVal;
                })
            }
        }

        const cdata = {
            labels: ['좌회전', '직진', '우회전', '유턴'],
            datasets: [
                {
                    label: '교통량데이터',
                    data: [leftSum, goSum, rightSum, uTurnSum],
                    backgroundColor: ['#00CAD1', '#FFD841', '#02E587', '#E53702'],
                    borderWidth: 0
                }
            ]
        };

        const config = {
            type: 'doughnut',
            data: cdata,
            options: {
                borderRadius: '1',
                maintainAspectRatio: false,
                responsive: true,
                cutout: '60%',
                spacing: 2,
                plugins: {
                    legend: {
                        position: 'bottom',
                        display: false,
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            },
        };

        return [cdata, config]
    }

    function exportExcel(table) {
        // 엑셀
        let exportPlugin = table.getPlugin('exportFile');
        const startYear = consts.date1.split('T')[0].replace(/-/gi, '');
        const endYear = consts.date2.split('T')[0].replace(/-/gi, '');
        const startHour = consts.date1.split('T')[1].split(':')[0];
        const endHour = consts.date2.split('T')[1].split(':')[0];
        const startMin = consts.date1.split('T')[1].split(':')[1];
        const endMin = consts.date2.split('T')[1].split(':')[1];
        exportPlugin.downloadFile('csv', {
            bom: true,
            columnDelimiter: ',',
            exportHiddenColumns: false,
            exportHiddenRows: true,
            fileExtension: 'csv',
            filename: `${stats.lcno}번_교차로_교통량통계(${startYear}.${startHour}시${startMin}분_${endYear}.${endHour}시${endMin}분)`,
            mimeType: 'text/csv',
            rowDelimiter: '\r\n',
            rowHeaders: false
        });
    }

    // 초기 조회
    onMount(()=>{
        initData();

        const ctx1 = elems.canvas1.getContext('2d');
        elems.chart1 = new Chart(ctx1, makeLineChart1({})[1]);

        const ctx2 = elems.canvas2.getContext('2d');
        elems.chart2 = new Chart(ctx2, makeDoughnutChart({})[1]);

        const ctx3 = elems.canvas3.getContext('2d');
        elems.chart3 = new Chart(ctx3, makeLineChart2({})[1]);
    })
</script>

<svelte:options accessors/>
<div id="main" class:modal={winMode == false} class:win={winMode == true}>
    <div class="EntireDiv">
        <div class="tabOption" class:column2={selected2 == 2}>
            <div>
                <div>
                    <Searcher width="200px" bind:value={stats.lcno} onChoose={(no)=>{stats = no}}/>
                </div>
                <div>
                    <input type='datetime-local' bind:value={consts.date1}/>
                </div>
                <div>
                    ~
                </div>
                <div>
                    <input type='datetime-local' bind:value={consts.date2}/>
                </div>
                <div class:none={selected2 == 2}>
                    <div class="sel">
                        <select bind:value={selected1} class="static" >
                            {#each consts.option1 as i}
                                <option value={i.id}>
                                    {i.text}
                                </option>
                            {/each}
                        </select>
                    </div>
                </div>
                <div>
                    <Button height={"30px"} icon='search' colored={true} on:click={searchData} width="80">조회</Button>
                </div>
                <div>
                    <div class="sel">
                        <select bind:value={selected2} on:change={DropDownEvent} class="static" >
                            {#each consts.option2 as i}
                                <option value={i.id}>
                                    {i.text}
                                </option>
                            {/each}
                        </select>
                    </div>
                </div>
            </div>
            <div>
                <Button height={"30px"} icon='print' on:click={exportExcel(table1)} width="100">엑셀출력</Button>
            </div>
        </div>
        <!-- 1, 2 => 테이블 + 차트 / 3, 4 => 테이블 -->
        <div class="tabContent" class:column1={selected2 <= 2} class:winrow={winMode} >
            <div class="static">
                <Table 
                    bind:wrapper={elems.table1}
                    bind:table={table1}
                    data={data1}
                    width={'100%'}
                    height={'100%'}
                    option={option1}
                ></Table>
            </div>
            <div class="chart" class:row1={selected2 == 1} class:row2={selected2 == 2} class:none={selected2 > 2}>
                <div>
                    교통량(대)
                </div>
                <div class="chart1">
                    <canvas class:none={selected2 != 1} bind:this={elems.canvas1}/>
                </div>
                <div class="chart2">
                    <canvas class:none={selected2 != 1} bind:this={elems.canvas2}/>
                </div>
                <div class="chart3">
                    <canvas class:none={selected2 != 2} bind:this={elems.canvas3}/>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* 메인 */
    #main {
        font-size: 1.3rem;
        background-color: #000000;
        padding: 11px;
        height:calc(100% - 40px);
        width:100%;
        box-sizing: border-box;
        /* 높이(가변) */
        /* max-height: 720px; */
    }

        /* 창모드 (넓이 고정) */
        #main.win {
            width: 1300px;
            height: 577px;
        }

        /* 싱글모드 (창모드 넓이 ~ MAX) */
        #main.modal {
            overflow: auto;
        }

    /* 카드 */
    .EntireDiv {
        width:100%;
        box-sizing: border-box;
        height: 100%;
        display : grid;
        grid-template-columns: 1fr;
        grid-template-rows: 34px 1fr;
        grid-row-gap: 10px;
        grid-column-gap: 10px;
        box-shadow: 0px 0px 10px #0000000D;
        /* border: 1px solid #181d22; */
        border-radius: 6px;
        background-color: #212830DD;
        padding: 15px;
    }


        .EntireDiv .tabOption {
            display : grid;
            grid-template-columns: auto 100px;
            grid-column-gap: 10px;
        }

            .EntireDiv .tabOption > div:nth-child(1) {
                display : grid;
                grid-template-columns: 200px max-content 10px max-content 80px 80px 110px;
                grid-column-gap: 10px;
            }

            .EntireDiv .tabContent .chart > div {
                color: #A7A8AA;
                font-size: 1.9rem;
                width: 100%;
                font-weight: bold;
                margin-bottom: 10px;
                /* height: 100%; */
            }

            /* overflow시 스크롤 */
            /* 창모드 */
            #main.win :global(.tableWrapper > .ht_master > .wtHolder) {
                overflow-x: hidden;
                overflow-y: auto;
            }

            /* 싱글, 듀얼모드 */
            #main.modal :global(.tableWrapper > .ht_master > .wtHolder) {
                overflow: auto;
            }

            /* TR TD */
            .EntireDiv .tabContent .static :global(.handsontable tr:nth-child(1) td),
            .EntireDiv .tabContent .static :global(.handsontable tr:nth-child(2) td) {
                color: #666;
                background: #181D23;
            }

            .EntireDiv :global(.handsontable tr td) {
                color: #999999;
                background: #212830;
            }

            .EntireDiv .tabOption > div:nth-child(1) > div:nth-child(2),
            .EntireDiv .tabOption > div:nth-child(1) > div:nth-child(4) {
                border: 1px solid #212830;
                background-color: #212830;
            }

            .EntireDiv .tabOption > div:nth-child(1) > div:nth-child(3) {
                font-size: 10px;
                line-height: 34px;
                text-align: center;
            }

                .EntireDiv .tabOption > div:nth-child(1) > div:nth-child(2) :global(input),
                .EntireDiv .tabOption > div:nth-child(1) > div:nth-child(4) :global(input) {
                    color: #FFF;
                    border: 1px solid #212830;
                    background-color: #212830;
                }

    input[type="datetime-local"] {
        height: calc(100% - 2px);
        border: 1px solid #DADDE1;
        border-radius: 4px;
        padding: 0 2px;
        font-size: 1.3rem;
        color: #0584FE;
    }

    .sel {
        position: relative;
        overflow: hidden;
        height: 32px;
        font-size: 1.3rem;
        border-radius: 4px;
        border: 1px solid #212830;
        background-color: #14181D;
    }

        .sel > select {
            width: 100%;
            height: calc(100% - 1px);
            padding: 0 9px;
            border: none;
            margin: 0;
            color: #FFF;
            background-color: #14181D;
            font-size: 1.3rem;
        }

    /* scroll */
    #main :global(::-webkit-scrollbar) {width: 7px;height: 7px; background-color: rgba(0, 0, 0, 0.7);}
    #main :global(::-webkit-scrollbar-thumb) {background-color:rgba(126, 126, 126, 0.7); border-radius: 2px;}

    /* etc */
    .tabContent {
        width: 100%;
        display : grid;
        grid-template-columns: 1fr;
    }
    .column1 {
        /* display : grid; */
        grid-template-columns: 581px 1fr !important;
        /* grid-template-columns: 581px 677px; */
        grid-column-gap: 10px;
    }

    .win .column1 {
        grid-template-columns: 581px 670px !important;
    }
    .winrow {
        grid-template-columns: 1260px;
        grid-template-rows: 484px;
    }
        .win .chart > div{
            width: 670px !important;
        }
    .column2{
        grid-template-columns: 200px max-content 10px max-content 80px 110px !important;
    }

    .row1 {
        display : grid;
        grid-template-rows: min-content 1fr 1fr 0;
    }
        .win .row1 {
            grid-template-rows: min-content 240px 210px 0;
        }
    .row2 {
        display : grid;
        grid-template-rows: min-content 0 0 450px;
    }

    .none {
        display: none !important;
    }
</style>