<svelte:options accessors />

<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Button from '$lib/nested/button.svelte';
	import Legend from '$lib/nested/legend.svelte';
	import Input from '$lib/nested/input.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';
	import Chart from 'chart.js/auto/auto.js';

	// 창모드 / 싱글, 듀얼모드
	export let winMode = false;

	const consts = {
		option: [
			{ id: 1, text: '15분' },
			{ id: 2, text: '1시간' },
			{ id: 3, text: '1일' },
			{ id: 4, text: '한 달' }
		]
	};
	let stats = {};

	let elems = {
		canvas1: null,
		canvas2: null,
		canvas3: null,
		table1: null
	};

	let selected = 1;

	// Chart
	let chart1;
	let chart2;
	let chart3;

	// Table
	let table1;

	// Datas
	let data1 = [];

	// Cells
	let optionC = function (row, col, prop) {
		let cellProperties = {};
		cellProperties.readOnly = true;
		return cellProperties;
	};

	// Option
	let option1 = {
		colWidths: [80, 40, 40, 40, 40, 40],
		rowHeights: 23,
		renderer: 'html',
		cells: optionC,
		renderAllRows: true,
		nestedHeaders: [
			[
				{ label: '생성일시', colspan: 1 },
				{ label: '교차로 번호', colspan: 1 },
				{ label: '교차로 이름', colspan: 1 },
				{ label: '교통량(대)', colspan: 1 },
				{ label: '대기길이', colspan: 1 },
				{ label: 'LOS', colspan: 1 }
			]
		]
	};

	// 랜덤
	function random() {
		let arr = [];
		for (let i = 0; i < 24; i++) {
			const rand = Math.floor(Math.random() * 61) + 1;
			arr.push(rand);
		}

		return arr;
	}

	// 데이터 생성
	function makeData(res) {
		let _data = [];

		for (let i = 0; i < 30; i++) {
			_data.push(['2022-12-25 12:00:00', '1', '-', '-', '-', '-']);
		}

		if (res) {
			let length;
			if (typeof res == 'object') {
				length = Object.keys(res).length;
			} else {
				length = res.length;
			}

			if (length) {
			} else {
			}
		}

		return _data;
	}

	// 초기화
	function initData() {
		table1.loadData(makeData(null));
	}

	// 차트
	const clabels1 = [
		'08:00',
		'08:05',
		'08:10',
		'08:15',
		'08:20',
		'08:25',
		'08:30',
		'08:35',
		'08:40',
		'08:45',
		'08:50',
		'08:55',
		'09:00',
		'09:05',
		'09:10',
		'09:15',
		'09:20',
		'09:25',
		'09:30',
		'09:35',
		'09:40',
		'09:45',
		'09:50',
		'09:55'
	];

	const clabels2 = [
		'08:00',
		'08:05',
		'08:10',
		'08:15',
		'08:20',
		'08:25',
		'08:30',
		'08:35',
		'08:40',
		'08:45',
		'08:50',
		'08:55',
		'09:00',
		'09:05',
		'09:10',
		'09:15',
		'09:20',
		'09:25',
		'09:30',
		'09:35',
		'09:40',
		'09:45',
		'09:50',
		'09:55'
	];

	const clabels3 = [
		'08:00',
		'08:05',
		'08:10',
		'08:15',
		'08:20',
		'08:25',
		'08:30',
		'08:35',
		'08:40',
		'08:45',
		'08:50',
		'08:55',
		'09:00',
		'09:05',
		'09:10',
		'09:15',
		'09:20',
		'09:25',
		'09:30',
		'09:35',
		'09:40',
		'09:45',
		'09:50',
		'09:55'
	];

	const cdata1 = {
		labels: clabels1,
		datasets: [
			{
				label: '1번 교차로',
				data: random(),
				backgroundColor: [
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)'
				],
				borderColor: [
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)'
				],
				borderWidth: 1
			},
			{
				label: '2번 교차로',
				data: random(),
				backgroundColor: [
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)'
				],
				borderColor: [
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)'
				],
				borderWidth: 1
			},
			{
				label: '3번 교차로',
				data: random(),
				backgroundColor: [
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)'
				],
				borderColor: [
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)'
				],
				borderWidth: 1
			},
			{
				label: '4번 교차로',
				data: random(),
				backgroundColor: [
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)'
				],
				borderColor: [
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)'
				],
				borderWidth: 1
			}
		]
	};

	const cdata2 = {
		labels: clabels2,
		datasets: [
			{
				label: '북',
				data: random(),
				fill: false,
				borderColor: '#0A84FF',
				tension: 0.1
			},
			{
				label: '동',
				data: random(),
				fill: false,
				borderColor: '#D77937',
				tension: 0.1
			},
			{
				label: '남',
				data: random(),
				fill: false,
				borderColor: '#9B9B9B',
				tension: 0.1
			},
			{
				label: '서',
				data: random(),
				fill: false,
				borderColor: '#F1BC2F',
				tension: 0.1
			}
		]
	};

	const cdata3 = {
		labels: clabels3,
		datasets: [
			{
				label: '북',
				data: random(),
				backgroundColor: [
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)'
				],
				borderColor: [
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)'
				],
				borderWidth: 1
			},
			{
				label: '동',
				data: random(),
				backgroundColor: [
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)'
				],
				borderColor: [
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)'
				],
				borderWidth: 1
			},
			{
				label: '남',
				data: random(),
				backgroundColor: [
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)'
				],
				borderColor: [
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)'
				],
				borderWidth: 1
			},
			{
				label: '서',
				data: random(),
				backgroundColor: [
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)'
				],
				borderColor: [
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)'
				],
				borderWidth: 1
			}
		]
	};

	const config1 = {
		type: 'bar',
		data: cdata1,
		options: {
			scales: {
				y: {
					beginAtZero: true
				}
			}
		}
	};

	const config2 = {
		type: 'line',
		data: cdata2
	};

	const config3 = {
		type: 'bar',
		data: cdata3,
		options: {
			scales: {
				y: {
					beginAtZero: true
				}
			}
		}
	};

	// 초기 조회
	onMount(() => {
		initData();

		const ctx1 = elems.canvas1.getContext('2d');
		const ctx2 = elems.canvas2.getContext('2d');
		const ctx3 = elems.canvas3.getContext('2d');
		chart1 = new Chart(ctx1, config1);
		chart2 = new Chart(ctx2, config2);
		chart3 = new Chart(ctx3, config3);
	});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="search">
			<div>
				<Searcher width="200px" />
			</div>
			<div>
				<input type="datetime-local" bind:value={stats.value1} />
			</div>
			<div>
				<input type="datetime-local" bind:value={stats.value2} />
			</div>
			<div>
				<div class="sel">
					<select bind:value={selected} class="static">
						{#each consts.option as i}
							<option value={i.id}>
								{i.text}
							</option>
						{/each}
					</select>
				</div>
			</div>
			<div>
				<Button icon="search" colored={true}>조회</Button>
			</div>
		</div>
		<div class="table">
			<Table
				bind:wrapper={elems.table1}
				bind:table={table1}
				data={data1}
				width={'100%'}
				height={'640px'}
				option={option1}
			/>
		</div>
		<div class="c1">
			<div class="chart1">
				교차로 교통량
				<canvas style="margin:auto;" width={677} height={180} bind:this={elems.canvas1} />
			</div>
		</div>
		<div class="c2">
			<div class="chart2">
				LOS
				<canvas style="margin:auto;" width={677} height={180} bind:this={elems.canvas2} />
			</div>
		</div>
		<div class="c3">
			<div class="chart3">
				대기길이
				<canvas style="margin:auto;" width={677} height={180} bind:this={elems.canvas3} />
			</div>
		</div>
	</div>
</div>

<style>
	/* 메인 */
	#main {
		font-size: 1.3rem;
		background-color: #000000;
		padding: 15px;
		/* 높이(가변) */
		max-height: 720px;
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 1400px;
		height: 900px;
	}

	/* 싱글모드 (창모드 넓이 ~ MAX) */
	#main.modal {
		overflow: auto;
	}

	/* 카드 */
	.EntireDiv {
		height: calc(100% - 32px);
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto 1fr 1fr 1fr;
		grid-row-gap: 10px;
		grid-column-gap: 10px;
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #181d22;
		border-radius: 6px;
		background-color: #181d22;
		padding: 15px;
	}

	.EntireDiv .search {
		grid-area: 1 / 1 / 2 / 3;
		display: grid;
		grid-template-columns: 200px max-content max-content 80px 80px;
		grid-column-gap: 10px;
		/* align-items: end;
                justify-content: end; */
	}

	.EntireDiv .table {
		grid-area: 2 / 1 / 5 / 2;
	}

	.EntireDiv .c1 {
		grid-area: 2 / 2 / 3 / 3;
	}

	.EntireDiv .c2 {
		grid-area: 3 / 2 / 4 / 3;
	}

	.EntireDiv .c3 {
		grid-area: 4 / 2 / 5 / 3;
	}

	input[type='datetime-local'] {
		height: calc(100% - 2px);
		border: 1px solid #dadde1;
		border-radius: 4px;
		padding: 0 2px;
		font-size: 1.3rem;
		color: #0584fe;
	}

	.sel {
		position: relative;
		overflow: hidden;

		height: 32px;
		font-size: 1.3rem;
		border-radius: 4px;
		border: 1px solid #212830;
		background-color: #14181d;
	}

	.sel > select {
		width: 100%;
		height: calc(100% - 1px);
		padding: 0 9px;
		border: none;
		margin: 0;
		color: #fff;
		background-color: #14181d;
		font-size: 1.3rem;
	}

	/* Handsontable */
	/* overflow시 스크롤 */
	/* 창모드 */
	#main.win :global(.tableWrapper > .ht_master > .wtHolder) {
		overflow-x: hidden;
		overflow-y: auto;
	}

	/* 싱글, 듀얼모드 */
	#main.modal :global(.tableWrapper > .ht_master > .wtHolder) {
		overflow: auto;
	}

	#main :global(.handsontable tr th) {
		color: #666;
		background: #181d23;
	}

	#main :global(.handsontable tr td) {
		color: #999999;
		background: #212830;
	}

	.EntireDiv .search > div:nth-child(2),
	.EntireDiv .search > div:nth-child(3) {
		border: 1px solid #212830;
		background-color: #212830;
	}

	.EntireDiv .search > div:nth-child(2) :global(input),
	.EntireDiv .search > div:nth-child(3) :global(input) {
		color: #fff;
		border: 1px solid #212830;
		background-color: #212830;
	}

	.EntireDiv .c1 .chart1,
	.EntireDiv .c2 .chart2,
	.EntireDiv .c3 .chart3 {
		color: #a7a8aa;
		font-size: 1.7rem;
		font-weight: bold;
	}
</style>
