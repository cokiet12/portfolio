<svelte:options accessors />

<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { devuimode } from '$lib/store.mjs';
	import { ajax } from '/src/lib/js/functions.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';

	export let winMode = false;

	const consts = {};
	let stats = {
		lcno: 1,
		checked1: 1,
		checked2: false
	};
	let elems = {
		table1: null,
		table2: null,
		btn1: null,
		btn2: null
	};
	let table1;
	let table2;

	let param = {
		lcno: 1,
		sano: 1,
		year: 2010
	};

	$: searchEvent(param);

	let SelectedLcno = 0;

	function searchEvent(stat) {
		console.log(stat.lcno);
		SelectedLcno = stat.lcno;
		AlgoSearch(table1, table2, SelectedLcno, 1);
	}

	let leftAlgorithm = [
		['주기산정', '주기결정방법', ''],
		['', '주기상수', ''],
		['', '강제TRC', ''],
		['정체도 기준', '정체기준', ''],
		['', '지체기준', ''],
		['', '소통원활', ''],
		['FDS적용비율', '현재주기', ''],
		['', '1전주기', ''],
		['', '2전주기', ''],
		['주기\n결정상수', '하한포화도', ''],
		['', '상한포화도', ''],
		['', '하한주기길이', ''],
		['', '상한주기길이', ''],
		['', '적용축설정', ''],
		['유출입설정', '1축 유입이동류', ''],
		['', '1축 유출이동류', ''],
		['', '2축 유입이동류', ''],
		['', '2축 유출이동류', '']
	];

	let rightAlgorithm = [
		['과포화\n제어옵션', '주기 보정여부', ''],
		['', '녹색시간 보정여부', ''],
		['', '앞막힘 제어여부', ''],
		['', '앞막힘 제어방법', ''],
		['램프제어', '간선부 혼잡시제어', ''],
		['', '옵셋 제어방법', ''],
		['', '형평 옵셋', ''],
		['', '진출 옵셋', ''],
		['', '램프 교차로방향', ''],
		['', '램프 할당녹색비', ''],
		['대기길이', '현재주기 가중치', ''],
		['', '1전주기 가중치', ''],
		['', '2전주기 가중치', ''],
		['녹색시간', '보정방법', ''],
		['', '반영비율', ''],
		['포화도\n정체기준', '정체', ''],
		['', '원활', '']
	];

	let leftTableOption = [
		{ row: 0, col: 0, rowspan: 3, colspan: 1 },
		{ row: 3, col: 0, rowspan: 3, colspan: 1 },
		{ row: 6, col: 0, rowspan: 3, colspan: 1 },
		{ row: 9, col: 0, rowspan: 5, colspan: 1 },
		{ row: 14, col: 0, rowspan: 4, colspan: 1 }
	];

	let CellOption = function (row, col, prop) {
		var cellProperties = {};
		if (col < 2) {
			cellProperties.readOnly = true;
		}
		return cellProperties;
	};

	let rightTableOption = [
		{ row: 0, col: 0, rowspan: 4, colspan: 1 },
		{ row: 4, col: 0, rowspan: 6, colspan: 1 },
		{ row: 10, col: 0, rowspan: 3, colspan: 1 },
		{ row: 13, col: 0, rowspan: 2, colspan: 1 },
		{ row: 15, col: 0, rowspan: 2, colspan: 1 }
	];

	let leftjson = [
		{
			index: 0,
			name: 'mdsselect',
			value: ['최대', '평균']
		},
		{
			index: 2,
			name: 'forcetrc',
			value: ['미적용', '적용']
		},
		{
			index: 13,
			name: 'asamaxismain',
			value: ['1축', '2축']
		}
	];

	let rightjson = [
		{
			index: 0,
			name: 'stoscntl1',
			value: ['미사용', '사용']
		},
		{
			index: 1,
			name: 'stoscntl2',
			value: ['미사용', '사용']
		},
		{
			index: 2,
			name: 'stoscntl3',
			value: ['미사용', '사용']
		},
		{
			index: 3,
			name: 'stoscntl4',
			value: ['미터링', '형편옵셋']
		},
		{
			index: 4,
			name: 'rampcntlflag',
			value: ['중지', '계속']
		},
		{
			index: 5,
			name: 'rampcntloffsetmtd',
			value: ['간선우선', '전용우선']
		},
		{
			index: 8,
			name: 'rampcntldostdir',
			value: ['북', '동', '남', '서']
		},
		{
			index: 13,
			name: 'gtcompmethod',
			value: ['안 함', 'N_FDS', '대기길이']
		}
	];

	function StrNum(str) {
		switch (str) {
			//Left
			case '최대':
				return 1;
			case '평균':
				return 2;

			case '미적용':
				return 0;
			case '적용':
				return 1;

			case '1축':
				return 1;
			case '2축':
				return 2;

			//Right
			case '미사용':
				return 0;
			case '사용':
				return 1;

			case '미터링':
				return 1;
			case '형편옵셋':
				return 2;

			case '중지':
				return 0;
			case '계속':
				return 1;

			case '간선우선':
				return 1;
			case '전용우선':
				return 2;

			case '북':
				return 1;
			case '동':
				return 2;
			case '남':
				return 3;
			case '서':
				return 4;

			case '안 함':
				return 0;
			case 'N_FDS':
				return 1;
			case '대기길이':
				return 2;
		}
	}

	function NumStr(num, type) {
		switch (type) {
			case 0:
				if (num == 1) {
					return '최대';
				} else if (num == 2) {
					return '평균';
				}
			case 1:
				if (num == 0) {
					return '미적용';
				} else if (num == 1) {
					return '적용';
				}
			case 2:
				if (num == 1) {
					return '1축';
				} else if (num == 2) {
					return '2축';
				}
			case 3:
				if (num == 0) {
					return '미사용';
				} else if (num == 1) {
					return '사용';
				}
			case 4:
				if (num == 1) {
					return '미터링';
				} else if (num == 2) {
					return '형편옵셋';
				}
			case 5:
				if (num == 0) {
					return '중지';
				} else if (num == 1) {
					return '계속';
				}
			case 6:
				if (num == 1) {
					return '간선우선';
				} else if (num == 2) {
					return '전용우선';
				}
			case 7:
				if (num == 1) {
					return '북';
				} else if (num == 2) {
					return '동';
				} else if (num == 3) {
					return '남';
				} else if (num == 4) {
					return '서';
				}
			case 8:
				if (num == 0) {
					return '안 함';
				} else if (num == 1) {
					return 'N_FDS';
				} else if (num == 2) {
					return '대기길이';
				}
		}
	}

	function makeOption(L) {
		let optionL = [];
		let optionR = [];

		leftjson.forEach((v, i) => {
			optionL.push({ row: v.index, col: 2, type: 'dropdown', source: v.value });
		});

		rightjson.forEach((v, i) => {
			optionR.push({ row: v.index, col: 2, type: 'dropdown', source: v.value });
		});

		console.log(optionL);
		console.log(optionR);

		if (L == 0) {
			return { cell: optionL };
		} else {
			return { cell: optionR };
		}
	}

	function AlgoInit(table1, table2) {
		console.log('Init');
		let resLeft = JSON.parse(JSON.stringify(leftAlgorithm));

		resLeft[0][2] = '최대';
		resLeft[1][2] = 0;
		resLeft[2][2] = `미적용`;
		resLeft[3][2] = 0;
		resLeft[4][2] = 0;
		resLeft[5][2] = 0;
		resLeft[6][2] = 0;
		resLeft[7][2] = 0;
		resLeft[8][2] = 0;
		resLeft[9][2] = 0;
		resLeft[10][2] = 0;
		resLeft[11][2] = 0;
		resLeft[13][2] = `1축`;
		resLeft[12][2] = 0;
		resLeft[14][2] = 0;
		resLeft[15][2] = 0;
		resLeft[16][2] = 0;
		resLeft[17][2] = 0;

		let resRight = JSON.parse(JSON.stringify(rightAlgorithm));

		resRight[0][2] = `미사용`;
		resRight[1][2] = `미사용`;
		resRight[2][2] = `미사용`;
		resRight[3][2] = `미터링`;
		resRight[4][2] = `중지`;
		resRight[5][2] = `간선우선`;
		resRight[6][2] = 0;
		resRight[7][2] = 0;
		resRight[8][2] = `북`;
		resRight[9][2] = 0;
		resRight[10][2] = 0;
		resRight[11][2] = 0;
		resRight[12][2] = 0;
		resRight[13][2] = `안 함`;
		resRight[14][2] = 0;
		resRight[15][2] = 0;
		resRight[16][2] = 0;

		table1.loadData(resLeft);
		table2.loadData(resRight);
		table1.updateSettings(makeOption(0));
		table2.updateSettings(makeOption(1));
	}

	function AlgoSearch(table1, table2, lc, i) {
		const Cr = lc;
		let resLeft = JSON.parse(JSON.stringify(leftAlgorithm));
		let resRight = JSON.parse(JSON.stringify(rightAlgorithm));

		ajax('/NTCS_M_ALGORITHM/GetBy' + `?LCNO=${Cr}`).then((res) => {
			console.log(res);
			if (res.length) {
				const v = res[0];

				resLeft[0][2] = NumStr(v.mdsselect, 0);
				resLeft[1][2] = v.alpha;
				resLeft[2][2] = NumStr(v.forcetrc, 1);
				resLeft[3][2] = v.condegree1;
				resLeft[4][2] = v.condegree2;
				resLeft[5][2] = v.condegree3;
				resLeft[6][2] = v.fdsfactor1;
				resLeft[7][2] = v.fdsfactor2;
				resLeft[8][2] = v.fdsfactor3;
				resLeft[9][2] = v.fccly1;
				resLeft[10][2] = v.fccly2;
				resLeft[11][2] = v.fcclc1;
				resLeft[12][2] = v.fcclc2;
				resLeft[13][2] = NumStr(v.asamaxismain, 2);
				resLeft[14][2] = v.asaminflow1;
				resLeft[15][2] = v.asamoutflow1;
				resLeft[16][2] = v.asaminflow2;
				resLeft[17][2] = v.asamoutflow2;

				resRight[0][2] = NumStr(v.stoscntl1, 3);
				resRight[1][2] = NumStr(v.stoscntl2, 3);
				resRight[2][2] = NumStr(v.stoscntl3, 3);
				resRight[3][2] = NumStr(v.stoscntl4, 4);
				resRight[4][2] = NumStr(v.rampcntlflag, 5);
				resRight[5][2] = NumStr(v.rampcntloffsetmtd, 6);
				resRight[6][2] = v.rampcntlbaloffset;
				resRight[7][2] = v.rampcntloutoffset;
				resRight[8][2] = NumStr(v.rampcntldostdir, 7);
				resRight[9][2] = v.rampkvalue;
				resRight[10][2] = v.wtcurcyclewb;
				resRight[11][2] = v.wtprecyclewb1;
				resRight[12][2] = v.wtprecyclewb2;
				resRight[13][2] = NumStr(v.gtcompmethod, 8);
				resRight[14][2] = v.gtapplyratio;
				resRight[15][2] = v.dsdegree1;
				resRight[16][2] = v.dsdegree2;

				table1.loadData(resLeft);
				table2.loadData(resRight);
				table1.updateSettings(makeOption(0));
				table2.updateSettings(makeOption(1));
				if (i != 0) {
					document.isSuccess(res);
				}
			} else {
				AlgoInit(table1, table2);
				if (i != 0) {
					document.isSuccess(res);
				}
			}
		});
	}

	function AlgoSave(table1, table2, lc) {
		let resLeft = table1.getSourceData(0, 2, 17, 2);
		let resRight = table2.getSourceData(0, 2, 16, 2);
		let algoJson = {
			lcno: lc,
			mdsselect: StrNum(resLeft[0][0]),
			alpha: resLeft[1][0],
			forcetrc: StrNum(resLeft[2][0]),
			condegree1: resLeft[3][0],
			condegree2: resLeft[4][0],
			condegree3: resLeft[5][0],
			fdsfactor1: resLeft[6][0],
			fdsfactor2: resLeft[7][0],
			fdsfactor3: resLeft[8][0],
			fccly1: resLeft[9][0],
			fccly2: resLeft[10][0],
			fcclc1: resLeft[11][0],
			fcclc2: resLeft[12][0],
			asamaxismain: StrNum(resLeft[13][0]),
			asaminflow1: resLeft[14][0],
			asamoutflow1: resLeft[15][0],
			asaminflow2: resLeft[16][0],
			asamoutflow2: resLeft[17][0],

			stoscntl1: StrNum(resRight[0][0]),
			stoscntl2: StrNum(resRight[1][0]),
			stoscntl3: StrNum(resRight[2][0]),
			stoscntl4: StrNum(resRight[3][0]),
			rampcntlflag: StrNum(resRight[4][0]),
			rampcntloffsetmtd: StrNum(resRight[5][0]),
			rampcntlbaloffset: resRight[6][0],
			rampcntloutoffset: resRight[7][0],
			rampcntldostdir: StrNum(resRight[8][0]),
			rampkvalue: resRight[9][0],
			wtcurcyclewb: resRight[10][0],
			wtprecyclewb1: resRight[11][0],
			wtprecyclewb2: resRight[12][0],
			gtcompmethod: StrNum(resRight[13][0]),
			gtapplyratio: resRight[14][0],
			dsdegree1: resRight[15][0],
			dsdegree2: resRight[16][0]
		};
		console.log(algoJson);

		ajax('/NTCS_M_ALGORITHM/GetBy' + `?LCNO=${lc}`).then((res) => {
			if (res.length) {
				ajax('/NTCS_M_ALGORITHM', 'PUT', algoJson).then((result) => {
					console.log(result);
					document.isSuccess(result);
				});
			} else {
				ajax('/NTCS_M_ALGORITHM', 'POST', algoJson).then((result) => {
					console.log(result);
					document.isSuccess(result);
				});
			}
		});
	}

	onMount(() => {
		AlgoSearch(table1, table2, SelectedLcno, 0);
	});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="srhtap">
			<Searcher
				onChoose={(no) => {
					param = no;
				}}
			/>
		</div>
		<div />
		<div class="tabletap">
			<div class="table1">
				<Table
					bind:wrapper={elems.table1}
					bind:table={table1}
					data={leftAlgorithm}
					option={{
						width: '100%',
						colWidths: ['34px', '42px', '60px'],
						colHeaders: false,
						rowHeaders: false,
						cells: CellOption,
						rowHeights: 30,
						mergeCells: leftTableOption,
						height: '551px',
						renderAllRows: true
					}}
				/>
			</div>
			<div class="table2">
				<Table
					bind:wrapper={elems.table2}
					bind:table={table2}
					data={rightAlgorithm}
					option={{
						width: '100%',
						colWidths: ['34px', '42px', '60px'],
						colHeaders: false,
						rowHeaders: false,
						cells: CellOption,
						rowHeights: 30,
						mergeCells: rightTableOption,
						height: '551px',
						renderAllRows: true
					}}
				/>
			</div>
		</div>
		<div />
		<div class="btntap">
			<Button icon="search" on:click={AlgoSearch(table1, table2, SelectedLcno, 1)}>조회</Button>
			<div />
			<Button icon="init" on:click={AlgoInit(table1, table2)}>초기화</Button>
			<div />
			<Button icon="save2db" on:click={AlgoSave(table1, table2, SelectedLcno)} colored={true}
				>저장</Button
			>
		</div>
	</div>
