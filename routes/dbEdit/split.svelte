<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Legend from '$lib/nested/legend.svelte';
	import Table from '$lib/nested/table.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	const consts = {
		plan1: 0,
		plan2: 0,
		option1: [
			{ id: 0, text: '일반제' },
			{ id: 1, text: '시차제1' },
			{ id: 2, text: '시차제2' },
			{ id: 3, text: '시차제3' },
			{ id: 4, text: '시차제4' },
			{ id: 5, text: '시차제5' },
			{ id: 6, text: '보행맵' }
		],
		option2: [
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
		table2: null
	};
	// Selected
	let selected1 = 0;
	let selected2 = 0;

	// Table
	export let table1;
	export let table2;

	// Initial Datas
	let iData1;
	let iData2;

	// Datas
	let data1 = [];
	let data2 = [];

	// Option
	let option1 = {
		height: '208px',
		colWidths: [14, 14, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		fixedRowsTop: 1
	};
	let option2 = {
		height: '346px',
		colWidths: [
			50, 50, 40, 30, 20, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 50, 50
		],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		fixedRowsTop: 1,
		afterSetDataAtCell: function (changes, source) {
			if (source == 'edit') {
				if (changes[0][0] > 0 && changes[0][1] > 4 && changes[0][1] < 13) {
					setTimeout(function () {
						let arr = table2.getSourceData(changes[0][0], 5, changes[0][0], 12)[0];
						let sum = arr.reduce((a, b) => Number(a) + Number(b));
						if (sum != 0) {
							table2.setDataAtCell(changes[0][0], 13, sum);
							table2.setDataAtCell(changes[0][0], 2, sum);
						} else {
							table2.setDataAtCell(changes[0][0], 13, '');
							table2.setDataAtCell(changes[0][0], 2, '');
						}
					}, 100);
				}
			}

			if (source == 'populateFromArray') {
				let arr = table2.getSourceData(1, 5, 16, 12);

				arr.forEach((v, i) => {
					if (v[2] != '') {
						let sum = v.reduce((a, b) => Number(a) + Number(b));
						if (sum != 0) {
							table2.setDataAtCell(i + 1, 13, sum);
						} else {
							table2.setDataAtCell(i + 1, 13, '');
						}
					}
				});
			}
		}
	};

	// Search Event
	function searchEvent(stat) {
		if (table1 && table2) {
			initAll();

			setTimeout(function () {
				searchData(null, 'phase');
				searchData(null, 'split');
			}, 500);
		}
	}

	// DropDown Event
	function DropDown1() {
		consts.plan1 = selected1;
		searchData(null, 'phase');
	}

	// DropDown Event
	function DropDown2() {
		consts.plan2 = selected2;
		searchData(null, 'split');
	}

	// 데이터 생성
	function makeData(res, sort, temp) {
		let _data;
		if (sort == 'phase') {
			_data = [
				[
					'현시',
					'링',
					'이동류',
					'보행',
					'최소시간',
					'최대시간',
					'황색시간',
					'차로수',
					'주현시',
					'MDS',
					'고정현시',
					'현시확장',
					'감응',
					'듀얼링'
				]
			];

			for (let i = 1; i < 9; i++) {
				_data.push([i, 'A', '', '', '', '', '', '', '', '', '', '', '', '']);
				_data.push([i, 'B', '', '', '', '', '', '', '', '', '', '', '', '']);
			}
		} else {
			_data = [
				[
					'주기IDX',
					'스플릿IDX',
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
					'8현시',
					'합계'
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
				_data.push([ci, i + 1, '', '', 'A', '', '', '', '', '', '', '', '', '']);
				_data.push([ci, i + 1, '', '', 'B', '', '', '', '', '', '', '', '', '']);
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

					let aring = res.filter((v) => v.ring == 1);
					let bring = res.filter((v) => v.ring == 2);

					aring.forEach((v, i) => {
						_data[i * 2 + 1][2] = v.flownumber;
						_data[i * 2 + 1][3] = '';
						_data[i * 2 + 1][4] = temp[0][i] ? temp[0][i].min : v.minsplit == 0 ? '' : v.minsplit;
						_data[i * 2 + 1][5] = temp[0][i] ? temp[0][i].max : v.maxsplit == 0 ? '' : v.maxsplit;
						_data[i * 2 + 1][6] = temp[0][i] ? temp[0][i].yl : v.yellow == 0 ? '' : v.yellow;
						_data[i * 2 + 1][7] = v.lane == 0 ? '' : v.lane;
						_data[i * 2 + 1][8] = Boolean(v.mainphase);
						_data[i * 2 + 1][9] = Boolean(v.mdscontrol);
						_data[i * 2 + 1][10] = Boolean(v.fixedphase);
						_data[i * 2 + 1][11] = Boolean(v.extended);
						_data[i * 2 + 1][12] = Boolean(v.actcontrol);
						_data[i * 2 + 1][13] = Boolean(v.dualflag);
					});

					bring.forEach((v, i) => {
						_data[i * 2 + 2][2] = v.flownumber;
						_data[i * 2 + 2][3] = '';
						_data[i * 2 + 2][4] = temp[1][i] ? temp[0][i].min : v.minsplit == 0 ? '' : v.minsplit;
						_data[i * 2 + 2][5] = temp[1][i] ? temp[0][i].max : v.maxsplit == 0 ? '' : v.maxsplit;
						_data[i * 2 + 2][6] = temp[1][i] ? temp[0][i].yl : v.yellow == 0 ? '' : v.yellow;
						_data[i * 2 + 2][7] = v.lane == 0 ? '' : v.lane;
						_data[i * 2 + 2][8] = Boolean(v.mainphase);
						_data[i * 2 + 2][9] = Boolean(v.mdscontrol);
						_data[i * 2 + 2][10] = Boolean(v.fixedphase);
						_data[i * 2 + 2][11] = Boolean(v.extended);
						_data[i * 2 + 2][12] = Boolean(v.actcontrol);
						_data[i * 2 + 2][13] = Boolean(v.dualflag);
					});
				} else {
					iData2 = res;
					res.forEach((v, i) => {
						_data[i * 2 + 1][2] = v.sumofa == 0 ? '' : v.sumofa;
						_data[i * 2 + 1][3] = v.sumofa == 0 ? '' : v.offset;

						// A링
						_data[i * 2 + 1][5] = v.asplit1 == 0 ? '' : v.asplit1;
						_data[i * 2 + 1][6] = v.asplit2 == 0 ? '' : v.asplit2;
						_data[i * 2 + 1][7] = v.asplit3 == 0 ? '' : v.asplit3;
						_data[i * 2 + 1][8] = v.asplit4 == 0 ? '' : v.asplit4;
						_data[i * 2 + 1][9] = v.asplit5 == 0 ? '' : v.asplit5;
						_data[i * 2 + 1][10] = v.asplit6 == 0 ? '' : v.asplit6;
						_data[i * 2 + 1][11] = v.asplit7 == 0 ? '' : v.asplit7;
						_data[i * 2 + 1][12] = v.asplit8 == 0 ? '' : v.asplit8;

						// B링
						_data[i * 2 + 2][5] = v.bsplit1 == 0 ? '' : v.bsplit1;
						_data[i * 2 + 2][6] = v.bsplit2 == 0 ? '' : v.bsplit2;
						_data[i * 2 + 2][7] = v.bsplit3 == 0 ? '' : v.bsplit3;
						_data[i * 2 + 2][8] = v.bsplit4 == 0 ? '' : v.bsplit4;
						_data[i * 2 + 2][9] = v.bsplit5 == 0 ? '' : v.bsplit5;
						_data[i * 2 + 2][10] = v.bsplit6 == 0 ? '' : v.bsplit6;
						_data[i * 2 + 2][11] = v.bsplit7 == 0 ? '' : v.bsplit7;
						_data[i * 2 + 2][12] = v.bsplit8 == 0 ? '' : v.bsplit8;
					});
				}
			} else {
				if (sort == 'phase') {
					iData1 = undefined;
				} else {
					iData2 = undefined;
				}
			}
		}

		return _data;
	}

	// 기본 옵션 생성
	function makeOption(sort) {
		let optionC;
		let optionM;
		let result = new Object();

		if (sort == 'phase') {
			optionC = function (row, col, prop) {
				let cellProperties = {};
				if (row > 0) {
					if (col > 7) {
						cellProperties.type = 'checkbox';
					}
				}
				if (row == 0) {
					cellProperties.readOnly = true;
				}
				if (col > 3 && col < 7) {
					cellProperties.readOnly = true;
				}
				if (col < 2) {
					cellProperties.readOnly = true;
				}
				return cellProperties;
			};

			optionM = [
				{ row: 1, col: 0, rowspan: 2, colspan: 1 },
				{ row: 3, col: 0, rowspan: 2, colspan: 1 },
				{ row: 5, col: 0, rowspan: 2, colspan: 1 },
				{ row: 7, col: 0, rowspan: 2, colspan: 1 },
				{ row: 9, col: 0, rowspan: 2, colspan: 1 },
				{ row: 11, col: 0, rowspan: 2, colspan: 1 },
				{ row: 13, col: 0, rowspan: 2, colspan: 1 },
				{ row: 15, col: 0, rowspan: 2, colspan: 1 }
			];

			result.cells = optionC;
			result.mergeCells = optionM;
		} else {
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
				if (col < 5 || col == 13) {
					cellProperties.readOnly = true;
				}
				return cellProperties;
			};

			result.cells = optionC;
			result.mergeCells = optionM;
		}

		return result;
	}

	// 조회
	function searchData(e, sort) {
		let temp = [[], []];
		let cnt = 3;
		let isSuccess = new Array(cnt).fill(0);
		let isData = new Array(cnt).fill(0);
		if (sort == 'phase') {
			ajax(`/signal-map?lcno=${stats.lcno}&planclss=${consts.plan1}`).then((res1) => {
				if (res1.hasOwnProperty('success')) {
					initData('phase');
				} else {
					let ringA = res1.filter((v) => v.ring == 1);
					let ringB = res1.filter((v) => v.ring == 2);
					let mina = 0;
					let maxa = 0;
					let yla = 0;
					let minb = 0;
					let maxb = 0;
					let ylb = 0;

					ringA.forEach((v, i) => {
						let json = new Object();
						if (v.eop == 0) {
							mina += v.minsplit;
							maxa += v.maxsplit;
						} else {
							yla += v.minsplit;

							json.min = mina;
							json.max = maxa;
							json.yl = yla;

							temp[0].push(json);

							(mina = 0), (maxa = 0), (yla = 0);
						}
					});

					ringB.forEach((v, i) => {
						let json = new Object();
						if (v.eop == 0) {
							minb += v.minsplit;
							maxb += v.maxsplit;
						} else {
							ylb += v.minsplit;

							json.min = minb;
							json.max = maxb;
							json.yl = ylb;

							temp[1].push(json);

							(minb = 0), (maxb = 0), (ylb = 0);
						}
					});
					if (!_.isEmpty(res1)) {
						isData[0] = 1;
					}
					isSuccess[0] = 1;
				}
				ajax(`/ntcs_m_phase/GetBy?lcno=${stats.lcno}&planClss=${consts.plan1}`).then((res2) => {
					if (res2.hasOwnProperty('success')) {
						initData('phase');
					} else {
						table1.loadData(makeData(res2, 'phase', temp));
						table1.updateSettings(makeOption('phase'));
						if (!_.isEmpty(res2)) {
							isData[1] = 1;
						}
						isSuccess[1] = 1;
					}
					// 알림
					if (e) {
						if (!isSuccess[0]) {
							document.isSuccess(res1);
						} else if (!isSuccess[1]) {
							document.isSuccess(res2);
						} else if (!isData[0]) {
							document.isSuccess(res1);
						} else if (!isData[1]) {
							document.isSuccess(res2);
						} else {
							document.isSuccess(stats);
						}
					}
				});
			});
		} else {
			ajax(`/NTCS_M_TPLAN/GetBy?LCNO=${stats.lcno}&TPLAN=${consts.plan2}`).then((res3) => {
				if (res3.hasOwnProperty('success')) {
					initData('split');
				} else {
					table2.loadData(makeData(res3, 'split'));
					table2.updateSettings(makeOption('split'));
					if (!_.isEmpty(res3)) {
						isData[2] = 1;
					}
					isSuccess[2] = 1;
				}
				// 알림
				if (e) {
					if (!isSuccess[2] || !isData[2]) {
						document.isSuccess(res3);
					} else {
						document.isSuccess(stats);
					}
				}
			});
		}
	}

	// 초기화
	function initData(sort) {
		if (sort == 'phase') {
			table1.loadData(makeData(null, 'phase'));
		} else {
			table2.loadData(makeData(null, 'split'));
		}
	}

	function initAll() {
		initData('phase');
		initData('split');
	}

	// DB업다운로드
	function upDownData(e) {
		document.createWindow('dbUpDown', false, e, { tabValue: 4, stats: stats });
	}

	// DB저장
	function saveData(sort) {
		if (sort == 'phase') {
			// 현시
			let temp1 = table1.getSourceData(1, 0, 16, 13);
			let arr1 = [];

			temp1.forEach((v, i) => {
				if (Number(v[2]) != 0) {
					let json = {};
					let phase = v[0];
					let ring = v[1] == 'A' ? 1 : 2;

					json.ring = ring;
					json.planclss = consts.plan1;
					json.phaseno = phase;
					json.lcno = stats.lcno;
					json.flownumber = Number(v[2]);
					json.minsplit = Number(v[4]);
					json.maxsplit = Number(v[5]);
					json.yellow = Number(v[6]);
					json.lane = Number(v[7]);
					json.mainphase = Number(v[8]);
					json.mdscontrol = Number(v[9]);
					json.fixedphase = Number(v[10]);
					json.extended = Number(v[11]);
					json.actcontrol = Number(v[12]);
					json.dualflag = Number(v[13]);

					if (iData1) {
						let filter = iData1.filter((v) => v.ring == ring && v.phaseno == phase);
						if (filter.length) {
							json.end_angle = filter[0].end_angle;
							json.head_angle = filter[0].head_angle;
							json.label_lat = filter[0].label_lat;
							json.label_lng = filter[0].label_lng;
						}
					}
					arr1.push(json);
				}
			});

			ajax('/ntcs_m_phase/UpdateMany', 'PUT', arr1).then((res1) => {
				document.isSuccess(res1);
			});
		} else {
			// 스플릿
			let temp2 = table2.getSourceData(1, 0, 32, 13);
			let arr2 = [];

			for (let i = 0; i < 16; i++) {
				let json = {};

				json.tplan = consts.plan2;
				json.tplanindex = i + 1;
				json.lcno = stats.lcno;
				json.asplit1 = Number(temp2[i * 2][5]);
				json.asplit2 = Number(temp2[i * 2][6]);
				json.asplit3 = Number(temp2[i * 2][7]);
				json.asplit4 = Number(temp2[i * 2][8]);
				json.asplit5 = Number(temp2[i * 2][9]);
				json.asplit6 = Number(temp2[i * 2][10]);
				json.asplit7 = Number(temp2[i * 2][11]);
				json.asplit8 = Number(temp2[i * 2][12]);
				json.bsplit1 = Number(temp2[i * 2 + 1][5]);
				json.bsplit2 = Number(temp2[i * 2 + 1][6]);
				json.bsplit3 = Number(temp2[i * 2 + 1][7]);
				json.bsplit4 = Number(temp2[i * 2 + 1][8]);
				json.bsplit5 = Number(temp2[i * 2 + 1][9]);
				json.bsplit6 = Number(temp2[i * 2 + 1][10]);
				json.bsplit7 = Number(temp2[i * 2 + 1][11]);
				json.bsplit8 = Number(temp2[i * 2 + 1][12]);
				json.offset = Number(temp2[i * 2][3]);

				if (iData2.length == 0) {
					json.datamodetype = 1;
				} else {
					json.datamodetype = 2;
				}

				arr2.push(json);
			}
			ajax(`/NTCS_M_TPLAN/UpdateManyCustom`, 'PUT', arr2).then((res2) => {
				document.isSuccess(res2);
			});
		}
	}

	// 초기 조회
	onMount(() => {
		// 센터
		searchData(null, 'phase');
		searchData(null, 'split');
	});
