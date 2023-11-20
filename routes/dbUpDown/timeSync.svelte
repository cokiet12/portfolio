<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Legend from '$lib/nested/legend.svelte';
	import Table from '$lib/nested/table.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	const consts = {};
	let stats = {};
	let elems = {
		table1: null
	};
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
		height: '520px',
		colWidths: 31.95,
		rowHeights: 31.95,
		renderer: 'html',
		renderAllRows: true
	};
	let option2 = {
		height: '520px',
		colWidths: [40, 80, 55, 80, 80, 55, 70, 40],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true
	};

	// 데이터 생성
	function makeData(sort) {
		let _data;
		if (sort == 'board') {
			_data = [];
			let lc = document.lcCon.LCs;
			let length = Object.keys(lc).length;
			let share = parseInt(length / 20) + 1;

			for (let i = 0; i < share; i++) {
				let arr = [];
				for (let j = 0; j < 20; j++) {
					if (lc[Object.keys(lc)[i * 20 + j]]) {
						arr.push(lc[Object.keys(lc)[i * 20 + j]].lcno);
					} else {
						arr.push('');
					}
				}
				_data.push(arr);
			}
		} else {
			_data = [
				['번호', '교차로명', '통신상태', '서버시간', '제어기시간', '시간차', '동기화상태', '선택']
			];

			for (let i = 0; i < 30; i++) {
				let temp = [`${i + 1}`, '', '', '', '', '', '', false];
				_data.push(temp);
			}
		}

		return _data;
	}

	// 초기화
	function initData(table, sort) {
		table.loadData(makeData(sort));
	}

	// 초기 조회
	onMount(() => {
		initData(table1, 'board');
		initData(table2, 'list');
	});
</script>

<div class="tabPage">
	<div class="tabContent">
		<Legend legend="<image style='margin-right: 5px' src='/svg/center.svg' />센터" color="#80CE8C">
			<div>
				<Table
					bind:wrapper={elems.table1}
					bind:table={table1}
					data={data1}
					width={'100%'}
					height={'520px'}
					option={option1}
				/>
				<div>정보없음</div>
			</div>
		</Legend>
	</div>
	<div class="tabContent">
		<Legend legend="<image style='margin-right: 5px' src='/svg/local.svg' />로컬" color="#86B5DE">
			<div>
				<Table
					bind:wrapper={elems.table2}
					bind:table={table2}
					data={data2}
					width={'100%'}
					height={'520px'}
					option={option2}
				/>
			</div>
		</Legend>
	</div>
	<div class="tabButton">
		<div class="center">
			<div />
		</div>
	</div>
	<div class="tabButton">
		<div class="local">
			<div />
			<div />
		</div>
	</div>
</div>

<style>
	.tabPage {
		display: grid;
		grid-template-columns: 1.4fr 1fr;
		grid-template-rows: auto;
		grid-column-gap: 10px;
		grid-row-gap: 10px;
	}

	.tabPage .tabContent :global(fieldset) {
		padding: 0;
		height: 520px;
	}

	.tabPage .tabContent :global(fieldset > div) {
		display: grid;
		grid-template-columns: 100%;
		height: 520px;
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
</style>
