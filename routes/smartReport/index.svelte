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
	import ExcelJS from 'exceljs';
	import { saveAs } from 'file-saver';

	// 창모드 / 싱글, 듀얼모드
	export let winMode = false;

	const consts = {
		option: [
			{ id: 1, text: '시간별' },
			{ id: 2, text: '요일별' },
			{ id: 3, text: '월별' }
		],
		date1: null,
		date2: null
	};

	export let stats = {
		lcno: 241,
		sano: 1,
		year: 2010
	};

	$: searchEvent(stats);
	$: loadTables(selected);

	let elems = {
		table1: null,
		table2: null,
		table3: null
	};
	// Table
	let table1;
	let table2;
	let table3;

	// Selected
	let selected = 1;

	// Datas
	let data1 = [];
	let data2 = [];
	let data3 = [];

	// Len
	let len = 5;

	// Cells
	let optionC = function (row, col, prop) {
		let cellProperties = {};
		cellProperties.readOnly = true;
		return cellProperties;
	};

	// Option
	let option1 = {
		colWidths: 30,
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		cells: optionC
	};
	let option2 = {
		colWidths: 30,
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		cells: optionC
	};
	let option3 = {
		colWidths: 30,
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		cells: optionC
	};

	// 시간 초기화
	let today = new Date();
	let year = today.getFullYear();
	let month1 = ('0' + (today.getMonth())).slice(-2);
	let month2 = ('0' + (today.getMonth()+1)).slice(-2);
	let day = ('0' + today.getDate()).slice(-2);

	let firstInput = year + "-" + month2 + "-" + day
	let secondInput = year + "-" + month1 + "-" + day
	elems.date1 = secondInput;
	elems.date2 = firstInput;

	// Search Event
	function searchEvent(stat) {
		setTimeout(()=>{
			if (table1 && table2 && table3) {
				initData();
			}
		})
	}

	// select
	function loadTables(select) {
		setTimeout(()=>{
			if (table1 && table2 && table3) {
				initData()
			}
		})
	}

	// 데이터 생성
	function makeData(res, sort) {
		let header;
		let body1;
		let body2;

		let _data = [];

		if(selected == 1){
			header = ['내용', 
				'00-02', '02-04', '04-06', '06-08', 
				'08-10', '10-12', '12-14', '14-16', 
				'16-18', '18-20', '20-22', '22-24']

			body1 = ['', '', '', '', '', '', '', '', '', '', '', '', ''];
			body2 = ['', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
			
			// Default
			_data.push(header)
			for(let i=0; i<len; i++){
				_data.push(body1)
			}
		} else if(selected == 2){
			header = ['내용', '일', 
				'월', '화', 
				'수', '목', 
				'금', '토']
			
			body1 = ['', '', '', '', '', '', '', ''];
			body2 = ['', 0, 0, 0, 0, 0, 0, 0];

			// Default
			_data.push(header)
			for(let i=0; i<len; i++){
				_data.push(body1)
			}
		} else {
			header = ['내용', 
				'1월', '2월', '3월', '4월', 
				'5월', '6월', '7월', '8월', 
				'9월', '10월', '11월', '12월']
			
			
			body1 = ['', '', '', '', '', '', '', '', '', '', '', '', ''];
			body2 = ['', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
			
			// Default
			_data.push(header)
			for(let i=0; i<len; i++){
				_data.push(body1)
			}
		}

		if(res){
			let length;

			if (typeof res == 'object') {
				length = Object.keys(res).length;
			} else {
				length = res.length;
			}

			if(length){
				console.log(res)
				if(sort == 'fac'){	
					_data = []
					_data.push(JSON.parse(JSON.stringify(header)))

					let arr = JSON.parse(JSON.stringify(body2))
					arr[0] = '카메라 에러'

					if(res.fac.length){
						res.fac.forEach((v, i) =>{
							if(selected == 1){
								let sum = Number(v.sum);
								let time = Number(v.hh) ? Number(v.hh) : 1;

								arr[Math.round(time/2)] += sum
							} else if(selected == 2){
								let sum = Number(v.sum);
								let time = Number(v.hh);

								arr[time] += sum
							} else {
								let sum = Number(v.sum);
								let time = Number(v.hh);

								arr[time] += sum
							}
						})
					} 		
					_data.push(arr);	
					
					// 나머지 ROW 채우기
					for(let i=0; i<4; i++){
						_data.push(body1)
					}
				} else if(sort == 'trans'){
					_data = []
					_data.push(header)

					Object.keys(res.trans).forEach((v1, i1) => {
						let arr = JSON.parse(JSON.stringify(body2))
						arr[0] = v1

						res.trans[v1].forEach((v2, i2) => {
							if(selected == 1){
								let sum = Number(v2.sum);
								let time = Number(v2.hh) ? Number(v2.hh) : 1;

								arr[Math.round(time/2)] += sum
							} else if(selected == 2){
								let sum = Number(v2.sum);
								let time = Number(v2.hh);

								arr[time] += sum
							} else {
								let sum = Number(v2.sum);
								let time = Number(v2.hh);

								arr[time] += sum
							}
						})

						_data.push(arr);
					})

					// 나머지 ROW 채우기
					if(Object.keys(res.trans).length < len){
						for(let i=0; i<len-(Object.keys(res.trans).length); i++){
							_data.push(body1)
						}
					}
				} else {
					_data = []
					_data.push(header)

					Object.keys(res.his).forEach((v1, i1) => {
						let arr = JSON.parse(JSON.stringify(body2))

						arr[0] = v1

						res.his[v1].forEach((v2, i2) => {
							if(selected == 1){
								let sum = Number(v2.sum);
								let time = Number(v2.hh) ? Number(v2.hh) : 1;

								arr[Math.round(time/2)] += sum
							} else if(selected == 2){
								let sum = Number(v2.sum);
								let time = Number(v2.hh);

								arr[time] += sum
							} else {
								let sum = Number(v2.sum);
								let time = Number(v2.hh);

								arr[time] += sum
							}
						})

						_data.push(arr);
					})

					// 나머지 ROW 채우기
					if(Object.keys(res.his).length < len){
						for(let i=0; i<len-(Object.keys(res.his).length); i++){
							_data.push(body1)
						}
					}
				}
			}
		} 

		return _data;
	}

	// 옵션 생성
	function makeOption(){
		let colWidths;

		if(selected == 1){
			colWidths = [80,
			30,30,30,30,
			30,30,30,30,
			30,30,30,30
		]
		} else if(selected == 2){
			colWidths = [80,
			30,30,30,30,
			30,30,30]
		} else if(selected == 3){
			colWidths = [80,
			30,30,30,30,30,30,
			30,30,30,30,30,30]
		} 

		return {colWidths: colWidths}
	}

	// 조회
	function searchData(e){
		let cnt = 1
		let isSuccess = new Array(cnt).fill(0);
		let isData = new Array(cnt).fill(0);

		const starttime = elems.date1;
		const endtime = elems.date2;

		ajax(`/report?starttime=${starttime}&endtime=${endtime}&lcno=${stats.lcno}&type=${selected}`).then((res)=>{
			if(res.hasOwnProperty('success')){
				initData();
			} else {
				table1.loadData(makeData(res, 'fac'));
				table1.updateSettings(makeOption());
				table2.loadData(makeData(res, 'trans'));
				table2.updateSettings(makeOption());
				table3.loadData(makeData(res, 'his'));
				table3.updateSettings(makeOption());
				if(!(_.isEmpty(res))){
					isData[0] = 1;
				}
				isSuccess[0] = 1;
			}
			if(e){
				if(!isSuccess[0] || !isData[0]){
					document.isSuccess(res);
				} else {
					document.isSuccess(stats);
				}
			}
		})
	}

	async function ExcelSave() {
		const workbook = new ExcelJS.Workbook();
		const flows = [
			'',
			'동->남',
			'서->동',
			'남->서',
			'북->남',
			'서->북',
			'동->서',
			'북->동',
			'남->북',
			'동->남',
			'서->동',
			'남->서',
			'북->남',
			'서->북',
			'동->서',
			'북->동',
			'남->북',
			'보행',
			''
		];
		const nms = ['시설물 장애', '통신 장애', '운영 이력'];

		function putData(tab, no) {
			let sheet = workbook.addWorksheet(nms[no]);
			let tabData = tab.getData();
			let header = tabData[0];

			tabData.shift();

			let body = tabData;
			let columns = new Array();
			header.forEach((v, i) => {
				columns.push({ header: v, key: v });
			});
			sheet.columns = columns;

			body.forEach((v, i) => {
				let row = new Object();
				header.forEach((b, o) => {
					let i = typeof v[o] == 'string' ? v[o].indexOf('lcFlow') : -1;
					if (i == -1) {
						row[b] = v[o];
					} else {
						row[b] = flows[v[o][i + 6]];
					}
				});
				sheet.addRow(row);
			});
		}

		putData(table1, 0);
		putData(table2, 1);
		putData(table3, 2);

		let xlsxdata = await workbook.xlsx.writeBuffer();
		const blob = new Blob([xlsxdata], { type: this.blobType });
		saveAs(blob, `교차로_${stats.lcno}_보고서.xlsx`);
	}

	// 초기화
	function initData() {
		table1.loadData(makeData(null));
		table1.updateSettings(makeOption());
		table2.loadData(makeData(null));
		table2.updateSettings(makeOption());
		table3.loadData(makeData(null));
		table3.updateSettings(makeOption());
	}

	// 초기 조회
	onMount(() => {
		initData();
	});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="tabOption">
			<div>
				<div>
					<Searcher
						bind:value = {stats.lcno}
						width="200px"
						onChoose={(no) => {
							stats = no;
						}}
					/>
				</div>
				<div>
					<input type="date" bind:value={elems.date1} />
				</div>
				<div>
					<input type="date" bind:value={elems.date2} />
				</div>
				<div>
					<div class="sel">
						<select bind:value={selected} on:change={loadTables} class="static">
							{#each consts.option as i}
								<option value={i.id}>
									{i.text}
								</option>
							{/each}
						</select>
					</div>
				</div>
				<div>
					<Button height={'30px'} icon="search" colored={true} on:click={searchData} width="80">조회</Button>
				</div>
			</div>
			<div>
				<div>
					<Button height={'30px'} icon="print" on:click={ExcelSave} width="80">출력</Button>
				</div>
			</div>
		</div>
		<div class="tabContent">
			<div>
				시설물 장애
				<Table
					bind:wrapper={elems.table1}
					bind:table={table1}
					data={data1}
					width={'100%'}
					height={'139px'}
					option={option1}
				/>
			</div>
			<div>
				통신 장애
				<Table
					bind:wrapper={elems.table2}
					bind:table={table2}
					data={data2}
					width={'100%'}
					height={'139px'}
					option={option2}
				/>
			</div>
			<div>
				운영 이력
				<Table
					bind:wrapper={elems.table3}
					bind:table={table3}
					data={data3}
					width={'100%'}
					height={'139px'}
					option={option3}
				/>
			</div>
		</div>
	</div>
</div>

<style>
	/* 메인 */
	#main {
		font-size: 1.3rem;
		background-color: #000000;
		padding: 11px;
		/* 높이(가변) */
		max-height: 720px;
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 1100px;
		height: 575px;
	}

	/* 싱글모드 (창모드 넓이 ~ MAX) */
	#main.modal {
		overflow: auto;
	}

	/* 카드 */
	.EntireDiv {
		height: calc(100% - 32px);
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: auto 1fr;
		grid-row-gap: 10px;
		grid-column-gap: 10px;
		box-shadow: 0px 0px 10px #0000000d;
		/* border: 1px solid #181d22; */
		border-radius: 6px;
		background-color: #212830dd;
		padding: 15px;
	}

	.EntireDiv .tabOption {
		display: grid;
		grid-template-columns: auto 80px;
		grid-column-gap: 10px;
	}

		.EntireDiv .tabOption div:nth-child(1) {
			display: grid;
			grid-template-columns: 200px max-content max-content 80px 80px;
			grid-column-gap: 10px;
		}

	.EntireDiv .tabContent {
		display: grid;
		grid-template-rows: min-content min-content min-content;
		grid-row-gap: 10px;
	}

	.EntireDiv .tabContent > div {
		margin-top: 5px;
	}

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

	/* TR TD */
	.EntireDiv .tabContent :global(.handsontable tr:nth-child(1) td) {
		color: #666;
		background: #181d23;
	}

	.EntireDiv :global(.handsontable tr td) {
		color: #999999;
		background: #212830;
	}

	.EntireDiv .tabOption > div:nth-child(1) > div:nth-child(2),
	.EntireDiv .tabOption > div:nth-child(1) > div:nth-child(3) {
		border: 1px solid #212830;
		background-color: #212830;
	}

	.EntireDiv .tabOption > div:nth-child(1) > div:nth-child(2) :global(input),
	.EntireDiv .tabOption > div:nth-child(1) > div:nth-child(3) :global(input) {
		color: #fff;
		border: 1px solid #212830;
		background-color: #212830;
	}

	input[type='date'] {
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

	/* scroll */
	#main :global(::-webkit-scrollbar) {
		width: 7px;
		height: 7px;
		background-color: rgba(0, 0, 0, 0.7);
	}
	#main :global(::-webkit-scrollbar-thumb) {
		background-color: rgba(126, 126, 126, 0.7);
		border-radius: 2px;
	}
</style>
