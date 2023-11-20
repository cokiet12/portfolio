<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { devuimode } from '$lib/store.mjs';
	import Legend from '$lib/nested/legend.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	export let winMode = false;

	const consts = {
		plan1: 1,
		plan2: 1,
		option1: [
			{ id: 1, text: '일반제' },
			{ id: 2, text: '시차제1' },
			{ id: 3, text: '시차제2' },
			{ id: 4, text: '시차제3' },
			{ id: 5, text: '시차제4' },
			{ id: 6, text: '시차제5' },
			{ id: 7, text: '보행맵' }
		],
		option2: [
			{ id: 1, text: '계획#1' },
			{ id: 2, text: '계획#2' },
			{ id: 3, text: '계획#3' },
			{ id: 4, text: '계획#4' },
			{ id: 5, text: '계획#5' },
			{ id: 6, text: '계획#6' },
			{ id: 7, text: '계획#7' },
			{ id: 8, text: '계획#8' },
			{ id: 9, text: '계획#9' },
			{ id: 10, text: '계획#10' }
		]
	};
	let stats = {
		lcno: 241,
		sano: 165,
		year: 2010
	};

	$: searchEvent(stats);

	let elems = {
		table1: null, // 현시
		table2: null, // 일계획
		table3: null, // 스플릿
		table4: null, // 주계획
		table5: null // 휴일계획
	};

	// Table
	let table1;
	let table2;
	let table3;
	let table4;
	let table5;

	// Initial Datas
	let iData1;
	let iData2;
	let iData3;
	let iData4;
	let iData5;

	// Datas
	let data1 = [];
	let data2 = [];
	let data3 = [];
	let data4 = [];
	let data5 = [];

	// Selected
	let selected1;
	let selected2;

	// Cells
	// Day
	let cell = function (row, col, prop) {
		let cellProperties = {};
		cellProperties.readOnly = true;
		return cellProperties;
	};

	// Option
	let option1 = {
		colWidths: [30, 20, 30, 30, 30, 30, 30, 30, 30, 30],
		rowHeights: 23,
		renderer: 'html',
		cells: cell,
		renderAllRows: true
	};
	let option2 = {
		colWidths: 30,
		rowHeights: 23,
		renderer: 'html',
		cells: cell,
		renderAllRows: true,
		fixedRowsTop: 1
	};
	let option3 = {
		colWidths: [35, 35, 30, 30, 20, 30, 30, 30, 30, 30, 30, 30, 30],
		rowHeights: 23,
		renderer: 'html',
		cells: cell,
		renderAllRows: true,
		fixedRowsTop: 1
	};
	let option4 = {
		colWidths: [64, 37, 37, 37, 37, 37, 37, 37],
		rowHeights: 23,
		renderer: 'html',
		cells: cell,
		renderAllRows: true
	};
	let option5 = {
		colWidths: [25, 40, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
		rowHeights: 23,
		renderer: 'html',
		cells: cell,
		renderAllRows: true
	};

	// Search Event
	function searchEvent(stat) {
		if (table1 && table2 && table3 && table4 && table5) {
			initAll();
			setTimeout(function () {
				searchPhase();
				searchTod();
			}, 500);
		}
	}

	// DropDown Event
	function DropDownEvent1() {
		consts.plan1 = selected1;
		searchPhase();
	}

	// DropDown Event
	function DropDownEvent2() {
		consts.plan2 = selected2;
		searchTod();
	}

	// 이미지 생성
	function makeImg(num) {
		let result;

		if (num >= 1 && num <= 8) {
			result = `<img class="flowImg" src="images/flows/lcFlow${num}.png" onerror="this.style.display='none';"/>`;
		} else if (num >= 9 && num <= 16) {
			result = `<img class="flowImg" style="transform: rotate(-45deg);" src="images/flows/lcFlow${num}.png" onerror="this.style.display='none';"/>`;
		} else if (num == 17) {
			result = `<img class="flowImg" src="images/flows/lcFlow${num}.png" onerror="this.style.display='none';"/>`;
		} else if (num == 18) {
			result = '무신호';
		} else {
			result = '';
		}

		return result;
	}

	// 기본 옵션 생성(현시정보)
	function makeOption(sort) {
		let optionM;
		let optionC;
		let result = new Object();

		if (sort == 'phase') {
			optionM = [
				{ row: 0, col: 0, rowspan: 1, colspan: 2 },
				{ row: 1, col: 0, rowspan: 4, colspan: 1 },
				{ row: 1, col: 1, rowspan: 2, colspan: 1 },
				{ row: 3, col: 1, rowspan: 2, colspan: 1 }
			];

			result.mergeCells = optionM;
		} else if (sort == 'split') {
			optionM = [
				{ row: 1, col: 0, rowspan: 2, colspan: 1 },
				{ row: 3, col: 0, rowspan: 6, colspan: 1 },
				{ row: 9, col: 0, rowspan: 6, colspan: 1 },
				{ row: 15, col: 0, rowspan: 6, colspan: 1 },
				{ row: 21, col: 0, rowspan: 6, colspan: 1 },
				{ row: 27, col: 0, rowspan: 6, colspan: 1 }
			];

			for (let i = 1; i < 17; i++) {
				optionM.push({ row: i * 2 - 1, col: 1, rowspan: 2, colspan: 1 });
				optionM.push({ row: i * 2 - 1, col: 2, rowspan: 2, colspan: 1 });
				optionM.push({ row: i * 2 - 1, col: 3, rowspan: 2, colspan: 1 });
			}

			optionC = function (row, col, prop) {
				let cellProperties = {};
				if (row > 0) {
					cellProperties.type = 'numeric';
				}
				cellProperties.readOnly = true;
				return cellProperties;
			};

			result.mergeCells = optionM;
			result.cells = optionC;
		} else if (sort == 'holiday') {
			optionM = [
				{ row: 0, col: 0, rowspan: 2, colspan: 1 },
				{ row: 2, col: 0, rowspan: 2, colspan: 1 }
			];
			result.mergeCells = optionM;
		}

		return result;
	}

	// 데이터 생성
	function makeData(res, sort) {
		let _data;

		if (sort == 'phase') {
			_data = [
				['구분', '', '1', '2', '3', '4', '5', '6', '7', '8'],
				['이동류', 'A링', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', ''],
				['', 'B링', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '']
			];
		} else if (sort == 'day') {
			_data = [['번호', '시', '분', '주기인덱스', '옵셋인덱스', '스플릿인덱스']];

			for (let i = 1; i < 17; i++) {
				_data.push([i, '', '', '', '', '', '', '']);
			}
		} else if (sort == 'split') {
			_data = [
				[
					'주기',
					'스플릿',
					'주기',
					'옵셋',
					'링',
					'1현시',
					'2현시',
					'3현시',
					'4현시',
					'5현시',
					'6현시',
					'7현시',
					'8현시'
				]
			];

			for (let i = 0; i < 16; i++) {
				let ci;
				if (i + 1 == 1) {
					ci = 1;
				} else if (1 < i + 1 && i + 1 <= 4) {
					ci = 2;
				} else if (4 < i + 1 && i + 1 <= 7) {
					ci = 3;
				} else if (7 < i + 1 && i + 1 <= 10) {
					ci = 4;
				} else if (10 < i + 1 && i + 1 <= 13) {
					ci = 5;
				} else {
					ci = 6;
				}
				_data.push([ci, i + 1, '', '', '', '', '', '', '', '', '', '', '']);
				_data.push([ci, i + 1, '', '', '', '', '', '', '', '', '', '', '']);
			}
		} else if (sort == 'week') {
			_data = [
				['요일', '일', '월', '화', '수', '목', '금', '토'],
				['플랜', '', '', '', '', '', '', '']
			];
		} else {
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
		}

		if (res) {
			let length;

			if (typeof res == 'object') {
				length = Object.keys(res).length;
			} else {
				length = res.length;
			}

			if (length) {
				if (sort == 'phase') {
					iData1 = res;
					res.forEach((v, i) => {
						if (v.ring == 1) {
							_data[1][v.phaseno + 1] = makeImg(v.flownumber);
							_data[2][v.phaseno + 1] = v.flownumber ? v.flownumber : '';
						} else {
							_data[3][v.phaseno + 1] = makeImg(v.flownumber);
							_data[4][v.phaseno + 1] = v.flownumber ? v.flownumber : '';
						}
					});
				} else if (sort == 'day') {
					iData2 = res;
					res.forEach((v, i) => {
						if (v.sa_cycle && v.sa_offset && v.sa_split) {
							_data[i + 1][1] = v.sa_starthour;
							_data[i + 1][2] = v.sa_startmin;
							_data[i + 1][3] = v.sa_cycle;
							_data[i + 1][4] = v.sa_offset;
							_data[i + 1][5] = v.sa_split;
						}
					});
				} else if (sort == 'split') {
					iData3 = res;
					res.forEach((v, i) => {
						_data[i * 2 + 1][2] = v.sumofa == 0 ? '' : v.sumofa;
						_data[i * 2 + 1][3] = v.sumofa == 0 ? '' : v.offset;

						// A링
						_data[i * 2 + 1][4] = v.sumofa == 0 ? '' : 'A'
						_data[i * 2 + 1][5] = v.asplit1 == 0 ? '' : v.asplit1;
						_data[i * 2 + 1][6] = v.asplit2 == 0 ? '' : v.asplit2;
						_data[i * 2 + 1][7] = v.asplit3 == 0 ? '' : v.asplit3;
						_data[i * 2 + 1][8] = v.asplit4 == 0 ? '' : v.asplit4;
						_data[i * 2 + 1][9] = v.asplit5 == 0 ? '' : v.asplit5;
						_data[i * 2 + 1][10] = v.asplit6 == 0 ? '' : v.asplit6;
						_data[i * 2 + 1][11] = v.asplit7 == 0 ? '' : v.asplit7;
						_data[i * 2 + 1][12] = v.asplit8 == 0 ? '' : v.asplit8;

						// B링
						_data[i * 2 + 2][4] = v.sumofa == 0 ? '' : 'B'
						_data[i * 2 + 2][5] = v.bsplit1 == 0 ? '' : v.bsplit1;
						_data[i * 2 + 2][6] = v.bsplit2 == 0 ? '' : v.bsplit2;
						_data[i * 2 + 2][7] = v.bsplit3 == 0 ? '' : v.bsplit3;
						_data[i * 2 + 2][8] = v.bsplit4 == 0 ? '' : v.bsplit4;
						_data[i * 2 + 2][9] = v.bsplit5 == 0 ? '' : v.bsplit5;
						_data[i * 2 + 2][10] = v.bsplit6 == 0 ? '' : v.bsplit6;
						_data[i * 2 + 2][11] = v.bsplit7 == 0 ? '' : v.bsplit7;
						_data[i * 2 + 2][12] = v.bsplit8 == 0 ? '' : v.bsplit8;
					});
				} else if (sort == 'week') {
					iData4 = res;
					res.forEach((v, i) => {
						_data[1][i + 1] = v.sa_dplan;
					});
				} else {
					iData5 = res;
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
				}
			} else {
				if (sort == 'phase') {
					iData1 = undefined;
				} else if (sort == 'day') {
					iData2 = undefined;
				} else if (sort == 'split') {
					iData3 = undefined;
				} else if (sort == 'week') {
					iData4 = undefined;
				} else {
					iData5 = undefined;
				}
			}
		}

		return _data;
	}

	// TOD 조회
	function searchTod(e) {
		let cnt = 4;
		let isSuccess = new Array(cnt).fill(0);
		let isData = new Array(cnt).fill(0);

		// 일계획
		ajax(`/NTCS_M_SADPLAN/GetBy?SA_NO=${stats.sano}&SA_DPLAN=${consts.plan2}`).then((res1) => {
			if (res1.hasOwnProperty('success')) {
				initData(table2, 'day');
			} else {
				table2.loadData(makeData(res1, 'day'));
				if (!_.isEmpty(res1)) {
					isData[0] = 1;
				}
				isSuccess[0] = 1;
			}
			ajax(`/NTCS_M_TPLAN/GetBy?LCNO=${stats.lcno}&TPLAN=${consts.plan2}`).then((res2) => {
				if (res2.hasOwnProperty('success')) {
					initData('split');
				} else {
					table3.loadData(makeData(res2, 'split'));
					table3.updateSettings(makeOption('split'));
					if (!_.isEmpty(res2)) {
						isData[1] = 1;
					}
					isSuccess[1] = 1;
				}
				ajax(`/NTCS_M_SAWPLAN/GetBy?SA_NO=${stats.sano}`).then((res3) => {
					if (res3.hasOwnProperty('success')) {
						initData(table4, 'week');
					} else {
						table4.loadData(makeData(res3, 'week'));
						if (!_.isEmpty(res3)) {
							isData[2] = 1;
						}
						isSuccess[2] = 1;
					}
					ajax(`/NTCS_M_SAHPLAN/GetBy?SA_NO=${stats.sano}`).then((res4) => {
						if (res4.hasOwnProperty('success')) {
							initData(table5, 'holiday');
						} else {
							table5.loadData(makeData(res4, 'holiday'));
							table5.updateSettings(makeOption('holiday'));
							if (!_.isEmpty(res4)) {
								isData[3] = 1;
							}
							isSuccess[3] = 1;
						}
						// 알림
						if (e) {
							if (!isSuccess[0]) {
								document.isSuccess(res1);
							} else if (!isSuccess[1]) {
								document.isSuccess(res2);
							} else if (!isSuccess[2]) {
								document.isSuccess(res3);
							} else if (!isSuccess[3]) {
								document.isSuccess(res4);
							} else if (!isData[0]) {
								document.isSuccess(res1);
							} else if (!isData[1]) {
								document.isSuccess(res2);
							} else if (!isData[2]) {
								document.isSuccess(res3);
							} else if (!isData[3]) {
								document.isSuccess(res4);
							} else {
								document.isSuccess(stats);
							}
						}
					});
				});
			});
		});
	}

	// 현시 조회
	function searchPhase() {
		ajax(`/ntcs_m_phase/GetBy?lcno=${stats.lcno}&planClss=${consts.plan1}`).then((res) => {
			table1.loadData(makeData(res, 'phase'));
			table1.updateSettings(makeOption('phase'));
		});
	}

	// 전체 조회
	function searchAll(e) {
		searchPhase();
		searchTod(e);
	}

	// 테이블 초기화
	function initData(table, sort) {
		table.loadData(makeData(null, sort));
	}

	// 전체 초기화
	function initAll() {
		initData(table1, 'phase');
		initData(table2, 'day');
		initData(table3, 'split');
		initData(table4, 'week');
		initData(table5, 'holiday');
	}

	onMount(() => {
		searchPhase(null);
		searchTod(null);
	});
</script>

<svelte:options accessors/>
<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="row1">
			<div>
				<Searcher
					bind:value={stats.lcno}
					width="200px"
					onChoose={(no) => {
						stats = no;
					}}
				/>
			</div>
			<div>
				<div class="sel">
					<select bind:value={selected1} on:change={DropDownEvent1} class="static">
						{#each consts.option1 as i}
							<option value={i.id}>
								{i.text}
							</option>
						{/each}
					</select>
				</div>
			</div>
			<div>
				<div class="sel">
					<select bind:value={selected2} on:change={DropDownEvent2} class="static">
						{#each consts.option2 as i}
							<option value={i.id}>
								{i.text}
							</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
		<div class="row2">
			<div class="phase">
				<Legend legend="현시정보" color="#DADDE1">
					<div>
						<Table
							bind:wrapper={elems.table1}
							bind:table={table1}
							data={data1}
							width={'100%'}
							height={'auto'}
							option={option1}
						/>
					</div>
				</Legend>
			</div>
			<div class="day">
				<Legend legend="그룹일계획" color="#DADDE1">
					<div>
						<Table
							bind:wrapper={elems.table2}
							bind:table={table2}
							data={data2}
							width={'100%'}
							height={'116px'}
							option={option2}
						/>
					</div>
				</Legend>
			</div>
			<div class="split">
				<Legend legend="스플릿" color="#DADDE1">
					<div>
						<Table
							bind:wrapper={elems.table3}
							bind:table={table3}
							data={data3}
							width={'100%'}
							height={'459px'}
							option={option3}
						/>
					</div>
				</Legend>
			</div>
			<div class="week">
				<Legend legend="그룹주간계획" color="#DADDE1">
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
			<div class="holiday">
				<Legend legend="그룹휴일계획" color="#DADDE1">
					<div>
						<Table
							bind:wrapper={elems.table5}
							bind:table={table5}
							data={data5}
							width={'100%'}
							height={'96px'}
							option={option5}
						/>
					</div>
				</Legend>
			</div>
		</div>
		<div class="row3">
			<div>
				<div>
					<Button height={'30px'} icon="search" on:click={searchAll}>조회</Button>
					<Button height={'30px'} icon="init" on:click={initAll}>초기화</Button>
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
		max-height: 1400px;
	}
	/* 창모드 (넓이 고정) */
	#main.win {
		width: 1180px;
	}

	/* 카드 */
	.EntireDiv {
		box-shadow: 0px 0px 10px #0000000d;
		/* border: 1px solid #DBE2E6; */
		border-radius: 6px;
		background-color: #212830dd;
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
		padding: 10px;
		min-height: 117px;
	}

	/* ROW */
	#main .row1 {
		display: grid;
		grid-template-columns: 9fr 1fr 1fr;
		grid-column-gap: 10px;
	}

	/* #main .row1 label:nth-child(2) {
            display: grid;
            justify-content: end;
        }

        #main .row1 label:nth-child(3) {
            display: grid;
            justify-content: end;
        } */

	/* ROW */
	#main .row2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto;
		grid-column-gap: 10px;
	}

	/* GRID AREA */
	.EntireDiv .row2 > div.phase {
		grid-area: 1 / 1 / 2 / 2;
	}

	.EntireDiv .row2 > div.day {
		grid-area: 2 / 1 / 3 / 2;
	}

	.EntireDiv .row2 > div.split {
		grid-area: 1 / 2 / 5 / 3;
	}

	.EntireDiv .row2 > div.week {
		grid-area: 3 / 1 / 4 / 2;
	}

	.EntireDiv .row2 > div.holiday {
		grid-area: 4 / 1 / 5 / 2;
	}

	/* 현시 */
	.EntireDiv .row2 > :global(div.phase > fieldset) {
		padding: 0;
		height: 116px;
	}

	.EntireDiv .row2 :global(div.phase > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 116px;
		overflow: hidden;
	}

	/* 일계획 */
	.EntireDiv .row2 > :global(div.day > fieldset) {
		padding: 0;
		height: 116px;
	}

	.EntireDiv .row2 :global(div.day > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 116px;
		overflow: hidden;
	}

	/* 스플릿 */
	.EntireDiv .row2 > :global(div.split > fieldset) {
		padding: 0;
		height: 459px;
	}

	.EntireDiv .row2 :global(div.split > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 459px;
		overflow: hidden;
	}

	/* 주간계획 */
	.EntireDiv .row2 > :global(div.week > fieldset) {
		padding: 0;
		height: 47px;
	}

	.EntireDiv .row2 :global(div.week > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 47px;
		overflow: hidden;
	}

	/* 휴일계획 */
	.EntireDiv .row2 > :global(div.holiday > fieldset) {
		padding: 0;
		height: 93px;
	}

	.EntireDiv .row2 :global(div.holiday > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 93px;
		overflow: hidden;
	}

	/* Button */
	.EntireDiv .row3 > div {
		display: grid;
		grid-template-columns: auto 70px;
	}

	.EntireDiv .row3 > div div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 70px;
		grid-column-gap: 5px;
	}

	/* DropDown */
	.sel {
		position: relative;
		overflow: hidden;

		height: 32px;
		font-size: 1.3rem;
		border-radius: 4px;
		/* border: 1px solid #DADDE1; */
		/* background-color: white; */
	}
	.sel > select {
		width: 100%;
		height: calc(100% - 1px);
		padding: 0 9px;
		border: none;
		margin: 0;
		color: #eee;
		background-color: #14181d;
		font-size: 1.3rem;
	}

	/* Image */
	#main :global(.flowImg) {
		width: 17px;
		line-height: 17px;
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

	/* 현시정보 HANDSONTABLE */
	.EntireDiv .row2 > :global(div.phase > fieldset > div .handsontable tr:first-child td),
	.EntireDiv .row2 > :global(div.phase > fieldset > div .handsontable tr td:nth-child(1)),
	.EntireDiv .row2 > :global(div.phase > fieldset > div .handsontable tr td:nth-child(2)) {
		color: #666;
		background: #181d23;
	}

	/* 일계획 HANDSONTABLE */
	.EntireDiv .row2 > :global(div.day > fieldset > div .handsontable tr:first-child td) {
		color: #666;
		background: #181d23;
	}

	/* 주계획 HANDSONTABLE */
	.EntireDiv .row2 > :global(div.week > fieldset > div .handsontable tr:first-child td),
	.EntireDiv .row2 > :global(div.week > fieldset > div .handsontable tr td:nth-child(1)) {
		color: #666;
		background: #181d23;
	}

	/* 휴일계획 HANDSONTABLE */
	.EntireDiv .row2 > :global(div.holiday > fieldset > div .handsontable tr td:nth-child(1)),
	.EntireDiv .row2 > :global(div.holiday > fieldset > div .handsontable tr td:nth-child(2)) {
		color: #666;
		background: #181d23;
	}

	/* 스플릿 HANDSONTABLE */
	.EntireDiv .row2 > :global(div.split > fieldset > div .tableWrapper tr:first-child td) {
		color: #666;
		background: #181d23;
	}

	.EntireDiv .row2 > :global(div.split > fieldset > div .tableWrapper td) {
		text-align: center !important;
	}

	.EntireDiv :global(.handsontable td) {
		color: #999999;
		background-color: #212830;
	}

	/* #main :global(.handsontable tr th) {
        color: #666;
        background: #181D23;
    }

    #main :global(.handsontable tr td) {
        color: #999999;
        background: #212830;
    } */

	/* scroll */
	#main :global(::-webkit-scrollbar) {width: 7px;height: 7px; background-color: rgba(0, 0, 0, 0.7);}
	#main :global(::-webkit-scrollbar-thumb) {background-color:rgba(126, 126, 126, 0.7); border-radius: 2px;}
</style>
