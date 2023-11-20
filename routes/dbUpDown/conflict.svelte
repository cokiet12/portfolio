<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Legend from '$lib/nested/legend.svelte';
	import Table from '$lib/nested/table.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax, NsetLog, cbUrl_success, cbUrl_fail } from '$lib/js/functions.mjs';
	import { userId, userLev } from '$lib/store.mjs';
	import _ from 'lodash';

	const consts = {};
	export let stats = {
		lcno: 1,
		sano: 1,
		year: 2010
	};

	$: searchEvent(stats);
	console.log('testsetse');
	console.log($userLev);
	let elems = {
		table1: null,
		table2: null
	};
	// Table
	export let table1;
	export let table2;

	// Initial Datas
	let iData;

	// Datas
	let data1 = [];
	let data2 = [];

	// Option
	let widths = new Array();
	widths.push(50);

	for (let i = 0; i < 32; i++) {
		widths.push(16);
	}

	let option = {
		colWidths: widths,
		rowHeights: 15,
		renderer: 'html',
		renderAllRows: true
	};

	// Compare
	let compare = [[]];

	// Search Event
	function searchEvent(stat) {
		if (table1) {
			initData(table1);

			setTimeout(function () {
				searchData();
			}, 500);
		}

		if (table2) {
			initData(table2);
		}
	}

	// 데이터 생성
	function makeData(res) {
		let _data;
		let header1 = ['LSU'];
		let header2 = ['출력'];
		let temp1 = [];

		for (let i = 1; i < 17; i++) {
			header1.push(i, '');
			header2.push(1, 2);
		}

		temp1.push(header1);
		temp1.push(header2);

		for (let i = 1; i < 33; i++) {
			let x = new Array();
			for (let j = 1; j < 33; j++) {
				x.push('');
			}
			temp1.push(x);
		}

		for (let i = 2; i < 34; i += 2) {
			temp1[i].unshift(i / 2 + '-1');
			temp1[i + 1].unshift(i / 2 + '-2');
		}

		_data = temp1;

		if (res) {
			let length;

			if (typeof res == 'object') {
				length = Object.keys(res).length;
			} else {
				length = res.length;
			}

			if (length) {
				iData = res;
				res.forEach((v, i) => {
					if (v.conflictyn == 0) {
						_data[v.yno + 2][v.xno + 1] = '';
					} else {
						_data[v.yno + 2][v.xno + 1] = v.conflictyn;
					}
				});
			} else {
				iData = undefined;
			}
		}

		return _data;
	}

	// 기본 옵션 생성
	function makeOption() {
		const grayRenderer = function (instance, td, row, col, prop, value, cellProperties) {
			Handsontable.renderers.TextRenderer.apply(this, arguments);
			td.style.backgroundColor = '#555';
			td.style.color = '#FFF';
		};
		let optionM = new Array();
		let optionC;

		for (let i = 1; i < 33; i += 2) {
			optionM.push({ row: 0, col: i, rowspan: 1, colspan: 2 });
		}

		optionC = function (row, col, prop) {
			let cellProperties = {};
			for (let i = 2; i < 34; i++) {
				if (row == i) {
					if (col > 0 && col <= i - 1) {
						cellProperties.renderer = grayRenderer;
					}
				}
			}
			cellProperties.readOnly = true;
			return cellProperties;
		};

		return { mergeCells: optionM, cells: optionC };
	}

	// 조회
	function searchData(e) {
		let cnt = 1;
		let isSuccess = new Array(cnt).fill(0);
		let isData = new Array(cnt).fill(0);

		ajax(`/ntcs_m_conflict/${stats.lcno}`).then((res) => {
			if (res.hasOwnProperty('success')) {
				initData(table1);
			} else {
				table1.loadData(makeData(res));
				table1.updateSettings(makeOption());
				if (!_.isEmpty(res)) {
					isData[0] = 1;
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

	// 초기화
	function initData(table) {
		table.loadData(makeData(null));
		table.updateSettings(makeOption());
	}

	// 편집
	function editData(e) {
		document.createWindow('dbEdit', false, e, { tabValue: 8, stats: stats });
	}

	// 검증
	function compareData() {
		// "" == null == undefined 를 비교하는건 무의미
		// 두 테이블 전부 다 "", null, undefined 이면, 비교 X
		// 한 테이블이라도 숫자나 유효한 문자가 있으면 비교 O
		let temp1 = new Array();

		let center = table1.getSourceData();
		let local = table2.getSourceData();

		// 초기화
		for (let i in compare[0]) {
			table1.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', '');
			table2.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', '');
		}

		compare = [];

		// 검증
		for (let i = 2; i < 34; i++) {
			for (let j = 1; j < 33; j++) {
				let diff1 = new Object();
				if (center[i][j] !== local[i][j]) {
					diff1.row = i;
					diff1.col = j;
					temp1.push(diff1);
				}
			}
		}

		compare.push(temp1);

		// 적용
		for (let i in compare[0]) {
			table1.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', 'diff');
			table2.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', 'diff');
		}

		// Render
		table1.render();
		table2.render();
	}

	// 동기화(TCP)
	function downloadData() {
		document.callTcp('/conflict_dw', [stats.lcno], (res) => {
			if (res.done && res[0].ok == 1) {
				const result = cbUrl_success('/conflict_dw', stats.lcno);
				const json = NsetLog({ data: result });
				ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
			} else {
				if (!res.done) {
					const result = cbUrl_fail('/conflict_dw', stats.lcno);
					const json = NsetLog({ data: result });
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				}
			}
		});
	}

	// 업로드(TCP)
	function uploadData() {
		document.callTcp('/conflict_up', [stats.lcno], (res) => {
			if (res[0].data) {
				console.log('모순맵 : ', res);
				if (res.done && res[0].ok == 1) {
					table2.loadData(makeData(res[0].data.data));
					table2.updateSettings(makeOption());
					const result = cbUrl_success('/conflict_up', stats.lcno);
					const json = NsetLog({ data: result });
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				}
			} else {
				if (!res.done) {
					const result = cbUrl_fail('/conflict_up', stats.lcno);
					const json = NsetLog({ data: result });
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				}
			}
		});
	}

	// DB저장
	function saveData() {
		let temp = table2.getSourceData(2, 1, 33, 32);
		let jsonArray = [];

		for (let i = 0; i < 32; i++) {
			for (let j = 0; j < 32; j++) {
				let json = new Object();
				json.lcno = stats.lcno;
				json.yno = i;
				json.xno = j;
				json.conflictyn = 0;

				jsonArray.push(json);
			}
		}

		jsonArray.forEach((v, i) => {
			v.conflictyn = temp[v.yno][v.xno];
		});

		ajax(`/ntcs_m_conflict/local?lcNo=${stats.lcno}`, 'PUT', jsonArray).then((res) => {
			document.isSuccess(res);
			if (res.success) {
				const json = NsetLog({
					data: [
						4,
						14,
						231,
						0,
						$userId,
						stats.lcno,
						document.lcCon.LCs[stats.lcno].lcname,
						'모순맵 저장성공'
					]
				});
				ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
			} else {
				const json = NsetLog({
					data: [
						4,
						14,
						231,
						0,
						$userId,
						stats.lcno,
						document.lcCon.LCs[stats.lcno].lcname,
						'모순맵 저장실패'
					]
				});
				ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
			}
		});
	}

	// 초기 조회
	onMount(() => {
		// 센터
		searchData();

		// 로컬
		initData(table2);
	});
</script>

<div class="tabPage">
	<div class="tabContent">
		<Legend legend="<image style='margin-right: 5px' src='/svg/center.svg' />센터" color="#80CE8C">
			<div>
				<Table
					bind:wrapper={elems.table1}
					bind:table={table1}
					data={data1}
					width={'100%'}
					height={'580px'}
					{option}
				/>
			</div>
		</Legend>
	</div>
	<div class="tabContent">
		<Legend legend="<image style='margin-right: 5px' src='/svg/local.svg' />로컬" color="#86B5DE">
			<div>
				<Table
					bind:wrapper={elems.table2}
					bind:table={table2}
					data={data2}
					width={'100%'}
					height={'580px'}
					{option}
				/>
			</div>
		</Legend>
	</div>
	<div class="tabButton">
		<div class="center">
			<div>
				<Button icon="search" on:click={searchData}>조회</Button>
				<Button icon="init" on:click={initData(table1)}>초기화</Button>
				<Button icon="edit" on:click={editData}>편집</Button>
				<Button icon="compare" on:click={compareData}>검증</Button>
			</div>
		</div>
	</div>
	<div class="tabButton">
		<div class="local">
			<div>
				<Button colored={true} icon="sync" on:click={downloadData}>동기화</Button>
			</div>
			<div>
				<Button icon="upload" on:click={uploadData}>업로드</Button>
				<Button icon="init" on:click={initData(table2)}>초기화</Button>
				<Button icon="save2db" on:click={saveData}>DB저장</Button>
			</div>
		</div>
	</div>
</div>

<style>
	.tabPage {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto;
		grid-column-gap: 10px;
		grid-row-gap: 10px;
	}

	.tabPage .tabContent :global(fieldset) {
		padding: 0;
		height: 545px;
	}

	.tabPage .tabContent :global(fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 545px;
		overflow: hidden;
	}

	/* 버튼 */
	/* 센터 */
	.tabButton > div.center {
		display: grid;
		grid-template-columns: 2fr 1fr;
	}

	.tabButton > div.center div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 80px 70px 70px;
		grid-column-gap: 5px;
	}

	.tabButton > div.center div:nth-child(2) {
		display: grid;
		justify-content: end;
	}

	.tabButton > div.center div:nth-child(2) :global(button) {
		width: 100px;
	}

	/* 로컬 */
	.tabButton > div.local {
		display: grid;
		grid-template-columns: 1fr 2fr;
	}

	.tabButton > div.local div:nth-child(1) {
		display: grid;
	}

	.tabButton > div.local div:nth-child(1) :global(button) {
		width: 100px;
	}

	.tabButton > div.local div:nth-child(2) {
		display: grid;
		justify-content: end;
		grid-template-columns: 80px 80px 90px;
		grid-column-gap: 5px;
	}

	/* Headers */
	.tabPage .tabContent :global(.handsontable tr:first-child td),
	.tabPage .tabContent :global(.handsontable tr:nth-child(2) td),
	.tabPage .tabContent :global(.handsontable tr td:nth-child(1)) {
		color: #999999;
		background: #f4f7f9;
	}

	/* 모순맵 Font-Size, Height */
	.tabPage .tabContent :global(.handsontable td) {
		font-size: smaller;
		height: 15px !important;
		padding: 0;
	}

	/* Compare */
	.tabPage .tabContent :global(.handsontable td.diff) {
		background-color: orangered !important;
		color: white !important;
	}
</style>
