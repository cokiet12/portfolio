<script>
    // @ts-nocheck
        import { onMount } from 'svelte';
        import Table from '$lib/nested/table.svelte'
        import Searcher from '$lib/nested/searcher.svelte'
        import Button from '$lib/nested/button.svelte';
        import { ajax } from '$lib/js/functions.mjs'
        import _ from 'lodash'
    
        // 창모드 / 싱글, 듀얼모드
        export let winMode = false;
    
        const consts = {
            option : [
                {id: 1, text: '5분'},
                {id: 2, text: '15분'},
                {id: 3, text: '1시간'},
                {id: 4, text: '1일'},
                {id: 5, text: '한달'}
            ],
            date1 : null,
            date2 : null
        }
    
        export let stats = {
            lcno : 241,
            sano : 1,
            year : 2010
        }
    
        $:statEvent(stats)
    
        let elems = {
            table1 : null
        }
        // Table
        let table1;
    
        // Selected
        let selected = 1;
    
        // Datas
        let data1 = []
    
        // Cells
        let optionC = function(row, col, prop) {
            let cellProperties = {};
            cellProperties.readOnly = true
            return cellProperties
        };
    
        // Option
        let option1 = {
            colWidths: [50,22,50,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25],
            rowHeaders: true,
            rowHeaderWidth : 0,
            rowHeights: 23,
            renderer: 'html',
            renderAllRows: true,
            fixedRowsTop: 2,
            fixedRowsBottom: 1,
            fixedColumnsStart: 3,
            cells: optionC
        }
    
        // 시간 초기화
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
    
        function statEvent(stat){
            if(table1){
                initData();
            }
        }
    
        // 데이터 생성
        function makeData(res){
            let _data;
            let len = 40;
    
            // 초기
            _data = [
                ['교차로명', '방향', '수집일시', 
                '좌회전', '', '', '', '', '', '', '',
                '직진', '', '', '', '', '', '', '',
                '우회전', '', '', '', '', '', '', ''],
                ['', '', '',
                '미확인', '세단', 'SUV', 'VAN', '트럭', '버스', '이륜', '굴삭기',
                '미확인', '세단', 'SUV', 'VAN', '트럭', '버스', '이륜', '굴삭기',
                '미확인', '세단', 'SUV', 'VAN', '트럭', '버스', '이륜', '굴삭기']
            ]
            
            for(let i=0; i<len; i++){
                _data.push(['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'])
            }
                
            _data.push(['합계', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'])
    
            if(res) {
                let length;
    
                if(typeof(res) == 'object'){
                    length = Object.keys(res).length;
                } else {
                    length = res.length;
                }
    
                if(length){
                    console.log(res)
                    let sum = ['합계', '-', '-', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    
                    _data = [
                        ['교차로명', '방향', '수집일시', 
                        '좌회전', '', '', '', '', '', '', '',
                        '직진', '', '', '', '', '', '', '',
                        '우회전', '', '', '', '', '', '', ''],
                        ['', '', '',
                        '미확인', '세단', 'SUV', 'VAN', '트럭', '버스', '이륜', '굴삭기',
                        '미확인', '세단', 'SUV', 'VAN', '트럭', '버스', '이륜', '굴삭기',
                        '미확인', '세단', 'SUV', 'VAN', '트럭', '버스', '이륜', '굴삭기']
                    ]
                    
                    // // CRE_DATE, DIR, LINE을 기준으로 GROUP BY
                    let _res = res.reduce(function(result, current) {
                        let key = `${current.cre_date}/${current.dir}`
                        result[key] = result[key] || [];
                        result[key].push(current);
                        return result;
                    }, {});
    
                    console.log(_res)
    
                    Object.keys(_res).forEach((v1, i1) => {
                        let dir = v1.split('/')[1] == 10 ? '북' : v1.split('/')[1] == 20 ? '동' : v1.split('/')[1] == 30 ? '남' : v1.split('/')[1] == 40 ? '서' : v1.split('/')[1] == 50 ? '북동' : v1.split('/')[1] == 60 ? '남동' : v1.split('/')[1] == 70 ? '남서' : '북서'
                        let day = v1.split('/')[0].split('T')[0].split('-')[1] + '.' + v1.split('/')[0].split('T')[0].split('-')[2]
                        let time = v1.split('/')[0].split('T')[1]
                        let arr = [document.lcCon.LCs[stats.lcno].lcname, dir, `${day} ${time}`, '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'];
                        
                        _res[v1].forEach((v2, i2) => {
                            if(v2.flownum != 4) {
                                for(let k=0; k<=7; k++){
                                    arr[((v2.flownum-1)*8) + 3 + k] = v2[`vol0${k+1}`] ? v2[`vol0${k+1}`] : '-'
                                    sum[((v2.flownum-1)*8) + 3 + k] += v2[`vol0${k+1}`]
                                }
                            }
                        })
    
                        _data.push(arr);
                    })
                    
                    // 나머지 ROW 채우기
                    if(Object.keys(_res).length < len){
                        for(let i=0; i<len-(Object.keys(_res).length); i++){
                            _data.push(['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'])
                        }
                    }
    
                    _data.push(sum);
                }
            } 
    
            return _data
        }
    
        // 옵션 생성
        function makeOption(res){
            let optionM;
            let len = 40;
    
            optionM = [
                {row: 0, col: 0, rowspan: 2, colspan: 1},
                {row: 0, col: 1, rowspan: 2, colspan: 1},
                {row: 0, col: 2, rowspan: 2, colspan: 1},
                {row: 0, col: 3, rowspan: 1, colspan: 8},
                {row: 0, col: 11, rowspan: 1, colspan: 8},
                {row: 0, col: 19, rowspan: 1, colspan: 8}
            ]
    
            if(res){ // 검색
                let _res = res.reduce(function(result, current) {
                    let key = `${current.cre_date}/${current.dir}`
                    result[key] = result[key] || [];
                    result[key].push(current);
                    return result;
                }, {});
    
                if(Object.keys(_res).length < len){
                    optionM.push({row: len+2, col: 0, rowspan: 1, colspan: 3})
                } else {
                    optionM.push({row: Object.keys(_res).length+2, col: 0, rowspan: 1, colspan: 3})
                }
            } else { // 초기화
                optionM.push({row: len+2, col: 0, rowspan: 1, colspan: 3})
            }
            
            return {mergeCells: optionM}
        }
    
        // 조회
        function searchData(e){
            let cnt = 1
            let isSuccess = new Array(cnt).fill(0);
            let isData = new Array(cnt).fill(0);
    
            const starttime = consts.date1.replace('T', ' ');
            const endtime = consts.date2.replace('T', ' ');
    
            let param = [null, '5m', '15m', 'hour', 'day', 'mon']
    
            ajax(`/tr_org_${param[selected]}?starttime=${starttime}&endtime=${endtime}&lcno=${stats.lcno}`).then((res)=>{
                if(res.hasOwnProperty('success')){
                    initData();
                } else {
                    table1.loadData(makeData(res));
                    table1.updateSettings(makeOption(res));
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
        function initData(){
            table1.loadData(makeData(null));
            table1.updateSettings(makeOption(null));
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
                filename: `${stats.lcno}번_교차로_교통량데이터(${startYear}.${startHour}시${startMin}분_${endYear}.${endHour}시${endMin}분)`,
                mimeType: 'text/csv',
                rowDelimiter: '\r\n',
                rowHeaders: false
            });
        }
    
        // 초기 조회
        onMount(()=>{
            initData();
        })
    </script>
    
    <svelte:options accessors/>
    <div id="main" class:modal={winMode == false} class:win={winMode == true}>
        <div class="EntireDiv">
            <div class="tabOption">
                <div>
                    <div>
                        <Searcher bind:value={stats.lcno} width="200px" onChoose={(no)=>{stats = no}}/>
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
                    <div>
                        <div class="sel">
                            <select bind:value={selected} class="static" >
                                {#each consts.option as i}
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
                </div>
                <div>
                    <Button height={"30px"} icon='print' on:click={exportExcel(table1)} width="100">엑셀출력</Button>
                </div>
            </div>
            <div class="tabContent">
                <div class="origin">
                    <Table 
                        bind:wrapper={elems.table1}
                        bind:table={table1}
                        data={data1}
                        width={'100%'}
                        height={'485px'}
                        option={option1}
                    ></Table>
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
            /* 높이(가변) */
            max-height: 720px;
        }
    
            /* 창모드 (넓이 고정) */
            #main.win {
                width: 1260px;
                height: 561px;
            }
    
            /* 싱글모드 (창모드 넓이 ~ MAX) */
            #main.modal {
                overflow: auto;
            }
    
        /* 카드 */
        .EntireDiv {
            height: calc(100% - 32px);
            display : grid;
            grid-template-columns: auto;
            grid-template-rows: auto 1fr;
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
                    grid-template-columns: 200px max-content 10px max-content 80px 80px;
                    grid-column-gap: 10px;
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
                .EntireDiv .tabContent .origin :global(.handsontable tr:nth-child(1) td),
                .EntireDiv .tabContent .origin :global(.handsontable tr:nth-child(2) td) {
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
    </style>