<svelte:options accessors />

<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { devuimode } from '$lib/store.mjs';
	import Table from '$lib/nested/table.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	export let winMode = false;
	export let params;

	const consts = {};
	let stats = {};
	let elems = {
		table1: null
	};
	// Table
	let table1;

	// Initial Datas
	let iData;

	// Data
	let data = [];

	// Pattern
	let pattern = Array.from({ length: 16 }, (_) => new Array(1).fill(''));

	const disabled = function (instance, td, row, col, prop, value, cellProperties) {
		Handsontable.renderers.TextRenderer.apply(this, arguments);
		td.style.backgroundColor = 'gray';
		td.style.color = 'var(--mfc2)';
	};

	let optionC = function (row, col, prop) {
		let cellProperties = {};
		if (col != 0 && row > 1) {
			if (col != params.property[2] + 1) {
				cellProperties.renderer = disabled;
				cellProperties.readOnly = true;
			} else {
				cellProperties.type = 'numeric';
			}
		}

		return cellProperties;
	};

	// Option
	let option = {
		colWidths: [34, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		cells: optionC
	};

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

	function makeData(res) {
		let _data;
		pattern = Array.from({ length: 16 }, (_) => new Array(1).fill(''));
		_data = [
			['패턴', '계획번호', '', '', '', '', '', '', '', '', ''],
			['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
			['1', '', '', '', '', '', '', '', '', '', ''],
			['2', '', '', '', '', '', '', '', '', '', ''],
			['3', '', '', '', '', '', '', '', '', '', ''],
			['4', '', '', '', '', '', '', '', '', '', ''],
			['5', '', '', '', '', '', '', '', '', '', ''],
			['6', '', '', '', '', '', '', '', '', '', ''],
			['7', '', '', '', '', '', '', '', '', '', ''],
			['8', '', '', '', '', '', '', '', '', '', ''],
			['9', '', '', '', '', '', '', '', '', '', ''],
			['10', '', '', '', '', '', '', '', '', '', ''],
			['11', '', '', '', '', '', '', '', '', '', ''],
			['12', '', '', '', '', '', '', '', '', '', ''],
			['13', '', '', '', '', '', '', '', '', '', ''],
			['14', '', '', '', '', '', '', '', '', '', ''],
			['15', '', '', '', '', '', '', '', '', '', ''],
			['16', '', '', '', '', '', '', '', '', '', '']
		];

		if (res) {
			iData = res;
			if (res.length) {
				pattern = [];
				res.forEach((v, i) => {
					if (v.sa_split != 0) {
						pattern.push([v.sa_split]);
						_data[v.sa_dplanindex + 1][params.property[2] + 1] = v.sa_split;
					} else {
						pattern.push(['']);
					}
				});
			} else {
				console.log('데이터가 없습니다.');
			}
		}

		return _data;
	}

	function makeOption() {
		let optionM = [];
		optionM = [
			{ row: 0, col: 0, rowspan: 2, colspan: 1 },
			{ row: 0, col: 1, rowspan: 1, colspan: 10 }
		];
		return { mergeCells: optionM };
	}

	function searchData(e) {
		let cnt = 1;
		let isSuccess = new Array(cnt).fill(0);
		let isData = new Array(cnt).fill(0);

		ajax(`/NTCS_M_SADPLAN/GetBy?SA_NO=${params.property[1]}&SA_DPLAN=${params.property[2]}`).then(
			(res) => {
				if (res.hasOwnProperty('success')) {
					table1.loadData(makeData(null));
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
						document.isSuccess({ lcno: params.property[0], sano: params.property[1] });
					}
				}
			}
		);
	}

	function saveData() {
		let temp1 = params.tables[1].getSourceData(1, 0, 32, 13);

		let day = [];

		let dtKeys1 = [
			'sa_no',
			'sa_todauto',
			'tplanindex',
			'sa_starthour',
			'sa_startmin',
			'sum_asplit',
			'offset',
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
			'sa_split',
			'sa_cycle',
			'sa_offset'
		];

		let jsonArray1;

		// 일계획
		let _exist = pattern;
		let _new = table1.getSourceData(2, params.property[2] + 1, 17, params.property[2] + 1);

		let c = 0;
		let ec = 0;

		_exist.forEach((v, i) => {
			ec += Number(v[0]);
		});

		for (let i = 0; i < 16; i++) {
			if (_exist[i][0] !== _new[i][0]) {
				c++;
			}
		}

		if (ec != 0 && c != 0) {
			console.log('입력된 패턴번호가 기존 패턴번호와 다릅니다.');
		} else {
			temp1.forEach((v, i) => {
				if (i % 2 == 0) {
					let a = ntoo(temp1[i]);
					let b = ntoo(temp1[i + 1]);
					let s = [...a.slice(0, 5), ...a.slice(6, 14), ...b.slice(6, 14)];
					let n = ntoo([_new[i / 2][0], _new[i / 2][0], _new[i / 2][0]]);

					day.push([...[params.property[1], 0], ...s, ...n]);
				}
			});

			day.unshift(dtKeys1);

			jsonArray1 = atoj(day);

			ajax(
				`/work-plan/local?lcno=${params.property[0]}&sano=${params.property[1]}&tplan=${params.property[2]}`,
				'PUT',
				jsonArray1
			).then((res) => {
				document.isSuccess(res);
			});
		}
	}

	onMount(() => {
		searchData();
	});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="table">
			<Table
				bind:wrapper={elems.table1}
				bind:table={table1}
				{data}
				width={'100%'}
				height={'auto'}
				{option}
			/>
		</div>
		<div class="button">
			<div>
				<Button icon="search" on:click={searchData}>조회</Button>
			</div>
			<div>
				<Button colored={true} icon="save2db" on:click={saveData}>저장</Button>
			</div>
		</div>
	</div>
</div>

<style>
	/* 메인 */
	#main {
		font-size: 1.3rem;
		background-color: #f9fafb;
		padding: 15px;
		max-height: 1400px;
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 400px;
	}

	/* 카드 */
	.EntireDiv {
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #dbe2e6;
		border-radius: 6px;
		background-color: #fff;
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
		padding: 10px;
	}

	/* 테이블 */
	#main .table {
		display: grid;
		grid-template-columns: 100%;
	}

	/* 버튼 (크기 고정) */
	#main .button {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: end;
		overflow: auto;
	}

	#main .button > div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px;
		grid-column-gap: 5px;
	}

	#main .button > div:nth-child(2) {
		display: grid;
		grid-template-columns: 100px;
		justify-content: end;
	}

	/* Handsontable */
	#main .table :global(.handsontable tr:nth-child(1) td),
	#main .table :global(.handsontable tr:nth-child(2) td),
	#main .table :global(.handsontable tr td:nth-child(1)) {
		color: #999999;
		background: #f4f7f9;
	}
</style>
