<svelte:options accessors />

<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { devuimode, pageWidth } from '$lib/store.mjs';
	import Table from '$lib/nested/table.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	export let winMode = false;

	export const onSize = function (width, height) {
		table1.updateSettings({ height: height - 135 + 'px' });
		table1.refreshDimensions();
	};

	const consts = {};
	let stats = {};
	let elems = {
		table1: null // 그룹모니터링
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
		if (col != 0) {
			cellProperties.readOnly = false;
		} else {
			cellProperties.readOnly = true;
		}
		if (col == 2) {
			cellProperties.editor = 'select';
			cellProperties.selectOptions = ['TOD', 'TRC'];
		}
		if (col == 6 || col == 7 || col == 8 || col == 15) {
			cellProperties.type = 'checkbox';
		}
		return cellProperties;
	};

	// Option
	let option = {
		colWidths: [
			35, 130, 20, 35, 35, 35, 21, 21, 35, 35, 35, 35, 35, 21, 21, 21, 1, 1, 1, 1, 1, 1, 1
		],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		nestedHeaders: [
			[
				{ label: '번호', colspan: 1 },
				{ label: '그룹명', colspan: 1 },
				{ label: '제어모드', colspan: 1 },
				{ label: '최소주기유지수', colspan: 1 },
				{ label: '현시조정상수', colspan: 1 },
				{ label: '옵셋조정상수', colspan: 1 },
				{ label: 'TRC주기', colspan: 1 },
				{ label: 'TRC옵셋', colspan: 1 },
				{ label: '자동센터모드', colspan: 1 },
				{ label: '최소주기레벨', colspan: 1 },
				{ label: '최대주기레벨', colspan: 1 },
				{ label: '주기전환방법', colspan: 1 },
				{ label: '주기전환범위', colspan: 1 },
				{ label: '전이방법', colspan: 1 },
				{ label: '기준시각', colspan: 1 },
				{ label: '사용여부', colspan: 1 },
				{ label: '그룹결합방법', colspan: 1 },
				{ label: '그룹결합변수1', colspan: 1 },
				{ label: '그룹결합변수2', colspan: 1 },
				{ label: '그룹결합변수3', colspan: 1 },
				{ label: '그룹결합변수4', colspan: 1 },
				{ label: '그룹결합변수5', colspan: 1 },
				{ label: '그룹결합변수6', colspan: 1 }
			]
		],
		cells: optionC,
		hiddenColumns: {
			columns: [16, 17, 18, 19, 20, 21, 22],
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
	let addSa = new Array();

	// Del
	let delSa = new Array();

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
			v.sa_defaultcntlmode = v.sa_defaultcntlmode == 0 ? 'TOD' : 'TRC';
		});

		return res;
	}

	// 데이터 변경(string to number)
	function ston(arr) {
		let res = JSON.parse(JSON.stringify(arr));

		res.forEach((v, i) => {
			v.sa_defaultcntlmode = v.sa_defaultcntlmode == 'TOD' ? 0 : 1;
			v.sa_autoonlinereq = v.sa_autoonlinereq == true ? 1 : 0;
			v.sa_regflag = v.sa_regflag == true ? 1 : 0;
			v.sa_trccntl1 = v.sa_trccntl1 == true ? 1 : 0;
			v.sa_trccntl2 = v.sa_trccntl2 == true ? 1 : 0;

			v.sa_minoperatecycle = Number(v.sa_minoperatecycle) ? Number(v.sa_minoperatecycle) : 0;
			v.sa_phasefactor = Number(v.sa_phasefactor) ? Number(v.sa_phasefactor) : 0;
			v.sa_offsetadjstfactor = Number(v.sa_offsetadjstfactor) ? Number(v.sa_offsetadjstfactor) : 0;
			v.sa_mincyclelevel = Number(v.sa_mincyclelevel) ? Number(v.sa_mincyclelevel) : 0;
			v.sa_maxcyclelevel = Number(v.sa_maxcyclelevel) ? Number(v.sa_maxcyclelevel) : 0;
			v.sa_cyclemtd = Number(v.sa_cyclemtd) ? Number(v.sa_cyclemtd) : 0;
			v.sa_cyclerng = Number(v.sa_cyclerng) ? Number(v.sa_cyclerng) : 0;
			v.sa_cycletransmtd = Number(v.sa_cycletransmtd) ? Number(v.sa_cycletransmtd) : 0;
			v.sa_cycletimesetmtd = Number(v.sa_cycletimesetmtd) ? Number(v.sa_cycletimesetmtd) : 0;
			v.sa_sajoinmtd = Number(v.sa_sajoinmtd) ? Number(v.sa_sajoinmtd) : 0;
			v.sa_sajoinvariable1 = Number(v.sa_sajoinvariable1) ? Number(v.sa_sajoinvariable1) : 0;
			v.sa_sajoinvariable2 = Number(v.sa_sajoinvariable2) ? Number(v.sa_sajoinvariable2) : 0;
			v.sa_sajoinvariable3 = Number(v.sa_sajoinvariable3) ? Number(v.sa_sajoinvariable3) : 0;
			v.sa_sajoinvariable4 = Number(v.sa_sajoinvariable4) ? Number(v.sa_sajoinvariable4) : 0;
			v.sa_sajoinvariable5 = Number(v.sa_sajoinvariable5) ? Number(v.sa_sajoinvariable5) : 0;
			v.sa_sajoinvariable6 = Number(v.sa_sajoinvariable6) ? Number(v.sa_sajoinvariable6) : 0;
		});

		return res;
	}

	// 조회
	function initsearchData() {
		ajax('/ntcs_m_saoprate?take=0&skip=0').then((res) => {
			if (res.length) {
				iData = res;
				let _res = ntos(res);
				let _data = new Array();
				for (let i = 0; i < _res.length; i++) {
					_data.push([
						_res[i].sa_no,
						_res[i].sa_name,
						_res[i].sa_defaultcntlmode,
						_res[i].sa_minoperatecycle,
						_res[i].sa_phasefactor,
						_res[i].sa_offsetadjstfactor,
						Boolean(_res[i].sa_trccntl1),
						Boolean(_res[i].sa_trccntl2),
						Boolean(_res[i].sa_autoonlinereq),
						_res[i].sa_mincyclelevel,
						_res[i].sa_maxcyclelevel,
						_res[i].sa_cyclemtd,
						_res[i].sa_cyclerng,
						_res[i].sa_cycletransmtd,
						_res[i].sa_cycletimesetmtd,
						Boolean(_res[i].sa_regflag),
						_res[i].sa_sajoinmtd,
						_res[i].sa_sajoinvariable1,
						_res[i].sa_sajoinvariable2,
						_res[i].sa_sajoinvariable3,
						_res[i].sa_sajoinvariable4,
						_res[i].sa_sajoinvariable5,
						_res[i].sa_sajoinvariable6
					]);
				}
				table1.loadData(_data);
			} else {
				console.log('데이터가 없습니다');
			}
		});
	}

	function searchData() {
		ajax('/ntcs_m_saoprate?take=0&skip=0').then((res) => {
			if (res.length) {
				iData = res;
				let _res = ntos(res);
				let _data = new Array();
				for (let i = 0; i < _res.length; i++) {
					_data.push([
						_res[i].sa_no,
						_res[i].sa_name,
						_res[i].sa_defaultcntlmode,
						_res[i].sa_minoperatecycle,
						_res[i].sa_phasefactor,
						_res[i].sa_offsetadjstfactor,
						Boolean(_res[i].sa_trccntl1),
						Boolean(_res[i].sa_trccntl2),
						Boolean(_res[i].sa_autoonlinereq),
						_res[i].sa_mincyclelevel,
						_res[i].sa_maxcyclelevel,
						_res[i].sa_cyclemtd,
						_res[i].sa_cyclerng,
						_res[i].sa_cycletransmtd,
						_res[i].sa_cycletimesetmtd,
						Boolean(_res[i].sa_regflag),
						_res[i].sa_sajoinmtd,
						_res[i].sa_sajoinvariable1,
						_res[i].sa_sajoinvariable2,
						_res[i].sa_sajoinvariable3,
						_res[i].sa_sajoinvariable4,
						_res[i].sa_sajoinvariable5,
						_res[i].sa_sajoinvariable6
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

	// 추가
	function addRow() {
		let col = table1.countRows();
		let indexArray = table1.getDataAtCol(0);

		for (let i = 0; i < indexArray.length; i++) {
			if (indexArray[i] === 9999) {
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
			table1.alter('insert_row', col, 1);
			table1.setDataAtCell(col, 0, autoIncrease + 1);
			table1.selectCell(col, 0);

			addSa.push(autoIncrease + 1);
			if (delSa.includes(autoIncrease + 1)) {
				var search = delSa.indexOf(autoIncrease + 1);
				if (search != -1) {
					delSa.splice(search, 1); // "A"를 찾아서 삭제한다.
				}
			}
		}
	}

	// 삭제
	function delRow() {
		if (row1 != null) {
			let delSaNo = table1.getSourceDataAtCell(row1, 0);
			table1.alter('remove_row', row1);
			table1.selectCell(row1 - 1, 0);

			if (addSa.includes(delSaNo)) {
				let search = addSa.indexOf(delSaNo);
				if (search != -1) {
					addSa.splice(search, 1); // "A"를 찾아서 삭제한다.
				}
			} else {
				delSa.push(delSaNo);
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
			fileExtension: 'xlsx',
			filename: 'Handsontable-CSV-file_[YYYY]-[MM]-[DD]',
			mimeType: 'text/xlsx',
			rowDelimiter: '\r\n',
			rowHeaders: false
		});
	}

	// 저장
	function saveData() {
		let _res = table1.getSourceData();
		let _iData = iData;

		let dtKeys = [
			'sa_no',
			'sa_name',
			'sa_defaultcntlmode',
			'sa_minoperatecycle',
			'sa_phasefactor',
			'sa_offsetadjstfactor',
			'sa_trccntl1',
			'sa_trccntl2',
			'sa_autoonlinereq',
			'sa_mincyclelevel',
			'sa_maxcyclelevel',
			'sa_cyclemtd',
			'sa_cyclerng',
			'sa_cycletransmtd',
			'sa_cycletimesetmtd',
			'sa_regflag',
			'sa_sajoinmtd',
			'sa_sajoinvariable1',
			'sa_sajoinvariable2',
			'sa_sajoinvariable3',
			'sa_sajoinvariable4',
			'sa_sajoinvariable5',
			'sa_sajoinvariable6'
		];

		_res.unshift(dtKeys);

		let jsonArray = atoj(_res);
		let _jsonArray = ston(jsonArray);

		let temp = _iData.filter((value) => !delSa.includes(value.sa_no));
		let _temp = _jsonArray.filter((value) => !addSa.includes(value.sa_no));

		// 추가 항목
		let addArray = _jsonArray.filter((value) => addSa.includes(value.sa_no));

		addArray.forEach((v, i) => {
			v.datamodetype = 1;
		});

		// 삭제 항목
		let deleteArray = new Array();

		for (let i in delSa) {
			deleteArray.push({
				datamodetype: 3,
				sa_no: delSa[i]
			});
		}

		// 수정 항목
		let updateArray = new Array();

		for (let i in temp) {
			delete temp[i].display_name;
			if (_.isEqual(temp[i], _temp[i]) == false) {
				_temp[i].datamodetype = 2;
				updateArray.push(_temp[i]);
			}
		}

		let resultArray = [...addArray, ...deleteArray, ...updateArray];

		if (resultArray.length != 0) {
			ajax('/ntcs_m_saoprate/UpdateManyCustom', 'PUT', resultArray).then((res) => {
				addSa = [];
				delSa = [];
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
		<div class="table">
			<Table
				bind:wrapper={elems.table1}
				bind:table={table1}
				width={'100%'}
				height={'500px'}
				{data}
				{option}
			/>
		</div>
		<div class="button">
			<div>
				<Button icon="search" on:click={searchData}>조회</Button>
				<Button icon="plus" on:click={addRow}>추가</Button>
				<Button icon="delete" on:click={delRow}>삭제</Button>
				<Button icon="external" on:click={exportExcel}>엑셀</Button>
			</div>
			<div>
				<Button colored={true} icon="save2db" on:click={saveData}>저장</Button>
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
		width: 1300px;
		height: 594px;
	}

	/* 싱글모드 (창모드 넓이 ~ MAX) */
	#main.modal {
		overflow: auto;
	}

	/* 카드 */
	.EntireDiv {
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #dbe2e6;
		border-radius: 6px;
		background-color: #fff;
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
		grid-template-columns: 1fr 1fr;
		align-items: end;
		overflow: auto;
	}

	#main .button > div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 70px 70px 70px;
		grid-column-gap: 5px;
	}

	#main .button > div:nth-child(2) {
		display: grid;
		grid-template-columns: 100px;
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
</style>
