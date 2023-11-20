<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Legend from '$lib/nested/legend.svelte';
	import Table from '$lib/nested/table.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	const consts = {};
	export let stats = {
		lcno: 1,
		sano: 1,
		year: 2010
	};

	$: searchEvent(stats);

	let elems = {
		table1: null
	};
	// Table
	export let table1;

	// Initial Datas
	let iData;

	// Datas
	let data1 = [];

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

	// Search Event
	function searchEvent(stat) {
		if (table1) {
			initData();

			setTimeout(function () {
				searchData();
			}, 500);
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
				initData();
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
	function initData() {
		table1.loadData(makeData(null));
		table1.updateSettings(makeOption());
	}

	// DB업다운로드
	function upDownData(e) {
		document.createWindow('dbUpDown', false, e, { tabValue: 7, stats: stats });
	}

	// DB저장
	function saveData() {
		let temp = table1.getSourceData(2, 1, 33, 32);
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
			v.conflictyn = Number(temp[v.yno][v.xno]);
		});

		ajax(`/ntcs_m_conflict/local?lcNo=${stats.lcno}`, 'PUT', jsonArray).then((res) => {
			document.isSuccess(res);
		});
	}

	// 초기 조회
	onMount(() => {
		// 센터
		searchData();
	});
</script>

<div class="tabPage">
	<div class="tabContent">
		<Legend legend="방향별 출력맵" color="#DADDE1">
			<div>
				<Table
					bind:wrapper={elems.table1}
					bind:table={table1}
					data={data1}
					width={'100%'}
					height={'538px'}
					{option}
				/>
			</div>
		</Legend>
	</div>
	<div class="tabButton">
		<div>
			<Button icon="search" on:click={searchData}>조회</Button>
			<Button icon="init" on:click={initData}>초기화</Button>
			<Button icon="save2db" on:click={saveData}>DB저장</Button>
		</div>
		<div>
			<Button colored={true} on:click={upDownData}>DB업다운로드</Button>
		</div>
	</div>
</div>

<style>
	.tabPage {
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
	}

	.tabPage .tabContent :global(fieldset) {
		padding: 0;
		height: 538px;
	}

	.tabPage .tabContent :global(fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 538px;
		overflow: hidden;
	}

	/* 버튼 */
	.tabButton {
		display: grid;
		grid-template-columns: 2fr 1fr;
	}

	.tabButton > div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 80px 90px;
		grid-column-gap: 5px;
	}

	.tabButton > div:nth-child(2) {
		display: grid;
		grid-template-columns: 100px;
		justify-content: end;
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
		height: 14.8px !important;
		padding: 0;
	}
</style>
