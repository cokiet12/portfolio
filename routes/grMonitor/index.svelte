<svelte:options accessors />

<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	// 창모드 / 싱글, 듀얼모드
	export let winMode = false;

	// params
	export let params;

	const consts = {};
	let stats = {
		lcno: 1,
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

	// Option
	let option1 = {
		colWidths: [40, 150, 65, 100, 65, 40, 40, 40, 40, 40, 40, 40, 40, 50, 50, 40, 40, 40, 40],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		nestedHeaders: [
			[
				{ label: '번호', colspan: 1 },
				{ label: '이름', colspan: 1 },
				{ label: '운영시각', colspan: 1 },
				{ label: '운영모드', colspan: 1 },
				{ label: '제어상태', colspan: 1 },
				{ label: 'SCU', colspan: 1 },
				{ label: '전원', colspan: 1 },
				{ label: '소등', colspan: 1 },
				{ label: '점멸', colspan: 1 },
				{ label: '수동', colspan: 1 },
				{ label: '모순', colspan: 1 },
				{ label: '함체', colspan: 1 },
				{ label: '옵셋', colspan: 1 },
				{ label: '시차제', colspan: 1 },
				{ label: '링운영', colspan: 1 },
				{ label: '스텝', colspan: 1 },
				{ label: '현시', colspan: 1 },
				{ label: '생략', colspan: 1 },
				{ label: '유지', colspan: 1 }
			]
		]
	};

	// Search Event
	function searchEvent(stat) {
		stats = params ? params : stat;
		if (table1) {
			initData();

			setTimeout(function () {
				searchData();
			}, 500);
		}
	}

	// 데이터 생성
	function makeData(res) {
		let _data;

		_data = [['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']];

		if (res) {
			let length;
			if (typeof res == 'object') {
				length = Object.keys(res).length;
			} else {
				length = res.length;
			}

			if (length) {
				_data = [];
				let _res = res.filter((v) => v.sa_no == stats.sano);
				_res.forEach((v, i) => {
					_data.push([
						v.lcno,
						v.lcname,
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						'',
						''
					]);
				});
			} else {
				console.log('데이터가 없습니다.');
			}
		}

		return _data;
	}

	function searchData() {
		ajax('/ntcs_m_lc?take=0&skip=0').then((res) => {
			table1.loadData(makeData(res));
		});
	}

	function initData() {
		table1.loadData(makeData(null));
	}

	function monitorData() {
		let live = document.lcCon.liveLCs;
		let temp = table1.getSourceData();

		temp.forEach((v, i) => {
			let res = live[v[0]];
			if (!res.connErr) {
				// 운영시각
				let date = new Date(res.time);
				let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
				let min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
				let sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
				table1.setDataAtCell(i, 2, hour + ':' + min + ':' + sec);

				// 운영모드
				let mode;
				let crtl;
				switch (res.op_mode) {
					case 0:
						mode = '로컬모드';
						crtl = 'SCU 고정주기';
						break;
					case 1:
						mode = '로컬모드';
						crtl = '오프라인';
						break;
					case 2:
						mode = '로컬모드';
						crtl = '감응 오프라인';
						break;
					case 4:
						mode = '센터모드';
						crtl = '감응 온라인';
						break;
					case 5:
						mode = '센터모드';
						crtl = '온라인';
						break;
				}
				table1.setDataAtCell(i, 3, mode);
				table1.setDataAtCell(i, 4, crtl);
				table1.setDataAtCell(i, 5, res.com_mscu ? '실패' : '정상');
				table1.setDataAtCell(i, 6, res.power_fail ? '전원불량' : '정상');
				table1.setDataAtCell(i, 7, res.lightout_state ? '소등' : '정상');
				table1.setDataAtCell(i, 8, res.flash_state ? '점멸' : '정상');
				table1.setDataAtCell(i, 9, res.pp_psv ? 'ON' : 'OFF');
				table1.setDataAtCell(
					i,
					10,
					res.conflict_enable ? (res.conflict_state ? '모순' : '정상') : '-'
				);
				table1.setDataAtCell(i, 11, res.door_state ? '열림' : '닫힘');
				table1.setDataAtCell(i, 12, res.offset_value);
				table1.setDataAtCell(i, 13, res.cur_map_no == 0 ? '일반제' : '시차제');
				table1.setDataAtCell(i, 14, res.ring_manage ? '듀얼' : '싱글');
				table1.setDataAtCell(i, 15, res.ring_a_step + 1 + '/' + (res.ring_b_step + 1));
				table1.setDataAtCell(i, 16, res.ring_a_phase + 1 + '/' + (res.ring_b_phase + 1));
				table1.setDataAtCell(i, 17, res.omit_traffic_no);
				table1.setDataAtCell(i, 18, res.fixed_phase_no);
			} else {
				table1.setDataAtCell(i, 3, '통신이상');
			}
		});
	}

	// 초기 조회
	onMount(() => {
		stats = params ? params : stats;

		// 센터
		searchData();

		setInterval(() => {
			monitorData();
		}, 1000);
	});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="search">
			<Searcher
				bind:value={stats.lcno}
				width="200px"
				onChoose={(no) => {
					stats = no;
				}}
			/>
		</div>
		<div class="table">
			<Table
				bind:wrapper={elems.table1}
				bind:table={table1}
				data={data1}
				width={'100%'}
				height={'500px'}
				option={option1}
			/>
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
		width: 1072px;
		height: 500px;
	}

	/* 싱글모드 (창모드 넓이 ~ MAX) */
	#main.modal {
		overflow: auto;
	}

	/* 카드 */
	.EntireDiv {
		height: calc(100% - 32px);
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #dbe2e6;
		border-radius: 6px;
		background-color: #fff;
		padding: 15px;
	}

	/* 테이블 */
	.EntireDiv .table {
		display: grid;
		grid-template-columns: 100%;
		overflow: hidden;
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

	/* Td 줄바꿈 방지 */
	#main .table :global(.handsontable td) {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
</style>
