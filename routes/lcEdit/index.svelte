<svelte:options accessors />

<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { devuimode, pageWidth } from '$lib/store.mjs';
	import Table from '$lib/nested/table.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	export let id;
	export let winMode = false;

	export const onSize = function (width, height) {
		table1.updateSettings({ height: height - 135 + 'px' });
		table1.refreshDimensions();
	};

	const consts = {};
	let stats = {};
	let elems = {
		table1: null // 교차로모니터링
	};
	// Table
	let table1;

	// Initial Datas
	let iData;

	// Datas
	let data = [];

	// Merge
	let optionM = null;

	// Cells
	let optionC = function (row, col, prop) {
		let cellProperties = {};
		if (col != 15 && col != 0 && col != 14 && col != 13) {
			cellProperties.readOnly = false;
		} else {
			cellProperties.readOnly = true;
		}
		if (col == 2) {
			cellProperties.editor = 'select';
			cellProperties.selectOptions = ['MI', 'CI', 'SCI', 'RAMP'];
		}
		if (col == 3) {
			cellProperties.editor = 'select';
			cellProperties.selectOptions = ['2004', '2010'];
		}
		if (col == 4) {
			cellProperties.editor = 'select';
			cellProperties.selectOptions = ['3색', '4색'];
		}
		if (col == 8) {
			cellProperties.editor = 'select';
			cellProperties.selectOptions = ['수동', '자동'];
		}
		if (col == 9) {
			cellProperties.editor = 'select';
			cellProperties.selectOptions = ['TCP SERVER', 'TCP CLIENT'];
		}
		if (col == 16) {
			cellProperties.type = 'checkbox';
		}
		return cellProperties;
	};

	// Option
	let option = {
		colWidths: [50, 140, 50, 50, 50, 50, 50, 50, 50, 50, 70, 50, 50, 50, 50, 70, 30],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		nestedHeaders: [
			[
				{ label: '번호', colspan: 1 },
				{ label: '교차로명', colspan: 1 },
				{ label: '유형', colspan: 1 },
				{ label: '연식', colspan: 1 },
				{ label: '등기구', colspan: 1 },
				{ label: '델타허용값', colspan: 1 },
				{ label: '전이주기수', colspan: 1 },
				{ label: '자동오류보정', colspan: 1 },
				{ label: '자동센터모드', colspan: 1 },
				{ label: '통신방식', colspan: 1 },
				{ label: 'IP', colspan: 1 },
				{ label: 'PORT', colspan: 1 },
				{ label: 'FEP번호', colspan: 1 },
				{ label: '그룹', colspan: 1 },
				{ label: '인덱스', colspan: 1 },
				{ label: '노드ID', colspan: 1 },
				{ label: '사용여부', colspan: 1 },
				{ label: '패킷체크방식', colspan: 1 },
				{ label: 'MCU펌웨어ID', colspan: 1 },
				{ label: 'SCU펌웨어ID', colspan: 1 },
				{ label: '연결교차로', colspan: 1 },
				{ label: '펌웨어ID', colspan: 1 },
				{ label: '경찰서코드', colspan: 1 },
				{ label: '관할구코드', colspan: 1 },
				{ label: '메모', colspan: 1 },
				{ label: '모델번호', colspan: 1 }
			]
		],
		cells: optionC,
		hiddenColumns: {
			columns: [12, 17, 18, 19, 20, 21, 22, 23, 24, 25],
			indicators: false
		},
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
	let addLc = new Array();

	// Del
	let delLc = new Array();

	// Row
	let row1 = null;
	let row2 = null;

	// 2D Array to Json
	function atoj(arr) {
		let keys = arr[0];
		let newArr = arr.slice(1, arr.length);
		let formatted = [],
			data = newArr,
			cols = keys,
			l = cols.length;
		for (let i = 0; i < data.length; i++) {
			let d = data[i],
				o = {};
			for (let j = 0; j < l; j++) o[cols[j]] = d[j];
			formatted.push(o);
		}
		return formatted;
	}

	// 데이터 변경(number to string)
	function ntos(arr) {
		let res = JSON.parse(JSON.stringify(arr));

		res.forEach((v, i) => {
			// 교차로 유형 (Imporflag)
			v.imporflag =
				v.imporflag == 0 ? 'MI' : v.imporflag == 1 ? 'CI' : v.imporflag == 2 ? 'SCI' : 'RAMP';
			v.lctype = v.lctype == 1 ? '2004' : '2010';
			v.lamptype = v.lamptype == 0 ? '3색' : '4색';
			v.autoonline = v.autoonline == 1 ? '수동' : '자동';
			v.commtype = v.commtype == 1 ? 'TCP SERVER' : 'TCP CLIENT';
			v.checksum = v.checksum == 1 ? 'CRC' : 'LRC';
		});

		return res;
	}

	// 데이터 변경(string to number)
	function ston(arr) {
		let res = JSON.parse(JSON.stringify(arr));

		res.forEach((v, i) => {
			v.imporflag =
				v.imporflag == 'MI' ? 0 : v.imporflag == 'CI' ? 1 : v.imporflag == 'SCI' ? 2 : 3;
			v.lctype = v.lctype == '2004' ? 1 : 2;
			v.lamptype = v.lamptype == '3색' ? 0 : 1;
			v.autoonline = v.autoonline == '수동' ? 1 : 2;
			v.commtype = v.commtype == 'TCP SERVER' ? 1 : 2;
			v.checksum = v.checksum == 'CRC' ? 1 : 0;
			v.regflag = v.regflag == true ? 1 : 0;

			v.deltalimit = Number(v.deltalimit) ? Number(v.deltalimit) : 0;
			v.transcycle = Number(v.transcycle) ? Number(v.transcycle) : 0;
			v.autoerror = Number(v.autoerror) ? Number(v.autoerror) : 0;

			v.port = Number(v.port) ? Number(v.port) : 0;
			v.sa_no = Number(v.sa_no) ? Number(v.sa_no) : 9999;
			v.saindex = Number(v.saindex) ? Number(v.saindex) : 1;
			v.regflag = v.regflag == true ? 1 : 0;
			v.fepno = v.fepno == true ? 1 : 0;

			v.mcu_fw_id = Number(v.mcu_fw_id) ? Number(v.mcu_fw_id) : 0;
			v.scu_fw_id = Number(v.scu_fw_id) ? Number(v.scu_fw_id) : 0;
			v.fw_id = Number(v.fw_id) ? Number(v.fw_id) : 0;
			v.main_lcno = Number(v.main_lcno) ? Number(v.main_lcno) : 0;
			v.police_code = Number(v.police_code) ? Number(v.police_code) : 0;
			v.gu_code = Number(v.gu_code) ? Number(v.gu_code) : 0;
			v.model = Number(v.model) ? Number(v.model) : 0;

			v.ip = v.ip ? v.ip : '';
			v.node_id = v.node_id ? v.node_id : '';
			v.comments = v.comments ? v.comments : '';
		});

		return res;
	}

	// 조회
	function initsearchData() {
		ajax('/ntcs_m_lc?take=0&skip=0').then((res) => {
			if (res.length) {
				iData = res;
				let _res = ntos(res);
				let _data = new Array();
				for (let i = 0; i < _res.length; i++) {
					_data.push([
						_res[i].lcno,
						_res[i].lcname,
						_res[i].imporflag,
						_res[i].lctype,
						_res[i].lamptype,
						_res[i].deltalimit,
						_res[i].transcycle,
						_res[i].autoerror,
						_res[i].autoonline,
						_res[i].commtype,
						_res[i].ip,
						_res[i].port,
						_res[i].fepno,
						_res[i].sa_no,
						_res[i].saindex,
						_res[i].node_id,
						Boolean(_res[i].regflag),
						_res[i].checksum,
						_res[i].mcu_fw_id,
						_res[i].scu_fw_id,
						_res[i].main_lcno,
						_res[i].fw_id,
						_res[i].police_code,
						_res[i].gu_code,
						_res[i].comments,
						_res[i].model
					]);
				}
				table1.loadData(_data);
			} else {
				console.log('데이터가 없습니다');
			}
		});
	}

	function searchData() {
		ajax('/ntcs_m_lc?take=0&skip=0').then((res) => {
			if (res.length) {
				iData = res;
				let _res = ntos(res);
				let _data = new Array();
				for (let i = 0; i < _res.length; i++) {
					_data.push([
						_res[i].lcno,
						_res[i].lcname,
						_res[i].imporflag,
						_res[i].lctype,
						_res[i].lamptype,
						_res[i].deltalimit,
						_res[i].transcycle,
						_res[i].autoerror,
						_res[i].autoonline,
						_res[i].commtype,
						_res[i].ip,
						_res[i].port,
						_res[i].fepno,
						_res[i].sa_no,
						_res[i].saindex,
						_res[i].node_id,
						Boolean(_res[i].regflag),
						_res[i].checksum,
						_res[i].mcu_fw_id,
						_res[i].scu_fw_id,
						_res[i].main_lcno,
						_res[i].fw_id,
						_res[i].police_code,
						_res[i].gu_code,
						_res[i].comments,
						_res[i].model
					]);
				}
				table1.loadData(_data);
				document.isSuccess(res);
			} else {
				console.log('데이터가 없습니다');
				document.isSuccess(res);
			}
		});
	}

	// 상세
	function lcDetail(e) {
		if (row1 == null) {
			console.log('선택된 항목이 없습니다.');
		} else {
			let find = iData.find((v) => v.lcno == table1.getDataAtRow(row1)[0]);
			if (find != undefined) {
				document.createWindow('lcDetailEdit', id, e, find.lcno);
			} else {
				console.log('해당 교차로 번호는 편집할 수 없습니다.');
			}
		}
	}

	// 추가
	function addRow() {
		let row = table1.countRows();
		let indexArray = table1.getDataAtCol(0);

		for (let i = 0; i < indexArray.length; i++) {
			if (indexArray[i] >= 2000) {
				indexArray.splice(i, 1);
				i--;
			}
		}

		let autoIncrease;

		if (indexArray.length == 0) {
			autoIncrease = 0;
		} else {
			autoIncrease = indexArray[indexArray.length - 1];
		}

		if (typeof autoIncrease == 'string') {
			console.log('!0잘못된 번호입니다.');
		} else {
			table1.alter('insert_row', row, 1);

			// 데이터 입력
			table1.setDataAtCell(row, 0, autoIncrease + 1);
			table1.setDataAtCell(row, 1, '새 교차로' + (autoIncrease + 1));
			table1.selectCell(row, 0);

			addLc.push(autoIncrease + 1);
			if (delLc.includes(autoIncrease + 1)) {
				var search = delLc.indexOf(autoIncrease + 1);
				if (search != -1) {
					delLc.splice(search, 1); // "A"를 찾아서 삭제한다.
				}
			}
		}
	}

	// 삭제
	function delRow() {
		if (row1 != null) {
			let delLcNo = table1.getSourceDataAtCell(row1, 0);
			table1.alter('remove_row', row1);
			table1.selectCell(row1 - 1, 0);

			if (addLc.includes(delLcNo)) {
				var search = addLc.indexOf(delLcNo);
				if (search != -1) {
					addLc.splice(search, 1); // "A"를 찾아서 삭제한다.
				}
			} else {
				delLc.push(delLcNo);
			}
		} else {
			document.createMsg('제거할 줄을 선택해주세요!');
		}
	}

	// 엑셀
	function exportExcel() {
		let exportPlugin = table1.getPlugin('exportFile');
		exportPlugin.downloadFile('csv', {
			bom: true,
			columnDelimiter: ',',
			exportHiddenColumns: false,
			exportHiddenRows: true,
			fileExtension: 'csv',
			filename: 'Handsontable-CSV-file_[YYYY]-[MM]-[DD]',
			mimeType: 'text/csv',
			rowDelimiter: '\r\n',
			rowHeaders: false
		});
	}

	// 저장
	function saveData() {
		let _res = table1.getSourceData();
		let _iData = iData;
		let arr = [];

		_res.forEach((v, i) => {
			let json = new Object();
			json.lcno = v[0]
			json.lcname = v[1]
			json.imporflag = v[2]
			json.lctype = v[3]
			json.lamptype = v[4]
			json.deltalimit = v[5]
			json.transcycle = v[6]
			json.autoerror = v[7]
			json.autoonline = v[8]
			json.commtype = v[9]
			json.ip = v[10] ? v[10] : ""
			json.port = v[11]
			json.sa_no = v[13]
			json.saindex = v[14]
			json.node_id = v[15] ? v[15] : ""
			json.regflag = v[16]
			json.fepno = 0
			json.model = 0
			json.checksum = 0
			json.mcu_fw_id = 0
			json.scu_fw_id = 0
			json.main_lcno = 0
			json.fw_id = 0
			json.police_code = 0
			json.gu_code = 0
			json.comments = "0"
			
			arr.push(json);
		})

		let _jsonArray = ston(arr);
    
		let temp = _iData.filter(value => !(delLc.includes(value.lcno)))
		let _temp = _jsonArray.filter(value => !(addLc.includes(value.lcno)))

		// 추가 항목
		let addArray = _jsonArray.filter((value) => addLc.includes(value.lcno));

		addArray.forEach((v, i) => {
			v.datamodetype = 1;
		});

		// 삭제 항목
		let deleteArray = _iData.filter((value) => delLc.includes(value.lcno));

		deleteArray.forEach((v, i) => {
			v.datamodetype = 3;
		});

		// 수정 항목
		let updateArray = new Array();
    
	for(let i=0; i<temp.length; i++){
		let cnt = 0;

		if(temp[i].lcno != _temp[i].lcno){
			cnt++; 
			console.log("LCNO가 다릅니다.");
		}
		if(temp[i].lcname != _temp[i].lcname){
			cnt++; 
			console.log("LCNAME이 다릅니다.")
		} 
		if(temp[i].imporflag != _temp[i].imporflag){
			cnt++; 
			console.log("IMPORFLAG가 다릅니다.")
		} 
		if(temp[i].lctype != _temp[i].lctype){
			cnt++; 
			console.log("LCTYPE이 다릅니다.")
		} 
		if(temp[i].lamptype != _temp[i].lamptype){
			cnt++; 
			console.log("LAMPTYPE이 다릅니다.")
		}
		if(temp[i].deltalimit != _temp[i].deltalimit){
			cnt++; 
			console.log("DELTALIMIT 다릅니다.")
		}
		if(temp[i].transcycle != _temp[i].transcycle){
			cnt++; 
			console.log("TRANS이 다릅니다.")
		}
		if(temp[i].autoerror != _temp[i].autoerror){
			cnt++; 
			console.log("AUTOERROR이 다릅니다.")
		}
		if(temp[i].autoonline != _temp[i].autoonline){
			cnt++; 
			console.log("AUTOONLINE이 다릅니다.")
		}
		if(temp[i].commtype != _temp[i].commtype){
			cnt++; 
			console.log("COMMTYPE이 다릅니다.")
		}
		if(temp[i].ip != _temp[i].ip){
			cnt++; 
			console.log("IP가 다릅니다.")
		} 
		if(temp[i].port != _temp[i].port){
			cnt++; 
			console.log("PORT가 다릅니다.")
		}
		if(temp[i].node_id != _temp[i].node_id){
			cnt++; 
			console.log("NODEID가 다릅니다.")
		}
		if(temp[i].sa_no != _temp[i].sa_no){
			cnt++; 
			console.log("SANO가 다릅니다.")
		}
		if(temp[i].saindex != _temp[i].saindex){
			cnt++; 
			console.log("SAINDEX가 다릅니다.")
		}
		if(temp[i].regflag != _temp[i].regflag){
			cnt++; 
			console.log("REGFLAG가 다릅니다.")
		}

		if(cnt){
			_temp[i].datamodetype = 2;
			updateArray.push(_temp[i])
		}
	}

		let resultArray = [...addArray, ...deleteArray, ...updateArray];
		console.log(resultArray);
		if (resultArray.length != 0) {
			ajax('/ntcs_m_lc/UpdateManyCustom', 'PUT', resultArray).then((res) => {
				addLc = [];
				delLc = [];
				document.isSuccess(res);
			});
		} else {
			console.log('변경된 사항이 없습니다.');
		}
	}

	// 초기 조회
	onMount(() => {
		initsearchData();
	});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="button">
			<div>
				<Button height={'30px'} icon="search" on:click={searchData}>조회</Button>
				<!-- <Button icon='detail' on:click={lcDetail}>상세</Button> -->
				<Button height={'30px'} icon="plus" on:click={addRow}>추가</Button>
				<Button height={'30px'} icon="delete" on:click={delRow}>삭제</Button>
				<Button height={'30px'} icon="external" on:click={exportExcel}>엑셀저장</Button>
				<Button height={'30px'} colored={true} icon="save2db" on:click={saveData}>저장</Button>
			</div>
		</div>
		<div class="table">
			<Table
				bind:wrapper={elems.table1}
				bind:table={table1}
				width={'100%'}
				height={'540px'}
				{data}
				{option}
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
		max-height: 1400px;
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 1150px;
		height: 594px;
	}

	/* 분할,전체모드 (창모드 넓이 ~ MAX) */
	#main.modal {
		overflow: auto;
	}

	/* 카드 */
	.EntireDiv {
		box-shadow: 0px 0px 10px #0000000d;
		/* border: 1px solid #181D23; */
		border-radius: 6px;
		background-color: #212830dd;
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
		padding: 10px;
	}

	/* 테이블 */
	#main .table {
		display: grid;
		grid-template-columns: 100%;
	}

	/* 버튼 (크기 고정) */
	#main .button {
		display: grid;
		grid-template-columns: auto;
		overflow: hidden;
	}

	#main .button > div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 70px 70px 90px 100px;
		grid-column-gap: 5px;
		align-items: end;
		justify-content: end;
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

	#main .table :global(.handsontable tr td:nth-child(2)) {
		text-align: left;
	}

	#main .table :global(.handsontable tr th) {
		color: #666;
		background: #181d23;
	}

	#main .table :global(.handsontable tr td) {
		color: #999999;
		background: #212830;
	}

	/* scroll */
	#main :global(::-webkit-scrollbar) {
		width: 7px;
		height: 7px;
		background-color: rgba(0, 0, 0, 0.7);
	}
	#main :global(::-webkit-scrollbar-thumb) {
		background-color: rgba(126, 126, 126, 0.7);
		border-radius: 2px;
	}
</style>
