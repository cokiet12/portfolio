<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Legend from '$lib/nested/legend.svelte';
	import Table from '$lib/nested/table.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax, NsetLog, cbUrl_success, cbUrl_fail } from '$lib/js/functions.mjs';
	import { userId } from '$lib/store.mjs';
	import _ from 'lodash';

	const consts = {};
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
	// Table
	// DIR
	export let table1;
	export let table2;

	// LSU
	export let table3;
	export let table4;

	// Initial Datas
	let iData1;
	let iData2;

	// Datas
	// DIR
	let data1 = [];
	let data2 = [];

	// LSU
	let data3 = [];
	let data4 = [];

	// Option
	let option1 = {
		colWidths: [
			31, 43, 33, 33, 20, 22, 20, 22, 20, 22, 20, 22, 20, 22, 20, 22, 20, 22, 20, 22, 20, 22, 20, 22
		],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true
	};
	let option2 = {
		colWidths: [48, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true
	};

	// Compare
	let compare = [[], []];

	// Search Event
	function searchEvent(stat) {
		if (table1 && table3) {
			initAll('center');

			setTimeout(function () {
				searchData();
			}, 500);
		}

		if (table2 && table4) {
			initAll('local');
		}
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

	// 데이터 변경(dir)
	function ntos1(arr) {
		let res = JSON.parse(JSON.stringify(arr));

		let temp1 = [
			'정지선',
			'보행신호 있는 일반 연등',
			'보행신호 없는 상시고정점멸 연등',
			'시차제로 상시 점멸되는 연등'
		];
		let temp2 = ['X', 'G1', 'G2'];
		let temp3 = ['A링', 'B링'];

		function x(v) {
			v = v == 0 ? '' : v;
			return v;
		}

		res.forEach((v, i) => {
			v.insyn = temp1[v.insyn];

			v.golsu = v.gosort == 0 ? '' : v.golsu + 1;
			v.gosort = v.gosort == 0 ? '' : temp2[v.gosort];

			v.leftlsu = v.leftsort == 0 ? '' : v.leftlsu + 1;
			v.leftsort = v.leftsort == 0 ? '' : temp2[v.leftsort];

			v.pedlsu = v.pedsort == 0 ? '' : v.pedlsu + 1;
			v.pedsort = v.pedsort == 0 ? '' : temp2[v.pedsort];

			v.bikelsu = v.bikesort == 0 ? '' : v.bikelsu + 1;
			v.bikesort = v.bikesort == 0 ? '' : temp2[v.bikesort];

			v.rightlsu = v.rightsort == 0 ? '' : v.rightlsu + 1;
			v.rightsort = v.rightsort == 0 ? '' : temp2[v.rightsort];

			v.buslsu = v.bussort == 0 ? '' : v.buslsu + 1;
			v.bussort = v.bussort == 0 ? '' : temp2[v.bussort];

			v.genphase = x(v.genphase);
			v.spcphase = x(v.spcphase);

			v.genring = temp3[v.genring];
			v.spcring = temp3[v.spcring];

			v.pedsolid = x(v.pedsolid);
			v.pedflash = x(v.pedflash);
		});

		return res;
	}

	// 데이터 변경(dir)
	function ston1(arr) {
		let res = JSON.parse(JSON.stringify(arr));

		let temp1 = [
			'정지선',
			'보행신호 있는 일반 연등',
			'보행신호 없는 상시고정점멸 연등',
			'시차제로 상시 점멸되는 연등'
		];
		let temp2 = ['X', 'G1', 'G2'];
		let temp3 = ['A링', 'B링'];

		for (let i = 0; i < 10; i++) {
			let n = i * 2;
			res[0][n] = res[0][n] == 'FALSE' || res[0][n] == false ? 0 : 1;
			res[1][n] = res[1][n] == 'FALSE' || res[1][n] == false ? 0 : 1;
			res[2][n] = res[2][n] == 'FALSE' || res[2][n] == false ? 0 : 1;
			res[3][n] = res[3][n] == '' || res[3][n] == undefined ? 0 : temp1.indexOf(res[3][n]);

			res[4][n] = res[4][n] === '' ? 0 : res[4][n] - 1;
			res[4][n + 1] = res[4][n + 1] === '' ? 0 : temp2.indexOf(res[4][n + 1]);

			res[5][n] = res[5][n] === '' ? 0 : res[5][n] - 1;
			res[5][n + 1] = res[5][n + 1] === '' ? 0 : temp2.indexOf(res[5][n + 1]);

			res[6][n] = res[6][n] === '' ? 0 : res[6][n] - 1;
			res[6][n + 1] = res[6][n + 1] === '' ? 0 : temp2.indexOf(res[6][n + 1]);

			res[7][n] = res[7][n] === '' ? 0 : res[7][n] - 1;
			res[7][n + 1] = res[7][n + 1] === '' ? 0 : temp2.indexOf(res[7][n + 1]);

			res[8][n] = res[8][n] === '' ? 0 : res[8][n] - 1;
			res[8][n + 1] = res[8][n + 1] === '' ? 0 : temp2.indexOf(res[8][n + 1]);

			res[9][n] = res[9][n] === '' ? 0 : res[9][n] - 1;
			res[9][n + 1] = res[9][n + 1] === '' ? 0 : temp2.indexOf(res[9][n + 1]);

			res[10][n] = res[10][n] === '' ? 0 : res[10][n];
			res[11][n] = res[11][n] === '' ? 0 : res[11][n];
			res[12][n] = res[12][n] === '' ? 0 : temp3.indexOf(res[12][n]);
			res[13][n] = res[13][n] === '' ? 0 : temp3.indexOf(res[13][n]);
			res[14][n] = res[14][n] === '' ? 0 : res[14][n];
			res[15][n] = res[15][n] === '' ? 0 : res[15][n];
		}

		return res;
	}

	// 데이터 변경(lsu)
	function ston2(arr) {
		let res = JSON.parse(JSON.stringify(arr));

		res.forEach((v, i) => {
			if (v == '4색') {
				res[i] = 1;
			} else {
				res[i] = 0;
			}
		});

		return res;
	}

	// 데이터 생성
	function makeData(res, sort) {
		let _data;
		if (sort == 'dir') {
			_data = [
				[
					'출력방향',
					'',
					'',
					'',
					'북',
					'',
					'동',
					'',
					'남',
					'',
					'서',
					'',
					'북동',
					'',
					'남동',
					'',
					'남서',
					'',
					'북서',
					'',
					'예비1',
					'',
					'예비2',
					''
				],
				[
					'설치',
					'',
					'차량',
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					''
				],
				[
					'설치',
					'',
					'보행/자전거',
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					''
				],
				[
					'설치',
					'',
					'보행자장치',
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					'',
					false,
					''
				],
				[
					'설치',
					'',
					'설치구분',
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
					'',
					'',
					'',
					'',
					'',
					''
				],
				[
					'출력',
					'직진',
					'LSU',
					'종류',
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
					'',
					'',
					'',
					'',
					''
				],
				[
					'출력',
					'좌회전',
					'LSU',
					'종류',
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
					'',
					'',
					'',
					'',
					''
				],
				[
					'출력',
					'보행자',
					'LSU',
					'종류',
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
					'',
					'',
					'',
					'',
					''
				],
				[
					'출력',
					'자전거',
					'LSU',
					'종류',
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
					'',
					'',
					'',
					'',
					''
				],
				[
					'출력',
					'우회전',
					'LSU',
					'종류',
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
					'',
					'',
					'',
					'',
					''
				],
				[
					'출력',
					'버스',
					'LSU',
					'종류',
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
					'',
					'',
					'',
					'',
					''
				],
				[
					'보행작동장치',
					'',
					'일반제현시',
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
					'',
					'',
					'',
					'',
					'',
					''
				],
				[
					'',
					'',
					'시차제현시',
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
					'',
					'',
					'',
					'',
					'',
					''
				],
				[
					'',
					'',
					'일반제링',
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
					'',
					'',
					'',
					'',
					'',
					''
				],
				[
					'',
					'',
					'시차제링',
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
					'',
					'',
					'',
					'',
					'',
					''
				],
				[
					'연등보행시간',
					'',
					'SOLID',
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
					'',
					'',
					'',
					'',
					'',
					'',
					''
				],
				[
					'',
					'',
					'FLASH',
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
					'',
					'',
					'',
					'',
					'',
					'',
					''
				]
			];
		} else {
			_data = [
				[
					'LSU',
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
					'16'
				],
				['등기', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
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
				if (sort == 'dir') {
					iData1 = res;
					let _res = ntos1(res);
					_res.forEach((v, i) => {
						let dl = i * 2 + 4;
						let dr = i * 2 + 5;

						_data[1][dl] = TrueFalse(v.vehyn);
						_data[2][dl] = TrueFalse(v.pedbikeyn);
						_data[3][dl] = TrueFalse(v.pedyn);
						_data[4][dl] = v.insyn;
						_data[5][dl] = v.golsu;
						_data[5][dr] = v.gosort;
						_data[6][dl] = v.leftlsu;
						_data[6][dr] = v.leftsort;
						_data[7][dl] = v.pedlsu;
						_data[7][dr] = v.pedsort;
						_data[8][dl] = v.bikelsu;
						_data[8][dr] = v.bikesort;
						_data[9][dl] = v.rightlsu;
						_data[9][dr] = v.rightsort;
						_data[10][dl] = v.buslsu;
						_data[10][dr] = v.bussort;
						if (v.genphase == '') {
							_data[11][dl] = v.genphase;
							_data[13][dl] = '';
						} else {
							_data[11][dl] = v.genphase;
							_data[13][dl] = v.genring;
						}
						if (v.spcphase == '') {
							_data[12][dl] = v.spcphase;
							_data[14][dl] = '';
						} else {
							_data[12][dl] = v.spcphase;
							_data[14][dl] = v.spcring;
						}
						_data[15][dl] = v.pedsolid;
						_data[16][dl] = v.pedflash;
					});
				} else {
					iData2 = res;
					res.forEach((v, i) => {
						for (i = 1; i < 17; i++) {
							if (i < 10) {
								_data[1][i] = v[`lsu0${i}lamp`] == 0 ? '3색' : '4색';
							} else {
								_data[1][i] = v[`lsu${i}lamp`] == 0 ? '3색' : '4색';
							}
						}
					});
				}
			} else {
				if (sort == 'dir') {
					iData1 = undefined;
				} else {
					iData2 = undefined;
				}
			}
		}

		return _data;
	}
	function TrueFalse(a) {
		if (a == 1) return true;
		else {
			return false;
		}
	}

	// 기본 옵션 생성
	function makeOption(sort) {
		let optionM;
		let optionC;
		let result;

		if (sort == 'dir') {
			optionM = [
				{ row: 0, col: 0, rowspan: 1, colspan: 4 },
				{ row: 1, col: 0, rowspan: 4, colspan: 2 },
				{ row: 5, col: 0, rowspan: 6, colspan: 1 },
				{ row: 11, col: 0, rowspan: 4, colspan: 2 },
				{ row: 15, col: 0, rowspan: 2, colspan: 2 }
			];

			for (let i = 1; i < 5; i++) {
				optionM.push({ row: i, col: 2, rowspan: 1, colspan: 2 });
			}

			for (let i = 11; i < 17; i++) {
				optionM.push({ row: i, col: 2, rowspan: 1, colspan: 2 });
			}

			for (let i = 0; i < 5; i++) {
				optionM.push({ row: i, col: 4, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 6, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 8, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 10, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 12, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 14, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 16, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 18, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 20, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 22, rowspan: 1, colspan: 2 });
			}

			for (let i = 11; i < 17; i++) {
				optionM.push({ row: i, col: 4, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 6, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 8, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 10, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 12, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 14, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 16, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 18, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 20, rowspan: 1, colspan: 2 });
				optionM.push({ row: i, col: 22, rowspan: 1, colspan: 2 });
			}

			optionC = function (row, col, prop) {
				let cellProperties = {};
				if (col > 3 && (row == 1 || row == 2 || row == 3)) {
					cellProperties.type = 'checkbox';
				}
				if (col > 3 && row == 4) {
					cellProperties.editor = 'select';
					cellProperties.selectOptions = [
						'정지선',
						'보행신호 있는 일반 연등',
						'보행신호 없는 상시고정점멸 연등',
						'시차제로 상시 점멸되는 연등'
					];
				}
				if (col > 3 && col % 2 == 1 && row >= 5 && row <= 10) {
					cellProperties.editor = 'select';
					cellProperties.selectOptions = ['X', 'G1', 'G2'];
				}
				if (col > 1 && (row == 13 || row == 14)) {
					cellProperties.editor = 'select';
					cellProperties.selectOptions = ['A링', 'B링'];
				}
				cellProperties.readOnly = true;
				return cellProperties;
			};

			result = { mergeCells: optionM, cells: optionC };
		} else {
			optionC = function (row, col, prop) {
				let cellProperties = {};

				if (col > 0 && row == 1) {
					cellProperties.editor = 'select';
					cellProperties.selectOptions = ['3색', '4색'];
				}
				cellProperties.readOnly = true;
				return cellProperties;
			};

			result = { cells: optionC };
		}

		return result;
	}

	// 조회
	function searchData(e) {
		let cnt = 2;
		let isSuccess = new Array(cnt).fill(0);
		let isData = new Array(cnt).fill(0);

		ajax(`/ntcs_m_outped/${stats.lcno}`).then((res1) => {
			// 요청 실패
			if (res1.hasOwnProperty('success')) {
				initData(table1, 'dir');
			}
			// 요청 성공
			else {
				table1.loadData(makeData(res1, 'dir'));
				table1.updateSettings(makeOption('dir'));
				if (!_.isEmpty(res1)) {
					isData[0] = 1;
				}
				isSuccess[0] = 1;
			}
			ajax(`/ntcs_m_lsu/get-by-lcno?lcNo=${stats.lcno}`).then((res2) => {
				// 요청 실패
				if (res2.hasOwnProperty('success')) {
					initData(table3, 'lsu');
				}
				// 요청 성공
				else {
					table3.loadData(makeData(res2, 'lsu'));
					table3.updateSettings(makeOption('lsu'));
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
	}

	// 초기화
	function initData(table, sort) {
		if (sort == 'dir') {
			table.loadData(makeData(null, 'dir'));
			table.updateSettings(makeOption('dir'));
		} else {
			table.loadData(makeData(null, 'lsu'));
			table.updateSettings(makeOption('lsu'));
		}
	}

	// 전체 초기화
	function initAll(sort) {
		if (sort == 'center') {
			initData(table1, 'dir');
			initData(table3, 'lsu');
		} else {
			initData(table2, 'dir');
			initData(table4, 'lsu');
		}
	}

	// 편집
	function editData(e) {
		document.createWindow('dbEdit', false, e, { tabValue: 7, stats: stats });
	}

	// 검증
	function compareData() {
		// "" == null == undefined 를 비교하는건 무의미
		// 두 테이블 전부 다 "", null, undefined 이면, 비교 X
		// 한 테이블이라도 숫자나 유효한 문자가 있으면 비교 O
		let temp1 = new Array();
		let temp2 = new Array();

		let centerD = table1.getSourceData();
		let localD = table2.getSourceData();
		let centerL = table3.getSourceData();
		let localL = table4.getSourceData();

		// 초기화
		for (let i in compare[0]) {
			table1.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', '');
			table2.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', '');
		}

		for (let i in compare[1]) {
			table3.setCellMeta(compare[1][i].row, compare[1][i].col, 'className', '');
			table4.setCellMeta(compare[1][i].row, compare[1][i].col, 'className', '');
		}

		compare = [];

		// 검증
		for (let i = 1; i < 17; i++) {
			for (let j = 4; j < 24; j++) {
				let diff1 = new Object();
				if (centerD[i][j] !== localD[i][j]) {
					diff1.row = i;
					diff1.col = j;
					temp1.push(diff1);
				}
			}
		}

		for (let i = 1; i < 2; i++) {
			for (let j = 1; j < 17; j++) {
				let diff2 = new Object();
				if (centerL[i][j] !== localL[i][j]) {
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
			table2.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', 'diff');
		}

		for (let i in compare[1]) {
			table3.setCellMeta(compare[1][i].row, compare[1][i].col, 'className', 'diff');
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
		document.callTcp('/dirped_dw', [stats.lcno], (res) => {
			console.log('방향별출력맵 : ', res);
			if (res.done && res[0].ok == 1) {
				const result = cbUrl_success('/dirped_dw', stats.lcno);
				const json = NsetLog({ data: result });
				ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
			} else {
				if (!res.done) {
					const result = cbUrl_fail('/dirped_dw', stats.lcno);
					const json = NsetLog({ data: result });
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				}
			}
		});
	}

	// 업로드(TCP)
	function uploadData() {
		document.callTcp('/dirped_up', [stats.lcno], (res) => {
			if (res[0].data) {
				console.log('방향별출력맵 : ', res);
				if (res.done) {
					let lsu = [res[0].data.data[10]];
					res[0].data.data.pop();
					let dir = res[0].data.data;
					table2.loadData(makeData(dir, 'dir'));
					table2.updateSettings(makeOption('dir'));
					table4.loadData(makeData(lsu, 'lsu'));
					table4.updateSettings(makeOption('lsu'));
					const result = cbUrl_success('/dirped_up', stats.lcno);
					const json = NsetLog({ data: result });
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				}
			} else {
				if (!res.done) {
					const result = cbUrl_fail('/dirped_up', stats.lcno);
					const json = NsetLog({ data: result });
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				}
			}
		});
	}

	// DB저장
	function saveData() {
		// dir
		let temp1 = table2.getSourceData(1, 4, 17, 23);
		let _temp1 = ston1(temp1);

		let jsonArray1 = [];

		for (let i = 0; i < 10; i++) {
			let json = new Object();
			let n = 2 * i;

			json.lcno = stats.lcno;
			json.outdir = i + 1;
			json.vehyn = _temp1[0][n];
			json.pedbikeyn = _temp1[1][n];
			json.pedyn = _temp1[2][n];
			json.insdir = i < 8 ? i : 0;
			json.insyn = _temp1[3][n];
			json.golsu = _temp1[4][n];
			json.gosort = _temp1[4][n + 1];
			json.leftlsu = _temp1[5][n];
			json.leftsort = _temp1[5][n + 1];
			json.pedlsu = _temp1[6][n];
			json.pedsort = _temp1[6][n + 1];
			json.bikelsu = _temp1[7][n];
			json.bikesort = _temp1[7][n + 1];
			json.rightlsu = _temp1[8][n];
			json.rightsort = _temp1[8][n + 1];
			json.buslsu = _temp1[9][n];
			json.bussort = _temp1[9][n + 1];
			json.genphase = _temp1[10][n];
			json.spcphase = _temp1[11][n];
			json.genring = _temp1[12][n];
			json.spcring = _temp1[13][n];
			json.pedsolid = _temp1[14][n];
			json.pedflash = _temp1[15][n];
			json.pedext = 0;

			jsonArray1.push(json);
		}

		// lsu
		let temp2 = table4.getSourceData(1, 1, 1, 16);
		let _temp2 = ston2(temp2[0]);
		let jsonArray2 = {
			int_lcno: stats.lcno,
			lsu01lamp: _temp2[0],
			lsu02lamp: _temp2[1],
			lsu03lamp: _temp2[2],
			lsu04lamp: _temp2[3],
			lsu05lamp: _temp2[4],
			lsu06lamp: _temp2[5],
			lsu07lamp: _temp2[6],
			lsu08lamp: _temp2[7],
			lsu09lamp: _temp2[8],
			lsu10lamp: _temp2[9],
			lsu11lamp: _temp2[10],
			lsu12lamp: _temp2[11],
			lsu13lamp: _temp2[12],
			lsu14lamp: _temp2[13],
			lsu15lamp: _temp2[14],
			lsu16lamp: _temp2[15]
		};

		let result = { outpeds: jsonArray1, lsu: jsonArray2 };
		console.log(result);
		ajax(`/ntcs_m_outped/local?lcNo=${stats.lcno}`, 'PUT', result).then((res) => {
			document.isSuccess(res);
			if (res.success) {
				const json = NsetLog({
					data: [
						4,
						14,
						230,
						0,
						$userId,
						stats.lcno,
						document.lcCon.LCs[stats.lcno].lcname,
						'방향별출력맵 저장성공'
					]
				});
				ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
			} else {
				const json = NsetLog({
					data: [
						4,
						14,
						230,
						0,
						$userId,
						stats.lcno,
						document.lcCon.LCs[stats.lcno].lcname,
						'방향별출력맵 저장실패'
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
		initAll('local');
	});
</script>

<div class="tabPage">
	<div class="tabContent">
		<Legend legend="<image style='margin-right: 5px' src='/svg/center.svg' />센터" color="#80CE8C">
			<div class="dir">
				<Legend legend="방향별 출력맵" color="#DADDE1">
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
			<div class="lsu">
				<Legend legend="LSU별 신호등 설정" color="#DADDE1">
					<div>
						<Table
							bind:wrapper={elems.table3}
							bind:table={table3}
							data={data3}
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
		<Legend legend="<image style='margin-right: 5px' src='/svg/local.svg' />로컬" color="#86B5DE">
			<div class="dir">
				<Legend legend="방향별 출력맵" color="#DADDE1">
					<div>
						<Table
							bind:wrapper={elems.table2}
							bind:table={table2}
							data={data2}
							width={'100%'}
							height={'auto'}
							option={option1}
						/>
					</div>
				</Legend>
			</div>
			<div class="lsu">
				<Legend legend="LSU별 신호등 설정" color="#DADDE1">
					<div>
						<Table
							bind:wrapper={elems.table4}
							bind:table={table4}
							data={data4}
							width={'100%'}
							height={'auto'}
							option={option2}
						/>
					</div>
				</Legend>
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

	.tabPage .tabContent > :global(fieldset),
	.tabPage .tabContent :global(fieldset div fieldset) {
		padding: 0;
	}

	/* DIR */
	.tabPage .tabContent > :global(fieldset div.dir > fieldset) {
		height: 392px;
	}

	.tabPage .tabContent :global(fieldset div.dir > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 392px;
		overflow: hidden;
	}

	/* LSU */
	.tabPage .tabContent :global(fieldset div.lsu > fieldset) {
		height: 47px;
		padding: 0;
	}

	.tabPage .tabContent :global(fieldset div.lsu > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 47px;
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
	/* 방향별 출력맵 */
	.tabPage .tabContent :global(fieldset div.dir .handsontable tr:first-child td),
	.tabPage .tabContent :global(fieldset div.dir .handsontable tr td:nth-child(-n + 4)) {
		color: #999999;
		background: #f4f7f9;
	}

	/* LSU별 신호등 설정 */
	.tabPage .tabContent :global(fieldset div.lsu .handsontable tr td:nth-child(1)),
	.tabPage .tabContent :global(fieldset div.lsu .handsontable tr:nth-child(1) td) {
		color: #999999;
		background: #f4f7f9;
	}

	/* 방향별 출력맵 Text Overflow */
	.tabPage .tabContent :global(fieldset div.dir .handsontable tr:nth-child(5) td) {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

	.tabPage .tabContent :global(fieldset div.dir .handsontable td) {
		font-size: 1.2rem;
	}

	/* Compare */
	.tabPage .tabContent :global(.handsontable td.diff) {
		background-color: orangered !important;
		color: white !important;
	}
</style>