</script>

<div class="tabPage">
	<div class="tabContent">
		<div class="phase">
			<Legend legend="현시구성" color="#DADDE1">
				<div>
					<Table
						bind:wrapper={elems.table1}
						bind:table={table1}
						data={data1}
						width={'100%'}
						height={'208px'}
						option={option1}
					/>
				</div>
			</Legend>
		</div>
	</div>
	<div class="tabButton">
		<div>
			<Button icon="search" on:click={(e) => searchData(e, 'phase')}>조회</Button>
			<Button icon="init" on:click={() => initData('phase')}>초기화</Button>
			<Button icon="save2db" on:click={() => saveData('phase')}>DB저장</Button>
		</div>
		<div>
			<div>
				<div>현시구성 계획</div>
				<div class="sel">
					<select bind:value={selected1} on:change={DropDown1} class="static">
						{#each consts.option1 as i}
							<option value={i.id}>
								{i.text}
							</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	</div>
	<div class="tabContent">
		<div class="split">
			<Legend legend="스플릿구성" color="#DADDE1">
				<div>
					<Table
						bind:wrapper={elems.table2}
						bind:table={table2}
						data={data2}
						width={'100%'}
						height={'346px'}
						option={option2}
					/>
				</div>
			</Legend>
		</div>
	</div>
	<div class="tabButton">
		<div>
			<Button icon="search" on:click={(e) => searchData(e, 'split')}>조회</Button>
			<Button icon="init" on:click={() => initData('split')}>초기화</Button>
			<Button icon="save2db" on:click={() => saveData('split')}>DB저장</Button>
		</div>
		<div>
			<div>
				<div>스플릿구성 계획</div>
				<div class="sel">
					<select bind:value={selected2} on:change={DropDown2} class="static">
						{#each consts.option2 as i}
							<option value={i.id}>
								{i.text}
							</option>
						{/each}
					</select>
				</div>
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

	/* 현시구성 */
	.tabPage .tabContent > :global(div.phase > fieldset) {
		height: 208px;
		padding: 0;
	}

	.tabPage .tabContent :global(div.phase > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 208px;
		overflow: hidden;
	}

	/* 스플릿구성 */
	.tabPage .tabContent > :global(div.split > fieldset) {
		height: 346px;
		padding: 0;
	}

	.tabPage .tabContent :global(div.split > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 346px;
		overflow: hidden;
	}

	/* 버튼 */
	.tabButton {
		display: grid;
		grid-template-columns: max-content auto 100px;
		grid-column-gap: 10px;
	}

	.tabButton > div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 80px 90px;
		grid-column-gap: 5px;
	}

	.tabButton > div:nth-child(2) {
		display: grid;
		grid-template-columns: 180px 185px;
		grid-column-gap: 5px;
	}

	.tabButton > div:nth-child(2) > div:nth-child(1) {
		display: grid;
		grid-template-columns: 100px 100px;
		grid-column-gap: 5px;
		align-items: center;
	}

	.tabButton > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) {
		font-size: 1.3rem;
		text-align: center;
	}

	.tabButton > div:nth-child(2) > div:nth-child(2) {
		display: grid;
		grid-template-columns: 100px 100px;
		grid-column-gap: 5px;
		align-items: center;
	}

	.tabButton > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) {
		font-size: 1.3rem;
		text-align: center;
	}

	.tabButton > div:nth-child(3) {
		display: grid;
		grid-template-columns: 100px;
		justify-content: end;
	}

	/* Headers */
	/* 현시구성 */
	.tabPage .tabContent > :global(div.phase > fieldset .handsontable tr:first-child td),

    /* 스플릿구성 */
    .tabPage .tabContent > :global(div.split > fieldset .handsontable tr:first-child td) {
		color: #999999;
		background: #f4f7f9;
	}

	.tabPage .tabContent > :global(div.split > fieldset .handsontable td) {
		text-align: center !important;
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
