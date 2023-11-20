<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Legend from '$lib/nested/legend.svelte';
	import Table from '$lib/nested/table.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	const consts = {};

	export let stats = {
		lcno: 1,
		sano: 1,
		year: 2010
	};

	$: searchEvent(stats);

	let elems = {
		table1: null
	};
	// Table
	export let table1;

	// Json
	// 2004년 json
	let json = [
		{
			index: 1,
			name1: '링운영방법',
			name2: '듀얼링 가능 시간차',
			type: 'dropdown',
			value: ['0초', '1초', '2초', '3초', '4초', '5초', '6초', '7초'],
			name: 'dualtime'
		},
		{
			index: 3,
			name1: '링운영방법',
			name2: '앞막힘',
			type: 'dropdown',
			value: ['안함', 'MG무시', 'MG유지'],
			name: 'spillcont'
		},
		{
			index: 4,
			name1: '링운영방법',
			name2: '링구분',
			type: 'dropdown',
			value: ['Single', 'Dual'],
			name: 'ring'
		},
		{
			index: 5,
			name1: '주현시지정',
			name2: '감응여부',
			type: 'dropdown',
			value: ['감응안함', 'GAP', '한계손실', 'GAP+한계손실', '완전감응', '테스트'],
			name: 'actyn'
		},
		{
			index: 6,
			name1: '주현시지정',
			name2: '주현시번호',
			type: 'dropdown',
			value: ['1현시', '2현시', '3현시', '4현시', '5현시', '6현시', '7현시', '8현시'],
			name: 'genmain'
		},
		{
			index: 7,
			name1: '주현시지정',
			name2: '듀얼운영 현시지정',
			type: 'checkbox',
			value: null,
			name: 'gendual'
		},
		{
			index: 8,
			name1: '특수옵션',
			name2: '수동진행',
			type: 'dropdown',
			value: ['MG유지', 'MG무시'],
			name: 'manualopt'
		},
		{
			index: 16,
			name1: '시차제어',
			name2: '주현시번호',
			type: 'dropdown',
			value: ['1현시', '2현시', '3현시', '4현시', '5현시', '6현시', '7현시', '8현시'],
			name: 'spcmain'
		},
		{
			index: 17,
			name1: '시차제어',
			name2: '시차제맵 듀얼운영지정',
			type: 'checkbox',
			value: null,
			name: 'spcdual'
		},
		{
			index: 18,
			name1: '감응시간',
			name2: 'Gap시간',
			type: 'input',
			value: null,
			name: 'gaptime'
		},
		{
			index: 19,
			name1: '감응시간',
			name2: '한계손실시간',
			type: 'input',
			value: null,
			name: 'lmtlos'
		}
	];

	// 2010년 json
	let _json = [
		{
			index: 0,
			name1: '링운영방법',
			name2: '전감응',
			type: 'dropdown',
			value: ['불가', '허용'],
			name: 'fullact'
		},
		{
			index: 1,
			name1: '링운영방법',
			name2: '듀얼링 가능 시간차',
			type: 'dropdown',
			value: ['0초', '1초', '2초', '3초', '4초', '5초', '6초', '7초'],
			name: 'dualtime'
		},
		{
			index: 2,
			name1: '링운영방법',
			name2: '앞막힘 처리',
			type: 'dropdown',
			value: ['출력마스크', '현시진행'],
			name: 'spillproc'
		},
		{
			index: 3,
			name1: '링운영방법',
			name2: '앞막힘',
			type: 'dropdown',
			value: ['안함', 'MG무시', 'MG유지'],
			name: 'spillcont'
		},
		{
			index: 4,
			name1: '링운영방법',
			name2: '링구분',
			type: 'dropdown',
			value: ['Single', 'Dual'],
			name: 'ring'
		},
		{
			index: 5,
			name1: '주현시지정',
			name2: '감응여부',
			type: 'dropdown',
			value: ['감응안함', 'GAP', '한계손실', 'GAP+한계손실', '완전감응', '테스트'],
			name: 'actyn'
		},
		{
			index: 6,
			name1: '주현시지정',
			name2: '주현시번호',
			type: 'dropdown',
			value: ['1현시', '2현시', '3현시', '4현시', '5현시', '6현시', '7현시', '8현시'],
			name: 'genmain'
		},
		{
			index: 7,
			name1: '주현시지정',
			name2: '듀얼운영 현시지정',
			type: 'checkbox',
			value: null,
			name: 'gendual'
		},
		{
			index: 8,
			name1: '특수옵션',
			name2: '수동진행',
			type: 'dropdown',
			value: ['MG유지', 'MG무시'],
			name: 'manualopt'
		},
		{
			index: 9,
			name1: '특수옵션',
			name2: '(차량진행)보행자버튼 고장처리',
			type: 'dropdown',
			value: ['단선현시만운영', '전체현시운영'],
			name: 'normalpush'
		},
		{
			index: 10,
			name1: '특수옵션',
			name2: '(점멸제어)보행자버튼 고장처리',
			type: 'dropdown',
			value: ['점멸제어유지', '점멸제어해제'],
			name: 'flashpush'
		},
		{
			index: 11,
			name1: '특수옵션',
			name2: '점멸중 보행자 신호운영 처리',
			type: 'dropdown',
			value: ['점멸 중 보행자콜처리맵사용', '운영맵사용'],
			name: 'flashpushop'
		},
		{
			index: 12,
			name1: '특수옵션',
			name2: '보행자작동신호 처리단위',
			type: 'dropdown',
			value: ['해당현시', '한 주기'],
			name: 'pushcycle'
		},
		{
			index: 13,
			name1: '특수옵션',
			name2: '시그널맵 처리',
			type: 'dropdown',
			value: ['SCU리셋 후', '다음주기 적용'],
			name: 'sigmapmtd'
		},
		{
			index: 14,
			name1: '특수옵션',
			name2: '현시 생략 감응방법1',
			type: 'dropdown',
			value: ['감응 중 주기길이유지', '완전감응'],
			name: 'actphase1'
		},
		{
			index: 15,
			name1: '특수옵션',
			name2: '현시 생략 감응방법2',
			type: 'dropdown',
			value: ['현시모두표출', '조기종결수행'],
			name: 'actphase2'
		},
		{
			index: 16,
			name1: '시차제어',
			name2: '주현시번호',
			type: 'dropdown',
			value: ['1현시', '2현시', '3현시', '4현시', '5현시', '6현시', '7현시', '8현시'],
			name: 'spcmain'
		},
		{
			index: 17,
			name1: '시차제어',
			name2: '시차제맵 듀얼운영지정',
			type: 'checkbox',
			value: null,
			name: 'spcdual'
		},
		{
			index: 18,
			name1: '감응시간',
			name2: 'Gap시간',
			type: 'input',
			value: null,
			name: 'gaptime'
		},
		{
			index: 19,
			name1: '감응시간',
			name2: '한계손실시간',
			type: 'input',
			value: null,
			name: 'lmtlos'
		},
		{
			index: 20,
			name1: '시차제맵</br>운영지정',
			name2: '시차제맵#1 Dual운영지정',
			type: 'checkbox',
			value: null,
			name: 'spc1dual'
		},
		{
			index: 21,
			name1: '시차제맵</br>운영지정',
			name2: '시차제맵#2 Dual운영지정',
			type: 'checkbox',
			value: null,
			name: 'spc2dual'
		},
		{
			index: 22,
			name1: '시차제맵</br>운영지정',
			name2: '시차제맵#3 Dual운영지정',
			type: 'checkbox',
			value: null,
			name: 'spc3dual'
		},
		{
			index: 23,
			name1: '시차제맵</br>운영지정',
			name2: '시차제맵#4 Dual운영지정',
			type: 'checkbox',
			value: null,
			name: 'spc4dual'
		},
		{
			index: 24,
			name1: '시차제맵</br>운영지정',
			name2: '시차제맵#5 Dual운영지정',
			type: 'checkbox',
			value: null,
			name: 'spc5dual'
		},
		{
			index: 25,
			name1: '긴급</br>우선제어',
			name2: '버스',
			type: 'dropdown',
			value: ['불가', '허용'],
			name: 'prebus'
		},
		{
			index: 26,
			name1: '긴급</br>우선제어',
			name2: '긴급현시점프',
			type: 'dropdown',
			value: ['불가', '허용'],
			name: 'jumpphase'
		},
		{
			index: 27,
			name1: '긴급</br>우선제어',
			name2: '긴급차량',
			type: 'dropdown',
			value: ['불가', '허용'],
			name: 'preemergency'
		},
		{
			index: 28,
			name1: 'UPS</br>제어옵션',
			name2: '매월시험',
			type: 'dropdown',
			value: ['불가', '허용'],
			name: 'checkmonth'
		},
		{
			index: 29,
			name1: 'UPS</br>제어옵션',
			name2: '정전시 조광',
			type: 'dropdown',
			value: ['조광', '정상'],
			name: 'powerdim'
		},
		{
			index: 30,
			name1: 'UPS</br>제어옵션',
			name2: '정전시 점멸',
			type: 'dropdown',
			value: ['정상', '점멸'],
			name: 'powerflash'
		},
		{
			index: 31,
			name1: '현시별</br>감응수행',
			name2: '현시별 감응수행A링',
			type: 'checkbox',
			value: null,
			name: 'aringact'
		},
		{
			index: 32,
			name1: '현시별</br>감응수행',
			name2: '현시별 감응수행B링',
			type: 'checkbox',
			value: null,
			name: 'bringact'
		},
		{
			index: 33,
			name1: 'PED</br>음성명령',
			name2: '음성멘트 출력지정',
			type: 'dropdown',
			value: ['자동', '15초', '30초', '45초'],
			name: 'voicecycle'
		},
		{
			index: 34,
			name1: 'PED</br>음성명령',
			name2: '주간음량',
			type: 'dropdown',
			value: ['소거', '50%', '75%', '100%'],
			name: 'dayvol'
		},
		{
			index: 35,
			name1: 'PED</br>음성명령',
			name2: '야간음량',
			type: 'dropdown',
			value: ['소거', '25%', '50%', '75%'],
			name: 'nightvol'
		},
		{
			index: 36,
			name1: 'PED</br>음성명령',
			name2: '시각장애인 음향발생',
			type: 'dropdown',
			value: ['소거', '발생'],
			name: 'voiceyn'
		},
		{
			index: 37,
			name1: 'PED</br>음성명령',
			name2: '예약',
			type: 'dropdown',
			value: ['Disable', 'Enable'],
			name: 'voice_res_yn'
		},
		{
			index: 38,
			name1: 'PED</br>제어명령',
			name2: '심야시간 시작',
			type: 'dropdown',
			value: ['미사용', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'],
			name: 'nightstart'
		},
		{
			index: 39,
			name1: 'PED</br>제어명령',
			name2: '심야시간 종료',
			type: 'dropdown',
			value: ['미사용', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00'],
			name: 'nightend'
		},
		{
			index: 40,
			name1: 'PED</br>제어명령',
			name2: '예약',
			type: 'dropdown',
			value: ['1번', '2번', '3번', '4번'],
			name: 'time_res_yn'
		}
	];

	// Initial Datas
	let iData;

	// Datas
	// 센터
	let data1 = [];

	// Cells
	let cellOption = function (row, col, prop) {
		var cellProperties = {};
		if (col < 2) {
			cellProperties.readOnly = true;
		}
		return cellProperties;
	};

	// Option
	let option = {
		colWidths: [30, 70, 13, 13, 13, 13, 13, 13, 13, 13],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		cells: cellOption
	};

	// Compare
	let compare = [];

	// Search Event
	function searchEvent(stat) {
		if (table1) {
			initData(table1);

			setTimeout(function () {
				searchData();
			}, 500);
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

	// 십진수 이진수 변경(decimal to binary)
	function dtob(value) {
		let bin = (value >>> 0).toString(2).padStart(8, '0');
		let check = bin.split('');
		let reverse = [...check].reverse();
		for (let i in reverse) {
			reverse[i] = Boolean(Number(reverse[i]));
		}
		return reverse;
	}

	// 이진수 십진수 변경(binary to decimal)
	function btod(value) {
		let slice = value.slice(-8);
		let binstring = '';
		for (let i in slice) {
			binstring += Number(slice[i]);
		}
		let reverse = binstring.split('').reverse().join('');
		let result = Number('0b' + reverse);
		return result;
	}

	// 데이터 변경(number to string)
	function ntos(arr) {
		let res = JSON.parse(JSON.stringify(arr));
		if (res[0].lcno) {
			delete res[0].lcno;
		}

		let jsonArray = stats.year == 2004 ? json : _json;

		Object.keys(res[0]).forEach(function (k) {
			let find = jsonArray.find((v) => v.name == k);
			if (find) {
				if (find.type == 'dropdown') {
					res[0][k] = find.value[res[0][k]];
				} else if (find.type == 'checkbox') {
					res[0][k] = dtob(res[0][k]);
				} else {
					res[0][k] = res[0][k];
				}
			}
		});

		return res;
	}

	// 데이터 변경(string to number)
	function ston(arr) {
		let res = JSON.parse(JSON.stringify(arr));
		if (res[0].lcno) {
			delete res[0].lcno;
		}

		let jsonArray = stats.year == 2004 ? json : _json;

		Object.keys(res[0]).forEach(function (k) {
			let find = jsonArray.find((v) => v.name == k);
			if (find) {
				if (find.type == 'dropdown') {
					res[0][k] = find.value.indexOf(res[0][k]);
				} else if (find.type == 'checkbox') {
					res[0][k] = btod(res[0][k]);
				} else {
					res[0][k] = Number(res[0][k]);
				}
			}
		});

		return res;
	}

	// 데이터 생성
	function makeData(res) {
		let _data = new Array();
		let jsonArray = stats.year == 2004 ? json : _json;

		jsonArray.forEach((v, i) => {
			if (v.type == 'checkbox') {
				_data.push([v.name1, v.name2, false, false, false, false, false, false, false, false]);
			} else if (v.type == 'dropdown') {
				_data.push([v.name1, v.name2, v.value[0], null, null, null, null, null, null, null]);
			} else {
				_data.push([v.name1, v.name2, 0, null, null, null, null, null, null, null]);
			}
		});

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
				let _res = ntos(res)[0];

				jsonArray.forEach((v, i) => {
					if (v.type == 'checkbox') {
						_data.push([...[v.name1, v.name2], ..._res[v.name]]);
					} else {
						_data.push([v.name1, v.name2, _res[v.name], null, null, null, null, null, null, null]);
					}
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
		if (stats.year == 2004) {
			optionM = [
				{ row: 0, col: 0, rowspan: 3, colspan: 1 },
				{ row: 3, col: 0, rowspan: 3, colspan: 1 },
				{ row: 7, col: 0, rowspan: 2, colspan: 1 },
				{ row: 9, col: 0, rowspan: 2, colspan: 1 }
			];

			json.forEach((v, i) => {
				if (v.type != 'checkbox') {
					if (v.type == 'dropdown') {
						optionC.push({ row: i, col: 2, type: 'dropdown', source: v.value });
					}
					optionM.push({ row: i, col: 2, rowspan: 1, colspan: 8 });
				} else {
					for (let j = 2; j < 10; j++) {
						optionC.push({
							row: i,
							col: j,
							type: 'checkbox',
							label: { position: 'after', value: j - 1 }
						});
					}
				}
			});
		} else {
			optionM = [
				{ row: 0, col: 0, rowspan: 5, colspan: 1 },
				{ row: 5, col: 0, rowspan: 3, colspan: 1 },
				{ row: 8, col: 0, rowspan: 8, colspan: 1 },
				{ row: 16, col: 0, rowspan: 2, colspan: 1 },
				{ row: 18, col: 0, rowspan: 2, colspan: 1 },
				{ row: 20, col: 0, rowspan: 5, colspan: 1 },
				{ row: 25, col: 0, rowspan: 3, colspan: 1 },
				{ row: 28, col: 0, rowspan: 3, colspan: 1 },
				{ row: 31, col: 0, rowspan: 2, colspan: 1 },
				{ row: 33, col: 0, rowspan: 5, colspan: 1 },
				{ row: 38, col: 0, rowspan: 3, colspan: 1 }
			];

			_json.forEach((v, i) => {
				if (v.type != 'checkbox') {
					if (v.type == 'dropdown') {
						optionC.push({ row: i, col: 2, type: 'dropdown', source: v.value });
					}
					optionM.push({ row: i, col: 2, rowspan: 1, colspan: 8 });
				} else {
					for (let j = 2; j < 10; j++) {
						optionC.push({
							row: i,
							col: j,
							type: 'checkbox',
							label: { position: 'after', value: j - 1 }
						});
					}
				}
			});
		}

		return { mergeCells: optionM, cell: optionC };
	}

	// 조회
	function searchData(e) {
		let cnt = 1;
		let isSuccess = new Array(cnt).fill(0);
		let isData = new Array(cnt).fill(0);

		ajax(`/NTCS_M_STARTUP/GetBy?LCNO=${stats.lcno}`).then((res) => {
			if (res.hasOwnProperty('success')) {
				initData(table1);
			} else {
				table1.loadData(makeData(res));
				table1.updateSettings(makeOption());
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
		table.loadData(makeData(null));
		table.updateSettings(makeOption(null));
	}

	// DB업다운로드
	function upDownData(e) {
		document.createWindow('dbUpDown', false, e, { tabValue: 1, stats: stats });
	}

	// DB저장
	function saveData() {
		let _res =
			stats.year == 2004 ? table1.getSourceData(0, 2, 10, 9) : table1.getSourceData(0, 2, 40, 9);

		let jsonArray = stats.year == 2004 ? json : _json;

		let temp1 = new Array();
		let temp2 = new Object();

		jsonArray.forEach((v, i) => {
			if (v.type != 'checkbox') {
				temp2[v.name] = _res[i][0];
			} else {
				temp2[v.name] = _res[i];
			}
		});

		temp1.push(temp2);

		let temp3 = ston(temp1);
		temp3[0].lcno = stats.lcno;

		// 2004년
		if (stats.year == 2004) {
			let sample = {
				actphase1: 0,
				actphase2: 0,
				actyn: 0,
				aringact: 0,
				bringact: 0,
				checkmonth: 0,
				dayvol: 0,
				dualtime: 0,
				flashpush: 0,
				flashpushop: 0,
				fullact: 0,
				gaptime: 0,
				gendual: 0,
				genmain: 0,
				jumpphase: 0,
				lcno: 0,
				lmtlos: 0,
				manualopt: 0,
				nightend: 0,
				nightstart: 0,
				nightvol: 0,
				normalpush: 0,
				powerdim: 0,
				powerflash: 0,
				prebus: 0,
				preemergency: 0,
				pushcycle: 0,
				ring: 0,
				sigmapmtd: 0,
				spc1dual: 0,
				spc2dual: 0,
				spc3dual: 0,
				spc4dual: 0,
				spc5dual: 0,
				spcdual: 0,
				spcmain: 0,
				spillcont: 0,
				spillproc: 0,
				time_res_yn: 0,
				voice_res_yn: 0,
				voicecycle: 0,
				voiceyn: 0
			};

			temp3 = [Object.assign(sample, temp3[0])];
		}

		if (iData) {
			ajax('/NTCS_M_STARTUP/UpdateMany', 'PUT', temp3).then((res) => {
				document.isSuccess(res);
			});
		} else {
			ajax('/NTCS_M_STARTUP/AddMany', 'POST', temp3).then((res) => {
				document.isSuccess(res);
			});
		}
	}

	// 초기 조회
	onMount(() => {
		searchData();
	});
</script>

<div class="tabPage {stats.year == 2004 ? '_2004' : '_2010'}">
	<div class="tabContent">
		<Legend legend="제어변수" color="#DADDE1">
			<div>
				<Table
					bind:wrapper={elems.table1}
					bind:table={table1}
					data={data1}
					width={'100%'}
					height={'auto'}
					{option}
				/>
			</div>
		</Legend>
	</div>
	<div class="tabButton">
		<div>
			<Button icon="search" on:click={searchData}>조회</Button>
			<Button icon="init" on:click={initData(table1)}>초기화</Button>
			<Button icon="save2db" on:click={saveData}>DB저장</Button>
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

	/* 2004년식 */
	.tabPage._2004 .tabContent :global(fieldset) {
		height: 303px;
		padding: 0;
	}

	.tabPage._2004 .tabContent :global(fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 303px;
		overflow: hidden;
	}

	/* 2010년식 */
	.tabPage._2010 .tabContent :global(fieldset) {
		height: 480px;
		padding: 0;
	}

	.tabPage._2010 .tabContent :global(fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 480px;
		overflow: hidden;
	}

	/* 버튼 */
	.tabButton {
		display: grid;
		grid-template-columns: 2fr 1fr;
	}

	.tabButton > div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 80px 90px;
		grid-column-gap: 5px;
	}

	.tabButton > div:nth-child(2) {
		display: grid;
		grid-template-columns: 100px;
		grid-column-gap: 5px;
		justify-content: end;
	}

	/* Headers */
	.tabPage .tabContent :global(.handsontable tr td:first-child),
	.tabPage .tabContent :global(.handsontable tr td:nth-child(2)) {
		color: #999999;
		background: #f4f7f9;
	}

	.tabPage .tabContent :global(.handsontable tr td:nth-child(2)) {
		text-align: right;
	}

	/* Dropdown */
	.tabPage .tabContent :global(.handsontable td.htAutocomplete) {
		border: 4px solid #fff;
		box-shadow: inset 0 0 0 1px #999;
	}

	.tabPage .tabContent :global(.handsontable td.htAutocomplete .htAutocompleteArrow) {
		color: #999;
	}

	/* TextArea */
	.tabPage .tabContent :global(.tableWrapper textarea) {
		text-align: center;
	}
</style>
