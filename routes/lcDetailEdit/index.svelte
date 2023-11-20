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
	export let params;

	const consts = {};
	let stats = {};
	let elems = {
		table1: null
	};
	// Table
	let table1;

	// Initial Datas
	let iData;

	// Datas
	let data = [];

	// Cells
	let optionC = function (row, col, prop) {
		let cellProperties = {};
		if (col == 0 || col == 2) {
			cellProperties.readOnly = true;
		}
		if (col == 1 && (row == 0 || row == 13 || row == 14 || row == 15)) {
			cellProperties.readOnly = true;
		}
		if (col == 1 && row == 2) {
			cellProperties.editor = 'select';
			cellProperties.selectOptions = ['MI', 'CI', 'SCI', 'RAMP'];
		}
		if (col == 1 && row == 3) {
			cellProperties.editor = 'select';
			cellProperties.selectOptions = ['2004', '2010'];
		}
		if (col == 1 && row == 4) {
			cellProperties.editor = 'select';
			cellProperties.selectOptions = ['3색', '4색'];
		}
		if (col == 1 && row == 8) {
			cellProperties.editor = 'select';
			cellProperties.selectOptions = ['수동', '자동'];
		}
		if (col == 1 && row == 9) {
			cellProperties.editor = 'select';
			cellProperties.selectOptions = ['TCP SERVER', 'TCP CLIENT'];
		}
		if (col == 1 && row == 12) {
			cellProperties.type = 'checkbox';
		}
		if (col == 1 && row == 16) {
			cellProperties.type = 'checkbox';
		}
		if (col == 3 && row == 0) {
			cellProperties.editor = 'select';
			cellProperties.selectOptions = ['LRC', 'CRC'];
		}
		return cellProperties;
	};

	// Option
	let option = {
		colWidths: [85, 120, 85, 120],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		cells: optionC
	};

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

			v.deltalimit = Number(v.deltalimit) ? Number(v.deltalimit) : 0;
			v.transcycle = Number(v.transcycle) ? Number(v.transcycle) : 0;
			v.autoerror = Number(v.autoerror) ? Number(v.autoerror) : 0;

			v.port = Number(v.port) ? Number(v.port) : 0;
			v.sa_no = Number(v.sa_no) ? Number(v.sa_no) : 9999;
			v.saindex = Number(v.saindex) ? Number(v.saindex) : 1;
			v.regflag = v.regflag == true ? 1 : 0;

			v.mcu_fw_id = Number(v.mcu_fw_id) ? Number(v.mcu_fw_id) : 0;
			v.scu_fw_id = Number(v.scu_fw_id) ? Number(v.scu_fw_id) : 0;
			v.fw_id = Number(v.fw_id) ? Number(v.fw_id) : 0;
			v.main_lcno = Number(v.main_lcno) ? Number(v.main_lcno) : 0;
			v.police_code = Number(v.police_code) ? Number(v.police_code) : 0;
			v.gu_code = Number(v.gu_code) ? Number(v.gu_code) : 0;
			v.model = Number(v.model) ? Number(v.model) : 0;
		});

		return res;
	}
	function TrueFalse(a) {
		if (a == 1) return true;
		else {
			return false;
		}
	}

	// 조회
	function searchData(e) {
		ajax(`/ntcs_m_lc/GetBy?lcno=${params}`).then((res) => {
			if (res) {
				iData = res;
				let _res = ntos([res]);
				let _data;
				for (let i = 0; i < _res.length; i++) {
					_data = [
						['번호', _res[i].lcno, '패킷체크방식', _res[i].checksum],
						['교차로명', _res[i].lcname, 'MCU펌웨어ID', _res[i].mcu_fw_id],
						['유형', _res[i].imporflag, 'SCU펌웨어ID', _res[i].scu_fw_id],
						['연식', _res[i].lctype, '펌웨어ID', _res[i].fw_id],
						['등기구', _res[i].lamptype, '주요교차로', _res[i].main_lcno],
						['델타허용값', _res[i].deltalimit, '경찰서코드', _res[i].police_code],
						['전이주기수', _res[i].transcycle, '관할구코드', _res[i].gu_code],
						['자동오류보정', _res[i].autoerror, '모델번호', _res[i].model],
						['자동센터모드', _res[i].autoonline, '교차로메모', _res[i].comments],
						['통신방식', _res[i].commtype, '', ''],
						['IP', _res[i].ip, '', ''],
						['PORT', _res[i].port, '', ''],
						['FEP번호', TrueFalse(_res[i].fepno), '', ''],
						['그룹', _res[i].sa_no, '', ''],
						['인덱스', _res[i].saindex, '', ''],
						['노드ID', _res[i].node_id, '', ''],
						['사용여부', Boolean(_res[i].regflag), '', '']
					];
				}
				table1.loadData(_data);
				table1.updateSettings({
					mergeCells: [
						{ row: 8, col: 2, rowspan: 9, colspan: 1 },
						{ row: 8, col: 3, rowspan: 9, colspan: 1 }
					]
				});
			}
			if (e) {
				document.isSuccess(res);
			}
		});
	}

	// 저장
	function saveData() {
		let left = table1.getSourceData(0, 1, 16, 1).reduce(function (acc, cur) {
			return acc.concat(cur);
		});
		let right = table1
			.getSourceData(0, 3, 16, 3)
			.reduce(function (acc, cur) {
				return acc.concat(cur);
			})
			.slice(0, 9);

		let _res = [...left, ...right];

		let dtKeys = [
			'lcno',
			'lcname',
			'imporflag',
			'lctype',
			'lamptype',
			'deltalimit',
			'transcycle',
			'autoerror',
			'autoonline',
			'commtype',
			'ip',
			'port',
			'fepno',
			'sa_no',
			'saindex',
			'node_id',
			'regflag',
			'checksum',
			'mcu_fw_id',
			'scu_fw_id',
			'fw_id',
			'main_lcno',
			'police_code',
			'gu_code',
			'model',
			'comments'
		];

		let temp = new Array();
		temp.push(dtKeys);
		temp.push(_res);

		let jsonArray = atoj(temp);
		let _jsonArray = ston(jsonArray);

		_jsonArray[0].datamodetype = 2;
		console.log(_jsonArray);

		ajax('/ntcs_m_lc/UpdateManyCustom', 'PUT', _jsonArray).then((res) => {
			document.isSuccess(res);
		});
	}

	// 초기 조회
	onMount(() => {
		searchData();
	});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="table">
			<Table
				bind:wrapper={elems.table1}
				bind:table={table1}
				{data}
				width={'100%'}
				height={'auto'}
				{option}
			/>
		</div>
		<div class="button">
			<div>
				<Button icon="search" on:click={searchData}>조회</Button>
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
		width: 440px;
		height: 456px;
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
		grid-template-columns: 70px;
		grid-column-gap: 5px;
	}

	#main .button > div:nth-child(2) {
		display: grid;
		grid-template-columns: 100px;
		justify-content: end;
	}

	/* Handsontable */
	#main .table :global(.handsontable tr td:nth-child(1)),
	#main .table :global(.handsontable tr td:nth-child(3)) {
		color: #999999;
		background: #f4f7f9;
		text-align: right;
	}
</style>
