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
		option: [
			{ id: 0, text: '예약계획' },
			{ id: 1, text: '플래시맵' }
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
	export let table1;
	export let table2;
	export let table3;
	export let table4;

	// Initial Datas
	let iData1;
	let iData2;

	// Datas
	// 예약계획
	let data1 = [];
	let data2 = [];

	// 플래시맵
	let data3 = [];
	let data4 = [];

	// Option
	let option1 = {
		colWidths: [53, 40, 40, 106, 40, 40, 40, 40, 106, 55],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true
	};
	let option2 = {
		colWidths: stats.year == 2004 ? 70 : 56,
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
				searchData(null, 'rsrv');
				searchData(null, 'flash');
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

	// 데이터 변경(flash)
	function ntos1(x, y) {
		x =
			x == 0
				? 'RO'
				: x == 1
				? 'GO'
				: x == 2
				? 'YO'
				: x == 3
				? 'YF'
				: x == 4
				? 'RF'
				: x == 5
				? 'GF'
				: 'X';
		y =
			y == 0
				? 'RO'
				: y == 16
				? 'GO'
				: y == 32
				? 'YO'
				: y == 48
				? 'YF'
				: y == 64
				? 'RF'
				: y == 80
				? 'GF'
				: 'X';

		return [x, y];
	}

	// 데이터 변경(rsrv)
	function ntos2(json) {
		let res = json;

		let temp1 = [
			'일',
			'월',
			'화',
			'수',
			'목',
			'금',
			'토',
			'공휴일',
			'주말',
			'1,3주 토요일',
			'2,4주 토요일'
		];
		let temp2 = [
			'조광',
			'점멸',
			'소등',
			'시차',
			'감응',
			'보행자작동신호기활성',
			'음향발생',
			'감응+푸시버튼',
			'시차+감응+푸시버튼',
			'PPC',
			'앞막힘',
			'예약12',
			'예약13',
			'예약14',
			'예약15'
		];

		if (res.rsrvwkd != 0) {
			res.rsrvwkd = temp1[res.rsrvwkd - 1];
		}
		if (res.cntltype != 0) {
			res.cntltype = temp2[res.cntltype - 1];
		}
		res.cntlspcno = res.cntlspcno + 6;

		return res;
	}

	// 데이터 변경(flash)
	function ston1(x, y) {
		if (stats.year == 2004) {
			x = x == 'RF' ? 0 : x == 'YF' ? 16 : x == 'AF' ? 32 : x == 'GF' ? 48 : 64;
			y = y == 'RF' ? 16 : y == 'GF' ? 32 : 0;
		} else {
			x =
				x == 'RO'
					? 0
					: x == 'GO'
					? 1
					: x == 'YO'
					? 2
					: x == 'YF'
					? 3
					: x == 'RF'
					? 4
					: x == 'GF'
					? 5
					: 8;
			y =
				y == 'RO'
					? 0
					: y == 'GO'
					? 16
					: y == 'YO'
					? 32
					: y == 'YF'
					? 48
					: y == 'RF'
					? 64
					: y == 'GF'
					? 80
					: 128;
		}
		return [x, y];
	}

	// 데이터 변경(rsrv)
	function ston2(arr) {
		let res = JSON.parse(JSON.stringify(arr));

		let temp1 = [
			'일',
			'월',
			'화',
			'수',
			'목',
			'금',
			'토',
			'공휴일',
			'주말',
			'1,3주 토요일',
			'2,4주 토요일'
		];
		let temp2 = [
			'조광',
			'점멸',
			'소등',
			'시차',
			'감응',
			'보행자작동신호기활성',
			'음향발생',
			'감응+푸시버튼',
			'시차+감응+푸시버튼',
			'PPC',
			'앞막힘',
			'예약12',
			'예약13',
			'예약14',
			'예약15'
		];

		res.forEach((v, i) => {
			Object.keys(v).forEach(function (k) {
				if (v[k] === '') {
					v[k] = 0;
				} else {
					if (k == 'rsrvwkd') {
						v[k] = temp1.indexOf(v[k]) + 1;
					}

					if (k == 'cntltype') {
						v[k] = temp2.indexOf(v[k]) + 1;
					}

					if (k == 'cntlspcno') {
						v[k] = v[k] - 6;
					}
				}
			});
		});

		return res;
	}

	// 데이터 생성
	function makeData(res, sort) {
		let _data;
		if (sort == 'flash') {
			if (stats.year == 2004) {
				_data = [
					['LSU', '번호', '1', '2', '3', '4', '5', '6'],
					['', '차량', '', '', '', '', '', ''],
					['', '보행', '', '', '', '', '', ''],
					['옵션', '', '초기점멸시간', '', '', '가변차선사용', '', '']
				];
			} else {
				_data = [
					['LSU', '번호', '1', '2', '3', '4', '5', '6', '7', '8'],
					['', '차량', '', '', '', '', '', '', '', ''],
					['', '보행', '', '', '', '', '', '', '', ''],
					['', '번호', '9', '10', '11', '12', '13', '14', '15', '16'],
					['', '차량', '', '', '', '', '', '', '', ''],
					['', '보행', '', '', '', '', '', '', '', ''],
					['옵션', '', '초기점멸시간', '', '', '', '', '', '', '']
				];
			}
		} else {
			_data = [
				['계획', '월', '일', '유형', '시작', '', '종료', '', '제어유형', '시차제'],
				['', '', '', '', '시', '분', '시', '분', '', '']
			];

			for (let i = 1; i < 11; i++) {
				_data.push([i, '', '', '', '', '', '', '', '', '']);
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
				if (sort == 'flash') {
					iData1 = res;
					if (stats.year == 2004) {
						for (let i = 1; i < 13; i++) {
							let v = res[Object.keys(res)[i]];
							let temp;

							if (i % 2 == 1) {
								if (v == 0) {
									temp = 'RF';
								} else if (v == 16) {
									temp = 'YF';
								} else if (v == 32) {
									temp = 'AF';
								} else if (v == 48) {
									temp = 'GF';
								} else {
									temp = 'X';
								}
								_data[1][(i + 1) / 2 + 1] = temp;
							} else {
								if (v == 16) {
									temp = 'RF';
								} else if (v == 32) {
									temp = 'GF';
								} else {
									temp = 'X';
								}
								_data[2][i / 2 + 1] = temp;
							}
						}
						_data[3][4] = res.variabcntl;
						_data[3][7] = res.flashtime;
					} else {
						for (let i = 1; i < 17; i++) {
							let v = res[Object.keys(res)[i]];
							let temp1;
							let temp2;

							if (v <= 8) {
								temp1 = v;
								temp2 = 0;
							} else if (16 <= v && v <= 24) {
								temp1 = v - 16;
								temp2 = 16;
							} else if (32 <= v && v <= 40) {
								temp1 = v - 32;
								temp2 = 32;
							} else if (48 <= v && v <= 56) {
								temp1 = v - 48;
								temp2 = 48;
							} else if (64 <= v && v <= 72) {
								temp1 = v - 64;
								temp2 = 64;
							} else if (80 <= v && v <= 88) {
								temp1 = v - 80;
								temp2 = 80;
							} else {
								temp1 = v - 128;
								temp2 = 128;
							}

							let x = ntos1(temp1, temp2)[0];
							let y = ntos1(temp1, temp2)[1];

							if (i < 9) {
								_data[1][i + 1] = x;
								_data[2][i + 1] = y;
							} else {
								_data[4][i - 7] = x;
								_data[5][i - 7] = y;
							}
						}
						_data[6][6] = res.flashtime;
					}
				} else {
					iData2 = res;
					let _res = ntos2(res);
					res.forEach((v, i) => {
						delete v.lcno;
						delete v.fplanindex;

						let sum = _.sum(_.values(v));
						let _v = ntos2(v);

						if (sum) {
							_data[i + 2][1] = _v.rsrvmonth;
							_data[i + 2][2] = _v.rsrvday;
							_data[i + 2][3] = _v.rsrvwkd;
							_data[i + 2][4] = _v.cntlstarthour;
							_data[i + 2][5] = _v.cntlstartmin;
							_data[i + 2][6] = _v.cntlendhour;
							_data[i + 2][7] = _v.cntlendmin;
							_data[i + 2][8] = _v.cntltype;
							_data[i + 2][9] = _v.cntlspcno;
						}
					});
				}
			} else {
				if (sort == 'flash') {
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
		let optionM;
		let optionC;

		if (sort == 'flash') {
			if (stats.year == 2004) {
				optionM = [
					{ row: 0, col: 0, rowspan: 3, colspan: 1 },
					{ row: 3, col: 0, rowspan: 1, colspan: 2 },
					{ row: 3, col: 2, rowspan: 1, colspan: 2 },
					{ row: 3, col: 5, rowspan: 1, colspan: 2 }
				];

				optionC = function (row, col, prop) {
					let cellProperties = {};
					if (col > 1) {
						if (row == 1) {
							cellProperties.editor = 'select';
							cellProperties.selectOptions = ['RF', 'YF', 'AF', 'GF', 'X'];
						}
						if (row == 2) {
							cellProperties.editor = 'select';
							cellProperties.selectOptions = ['RF', 'GF', 'X'];
						}
					}
					cellProperties.readOnly = true;
					return cellProperties;
				};
			} else {
				optionM = [
					{ row: 0, col: 0, rowspan: 6, colspan: 1 },
					{ row: 6, col: 0, rowspan: 1, colspan: 2 },
					{ row: 6, col: 2, rowspan: 1, colspan: 4 },
					{ row: 6, col: 6, rowspan: 1, colspan: 4 }
				];

				optionC = function (row, col, prop) {
					let cellProperties = {};
					if (col > 1 && (row == 1 || row == 2 || row == 4 || row == 5)) {
						cellProperties.editor = 'select';
						cellProperties.selectOptions = ['RO', 'GO', 'YO', 'YF', 'RF', 'GF', 'X'];
					}
					cellProperties.readOnly = true;
					return cellProperties;
				};
			}
		} else {
			optionM = [
				{ row: 0, col: 4, rowspan: 1, colspan: 2 },
				{ row: 0, col: 6, rowspan: 1, colspan: 2 },
				{ row: 0, col: 0, rowspan: 2, colspan: 1 },
				{ row: 0, col: 1, rowspan: 2, colspan: 1 },
				{ row: 0, col: 2, rowspan: 2, colspan: 1 },
				{ row: 0, col: 3, rowspan: 2, colspan: 1 },
				{ row: 0, col: 8, rowspan: 2, colspan: 1 },
				{ row: 0, col: 9, rowspan: 2, colspan: 1 }
			];

			optionC = function (row, col, prop) {
				let cellProperties = {};

				if (col == 3 && row > 1) {
					cellProperties.editor = 'select';
					cellProperties.selectOptions = [
						'일',
						'월',
						'화',
						'수',
						'목',
						'금',
						'토',
						'공휴일',
						'주말',
						'1,3주 토요일',
						'2,4주 토요일'
					];
				}

				if (col == 8 && row > 1) {
					cellProperties.editor = 'select';
					cellProperties.selectOptions = [
						'조광',
						'점멸',
						'소등',
						'시차',
						'감응',
						'보작기활성',
						'음향발생',
						'감응/Push',
						'시차/감응/Push',
						'PPC',
						'앞막힘',
						'예약12',
						'예약13',
						'예약14',
						'예약15'
					];
				}
				cellProperties.readOnly = true;
				return cellProperties;
			};
		}

		return { mergeCells: optionM, cells: optionC };
	}

	// 조회
	function searchData(e, sort) {
		let cnt = 2;
		let isSuccess = new Array(cnt).fill(0);
		let isData = new Array(cnt).fill(0);

		if (sort == 'rsrv') {
			ajax(`/reservation-plan?lcno=${stats.lcno}`).then((res1) => {
				if (res1.hasOwnProperty('success')) {
					initData(table1, 'rsrv');
				} else {
					table1.loadData(makeData(res1, 'rsrv'));
					table1.updateSettings(makeOption('rsrv'));
					if (!_.isEmpty(res1)) {
						isData[0] = 1;
					}
					isSuccess[0] = 1;
				}
				// 알림
				if (e) {
					if (!isSuccess[0] || !isData[0]) {
						document.isSuccess(res1);
					} else {
						document.isSuccess(stats);
					}
				}
			});
		} else {
			ajax(`/flash-map/${stats.lcno}`).then((res2) => {
				if (res2.hasOwnProperty('success')) {
					initData(table3, 'flash');
				} else {
					table3.loadData(makeData(res2, 'flash'));
					table3.updateSettings(makeOption('flash'));
					if (!_.isEmpty(res2)) {
						isData[1] = 1;
					}
					isSuccess[1] = 1;
				}
				// 알림
				if (e) {
					if (!isSuccess[1] || !isData[1]) {
						document.isSuccess(res2);
					} else {
						document.isSuccess(stats);
					}
				}
			});
		}
	}

	// 초기화
	function initData(table, sort) {
		if (sort == 'rsrv') {
			table.loadData(makeData(null, 'rsrv'));
			table.updateSettings(makeOption('rsrv'));
		} else {
			table.loadData(makeData(null, 'flash'));
			table.updateSettings(makeOption('flash'));
		}
	}

	// 전체 초기화
	function initAll(sort) {
		if (sort == 'center') {
			initData(table1, 'rsrv');
			initData(table3, 'flash');
		} else {
			initData(table2, 'rsrv');
			initData(table4, 'flash');
		}
	}

	// 편집
	function editData(e) {
		document.createWindow('dbEdit', false, e, { tabValue: 6, stats: stats });
	}

	// 검증
	function compareData(sort) {
		// "" == null == undefined 를 비교하는건 무의미
		// 두 테이블 전부 다 "", null, undefined 이면, 비교 X
		// 한 테이블이라도 숫자나 유효한 문자가 있으면 비교 O
		if (sort == 'rsrv') {
			let temp1 = new Array();
			let centerR = table1.getSourceData();
			let localR = table2.getSourceData();

			// 초기화
			for (let i in compare[0]) {
				table1.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', '');
				table2.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', '');
			}

			compare = [];

			// 검증
			for (let i = 2; i < 12; i++) {
				for (let j = 1; j < 10; j++) {
					let diff1 = new Object();
					if (centerR[i][j] !== localR[i][j]) {
						diff1.row = i;
						diff1.col = j;
						temp1.push(diff1);
					}
				}
			}

			compare[0] = temp1;

			for (let i in compare[0]) {
				table1.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', 'diff');
				table2.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', 'diff');
			}

			table1.render();
			table2.render();
		} else {
			let temp2 = new Array();
			let centerF = table3.getSourceData();
			let localF = table4.getSourceData();

			for (let i in compare[1]) {
				table3.setCellMeta(compare[1][i].row, compare[1][i].col, 'className', '');
				table4.setCellMeta(compare[1][i].row, compare[1][i].col, 'className', '');
			}

			compare = [];

			if (stats.year == 2004) {
				for (let i = 1; i < 4; i++) {
					if (i != 3) {
						for (let j = 2; j < 8; j++) {
							let diff2 = new Object();
							if (centerF[i][j] !== localF[i][j]) {
								diff2.row = i;
								diff2.col = j;
								temp2.push(diff2);
							}
						}
					} else {
						let diff2 = new Object();
						if (centerF[i][4] !== localF[i][4]) {
							diff2.row = i;
							diff2.col = 4;
							temp2.push(diff2);
						}

						if (centerF[i][7] !== localF[i][7]) {
							diff2.row = i;
							diff2.col = 7;
							temp2.push(diff2);
						}
					}
				}
			} else {
				for (let i = 1; i < 7; i++) {
					if (i != 3 && i != 6) {
						for (let j = 2; j < 10; j++) {
							let diff2 = new Object();
							if (centerF[i][j] !== localF[i][j]) {
								diff2.row = i;
								diff2.col = j;
								temp2.push(diff2);
							}
						}
					}

					if (i == 6) {
						let diff2 = new Object();
						if (centerF[i][6] !== localF[i][6]) {
							diff2.row = i;
							diff2.col = 6;
							temp2.push(diff2);
						}
					}
				}
			}

			compare[1] = temp2;

			for (let i in compare[1]) {
				table3.setCellMeta(compare[1][i].row, compare[1][i].col, 'className', 'diff');
				table4.setCellMeta(compare[1][i].row, compare[1][i].col, 'className', 'diff');
			}

			table3.render();
			table4.render();
		}
	}

	// 동기화(TCP)
	function downloadData(sort) {
		if (sort == 'rsrv') {
			document.callTcp('/rplan_dw', [stats.lcno], (res) => {
				console.log('예약계획 : ', res);
				if (res.done && res[0].ok == 1) {
					const result = cbUrl_success('/rplan_dw', stats.lcno);
					const json = NsetLog({ data: result });
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				} else {
					if (!res.done) {
						const result = cbUrl_fail('/rplan_dw', stats.lcno);
						const json = NsetLog({ data: result });
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					}
				}
			});
		} else {
			document.callTcp('/flashmap_dw', [stats.lcno], (res) => {
				console.log('플래시맵 : ', res);
				if (res.done && res[0].ok == 1) {
					const result = cbUrl_success('/flashmap_dw', stats.lcno);
					const json = NsetLog({ data: result });
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				} else {
					if (!res.done) {
						const result = cbUrl_fail('/flashmap_dw', stats.lcno);
						const json = NsetLog({ data: result });
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					}
				}
			});
		}
	}

	// 업로드(TCP)
	function uploadData(sort) {
		if (sort == 'rsrv') {
			document.callTcp('/rplan_up', [stats.lcno], (res) => {
				if (res[0].data) {
					console.log('예약계획 : ', res);
					if (res.done) {
						table2.loadData(makeData(res[0].data.data, 'rsrv'));
						table2.updateSettings(makeOption('rsrv'));
						const result = cbUrl_success('/rplan_up', stats.lcno);
						const json = NsetLog({ data: result });
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					}
				} else {
					if (!res.done) {
						const result = cbUrl_fail('/rplan_up', stats.lcno);
						const json = NsetLog({ data: result });
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					}
				}
			});
		} else {
			document.callTcp('/flashmap_up', [stats.lcno], (res) => {
				if (res[0].data) {
					console.log('플래시맵 : ', res);
					if (res.done) {
						table4.loadData(makeData(res[0].data.data, 'flash'));
						table4.updateSettings(makeOption('flash'));
						const result = cbUrl_success('/flashmap_up', stats.lcno);
						const json = NsetLog({ data: result });
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					}
				} else {
					if (!res.done) {
						const result = cbUrl_fail('/flashmap_up', stats.lcno);
						const json = NsetLog({ data: result });
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					}
				}
			});
		}
	}

	// DB저장
	function saveData(sort) {
		if (sort == 'rsrv') {
			// 예약계획
			let temp1 = table2.getSourceData(2, 1, 11, 9);

			let dt = [
				'rsrvmonth',
				'rsrvday',
				'rsrvwkd',
				'cntlstarthour',
				'cntlstartmin',
				'cntlendhour',
				'cntlendmin',
				'cntltype',
				'cntlspcno'
			];

			temp1.unshift(dt);

			let jsonArray = atoj(temp1);
			let _jsonArray = ston2(jsonArray);

			_jsonArray.forEach((v, i) => {
				v.lcno = stats.lcno;
				v.fplanindex = i + 1;
			});

			ajax(`/reservation-plan/local?lcno=${stats.lcno}`, 'PUT', _jsonArray).then((res1) => {
				document.isSuccess(res1);
				if (res1.success) {
					const json = NsetLog({
						data: [
							4,
							14,
							226,
							0,
							$userId,
							stats.lcno,
							document.lcCon.LCs[stats.lcno].lcname,
							'예약계획 저장성공'
						]
					});
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				} else {
					const json = NsetLog({
						data: [
							4,
							14,
							226,
							0,
							$userId,
							stats.lcno,
							document.lcCon.LCs[stats.lcno].lcname,
							'예약계획 저장실패'
						]
					});
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				}
			});
		} else {
			// 플래시맵
			let temp2 = table4.getSourceData();

			let jsonArray2 = {
				lcno: 0,
				veh1: 0,
				ped1: 0,
				veh2: 0,
				ped2: 0,
				veh3: 0,
				ped3: 0,
				veh4: 0,
				ped4: 0,
				veh5: 0,
				ped5: 0,
				veh6: 0,
				ped6: 0,
				veh7: 0,
				ped7: 0,
				veh8: 0,
				ped8: 0,
				variabcntl: 0,
				flashtime: 0
			};

			if (stats.year == 2004) {
				jsonArray2.lcno = stats.lcno;
				jsonArray2.veh1 = ston1(temp2[1][2], temp2[2][2])[0];
				jsonArray2.ped1 = ston1(temp2[1][2], temp2[2][2])[1];
				jsonArray2.veh2 = ston1(temp2[1][3], temp2[2][3])[0];
				jsonArray2.ped2 = ston1(temp2[1][3], temp2[2][3])[1];
				jsonArray2.veh3 = ston1(temp2[1][4], temp2[2][4])[0];
				jsonArray2.ped3 = ston1(temp2[1][4], temp2[2][4])[1];
				jsonArray2.veh4 = ston1(temp2[1][5], temp2[2][5])[0];
				jsonArray2.ped4 = ston1(temp2[1][5], temp2[2][5])[1];
				jsonArray2.veh5 = ston1(temp2[1][6], temp2[2][6])[0];
				jsonArray2.ped5 = ston1(temp2[1][6], temp2[2][6])[1];
				jsonArray2.veh6 = ston1(temp2[1][7], temp2[2][7])[0];
				jsonArray2.ped6 = ston1(temp2[1][7], temp2[2][7])[1];
				jsonArray2.variabcntl = Number(temp2[3][4]);
				jsonArray2.flashtime = Number(temp2[3][7]);
			} else {
				jsonArray2.lcno = stats.lcno;
				jsonArray2.veh1 = ston1(temp2[1][2], temp2[2][2])[0] + ston1(temp2[1][2], temp2[2][2])[1];
				jsonArray2.ped1 = ston1(temp2[1][3], temp2[2][3])[0] + ston1(temp2[1][3], temp2[2][3])[1];
				jsonArray2.veh2 = ston1(temp2[1][4], temp2[2][4])[0] + ston1(temp2[1][4], temp2[2][4])[1];
				jsonArray2.ped2 = ston1(temp2[1][5], temp2[2][5])[0] + ston1(temp2[1][5], temp2[2][5])[1];
				jsonArray2.veh3 = ston1(temp2[1][6], temp2[2][6])[0] + ston1(temp2[1][6], temp2[2][6])[1];
				jsonArray2.ped3 = ston1(temp2[1][7], temp2[2][7])[0] + ston1(temp2[1][7], temp2[2][7])[1];
				jsonArray2.veh4 = ston1(temp2[1][8], temp2[2][8])[0] + ston1(temp2[1][8], temp2[2][8])[1];
				jsonArray2.ped4 = ston1(temp2[1][9], temp2[2][9])[0] + ston1(temp2[1][9], temp2[2][9])[1];
				jsonArray2.veh5 = ston1(temp2[4][2], temp2[5][2])[0] + ston1(temp2[4][2], temp2[5][2])[1];
				jsonArray2.ped5 = ston1(temp2[4][3], temp2[5][3])[0] + ston1(temp2[4][3], temp2[5][3])[1];
				jsonArray2.veh6 = ston1(temp2[4][4], temp2[5][4])[0] + ston1(temp2[4][4], temp2[5][4])[1];
				jsonArray2.ped6 = ston1(temp2[4][5], temp2[5][5])[0] + ston1(temp2[4][5], temp2[5][5])[1];
				jsonArray2.veh7 = ston1(temp2[4][6], temp2[5][6])[0] + ston1(temp2[4][6], temp2[5][6])[1];
				jsonArray2.ped7 = ston1(temp2[4][7], temp2[5][7])[0] + ston1(temp2[4][7], temp2[5][7])[1];
				jsonArray2.veh8 = ston1(temp2[4][8], temp2[5][8])[0] + ston1(temp2[4][8], temp2[5][8])[1];
				jsonArray2.ped8 = ston1(temp2[4][9], temp2[5][9])[0] + ston1(temp2[4][9], temp2[5][9])[1];
				jsonArray2.flashtime = Number(temp2[6][6]);
			}

			ajax(`/flash-map/${stats.lcno}`, 'PUT', jsonArray2).then((res2) => {
				document.isSuccess(res2);
				if (res2.success) {
					const json = NsetLog({
						data: [
							4,
							14,
							228,
							0,
							$userId,
							stats.lcno,
							document.lcCon.LCs[stats.lcno].lcname,
							'플래시맵 저장성공'
						]
					});
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				} else {
					const json = NsetLog({
						data: [
							4,
							14,
							228,
							0,
							$userId,
							stats.lcno,
							document.lcCon.LCs[stats.lcno].lcname,
							'플래시맵 저장실패'
						]
					});
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				}
			});
		}
	}

	// 초기 조회
	onMount(() => {
		// 센터
		searchData(null, 'rsrv');
		searchData(null, 'flash');

		// 로컬
		initAll('local');
	});
</script>

<div class="tabPage {stats.year == 2004 ? '_2004' : '_2010'}">
	<Legend legend="<image style='margin-right: 5px' src='/svg/center.svg' />센터" color="#80CE8C">
		<div class="tabContent">
			<div class="rsrv">
				<Legend legend="예약계획" color="#DADDE1">
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
		</div>
		<div class="tabButton">
			<div class="center rsrv">
				<div>
					<Button icon="search" on:click={(e) => searchData(e, 'rsrv')}>조회</Button>
					<Button icon="init" on:click={() => initData(table1, 'rsrv')}>초기화</Button>
					<Button icon="compare" on:click={() => compareData('rsrv')}>검증</Button>
				</div>
			</div>
		</div>
		<div class="tabContent">
			<div class="flash">
				<Legend legend="플래시맵" color="#DADDE1">
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
		</div>
		<div class="tabButton">
			<div class="center flash">
				<div>
					<Button icon="search" on:click={(e) => searchData(e, 'flash')}>조회</Button>
					<Button icon="init" on:click={() => initData(table3, 'flash')}>초기화</Button>
					<Button icon="edit" on:click={editData}>편집</Button>
					<Button icon="compare" on:click={() => compareData('flash')}>검증</Button>
				</div>
			</div>
		</div>
	</Legend>
	<Legend legend="<image style='margin-right: 5px' src='/svg/local.svg' />로컬" color="#86B5DE">
		<div class="tabContent">
			<div class="rsrv">
				<Legend legend="예약계획" color="#DADDE1">
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
		</div>
		<div class="tabButton">
			<div class="local rsrv">
				<div>
					<Button colored={true} icon="sync" on:click={() => downloadData('rsrv')}>동기화</Button>
				</div>
				<div>
					<Button icon="upload" on:click={() => uploadData('rsrv')}>업로드</Button>
					<Button icon="init" on:click={() => initData(table2, 'rsrv')}>초기화</Button>
					<Button icon="save2db" on:click={() => saveData('rsrv')}>DB저장</Button>
				</div>
			</div>
		</div>
		<div class="tabContent">
			<div class="flash">
				<Legend legend="플래시맵" color="#DADDE1">
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
		</div>
		<div class="tabButton">
			<div class="local flash">
				<div>
					<Button colored={true} icon="sync" on:click={() => downloadData('flash')}>동기화</Button>
				</div>
				<div>
					<Button icon="upload" on:click={() => uploadData('flash')}>업로드</Button>
					<Button icon="init" on:click={() => initData(table4, 'flash')}>초기화</Button>
					<Button icon="save2db" on:click={() => saveData('flash')}>DB저장</Button>
				</div>
			</div>
		</div>
	</Legend>
</div>

<style>
	.tabPage {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto;
		grid-column-gap: 10px;
		grid-row-gap: 10px;
	}

	.tabPage > :global(fieldset) {
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
		padding: 0;
	}

	/* 예약계획 */
	.tabPage .tabContent > :global(div.rsrv > fieldset) {
		height: 277px;
		padding: 0;
	}

	.tabPage .tabContent :global(div.rsrv > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 277px;
		overflow: hidden;
	}

	/* 플래시맵 */
	/* 2004년식 */
	.tabPage._2004 .tabContent :global(div.flash > fieldset) {
		height: 94px;
		padding: 0;
	}

	.tabPage._2004 .tabContent :global(div.flash > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 94px;
		overflow: hidden;
	}

	/* 2010년식 */
	.tabPage._2010 .tabContent :global(div.flash > fieldset) {
		height: 162px;
		padding: 0;
	}

	.tabPage._2010 .tabContent :global(div.flash > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 162px;
		overflow: hidden;
	}

	/* 버튼 */
	/* 센터 */
	.tabPage .tabButton > div.center {
		display: grid;
		grid-template-columns: 2fr 1fr;
	}

	.tabPage .tabButton > div.center.rsrv div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 80px 70px;
		grid-column-gap: 5px;
	}

	.tabPage .tabButton > div.center.flash div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 80px 70px 70px;
		grid-column-gap: 5px;
	}

	/* 로컬 */
	.tabPage .tabButton > div.local {
		display: grid;
		grid-template-columns: 1fr 1.1fr;
	}

	.tabButton > div.local div:nth-child(1) {
		display: grid;
		grid-template-columns: 100px 100px;
		grid-column-gap: 10px;
	}

	.tabButton > div.local div:nth-child(1) div {
		width: 100px;
		height: 30px;
	}

	.tabButton > div.local div:nth-child(2) {
		display: grid;
		justify-content: end;
		grid-template-columns: 80px 80px 90px;
		grid-column-gap: 5px;
	}

	/* Headers */
	/* 예약계획 */
	.tabPage .tabContent div.rsrv :global(.handsontable tr:first-child td),
	.tabPage .tabContent div.rsrv :global(.handsontable tr:nth-child(2) td),
	.tabPage .tabContent div.rsrv :global(.handsontable tr td:nth-child(1)) {
		color: #999999;
		background: #f4f7f9;
	}

	/* 플래시맵 */
	/* 2004년식 */
	.tabPage._2004 .tabContent div.flash :global(.handsontable tr:first-child td),
	.tabPage._2004 .tabContent div.flash :global(.handsontable tr td:nth-child(1)),
	.tabPage._2004 .tabContent div.flash :global(.handsontable tr td:nth-child(2)),
	.tabPage._2004
		.tabContent
		div.flash
		:global(.handsontable tr:nth-child(4) td:not(:nth-child(5)):not(:nth-child(8))) {
		color: #999999;
		background: #f4f7f9;
	}

	/* 2010년식 */
	.tabPage._2010 .tabContent div.flash :global(.handsontable tr:first-child td),
	.tabPage._2010 .tabContent div.flash :global(.handsontable tr td:nth-child(2)),
	.tabPage._2010 .tabContent div.flash :global(.handsontable tr:nth-child(4) td),
	.tabPage._2010
		.tabContent
		div.flash
		:global(.handsontable
			tr:nth-child(7)
			td:not(:nth-child(7)):not(:nth-child(8)):not(:nth-child(9)):not(:nth-child(10))) {
		color: #999999;
		background: #f4f7f9;
	}

	/* 예약계획 Text Overflow */
	.tabPage .tabContent :global(div.rsrv .handsontable td) {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

	/* Compare */
	.tabPage .tabContent :global(.handsontable td.diff) {
		background-color: orangered !important;
		color: white !important;
	}
</style>
