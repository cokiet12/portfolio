<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Legend from '$lib/nested/legend.svelte';
	import Table from '$lib/nested/table.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	export let id;

	const consts = {
		plan: 0,
		option: [
			{ id: 0, text: '일반제' },
			{ id: 1, text: '시차제1' },
			{ id: 2, text: '시차제2' },
			{ id: 3, text: '시차제3' },
			{ id: 4, text: '시차제4' },
			{ id: 5, text: '시차제5' },
			{ id: 6, text: '보행맵' }
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
		table2: null
	};
	// Selected
	let selected = 0;

	// Table
	export let table1;
	export let table2;

	// Initial Datas
	let iData;

	// Datas
	// 센터
	let data1 = [];
	let data2 = [];

	// Option
	let option = {
		height: '250px',
		colWidths: [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 35, 35, 35],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		afterChange: function (src, changes) {
			if (changes === 'edit') {
				let row = src[0][0];
				let col = src[0][1];
				let value = src[0][3];
				if (col == 19) {
					if (value) {
						this.setCellMeta(row, col, 'className', 'eop');
					} else {
						this.setCellMeta(row, col, 'className', '');
					}
					this.render();
				}
			}
		},
		afterLoadData: async function (data, init, src) {
			if (src == undefined) {
				let table = await this;
				data.forEach((v, i) => {
					if (i > 1 && v[19] == true) {
						for (let j = 1; j < 20; j++) {
							table.setCellMeta(i, j, 'className', 'eop');
						}
						table.render();
					}
				});
			}
		}
	};

	// Compare
	let compare = [[], []];

	// Search Event
	function searchEvent(stat) {
		if (table1 && table2) {
			initAll();

			setTimeout(function () {
				searchData();
			}, 500);
		}
	}

	// DropDown Event
	function DropDownEvent() {
		consts.plan = selected;
		searchData();
	}

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

	// 0을 ''로 변경
	function oton(value) {
		let temp = value === 0 ? '' : value;

		return temp;
	}

	// ''을 0로 변경
	function ntoo(arr) {
		let res = JSON.parse(JSON.stringify(arr));

		for (let i in res) {
			if (res[i] == '') {
				res[i] = 0;
			} else if (res[i] == 'false') {
				res[i] = 0;
			} else if (res[i] == 'true') {
				res[i] = 1;
			} else {
				res[i] = Number(res[i]);
			}
		}

		return res;
	}

	// 데이터 생성
	function makeData(res, ring) {
		let _data = new Array();

		if (stats.year == 2004) {
			_data.push([
				'스텝',
				'LSU 번호',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'최소',
				'최대',
				'EOP'
			]);
			_data.push([
				'',
				'1',
				'',
				'2',
				'',
				'3',
				'',
				'4',
				'',
				'5',
				'',
				'6',
				'',
				'7',
				'',
				'8',
				'',
				'',
				'',
				''
			]);
			_data.push([
				'',
				'차',
				'보',
				'차',
				'보',
				'차',
				'보',
				'차',
				'보',
				'차',
				'보',
				'차',
				'보',
				'차',
				'보',
				'차',
				'보',
				'',
				'',
				''
			]);
		} else {
			_data.push([
				'스텝',
				'LSU 번호',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'최소',
				'최대',
				'EOP'
			]);
			_data.push([
				'',
				'1',
				'2',
				'3',
				'4',
				'5',
				'6',
				'7',
				'8',
				'9',
				'10',
				'11',
				'12',
				'13',
				'14',
				'15',
				'16',
				'',
				'',
				''
			]);
		}

		for (let i = 1; i <= 32; i++) {
			_data.push([i, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
		}

		if (res) {
			let length;

			if (typeof res == 'object') {
				length = Object.keys(res).length;
			} else {
				length = res.length;
			}

			if (length) {
				iData = res;
				_data = new Array();

				if (stats.year == 2004) {
					_data.push([
						'스텝',
						'LSU 번호',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'최소',
						'최대',
						'EOP'
					]);
					_data.push([
						'',
						'1',
						'',
						'2',
						'',
						'3',
						'',
						'4',
						'',
						'5',
						'',
						'6',
						'',
						'7',
						'',
						'8',
						'',
						'',
						'',
						''
					]);
					_data.push([
						'',
						'차',
						'보',
						'차',
						'보',
						'차',
						'보',
						'차',
						'보',
						'차',
						'보',
						'차',
						'보',
						'차',
						'보',
						'차',
						'보',
						'',
						'',
						''
					]);
				} else {
					_data.push([
						'스텝',
						'LSU 번호',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'최소',
						'최대',
						'EOP'
					]);
					_data.push([
						'',
						'1',
						'2',
						'3',
						'4',
						'5',
						'6',
						'7',
						'8',
						'9',
						'10',
						'11',
						'12',
						'13',
						'14',
						'15',
						'16',
						'',
						'',
						''
					]);
				}

				let temp = res.filter((v) => v.ring == ring);
				temp.forEach((v, i) => {
					_data.push([
						i + 1,
						oton(v.veh1),
						oton(v.ped1),
						oton(v.veh2),
						oton(v.ped2),
						oton(v.veh3),
						oton(v.ped3),
						oton(v.veh4),
						oton(v.ped4),
						oton(v.veh5),
						oton(v.ped5),
						oton(v.veh6),
						oton(v.ped6),
						oton(v.veh7),
						oton(v.ped7),
						oton(v.veh8),
						oton(v.ped8),
						v.minsplit,
						v.maxsplit,
						Boolean(v.eop)
					]);
				});
			} else {
				iData = undefined;
			}
		}

		return _data;
	}

	// 기본 옵션 생성
	function makeOption() {
		let optionM = [];
		let optionC = [];
		let optionF;
		if (stats.year == 2004) {
			optionM = [
				{ row: 0, col: 0, rowspan: 3, colspan: 1 },
				{ row: 0, col: 1, rowspan: 1, colspan: 16 },
				{ row: 1, col: 1, rowspan: 1, colspan: 2 },
				{ row: 1, col: 3, rowspan: 1, colspan: 2 },
				{ row: 1, col: 5, rowspan: 1, colspan: 2 },
				{ row: 1, col: 7, rowspan: 1, colspan: 2 },
				{ row: 1, col: 9, rowspan: 1, colspan: 2 },
				{ row: 1, col: 11, rowspan: 1, colspan: 2 },
				{ row: 1, col: 13, rowspan: 1, colspan: 2 },
				{ row: 1, col: 15, rowspan: 1, colspan: 2 },
				{ row: 0, col: 17, rowspan: 3, colspan: 1 },
				{ row: 0, col: 18, rowspan: 3, colspan: 1 },
				{ row: 0, col: 19, rowspan: 3, colspan: 1 }
			];

			optionC = function (row, col, prop) {
				let cellProperties = {};
				if (row < 3 && col < 1) {
					cellProperties.readOnly = true;
				}
				if (row > 2 && col == 19) {
					cellProperties.type = 'checkbox';
				}
				return cellProperties;
			};

			optionF = 3;
		} else {
			optionM = [
				{ row: 0, col: 0, rowspan: 2, colspan: 1 },
				{ row: 0, col: 1, rowspan: 1, colspan: 16 },
				{ row: 0, col: 17, rowspan: 2, colspan: 1 },
				{ row: 0, col: 18, rowspan: 2, colspan: 1 },
				{ row: 0, col: 19, rowspan: 2, colspan: 1 }
			];

			optionC = function (row, col, prop) {
				let cellProperties = {};
				if (row < 2 && col < 1) {
					cellProperties.readOnly = true;
				}
				if (row > 1 && col == 19) {
					cellProperties.type = 'checkbox';
				}
				return cellProperties;
			};

			optionF = 2;
		}

		return { mergeCells: optionM, cells: optionC, fixedRowsTop: optionF };
	}

	// 조회
	function searchData(e) {
		let cnt = 1;
		let isSuccess = new Array(cnt).fill(0);
		let isData = new Array(cnt).fill(0);

		ajax(`/signal-map?lcno=${stats.lcno}&planclss=${consts.plan}`).then((res) => {
			if (res.hasOwnProperty('success')) {
				initAll('center');
			} else {
				table1.loadData(makeData(res, 1));
				table1.updateSettings(makeOption());
				table2.loadData(makeData(res, 2));
				table2.updateSettings(makeOption());
				if (!_.isEmpty(res)) {
					isData[0] = 1;
				}
				isSuccess[0] = 1;
			}
			// 알림
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
		table.loadData(makeData());
		table.updateSettings(makeOption());
	}

	// 전체 초기화
	function initAll() {
		initData(table1);
		initData(table2);
	}

	// DB업다운로드
	function upDownData(e) {
		document.createWindow('dbUpDown', false, e, { tabValue: 2, stats: stats });
	}

	// 범례
	function legendData(e) {
		document.createWindow('signalCode', id, e, stats.year);
	}

	// DB저장
	function saveData() {
		let sR = stats.year == 2004 ? 3 : 2;

		let temp = [];
		let temp1 = table1.getSourceData(sR, 0, 31 + sR, 19);
		let temp2 = table2.getSourceData(sR, 0, 31 + sR, 19);

		let a = [];
		let b = [];

		temp1.forEach((v, i) => {
			a.push([...[stats.lcno, consts.plan, 1], ...ntoo(v)]);
		});

		temp2.forEach((v, i) => {
			b.push([...[stats.lcno, consts.plan, 2], ...ntoo(v)]);
		});

		let dtKeys = [
			'lcno',
			'planclss',
			'ring',
			'stepno',
			'veh1',
			'ped1',
			'veh2',
			'ped2',
			'veh3',
			'ped3',
			'veh4',
			'ped4',
			'veh5',
			'ped5',
			'veh6',
			'ped6',
			'veh7',
			'ped7',
			'veh8',
			'ped8',
			'minsplit',
			'maxsplit',
			'eop'
		];

		a.unshift(dtKeys);
		b.unshift(dtKeys);

		let jsonArray = atoj(a);
		let _jsonArray = atoj(b);

		ajax(`/signal-map/local?lcno=${stats.lcno}&planclss=${consts.plan}`, 'PUT', [
			...jsonArray,
			..._jsonArray
		]).then((res) => {
			document.isSuccess(res);
		});
	}

	// 초기 조회
	onMount(() => {
		// 센터
		searchData();
	});
</script>

<div class="tabPage {stats.year == 2004 ? '_2004' : '_2010'}">
	<div class="tabContent">
		<Legend legend="시그널맵 A링" color="#DADDE1">
			<div>
				<Table
					bind:wrapper={elems.table1}
					bind:table={table1}
					data={data1}
					width={'100%'}
					height={'240px'}
					{option}
				/>
			</div>
		</Legend>
	</div>
	<div class="tabContent">
		<Legend legend="시그널맵 B링" color="#DADDE1">
			<div>
				<Table
					bind:wrapper={elems.table2}
					bind:table={table2}
					data={data2}
					width={'100%'}
					height={'240px'}
					{option}
				/>
			</div>
		</Legend>
	</div>
	<div class="tabButton">
		<div class="buttons">
			<div>
				<Button icon="search" on:click={searchData}>조회</Button>
				<Button icon="init" on:click={initAll}>초기화</Button>
				<Button icon="save2db" on:click={saveData}>DB저장</Button>
				<Button icon="legend" on:click={legendData}>범례</Button>
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
</div>

<style>
	.tabPage {
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
	}

	.tabPage > div:nth-child(1) {
		grid-area: 1 / 1 / 2 / 2;
	}

	.tabPage > div:nth-child(2) {
		grid-area: 2 / 1 / 3 / 2;
	}

	.tabPage > div:nth-child(3) {
		grid-area: 3 / 1 / 4 / 2;
	}

	.tabPage .tabContent :global(fieldset) {
		height: 250px;
		padding: 0;
	}

	.tabPage .tabContent :global(fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 250px;
		overflow: hidden;
	}

	/* 버튼 */
	.tabButton > div.buttons {
		display: grid;
		grid-template-columns: 2fr 1fr;
	}

	.tabButton > div.buttons div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 80px 90px 70px 100px;
		grid-column-gap: 5px;
	}

	.tabButton > div.buttons div:nth-child(2) {
		display: grid;
		justify-content: end;
	}

	.tabButton > div.buttons div:nth-child(2) :global(button) {
		width: 100px;
	}

	/* Headers */
	/* 2004년식 */
	.tabPage._2004 .tabContent :global(.handsontable tr:first-child td),
	.tabPage._2004 .tabContent :global(.handsontable tr:nth-child(2) td),
	.tabPage._2004 .tabContent :global(.handsontable tr:nth-child(3) td),
	.tabPage._2004 .tabContent :global(.handsontable tr td:nth-child(1)) {
		color: #999999;
		background: #f4f7f9;
	}

	/* 2010년식 */
	.tabPage._2010 .tabContent :global(.handsontable tr:first-child td),
	.tabPage._2010 .tabContent :global(.handsontable tr:nth-child(2) td),
	.tabPage._2010 .tabContent :global(.handsontable tr td:nth-child(1)) {
		color: #999999;
		background: #f4f7f9;
	}

	/* EOP */
	.tabPage .tabContent :global(.handsontable td.eop) {
		background-color: #f7d400;
		color: black;
	}

	/* Compare */
	.tabPage .tabContent :global(.handsontable td.diff) {
		background-color: orangered !important;
		color: white !important;
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
