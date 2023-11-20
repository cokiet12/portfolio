<script>
    // @ts-nocheck
        import { onMount } from 'svelte'
        import Table from '$lib/nested/table.svelte'
        import Searcher from '$lib/nested/searcher.svelte'
        import { ajax } from '$lib/js/functions.mjs'
        import _ from 'lodash'
        import Chart from 'chart.js/auto/auto.js'
        import Input from '$lib/nested/input.svelte'
        import Hls from 'hls.js' 
    
        // 창모드 / 싱글, 듀얼모드
        export let winMode = true;

        export let params;
    
        const consts = {
            option1 : [
                {id: 1, text: '북'},
                {id: 2, text: '동'},
                {id: 3, text: '남'},
                {id: 4, text: '서'},
                {id: 5, text: '북동'},
                {id: 6, text: '남동'},
                {id: 7, text: '남서'},
                {id: 8, text: '북서'},
            ],
            color : {
                '북': '#0A84FF',
                '동': '#F1BC2F',
                '남': '#BDBDBD',
                '서': '#D77937',
                '북동': '#0A84FF',
                '남동': '#F1BC2F',
                '남서': '#BDBDBD',
                '북서': '#D77937',
            }
        }
        let stats = {
            lcno : 241,
            sano : 1,
            year : 2010
        }
    
        $:searchEvent(stats)
    
        let elems = {
            canvas1 : null,
            canvas2 : null,
            table1 : null,
            table2 : null,
            tl: null,
            tr: null,
            bl: null,
            br: null,
            all: null,
            chart1: null,
            chart2: null
        }
    
        // 전체, 접근로
        let showall = 0;
    
        // 방향
        let selected1 = 1;
    
        // Table
        let table1;
    
        // Datas
        let data1 = []
    
        // Idatas
        let iDatas = []
    
        $: loadTables(showall);
    
        // Cells
        let optionC = function(row, col, prop) {
            let cellProperties = {};
            cellProperties.readOnly = true
            return cellProperties
        };
    
        // Option
        let option1 = {
            colWidths : 30,
            rowHeights: 23,
            renderer: 'html',
            cells: optionC,
            renderAllRows: true,
            fixedRowsTop: 2
        }
    
        // Search Event
        function searchEvent(stat){
            stats = params ? params : stat;
            setTimeout(()=>{
                if (table1 && elems.tl && elems.tr && elems.bl && elems.br) {
                    showall = 0;                
                    searchData();
                    streamLive();
                }
            })
        }
    
        // show All
        function loadTables(show) {
            setTimeout(()=>{
                if (table1) {
                    searchData();
                }
    
                if(elems.tl && elems.tr && elems.bl && elems.br){
                    streamControl();
                }
    
                if(elems.chart1 && elems.chart2){
                    chartControl();
                }
            })
        }
    
        // 데이터 생성
        function makeData(res){
            let _data;
            let len = 20;
    
            // 전체교차로
            if (!showall) {
                _data = [
                    ['시간', '교통량', '', '', '', 'LOS', '', '', ''],
                    ['', '-', '-', '-', '-', '-', '-', '-', '-']
                ]
    
                for(let i=0; i<len; i++){
                    _data.push(['-', '-', '-', '-', '-', '-', '-', '-', '-'])
                }
            } 
            // 접근로별
            else {
                _data = [
                    ['시간', '교통량', '', '', '', '', 'LOS'],
                    ['', '좌회전', '직진', '우회전', 'U턴', '총합', '']
                ]
    
                for(let i=0; i<len; i++){
                    _data.push(['-', '-', '-', '-', '-', '-', '-'])
                }
            }
    
            if(res) {
                let length;
    
                if(typeof(res) == 'object'){
                    length = Object.keys(res).length;
                } else {
                    length = res.length;
                }
    
                if(length){
                    if(!showall) {
                        _data = [
                            ['시간', '교통량', '', '', '', 'LOS', '', '', ''],
                            ['', '-', '-', '-', '-', '-', '-', '-', '-']
                        ]
    
                        // 방향 탐색
                        let dir = Object.keys(res.reduce(function(result, current) {
                            result[current.dir] = result[current.dir] || [];
                            result[current.dir].push(current);
                            return result;
                        }, {}));
    
                        dir.forEach((v, i) => {
                            let dirname = v == 10 ? '북' : v == 20 ? '동' : v == 30 ? '남' : v == 40 ? '서' : v == 50 ? '북동' : v == 60 ? '남동' : v == 70 ? '남서' : '북서'
                            _data[1][i+1] = dirname
                            _data[1][i+5] = dirname
                        })
    
                        // CRE_DATE를 기준으로 GROUP BY
                        let _res = res.reduce(function(result, current) {
                            result[current.cre_date] = result[current.cre_date] || [];
                            result[current.cre_date].push(current);
                            return result;
                        }, {});
    
                        Object.keys(_res).forEach((v1, i1) => {
                            if(i1<20){
                                let arr = [v1.split('T')[1], '-', '-', '-', '-', '-', '-', '-', '-']
    
                                dir.forEach((v2, i2) => {
                                    let obj = _res[v1].find(value => value.dir == v2)
    
                                    let count = obj ? obj.v_count : 0
                                    let los = obj ? obj.los : '-'
    
                                    arr[i2+1] = count;
                                    arr[i2+5] = los;
                                })
    
                                _data.push(arr);
                            }
                        })
    
                        // 나머지 ROW 채우기
                        if(Object.keys(_res).length < len){
                            for(let i=0; i<len-(Object.keys(_res).length); i++){
                                _data.push(['-', '-', '-', '-', '-', '-', '-', '-', '-'])
                            }
                        }
                    } else {
                        _data = [
                            ['시간', '교통량', '', '', '', '', 'LOS'],
                            ['', '좌회전', '직진', '우회전', 'U턴', '총합', '']
                        ]
    
                        res.forEach((v, i) => {
                            if(i<20){
                                // 좌회전
                                let leftVal = v.vcnt1;
    
                                // 좌회전
                                let goVal = v.vcnt2;
    
                                // 우회전
                                let rightVal = v.vcnt3;
    
                                // 유턴
                                let uTurnVal = v.vcnt4;
    
                                // 총합
                                let glru = goVal + leftVal + rightVal + uTurnVal
    
                                let losVal = v.los;
    
                                let arr = [v.cre_date.split('T')[1], goVal, leftVal, rightVal, uTurnVal, glru, losVal]
    
                                _data.push(arr);
                            }
                        })
    
                        // 나머지 ROW 채우기
                        if(res.length < len){
                            for(let i=0; i<len-(Object.keys(_res).length); i++){
                                _data.push(['-', '-', '-', '-', '-', '-', '-'])
                            }
                        }
                    }
                }
            }
    
            return _data
        }
    
        // 옵션 생성
        function makeOption(sort){
            let optionM;
            if (showall) {
                optionM = [
                    {row: 0, col: 0, rowspan: 2, colspan: 1},
                    {row: 0, col: 1, rowspan: 1, colspan: 5},
                    {row: 0, col: 6, rowspan: 2, colspan: 1}
                ]
            } else { //전체교차로
                optionM = [
                    {row: 0, col: 0, rowspan: 2, colspan: 1},
                    {row: 0, col: 1, rowspan: 1, colspan: 4},
                    {row: 0, col: 5, rowspan: 1, colspan: 4}
                ]
            }
            return {mergeCells: optionM}
        }
    
        // 조회
        function searchData(e){
            let today = new Date();
            let yesterday = new Date(new Date().setDate(new Date().getDate()-7))
    
            // 현재
            let tyear = today.getFullYear();
            let tmonth = ('0' + (today.getMonth()+1)).slice(-2);
            let tday = ('0' + today.getDate()).slice(-2);
            let thours = ('0' + today.getHours()).slice(-2);
            let tminutes = ('0' + today.getMinutes()).slice(-2);
            let tseconds = ('0' + today.getSeconds()).slice(-2);
    
            // 3시간전
            let yyear = yesterday.getFullYear();
            let ymonth = ('0' + (yesterday.getMonth()+1)).slice(-2);
            let yday = ('0' + yesterday.getDate()).slice(-2);
            let yhours = ('0' + yesterday.getHours()).slice(-2);
            let yminutes = ('0' + yesterday.getMinutes()).slice(-2);
            let yseconds = ('0' + yesterday.getSeconds()).slice(-2);
    
            const starttime = yyear + "-" + ymonth + "-" + yday + " " + yhours + ":" + yminutes + ":" + yseconds;
            const endtime = tyear + "-" + tmonth + "-" + tday + " " + thours + ":" + tminutes + ":" + tseconds;
    
            let param1 = [null, '5m', '15m', 'hour', 'day', 'mon']
            let param2 = [null, '/s_lclos_', '/s_dirlos_']
    
            let url1 = param2[showall + 1] + param1[1]
            let url2 = `${url1}?starttime=${starttime}&endtime=${endtime}&lcno=${stats.lcno}`
            let url3 = showall ? url2 + `&dir=${selected1*10}` : url2
    
            ajax(url3).then((res)=>{
                if(res.hasOwnProperty('success')){
                    initData();
                } else {
                    table1.loadData(makeData(res));
                    table1.updateSettings(makeOption());
    
                    if(showall == 0){
                        elems.chart1.data = makeBarChart(res)[0]
                        elems.chart1.update();
                        elems.chart2.data = makeLineChart(res)[0]
                        elems.chart2.update();
                    }
                }
            })
        }
    
        // 초기화
        function initData(){
            table1.loadData(makeData(null));
        }
    
        // 선형차트
        function makeBarChart(data){
            // default
            let cdata = {
                labels: [],
                datasets: []
            };
    
            const config = {
                type: 'bar',
                data: cdata,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                boxWidth: 10,
                                boxHeight: 10
                            }
                        }
                    }
                },
            };
    
            if(data.length){
                let datasets = {
                    '북' : {
                        arr : [],
                        bg : []
                    },
                    '동' : {
                        arr : [],
                        bg : []
                    },
                    '남' : {
                        arr : [],
                        bg : []
                    },
                    '서' : {
                        arr : [],
                        bg : []
                    },
                    '북동' : {
                        arr : [],
                        bg : []
                    },
                    '남동' : {
                        arr : [],
                        bg : []
                    },
                    '남서' : {
                        arr : [],
                        bg : []
                    },
                    '북서' : {
                        arr : [],
                        bg : []
                    },
                } 
    
                // 방향 탐색
                let dir = Object.keys(data.reduce(function(result, current) {
                    result[current.dir] = result[current.dir] || [];
                    result[current.dir].push(current);
                    return result;
                }, {}));
    
                // CRE_DATE를 기준으로 GROUP BY
                let _res = data.reduce(function(result, current) {
                    result[current.cre_date] = result[current.cre_date] || [];
                    result[current.cre_date].push(current);
                    return result;
                }, {});
    
                Object.keys(_res).forEach((v1, i1) => {
                    if(i1<20){
                        // 시간대
                        let time = v1.split('T')[1];
    
                        dir.forEach((v2, i2) => {
                            let dirname = v2 == 10 ? '북' : v2 == 20 ? '동' : v2 == 30 ? '남' : v2 == 40 ? '서' : v2 == 50 ? '북동' : v2 == 60 ? '남동' : v2 == 70 ? '남서' : '북서'
                            let obj = _res[v1].find(value => value.dir == v2)
                            let val = obj ? obj.v_count : 0
    
                            datasets[dirname].arr.push(val);
                            datasets[dirname].bg.push(consts.color[dirname])
                        })
    
                        cdata.labels.push(time)
                    }
                })
    
                dir.forEach((v2, i2) => {
                    let dirname = v2 == 10 ? '북' : v2 == 20 ? '동' : v2 == 30 ? '남' : v2 == 40 ? '서' : v2 == 50 ? '북동' : v2 == 60 ? '남동' : v2 == 70 ? '남서' : '북서'
                    let json = {
                        label: dirname,
                        data: datasets[dirname].arr,
                        backgroundColor: datasets[dirname].bg
                    }
    
                    cdata.datasets.push(json);
                })
            }
            
            return [cdata, config]
        }
    
        function makeLineChart(data){
            let yLabels = {
                1 : 'FFF',
                2 : 'FF',
                3 : 'F',
                4 : 'E',
                5 : 'D',
                6 : 'C',
                7 : 'B',
                8 : 'A'
            }

            var ticks = [8, 7, 6, 5, 4, 3, 2, 1, 0];
    
            let cdata = {
                labels: [],
                datasets: []
            };
    
            const config = {
                type: 'line',
                data: cdata,
                options: {
                    scales: {
                        y: {
                            suggestedMin: 0,
                            suggestedMax: 8,
                            ticks: {
                                autoSkip: false,
                                min: ticks[ticks.length - 1],
                                max: ticks[0],
                                callback: function(value, index, values) {
                                    //return yLabels[value];
                                    return value;
                                }
                            },
                            afterTickToLabelConversion: function (chart) {
                                chart.ticks = []
                                chart.ticks.push({ value: 0, label: ' ' })
                                chart.ticks.push({ value: 1, label: 'FFF' })
                                chart.ticks.push({ value: 2, label: 'FF' })
                                chart.ticks.push({ value: 3, label: 'F' })
                                chart.ticks.push({ value: 4, label: 'E' })
                                chart.ticks.push({ value: 5, label: 'D' })
                                chart.ticks.push({ value: 6, label: 'C' })
                                chart.ticks.push({ value: 7, label: 'B' })
                                chart.ticks.push({ value: 8, label: 'A' })
                            },
                        }
                    },
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

            if(data.length){
                let datasets = {
                    '북' : {
                        arr : [],
                        bg : null
                    },
                    '동' : {
                        arr : [],
                        bg : null
                    },
                    '남' : {
                        arr : [],
                        bg : null
                    },
                    '서' : {
                        arr : [],
                        bg : null
                    },
                    '북동' : {
                        arr : [],
                        bg : null
                    },
                    '남동' : {
                        arr : [],
                        bg : null
                    },
                    '남서' : {
                        arr : [],
                        bg : null
                    },
                    '북서' : {
                        arr : [],
                        bg : null
                    },
                } 
    
                // 방향 탐색
                let dir = Object.keys(data.reduce(function(result, current) {
                    result[current.dir] = result[current.dir] || [];
                    result[current.dir].push(current);
                    return result;
                }, {}));
    
                // CRE_DATE를 기준으로 GROUP BY
                let _res = data.reduce(function(result, current) {
                    result[current.cre_date] = result[current.cre_date] || [];
                    result[current.cre_date].push(current);
                    return result;
                }, {});
    
                Object.keys(_res).forEach((v1, i1) => {
                    if(i1<20){
                        // 시간대
                        let time = v1.split('T')[1];
    
                        dir.forEach((v2, i2) => {
                            let dirname = v2 == 10 ? '북' : v2 == 20 ? '동' : v2 == 30 ? '남' : v2 == 40 ? '서' : v2 == 50 ? '북동' : v2 == 60 ? '남동' : v2 == 70 ? '남서' : '북서'
                            let obj = _res[v1].find(value => value.dir == v2)
                            let tmp = obj ? obj.los : '-'
                            let val;
    
                            switch(tmp){
                                case 'A':
                                    val = 8;
                                    break;
                                case 'B':
                                    val = 7;
                                    break;
                                case 'C':
                                    val = 6;
                                    break;
                                case 'D':
                                    val = 5;
                                    break;
                                case 'E':
                                    val = 4;
                                    break;
                                case 'F':
                                    val = 3;
                                    break;
                                case 'FF':
                                    val = 2;
                                    break;
                                case 'FFF':
                                    val = 1;
                                    break;
                                default:
                                    val = 0;
                                    break;
                            }
    
                            datasets[dirname].arr.push(val);
                            datasets[dirname].bg = consts.color[dirname]
                        })
    
                        cdata.labels.push(time)
                    }
                })
    
                dir.forEach((v2, i2) => {
                    let dirname = v2 == 10 ? '북' : v2 == 20 ? '동' : v2 == 30 ? '남' : v2 == 40 ? '서' : v2 == 50 ? '북동' : v2 == 60 ? '남동' : v2 == 70 ? '남서' : '북서'
                    let json = {
                        label: dirname,
                        data: datasets[dirname].arr,
                        fill: false,
                        borderColor: datasets[dirname].bg,
                        backgroundColor: datasets[dirname].bg
                    }
    
                    cdata.datasets.push(json);
                })
            }
    
            return [cdata, config]
        }
    
        // 스트리밍
        function streamLive(){
            ajax(`/ntcs_m_camera_lc?lcno=${stats.lcno}`).then((res)=>{
                document.querySelectorAll(`.camera div.title`).forEach((v, i) => {
                    v.style.display = 'none'
                })
                document.querySelectorAll(`video`).forEach((v, i) => {
                    v.src = ""
                    v.controls = false;
                })
                document.querySelectorAll(`.camera > div`).forEach((v, i) => {
                    v.style.pointerEvents = 'none'
                    v.removeAttribute('id')
                })
                if(res.length){
                    let tmp = res.sort(function (a, b) {
                        if(a.hasOwnProperty('dir')){
                            return a.dir - b.dir;
                        }
                    });

                    // 접근로 초기화
                    consts.option1 = [];
    
                    // 방향 탐색
                    let dir = Object.keys(tmp.reduce(function(result, current) {
                        result[current.dir] = result[current.dir] || [];
                        result[current.dir].push(current);
                        return result;
                    }, {}));
    
                    dir.forEach((v, i) => {
                        let dirname = v == 10 ? '북' : v == 20 ? '동' : v == 30 ? '남' : v == 40 ? '서' : v == 50 ? '북동' : v == 60 ? '남동' : v == 70 ? '남서' : '북서'
                        consts.option1.push({id: v/10, text: dirname})
                    })
    
                    selected1 = consts.option1[0].id
    
                    tmp.forEach((v, i) => {
                        if(v.info){
                            let id = ['tl', 'tr', 'bl', 'br']
                            let videoTitle = document.querySelector(`.camera div.${id[i]} div.title`);
                            let videoTag = document.querySelector(`video#${id[i]}`);
                            let videoDiv = document.querySelector(`.${id[i]}`);
                            let videoSrc;
                            let dir;
    
                            // 방향
                            if(v.dir){
                                dir = v.dir == 10 ? '북' : v.dir == 20 ? '동' : v.dir == 30 ? '남' : v.dir == 40 ? '서' : v.dir == 50 ? '북동' : v.dir == 60 ? '남동' : v.dir == 70 ? '남서' : '북서'
                                videoTitle.innerText = dir;
                                videoTitle.style.display = 'block'
                                videoTitle.style.backgroundColor = consts.color[dir]
                                videoDiv.style.pointerEvents = 'auto'
                                videoDiv.setAttribute('id', dir)
                                videoTag.controls = true;
                            } else {
                                videoDiv.style.pointerEvents = 'none'
                            }
    
                            // SRC
                            if(v.ip && v.auth_key && v.info){
                                if(v.auth_key == '1935'){
                                    videoSrc = `http://${v.ip}:${v.auth_key}/live/cctv00${v.dir/10}.stream/playlist.m3u8`
                                } else {
                                    videoSrc = `http://${v.ip}/media/${v.auth_key}_video2/chunklist.m3u8`
                                    // videoSrc = `http://210.99.70.120:1935/live/cctv00${v.dir/10}.stream/playlist.m3u8`
                                }
    
                                if (videoTag.canPlayType('application/vnd.apple.mpegurl')){
                                    videoTag.src = videoSrc;
                                } else if (Hls.isSupported()) {
                                    let hls = new Hls();
                                    hls.loadSource(videoSrc);
                                    hls.attachMedia(videoTag);
    
                                    hls.on(Hls.Events.ERROR, function(event, data) {
                                        var errorType = data.type;
                                        var errorDetails = data.details;
                                        var errorFatal = data.fatal;
    
                                        if(errorDetails == 'manifestLoadTimeOut'){
                                            hls.stopLoad();
                                            hls.startLoad();
                                        }
                                        
                                        hls.recoverMediaError();
                                    });
                                }
                            } 
                        }
                    })
                }
            })
        }
    
        function streamControl(){
            let cameraDiv = document.querySelector('.row2 .camera')
            if(showall == 0){
                if(!cameraDiv.classList.contains('all')){
                    cameraDiv.classList.add('all')
                }
                
                if(cameraDiv.classList.contains('access')){
                    cameraDiv.classList.remove('access')
                }
    
                document.querySelectorAll(`.camera > div`).forEach((v, i) => {
                    if(v.classList.contains('dnone')){
                        v.classList.remove('dnone')
                    }
                })
            } else {
                if(!cameraDiv.classList.contains('access')){
                    cameraDiv.classList.add('access')
                }
                
                if(cameraDiv.classList.contains('all')){
                    cameraDiv.classList.remove('all')
                }
    
                // row2 > camera에 access class 설정
                document.querySelectorAll(`.camera > div`).forEach((v, i) => {
                    let sel = selected1*10
                    let dir = sel == 10 ? '북' : sel == 20 ? '동' : sel == 30 ? '남' : sel == 40 ? '서' : sel == 50 ? '북동' : sel == 60 ? '남동' : sel == 70 ? '남서' : '북서'
                    
                    if(v.id == dir){
                        if(v.classList.contains('dnone')){
                            v.classList.remove('dnone')
                        }
                    } else {
                        if(!v.classList.contains('dnone')){
                            v.classList.add('dnone')
                        } 
                    }
                })
            }
        }
    
        function chartControl(){
            if(showall == 1){
                elems.chart1.data.datasets.forEach((v, i) => {
                    let sel = selected1*10
                    let dir = sel == 10 ? '북' : sel == 20 ? '동' : sel == 30 ? '남' : sel == 40 ? '서' : sel == 50 ? '북동' : sel == 60 ? '남동' : sel == 70 ? '남서' : '북서'
                
                    if(v.label == dir){
                        v.hidden = false
                    } else {
                        v.hidden = true
                    }
                })
    
                elems.chart2.data.datasets.forEach((v, i) => {
                    let sel = selected1*10
                    let dir = sel == 10 ? '북' : sel == 20 ? '동' : sel == 30 ? '남' : sel == 40 ? '서' : sel == 50 ? '북동' : sel == 60 ? '남동' : sel == 70 ? '남서' : '북서'
                
                    if(v.label == dir){
                        v.hidden = false
                    } else {
                        v.hidden = true
                    }
                })
    
                elems.chart1.config.options.plugins.legend.display = false;
                elems.chart2.config.options.plugins.legend.display = false;
    
                elems.chart1.update();
                elems.chart2.update();
            } else {
                elems.chart1.data.datasets.forEach((v, i) => {
                    v.hidden = false
                })
    
                elems.chart2.data.datasets.forEach((v, i) => {
                    v.hidden = false
                })
    
                elems.chart1.config.options.plugins.legend.display = true;
                elems.chart2.config.options.plugins.legend.display = true;
    
                elems.chart1.update();
                elems.chart2.update();
            }
        }
    
        // 초기 조회
        onMount(()=>{
            searchData();
    
            const ctx1 = elems.canvas1.getContext('2d');
            elems.chart1 = new Chart(ctx1, makeBarChart([])[1]);
    
            const ctx2 = elems.canvas2.getContext('2d');
            elems.chart2 = new Chart(ctx2, makeLineChart({})[1]);
    
            streamLive();
        })
    </script>
    
    <svelte:options accessors/>
    <div id="main" class:modal={winMode == false} class:win={winMode == true}>
        <div class="EntireDiv">
            <div class="row1">
                <div class="search">
                    <Searcher bind:value={stats.lcno} width="200px" onChoose={(no)=>{stats = no;}}></Searcher>
                </div>
                <div>
                    <Input type="radio" radios={['전체교차로','접근로별']} bind:checked={showall} top={"7px"}/>
                </div>
                <div class="select" class:disabled={showall==0}>
                    <div>
                        <select bind:value={selected1} on:change={loadTables} class="static" >
                            {#each consts.option1 as i}
                                <option value={i.id}>
                                    {i.text}
                                </option>
                            {/each}
                        </select>
                    </div>
                </div>
            </div>
            <div class="row2">
                <div class="camera all">
                    <div class="tl">
                        <div class="title"></div>
                        <!-- svelte-ignore a11y-media-has-caption -->
                        <video bind:this={elems.tl} id="tl" autoplay loop>
                        </video>
                    </div>
                    <div class="tr">
                        <div class="title"></div>
                        <!-- svelte-ignore a11y-media-has-caption -->
                        <video bind:this={elems.tr} id="tr" autoplay loop>
                        </video>
                    </div>
                    <div class="bl">
                        <div class="title"></div>
                        <!-- svelte-ignore a11y-media-has-caption -->
                        <video bind:this={elems.bl} id="bl" autoplay loop>
                        </video>
                    </div>
                    <div class="br">
                        <div class="title"></div>
                        <!-- svelte-ignore a11y-media-has-caption -->
                        <video bind:this={elems.br} id="br" autoplay loop>
                        </video>
                    </div>
                </div>
                <div class="traffic">
                    <div>
                        <Table 
                            bind:wrapper={elems.table1}
                            bind:table={table1}
                            data={data1}
                            width={'100%'}
                            height={'100%'}
                            option={option1}
                        ></Table>
                    </div>
                </div>
                <div class="chart1">
                    교차로 교통량
                    <canvas style="margin:auto;" width={650} height={200} bind:this={elems.canvas1}/>
                </div>
                <div class="chart2">
                    LOS(서비스 수준)
                    <canvas style="margin:auto;" width={540} height={200} bind:this={elems.canvas2}/>
                </div>
    
                <!-- <div class="chart2">
                    LOS
                    <canvas style="margin:auto;" width={518} height={300} bind:this={elems.canvas2}/>
                </div> -->
            </div>
        </div>
    </div>
    
    <style>
        /* 메인 */
        .disabled {
            pointer-events: none;
            opacity: 0.5;
        }
        :global(.dnone),
        :global(.camera.access div div.title) {
            display:none !important;
        }
        #main {
            font-size: 1.3rem;
            background-color: #000000;
            padding: 11px;
            /* 높이(가변) */
            height: calc(100% - 40px);
            box-sizing: border-box;
        }
            /* 창모드 (넓이 고정) */
            #main.win {
                width: 1260px;
            }
    
            /* 싱글모드 (창모드 넓이 ~ MAX) */
            #main.modal {
                overflow: auto;
            }
    
        /* 카드 */
        .EntireDiv {
            box-shadow: 0px 0px 10px #0000000D;
            /* border: 1px solid #181D23; */
            border-radius: 6px;
            background-color: #212830DD;
            display : grid;
            grid-template-rows: 32px auto;
            grid-row-gap: 10px;
            padding: 10px;
        }
    
            /* 교차로 검색 및 리스트 선택 */
            .EntireDiv .row1 {
                display: grid;
                grid-template-columns: 200px 210px 80px;
                grid-template-rows: auto;
                grid-column-gap: 10px;
            }
    
            /* 영상 및 데이터 */
            .EntireDiv .row2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 3fr 2fr;
                grid-column-gap: 10px;
                grid-row-gap: 10px;
            }
    
                /* 전체 교차로 */
                .EntireDiv .row2 .camera:global(.all) {
                    /* grid-area: 1 / 1 / 3 / 2; */
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: 1fr 1fr;
                    gap: 10px;
                    width:650px;
                    height:366px;
                }
    
                /* 접근로별 */
                .EntireDiv .row2 .camera:global(.access) {
                    display: grid;
                    /* grid-template-columns: 1fr 1fr;
                    grid-template-rows: 3fr 2fr;
                    grid-column-gap: 10px;
                    grid-row-gap: 10px; */
                }
                    .EntireDiv .row2 .camera > div {
                        position:relative;
                        /* min-height:190px; */
                        background-color:#14181D;
                    }
                    .EntireDiv .row2 .camera video {
                        /* position:absolute; */
                        width: 0;
                        height: 0;
                        min-height: 100%;
                        min-width: 100%;
                        z-index: 0;
                        background-size: cover;
                        overflow: hidden;
                        aspect-ratio: 320 / 178;
                        object-fit: cover;
                        transition: .35s linear;
                    }
                    .EntireDiv .row2 .camera video:hover {
                        width: 590px;
                        height: 302px;
                    }
                    .EntireDiv .row2 .camera .title {
                        width: 35px;
                        height: 35px;
                        display: none;
                        z-index: 1;
                        color : #FFF;
                        font-size: 1.3rem;
                        position:absolute;
                        text-align: center;
                    }
                    .EntireDiv .row2 .camera .tl > div {
                        right:0; 
                        bottom:0; 
                        border-radius: 100px 0 0 0;
                        -moz-border-radius: 100px 0 0 0;
                        -webkit-border-radius: 100px 0 0 0;
                        line-height: 41px;
                        text-indent: 6px;
                    }
                    .EntireDiv .row2 .camera .tr > div {
                        left:0; 
                        bottom:0;
                        border-radius: 0 100px 0 0;
                        -moz-border-radius: 0 100px 0 0;
                        -webkit-border-radius: 0 100px 0 0;
                        line-height: 41px;
                        text-indent: -4px;
                    }
                    .EntireDiv .row2 .camera .bl > div {
                        right:0; 
                        top:0;
                        border-radius: 0 0 0 100px;
                        -moz-border-radius: 0 0 0 100px;
                        -webkit-border-radius: 0 0 0 100px;
                        line-height: 29px;
                        text-indent: 6px;
                    }
                    .EntireDiv .row2 .camera .br > div {
                        left:0; 
                        top:0;
                        border-radius: 0 0 100px 0;
                        -moz-border-radius: 0 0 100px 0;
                        -webkit-border-radius: 0 0 100px 0;
                        line-height: 29px;
                        text-indent: -4px;
                    }
                    .EntireDiv .row2 .camera .tl > video { right:0; bottom:0}
                    .EntireDiv .row2 .camera .tr > video { left:0; bottom:0}
                    .EntireDiv .row2 .camera .bl > video { right:0; top:0}
                    .EntireDiv .row2 .camera .br > video { left:0; top:0}
    
                .EntireDiv .row2 .traffic {
                    grid-area: 1 / 2 / 2 / 3;
                    display: grid;
                }
    
                    .EntireDiv .row2 .traffic > div :global(.handsontable tr:nth-child(1) td),
                    .EntireDiv .row2 .traffic > div :global(.handsontable tr:nth-child(2) td),
                    .EntireDiv .row2 .traffic > div :global(.handsontable tr td:nth-child(1)) {
                        color: #666;
                        background: #181D23;
                    }
    
                    .EntireDiv .row2 .traffic > div :global(.handsontable td) {
                        color: #999999;
                        background: #212830;
                    }
    
            /* 리스트 */
            .select > div {
                position: relative;
                overflow: hidden;
                height: 32px;
                font-size: 1.3rem;
                border-radius: 4px;
                border: 1px solid #212830;
                background-color: #14181D;
            }
    
                .select > div > select {
                    width: 100%;
                    height: calc(100% - 1px);
                    padding: 0 9px;
                    border: none;
                    margin: 0;
                    color: #FFF;
                    background-color: #14181D;
                    font-size: 1.3rem;
                }
    
            /* Handsontable */
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
    
        /* scroll */
        #main :global(::-webkit-scrollbar) {width: 7px;height: 7px; background-color: rgba(0, 0, 0, 0.7);}
        #main :global(::-webkit-scrollbar-thumb) {background-color:rgba(126, 126, 126, 0.7); border-radius: 2px;}
    </style>