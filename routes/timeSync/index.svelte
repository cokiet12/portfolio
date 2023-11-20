<!-- <script>
    // @ts-nocheck
        import { onMount } from 'svelte';
        import { WASgap, settings } from '$lib/store.mjs'
        import Legend from '$lib/nested/legend.svelte'
        import Table from '$lib/nested/table.svelte'
        import Button from '$lib/nested/button.svelte'
        import { ajax, getWAStime, NsetLog, cbUrl_success, cbUrl_fail } from '$lib/js/functions.mjs'
        import { userId } from '$lib/store.mjs'
        import _ from 'lodash'
    
        export let winMode = false;
    
        const consts = {
            option : [
                {id: 0, text: '0초'},
                {id: 1, text: '1초'},
                {id: 2, text: '2초'},
                {id: 3, text: '3초'},
                {id: 4, text: '4초'},
                {id: 5, text: '5초'},
                {id: 6, text: '6초'},
                {id: 7, text: '7초'},
                {id: 8, text: '8초'},
                {id: 9, text: '9초'},
                {id: 10, text: '10초'}
            ]
        }
        let stats = {
        }
        let elems = {
            table1 : null
        }
        // Selected
        let selected = 3;
    
        // Table
        let table1
        let table2
    
        // Initial Datas
        let iData;
    
        // Datas
        let data1 = []
        let data2 = []

        // LC
        let lc = document.lcCon.LCs
        let live = document.lcCon.liveLCs
    
        // Renderer
        // TD
        const emp = function(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            let div = document.createElement('div');
            let cdiv = document.createElement('div');
            cdiv.classList.add('cdiv')
            cdiv.classList.add('emp')
            let ndiv = document.createElement('div');
            ndiv.classList.add('ndiv')

            div.append(cdiv);
            div.append(ndiv);

            td.appendChild(div);
        };
    
        const com = function(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            let div = document.createElement('div');
            div.classList.add(`${lc[Object.keys(lc)[(row * 50) + col]].lcno}`)
            div.setAttribute('title', `${lc[Object.keys(lc)[(row * 50) + col]].lcname}`)
            let cdiv = document.createElement('div');
            cdiv.classList.add('cdiv')
            cdiv.classList.add('com')
            let ndiv = document.createElement('div');
            ndiv.classList.add('ndiv')
            ndiv.innerHTML = lc[Object.keys(lc)[(row * 50) + col]].lcno

            div.append(cdiv);
            div.append(ndiv);

            td.appendChild(div);
        };
    
        // Option
        let option1 = {
            colWidths: 23,
            rowHeights: 39,
            renderer: 'html',
            renderAllRows: true,
            dropdownMenu: true,
		    filters: true
        }
        let option2 = {
            colWidths: [40, 70, 100, 100, 40, 30, 30],
            rowHeights: 23,
            renderer: 'html',
            renderAllRows: true
        }
        
        // DropDown Event
        function DropDownEvent(){
            makeBoard(iData);
        }

        // TIME TO STRING
        function ttos(time){
            const year = time.getFullYear(); 
            const months = [ '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월' ]; 
            const monthName = months[time.getMonth()]; 
            const date = time.getDate() + '일';

            let hours = ('0' + time.getHours()).slice(-2); 
            let minutes = ('0' + time.getMinutes()).slice(-2);
            let seconds = ('0' + time.getSeconds()).slice(-2); 

            let result = `${year}년 ${monthName} ${date} ${hours}시 ${minutes}분 ${seconds}초`

            return result;
        }

        // 전체 선택
        function checkAll(){
            let res = table2.getSourceData()
            res.forEach((v, i) => {
                table2.setDataAtCell(i, 6, true);
            })
        }

        // 전체 해제
        function unCheckAll(){
            let res = table2.getSourceData()
            res.forEach((v, i) => {
                table2.setDataAtCell(i, 6, false);
            })
        }
    
        // 데이터 생성
        function makeData(sort){
            let _data;
            if(sort == 'board'){
                _data = []
                for(let i=0; i<20; i++){
                    let arr = [];
                    for(let j=0; j<50; j++){
                        arr.push('');
                    }
                    _data.push(arr)
                }
            } else {
                _data = [
                    ['', '', '', '', '', '', '']
                ]
            }
    
            return _data
        }
    
        // 기본 옵션 생성
        function makeOption(sort){
            let optionC
            let result
    
            if(sort == 'board'){
                let length = Object.keys(lc).length;

                optionC = function(row, col, prop) {
                    let cellProperties = {};

                    if((row * 50) + col < length){
                        cellProperties.renderer = com
                    } else {
                        cellProperties.renderer = emp
                    }
                    cellProperties.readOnly = true
                    return cellProperties
                }
                result = {cells: optionC}
            } else {
                optionC = function(row, col, prop) {
                    let cellProperties = {};
                    if(col == 6){
                        cellProperties.type = 'checkbox'
                    } else {
                        cellProperties.readOnly = true
                    }   
                    return cellProperties
                }
                result = {cells: optionC}
            }
            return result
        }

        // 초기화
        function initData(){
            table1.loadData(makeData('board'));
            table1.updateSettings(makeOption('board'))
            table2.loadData(makeData('list'));
            table2.updateSettings(makeOption('list'))
        }

        // 업로드 데이터 표출
        function makeBoard(res){
            res.forEach((v, i) => {
                let classList = document.getElementsByClassName(v.lcno)[0].childNodes[0].classList
                if(v.gap > selected){
                    classList.replace(classList[1], 'err');
                    v.iserr = true
                } else {
                    classList.replace(classList[1], 'ok');
                    v.iserr = false
                }
            })
        }

        // 업로드 데이터 리스트
        function makeList(sort){
            let _data = []
            if(sort == 'err'){
                iData.forEach((v, i) => {
                    if(v.iserr){
                        _data.push([v.lcno, v.lcname, ttos(v.server), ttos(v.local), v.gap + '초', '에러', false])
                    }
                })
            } else {
                iData.forEach((v, i) => {
                    _data.push([v.lcno, v.lcname, ttos(v.server), ttos(v.local), v.gap + '초', v.iserr ? '에러' : '정상', false])
                })
            }
            table2.loadData(_data);
        }
    
        // 업로드
        function uploadData(){
            let lcno = [];
            let data = [];
            let list = [];

            Object.keys(lc).forEach((v, i) => {
                if(lc[v].main_lcno == 0 && !live[v].connErr){
                    list.push({LCNO:Number(v),_listName:lc[v].lcname})
                }
            })

            if(list.length){
                document.callTcp('/clock_up', list, (res)=>{
                    let _res = res.filter(v => v.ok == 1 && !lcno.includes(v.key));
                    _res.forEach((v) => {
                        let dt = v.data.data
                        let send = new Date(v.sendTime)
                        let local = new Date(2000 + Number(dt['년']), dt['월']-1, dt['일'], dt['시'], dt['분'], dt['초']);

                        let gap = Math.abs(local.getTime() - send.getTime())/1000;
                        let temp = {
                            lcno : v.key, 
                            lcname : lc[v.key].lcname, 
                            server : send, 
                            local : local, 
                            gap : parseInt(gap)
                        };

                        lcno.push(v.key);
                        data.push(temp);
                    })
                    if(res.done){
                        iData = data;
                        makeBoard(data);
                    } 
                })
            } else {
                document.createMsg("업로드 가능한 제어기가 없습니다.")
            }
        }

        // 다운로드
        function downloadData(){
            let syncLc = [];

            let res = table2.getSourceData();
            let _res = res.filter(v => v[6]);
            let arr = new Array();
            let time = new Date(Number(new Date()) + $WASgap)

            _res.forEach((v, i) => {
                let json = new Object();
                json.LCNO = Number(v[0])
                json.srvyear = time.getFullYear() - 2000
                json.srvmonth = time.getMonth() + 1
                json.srvday = time.getDate()
                json.srvhour = time.getHours()
                json.srvminute = time.getMinutes()
                json.srvsecond = time.getSeconds()
                json.srvdate = time.getDay();
                arr.push(json);
            })

            if(arr.length){
                document.callTcp('/clock_dw', arr, (res1)=>{
                    console.log(res1)
                    let _res = res1.filter(value => value.ok == 1 && !syncLc.includes(value.key));
                    _res.forEach((v) => {
                        syncLc.push(v.key);
                    })
                    if(res1.done){ 
                        fetch(`${settings.WASserver}/timeSyncUp`).then(async (res2)=>{
                            let dt = await res2.json()
                            let year = (dt.data.year + 2000)
                            let mon = dt.data.mon < 10 ? '0' + dt.data.mon : dt.data.mon
                            let day = dt.data.day < 10 ? '0' + dt.data.day : dt.data.day
                            let hour = dt.data.hour < 10 ? '0' + dt.data.hour : dt.data.hour
                            let min = dt.data.min < 10 ? '0' + dt.data.min : dt.data.min
                            let sec = dt.data.sec < 10 ? '0' + dt.data.sec : dt.data.sec

                            let time = year + '.' + mon + '.' + day + ' ' + hour + ':' + min + ':' + sec

                            document.querySelectorAll('.lD2S')[0].innerHTML = time
                            document.querySelectorAll('.lD2S')[1].innerText = synced
                        })
                    } 
                })
            } else {
                document.createMsg('선택된 데이터가 없습니다.')
            }
        }

        // 서버 - 클라이언트 시간차
        getWAStime();
    
        // 초기 조회
        onMount(()=>{
            initData();
            uploadData();
        })
    </script>
        
    <svelte:options accessors/>
    <div id="main" class:modal={winMode == false} class:win={winMode == true}>
        <div class="EntireDiv">
            <div class="monitor">
                <Legend legend="모니터링" color="#DADDE1">
                    <div>
                        <Table 
                            bind:wrapper={elems.table1}
                            bind:table={table1}
                            data={data1}
                            width={'100%'}
                            height={'274px'}
                            option={option1}
                        ></Table>
                    </div>
                </Legend>
            </div>
            <div class="table">
                <Legend legend="리스트" color="#DADDE1">
                    <div>
                        <Table 
                            bind:wrapper={elems.table2}
                            bind:table={table2}
                            data={data2}
                            colheader={['번호','교차로명','서버시간','제어기시간','시간차','상태','선택']}
                            width={'100%'}
                            height={'274px'}
                            option={option2}
                        ></Table>
                    </div>
                </Legend>
            </div>
            <div class="button">
                <div>
                    <div class="sel">
                        <select bind:value={selected} on:change={DropDownEvent} class="static">
                            {#each consts.option as i}
                                <option value={i.id}>
                                    {i.text}
                                </option>
                            {/each}
                        </select>
                    </div>
                    <Button icon='search' on:click={uploadData}>업로드</Button>
                    <Button icon='search' on:click={() => makeList('all')}>전체조회</Button>
                    <Button icon='search' on:click={() => makeList('err')}>오류조회</Button>
                    <Button icon='search' on:click={checkAll}>전체선택</Button>
                    <Button icon='search' on:click={unCheckAll}>전체해제</Button>
                </div>
                <div>
                    <Button colored={true} icon='sync' on:click={downloadData}>동기화</Button>
                </div>
            </div>
        </div>
    </div>
    
    <style>
        /* 메인 */
        #main {
            font-size: 1.3rem;
            background-color: #f9fafb;
            padding: 15px;
            max-height: 1400px;
        }
    
            /* 창모드 (넓이 고정) */
            #main.win {
                width: 1250px;
                max-height: 800px;
            }
    
            /* 분할,전체모드 (창모드 넓이 ~ MAX) */
    
            #main.modal {
                overflow: auto;
            }
    
        /* 카드 */   
        .EntireDiv {
            box-shadow: 0px 0px 10px #0000000D;
            border: 1px solid #DBE2E6;
            border-radius: 6px;
            background-color: #fff;
            display : grid;
            grid-template-rows: auto;
            grid-row-gap: 10px;
            padding: 5px 15px 15px 15px;
        }
    
            /* 모니터 */
            #main .monitor {
                display: grid;
                grid-template-columns: 100%;
            }
    
                .monitor :global(fieldset) {
                    padding: 0;
                    height: 274px; 
                }
    
                    .monitor :global(fieldset > div) {
                        padding: 0;
                        height: 274px; 
                    }
    
            /* 테이블 */
            #main .table {
                display: grid;
                grid-template-columns: 100%;
            }
    
                .table :global(fieldset) {
                    padding: 0;
                    height: 274px; 
                }
    
                    .table :global(fieldset > div) {
                        padding: 0;
                        height: 274px; 
                    }
    
            /* 버튼 (크기 고정) */
            #main .button {
                display: grid;
                grid-template-columns: 1fr 1fr;
                align-items: end;
                overflow: auto;
            }
    
                #main .button > div:nth-child(1) {
                    display: grid;
                    grid-template-columns: 80px 80px 90px 90px 90px 90px;
                    grid-column-gap: 5px;
                }
    
                #main .button > div:nth-child(2) {
                    display: grid;
                    grid-template-columns: 100px;
                    justify-content: end;
                }
    
        /* Handsontable */
        /* overflow시 스크롤 */
        #main :global(.tableWrapper > .ht_master > .wtHolder) {
            overflow-x: hidden;
            overflow-y: auto;
        }
    
        #main .monitor :global(.handsontable td) {
            padding: 0;
        }
    
            #main .monitor :global(.handsontable td .cdiv) {
                height: 23px;
                border-radius: 100%;
            }
                #main .monitor :global(.handsontable td .cdiv.emp) {
                    background-color: #FFF;
                }
    
                #main .monitor :global(.handsontable td .cdiv.com) {
                    background-color: #999;
                }
    
                #main .monitor :global(.handsontable td .cdiv.ok) {
                    background-color: #57b557;
                }
    
                #main .monitor :global(.handsontable td .cdiv.err) {
                    background-color: #fd5a3f;
                }
    
            #main .monitor :global(.handsontable td .ndiv) {
                height: 13px;
                font-size: 1.2rem;
                border: 1px solid #ddd;
            }
    
        /* DropDown */
        .sel {
            position: relative;
            overflow: hidden;
    
            height: 30px;
            font-size: 1.3rem;
            border-radius: 4px;
            border: 1px solid #DADDE1;
            background-color: white;
        }
    
            .sel > select {
                width: 100%;
                height: calc(100% - 1px);
                padding: 0 5px;
                border: none;
                margin: 0;
                color: #0584FE;
                font-size: 1.3rem;
            }
    </style> -->
