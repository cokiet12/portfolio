<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Table from '$lib/nested/table.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import { summaryOpen } from '$lib/user_info.mjs';

	// 지도
	import { settings } from '$lib/store.mjs';
	import MapSetup from '/src/lib//js/GIS/MapSetup.cjs';

	$: toggleEvent($summaryOpen);
	$: searchEvent($summaryOpen, stats);

	const consts = {
		option: [
			{ id: 0, text: '검지기' },
			{ id: 1, text: '카메라' },
			{ id: 2, text: '압버튼' }
		],
		map: null
	};
	let stats = {
		lcno: 1,
		sano: 1,
		year: 2010
	};

	let elems = {
		table1: null,
		table2: null,
		table3: null
	};
	// Selected
	let selected = 0;

	// Table
	let table1;
	let table2;
	let table3;

	// Datas
	let data1 = [];
	let data2 = [];
	let data3 = [];

	// Cells
	let optionC = function (row, col, prop) {
		let cellProperties = {};
		cellProperties.readOnly = true;
		return cellProperties;
	};

	// Option
	let option1 = {
		colWidths: [30, 80, 30, 30, 30],
		rowHeights: 23,
		renderer: 'html',
		cells: optionC,
		renderAllRows: true
	};
	let option2 = {
		colWidths: 70,
		rowHeights: 23,
		renderer: 'html',
		cells: optionC,
		renderAllRows: true
	};
	let option3 = {
		colWidths: 70,
		rowHeights: 23,
		renderer: 'html',
		cells: optionC,
		renderAllRows: true
	};

	// Map
	let setup;
	let ol;
	let neoMap;

	function searchEvent(so, stat) {
		if (so && table1 && table2 && table3) {
			searchData();
		}

		if (consts.map) {
			consts.map.setTarget(null);
			makeMap();
		}
	}

	function toggleEvent(so) {
		if (so && table1 && table2 && table3) {
			setTimeout(() => {
				refreshTable();
			}, 500);
		}

		if (consts.map) {
			setTimeout(() => {
				consts.map.setTarget(null);
				makeMap();
			}, 500);
		}
	}

	// Make Map
	function makeMap() {
		let _settings = settings;
		const node = document.lcCon.lcnodes[stats.lcno];
		// 좌표
		// let latlng = [Number(node.node_lat), Number(node.node_lng)] //36, 126
		let latlng = [Number(node.node_lng), Number(node.node_lat)]; //126, 36

		const mapset = new MapSetup({
			GIS: {
				GISurl: _settings.GIS.GISurl,
				GIScenter: latlng,
				defZoom: 18,
				minZoom: 7,
				maxZoom: 18,
				GISextent: [125.8985671, 34.0471297, 130.0075154, 38.0952572],
				// GISextent:[34.0471297, 125.8985671, 38.0952572, 130.0075154],
				switchXY: false
			}
		});
		mapset.dragPan = false;
		mapset.mouseWheelZoom = false;

		setup = new neoMap(mapset);
		if (!ol) ol = setup.getOL();
		let mapData = setup.Map('facMap');
		consts.map = mapData;

		// 교차로 마커 생성
		const markerEl = document.createElement('div');
		markerEl.classList.add('lcMarker');
		const marker = setup.Marker(latlng, consts.map, markerEl, false);
		consts.map.marker = marker;
	}

	// 데이터 생성
	function makeData(res, sort) {
		let _data;
		if (sort == 'info') {
			_data = [
				['번호', '교차로명', '유형', '연식', '등기구'],
				['', '', '', '', '']
			];
		} else if (sort == 'network') {
			_data = [
				['통신방식', 'IP', 'PORT'],
				['', '', '']
			];
		} else {
			_data = [
				['항목', 'MCU 보드', 'SCU 보드'],
				['제조사', '', ''],
				['버전', '', ''],
				['빌드날짜', '', ''],
				['등기구', '', ''],
				['연락처', '', '']
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
				let _res = res;
				if (sort == 'info') {
					_data[1][0] = _res.lcno;
					_data[1][1] = _res.lcname;
					_data[1][2] = _res.imporflag;
					_data[1][3] = _res.lctype;
					_data[1][4] = _res.lamptype;
				} else if (sort == 'network') {
					_data[1][0] = _res.commtype;
					_data[1][1] = _res.ip;
					_data[1][2] = _res.port;
				} else {
					_res.forEach((v, i) => {
						_data[1][v.b_ring] = v.manufacturer;
						_data[2][v.b_ring] = v.version;
						_data[3][v.b_ring] = v.bdate;
						_data[4][v.b_ring] = v.stype;
						_data[5][v.b_ring] = v.tel;
					});
				}
			}
		}

		return _data;
	}

	// 조회
	function searchData() {
		let lcData = document.lcCon.LCs[stats.lcno];

		table1.loadData(makeData(lcData, 'info'));

		table2.loadData(makeData(lcData, 'network'));

		ajax(`/getDBSystem?lcno=${stats.lcno}`).then((res) => {
			table3.loadData(makeData(res, 'hardware'));
		});
	}

	function refreshTable() {
		table1.refreshDimensions();
		table2.refreshDimensions();
		table3.refreshDimensions();
	}

	onMount(() => {
		// 파노라마 지도 생성
		// pannellum.viewer('panoramic', {
		//     "type": "equirectangular",
		//     "panorama": "/images/test.png",
		//     "autoLoad": true
		// });

		// 이미지 없음

		// 맵생성
		import('$lib/js/GIS/NeoMap.cjs').then((res) => {
			// 맵로드
			neoMap = res.default;
			setTimeout(() => {
				makeMap();
			}, 150);
		});

		if ($summaryOpen) {
			searchData();
			setTimeout(() => {
				refreshTable();
			}, 500);
		}
	});
</script>

<div class="summary">
	<div>
		<Searcher
			width="200px"
			onChoose={(no) => {
				stats = no;
			}}
		/>
	</div>
	<div id="panoramic">이미지없음</div>
	<div class="lcinfo">
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
		<div>
			<Table
				bind:wrapper={elems.table2}
				bind:table={table2}
				data={data2}
				width={'100%'}
				height={'auto'}
				option={option2}
			/>
		</div>
		<div>
			<Table
				bind:wrapper={elems.table3}
				bind:table={table3}
				data={data3}
				width={'100%'}
				height={'auto'}
				option={option3}
			/>
		</div>
	</div>
	<div class="facility">
		<div class="dropdown">
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
		<div id="facMap" style="border: 1px solid #EDEEF0;" />
	</div>
</div>

<style>
	.summary {
		padding: 5px;
		display: grid;
		grid-template-rows: auto 200px 1fr auto;
		grid-row-gap: 10px;
	}

	.summary #panoramic {
		height: 200px;
		border: 1px solid #dadde1;
		border-radius: 4px;
		text-align: center;
		line-height: 200px;
		font-size: 2rem;
	}

	.summary .lcinfo :global(.handsontable tr:nth-child(1) td) {
		color: #999999;
		background: #f4f7f9;
	}

	.summary .facility {
		background-color: #f4f7f9;
		padding: 10px;
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
	}

	.summary .facility div:nth-child(1) {
		width: 100px;
	}

	.summary .facility div:nth-child(2) {
		width: 100%;
		height: 300px;
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

	.summary :global(.lcMarker) {
		background: #444444;
		border-radius: 100%;
		width: 10px;
		height: 10px;
	}
</style>
