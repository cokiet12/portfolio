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

	// Initial Datas
	let iData;

	// Datas
	let data1 = [];

	// Cells
	let optionC = function (row, col, prop) {
		let cellProperties = {};
		if (row > 0 && col == 1) {
			(cellProperties.editor = 'select'),
				(cellProperties.selectOptions = [
					'1.8 x 1.8',
					'4.0 x 1.8',
					'원형루프',
					'장루프',
					'점형검지기',
					'영상',
					'기타'
				]);
		}
		if (row > 0 && col == 2) {
			(cellProperties.editor = 'select'),
				(cellProperties.selectOptions = ['북', '동', '남', '서', '북동', '남동', '남서', '북서']);
		}
		if (row > 0 && col == 5) {
			(cellProperties.editor = 'select'),
				(cellProperties.selectOptions = [
					'직진',
					'좌회전',
					'대기행렬',
					'앞막힘',
					'좌회전대기',
					'쌍루프진입',
					'쌍루프진출'
				]);
		}
		if (row > 0 && col == 6) {
			(cellProperties.editor = 'select'), (cellProperties.selectOptions = ['A링', 'B링']);
		}
		if (row > 0 && col == 8) {
			cellProperties.type = 'checkbox';
		}
		if (row < 1 && col < 1) {
			cellProperties.readOnly = true;
		}
		return cellProperties;
	};

	// Option
	let option = {
		height: '480px',
		colWidths: [60, 90, 50, 50, 50, 90, 50, 50],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		fixedRowsTop: 1,
		cells: optionC
	};

	// Compare
	let compare = [[]];

	// Search Event
	function searchEvent(stat) {
		if (table1) {
			initData(table1);

			setTimeout(function () {
				searchData();
			}, 500);
		}
	}

	function TrueFalse(a) {
		if (a == 1) return true;
		else {
			return false;
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

	// 데이터 변경(number to string)
	function ntos(arr) {
		let res = JSON.parse(JSON.stringify(arr));

		res.forEach((v, i) => {
			v.tfdt_type =
				v.tfdt_type == 0
					? '1.8 x 1.8'
					: v.tfdt_type == 1
					? '4.0 x 1.8'
					: v.tfdt_type == 2
					? '원형루프'
					: v.tfdt_type == 3
					? '장루프'
					: v.tfdt_type == 4
					? '점형검지기'
					: v.tfdt_type == 5
					? '영상'
					: v.tfdt_type == 6
					? '기타'
					: '';
			v.tfdt_dir =
				v.tfdt_dir == 1
					? '북'
					: v.tfdt_dir == 2
					? '동'
					: v.tfdt_dir == 3
					? '남'
					: v.tfdt_dir == 4
					? '서'
					: v.tfdt_dir == 5
					? '북동'
					: v.tfdt_dir == 6
					? '남동'
					: v.tfdt_dir == 7
					? '남서'
					: v.tfdt_dir == 8
					? '북서'
					: '';
			v.tfdt_use =
				v.tfdt_use == 1
					? '직진'
					: v.tfdt_use == 2
					? '좌회전'
					: v.tfdt_use == 3
					? '대기행렬'
					: v.tfdt_use == 4
					? '앞막힘'
					: v.tfdt_use == 5
					? '좌회전대기'
					: v.tfdt_use == 6
					? '쌍루프진입'
					: v.tfdt_use == 7
					? '쌍루프진출'
					: '';
			v.tfdt_ring = v.tfdt_ring == 1 ? 'A링' : v.tfdt_ring == 2 ? 'B링' : '';

			v.tfdt_position = v.tfdt_position == 0 ? '' : v.tfdt_position;
			v.tfdt_lane = v.tfdt_lane == 0 ? '' : v.tfdt_lane;
			v.tfdt_phase = v.tfdt_phase == 0 ? '' : v.tfdt_phase;
		});

		return res;
	}

	// 데이터 변경(string to number)
	function ston(arr) {
		let res = JSON.parse(JSON.stringify(arr));

		res.forEach((v, i) => {
			v.tfdt_type =
				v.tfdt_type == '1.8 x 1.8'
					? 0
					: v.tfdt_type == '4.0 x 1.8'
					? 1
					: v.tfdt_type == '원형루프'
					? 2
					: v.tfdt_type == '장루프'
					? 3
					: v.tfdt_type == '점형검지기'
					? 4
					: v.tfdt_type == '영상'
					? 5
					: v.tfdt_type == '기타'
					? 6
					: 7;
			v.tfdt_dir =
				v.tfdt_dir == '북'
					? 1
					: v.tfdt_dir == '동'
					? 2
					: v.tfdt_dir == '남'
					? 3
					: v.tfdt_dir == '서'
					? 4
					: v.tfdt_dir == '북동'
					? 5
					: v.tfdt_dir == '남동'
					? 6
					: v.tfdt_dir == '남서'
					? 7
					: v.tfdt_dir == '북서'
					? 8
					: 0;
			v.tfdt_use =
				v.tfdt_use == '직진'
					? 1
					: v.tfdt_use == '좌회전'
					? 2
					: v.tfdt_use == '대기행렬'
					? 3
					: v.tfdt_use == '앞막힘'
					? 4
					: v.tfdt_use == '좌회전대기'
					? 5
					: v.tfdt_use == '쌍루프진입'
					? 6
					: v.tfdt_use == '쌍루프진출'
					? 7
					: 0;
			v.tfdt_ring = v.tfdt_ring == 'A링' ? 1 : v.tfdt_ring == 'B링' ? 2 : 0;

			v.tfdt_position = v.tfdt_position == '' ? 0 : Number(v.tfdt_position);
			v.tfdt_lane = v.tfdt_lane == '' ? 0 : Number(v.tfdt_lane);
			v.tfdt_phase = v.tfdt_phase == '' ? 0 : Number(v.tfdt_phase);
			v.tfdt_regflag = v.tfdt_regflag == '' ? false : v.tfdt_regflag;
		});

		return res;
	}

	// 데이터 생성
	function makeData(res) {
		let _data = [['검지기번호', '유형', '방향', '위치', '차로', '용도', '링', '현시', '사용여부']];
		for (let i = 1; i < 65; i++) {
			_data.push([i, '', '', '', '', '', '', '', '']);
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
				let _res = ntos(res);
				_res.forEach((v, i) => {
					_data[i + 1][1] = v.tfdt_type;
					_data[i + 1][2] = v.tfdt_dir;
					_data[i + 1][3] = v.tfdt_position;
					_data[i + 1][4] = v.tfdt_lane;
					_data[i + 1][5] = v.tfdt_use;
					_data[i + 1][6] = v.tfdt_ring;
					_data[i + 1][7] = v.tfdt_phase;
					_data[i + 1][8] = TrueFalse(v.tfdt_regflag);
				});
			} else {
				iData = undefined;
			}
		}

		return _data;
	}

	// 조회
	function searchData(e) {
		let cnt = 1;
		let isSuccess = new Array(cnt).fill(0);
		let isData = new Array(cnt).fill(0);

		ajax(`/NTCS_M_TFDTOPERATE/GetBy?LCNO=${stats.lcno}`).then((res) => {
			if (res.hasOwnProperty('success')) {
				initData(table1);
			} else {
				table1.loadData(makeData(res));
				if (!_.isEmpty(res)) {
					isData[0] = 1;
				}
				isSuccess[0] = 1;
			}
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
	}

	// DB업다운로드
	function upDownData(e) {
		document.createWindow('dbUpDown', false, e, { tabValue: 3, stats: stats });
	}

	// DB저장
	function saveData() {
		let temp1 = table1.getSourceData(1, 0, 64, 8);

		let center = [];
		let sample = [stats.lcno, 0, 0, 0, 0, 0, 0, 0, 0, '0', 0, 0];

		temp1.forEach((v, i) => {
			center.push([...sample, ...[v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], v[8]]]);
		});

		let dtKeys = [
			'int_lcno',
			'tfdt_iodir',
			'tfdt_wghvol',
			'tfdt_wghspd',
			'tfdt_wghsaturation',
			'main_ring',
			'main_phase',
			'sub_ring',
			'sub_phase',
			'tfdt_id',
			'tfdt_real_lcno',
			'tfdt_real_channel',
			'tfdt_no',
			'tfdt_type',
			'tfdt_dir',
			'tfdt_position',
			'tfdt_lane',
			'tfdt_use',
			'tfdt_ring',
			'tfdt_phase',
			'tfdt_regflag'
		];

		center.unshift(dtKeys);

		let jsonArray = atoj(center);
		let _jsonArray = ston(jsonArray);
		console.log(_jsonArray);

		ajax(`/configuration/local?id=${stats.lcno}`, 'PUT', _jsonArray).then((res) => {
			document.isSuccess(res);
		});
	}

	// 초기 조회
	onMount(() => {
		// 센터
		searchData();
	});
</script>

<div class="tabPage">
	<div class="tabContent">
		<Legend legend="검지기구성" color="#DADDE1">
			<div>
				<Table
					bind:wrapper={elems.table1}
					bind:table={table1}
					data={data1}
					width={'100%'}
					height={'480px'}
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

	.tabPage .tabContent :global(fieldset) {
		padding: 0;
		height: 480px;
	}

	.tabPage .tabContent :global(fieldset > div) {
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
		justify-content: end;
	}

	/* Headers */
	.tabPage .tabContent :global(.handsontable tr:first-child td),
	.tabPage .tabContent :global(.handsontable tr td:nth-child(1)) {
		color: #999999;
		background: #f4f7f9;
	}
</style>
