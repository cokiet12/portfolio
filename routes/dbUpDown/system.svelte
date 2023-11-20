<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Legend from '$lib/nested/legend.svelte';
	import Table from '$lib/nested/table.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax, NsetLog, cbUrl_success, cbUrl_fail } from '$lib/js/functions.mjs';
	import { userId } from '$lib/store.mjs';
	import _ from 'lodash';

	const consts = {
		option1: [
			{ id: 0, text: 'HW정보' },
			{ id: 1, text: '네트워크' }
		],
		option2: [
			{ id: 0, text: 'UPS정보' },
			{ id: 1, text: 'UPS밴더' },
			{ id: 2, text: 'UPS컨트롤' }
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
		table4: null,
		table5: null
	};
	// Selected
	let selected1 = 0;
	let selected2 = 0;

	// Table
	export let table1;
	export let table2;
	export let table3;
	export let table4;
	export let table5;

	// Datas
	let data1 = [];
	let data2 = [];
	let data3 = [];
	let data4 = [];
	let data5 = [];

	// Cells
	let optionC = function (row, col, prop) {
		let cellProperties = {};
		cellProperties.readOnly = true;
		return cellProperties;
	};

	// Option
	let option1 = {
		height: '345px',
		colWidths: [111, 108, 108, 108, 108],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		cells: optionC,
		fixedRowsTop: 1
	};
	let option2 = {
		colWidths: [75, 122, 75, 122],
		rowHeights: 23,
		renderer: 'html',
		cells: optionC,
		renderAllRows: true
	};
	let option3 = {
		height: '270px',
		colWidths: [70, 100, 120],
		rowHeights: 23,
		renderer: 'html',
		cells: optionC,
		renderAllRows: true,
		fixedRowsTop: 1
	};
	let option4 = {
		height: '115px',
		colWidths: [90, 190],
		rowHeights: 23,
		renderer: 'html',
		cells: optionC,
		renderAllRows: true,
		fixedRowsTop: 1
	};
	let option5 = {
		colWidths: [90, 190],
		rowHeights: 23,
		renderer: 'html',
		cells: optionC,
		renderAllRows: true
	};

	// Search Event
	function searchEvent(stat) {
		if (table1 && table2) {
			initAll('system');
		}

		if (table3 && table4 && table5) {
			initAll('ups');
		}
	}

	function makeData(res, sort) {
		let _data;
		if (sort == 'hardware') {
			_data = [['항목', 'MCU 보드', '', 'SCU 보드', '']];
			let row = ['제조사', '버전', '빌드날짜', '신호등형태', '연락처', '설치정보'];

			for (let i = 0; i < 21; i++) {
				if (i < 5) {
					_data.push([row[i], '', '', '', '']);
				} else if (i == 5) {
					_data.push([row[i], 'DET1', '', 'LSU1', '']);
				} else if (i > 5 && i <= 12) {
					_data.push(['', 'DET' + (i - 4), '', 'LSU' + (i - 4), '']);
				} else {
					_data.push(['', 'OPT' + (i - 12), '', 'LSU' + (i - 4), '']);
				}
			}
		} else if (sort == 'network') {
			_data = [
				['로컬네트워크', '', '센터네트워크', ''],
				['', '', 'IP주소', ''],
				['IP주소', '', '포트', ''],
				['넷마스크', '', '네트워크 명령', ''],
				['게이트웨이', '', '명령', ''],
				['MAC주소', '', '통신방식', '']
			];
		} else if (sort == 'ups') {
			_data = [['항목', '', 'SCU 보드']];

			let upsHeaders = ['입력전원', '충전상태', '축전상태', '바이패스상태', '테스트모드'];
			let batMHeaders = ['트랜스상태', '과부하상태', '모듈1 설치', '모듈2 설치', '모듈3 설치'];
			let batCHeaders = ['모듈1 셀', '모듈2 셀', '모듈3 셀'];
			let etcHeaders = [
				'입력전원전압',
				'출력전원전압',
				'부하량',
				'부하전류',
				'내부온도',
				'모듈1 셀 별 전압',
				'모듈2 셀 별 전압',
				'모듈3 셀 별 전압',
				'전체 배터리 잔량'
			];

			for (let i = 0; i < 21; i++) {
				if (i == 0) {
					_data.push(['UPS', upsHeaders[i], '']);
				} else if (i > 0 && i <= 4) {
					_data.push(['', upsHeaders[i], '']);
				} else if (i == 5) {
					_data.push(['모듈상태', batMHeaders[i - 5], '']);
				} else if (i > 5 && i <= 9) {
					_data.push(['', batMHeaders[i - 5], '']);
				} else if (i == 10) {
					_data.push(['전지셀상태', batCHeaders[i - 10], '']);
				} else if (i > 10 && i <= 11) {
					_data.push(['', batCHeaders[i - 10], '']);
				} else if (i == 12) {
					_data.push(['기타', etcHeaders[i - 12], '']);
				} else {
					_data.push(['', etcHeaders[i - 12], '']);
				}
			}
		} else if (sort == 'vendor') {
			_data = [
				['항목', '값'],
				['벤더코드', ''],
				['제조사', ''],
				['전화번호', ''],
				['주 소프트웨어', ''],
				['부 소프트웨어', ''],
				['모델이름', ''],
				['시리얼번호', '']
			];
		} else {
			_data = [
				['항목', '값'],
				['바이패스 방식', ''],
				['테스트모드', '']
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
				if (sort == 'hardware') {
					// MCU 보드
					_data[1][1] = res['mcu제조사'];
					_data[2][1] = res['mcu버전'];
					_data[3][1] = res['mcu빌드날짜'];
					_data[4][1] = res['mcu신호등형태'];
					_data[5][1] = res['mcu연락처'];
					_data[6][2] = res.DET1;
					_data[7][2] = res.DET2;
					_data[8][2] = res.DET3;
					_data[9][2] = res.DET4;
					_data[10][2] = res.DET5;
					_data[11][2] = res.DET6;
					_data[12][2] = res.DET7;
					_data[13][2] = res.DET8;
					_data[14][2] = res.CPT1;
					_data[15][2] = res.CPT2;
					_data[16][2] = res.CPT3;
					_data[17][2] = res.CPT4;
					_data[18][2] = res.CPT5;
					_data[19][2] = res.CPT6;
					_data[20][2] = res.CPT7;
					_data[21][2] = res.CPT8;

					// SCU 보드
					_data[1][3] = res['scu제조사'];
					_data[2][3] = res['scu버전'];
					_data[3][3] = res['scu빌드날짜'];
					_data[4][3] = res['scu신호등형태'];
					_data[5][3] = res['scu연락처'];
					_data[6][4] = res.LSU01;
					_data[7][4] = res.LSU02;
					_data[8][4] = res.LSU03;
					_data[9][4] = res.LSU04;
					_data[10][4] = res.LSU05;
					_data[11][4] = res.LSU06;
					_data[12][4] = res.LSU07;
					_data[13][4] = res.LSU08;
					_data[14][4] = res.LSU09;
					_data[15][4] = res.LSU10;
					_data[16][4] = res.LSU11;
					_data[17][4] = res.LSU12;
					_data[18][4] = res.LSU13;
					_data[19][4] = res.LSU14;
					_data[20][4] = res.LSU15;
					_data[21][4] = res.LSU16;
				} else if (sort == 'network') {
					_data[2][1] = res.LOCALIP;
					_data[3][1] = res.NETMASK;
					_data[4][1] = res.GATEWAY;
					_data[5][1] = res.MACADDR;
					_data[1][3] = res.CENTERIP;
					_data[2][3] = res.PORTNO;
					_data[4][3] = res.COMMAND;
					_data[5][3] = res.COMMODE;
				} else if (sort == 'ups') {
				} else if (sort == 'vendor') {
				} else {
				}
			}
		}

		return _data;
	}

	function makeOption(sort) {
		let result = [];
		if (sort == 'hardware') {
			for (let i = 0; i < 6; i++) {
				result.push(
					{ row: i, col: 1, rowspan: 1, colspan: 2 },
					{ row: i, col: 3, rowspan: 1, colspan: 2 }
				);
			}

			result.push({ row: 6, col: 0, rowspan: 16, colspan: 1 });
		} else if (sort == 'network') {
			result = [
				{ row: 0, col: 0, rowspan: 2, colspan: 2 },
				{ row: 0, col: 2, rowspan: 1, colspan: 2 },
				{ row: 3, col: 2, rowspan: 1, colspan: 2 }
			];
		} else {
			result = [
				{ row: 0, col: 0, rowspan: 1, colspan: 2 },
				{ row: 1, col: 0, rowspan: 5, colspan: 1 },
				{ row: 6, col: 0, rowspan: 5, colspan: 1 },
				{ row: 11, col: 0, rowspan: 2, colspan: 1 },
				{ row: 13, col: 0, rowspan: 9, colspan: 1 }
			];
		}

		return { mergeCells: result };
	}

	// 테이블 초기화
	function initData(table, sort) {
		table.loadData(makeData(null, sort));
		if (sort == 'hardware' || sort == 'network' || sort == 'ups') {
			table.updateSettings(makeOption(sort));
		}
	}

	// 전체 초기화
	function initAll(sort) {
		if (sort == 'system') {
			initData(table1, 'hardware');
			initData(table2, 'network');
		} else {
			initData(table3, 'ups');
			initData(table4, 'vendor');
			initData(table5, 'control');
		}
	}

	// 업로드(TCP)
	function uploadData(sort) {
		if (sort == 'system') {
			if (selected1 == 0) {
				document.callTcp('/device_up', [`${stats.lcno}`], (res) => {
					if (res[0].data) {
						let data = res[0].data.data;
						if (res.done) {
							table1.loadData(makeData(data, 'hardware'));
							table1.updateSettings(makeOption('hardware'));
							const result = cbUrl_success('/device_up', stats.lcno);
							const json = NsetLog({ data: result });
							ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
						}
					} else {
						if (!res.done) {
							const result = cbUrl_fail('/device_up', stats.lcno);
							const json = NsetLog({ data: result });
							ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
						}
					}
				});
			} else {
				document.callTcp('/network_up', [`${stats.lcno}`], (res) => {
					if (res[0].data) {
						let data = res[0].data.data;
						if (res.done) {
							table2.loadData(makeData(data, 'network'));
							table2.updateSettings(makeOption('network'));
							const result = cbUrl_success('/network_up', stats.lcno);
							const json = NsetLog({ data: result });
							ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
						}
					} else {
						if (!res.done) {
							const result = cbUrl_fail('/network_up', stats.lcno);
							const json = NsetLog({ data: result });
							ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
						}
					}
				});
			}
		}
	}

	// 저장
	function saveData() {
		let temp = table1.getSourceData(1, 1, 5, 4);

		console.log(temp);

		let arr = [];

		for (let i = 0; i < 2; i++) {
			let json = new Object();

			json.lcno = stats.lcno;
			json.manufacturer = temp[0][i * 2];
			json.version = temp[1][i * 2];
			json.bdate = temp[2][i * 2];
			json.stype = temp[3][i * 2];
			json.tel = temp[4][i * 2];
			json.b_ring = i + 1;

			arr.push(json);
		}

		ajax(`/putDBSystem`, 'POST', arr).then((res) => {
			document.isSuccess(res);
		});
	}

	// 초기 조회
	onMount(() => {
		initAll('system');
		initAll('ups');
	});
</script>

<div class="tabPage">
	<div class="tabContent">
		<Legend legend="시스템정보" color="#80CE8C">
			<div class="hw">
				<Legend legend="HW정보" color="#DADDE1">
					<div>
						<Table
							bind:wrapper={elems.table1}
							bind:table={table1}
							data={data1}
							width={'100%'}
							height={'345px'}
							option={option1}
						/>
					</div>
				</Legend>
			</div>
			<div class="network">
				<Legend legend="네트워크" color="#DADDE1">
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
		</Legend>
	</div>
	<div class="tabContent">
		<Legend legend="UPS" color="#86B5DE">
			<div class="ups">
				<Legend legend="UPS정보" color="#DADDE1">
					<div>
						<Table
							bind:wrapper={elems.table3}
							bind:table={table3}
							data={data3}
							width={'100%'}
							height={'270px'}
							option={option3}
						/>
					</div>
				</Legend>
			</div>
			<div class="vendor">
				<Legend legend="UPS밴더" color="#DADDE1">
					<div>
						<Table
							bind:wrapper={elems.table4}
							bind:table={table4}
							data={data4}
							width={'100%'}
							height={'115px'}
							option={option4}
						/>
					</div>
				</Legend>
			</div>
			<div class="control">
				<Legend legend="UPS컨트롤" color="#DADDE1">
					<div>
						<Table
							bind:wrapper={elems.table5}
							bind:table={table5}
							data={data5}
							width={'100%'}
							height={'auto'}
							option={option5}
						/>
					</div>
				</Legend>
			</div>
		</Legend>
	</div>
	<div class="tabButton">
		<div class="center">
			<div>
				<Button icon="init" on:click={() => initAll('system')}>초기화</Button>
				<Button icon="save2db" on:click={saveData}>저장</Button>
			</div>
			<div>
				<div class="sel">
					<select bind:value={selected1} class="static">
						{#each consts.option1 as i}
							<option value={i.id}>
								{i.text}
							</option>
						{/each}
					</select>
				</div>
				<Button icon="upload" on:click={() => uploadData('system')}>업로드</Button>
			</div>
		</div>
	</div>
	<div class="tabButton">
		<div class="local">
			<div>
				<Button icon="init" on:click={() => initAll('ups')}>초기화</Button>
			</div>
			<div>
				<div class="sel">
					<select bind:value={selected2} class="static">
						{#each consts.option2 as i}
							<option value={i.id}>
								{i.text}
							</option>
						{/each}
					</select>
				</div>
				<Button icon="upload" on:click={() => uploadData('ups')}>업로드</Button>
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

	.tabPage .tabContent > :global(fieldset),
	.tabPage .tabContent :global(fieldset div fieldset) {
		padding: 0;
	}

	.tabPage .tabContent:nth-child(2) > :global(fieldset) {
		filter: opacity(0.5);
		pointer-events: none;
	}

	/* HW */
	.tabPage .tabContent > :global(fieldset div.hw > fieldset) {
		height: 345px;
	}

	.tabPage .tabContent :global(fieldset div.hw > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 345px;
		overflow: hidden;
	}

	/* NETWORK */
	.tabPage .tabContent > :global(fieldset div.network > fieldset) {
		height: 140px;
	}

	.tabPage .tabContent :global(fieldset div.network > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 140px;
		overflow: hidden;
	}

	/* UPS */
	.tabPage .tabContent > :global(fieldset div.ups > fieldset) {
		height: 270px;
	}

	.tabPage .tabContent :global(fieldset div.ups > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 270px;
		overflow: hidden;
	}

	/* VENDOR */
	.tabPage .tabContent > :global(fieldset div.vendor > fieldset) {
		height: 115px;
	}

	.tabPage .tabContent :global(fieldset div.vendor > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 115px;
		overflow: hidden;
	}

	/* CONTROL */
	.tabPage .tabContent > :global(fieldset div.control > fieldset) {
		height: 70px;
	}

	.tabPage .tabContent :global(fieldset div.control > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 70px;
		overflow: hidden;
	}

	/* 버튼 */
	/* 센터 */
	.tabButton > div.center {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.tabButton > div.center > div:nth-child(1) {
		display: grid;
		grid-template-columns: 80px 70px;
		grid-column-gap: 5px;
	}

	.tabButton > div.center > div:nth-child(2) {
		display: grid;
		justify-content: end;
		grid-template-columns: 100px 80px;
		grid-column-gap: 10px;
	}

	.tabButton > div.center > div:nth-child(2) > div:nth-child(1) {
		width: 100px;
		height: 30px;
	}

	/* 로컬 */
	.tabButton > div.local {
		filter: opacity(0.5);
		pointer-events: none;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.tabButton > div.local > div:nth-child(1) {
		display: grid;
		grid-template-columns: 80px;
	}

	.tabButton > div.local > div:nth-child(2) {
		display: grid;
		justify-content: end;
		grid-template-columns: 100px 80px;
		grid-column-gap: 10px;
	}

	.tabButton > div.local > div:nth-child(2) > div:nth-child(1) {
		width: 100px;
		height: 30px;
	}

	/* Headers */
	/* Common */
	.tabPage .tabContent :global(.handsontable tr:first-child td),
        .tabPage .tabContent :global(.handsontable tr td:nth-child(1)),

        /* Network */
        .tabPage .tabContent div.network :global(.handsontable tr td:nth-child(3)) {
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
