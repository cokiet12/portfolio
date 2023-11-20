<script>
    // @ts-nocheck
        import { onMount } from 'svelte';
        import Table from '$lib/nested/table.svelte'
        import Button from '$lib/nested/button.svelte'
        import Searcher from '$lib/nested/searcher.svelte'
        import { ajax } from '$lib/js/functions.mjs'
        import _ from 'lodash'
    
        // 창모드 / 싱글, 듀얼모드
        export let winMode = false;
    
        const consts = {
        }
        let stats = {
            lcno : 241,
            sano : 1,
            year : 2010
        }
    
        $:searchEvent(stats)
    
        let elems = {
            table1 : null 
        }
        // Table
        let table1;
    
        // Initial Datas
        let iData1 = [];
    
        // Datas
        let data1 = [];
    
        // Cells
        let optionC = function(row, col, prop) {
            let cellProperties = {};
            if(col == 0 || col == 1 || col == 11){
                cellProperties.readOnly = true
            }
            if(col == 3){
                cellProperties.editor = 'select'
                cellProperties.selectOptions = ['북', '동', '남', '서', '북동', '남동', '남서', '북서']
            }
            if(col == 7){
                cellProperties.editor = 'select'
                cellProperties.selectOptions = ['정상', '오프라인']
            }
            return cellProperties
        };
    
        // Option
        let option1 = {
            colWidths: [30, 30, 30, 30, 60, 30, 30, 30, 30, 30, 60],
            rowHeights: 23,
            renderer: 'html',
            renderAllRows: true,
            nestedHeaders : [
                [{label: 'IDX', colspan: 1},
                {label: '교차로 번호', colspan: 1},
                {label: '카메라 ID', colspan: 1},
                {label: '설치방향', colspan: 1},
                {label: 'IP주소', colspan: 1},
                {label: 'PORT번호', colspan: 1},
                {label: '해상도', colspan: 1},
                {label: '상태', colspan: 1},
                {label: '인증키', colspan: 1},
                {label: '기타정보', colspan: 1},
                {label: '방향이름', colspan: 1},
                {label: '수정시간', colspan: 1}]
            ],
            cells: optionC,
            afterSelectionEnd: function(x1, y1, x2, y2){
                if( (x1 <= x2 && y1 < y2) || (x1 < x2 && y1 <= y2) || (x1 == x2 && y1 == y2)) {
                    row1 = x1;
                    if(x1 == 0)
                        row2 = parseInt(x2 + 1);
                    else
                        row2 = x2;
                }
                else if( (x1 >= x2 && y1 > y2) || (x1 > x2 && y1 >= y2)) {
                    row1 = x2;
                    if(x2 == 0)
                        row2 = parseInt(x1 + 1);
                    else
                        row2 = x1;
                }
                else if(x1 < x2 && y1 > y2) {
                    row1 = x1;
                    row2 = x2;
                }
                else if(x1 > x2 && y1 < y2) {
                    row1 = x2;
                    row2 = x1;
                }
            },
            manualColumnResize: false
        }
    
        // Add
        let addIdx = new Array();
        
        // Del
        let delIdx = new Array();
    
        // Row
        let row1 = null;
        let row2 = null;
    
        // Search Event
        function searchEvent(stat){
            if(table1){
                searchData();
            }
        }
    
        // 데이터 변경(number to string)
        function ntos(arr){
            let res = JSON.parse(JSON.stringify(arr));
            
            res.forEach((v, i) => {
                // idx
                v.idx = i+1;
    
                // 방향(NUMBER)
                v.dir = v.dir == 10 ? '북' : v.dir == 20 ? '동' : v.dir == 30 ? '남' : v.dir == 40 ? '서' : v.dir == 50 ? '북동' : v.dir == 60 ? '남동' : v.dir == 70 ? '북서' : '남서'
                
                // 상태코드(NUMBER)
                v.status = v.status == 0 ? '오프라인' : '정상'
    
                // 마지막 수정 시간
                v.last_update = (v.last_update) ? v.last_update.replace('T', ' ') : ''
            })
    
            return res;
        }
    
        // 데이터 변경(string to number)
        function ston(arr){
            let res = JSON.parse(JSON.stringify(arr));
            
            res.forEach((v, i) => {
                // 방향(NUMBER)
                v.dir = v.dir == '북' ? 10 : v.dir == '동' ? 20 : v.dir == '남' ? 30 : v.dir == '서' ? 40 : v.dir == '북동' ? 50 : v.dir == '남동' ? 60 : v.dir == '북서' ? 70 : 80
    
                // 포트(NUMBER)
                v.port = isNaN(v.port) ? 0 : Number(v.port)
    
                // 해상도(NUMBER)
                v.resolution = isNaN(v.resolution) ? 0 : Number(v.resolution)
    
                // 상태코드(NUMBER) 
                v.status = v.status == '오프라인' ? 0 : 1
    
                // camera
                v.camera_id = v.camera_id == null ? "" : v.camera_id
    
                // ip
                v.ip = v.ip == null ? "" : v.ip
    
                // auth_key
                v.auth_key = v.auth_key == null ? "" : v.auth_key
    
                // info
                v.info = v.info == null ? "" : v.info

                // dir_name
                v.dir_name = v.dir_name == null ? "" : v.dir_name
    
                // 마지막 수정 시간
                let today = new Date();
                let year = today.getFullYear();
                let month = ('0' + (today.getMonth()+1)).slice(-2);
                let day = ('0' + today.getDate()).slice(-2);
                let hours = ('0' + today.getHours()).slice(-2);
                let minutes = ('0' + today.getMinutes()).slice(-2);
                let seconds = ('0' + today.getSeconds()).slice(-2);
    
                v.last_update = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
            })
    
            return res;
        }
    
        // 데이터 생성
        function makeData(res){
            let _data = [];
            
            if(res){
                let length;
                if(typeof(res) == 'object'){
                    length = Object.keys(res).length;
                } else {
                    length = res.length;
                }
    
                if(length){ 
                    iData1 = res;
                    let _res = ntos(res);
                    _res.forEach((v, i) => {
                        _data.push([v.idx, v.lcno, v.camera_id, v.dir, v.ip, v.port, v.resolution, v.status, v.auth_key, v.info, v.dir_name, v.last_update]);
                    })
                } else {
                    _data = [['데이터 없음', '', '', '', '', '', '', '', '', '', '', '']]
                    iData1 = []
                }
            } else {
                _data = [['데이터 없음', '', '', '', '', '', '', '', '', '', '', '']]
                iData1 = []
            }
    
            return _data
        }
    
        // 조회
        function searchData(e){
            let cnt = 1
            let isSuccess = new Array(cnt).fill(0);
            let isData = new Array(cnt).fill(0);
    
            ajax(`/ntcs_m_camera_lc?lcno=${stats.lcno}`).then((res)=>{
                if(res.hasOwnProperty('success')){
                    initData();
                } else {
                    table1.loadData(makeData(res));
                    if(!(_.isEmpty(res))){
                        isData[0] = 1;
                    } else {
                        table1.updateSettings({mergeCells : [{row: 0, col: 0, rowspan: 1, colspan: 11}]})
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
    
        // 추가
        function addRow(){
            // 테이블 ROW 개수
            let row = table1.countRows();
    
            console.log("row : ", row)
    
            // 테이블 IDX값들
            // [1, 2, 3 ...]
            let indexArray = table1.getDataAtCol(0);
    
            // for(let i = 0; i < indexArray.length; i++) {
            //     if(indexArray[i] >= 9999)  {
            //         indexArray.splice(i, 1);
            //         i--;
            //     }
            // }
    
            console.log("indexArray : ", indexArray)
    
            let autoIncrease
            let curIdx
    
            if(indexArray.length == 0){
                autoIncrease = 0
            } else {
                autoIncrease = indexArray[indexArray.length-1];
            }
    
            console.log("autoIncrease : ", autoIncrease)
    
            if(typeof(autoIncrease) == "string"){
                // 데이터 입력
                table1.setDataAtCell(row, 0, 1);
                table1.setDataAtCell(row, 1, stats.lcno);
                table1.setDataAtCell(row, 2, '');
                table1.setDataAtCell(row, 3, '북');
                table1.setDataAtCell(row, 4, '');
                table1.setDataAtCell(row, 5, '');
                table1.setDataAtCell(row, 6, '');
                table1.setDataAtCell(row, 7, '');
                table1.setDataAtCell(row, 8, '');
                table1.setDataAtCell(row, 9, '');
                table1.setDataAtCell(row, 10, '');
                table1.setDataAtCell(row, 11, '');
    
                table1.alter('remove_row', 0);
    
                curIdx = 1;
            } else {
                table1.alter('insert_row', row, 1);
    
                // 데이터 입력
                table1.setDataAtCell(row, 0, (autoIncrease+1));
                table1.setDataAtCell(row, 1, stats.lcno);
                table1.setDataAtCell(row, 2, '');
                table1.setDataAtCell(row, 3, '북');
                table1.setDataAtCell(row, 4, '');
                table1.setDataAtCell(row, 5, '');
                table1.setDataAtCell(row, 6, '');
                table1.setDataAtCell(row, 7, '');
                table1.setDataAtCell(row, 8, '');
                table1.setDataAtCell(row, 9, '');
                table1.setDataAtCell(row, 10, '');
                table1.setDataAtCell(row, 11, '');
    
                curIdx = autoIncrease+1;
            }
    
            console.log("curIdx : ", curIdx)
    
            // ROW FOCUS
            table1.selectCell(curIdx-1, 0);
    
            if(delIdx.includes(curIdx)){
                var search = delIdx.indexOf(curIdx);
                if(search!=-1){
                    delIdx.splice(search,1); // "A"를 찾아서 삭제한다.
                }
            } else {
                addIdx.push(curIdx);
            }
    
            console.log("addIdx : ", addIdx)
        }
    
        // 삭제
        function delRow(){
            if(row1 != null){
                let delIdNo = table1.getSourceDataAtCell(row1, 0)
                
                if(row1 == 0){
                    table1.setDataAtCell(row1, 0, '데이터 없음');
                    table1.updateSettings({mergeCells : [{row: 0, col: 0, rowspan: 1, colspan: 11}]})
                } else {
                    table1.alter('remove_row', row1);
                    table1.selectCell(row1-1, 0);
                }
    
                if(addIdx.includes(delIdNo)){
                    let search = addIdx.indexOf(delIdNo);
                    if(search!=-1){
                        addIdx.splice(search,1); // "A"를 찾아서 삭제한다.
                    }
                } else {
                    delIdx.push(delIdNo);
                }
            } else{
                alert('제거할 줄을 선택해주세요!');   
            }
        }
    
        // 저장
        function saveData(){
            let _res = table1.getSourceData();
            let _iData = ston(ntos(iData1));
            let arr = [];
    
            _res.forEach((v, i) => {
                let json = new Object();
                json.idx = v[0]
                json.lcno = v[1]
                json.camera_id = v[2] ? v[2] : ""
                json.dir = v[3]
                json.ip = v[4] ? v[4] : ""
                json.port = v[5]
                json.resolution = v[6]
                json.status = v[7]
                json.auth_key = v[8] ? v[8] : ""
                json.info = v[9] ? v[9] : ""
                json.dir_name = v[10] ? v[10] : ""
                json.last_update = v[11] ? v[11] : ""
                
                arr.push(json);
            })
    
            let _jsonArray = ston(arr);
    
            console.log(_jsonArray)
        
            let temp = _iData.filter(value => !(delIdx.includes(value.idx)))
            let _temp = _jsonArray.filter(value => !(addIdx.includes(value.idx)))
    
            // 추가 항목
            let addArray = _jsonArray.filter(value => addIdx.includes(value.idx)) 
    
            addArray.forEach((v, i) => {
                delete v.idx;
                v.datamodetype = 1;
            })
    
            // 삭제 항목
            let deleteArray = _iData.filter(value => delIdx.includes(value.idx))   
    
            deleteArray.forEach((v, i) => {
                delete v.idx;
                v.datamodetype = 3;
            })
    
            // 수정 항목
            let updateArray = new Array();
    
            for(let i=0; i<temp.length; i++){
                let cnt = 0;
                if(temp[i].lcno != _temp[i].lcno){
                    cnt++; 
                    console.log(temp[i].lcno + " VS " + _temp[i].lcno);
                    console.log("LCNO가 다릅니다.");
                }
                if(temp[i].camera_id != _temp[i].camera_id){
                    cnt++; 
                    console.log(temp[i].camera_id + " VS " + _temp[i].camera_id);
                    console.log("카메라ID 다릅니다.")
                } 
                if(temp[i].dir != _temp[i].dir){
                    cnt++; 
                    console.log(temp[i].dir + " VS " + _temp[i].dir);
                    console.log("DIR이 다릅니다.")
                } 
                if(temp[i].ip != _temp[i].ip){
                    cnt++; 
                    console.log(temp[i].ip + " VS " + _temp[i].ip);
                    console.log("IP가 다릅니다.")
                } 
                if(temp[i].port != _temp[i].port){
                    cnt++; 
                    console.log(temp[i].port + " VS " + _temp[i].port);
                    console.log("PORT가 다릅니다.")
                }
                if(temp[i].resolution != _temp[i].resolution){
                    cnt++; 
                    console.log(temp[i].resolution + " VS " + _temp[i].resolution);
                    console.log("RES가 다릅니다.")
                } 
                if(temp[i].status != _temp[i].status){
                    cnt++; 
                    console.log(temp[i].status + " VS " + _temp[i].status);
                    console.log("STAT이 다릅니다.")
                }
                if(temp[i].auth_key != _temp[i].auth_key){
                    cnt++; 
                    console.log(temp[i].auth_key + " VS " + _temp[i].auth_key);
                    console.log("AUTH가 다릅니다.")
                }
                if(temp[i].info != _temp[i].info){
                    cnt++; 
                    console.log(temp[i].info + " VS " + _temp[i].info);
                    console.log("INFO가 다릅니다.")
                }
                if(temp[i].dir_name != _temp[i].dir_name){
                    cnt++; 
                    console.log(temp[i].dir_name + " VS " + _temp[i].dir_name);
                    console.log("DIRNAME이 다릅니다.")
                }
    
                if(cnt){
                    delete _temp[i].idx;
                    _temp[i].datamodetype = 2;
                    updateArray.push(_temp[i])
                }
            }
    
            let resultArray = [...addArray, ...deleteArray, ... updateArray];
    
            console.log(resultArray);
    
            if(resultArray.length != 0){
                ajax('/ntcs_m_camera/UpdateManyCustom', 'PUT', resultArray).then((res)=>{
                    if(res.success){
                        addIdx = [];
                        delIdx = [];
                    }
                    document.isSuccess(res);
                });
            } else {
                alert("변경된 사항이 없습니다.")
            }
        }
    
        function initData(){
            table1.loadData(makeData(null));
        }
    
        // 초기 조회
        onMount(()=>{
            searchData();
        })
    </script>
    
    <svelte:options accessors/>
    <div id="main" class:modal={winMode == false} class:win={winMode == true}>
        <div class="EntireDiv">
            <div class="search">
                <Searcher bind:value={stats.lcno} width="200px" onChoose={(no)=>{stats = no;}}></Searcher>
            </div>
            <div class="button">
                <Button icon='search' on:click={searchData}>조회</Button>
                <Button icon='plus' on:click={addRow}>추가</Button>
                <Button icon='delete' on:click={delRow}>삭제</Button>
                <Button colored={true} icon='save2db' on:click={saveData}>저장</Button>
            </div>
            <div class="table">
                <Table 
                    bind:wrapper={elems.table1}
                    bind:table={table1}
                    data={data1}
                    width={'100%'}
                    height={'500px'}
                    option={option1}
                ></Table>
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
                width: 1100px;
            }
    
            /* 싱글모드 (창모드 넓이 ~ MAX) */
            #main.modal {
                overflow: auto;
            }
    
        /* 카드 */
        .EntireDiv {
            height: calc(100% - 32px);
            display : grid;
            grid-template-rows: auto;
            grid-row-gap: 10px;
            box-shadow: 0px 0px 10px #0000000D;
            /* border: 1px solid #181d22; */
            border-radius: 6px;
            background-color: #212830DD;
            padding: 15px;
        }
    
            .EntireDiv .search {
                grid-area: 1 / 1 / 2 / 2;
            }
    
            /* 테이블 */
            .EntireDiv .button {
                grid-area: 1 / 2 / 2 / 3;
                display: grid;
                grid-template-columns: 70px 70px 70px 70px;
                grid-template-rows: auto;
                grid-column-gap: 5px;
                justify-content: end
            }
    
            .EntireDiv .table {
                grid-area: 2 / 1 / 3 / 3
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
    
            /* Td 줄바꿈 방지 */
            #main .table :global(.handsontable td) {
                text-overflow:ellipsis; 
                overflow:hidden; 
                white-space:nowrap;
            }
    
            #main :global(.handsontable tr th) {
                color: #666;
                background: #181D23;
            }
    
            #main :global(.handsontable tr td) {
                color: #999999;
                background: #212830;
            }
    </style>
                <svelte:options accessors />

<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Table from '$lib/nested/table.svelte';
	import Button from '$lib/nested/button.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	// 창모드 / 싱글, 듀얼모드
	export let winMode = false;

	const consts = {};
	let stats = {
		lcno: 1,
		sano: 1,
		year: 2010
	};

	$: searchEvent(stats);

	let elems = {
		table1: null
	};
	// Table
	let table1;

	// Initial Datas
	let iData1 = [];

	// Datas
	let data1 = [];

	// Cells
	let optionC = function (row, col, prop) {
		let cellProperties = {};
		if (col == 0 || col == 1 || col == 10) {
			cellProperties.readOnly = true;
		}
		if (col == 3) {
			cellProperties.editor = 'select';
			cellProperties.selectOptions = ['북', '동', '남', '서', '북동', '남동', '남서', '북서'];
		}
		if (col == 7) {
			cellProperties.editor = 'select';
			cellProperties.selectOptions = ['정상', '오프라인'];
		}
		return cellProperties;
	};

	// Option
	let option1 = {
		colWidths: [30, 30, 30, 30, 60, 30, 30, 30, 30, 30, 60],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		nestedHeaders: [
			[
				{ label: 'IDX', colspan: 1 },
				{ label: '교차로 번호', colspan: 1 },
				{ label: '카메라 ID', colspan: 1 },
				{ label: '설치방향', colspan: 1 },
				{ label: 'IP주소', colspan: 1 },
				{ label: 'PORT번호', colspan: 1 },
				{ label: '해상도', colspan: 1 },
				{ label: '상태', colspan: 1 },
				{ label: '인증키', colspan: 1 },
				{ label: '기타정보', colspan: 1 },
				{ label: '수정시간', colspan: 1 }
			]
		],
		cells: optionC,
		afterSelectionEnd: function (x1, y1, x2, y2) {
			if ((x1 <= x2 && y1 < y2) || (x1 < x2 && y1 <= y2) || (x1 == x2 && y1 == y2)) {
				row1 = x1;
				if (x1 == 0) row2 = parseInt(x2 + 1);
				else row2 = x2;
			} else if ((x1 >= x2 && y1 > y2) || (x1 > x2 && y1 >= y2)) {
				row1 = x2;
				if (x2 == 0) row2 = parseInt(x1 + 1);
				else row2 = x1;
			} else if (x1 < x2 && y1 > y2) {
				row1 = x1;
				row2 = x2;
			} else if (x1 > x2 && y1 < y2) {
				row1 = x2;
				row2 = x1;
			}
		},
		manualColumnResize: false
	};

	// Add
	let addIdx = new Array();

	// Del
	let delIdx = new Array();

	// Row
	let row1 = null;
	let row2 = null;

	// Search Event
	function searchEvent(stat) {
		if (table1) {
			searchData();
		}
	}

	// 데이터 변경(number to string)
	function ntos(arr) {
		let res = JSON.parse(JSON.stringify(arr));

		res.forEach((v, i) => {
			// idx
			v.idx = i + 1;

			// 방향(NUMBER)
			v.dir = v.dir == 10 ? '북' : v.dir == 20 ? '동' : v.dir == 30 ? '남' : '서';

			// 상태코드(NUMBER)
			v.status = v.status == 0 ? '오프라인' : '정상';

			// 마지막 수정 시간
			v.last_update = v.last_update ? v.last_update.replace('T', ' ') : '';
		});

		return res;
	}

	// 데이터 변경(string to number)
	function ston(arr) {
		let res = JSON.parse(JSON.stringify(arr));

		res.forEach((v, i) => {
			// 방향(NUMBER)
			v.dir = v.dir == '북' ? 10 : v.dir == '동' ? 20 : v.dir == '남' ? 30 : 40;

			// 포트(NUMBER)
			v.port = isNaN(v.port) ? 0 : Number(v.port);

			// 해상도(NUMBER)
			v.resolution = isNaN(v.resolution) ? 0 : Number(v.resolution);

			// 상태코드(NUMBER)
			v.status = v.status == '오프라인' ? 0 : 1;

			// camera
			v.camera_id = v.camera_id == null ? '' : v.camera_id;

			// ip
			v.ip = v.ip == null ? '' : v.ip;

			// auth_key
			v.auth_key = v.auth_key == null ? '' : v.auth_key;

			// info
			v.info = v.info == null ? '' : v.info;

			// 마지막 수정 시간
			let today = new Date();
			let year = today.getFullYear();
			let month = ('0' + (today.getMonth() + 1)).slice(-2);
			let day = ('0' + today.getDate()).slice(-2);
			let hours = ('0' + today.getHours()).slice(-2);
			let minutes = ('0' + today.getMinutes()).slice(-2);
			let seconds = ('0' + today.getSeconds()).slice(-2);

			v.last_update = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
		});

		return res;
	}

	// 데이터 생성
	function makeData(res) {
		let _data = [];

		if (res) {
			let length;
			if (typeof res == 'object') {
				length = Object.keys(res).length;
			} else {
				length = res.length;
			}

			if (length) {
				iData1 = res;
				let _res = ntos(res);
				_data.push(['', '', '', '', '', '', '', '', '', '', '']);
				_res.forEach((v, i) => {
					_data.push([
						v.idx,
						v.lcno,
						v.camera_id,
						v.dir,
						v.ip,
						v.port,
						v.resolution,
						v.status,
						v.auth_key,
						v.info,
						v.last_update
					]);
				});
			} else {
				_data = [['데이터 없음', '', '', '', '', '', '', '', '', '', '']];
				iData1 = [];
			}
		} else {
			_data = [['데이터 없음', '', '', '', '', '', '', '', '', '', '']];
			iData1 = [];
		}

		return _data;
	}

	// 조회
	function searchData(e) {
		let cnt = 1;
		let isSuccess = new Array(cnt).fill(0);
		let isData = new Array(cnt).fill(0);

		ajax(`/ntcs_m_camera_lc?lcno=${stats.lcno}`).then((res) => {
			if (res.hasOwnProperty('success')) {
				initData();
			} else {
				table1.loadData(makeData(res));
				if (!_.isEmpty(res)) {
					isData[0] = 1;
				} else {
					table1.updateSettings({ mergeCells: [{ row: 0, col: 0, rowspan: 1, colspan: 11 }] });
				}
				isSuccess[0] = 1;
			}
			if (e) {
				if (!isSuccess[0] || !isData[0]) {
					document.isSuccess(res);
				} else {
					document.isSuccess(stats);
				}
			}
		});
	}

	// 추가
	function addRow() {
		// 테이블 ROW 개수
		let row = table1.countRows();

		console.log('row : ', row);

		// 테이블 IDX값들
		// [1, 2, 3 ...]
		let indexArray = table1.getDataAtCol(0);

		// for(let i = 0; i < indexArray.length; i++) {
		//     if(indexArray[i] >= 9999)  {
		//         indexArray.splice(i, 1);
		//         i--;
		//     }
		// }

		console.log('indexArray : ', indexArray);

		let autoIncrease;
		let curIdx;

		if (indexArray.length == 0) {
			autoIncrease = 0;
		} else {
			autoIncrease = indexArray[indexArray.length - 1];
		}

		console.log('autoIncrease : ', autoIncrease);

		if (typeof autoIncrease == 'string') {
			// 데이터 입력
			table1.setDataAtCell(row, 0, 1);
			table1.setDataAtCell(row, 1, stats.lcno);
			table1.setDataAtCell(row, 2, '');
			table1.setDataAtCell(row, 3, '북');
			table1.setDataAtCell(row, 4, '');
			table1.setDataAtCell(row, 5, '');
			table1.setDataAtCell(row, 6, '');
			table1.setDataAtCell(row, 7, '');
			table1.setDataAtCell(row, 8, '');
			table1.setDataAtCell(row, 9, '');
			table1.setDataAtCell(row, 10, '');

			table1.alter('remove_row', 0);

			curIdx = 1;
		} else {
			table1.alter('insert_row', row, 1);

			// 데이터 입력
			table1.setDataAtCell(row, 0, autoIncrease + 1);
			table1.setDataAtCell(row, 1, stats.lcno);
			table1.setDataAtCell(row, 2, '');
			table1.setDataAtCell(row, 3, '북');
			table1.setDataAtCell(row, 4, '');
			table1.setDataAtCell(row, 5, '');
			table1.setDataAtCell(row, 6, '');
			table1.setDataAtCell(row, 7, '');
			table1.setDataAtCell(row, 8, '');
			table1.setDataAtCell(row, 9, '');
			table1.setDataAtCell(row, 10, '');

			curIdx = autoIncrease + 1;
		}

		console.log('curIdx : ', curIdx);

		// ROW FOCUS
		table1.selectCell(curIdx - 1, 0);

		if (delIdx.includes(curIdx)) {
			var search = delIdx.indexOf(curIdx);
			if (search != -1) {
				delIdx.splice(search, 1); // "A"를 찾아서 삭제한다.
			}
		} else {
			addIdx.push(curIdx);
		}

		console.log('addIdx : ', addIdx);
	}

	// 삭제
	function delRow() {
		if (row1 != null) {
			let delIdNo = table1.getSourceDataAtCell(row1, 0);

			if (row1 == 0) {
				table1.setDataAtCell(row1, 0, '데이터 없음');
				table1.updateSettings({ mergeCells: [{ row: 0, col: 0, rowspan: 1, colspan: 11 }] });
			} else {
				table1.alter('remove_row', row1);
				table1.selectCell(row1 - 1, 0);
			}

			if (addIdx.includes(delIdNo)) {
				let search = addIdx.indexOf(delIdNo);
				if (search != -1) {
					addIdx.splice(search, 1); // "A"를 찾아서 삭제한다.
				}
			} else {
				delIdx.push(delIdNo);
			}
		} else {
			document.createMsg('제거할 줄을 선택해주세요!');
		}
	}

	// 저장
	function saveData() {
		let _res = table1.getSourceData();
		let _iData = ston(ntos(iData1));
		let arr = [];

		_res.forEach((v, i) => {
			let json = new Object();
			json.idx = v[0];
			json.lcno = v[1];
			json.camera_id = v[2] ? v[2] : '';
			json.dir = v[3];
			json.ip = v[4] ? v[4] : '';
			json.port = v[5];
			json.resolution = v[6];
			json.status = v[7];
			json.auth_key = v[8] ? v[8] : '';
			json.info = v[9] ? v[9] : '';
			json.last_update = v[10] ? v[10] : '';

			arr.push(json);
		});

		let _jsonArray = ston(arr);

		console.log(_jsonArray);

		let temp = _iData.filter((value) => !delIdx.includes(value.idx));
		let _temp = _jsonArray.filter((value) => !addIdx.includes(value.idx));

		// 추가 항목
		let addArray = _jsonArray.filter((value) => addIdx.includes(value.idx));

		addArray.forEach((v, i) => {
			delete v.idx;
			v.datamodetype = 1;
		});

		// 삭제 항목
		let deleteArray = _iData.filter((value) => delIdx.includes(value.idx));

		deleteArray.forEach((v, i) => {
			delete v.idx;
			v.datamodetype = 3;
		});

		// 수정 항목
		let updateArray = new Array();

		for (let i = 0; i < temp.length; i++) {
			let cnt = 0;
			if (temp[i].lcno != _temp[i].lcno) {
				cnt++;
				console.log(temp[i].lcno + ' VS ' + _temp[i].lcno);
				console.log('LCNO가 다릅니다.');
			}
			if (temp[i].camera_id != _temp[i].camera_id) {
				cnt++;
				console.log(temp[i].camera_id + ' VS ' + _temp[i].camera_id);
				console.log('카메라ID 다릅니다.');
			}
			if (temp[i].dir != _temp[i].dir) {
				cnt++;
				console.log(temp[i].dir + ' VS ' + _temp[i].dir);
				console.log('DIR이 다릅니다.');
			}
			if (temp[i].ip != _temp[i].ip) {
				cnt++;
				console.log(temp[i].ip + ' VS ' + _temp[i].ip);
				console.log('IP가 다릅니다.');
			}
			if (temp[i].port != _temp[i].port) {
				cnt++;
				console.log(temp[i].port + ' VS ' + _temp[i].port);
				console.log('PORT가 다릅니다.');
			}
			if (temp[i].resolution != _temp[i].resolution) {
				cnt++;
				console.log(temp[i].resolution + ' VS ' + _temp[i].resolution);
				console.log('RES가 다릅니다.');
			}
			if (temp[i].status != _temp[i].status) {
				cnt++;
				console.log(temp[i].status + ' VS ' + _temp[i].status);
				console.log('STAT이 다릅니다.');
			}
			if (temp[i].auth_key != _temp[i].auth_key) {
				cnt++;
				console.log(temp[i].auth_key + ' VS ' + _temp[i].auth_key);
				console.log('AUTH가 다릅니다.');
			}
			if (temp[i].info != _temp[i].info) {
				cnt++;
				console.log(temp[i].info + ' VS ' + _temp[i].info);
				console.log('INFO가 다릅니다.');
			}

			if (cnt) {
				delete _temp[i].idx;
				_temp[i].datamodetype = 2;
				updateArray.push(_temp[i]);
			}
		}

		let resultArray = [...addArray, ...deleteArray, ...updateArray];

		console.log(resultArray);

		if (resultArray.length != 0) {
			ajax('/ntcs_m_camera/UpdateManyCustom', 'PUT', resultArray).then((res) => {
				if (res.success) {
					addIdx = [];
					delIdx = [];
				}
				document.isSuccess(res);
			});
		} else {
			document.createMsg('변경된 사항이 없습니다.');
		}
	}

	function initData() {
		table1.loadData(makeData(null));
	}

	// 초기 조회
	onMount(() => {
		searchData();
	});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="search">
			<Searcher
				width="200px"
				onChoose={(no) => {
					stats = no;
				}}
			/>
		</div>
		<div class="button">
			<Button icon="search" on:click={searchData}>조회</Button>
			<Button icon="plus" on:click={addRow}>추가</Button>
			<Button icon="delete" on:click={delRow}>삭제</Button>
			<Button colored={true} icon="save2db" on:click={saveData}>저장</Button>
		</div>
		<div class="table">
			<Table
				bind:wrapper={elems.table1}
				bind:table={table1}
				data={data1}
				width={'100%'}
				height={'500px'}
				option={option1}
			/>
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
		width: 1100px;
	}

	/* 싱글모드 (창모드 넓이 ~ MAX) */
	#main.modal {
		overflow: auto;
	}

	/* 카드 */
	.EntireDiv {
		height: calc(100% - 32px);
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
		box-shadow: 0px 0px 10px #0000000d;
		/* border: 1px solid #181d22; */
		border-radius: 6px;
		background-color: #212830dd;
		padding: 15px;
	}

	.EntireDiv .search {
		grid-area: 1 / 1 / 2 / 2;
	}

	/* 테이블 */
	.EntireDiv .button {
		grid-area: 1 / 2 / 2 / 3;
		display: grid;
		grid-template-columns: 70px 70px 70px 70px;
		grid-template-rows: auto;
		grid-column-gap: 5px;
		justify-content: end;
	}

	.EntireDiv .table {
		grid-area: 2 / 1 / 3 / 3;
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

	/* Td 줄바꿈 방지 */
	#main .table :global(.handsontable td) {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

	#main :global(.handsontable tr th) {
		color: #666;
		background: #181d23;
	}

	#main :global(.handsontable tr td) {
		color: #999999;
		background: #212830;
	}
</style>
