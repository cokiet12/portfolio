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
		option1: [
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
		],
		option2: [
			{ id: 0, text: '일계획' },
			{ id: 1, text: '주간계획' },
			{ id: 2, text: '휴일계획' }
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
		table5: null,
		table6: null
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
	export let table6;

	// Initial Datas
	let iData1;
	let iData2;
	let iData3;

	// Datas
	// 일계획
	let data1 = [];
	let data2 = [];

	// 주간계획
	let data3 = [];
	let data4 = [];

	// 휴일계획
	let data5 = [];
	let data6 = [];

	// Cells
	let optionC = function (row, col, prop) {
		let cellProperties = {};
		cellProperties.readOnly = true;
		return cellProperties;
	};

	// Option
	let option1 = {
		height: '254px',
		colWidths: [40, 31.5, 31.5, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		cells: optionC,
		fixedRowsTop: 1
	};
	let option2 = {
		colWidths: [112, 64, 64, 64, 64, 64, 64, 64],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		cells: optionC
	};
	let option3 = {
		colWidths: [27, 36, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		cells: optionC
	};

	// Compare
	let compare = [[], [], []];

	// Search Event
	function searchEvent(stat) {
		if (table1 && table3 && table5) {
			initAll('center');
			setTimeout(function () {
				searchData(null, 'day');
				searchData(null, 'week');
				searchData(null, 'holiday');
			}, 500);
		}

		if (table2 && table4 && table6) {
			initAll('local');
		}
	}

	// DropDown Event
	function DropDownEvent() {
		consts.plan = selected1;
		searchData(null, 'day');
		initAll(table1, 'day');
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

	// ''을 0로 변경
	function ntoo(arr) {
		let res = JSON.parse(JSON.stringify(arr));

		for (let i in res) {
			res[i] = res[i] === '' ? 0 : typeof res[i] === 'string' ? Number(res[i]) : res[i];
		}

		return res;
	}

	// 데이터 생성
	function makeData(res, sort, id) {
		let _data;
		if (sort == 'day') {
			_data = [
				['계획', '시', '분', '주기', '옵셋', '구분', '1P', '2P', '3P', '4P', '5P', '6P', '7P', '8P']
			];
			for (let i = 1; i < 17; i++) {
				_data.push([i, '', '', '', '', 'A링', '', '', '', '', '', '', '', '']);
				_data.push(['', '', '', '', '', 'B링', '', '', '', '', '', '', '', '']);
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
				if (sort == 'day') {
					if (id == 'search') {
						iData1 = res;
					}
					res.forEach((v, i) => {
						delete v.tplanindex;

						let sum = _.sum(_.values(v));

						if (sum) {
							for (let j = 1; j < 3; j++) {
								console.log(v);

								_data[i * 2 + j][1] = v.starthour != undefined ? v.starthour : v.sa_starthour;
								_data[i * 2 + j][2] = v.startmin != undefined ? v.startmin : v.sa_startmin;
								_data[i * 2 + j][4] = v.offset != undefined ? v.offset : v.sa_offset;

								if (j == 1) {
									_data[i * 2 + j][3] = v.asum != undefined ? v.asum : v.sa_cycle;
									_data[i * 2 + j][5] = 'A링';
									_data[i * 2 + j][6] = v.asplit1;
									_data[i * 2 + j][7] = v.asplit2;
									_data[i * 2 + j][8] = v.asplit3;
									_data[i * 2 + j][9] = v.asplit4;
									_data[i * 2 + j][10] = v.asplit5;
									_data[i * 2 + j][11] = v.asplit6;
									_data[i * 2 + j][12] = v.asplit7;
									_data[i * 2 + j][13] = v.asplit8;
								} else {
									_data[i * 2 + j][3] = v.bsum != undefined ? v.asum : v.sa_cycle;
									_data[i * 2 + j][5] = 'B링';
									_data[i * 2 + j][6] = v.bsplit1;
									_data[i * 2 + j][7] = v.bsplit2;
									_data[i * 2 + j][8] = v.bsplit3;
									_data[i * 2 + j][9] = v.bsplit4;
									_data[i * 2 + j][10] = v.bsplit5;
									_data[i * 2 + j][11] = v.bsplit6;
									_data[i * 2 + j][12] = v.bsplit7;
									_data[i * 2 + j][13] = v.bsplit8;
								}
							}
						}
					});
				} else if (sort == 'week') {
					if (id == 'search') {
						iData2 = res;
					}
					res.forEach((v, i) => {
						_data[1][i + 1] = v.sa_dplan;
					});
				} else {
					if (id == 'search') {
						iData3 = res;
					}
					res.forEach((v, i) => {
						let month;
						let day;
						if (v.sa_mon != 0 && v.sa_day != 0 && v.sa_dplan != 0) {
							if (v.sa_mon < 10) {
								month = '0' + v.sa_mon;
							} else {
								month = v.sa_mon;
							}
							if (v.sa_day < 10) {
								day = '0' + v.sa_day;
							} else {
								day = v.sa_day;
							}

							if (i < 15) {
								_data[0][i + 2] = month + '/' + day;
								_data[1][i + 2] = v.sa_dplan;
							} else {
								_data[2][i - 13] = month + '/' + day;
								_data[3][i - 13] = v.sa_dplan;
							}
						}
					});
				}
			} else {
				if (sort == 'day') {
					iData1 = undefined;
				} else if (sort == 'week') {
					iData2 = undefined;
				} else {
					iData3 = undefined;
				}
			}
		}

		return _data;
	}

	// 기본 옵션 생성
	function makeOption() {
		let optionD = [];
		let optionH = [];

		for (let i = 1; i < 33; i += 2) {
			optionD.push({ row: i, col: 0, rowspan: 2, colspan: 1 });
			optionD.push({ row: i, col: 1, rowspan: 2, colspan: 1 });
			optionD.push({ row: i, col: 2, rowspan: 2, colspan: 1 });
			optionD.push({ row: i, col: 3, rowspan: 2, colspan: 1 });
			optionD.push({ row: i, col: 4, rowspan: 2, colspan: 1 });
		}

		optionH = [
			{ row: 0, col: 0, rowspan: 2, colspan: 1 },
			{ row: 2, col: 0, rowspan: 2, colspan: 1 }
		];

		return [{ mergeCells: optionD }, { mergeCells: optionH }];
	}

	// 조회
	function searchData(e, sort) {
		let cnt = 3;
		let isSuccess = new Array(cnt).fill(0);
		let isData = new Array(cnt).fill(0);

		if (sort == 'day') {
			ajax(`/work-plan/GetPLAN?lcno=${stats.lcno}&tplan=${consts.plan}`).then((res1) => {
				if (res1.hasOwnProperty('success')) {
					initData(table1, 'day');
				} else {
					table1.loadData(makeData(res1, 'day', 'search'));
					table1.updateSettings(makeOption()[0]);
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
		} else if (sort == 'week') {
			ajax(`/weekly-plan?lcno=${stats.lcno}`).then((res2) => {
				if (res2.hasOwnProperty('success')) {
					initData(table3, 'week');
				} else {
					table3.loadData(makeData(res2, 'week', 'search'));
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
		} else {
			ajax(`/holiday-plan?lcno=${stats.lcno}`).then((res3) => {
				if (res3.hasOwnProperty('success')) {
					initData(table5, 'holiday');
				} else {
					table5.loadData(makeData(res3, 'holiday', 'search'));
					table5.updateSettings(makeOption()[1]);
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

	// 테이블 초기화
	function initData(table, sort) {
		table.loadData(makeData(null, sort));
		if (sort == 'day') {
			table.updateSettings(makeOption()[0]);
		}
		if (sort == 'holiday') {
			table.updateSettings(makeOption()[1]);
		}
	}

	// 전체 초기화
	function initAll(sort) {
		if (sort == 'center') {
			initData(table1, 'day');
			initData(table3, 'week');
			initData(table5, 'holiday');
		} else {
			initData(table2, 'day');
			initData(table4, 'week');
			initData(table6, 'holiday');
		}
	}

	// TOD편집
	function editTOD(e) {
		document.createWindow('dbEdit', false, e, { tabValue: 4, stats: stats });
	}

	// SPLIT편집
	function editSPLIT(e) {
		document.createWindow('dbEdit', false, e, { tabValue: 5, stats: stats });
	}

	// 검증
	function compareData(sort) {
		// "" == null == undefined 를 비교하는건 무의미
		// 두 테이블 전부 다 "", null, undefined 이면, 비교 X
		// 한 테이블이라도 숫자나 유효한 문자가 있으면 비교 O
		if (sort == 'day') {
			let temp1 = new Array();
			let centerD = table1.getSourceData();
			let localD = table2.getSourceData();

			// 초기화
			for (let i in compare[0]) {
				table1.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', '');
				table2.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', '');
			}

			compare = [];

			// 검증
			for (let i = 1; i < 33; i++) {
				for (let j = 1; j < 14; j++) {
					let diff1 = new Object();
					if (centerD[i][j] !== localD[i][j]) {
						diff1.row = i;
						diff1.col = j;
						temp1.push(diff1);
					}
				}
			}
			compare[0] = temp1;
			// 적용
			for (let i in compare[0]) {
				table1.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', 'diff');
				table2.setCellMeta(compare[0][i].row, compare[0][i].col, 'className', 'diff');
			}
			table1.render();
			table2.render();
		} else if (sort == 'week') {
			let temp2 = new Array();
			let centerW = table3.getSourceData();
			let localW = table4.getSourceData();

			for (let i in compare[1]) {
				table3.setCellMeta(compare[1][i].row, compare[1][i].col, 'className', '');
				table4.setCellMeta(compare[1][i].row, compare[1][i].col, 'className', '');
			}

			compare = [];

			for (let i = 1; i < 2; i++) {
				for (let j = 1; j < 8; j++) {
					let diff2 = new Object();
					if (centerW[i][j] !== localW[i][j]) {
						diff2.row = i;
						diff2.col = j;
						temp2.push(diff2);
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
		} else {
			let temp3 = new Array();
			let centerH = table5.getSourceData();
			let localH = table6.getSourceData();

			for (let i in compare[2]) {
				table5.setCellMeta(compare[2][i].row, compare[2][i].col, 'className', '');
				table6.setCellMeta(compare[2][i].row, compare[2][i].col, 'className', '');
			}

			compare = [];

			for (let i = 0; i < 4; i++) {
				for (let j = 2; j < 17; j++) {
					let diff3 = new Object();
					if (centerH[i][j] !== localH[i][j]) {
						diff3.row = i;
						diff3.col = j;
						temp3.push(diff3);
					}
				}
			}
			compare[2] = temp3;
			for (let i in compare[2]) {
				table5.setCellMeta(compare[2][i].row, compare[2][i].col, 'className', 'diff');
				table6.setCellMeta(compare[2][i].row, compare[2][i].col, 'className', 'diff');
			}
			table5.render();
			table6.render();
		}
	}

	// 동기화(TCP)
	function downloadData(sort) {
		if (sort == 'day') {
			document.callTcp('/dayplan_dw', [`${stats.lcno},${consts.plan}`], (res) => {
				console.log(res);
				if (res.done && res[0].ok == 1) {
					const result = cbUrl_success('/dayplan_dw', stats.lcno);
					const json = NsetLog({ data: result });
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				} else {
					if (!res.done) {
						const result = cbUrl_fail('/dayplan_dw', stats.lcno);
						const json = NsetLog({ data: result });
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					}
				}
			});
		} else if (sort == 'week') {
			document.callTcp('/weekplan_dw', [`${stats.lcno}`], (res) => {
				console.log(res);
				if (res.done && res[0].ok == 1) {
					const result = cbUrl_success('/weekplan_dw', stats.lcno);
					const json = NsetLog({ data: result });
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				} else {
					if (!res.done) {
						const result = cbUrl_fail('/weekplan_dw', stats.lcno);
						const json = NsetLog({ data: result });
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					}
				}
			});
		} else {
			document.callTcp('/holiplan_dw', [`${stats.lcno}`], (res) => {
				console.log(res);
				if (res.done && res[0].ok == 1) {
					const result = cbUrl_success('/holiplan_dw', stats.lcno);
					const json = NsetLog({ data: result });
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				} else {
					if (!res.done) {
						const result = cbUrl_fail('/holiplan_dw', stats.lcno);
						const json = NsetLog({ data: result });
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					}
				}
			});
		}
	}

	// 업로드(TCP)
	function uploadData(sort) {
		if (sort == 'day') {
			document.callTcp(
				'/dayplan_up',
				[`${stats.lcno},${consts.plan},0`, `${stats.lcno},${consts.plan},1`],
				(res) => {
					if (res[0].data && res[1].data) {
						let data_a = res[0].data.data;
						let data_b = res[1].data.data;
						let data = [...data_a, ...data_b];
						if (res.done) {
							table2.loadData(makeData(data, 'day', 'upload'));
							table2.updateSettings(makeOption()[0]);
							const result = cbUrl_success('/dayplan_up', stats.lcno);
							const json = NsetLog({ data: result });
							ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
						}
					} else {
						if (!res.done) {
							const result = cbUrl_fail('/dayplan_up', stats.lcno);
							const json = NsetLog({ data: result });
							ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
						}
					}
				}
			);
		} else if (sort == 'week') {
			document.callTcp('/weekplan_up', [stats.lcno], (res) => {
				if (res[0].data) {
					console.log('주간계획 : ', res);
					if (res.done) {
						table4.loadData(makeData(res[0].data.data, 'week', 'upload'));
						const result = cbUrl_success('/weekplan_up', stats.lcno);
						const json = NsetLog({ data: result });
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					}
				} else {
					if (!res.done) {
						const result = cbUrl_fail('/weekplan_up', stats.lcno);
						const json = NsetLog({ data: result });
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					}
				}
			});
		} else {
			document.callTcp('/holiplan_up', [stats.lcno], (res) => {
				if (res[0].data) {
					console.log('휴일계획 : ', res);
					if (res.done) {
						table6.loadData(makeData(res[0].data.data, 'holiday', 'upload'));
						table6.updateSettings(makeOption()[1]);
						const result = cbUrl_success('/holiplan_up', stats.lcno);
						const json = NsetLog({ data: result });
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					}
				} else {
					if (!res.done) {
						const result = cbUrl_fail('/holiplan_up', stats.lcno);
						const json = NsetLog({ data: result });
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					}
				}
			});
		}
	}

	// DB패턴
	function patternData(e) {
		let center = new Array();
		let local = new Array();
		let temp1 = [];
		let temp2 = [];
		let temp3 = [];

		table1.getSourceData(1, 1, 32, 4).forEach((v, i) => {
			if (i % 2 == 0) {
				center[i / 2] = {
					hour: Number(v[0]),
					min: Number(v[1]),
					cycle: Number(v[2]),
					offset: Number(v[3])
				};
			}
		});

		table2.getSourceData(1, 1, 32, 4).forEach((v, i) => {
			if (i % 2 == 0) {
				local[i / 2] = {
					hour: Number(v[0]),
					min: Number(v[1]),
					cycle: Number(v[2]),
					offset: Number(v[3])
				};
			}
		});

		for (let i = 0; i < 16; i++) {
			if (center[i].hour !== local[i].hour || center[i].min !== local[i].min) {
				temp1.push(i + 1);
			}

			if (center[i].cycle !== local[i].cycle) {
				temp2.push(i + 1);
			}

			if (center[i].offset !== local[i].offset) {
				temp3.push(i + 1);
			}
		}

		// 그룹 소속
		// 소속이고 기존 데이터가 없는 경우
		// 기존 데이터가 없으므로 그룹에 영향 X, work-plan 실행
		// 소속이고 기존 데이터가 있는 경우
		// 기존 데이터가 있으므로 그룹에 영향을 줄 수 있는
		// 시, 분, 주기, 옵셋, 계획수를 확인
		// 조건이 모두 같을 경우만 덮어쓰기 진행

		// 그룹 미소속
		// 미소속이고 기존 데이터가 없는 경우
		// DB저장 시 그룹 TOD에 반영 X, TPLAN에 INSERT
		// 미소속이고 기존 데이터가 있는 경우
		// 기존 데이터를 덮어쓰더라도 그룹에 영향 X, TPLAN에 UPDATE

		// 그룹 미소속
		if (stats.sano == 0) {
			console.log(
				'교차로가 그룹에 속해있지 않습니다. DB저장 시 그룹TOD에는 반영되지 않습니다. 계속 진행하시겠습니까?'
			);
			saveData('day');
		}
		// 그룹 소속
		else {
			if (iData1) {
				if (temp1.length) {
					console.log('시간이 일치하지 않아 저장을 할 수 없습니다.');
				} else if (temp2.length) {
					console.log('주기가 일치하지 않아 저장을 할 수 없습니다.');
				} else if (temp3.length) {
					console.log('옵셋이 일치하지 않아 저장을 할 수 없습니다.');
				} else {
					document.createWindow('pattern', id, e, {
						property: [stats.lcno, stats.sano, consts.plan],
						tables: [table1, table2]
					});
				}
			} else {
				document.createWindow('pattern', id, e, {
					property: [stats.lcno, stats.sano, consts.plan],
					tables: [table1, table2]
				});
			}
		}
	}

	// DB저장
	function saveData(sort) {
		if (sort == 'day') {
			let temp1 = table2.getSourceData(1, 0, 32, 13);

			let day = [];

			let dtKeys1 = [
				'datamodetype',
				'tplan',
				'lcno',
				'tplanindex',
				'asplit1',
				'asplit2',
				'asplit3',
				'asplit4',
				'asplit5',
				'asplit6',
				'asplit7',
				'asplit8',
				'bsplit1',
				'bsplit2',
				'bsplit3',
				'bsplit4',
				'bsplit5',
				'bsplit6',
				'bsplit7',
				'bsplit8',
				'offset'
			];

			let jsonArray1;

			// 일계획
			temp1.forEach((v, i) => {
				if (i % 2 == 0) {
					let a = ntoo(temp1[i]);
					let b = ntoo(temp1[i + 1]);
					let s = [...a.slice(0, 1), ...a.slice(6, 14), ...b.slice(6, 14), ...a.slice(4, 5)];
					if (iData1) {
						day.push([...[2, consts.plan, stats.lcno], ...s]);
					} else {
						day.push([...[1, consts.plan, stats.lcno], ...s]);
					}
				}
			});

			day.unshift(dtKeys1);

			jsonArray1 = atoj(day);

			ajax(`/NTCS_M_TPLAN/UpdateManyCustom`, 'PUT', jsonArray1).then((res) => {
				document.isSuccess(res);
				if (res.success) {
					const json = NsetLog({
						data: [
							4,
							14,
							225,
							0,
							$userId,
							stats.lcno,
							document.lcCon.LCs[stats.lcno].lcname,
							'일계획 저장성공'
						]
					});
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				} else {
					const json = NsetLog({
						data: [
							4,
							14,
							225,
							0,
							$userId,
							stats.lcno,
							document.lcCon.LCs[stats.lcno].lcname,
							'일계획 저장실패'
						]
					});
					ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
				}
			});
		} else if (sort == 'week') {
			let temp2 = table4.getSourceData(1, 1, 1, 7);
			let week = [];

			let dtKeys2 = ['sa_no', 'sa_week', 'sa_dplan'];

			let jsonArray2;

			// 주계획
			temp2[0].forEach((v, i) => {
				week.push([stats.sano, i, Number(v)]);
			});

			week.unshift(dtKeys2);
			jsonArray2 = atoj(week);

			ajax(`/weekly-plan/local?lcno=${stats.lcno}&sano=${stats.sano}`, 'PUT', jsonArray2).then(
				(res) => {
					document.isSuccess(res);
					if (res.success) {
						const json = NsetLog({
							data: [
								4,
								14,
								224,
								0,
								$userId,
								stats.lcno,
								document.lcCon.LCs[stats.lcno].lcname,
								'주간계획 저장성공'
							]
						});
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					} else {
						const json = NsetLog({
							data: [
								4,
								14,
								224,
								0,
								$userId,
								stats.lcno,
								document.lcCon.LCs[stats.lcno].lcname,
								'주간계획 저장실패'
							]
						});
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					}
				}
			);
		} else {
			let temp3 = table6.getSourceData(0, 2, 3, 16);
			let holiday = [];
			let _holiday = [];

			let dtKeys3 = ['sa_no', 'sa_hplanindex', 'sa_mon', 'sa_day', 'sa_dplan'];

			let jsonArray3;

			// 휴일계획
			holiday = [
				[...temp3[0], ...temp3[2]],
				[...temp3[1], ...temp3[3]]
			];
			for (let i = 0; i < 30; i++) {
				if (holiday[0][i] == '' || holiday[1][i] == '') {
					_holiday.push([stats.sano, i + 1, 0, 0, 0]);
				} else {
					_holiday.push([
						stats.sano,
						i + 1,
						Number(holiday[0][i].split('/')[0]),
						Number(holiday[0][i].split('/')[1]),
						holiday[1][i]
					]);
				}
			}

			_holiday.unshift(dtKeys3);
			jsonArray3 = atoj(_holiday);

			ajax(`/holiday-plan/local?lcno=${stats.lcno}&sano=${stats.sano}`, 'PUT', jsonArray3).then(
				(res) => {
					document.isSuccess(res);
					if (res.success) {
						const json = NsetLog({
							data: [
								4,
								14,
								223,
								0,
								$userId,
								stats.lcno,
								document.lcCon.LCs[stats.lcno].lcname,
								'특수일계획 저장성공'
							]
						});
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					} else {
						const json = NsetLog({
							data: [
								4,
								14,
								223,
								0,
								$userId,
								stats.lcno,
								document.lcCon.LCs[stats.lcno].lcname,
								'특수일계획 저장실패'
							]
						});
						ajax('/NTCS_L_EVENT/SetLog', 'POST', json);
					}
				}
			);
		}
	}

	// 초기 조회
	onMount(() => {
		// 센터
		searchData(null, 'day');
		searchData(null, 'week');
		searchData(null, 'holiday');

		// 로컬
		initAll('local');
	});
</script>

<div class="tabPage">
	<Legend legend="<image style='margin-right: 5px' src='/svg/center.svg' />센터" color="#80CE8C">
		<div class="tabContent">
			<div class="day">
				<Legend legend="일계획" color="#DADDE1">
					<div>
						<Table
							bind:wrapper={elems.table1}
							bind:table={table1}
							data={data1}
							width={'100%'}
							height={'254px'}
							option={option1}
						/>
					</div>
				</Legend>
			</div>
		</div>
		<div class="tabButton">
			<div class="center day">
				<div>
					<Button icon="search" on:click={(e) => searchData(e, 'day')}>조회</Button>
					<Button icon="init" on:click={() => initData(table1, 'day')}>초기화</Button>
					<Button icon="edit" on:click={editTOD}>TOD편집</Button>
					<Button icon="edit" on:click={editSPLIT}>스플릿편집</Button>
					<Button icon="compare" on:click={() => compareData('day')}>검증</Button>
				</div>
				<div class="sel">
					<select bind:value={selected1} on:change={DropDownEvent} class="static">
						{#each consts.option1 as i}
							<option value={i.id}>
								{i.text}
							</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
		<div class="tabContent">
			<div class="week">
				<Legend legend="주간계획" color="#DADDE1">
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
			<div class="center week">
				<div>
					<Button icon="search" on:click={(e) => searchData(e, 'week')}>조회</Button>
					<Button icon="init" on:click={() => initData(table3, 'week')}>초기화</Button>
					<Button icon="compare" on:click={() => compareData('week')}>검증</Button>
				</div>
			</div>
		</div>
		<div class="tabContent">
			<div class="holiday">
				<Legend legend="휴일계획" color="#DADDE1">
					<div>
						<Table
							bind:wrapper={elems.table5}
							bind:table={table5}
							data={data5}
							width={'100%'}
							height={'auto'}
							option={option3}
						/>
					</div>
				</Legend>
			</div>
		</div>
		<div class="tabButton">
			<div class="center holiday">
				<div>
					<Button icon="search" on:click={(e) => searchData(e, 'holiday')}>조회</Button>
					<Button icon="init" on:click={() => initData(table5, 'holiday')}>초기화</Button>
					<Button icon="compare" on:click={() => compareData('holiday')}>검증</Button>
				</div>
			</div>
		</div>
	</Legend>
	<Legend legend="<image style='margin-right: 5px' src='/svg/local.svg' />로컬" color="#86B5DE">
		<div class="tabContent">
			<div class="day">
				<Legend legend="일계획" color="#DADDE1">
					<div>
						<Table
							bind:wrapper={elems.table2}
							bind:table={table2}
							data={data2}
							width={'100%'}
							height={'254px'}
							option={option1}
						/>
					</div>
				</Legend>
			</div>
		</div>
		<div class="tabButton">
			<div class="local day">
				<div>
					<Button colored={true} icon="sync" on:click={() => downloadData('day')}>동기화</Button>
				</div>
				<div>
					<Button icon="upload" on:click={() => uploadData('day')}>업로드</Button>
					<Button icon="init" on:click={() => initData(table2, 'day')}>초기화</Button>
					<Button icon="save2db" on:click={patternData}>DB저장</Button>
				</div>
			</div>
		</div>
		<div class="tabContent">
			<div class="week">
				<Legend legend="주간계획" color="#DADDE1">
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
			<div class="local week">
				<div>
					<Button colored={true} icon="sync" on:click={() => downloadData('week')}>동기화</Button>
				</div>
				<div>
					<Button icon="upload" on:click={() => uploadData('week')}>업로드</Button>
					<Button icon="init" on:click={() => initData(table4, 'week')}>초기화</Button>
					<Button icon="save2db" on:click={() => saveData('week')}>DB저장</Button>
				</div>
			</div>
		</div>
		<div class="tabContent">
			<div class="holiday">
				<Legend legend="휴일계획" color="#DADDE1">
					<div>
						<Table
							bind:wrapper={elems.table6}
							bind:table={table6}
							data={data6}
							width={'100%'}
							height={'auto'}
							option={option3}
						/>
					</div>
				</Legend>
			</div>
		</div>
		<div class="tabButton">
			<div class="local holiday">
				<div>
					<Button colored={true} icon="sync" on:click={() => downloadData('holiday')}>동기화</Button
					>
				</div>
				<div>
					<Button icon="upload" on:click={() => uploadData('holiday')}>업로드</Button>
					<Button icon="init" on:click={() => initData(table6, 'holiday')}>초기화</Button>
					<Button icon="save2db" on:click={() => saveData('holiday')}>DB저장</Button>
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

	/* 일계획 */
	.tabPage .tabContent > :global(div.day > fieldset) {
		height: 254px;
		padding: 0;
	}

	.tabPage .tabContent :global(div.day > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 254px;
		overflow: hidden;
	}

	/* 주간계획 */
	.tabPage .tabContent > :global(div.week > fieldset) {
		height: 47px;
		padding: 0;
	}

	.tabPage .tabContent :global(div.week > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 47px;
		overflow: hidden;
	}

	/* 휴일계획 */
	.tabPage .tabContent > :global(div.holiday > fieldset) {
		height: 93px;
		padding: 0;
	}

	.tabPage .tabContent :global(div.holiday > fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 93px;
		overflow: hidden;
	}

	/* 버튼 */
	/* 센터 */
	.tabPage .tabButton > div.center {
		display: grid;
		grid-template-columns: auto 102px;
	}

	.tabPage .tabButton > div.center.day div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 80px 100px 100px 70px;
		grid-column-gap: 5px;
	}

	.tabPage .tabButton > div.center.day div:nth-child(2) {
		width: 100px;
		height: 30px;
	}

	.tabPage .tabButton > div.center.week div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 80px 70px;
		grid-column-gap: 5px;
	}

	.tabPage .tabButton > div.center.holiday div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 80px 70px;
		grid-column-gap: 5px;
	}

	/* 로컬 */
	.tabPage .tabButton > div.local {
		display: grid;
		grid-template-columns: 102px auto;
	}

	.tabPage .tabButton > div.local > div:nth-child(1) {
		display: grid;
		grid-template-columns: 100px;
	}

	.tabPage .tabButton > div.local > div:nth-child(2) {
		display: grid;
		justify-content: end;
		grid-template-columns: 80px 80px 90px;
		grid-column-gap: 5px;
	}

	/* Headers */
	/* 일계획 */
	.tabPage .tabContent > :global( div.day > fieldset .handsontable tr:first-child td),
    .tabPage .tabContent > :global( div.day > fieldset .handsontable tr td:nth-child(1)),
    .tabPage .tabContent > :global( div.day > fieldset .handsontable tr td:nth-child(6)),

    /* 주계획 */
    .tabPage .tabContent > :global( div.week > fieldset .handsontable tr:first-child td),
    .tabPage .tabContent > :global( div.week > fieldset .handsontable tr td:nth-child(1)),
    
    /* 특수일계획 */
    .tabPage .tabContent > :global( div.holiday > fieldset .handsontable tr td:nth-child(1)),
    .tabPage .tabContent > :global( div.holiday > fieldset .handsontable tr td:nth-child(2)) {
		color: #999999;
		background: #f4f7f9;
	}

	.tabPage .tabContent > :global(div.holiday > fieldset .handsontable tr:nth-child(1) td),
	.tabPage .tabContent > :global(div.holiday > fieldset .handsontable tr:nth-child(3) td) {
		padding: 0;
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
