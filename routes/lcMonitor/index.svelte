<svelte:options accessors />

<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	// 지도
	import { settings } from '$lib/store.mjs';
	import MapSetup from '/src/lib//js/GIS/MapSetup.cjs';

	// 창모드 / 싱글, 듀얼모드
	export let winMode = false;

	// params
	export let params;

	const consts = {
		map: null,
		connErr: false,
		curPlan: null
	};
	let stats = {
		lcno: 1,
		sano: 1,
		year: 2010
	};

	$: searchEvent(stats);

	let elems = {
		table1: null, // LC 현시정보
		table2: null, // LC 기본정보
		table3: null, // LC 실시간정보
		table4: null, // LC 상세정보
		md: null
	};
	// Table
	let table1;
	let table2;
	let table3;
	let table4;

	// Datas
	let data1 = [];
	let data2 = [];
	let data3 = [];
	let data4 = [];

	// Cells
	let optionC = function (row, col, prop) {
		let cellProperties = {};
		cellProperties.readOnly = true;
		return cellProperties;
	};

	// Option
	let option1 = {
		colWidths: [45, 40, 40, 40, 40, 40, 40, 40, 40, 40],
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
		colWidths: 90,
		rowHeights: 23,
		renderer: 'html',
		cells: optionC,
		renderAllRows: true
	};
	let option4 = {
		colWidths: 90,
		rowHeights: 23,
		renderer: 'html',
		cells: optionC,
		renderAllRows: true
	};

	// Map
	let setup;
	let ol;
	let neoMap;

	// Search Event
	function searchEvent(stat) {
		stats = params ? params : stat;
		if (table1 && table2 && table3 && table4) {
			if (elems.md) {
				searchData('search');
				searchData('sse');
				elems.md.removeEventListener('monitorData' + elems.md.lcno, monitorData);
				elems.md.removeEventListener('pastPhase' + elems.md.lcno, pastPhase);

				consts.connErr = document.lcCon.liveLCs[stats.lcno].connErr;
				elems.md.addEventListener('monitorData' + stats.lcno, monitorData);
				elems.md.addEventListener('pastPhase' + stats.lcno, pastPhase);
			}
		}

		if (consts.map) {
			consts.map.setTarget(null);
			makeMap();
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
		let mapData = setup.Map('monitorMap' + stats.lcno);
		consts.map = mapData;

		// 교차로 마커 생성
		const markerEl = document.createElement('div');
		markerEl.classList.add('lcMarker');
		const marker = setup.Marker(latlng, consts.map, markerEl, false);
		consts.map.marker = marker;
	}

	// 이미지 생성
	function makeImg(num) {
		let result;

		if (num >= 1 && num <= 8) {
			result = `<img class="flowImg" src="images/flows/lcFlow${num}.png" onerror="this.style.display='none';"/>`;
		} else if (num >= 9 && num <= 16) {
			result = `<img class="flowImg" style="transform: rotate(-45deg);" src="images/flows/lcFlow${num}.png" onerror="this.style.display='none';"/>`;
		} else if (num == 17) {
			result = `<img class="flowImg" src="images/flows/lcFlow${num}.png" onerror="this.style.display='none';"/>`;
		} else {
			result = '무신호';
		}

		return result;
	}

	// 데이터 생성
	function makeData(res, sort) {
		let _data;
		if (sort == 'phase') {
			_data = [
				['구분', '링', '1', '2', '3', '4', '5', '6', '7', '8'],
				['이동류', 'A', '', '', '', '', '', '', '', ''],
				['', 'B', '', '', '', '', '', '', '', ''],
				['이전', 'A', '', '', '', '', '', '', '', ''],
				['', 'B', '', '', '', '', '', '', '', ''],
				['센터', 'A', '', '', '', '', '', '', '', ''],
				['', 'B', '', '', '', '', '', '', '', ''],
				['보행', 'A', '', '', '', '', '', '', '', ''],
				['', 'B', '', '', '', '', '', '', '', ''],
				['검지기', 'A', '', '', '', '', '', '', '', ''],
				['', 'B', '', '', '', '', '', '', '', ''],
				['압버튼', 'A', '', '', '', '', '', '', '', ''],
				['', 'B', '', '', '', '', '', '', '', '']
			];
		} else if (sort == 'base') {
			_data = [
				['제어기', '운영상태', '운영모드', '운영시각'],
				['', '', '', '']
			];
		} else if (sort == 'real') {
			_data = [
				['LC 실시간', '', '', ''],
				['시차제/일반제', '', '링운영방식', ''],
				['전이회수', '', '주기카운트', ''],
				['링별현시(A/B)', '', '링별스텝(A/B)', ''],
				['유지현시', '', '생략현시', ''],
				['전주기', '', '현주기', ''],
				['옵셋', '', 'DB상태', ''],
				['수동 ON/OFF', '', '모순 ON/OFF', ''],
				['함체개폐여부', '', '전원상태', '']
			];
		} else {
			_data = [
				['LC 상세정보', '', '', ''],
				['그룹번호', '', 'MCU/SCU 통신', ''],
				['점멸여부', '', '점멸동작원인', ''],
				['PP.수동진행', '', 'PP.수동', ''],
				['PP.점멸', '', 'PP.소등', ''],
				['소등여부', '', '모순상태', ''],
				['모순발생회로', '', '모순발생SSR', ''],
				['제어방법', '', '허용권상태', ''],
				['주현시조기종결', '', '부현시조기종결', '']
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
				if (sort == 'phase') {
					let phase = _res[0].phase;
					let center = _res[0].center;

					phase.forEach((v, i) => {
						if (v.ring == 1) {
							_data[1][v.phaseno + 1] = makeImg(v.flownumber);
						} else {
							_data[2][v.phaseno + 1] = makeImg(v.flownumber);
						}
					});

					for (let i = 1; i < 9; i++) {
						_data[5][i + 1] = center['asplit' + i] ? center['asplit' + i] : '';
						_data[6][i + 1] = center['bsplit' + i] ? center['bsplit' + i] : '';
					}
				} else if (sort == 'base') {
					_data[1][0] = stats.year + '년식';

					switch (res.op_mode) {
						case 0:
							_data[1][1] = '로컬모드';
							_data[1][2] = 'SCU 고정주기';
							break;
						case 1:
							_data[1][1] = '로컬모드';
							_data[1][2] = '오프라인';
							break;
						case 2:
							_data[1][1] = '로컬모드';
							_data[1][2] = '감응 오프라인';
							break;
						case 4:
							_data[1][1] = '센터모드';
							_data[1][2] = '감응 온라인';
							break;
						case 5:
							_data[1][1] = '센터모드';
							_data[1][2] = '온라인';
							break;
					}

					let date = new Date(res.time);
					let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
					let min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
					let sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
					_data[1][3] = hour + ':' + min + ':' + sec;
				} else if (sort == 'real') {
					_data[1][1] = res.cur_map_no ? '일반제' : '시차제';
					_data[1][3] = res.ring_manage ? '듀얼' : '싱글';
					_data[2][1] = document.lcCon.LCs[stats.lcno].transcycle;
					_data[2][3] = res.period_counter;
					_data[3][1] = res.ring_a_phase + 1 + '/' + (res.ring_b_phase + 1);
					_data[3][3] = res.ring_a_step + 1 + '/' + (res.ring_b_step + 1);
					_data[4][1] = res.fixed_phase_no ? res.fixed_phase_no : '-';
					_data[4][3] = res.omit_traffic_no ? res.omit_traffic_no : '-';
					_data[5][1] = res.prev_period;
					_data[5][3] = res.cur_period;
					_data[6][1] = res.offset_value;
					_data[6][3] = res.db_state ? 'DB에러' : '정상';
					_data[7][1] = res.manual_enable ? 'ENABLE' : 'DISABLE';
					_data[7][3] = res.conflict_enable ? 'ENABLE' : 'DISABLE';
					_data[8][1] = res.door_state ? '열림' : '닫힘';
					_data[8][3] = res.power_fail ? '전원불량' : '정상';
				} else {
					const flashReason = [
						'알수없음',
						'초기화동작',
						'명령점멸',
						'수동점멸',
						'모순점멸',
						'DB에러',
						'소등(진입/해제)',
						'장치이상'
					];
					const conflictCircuit = [
						['R1', 'Y1', 'G1', 'G2', 'Y', 'G2', 'BusError'],
						['PR', 'PG', 'R', 'Y', 'A', 'G', 'BusError']
					];

					_data[1][1] = stats.sano;
					_data[1][3] = res.com_mscu ? '실패' : '정상';
					_data[2][1] = res.flash_state ? '점멸' : '정상';
					_data[2][3] = res.flash_state ? flashReason[res.flash_reason] : '-';
					_data[3][1] = res.pp_psving ? 'ON' : 'OFF';
					_data[3][3] = res.pp_psv ? 'ON' : 'OFF';
					_data[4][1] = res.pp_flash ? 'ON' : 'OFF';
					_data[4][3] = res.pp_lightout ? 'ON' : 'OFF';
					_data[5][1] = res.lightout_state ? '소등' : '정상';
					_data[5][3] = res.conflict_enable ? (res.conflict_state ? '모순' : '정상') : '-';
					_data[6][1] = res.conflict_enable
						? conflictCircuit[res.equalizer_type][res.conflict_circuit]
						: '-';
					_data[6][3] = res.conflict_enable ? res.conflict_lsu + 1 : '-';
					_data[7][1] = res.MG_stat ? 'MG유지' : 'MG무시';
					_data[7][3] = res.permit_stat ? '제어중' : '없음';
					_data[8][1] = res.mainphase_end ? '발생' : '미발생';
					_data[8][3] = res.subphase_end ? '발생' : '미발생';
				}
			}
		}

		return _data;
	}

	// 옵션 생성
	function makeOption(sort) {
		let optionM;
		if (sort == 'phase') {
			optionM = [
				{ row: 1, col: 0, rowspan: 2, colspan: 1 },
				{ row: 3, col: 0, rowspan: 2, colspan: 1 },
				{ row: 5, col: 0, rowspan: 2, colspan: 1 },
				{ row: 7, col: 0, rowspan: 2, colspan: 1 },
				{ row: 9, col: 0, rowspan: 2, colspan: 1 },
				{ row: 11, col: 0, rowspan: 2, colspan: 1 }
			];
		} else if (sort == 'base') {
			optionM = [{ row: 0, col: 0, rowspan: 1, colspan: 8 }];
		} else if (sort == 'real') {
			optionM = [{ row: 0, col: 0, rowspan: 1, colspan: 4 }];
		} else {
			optionM = [{ row: 0, col: 0, rowspan: 1, colspan: 4 }];
		}
		return { mergeCells: optionM };
	}

	// 조회
	function searchData(sort) {
		ajax(`/ntcs_m_phase/GetBy?lcno=${stats.lcno}&planClss=0`).then((res1) => {
			ajax('/getCurTOD', 'POST', { lcno: stats.lcno, sano: stats.sano }).then((res2) => {
				consts.curPlan = res2;
				if (sort == 'search') {
					table1.loadData(makeData([{ phase: res1, center: res2 }], 'phase'));
					table1.updateSettings(makeOption('phase'));
				} else {
					table1.loadData(makeData([{ phase: res1, center: res2 }], 'phase'));
				}

				// 이전 현시
				let prePhase = document.lcCon.prePhase[stats.lcno];

				if (prePhase) {
					for (let i = 0; i < 8; i++) {
						let a = prePhase[`ASPLIT${i + 1}`] ? prePhase[`ASPLIT${i + 1}`] : '';
						let b = prePhase[`BSPLIT${i + 1}`] ? prePhase[`BSPLIT${i + 1}`] : '';
						table1.setDataAtCell(3, i + 2, a);
						table1.setDataAtCell(4, i + 2, b);
					}
				}
			});
		});

		table2.loadData(makeData(null, 'base'));
		table2.updateSettings(makeOption('base'));
		table3.loadData(makeData(null, 'real'));
		table3.updateSettings(makeOption('real'));
		table4.loadData(makeData(null, 'detail'));
		table4.updateSettings(makeOption('detail'));
	}

	// 화면표출
	let monitorData = (e) => {
		if (e) {
			// 현시카운터
			let cntClass = elems.md.querySelector('.phaseCnt');
			let cntDiv = elems.md.querySelector('.phaseCnt > div');
			let cntSpan = elems.md.querySelector('.phaseCnt > span');
			let _lcInfo = e.data;

			// LCMODE에 따른 카운터 표출여부 (SCU고정주기, 무감응 표출) / (감응 미표출)
			if (_lcInfo.op_mode == 0 || _lcInfo.op_mode == 1 || _lcInfo.op_mode.op_mode == 5) {
				cntClass.style.display = 'block';
			} else {
				cntClass.style.display = 'none';
			}

			let curring = [_lcInfo.ring_a_phase, _lcInfo.ring_b_phase];
			let cycle = [table1.getSourceData(3, 2, 6, 9)[2], table1.getSourceData(3, 2, 6, 9)[3]];
			let close = [new Number(), new Number()];
			for (let i = 0; i <= curring[0]; i++) {
				close[0] += cycle[0][i];
			}
			for (let i = 0; i <= curring[1]; i++) {
				close[1] += cycle[1][i];
			}
			let min = Math.min(close[0], close[1]);

			let phase;
			if (min == close[0]) {
				//가까운 다음현시가 A인경우
				phase = cycle[0][curring[0]];
			} else if (min == close[1]) {
				phase = cycle[1][curring[1]];
			}
			let cnt = min - _lcInfo.period_counter >= 0 ? min - _lcInfo.period_counter : 0;

			cntDiv.style.width = cnt / phase < 1 ? (cnt / phase) * 100 - 1 + '%' : 99 + '%';
			cntSpan.textContent = consts.curPlan ? (cnt / phase < 1 ? cnt : phase) : 'x';

			table2.loadData(makeData(e.data, 'base'));
			table3.loadData(makeData(e.data, 'real'));
			table4.loadData(makeData(e.data, 'detail'));
		}
	};

	// 이전 현시표출
	let pastPhase = (e) => {
		for (let i = 0; i < 8; i++) {
			let a = e.data[`ASPLIT${i + 1}`] ? e.data[`ASPLIT${i + 1}`] : '';
			let b = e.data[`BSPLIT${i + 1}`] ? e.data[`BSPLIT${i + 1}`] : '';
			table1.setDataAtCell(3, i + 2, a);
			table1.setDataAtCell(4, i + 2, b);
		}
	};

	// 초기 조회
	onMount(() => {
		stats = params ? params : stats;

		// 센터
		searchData('search');

		elems.md.lcno = stats.lcno;
		consts.connErr = document.lcCon.liveLCs[stats.lcno].connErr;
		elems.md.addEventListener('monitorData' + stats.lcno, monitorData);
		elems.md.addEventListener('pastPhase' + stats.lcno, pastPhase);

		// 맵생성
		import('$lib/js/GIS/NeoMap.cjs').then((res) => {
			// 맵로드
			neoMap = res.default;
			setTimeout(() => {
				makeMap();
			}, 150);
		});
	});
</script>

<div
	bind:this={elems.md}
	id="main"
	class={'lcmd' + stats.lcno}
	class:modal={winMode == false}
	class:win={winMode == true}
>
	<div class="EntireDiv">
		<div class:connErr={consts.connErr} class:connNormal={!consts.connErr}>통신이상</div>
		<div class="content">
			<div class="row1">
				<div>
					<Searcher
						bind:value={stats.lcno}
						width="200px"
						onChoose={(no) => {
							stats = no;
						}}
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
			</div>
			<div class="row2">
				<div id={'monitorMap' + stats.lcno} style="border: 1px solid #EDEEF0;">
					<div class="phaseCnt" class:counterErr={consts.connErr}>
						<div />
						<span />
					</div>
				</div>
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
			</div>
			<div class="row3">
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
				<div>
					<Table
						bind:wrapper={elems.table4}
						bind:table={table4}
						data={data4}
						width={'100%'}
						height={'auto'}
						option={option4}
					/>
				</div>
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
		/* 높이(가변) */
		max-height: 720px;
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 772px;
	}

	/* 싱글모드 (창모드 넓이 ~ MAX) */
	#main.modal {
		overflow: auto;
	}

	/* 카드 */
	.EntireDiv {
		height: calc(100% - 32px);
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #dbe2e6;
		border-radius: 6px;
		background-color: #fff;
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
		padding: 10px;
	}

	/* 통신이상 */
	.connErr {
		height: 40px;
		background-color: #f3525299;
		color: #fff;
		font-size: 1.7rem;
		text-align: center;
		line-height: 40px;
		position: absolute;
		z-index: 1;
		top: 48%;
		left: 0;
		width: 100%;
	}

	.connNormal {
		display: none;
	}

	.counterErr {
		display: none;
	}

	/* Handsontable */
	/* Headers */
	#main :global(.handsontable tr:first-child td),

            /* Row2 */
            #main .row2 :global(.handsontable tr td:nth-child(1)) {
		color: #999999;
		background: #f4f7f9;
	}

	/* Row3 */
	#main .row3 :global(.handsontable tr:not(:first-child) td:nth-child(1)),
	#main .row3 :global(.handsontable tr:not(:first-child) td:nth-child(3)) {
		color: #999999;
		background: #f4f7f9;
		text-align: right;
	}

	/* Td 줄바꿈 방지 */
	#main .content :global(.handsontable td) {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

	/* ROW */
	#main .content {
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
	}

	#main .row1 {
		display: grid;
		grid-template-columns: 1fr 1.4fr;
		grid-column-gap: 10px;
		align-items: center;
	}

	#main .row2 {
		display: grid;
		grid-template-columns: 1fr 1.4fr;
		grid-column-gap: 10px;
	}

	#main .row3 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-column-gap: 10px;
	}

	/* Image */
	#main :global(.flowImg) {
		width: 17px;
		line-height: 17px;
	}

	#main :global(.lcMarker) {
		background: #444444;
		border-radius: 100%;
		width: 10px;
		height: 10px;
	}

	/* 현시 카운터 */
	#main .phaseCnt {
		position: absolute;
		left: 32%;
		top: 60%;
		width: 70px;
		height: 15px;
		border-radius: 5px;
		border: 2px solid #555;
		background: linear-gradient(#eee, #ddd, #eee);
		z-index: 1;
	}
	#main .phaseCnt > div {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 100%;
		width: 50%;
		border-radius: 5px;
		transition: width 1s ease-in;
		background: linear-gradient(#1b5, #5e7, #1b5);
	}
	#main .phaseCnt > span {
		position: absolute;
		width: 100%;
		left: 0;
		bottom: -3px;
		font-weight: bold;
		color: white;
		-webkit-text-stroke: 1px black;
		text-align: center;
		font-size: 2.1rem;
	}
</style>
