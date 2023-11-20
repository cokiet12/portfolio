<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Legend from '$lib/nested/legend.svelte';
	import Table from '$lib/nested/table.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	const consts = {
		plan: 0,
		option: [
			{ id: 0, text: '계획#1' },
			{ id: 1, text: '계획#2' },
			{ id: 2, text: '계획#3' },
			{ id: 3, text: '계획#4' },
			{ id: 4, text: '계획#5' },
			{ id: 5, text: '계획#6' },
			{ id: 6, text: '계획#7' },
			{ id: 7, text: '계획#8' },
			{ id: 8, text: '계획#9' },
			{ id: 9, text: '계획#10' }
		]
	};
	export let stats = {
		lcno: 1,
		sano: 1,
		year: 2010
	};

	$: searchEvent(stats);

	let elems = {
		table1: null,
		table2: null,
		table3: null,
		table4: null
	};
	// Selected
	let selected = 0;

	// Table
	// Day
	export let table1;
	// Week
	export let table2;
	// Holiday
	export let table3;
	// Cycle
	export let table4;

	// Initial Datas
	let iData1;
	let iData2;
	let iData3;
	let iData4;

	// Datas
	let data1 = [];
	let data2 = [];
	let data3 = [];
	let data4 = [];

	// Cells
	// Day
	let optionC1 = function (row, col, prop) {
		let cellProperties = {};
		if (col == 7 && row > 0) {
			cellProperties.type = 'checkbox';
		}
		if (row == 0 || col == 0 || col == 4) {
			cellProperties.readOnly = true;
		}
		return cellProperties;
	};
	// Week
	let optionC2 = function (row, col, prop) {
		let cellProperties = {};
		if (row == 0 || col == 0) {
			cellProperties.readOnly = true;
		}
		return cellProperties;
	};
	// Holiday
	let optionC3 = function (row, col, prop) {
		let cellProperties = {};
		if (col < 2) {
			cellProperties.readOnly = true;
		}
		return cellProperties;
	};
	// Cycle
	let optionC4 = function (row, col, prop) {
		let cellProperties = {};
		if (col == 3 && row > 0) {
			cellProperties.type = 'checkbox';
		}
		if (row == 0 || col == 0) {
			cellProperties.readOnly = true;
		}
		return cellProperties;
	};

	// Option
	let option1 = {
		height: '116px',
		colWidths: 30,
		rowHeights: 23,
		renderer: 'html',
		cells: optionC1,
		renderAllRows: true,
		fixedRowsTop: 1
	};

	let option2 = {
		colWidths: [64, 37, 37, 37, 37, 37, 37, 37],
		rowHeights: 23,
		renderer: 'html',
		cells: optionC2,
		renderAllRows: true
	};

	let option3 = {
		colWidths: [20, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
		rowHeights: 23,
		renderer: 'html',
		cells: optionC3,
		renderAllRows: true
	};

	let option4 = {
		colWidths: 30,
		rowHeights: 23,
		renderer: 'html',
		cells: optionC4,
		renderAllRows: true
	};

	// Search Event
	function searchEvent(stat) {
		if (table1 && table2 && table3 && table4) {
			initAll();

			setTimeout(function () {
				searchData();
			}, 500);
		}
	}

	function TrueFalse(a) {
		if (a == 1) return true;
		else {
			return false;
		}
	}

	// DropDown Event
	function DropDownEvent() {
		consts.plan = selected;
		searchData();
	}

	// 데이터 생성
	function makeData(res, sort, cycleData) {
		let _data;
		if (sort == 'day') {
			_data = [
				['번호', '시', '분', '주기인덱스', '주기길이', '옵셋인덱스', '스플릿인덱스', 'TRC사용']
			];

			for (let i = 1; i < 17; i++) {
				_data.push([i, '', '', '', '', '', '', '']);
			}
		} else if (sort == 'week') {
			_data = [
				['요일', '일', '월', '화', '수', '목', '금', '토'],
				['플랜', '', '', '', '', '', '', '']
			];
		} else if (sort == 'holiday') {
			_data = [
				['#1', '월/일'],
				['', '플랜'],
				['#2', '월/일'],
				['', '플랜']
			];

			for (let i = 0; i < 15; i++) {
				_data[0].push('');
				_data[1].push('');
				_data[2].push('');
				_data[3].push('');
			}
		} else {
			_data = [
				['인덱스', '주기길이', '그룹유출입비', '사용여부'],
				[1, '', '', ''],
				[2, '', '', ''],
				[3, '', '', ''],
				[4, '', '', ''],
				[5, '', '', ''],
				[6, '', '', '']
			];
		}

		if (res) {
			let length;

			if (typeof res == 'object') {
				length = Object.keys(res).length;
			} else {
				length = res.length;
			}

			if (length) {
				if (sort == 'day') {
					iData1 = res;
					res.forEach((v, i) => {
						if (v.sa_cycle && v.sa_offset && v.sa_split) {
							_data[i + 1][1] = v.sa_starthour;
							_data[i + 1][2] = v.sa_startmin;
							_data[i + 1][3] = v.sa_cycle;
							_data[i + 1][4] = cycleData.filter(
								(value) => value.aplanindex === v.sa_cycle
							)[0].cyclelength;
							_data[i + 1][5] = v.sa_offset;
							_data[i + 1][6] = v.sa_split;
							_data[i + 1][7] = TrueFalse(v.sa_todauto);
						}
					});
				} else if (sort == 'week') {
					iData2 = res;
					res.forEach((v, i) => {
						_data[1][i + 1] = v.sa_dplan;
					});
				} else if (sort == 'holiday') {
					iData3 = res;
					res.forEach((v, i) => {
						let mon;
						let day;
						if (v.sa_mon && v.sa_day) {
							mon = v.sa_mon < 10 ? '0' + v.sa_mon : v.sa_mon;
							day = v.sa_day < 10 ? '0' + v.sa_day : v.sa_day;

							if (v.sa_hplanindex < 16) {
								_data[0][i + 2] = mon + '/' + day;
								_data[1][i + 2] = v.sa_dplan;
							} else {
								_data[2][i + 2] = mon + '/' + day;
								_data[3][i + 2] = v.sa_dplan;
							}
						}
					});
				} else {
					iData4 = res;
					res.forEach((v, i) => {
						if (v.cyclelength) {
							_data[i + 1][1] = v.cyclelength;
							_data[i + 1][2] = v.ioratio;
							_data[i + 1][3] = TrueFalse(v.active);
						}
					});
				}
			} else {
				if (sort == 'day') {
					iData1 = undefined;
				} else if (sort == 'week') {
					iData2 = undefined;
				} else if (sort == 'holiday') {
					iData3 = undefined;
				} else {
					iData4 = undefined;
				}
			}
		}

		return _data;
	}

	// 조회
	function searchData(e) {
		let cnt = 4;
		let isSuccess = new Array(cnt).fill(0);
		let isData = new Array(cnt).fill(0);

		ajax(`/NTCS_M_SAWPLAN/GetBy?SA_NO=${stats.sano}`).then((res2) => {
			if (res2.hasOwnProperty('success')) {
				initData(table2, 'week');
			} else {
				table2.loadData(makeData(res2, 'week'));
				if (!_.isEmpty(res2)) {
					isData[1] = 1;
				}
				isSuccess[1] = 1;
			}
			ajax(`/NTCS_M_SAHPLAN/GetBy?SA_NO=${stats.sano}`).then((res3) => {
				if (res3.hasOwnProperty('success')) {
					initData(table3, 'holiday');
				} else {
					let optionM = [
						{ row: 0, col: 0, rowspan: 2, colspan: 1 },
						{ row: 2, col: 0, rowspan: 2, colspan: 1 }
					];
					table3.loadData(makeData(res3, 'holiday'));
					table3.updateSettings({ mergeCells: optionM });
					if (!_.isEmpty(res3)) {
						isData[2] = 1;
					}
					isSuccess[2] = 1;
				}
				ajax(`/NTCS_M_SAAPLAN/GetBy?SA_NO=${stats.sano}&APLAN=${consts.plan}`).then((res4) => {
					if (res4.hasOwnProperty('success')) {
						initData(table4, 'cycle');
					} else {
						table4.loadData(makeData(res4, 'cycle'));
						if (!_.isEmpty(res4)) {
							isData[3] = 1;
						}
						isSuccess[3] = 1;
					}
					ajax(`/NTCS_M_SADPLAN/GetBy?SA_NO=${stats.sano}&SA_DPLAN=${consts.plan}`).then((res1) => {
						if (res1.hasOwnProperty('success')) {
							initData(table1, 'day');
						} else {
							table1.loadData(makeData(res1, 'day', res4));
							if (!_.isEmpty(res1)) {
								isData[0] = 1;
							}
							isSuccess[0] = 1;
						}
						// 알림
						if (e) {
							if (!isSuccess[1]) {
								document.isSuccess(res2);
							} else if (!isSuccess[2]) {
								document.isSuccess(res3);
							} else if (!isSuccess[3]) {
								document.isSuccess(res4);
							} else if (!isSuccess[0]) {
								document.isSuccess(res1);
							} else if (!isData[1]) {
								document.isSuccess(res2);
							} else if (!isData[2]) {
								document.isSuccess(res3);
							} else if (!isData[3]) {
								document.isSuccess(res4);
							} else if (!isData[0]) {
								document.isSuccess(res1);
							} else {
								document.isSuccess(stats);
							}
						}
					});
				});
			});
		});
	}

	// 테이블 초기화
	function initData(table, sort) {
		table.loadData(makeData(null, sort));
	}

	// 전체 초기화
	function initAll() {
		initData(table1, 'day');
		initData(table2, 'week');
		initData(table3, 'holiday');
		initData(table4, 'cycle');
	}

	// DB업다운로드
	function upDownData(e) {
		document.createWindow('dbUpDown', false, e, { tabValue: 4, stats: stats });
	}

	// DB저장
	function saveData() {
		let temp1 = table1.getSourceData(1, 0, 16, 7);
		let temp2 = table2.getSourceData(1, 1, 1, 7);
		let temp3 = table3.getSourceData(0, 2, 3, 16);
		let temp4 = table4.getSourceData(1, 0, 6, 3);

		let day = [];
		let week = [];
		let holiday = [];
		let cycle = [];

		temp1.forEach((v, i) => {
			let json = new Object();
			if (iData1) {
				json.datamodetype = 2;
			} else {
				json.datamodetype = 1;
			}
			json.sa_no = stats.sano;
			json.sa_dplan = consts.plan;
			json.sa_dplanindex = v[0];
			json.sa_starthour = v[1] == '' ? 0 : Number(v[1]);
			json.sa_startmin = v[2] == '' ? 0 : Number(v[2]);
			json.sa_cycle = v[3] == '' ? 0 : Number(v[3]);
			json.sa_offset = v[5] == '' ? 0 : Number(v[5]);
			json.sa_split = v[6] == '' ? 0 : Number(v[6]);
			json.sa_todauto = v[7] == '' ? false : v[7];

			day.push(json);
		});

		temp2[0].forEach((v, i) => {
			let json = new Object();
			if (iData2) {
				json.datamodetype = 2;
			} else {
				json.datamodetype = 1;
			}
			json.sa_no = stats.sano;
			json.sa_week = i;
			json.sa_dplan = Number(v);

			week.push(json);
		});

		for (let i = 0; i < 15; i++) {
			let json1 = new Object();
			let json2 = new Object();
			if (iData3) {
				json1.datamodetype = 2;
				json2.datamodetype = 2;
			} else {
				json1.datamodetype = 1;
				json2.datamodetype = 1;
			}
			json1.sa_no = stats.sano;
			json1.sa_hplanindex = i + 1;
			if (temp3[0][i] == '') {
				json1.sa_mon = 0;
				json1.sa_day = 0;
			} else {
				json1.sa_mon = Number(temp3[0][i].split('/')[0]);
				json1.sa_day = Number(temp3[0][i].split('/')[1]);
			}

			json1.sa_dplan = temp3[1][i] == '' ? 0 : Number(temp3[1][i]);

			json2.sa_no = stats.sano;
			json2.sa_hplanindex = i + 16;
			if (temp3[2][i] == '') {
				json2.sa_mon = 0;
				json2.sa_day = 0;
			} else {
				json2.sa_mon = Number(temp3[2][i].split('/')[0]);
				json2.sa_day = Number(temp3[2][i].split('/')[1]);
			}
			json2.sa_dplan = temp3[3][i] == '' ? 0 : Number(temp3[3][i]);

			holiday.push(json1);
			holiday.push(json2);
		}

		temp4.forEach((v, i) => {
			let json = new Object();
			if (iData4) {
				json.datamodetype = 2;
			} else {
				json.datamodetype = 1;
			}
			json.sa_no = stats.sano;
			json.aplan = consts.plan;
			json.aplanindex = v[0];
			json.cyclelength = v[1] == '' ? 0 : Number(v[1]);
			json.ioratio = v[2] == '' ? 0 : Number(v[2]);
			json.active = v[3] == '' ? false : Number(v[3]);

			cycle.push(json);
		});

		let jsonArray = [{}];
		jsonArray[0].saaplan = cycle;
		jsonArray[0].sadplan = day;
		jsonArray[0].sahplan = holiday;
		jsonArray[0].sawplan = week;

		ajax(`/NTCS_M_SAAPLAN/UpdateManyCustom`, 'PUT', jsonArray).then((res) => {
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
		<div class="day">
			<Legend legend="그룹일계획" color="#DADDE1">
				<div>
					<Table
						bind:wrapper={elems.table1}
						bind:table={table1}
						data={data1}
						width={'100%'}
						height={'116px'}
						option={option1}
					/>
				</div>
			</Legend>
		</div>
		<div class="week">
			<Legend legend="그룹주간계획" color="#DADDE1">
				<div>
					<Table
						bind:wrapper={elems.table2}
						bind:table={table2}
						data={data2}
						width={'100%'}
						height={'auto'}
						option={option2}
					/>
				</div>
			</Legend>
		</div>
		<div class="holiday">
			<Legend legend="그룹휴일계획" color="#DADDE1">
				<div>
					<Table
						bind:wrapper={elems.table3}
						bind:table={table3}
						data={data3}
						width={'100%'}
						height={'96px'}
						option={option3}
					/>
				</div>
			</Legend>
		</div>
		<div class="cycle">
			<Legend legend="그룹주기계획" color="#DADDE1">
				<div>
					<Table
						bind:wrapper={elems.table4}
						bind:table={table4}
						data={data4}
						width={'100%'}
						height={'auto'}
						option={option4}
					/>
				</div>
			</Legend>
		</div>
	</div>
	<div class="tabButton">
		<div>
			<Button icon="search" on:click={searchData}>조회</Button>
			<Button icon="init" on:click={initAll}>초기화</Button>
			<Button icon="save2db" on:click={saveData}>DB저장</Button>
			<div class="sel">
				<select bind:value={selected} on:change={DropDownEvent} class="static">
					{#each consts.option as i}
						<option value={i.id}>
							{i.text}
						</option>
					{/each}
				</select>
			</div>
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

	/* 일계획 */
	.tabPage .tabContent > :global(div.day > fieldset) {
		padding: 0;
		height: 116px;
	}

	.tabPage .tabContent :global(div.day > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 116px;
		overflow: hidden;
	}

	/* 주간계획 */
	.tabPage .tabContent > :global(div.week > fieldset) {
		padding: 0;
		height: 47px;
	}

	.tabPage .tabContent :global(div.week > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 47px;
		overflow: hidden;
	}

	/* 휴일계획 */
	.tabPage .tabContent > :global(div.holiday > fieldset) {
		padding: 0;
		height: 93px;
	}

	.tabPage .tabContent :global(div.holiday > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 93px;
		overflow: hidden;
	}

	/* 주기계획 */
	.tabPage .tabContent > :global(div.cycle > fieldset) {
		padding: 0;
		height: 162px;
	}

	.tabPage .tabContent :global(div.cycle > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 162px;
		overflow: hidden;
	}

	/* 버튼 */
	.tabButton {
		display: grid;
		grid-template-columns: 2fr 1fr;
	}

	.tabButton > div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 80px 90px 100px;
		grid-column-gap: 5px;
	}

	.tabButton > div:nth-child(2) {
		display: grid;
		grid-template-columns: 100px;
		justify-content: end;
	}

	/* Headers */
	/* 일계획 */
	.tabPage .tabContent > :global(div.day > fieldset .handsontable tr:first-child td),

    /* 주계획 */
    .tabPage .tabContent > :global(div.week > fieldset .handsontable tr:first-child td),
    .tabPage .tabContent > :global(div.week > fieldset .handsontable tr td:nth-child(1)),
    
    /* 특수일계획 */
    .tabPage .tabContent > :global(div.holiday > fieldset .handsontable tr td:nth-child(1)),
    .tabPage .tabContent > :global(div.holiday > fieldset .handsontable tr td:nth-child(2)),
    
    /* 주기계획 */
    .tabPage .tabContent > :global(div.cycle > fieldset .handsontable tr:first-child td) {
		color: #999999;
		background: #f4f7f9;
	}

	/* DropDown */
	.sel {
		position: relative;
		overflow: hidden;

		height: 32px;
		font-size: 1.3rem;
		border-radius: 4px;
		border: 1px solid #dadde1;
		background-color: white;
	}

	.sel > select {
		width: 100%;
		height: calc(100% - 1px);
		padding: 0 5px;
		border: none;
		margin: 0;
		color: #0584fe;
		font-size: 1.3rem;
	}
</style>
