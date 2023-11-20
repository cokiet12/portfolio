<script>
    // @ts-nocheck
    import { onMount } from 'svelte';
    import Table from '$lib/nested/table.svelte'
    import Searcher from '$lib/nested/searcher.svelte'
    import Button from '$lib/nested/button.svelte';
    import { ajax } from '$lib/js/functions.mjs'
    import _ from 'lodash'
    import ExcelJS from 'exceljs';
	import { saveAs } from 'file-saver';

    // 창모드 / 싱글, 듀얼모드
    export let winMode = false;

    const consts = {
        option : [
            {id: 1, text: '5분'},
            {id: 2, text: '15분'},
            {id: 4, text: '1시간'},
            {id: 5, text: '1일'},
            {id: 7, text: '한달'}
        ],
        date1 : null,
        date2 : null
    }

    export let stats = {
        lcno : 241,
        sano : 1,
        year : 2010
    }

    $:searchEvent(stats)

    let elems = {
        table1 : null,
        table2 : null
    }
    // Table
    let table1;
    let table2;

    // Selected
    let selected = 1;

    // Datas
    let data1 = []
    let data2 = []

    // Len
    let len = 5;

    // Cells
    let optionC = function(row, col, prop) {
        let cellProperties = {};
        cellProperties.readOnly = true
        return cellProperties
    };

    // Option
    let option1 = {
        colWidths: [70,40,45,30,40,45,30,40,45,30,40,45,30],
        rowHeights: 23,
        renderer: 'html',
        renderAllRows: true,
        fixedRowsTop: 2,
        cells: optionC
    }

    let option2 = {
        colWidths: [70,40,45,30,40,45,30,40,45,30,40,45,30],
        rowHeights: 23,
        renderer: 'html',
        renderAllRows: true,
        fixedRowsTop: 2,
        cells: optionC
    }

    // 시간 초기화
    let today = new Date();
    let year = today.getFullYear();
    let month1 = ('0' + (today.getMonth())).slice(-2);
    let month2 = ('0' + (today.getMonth()+1)).slice(-2);
    let day = ('0' + today.getDate()).slice(-2);

    let firstInput = year + "-" + month2 + "-" + day
    let secondInput = year + "-" + month1 + "-" + day
    consts.date1 = secondInput;
    consts.date2 = firstInput;

    // Search Event
    function searchEvent(stat){
        if(table1){
            initData();
        }
    }

    // 데이터 생성
    function makeData(res){
        let _data;

        _data = [
            ['첨두시간', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['첨두시간', '첨두교통량', '1시간교통량', 'PHF', 
            '첨두교통량', '1시간교통량', 'PHF', 
            '첨두교통량', '1시간교통량', 'PHF',
            '첨두교통량', '1시간교통량', 'PHF']
        ]

        for(let i=0; i<len; i++){
            _data.push(['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'])
        }

        if(res) {
            let length;

            if(typeof(res) == 'object'){
                length = Object.keys(res).length;
            } else {
                length = res.length;
            }

            if(length){
                _data = [
                    ['첨두시간', '', '', '', '', '', '', '', '', '', '', '', ''],
                    ['첨두시간', '첨두교통량', '1시간교통량', 'PHF', 
                    '첨두교통량', '1시간교통량', 'PHF', 
                    '첨두교통량', '1시간교통량', 'PHF',
                    '첨두교통량', '1시간교통량', 'PHF']
                ]

                // 방향 탐색
                let dir = Object.keys(res.reduce(function(result, current) {
                    result[current.dir] = result[current.dir] || [];
                    result[current.dir].push(current);
                    return result;
                }, {}));

                dir.forEach((v, i) => {
                    let dirname = v == 10 ? '북' : v == 20 ? '동' : v == 30 ? '남' : v == 40 ? '서' : v == 50 ? '북동' : v == 60 ? '남동' : v == 70 ? '남서' : '북서'
                    _data[0][i*3+1] = dirname
                    _data[0][i*3+2] = dirname
                    _data[0][i*3+3] = dirname
                })

                // CRE_DATE를 기준으로 GROUP BY
                let _res = res.reduce(function(result, current) {
                    result[current.time] = result[current.time] || [];
                    result[current.time].push(current);
                    return result;
                }, {});

                Object.keys(_res).forEach((v1, i1) => {
                    if(i1 < len){
                        let arr = [v1, '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'];
                
                        dir.forEach((v2, i2) => {
                            let obj = _res[v1].find(value => value.dir == v2)

                            let vcnt = obj ? obj.vcnt : 0
                            let vacnt = obj ? obj.vacnt : 0
                            let phf = obj ? obj.phf : 0

                            arr[(i2*3)+1] = vcnt;
                            arr[(i2*3)+2] = vacnt;
                            arr[(i2*3)+3] = phf;
                        })

                        _data.push(arr);
                    }
                })

                if(Object.keys(_res).length < len){
                    for(let i=0; i<len-Object.keys(_res).length; i++){
                        _data.push(['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'])
                    }
                }
            }
        } 

        return _data
    }

    // 옵션 생성
    function makeOption(res){
        let optionM;

        optionM = [
            {row: 0, col: 0, rowspan: 2, colspan: 1},
            {row: 0, col: 1, rowspan: 1, colspan: 3},
            {row: 0, col: 4, rowspan: 1, colspan: 3},
            {row: 0, col: 7, rowspan: 1, colspan: 3},
            {row: 0, col: 10, rowspan: 1, colspan: 3}
        ]

        return {mergeCells: optionM}
    }

    // 조회
    function searchData(e){
        let cnt = 2
        let isSuccess = new Array(cnt).fill(0);
        let isData = new Array(cnt).fill(0);

        const starttime = consts.date1;
        const endtime = consts.date2;

        let param = [null, '5m', '15m', 'hour', 'day', 'mon']

        ajax(`/ntcs_s_phf?starttime=${starttime}&endtime=${endtime}&lcno=${stats.lcno}`).then((res)=>{
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

        ajax(`/ntcs_s_phf_week?starttime=${starttime}&endtime=${endtime}&lcno=${stats.lcno}`).then((res)=>{
            if(res.hasOwnProperty('success')){
                initData();
            } else {
                table2.loadData(makeData(res));
                table2.updateSettings(makeOption(res));
                if(!(_.isEmpty(res))){
                    isData[1] = 1;
                }
                isSuccess[1] = 1;
            }
            if(e){
                if(!isSuccess[1] || !isData[1]){
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
        table2.loadData(makeData(null));
        table2.updateSettings(makeOption(null));
    }

    async function ExcelSave() {
        const workbook = new ExcelJS.Workbook();
        const nms = ['평일', '주말'];

        function putData(tab, no) {
            let sheet = workbook.addWorksheet(nms[no]);
            let tabData = tab.getData();
            let dir = tabData[0]; 
            let header = tabData[1];

            tabData.shift();
            tabData.shift();

            let body = tabData;

            console.log("header", header);
            console.log("body", body);

            let columns = new Array();
            header.forEach((v, i) => {
                let dirname
                if(i == 0){
                    dirname = dir[0]
                } else if(i%3 == 1){
                    dirname = '첨두교통량_' + dir[i]
                } else if(i%3 == 2){
                    dirname = '1시간교통량_' + dir[i]
                } else {
                    dirname = 'PHF_' + dir[i]
                }
                columns.push({ header: dirname, key: dirname });
            });
            sheet.columns = columns;

            body.forEach((v, i) => {
                let row = new Object();
                header.forEach((b, o) => {
                    let dirname
                    if(o == 0){
                        dirname = dir[0]
                    } else if(o%3 == 1){
                        dirname = '첨두교통량_' + dir[o]
                    } else if(o%3 == 2){
                        dirname = '1시간교통량_' + dir[o]
                    } else {
                        dirname = 'PHF_' + dir[o]
                    }
                    row[dirname] = v[o];
                });
                sheet.addRow(row);
            });
        }

        putData(table1, 0);
        putData(table2, 1);

        let xlsxdata = await workbook.xlsx.writeBuffer();
        const starttime = consts.date1.replace(/-/gi, '');
        const endtime = consts.date2.replace(/-/gi, '');
        const blob = new Blob([xlsxdata], { type: this.blobType });
        saveAs(blob, `${stats.lcno}번_교차로_첨두시간(${starttime}_${endtime}).xlsx`);
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
                    <input type='date' bind:value={consts.date1}/>
                </div>
                <div>
                    ~
                </div>
                <div>
                    <input type='date' bind:value={consts.date2}/>
                </div>
                <div>
                    <Button height={"30px"} icon='search' colored={true} on:click={searchData} width="80">조회</Button>
                </div>
            </div>
            <div>
                <Button height={"30px"} icon='print' on:click={ExcelSave} width="100">엑셀출력</Button>
            </div>
        </div>
        <div class="tabContent">
            <div>
                평일
                <div>
                    <Table 
                        bind:wrapper={elems.table1}
                        bind:table={table1}
                        data={data1}
                        width={'100%'}
                        height={'162px'}
                        option={option1}
                    ></Table>
                </div>
            </div>
            <div>
                주말
                <div>
                    <Table 
                        bind:wrapper={elems.table2}
                        bind:table={table2}
                        data={data2}
                        width={'100%'}
                        height={'162px'}
                        option={option2}
                    ></Table>
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
        /* 높이(가변) */
        max-height: 720px;
    }

        /* 창모드 (넓이 고정) */
        #main.win {
            width: 900px;
            height: 451px;
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
                grid-template-columns: 200px max-content 10px max-content 80px;
                grid-column-gap: 10px;
            }

        .EntireDiv .tabContent {
            display : grid;
            grid-template-rows: min-content auto;
            grid-row-gap: 10px;
        }

            .EntireDiv .tabContent > div > div {
                margin-top: 5px;
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
            .EntireDiv .tabContent :global(.handsontable tr:nth-child(1) td),
            .EntireDiv .tabContent :global(.handsontable tr:nth-child(2) td) {
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

    input[type="date"] {
        height: calc(100% - 2px);
        border: 1px solid #DADDE1;
        border-radius: 4px;
        padding: 0 2px;
        font-size: 1.3rem;
        color: #0584FE;
    }

    /* scroll */
    #main :global(::-webkit-scrollbar) {width: 7px;height: 7px; background-color: rgba(0, 0, 0, 0.7);}
    #main :global(::-webkit-scrollbar-thumb) {background-color:rgba(126, 126, 126, 0.7); border-radius: 2px;}
</style>