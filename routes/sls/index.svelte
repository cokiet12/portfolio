<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Table from '$lib/nested/table.svelte';
	import { ajax } from '/src/lib/js/functions.mjs';
	import Button from '$lib/nested/button.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import _ from 'lodash';

	// 창모드 / 싱글, 듀얼모드
	export let winMode = false;

	export let id;

	const consts = {
		date1 : null,
		date2 : null
	};

	let stats = {
		lcno: 241,
		sano: 1,
		year: 2010
	};

	$: searchEvent(stats);

	let elems = {
		table1: null
	};
	// Table
	let table1;

	// Datas
	let data1 = [];

	// Cells
	let optionC = function(row, col, prop) {
		let cellProperties = {};
		cellProperties.readOnly = true
		return cellProperties
	};

	// Option
	let option1 = {
		colWidths: [70,70,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		readOnly: true,
		fixedRowsTop: 2,
		cells: optionC
	};

	// 시간 초기화
	let today = new Date();
	let year = today.getFullYear();
	let month = ('0' + (today.getMonth()+1)).slice(-2);
	let day = ('0' + today.getDate()).slice(-2);
	let hours = ('0' + today.getHours()).slice(-2);
	let hours2 = ('0' + (today.getHours() - 5)).slice(-2);
	let minutes = ('0' + today.getMinutes()).slice(-2);

	let firstInput = year + "-" + month + "-" + day + "T" + hours + ":" + minutes;
	let secondInput = year + "-" + month + "-" + day + "T" + hours2 + ":" + minutes;
	consts.date1 = secondInput;
	consts.date2 = firstInput;

	function searchEvent(stat) {
		if (table1) {
			initData();
		}
	}

	// 데이터 생성
	function makeData(res){
		let _data;
		let len = 20;

		_data = [
			['교차로명', '수집일시', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
			['', '', 
			'포화도', '지체시간', 'LOS', 'GDI',
			'포화도', '지체시간', 'LOS', 'GDI',
			'포화도', '지체시간', 'LOS', 'GDI',
			'포화도', '지체시간', 'LOS', 'GDI']
		]

		for(let i=0; i<len; i++){
			_data.push(['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'])
		}

		if(res) {
			let length;

			if(typeof(res) == 'object'){
				length = Object.keys(res).length;
			} else {
				length = res.length;
			}

			if(length){
				_data = [
					['교차로명', '수집일시', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
					['', '', 
					'포화도', '지체시간', 'LOS', 'GDI',
					'포화도', '지체시간', 'LOS', 'GDI',
					'포화도', '지체시간', 'LOS', 'GDI',
					'포화도', '지체시간', 'LOS', 'GDI']
				]

				// 방향 탐색
				let dir = Object.keys(res.reduce(function(result, current) {
					result[current.dir] = result[current.dir] || [];
					result[current.dir].push(current);
					return result;
				}, {}));

				dir.forEach((v, i) => {
					let dirname = v == 10 ? '북' : v == 20 ? '동' : v == 30 ? '남' : v == 40 ? '서' : v == 50 ? '북동' : v == 60 ? '남동' : v == 70 ? '남서' : '북서'
					_data[0][i*4+2] = dirname
				})

				// CRE_DATE를 기준으로 GROUP BY
				let _res = res.reduce(function(result, current) {
					result[current.cre_date] = result[current.cre_date] || [];
					result[current.cre_date].push(current);
					return result;
				}, {});

				Object.keys(_res).forEach((v1, i1) => {
					let arr = [document.lcCon.LCs[stats.lcno].lcname, v1.replace('T', ' '), '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']
				
					dir.forEach((v2, i2) => {
						// di = 지체시간
						// los = 서비스
						// vs = 포화도
						let obj = _res[v1].find(value => value.dir == v2)
						
						let diValue = obj ? obj.di : 0
						let losValue = obj ? obj.los : '-'
						let vsValue = obj ? obj.vs : 0
						let gdiValue = obj ? obj.gdi : 0

						arr[(i2*4)+2] = vsValue;
						arr[(i2*4)+3] = diValue;
						arr[(i2*4)+4] = losValue;
						arr[(i2*4)+5] = gdiValue;
					})

					_data.push(arr);
				})

				// 나머지 ROW 채우기
				if(Object.keys(_res).length < len){
					for(let i=0; i<len-(Object.keys(_res).length); i++){
						_data.push(['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'])
					}
				}
			}
		}

		return _data
	}

	// 옵션 생성
	function makeOption(){
		let optionM;

		optionM = [
			{row: 0, col: 0, rowspan: 2, colspan: 1},
			{row: 0, col: 1, rowspan: 2, colspan: 1},
			{row: 0, col: 2, rowspan: 1, colspan: 4},
			{row: 0, col: 6, rowspan: 1, colspan: 4},
			{row: 0, col: 10, rowspan: 1, colspan: 4},
			{row: 0, col: 14, rowspan: 1, colspan: 4}
		]

		return {mergeCells: optionM}
	}

	// 조회
	function searchData(e){
		let cnt = 1
		let isSuccess = new Array(cnt).fill(0);
		let isData = new Array(cnt).fill(0);

		const starttime = consts.date1.replace('T', ' ');
		const endtime = consts.date2.replace('T', ' ');

		ajax(`/s_bsslos?starttime=${starttime}&endtime=${endtime}&lcno=${stats.lcno}`).then((res)=>{
			if(res.hasOwnProperty('success')){
				initData();
			} else {
				table1.loadData(makeData(res));
				table1.updateSettings(makeOption());
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

	// 초기화
	function initData(){
		table1.loadData(makeData(null));
		table1.updateSettings(makeOption());
	}

	// 범례
	function legendData(e) {
		document.createWindow('slsIndex', id, e, stats);
	}

	function exportExcel(table) {
		// 엑셀
		let exportPlugin = table.getPlugin('exportFile');
		const startYear = consts.date1.split('T')[0].replace(/-/gi, '');
		const endYear = consts.date2.split('T')[0].replace(/-/gi, '');
		const startHour = consts.date1.split('T')[1].split(':')[0];
		const endHour = consts.date2.split('T')[1].split(':')[0];
		const startMin = consts.date1.split('T')[1].split(':')[1];
		const endMin = consts.date2.split('T')[1].split(':')[1];
		exportPlugin.downloadFile('csv', {
			bom: true,
			columnDelimiter: ',',
			exportHiddenColumns: false,
			exportHiddenRows: true,
			fileExtension: 'csv',
			filename: `${stats.lcno}번_교차로_교통량데이터(${startYear}.${startHour}시${startMin}분_${endYear}.${endHour}시${endMin}분)`,
			mimeType: 'text/csv',
			rowDelimiter: '\r\n',
			rowHeaders: false
		});
	}

	onMount(() => {
		initData();
	});
</script>

<svelte:options accessors/>
<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="tabOption">
			<div>
				<div>
					<Searcher bind:value={stats.lcno} width="200px" onChoose={(no)=>{stats = no}}/>
				</div>
				<div>
					<input type='datetime-local' bind:value={consts.date1}/>
				</div>
				<div>
					~
				</div>
				<div>
					<input type='datetime-local' bind:value={consts.date2}/>
				</div>
				<div>
					<Button height={"30px"} icon='search' colored={true} on:click={searchData} width="80">조회</Button>
				</div>
			</div>
			<div>
				<div>
					<Button height={"30px"} icon='search' on:click={legendData} width="80">범례</Button>
				</div>
				<div>
					<Button height={"30px"} icon='print' on:click={exportExcel(table1)} width="100">엑셀출력</Button>
				</div>
			</div>
		</div>
		<div class="tabContent">
			<div>
				<Table 
					bind:wrapper={elems.table1}
					bind:table={table1}
					data={data1}
					width={'100%'}
					height={'480px'}
					option={option1}
				></Table>
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
			width: 1072px;
			height: 556px;
		}

		/* 싱글모드 (창모드 넓이 ~ MAX) */
		#main.modal {
			overflow: auto;
		}

	/* 카드 */
	.EntireDiv {
		height: calc(100% - 32px);
		display : grid;
		grid-template-columns: auto;
		grid-template-rows: auto 1fr;
		grid-row-gap: 10px;
		grid-column-gap: 10px;
		box-shadow: 0px 0px 10px #0000000D;
		/* border: 1px solid #181d22; */
		border-radius: 6px;
		background-color: #212830DD;
		padding: 15px;
	}

		.EntireDiv .tabOption {
			display : grid;
			grid-template-columns: auto 190px;
			grid-column-gap: 10px;
		}

			.EntireDiv .tabOption > div:nth-child(1){
				display : grid;
				grid-template-columns: 200px max-content 10px max-content 80px;
				grid-column-gap: 10px;
			}

			.EntireDiv .tabOption > div:nth-child(2){
				display : grid;
				grid-template-columns: 80px 100px;
				grid-column-gap: 10px;
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
			.EntireDiv .tabContent :global(.handsontable tr:nth-child(1) td),
			.EntireDiv .tabContent :global(.handsontable tr:nth-child(2) td) {
				color: #666;
				background: #181D23;
			}

			.EntireDiv :global(.handsontable tr td) {
				color: #999999;
				background: #212830;
			}

			.EntireDiv .tabOption > div:nth-child(1) > div:nth-child(2),
			.EntireDiv .tabOption > div:nth-child(1) > div:nth-child(4) {
				border: 1px solid #212830;
				background-color: #212830;
			}

			.EntireDiv .tabOption > div:nth-child(1) > div:nth-child(3) {
				font-size: 10px;
				line-height: 34px;
				text-align: center;
			}

				.EntireDiv .tabOption > div:nth-child(1) > div:nth-child(2) :global(input),
				.EntireDiv .tabOption > div:nth-child(1) > div:nth-child(4) :global(input) {
					color: #FFF;
					border: 1px solid #212830;
					background-color: #212830;
				}

	input[type="datetime-local"] {
		height: calc(100% - 2px);
		border: 1px solid #DADDE1;
		border-radius: 4px;
		padding: 0 2px;
		font-size: 1.3rem;
		color: #0584FE;
	}

	/* scroll */
	#main :global(::-webkit-scrollbar) {width: 7px;height: 7px; background-color: rgba(0, 0, 0, 0.7);}
	#main :global(::-webkit-scrollbar-thumb) {background-color:rgba(126, 126, 126, 0.7); border-radius: 2px;}
</style>