</div>

<style>
	#main {
		min-width: 700px;
		min-height: 600px;
		font-size: 1.3rem;
		background-color: #f9fafb;
		padding: 15px;
		overflow: auto;
	}

	.EntireDiv {
		display: grid;
		grid-template-rows: 34px 10px calc(100% - 88px) 10px 34px;
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #dbe2e6;
		border-radius: 6px;
		background-color: #fff;
		padding: 15px;
		overflow: auto;
	}

	#main.win {
		width: 700px;
		height: 671px;
	}

	.table1,
	.table2 {
		overflow: hidden;
	}

	.tabletap {
		display: grid;
		grid-template-columns: 1fr 1fr;
		overflow: auto;
	}

	.tabletap :global(.handsontable td.htAutocomplete .htAutocompleteArrow) {
		color: #ccc;
	}

	.tabletap :global(.tableWrapper textarea) {
		text-align: center;
	}

	.tabletap :global(.tableWrapper .autocompleteEditor .listbox) {
		height: 23px !important;
	}

	.tabletap :global(.handsontable tr td:first-child),
	.tabletap :global(.handsontable tr td:nth-child(2)) {
		color: #999999;
		background: #f4f7f9;
	}
	.tabletap :global(.handsontable tr td:nth-child(2)) {
		text-align: right;
	}
	.table1 :global(.handsontable td) {
		color: #777777;
		height: 29.2px;
	}
	.table2 :global(.handsontable td) {
		color: #777777;
		height: 30.6px;
	}

	.table2 :global(.handsontable tr:nth-child(10)),
	.table2 :global(.handsontable tr:nth-child(11)),
	.table2 :global(.handsontable tr:nth-child(12)),
	.table2 :global(.handsontable tr:nth-child(13)) {
		height: 33px;
	}

	.btntap {
		display: grid;
		grid-template-columns: 11% 5px 11% calc(67% - 5px) 11%;
		align-items: end;
		overflow: auto;
	}
	/* .table1 {
        width: 100%;
    }
    .table2 {
        width: 100%;
    } */
</style>
