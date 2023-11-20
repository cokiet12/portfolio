<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Legend from '$lib/nested/legend.svelte';
	import Table from '$lib/nested/table.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax, NsetLog, cbUrl_success, cbUrl_fail } from '$lib/js/functions.mjs';
	import { userId } from '$lib/store.mjs';
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
		table2: null,
		table3: null,
		table4: null
	};
	// Selected
	let selected = 0;

	// Tcp
	let maptype2004 = [
		[0x08, 0x0c],
		[0xf8, 0xfc]
	];
	let maptype2004_dw = [
		[0x00, 0x04],
		[0xf0, 0xf4]
	];
	let maptype = [0x10, 0x20, 0x30, 0x40];
	const aring = 0;
	const bring = 1;

	// Table
	export let table1;
	export let table2;
	export let table3;
	export let table4;

	// Initial Datas
	let iData;

	// Datas
	// 센터
	let data1 = [];
	let data2 = [];

	// 로컬
	let data3 = [];
	let data4 = [];

	let cellOption = function (row, col, prop) {
		var cellProperties = {};
		cellProperties.readOnly = true;
		return cellProperties;
	};

	// Option
	let option = {
		height: '250px',
		colWidths: [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 35, 35, 35],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		cells: cellOption,
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
			initAll('center');

			setTimeout(function () {
				searchData();
			}, 500);
		}

		if (table3 && table4) {
			initAll('local');
		}
	}

	// DropDown Event
	function DropDownEvent() {
		consts.plan = selected;
		searchData();
		initAll('local');
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
	function makeData(res, ring, id) {
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
				if (id == 'search') {
					iData = res;
				}
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
		let cellOption;
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

			for (let i = 3; i < 35; i++) {
				optionC.push({ row: i, col: 19, type: 'checkbox' });
			}

			optionF = 3;
		} else {
			optionM = [
				{ row: 0, col: 0, rowspan: 2, colspan: 1 },
				{ row: 0, col: 1, rowspan: 1, colspan: 16 },
				{ row: 0, col: 17, rowspan: 2, colspan: 1 },
				{ row: 0, col: 18, rowspan: 2, colspan: 1 },
				{ row: 0, col: 19, rowspan: 2, colspan: 1 }
			];

			for (let i = 2; i < 34; i++) {
				optionC.push({ row: i, col: 19, type: 'checkbox' });
			}

			optionF = 2;
		}

		return { mergeCells: optionM, cell: optionC, fixedRowsTop: optionF };
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
				table1.loadData(makeData(res, 1, 'search'));
				table1.updateSettings(makeOption());
				table2.loadData(makeData(res, 2, 'search'));
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
	function initAll(sort) {
		if (sort == 'center') {
			initData(table1);
			initData(table2);
		} else {
			initData(table3);
			initData(table4);
		}
	}

	// 편집
	function editData(e) {
		document.createWindow('dbEdit', false, e, { tabValue: 2, stats: stats });
	}

	// 검증
	function compareData() {
		// "" == null == undefined 를 비교하는건 무의미
		// 두 테이블 전부 다 "", null, undefined 이면, 비교 X
		// 한 테이블이라도 숫자나 유효한 문자가 있으면 비교 O
		let temp1 = new Array();
		let temp2 = new Array();
		let eR = stats.year == 2004 ? 35 : 34;

		let centerA = table1.getSourceData();
		let centerB = table2.getSourceData();
		let localA = table3.getSourceData();
		let localB = table4.getSourceData();

		// 초기화
		for (let i in compare[0]) {
			table1.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', '');
			table3.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', '');
		}

		for (let i in compare[1]) {
			table2.setCellMeta(compare[1][i].row, compare[1][i].col, 'className', '');
			table4.setCellMeta(compare[1][i].row, compare[1][i].col, 'className', '');
		}

		compare = [];

		// 검증
		for (let i = 0; i < eR; i++) {
			for (let j = 0; j < 20; j++) {
				let diff1 = new Object();
				let diff2 = new Object();
				if (centerA[i][j] != localA[i][j]) {
					diff1.row = i;
					diff1.col = j;
					temp1.push(diff1);
				}

				if (centerB[i][j] != localB[i][j]) {
					diff2.row = i;
					diff2.col = j;
					temp2.push(diff2);
				}
			}
		}

		compare.push(temp1);
		compare.push(temp2);

		// 적용
		for (let i in compare[0]) {
			table1.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', 'diff');
			table3.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', 'diff');
		}

		for (let i in compare[1]) {
			table2.setCellMeta(compare[1][i].row, compare[1][i].col, 'className', 'diff');
			table4.setCellMeta(compare[1][i].row, compare[1][i].col, 'className', 'diff');
		}

		// Render
		table1.render();
		table2.render();
		table3.render();
		table4.render();
	}

	// 동기화(TCP)
	function downloadData() {
		let aringMap = 0;
		let bringMap = 0;

		if (stats.year == 2004) {
			aringMap = maptype2004_dw[consts.plan][aring];
			bringMap = maptype2004_dw[consts.plan][bring];
		} else {
			if (document.lcCon.LCs[stats.lcno].lamptype) {
				aringMap = maptype[aring] + consts.plan;
				bringMap = maptype[bring] + consts.plan;
			} else {
				aringMap = maptype[aring + 2] + consts.plan;
				bringMap = maptype[bring + 2] + consts.plan;
			}
		}

		let input = [`${stats.lcno},${aringMap},${bringMap},${consts.plan}`];
		document.callTcp('/signalmap_dw', input, (res) => {
			console.log(res);
			if (res.done && res[0].ok == 1) {
				const result = cbUrl_success('/signalmap_dw', stats.lcno);
				const json = NsetLog({ data: result });
				ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
			} else {
				if (!res.done) {
					const result = cbUrl_fail('/signalmap_dw', stats.lcno);
					const json = NsetLog({ data: result });
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				}
			}
		});
	}

	// 업로드(TCP)
	function uploadData() {
		let aringMap = 0;
		let bringMap = 0;

		if (stats.year == 2004) {
			aringMap = maptype2004[consts.plan][aring];
			bringMap = maptype2004[consts.plan][bring];
		} else {
			if (document.lcCon.LCs[stats.lcno].lamptype) {
				aringMap = maptype[aring] + consts.plan;
				bringMap = maptype[bring] + consts.plan;
			} else {
				aringMap = maptype[aring + 2] + consts.plan;
				bringMap = maptype[bring + 2] + consts.plan;
			}
		}

		let input = [
			JSON.stringify({ LCNO: stats.lcno, ring: aringMap, ringName: 'A링' }),
			JSON.stringify({ LCNO: stats.lcno, ring: bringMap, ringName: 'B링' })
		];
		document.callTcp('/signalmap_up', input, (res) => {
			console.log(res);
			if (res[0].data && res[1].data) {
				let data_a = res[0].data.data;
				let data_b = res[1].data.data;
				if (res.done) {
					table3.loadData(makeData(data_a, 1, 'upload'));
					table3.updateSettings(makeOption());
					table4.loadData(makeData(data_b, 2, 'upload'));
					table4.updateSettings(makeOption());
					const result = cbUrl_success('/signalmap_up', stats.lcno);
					const json = NsetLog({ data: result });
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				}
			} else {
				if (!res.done) {
					const result = cbUrl_fail('/signalmap_up', stats.lcno);
					const json = NsetLog({ data: result });
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				}
			}
		});
	}

	// 범례
	function legendData(e) {
		document.createWindow('signalCode', id, e, stats.year);
	}

	// DB저장
	function saveData() {
		let sR = stats.year == 2004 ? 3 : 2;

		let temp = [];
		let temp1 = table3.getSourceData(sR, 0, 31 + sR, 19);
		let temp2 = table4.getSourceData(sR, 0, 31 + sR, 19);

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

		console.log([...jsonArray, ..._jsonArray]);

		ajax(`/signal-map/local?lcno=${stats.lcno}&planclss=${consts.plan}`, 'PUT', [
			...jsonArray,
			..._jsonArray
		]).then((res) => {
			document.isSuccess(res);
			if (res.success) {
				const json = NsetLog({
					data: [
						4,
						14,
						227,
						0,
						$userId,
						stats.lcno,
						document.lcCon.LCs[stats.lcno].lcname,
						'시그널맵 저장성공'
					]
				});
				ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
			} else {
				const json = NsetLog({
					data: [
						4,
						14,
						227,
						0,
						$userId,
						stats.lcno,
						document.lcCon.LCs[stats.lcno].lcname,
						'시그널맵 저장실패'
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
		initAll('center');
	});
</script>

<div class="tabPage {stats.year == 2004 ? '_2004' : '_2010'}">
	<div class="tabContent">
		<Legend
			legend="<image style='margin-right: 5px' src='/svg/center.svg' />센터 A링"
			color="#80CE8C"
		>
			<div>
				<Table
					bind:wrapper={elems.table1}
					bind:table={table1}
					data={data1}
					width={'100%'}
					height={'250px'}
					{option}
				/>
			</div>
		</Legend>
	</div>
	<div class="tabContent">
		<Legend
			legend="<image style='margin-right: 5px' src='/svg/center.svg' />센터 B링"
			color="#80CE8C"
		>
			<div>
				<Table
					bind:wrapper={elems.table2}
					bind:table={table2}
					data={data2}
					width={'100%'}
					height={'250px'}
					{option}
				/>
			</div>
		</Legend>
	</div>
	<div class="tabContent">
		<Legend
			legend="<image style='margin-right: 5px' src='/svg/local.svg' />로컬 A링"
			color="#86B5DE"
		>
			<div>
				<Table
					bind:wrapper={elems.table3}
					bind:table={table3}
					data={data3}
					width={'100%'}
					height={'250px'}
					{option}
				/>
			</div>
		</Legend>
	</div>
	<div class="tabContent">
		<Legend
			legend="<image style='margin-right: 5px' src='/svg/local.svg' />로컬 B링"
			color="#86B5DE"
		>
			<div>
				<Table
					bind:wrapper={elems.table4}
					bind:table={table4}
					data={data4}
					height={'250px'}
					{option}
				/>
			</div>
		</Legend>
	</div>
	<div class="tabButton">
		<div class="center">
			<div>
				<Button icon="search" on:click={searchData}>조회</Button>
				<Button icon="init" on:click={() => initAll('center')}>초기화</Button>
				<Button icon="edit" on:click={editData}>편집</Button>
				<Button icon="compare" on:click={compareData}>검증</Button>
			</div>
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
	</div>
	<div class="tabButton">
		<div class="local">
			<div>
				<Button colored={true} icon="sync" on:click={downloadData}>동기화</Button>
			</div>
			<div>
				<Button icon="upload" on:click={uploadData}>업로드</Button>
				<Button icon="init" on:click={() => initAll('local')}>초기화</Button>
				<Button icon="legend" on:click={legendData}>범례</Button>
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

	.tabPage > div:nth-child(1) {
		grid-area: 1 / 1 / 2 / 2;
	}

	.tabPage > div:nth-child(2) {
		grid-area: 2 / 1 / 3 / 2;
	}

	.tabPage > div:nth-child(3) {
		grid-area: 1 / 2 / 2 / 3;
	}

	.tabPage > div:nth-child(4) {
		grid-area: 2 / 2 / 3 / 3;
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
	/* 센터 */
	.tabButton > div.center {
		display: grid;
		grid-template-columns: auto 100px;
	}

	.tabButton > div.center div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 80px 70px 70px;
		grid-column-gap: 5px;
	}

	.tabButton > div.center div:nth-child(2) {
		width: 100px;
	}

	/* 로컬 */
	.tabButton > div.local {
		display: grid;
		grid-template-columns: 1fr 4fr;
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
		grid-template-columns: 80px 80px 70px 90px;
		grid-column-gap: 5px;
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
