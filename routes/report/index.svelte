<svelte:options accessors />

<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { devuimode, pageWidth } from '$lib/store.mjs';
	import Button from '$lib/nested/button.svelte';
	import { ajax } from '/src/lib/js/functions.mjs';
	import Table from '$lib/nested/table.svelte';
	import Legend from '$lib/nested/legend.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';
	import ExcelJS from 'exceljs';
	import { saveAs } from 'file-saver';

	// 지도
	import MapSetup from '/src/lib//js/GIS/MapSetup.cjs';
	import { settings } from '$lib/store.mjs';

	// export let tglcno = 0;
	// export let modalmode = false;
	$: stats.ReportSmall = $pageWidth < 1060 ? true : false;

	export let winMode = false;

	const consts = {
		map: null
	};
	let stats = {
		lcno: 1,
		ReportSmall: false
	};
	let elems = {
		table1: null,
		table2: null,
		table3: null,
		table4: null,
		table5: null,
		table6: null,
		input: null
	};
	let param = {
		lcno: 241,
		sano: 165,
		year: 2010
	};

	let selected1 = 1;
	let selected2 = 1;
	let selected3 = 1;

	let option1 = [
		{ id: 1, text: '일반제' },
		{ id: 2, text: '시차제1' },
		{ id: 3, text: '시차제2' },
		{ id: 4, text: '시차제3' },
		{ id: 5, text: '시차제4' },
		{ id: 6, text: '시차제5' },
		{ id: 7, text: '보행맵' }
	];

	let option2 = [
		{ id: 1, text: '계획1' },
		{ id: 2, text: '계획2' },
		{ id: 3, text: '계획3' },
		{ id: 4, text: '계획4' },
		{ id: 5, text: '계획5' },
		{ id: 6, text: '계획6' },
		{ id: 7, text: '계획7' },
		{ id: 8, text: '계획8' },
		{ id: 9, text: '계획9' },
		{ id: 10, text: '계획10' }
	];

	let SelectedLcno = 241;
	let SelectedSano = 165;

	$: searchEvent(param);

	// Map
	let setup;
	let ol;
	let neoMap;

	// Make Map
	function makeMap() {
		let _settings = settings;
		const node = document.lcCon.lcnodes[param.lcno];
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
		let mapData = setup.Map('reportMap');
		consts.map = mapData;

		// 교차로 마커 생성
		const markerEl = document.createElement('div');
		markerEl.classList.add('lcMarker');
		const marker = setup.Marker(latlng, consts.map, markerEl, false);
		consts.map.marker = marker;
	}

	function searchEvent(stat) {
		console.log(stat);
		SelectedLcno = stat.lcno;
		SelectedSano = stat.sano;
		elems.input = '그룹 #' + SelectedSano;

		selected1 = 1;
		selected2 = 1;
		selected3 = 1;

		getWplan(SelectedSano);
		//getRplan(SelectedLcno);
		getHplan(SelectedSano);
		getPhase(1);
		getSplit(1);
		getDplan(1);

		if (consts.map) {
			consts.map.setTarget(null);
			makeMap();
		}
	}

	function initBtn() {
		selected1 = 1;
		selected2 = 1;
		selected3 = 1;

		getWplan(SelectedSano);
		//getRplan(SelectedLcno);
		getHplan(SelectedSano);
		getPhase(1);
		getSplit(1);
		getDplan(1);
	}

	function onchange1() {
		getPhase(selected1);
	}

	function onchange2() {
		getSplit(selected2);
	}

	function onchange3() {
		getDplan(selected3);
	}

	function getPhase(selected) {
		const planClss = selected;
		ajax(`/ntcs_m_phase/GetBy?lcno=${SelectedLcno}&planClss=${planClss}`).then((res) => {
			const lens = res.length;

			if (lens > 0) {
				let cell = JSON.parse(JSON.stringify(data));
				res.forEach((v, i) => {
					if (v.ring == 1) {
						cell[1][
							v.phaseno + 1
						] = `<img class="flowImg" src="images/flows/lcFlow${v.flownumber}.png" width="17" onerror="this.style.display='none';"/>`;
						cell[2][v.phaseno + 1] = v.flownumber ? v.flownumber : '';
						cell[5][v.phaseno + 1] = v.maxsplit ? v.maxsplit : '';
						cell[7][v.phaseno + 1] = v.minsplit ? v.minsplit : '';
						cell[9][v.phaseno + 1] = v.yellow ? v.yellow : '';
					} else if (v.ring == 2) {
						cell[3][
							v.phaseno + 1
						] = `<img class="flowImg" src="images/flows/lcFlow${v.flownumber}.png" width="17" onerror="this.style.display='none';"/>`;
						cell[4][v.phaseno + 1] = v.flownumber ? v.flownumber : '';
						cell[6][v.phaseno + 1] = v.maxsplit ? v.maxsplit : '';
						cell[8][v.phaseno + 1] = v.minsplit ? v.minsplit : '';
						cell[10][v.phaseno + 1] = v.yellow ? v.yellow : '';
					}
				});
				table1.loadData(cell);
				console.log('검색 완료');
			} else {
				console.log('Phase 데이터가 없습니다');
				table1.loadData(data);
			}
		});
	}

	function getSplit(selected) {
		const tplan = selected;
		ajax(`/NTCS_M_TPLAN/GetBy?LCNO=${SelectedLcno}&TPLAN=${tplan}`).then((res) => {
			const lens = res.length;

			if (lens > 0) {
				let cell = JSON.parse(JSON.stringify(data2));
				res.forEach((v, i) => {
					cell[i * 2][1] = v.sumofa ? v.sumofa : '';
					cell[i * 2][2] = v.offset ? v.offset : '';
					cell[i * 2][3] = v.asplit1 ? v.asplit1 : '';
					cell[i * 2][4] = v.asplit2 ? v.asplit2 : '';
					cell[i * 2][5] = v.asplit3 ? v.asplit3 : '';
					cell[i * 2][6] = v.asplit4 ? v.asplit4 : '';
					cell[i * 2][7] = v.asplit5 ? v.asplit5 : '';
					cell[i * 2][8] = v.asplit6 ? v.asplit6 : '';
					cell[i * 2][9] = v.asplit7 ? v.asplit7 : '';
					cell[i * 2][10] = v.asplit8 ? v.asplit8 : '';
					cell[i * 2][11] = v.sumofa ? v.sumofa : '';

					cell[i * 2 + 1][1] = v.sumofb ? v.sumofb : '';
					cell[i * 2 + 1][2] = v.offset ? v.offset : '';
					cell[i * 2 + 1][3] = v.bsplit1 ? v.bsplit1 : '';
					cell[i * 2 + 1][4] = v.bsplit2 ? v.bsplit2 : '';
					cell[i * 2 + 1][5] = v.bsplit3 ? v.bsplit3 : '';
					cell[i * 2 + 1][6] = v.bsplit4 ? v.bsplit4 : '';
					cell[i * 2 + 1][7] = v.bsplit5 ? v.bsplit5 : '';
					cell[i * 2 + 1][8] = v.bsplit6 ? v.bsplit6 : '';
					cell[i * 2 + 1][9] = v.bsplit7 ? v.bsplit7 : '';
					cell[i * 2 + 1][10] = v.bsplit8 ? v.bsplit8 : '';
					cell[i * 2 + 1][11] = v.sumofb ? v.sumofb : '';
				});
				console.log('검색 완료');
				table2.loadData(cell);
			} else {
				console.log('Split 데이터가 없습니다');
				table2.loadData(data2);
			}
		});
	}

	function getDplan(selected) {
		const dplan = selected;
		ajax(`/NTCS_M_SADPLAN/GetBy?SA_NO=${SelectedSano}&SA_DPLAN=${dplan}`).then((res) => {
			const lens = res.length;

			if (lens > 0) {
				let cell = JSON.parse(JSON.stringify(data3));
				res.forEach((v, i) => {
					if(v.sa_cycle && v.sa_offset && v.sa_split){
						let _sh = String(v.sa_starthour);
						let _sm = String(v.sa_startmin);
						cell[v.sa_dplanindex - 1] = [
							v.sa_dplanindex,
							_sh != 'undefined'
								? (_sh.length == 1 ? '0' + _sh : _sh) + ':' + (_sm.length == 1 ? '0' + _sm : _sm)
								: '',
							v.sa_cycle,
							v.sa_offset,
							v.sa_split,
							v.sa_todauto ? 'TRC' : 'TOD'
						];
					} else {
						cell[v.sa_dplanindex - 1] = [
							v.sa_dplanindex,
							'',
							'',
							'',
							'',
							''
						];
					}
				});
				table3.loadData(cell);
				console.log('검색 완료');
			} else {
				console.log('DPLAN 데이터가 없습니다');
				table3.loadData(data3);
			}
		});
	}

	function getWplan(sano) {
		ajax(`/NTCS_M_SAWPLAN/GetBy?SA_NO=${sano}`).then((res) => {
			const lens = res.length;

			if (lens > 0) {
				let cell = JSON.parse(JSON.stringify(data4));
				res.forEach((v, i) => {
					cell[0][v.sa_week + 1] = v.sa_dplan;
				});
				console.log('검색 완료');
				table4.loadData(cell);
			} else {
				console.log('WPLAN 데이터가 없습니다');
				table4.loadData(data4);
			}
		});
	}

	function getRplan(lcno) {
		ajax(`/NTCS_M_RPLAN/GetBy?lcno=${lcno}`).then((res) => {
			const lens = res.length;
			console.log(res);
			if (lens > 0) {
				let wkd = ['', '일', '월', '화', '수', '목', '금', '토'];
				let type = [
					'',
					'조광제어',
					'점멸제어',
					'소등제어',
					'시차제어',
					'감응제어',
					'보행작동신호기활성',
					'음향발생',
					'감응+푸시버튼활성',
					'시차+감응+푸시버튼활성',
					'PPC1',
					'PPC2',
					'예약12',
					'예약13',
					'예약14',
					'예약15'
				];
				let _res = new Array(10);

				res.forEach((v, i) => {
					let _sh = String(v.cntlstarthour);
					let _sm = String(v.cntlstartmin);
					let _eh = String(v.cntlendhour);
					let _em = String(v.cntlendmin);
					_res[i] = new Array();
					_res[i].push(v.fplanindex);
					_res[i].push(v.rsrvmonth ? v.rsrvmonth : '');
					_res[i].push(v.rsrvday ? v.rsrvday : '');
					_res[i].push(wkd[v.rsrvwkd]);
					_res[i].push(
						(_sh.length == 1 ? '0' + _sh : _sh) + ':' + (_sm.length == 1 ? '0' + _sm : _sm)
					);
					_res[i].push(
						(_eh.length == 1 ? '0' + _eh : _eh) + ':' + (_em.length == 1 ? '0' + _em : _em)
					);
					_res[i].push(type[v.cntltype]);
				});
				console.log('검색 완료');
				table5.loadData(_res);
			} else {
				console.log('RPLAN 데이터가 없습니다');
				table5.loadData(data5);
			}
		});
	}

	function getHplan(sano) {
		ajax(`/NTCS_M_SAHPLAN/GetBy?SA_NO=${sano}`).then((res) => {
			const lens = res.length;

			if (lens > 0) {
				let cell = JSON.parse(JSON.stringify(data6));

				res.forEach((v, i) => {
					if(v.sa_mon && v.sa_day){
						cell[v.sa_hplanindex - 1] = [`${v.sa_mon}/${v.sa_day}`, v.sa_dplan];
					} else {
						cell[v.sa_hplanindex - 1] = ['-', '-'];
					}
				});
				table6.loadData(cell);
				console.log('검색 완료');
			} else {
				console.log('HPLAN 데이터가 없습니다');
				table6.loadData(data6);
			}
		});
	}

	//TOD 편집
	function TodEdit(e) {
		document.createWindow('dbEdit', false, e, { tabValue: 4, stats: param });
	}

	function SplitEdit(e) {
		document.createWindow('dbEdit', false, e, { tabValue: 5, stats: param });
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
		const nms = ['현시 구성 정보', 'TOD 패턴', '일 계획', '주간 계획', '예약 계획', '특수일 계획'];

		function putData(tab, no) {
			let sheet = workbook.addWorksheet(nms[no]);
			let _phaseH;
			let phaseH = new Array();
			if (no == 0) {
				phaseH = ['구분', ' ', '1', '2', '3', '4', '5', '6', '7', '8'];
			} else if (tab.getSettings().nestedHeaders) {
				_phaseH = tab.getSettings().nestedHeaders;
				_phaseH[_phaseH.length - 1].forEach((v, i) => {
					if (typeof v == 'string') {
						phaseH.push(v);
					} else {
						phaseH.push(v.label);
						for (let i = 1; i < v.colspan; i++) {
							phaseH.push(' ');
						}
					}
				});
			} else if (tab.getSettings().colHeaders) {
				phaseH = tab.getColHeader().map((el) => {
					return el;
					// return el.replace('</br>',' ');
				});
			}
			const phaseB = tab.getData();
			let columns = new Array();
			phaseH.forEach((v, i) => {
				columns.push({ header: v, key: v });
			});
			sheet.columns = columns;

			console.log('HEADER 원본 : ', phaseH)
			console.log('BODY 원본 : ', phaseB)

			if (no == 0) {
				phaseB.forEach((v, i) => {
					console.log("BODY : ", v)
					let row = new Object();
					if (i == 0) {
						console.log('pass');
					} else {
						phaseH.forEach((b, o) => {
							console.log("HEADER : ", v)
							console.log(b);
							let i = typeof v[o] == 'string' ? v[o].indexOf('lcFlow') : -1;
							if (i == -1) {
								row[b] = v[o];
							} else {
								row[b] = flows[v[o][i + 6]];
							}
						});
						console.log("ROW : ", row);
						sheet.addRow(row);
					}
				});
			} else {
				phaseB.forEach((v, i) => {
					console.log("BODY : ", v)
					let row = new Object();
					phaseH.forEach((b, o) => {
						console.log("HEADER : ", v)
						let i = typeof v[o] == 'string' ? v[o].indexOf('lcFlow') : -1;
						if (i == -1) {
							row[b] = v[o];
						} else {
							row[b] = flows[v[o][i + 6]];
						}
					});
					console.log("ROW : ", row);
					sheet.addRow(row);
				});
			}

			switch (no) {
				case 0:
					sheet.mergeCells('A1:B1');
					sheet.mergeCells('A2:A5');
					sheet.mergeCells('A6:A7');
					sheet.mergeCells('A8:A9');
					sheet.mergeCells('A10:A11');
					sheet.mergeCells('B2:B3');
					sheet.mergeCells('B4:B5');
					break;
				case 1:
					sheet.mergeCells('A2:A3');
					sheet.mergeCells('A4:A5');
					sheet.mergeCells('A6:A7');
					sheet.mergeCells('A8:A9');
					sheet.mergeCells('A10:A11');
					sheet.mergeCells('A12:A13');
					sheet.mergeCells('A14:A15');
					sheet.mergeCells('A16:A17');
					sheet.mergeCells('A18:A19');
					sheet.mergeCells('A20:A21');
					sheet.mergeCells('A22:A23');
					sheet.mergeCells('A24:A25');
					sheet.mergeCells('A26:A27');
					sheet.mergeCells('A28:A29');
					sheet.mergeCells('A30:A31');
					sheet.mergeCells('A32:A33');
					break;
				case 2:
					break;
				case 3:
					break;
				case 4:
					break;
				case 5:
					break;
			}
		}
		putData(table1, 0);
		putData(table2, 1);
		putData(table3, 2);
		putData(table4, 3);
		putData(table5, 4);
		putData(table6, 5);

		console.log()

		let data = await workbook.xlsx.writeBuffer();
		const blob = new Blob([data], { type: this.blobType });
		saveAs(blob, `교차로_${SelectedLcno}_보고서.xlsx`);
	}

	let table1;
	let table2;
	let table3;
	let table4;
	let table5;
	let table6;

	let mergeOption = [
		{ row: 0, col: 0, rowspan: 1, colspan: 2 },
		{ row: 1, col: 0, rowspan: 4, colspan: 1 },
		{ row: 1, col: 1, rowspan: 2, colspan: 1 },
		{ row: 3, col: 1, rowspan: 2, colspan: 1 },
		{ row: 5, col: 0, rowspan: 2, colspan: 1 },
		{ row: 7, col: 0, rowspan: 2, colspan: 1 },
		{ row: 9, col: 0, rowspan: 2, colspan: 1 }
	];

	let mergeOption2 = [
		{ row: 0, col: 0, rowspan: 2, colspan: 1 },
		{ row: 2, col: 0, rowspan: 2, colspan: 1 },
		{ row: 4, col: 0, rowspan: 2, colspan: 1 },
		{ row: 6, col: 0, rowspan: 2, colspan: 1 },
		{ row: 8, col: 0, rowspan: 2, colspan: 1 },
		{ row: 10, col: 0, rowspan: 2, colspan: 1 },
		{ row: 12, col: 0, rowspan: 2, colspan: 1 },
		{ row: 14, col: 0, rowspan: 2, colspan: 1 },
		{ row: 16, col: 0, rowspan: 2, colspan: 1 },
		{ row: 18, col: 0, rowspan: 2, colspan: 1 },
		{ row: 20, col: 0, rowspan: 2, colspan: 1 },
		{ row: 22, col: 0, rowspan: 2, colspan: 1 },
		{ row: 24, col: 0, rowspan: 2, colspan: 1 },
		{ row: 26, col: 0, rowspan: 2, colspan: 1 },
		{ row: 28, col: 0, rowspan: 2, colspan: 1 },
		{ row: 30, col: 0, rowspan: 2, colspan: 1 }
	];

	let data = [
		['구분', '', '1', '2', '3', '4', '5', '6', '7', '8'],
		['이동류', 'A', '-', '-', '-', '-', '-', '-', '-', '-'],
		['', '', '-', '-', '-', '-', '-', '-', '-', '-'],
		['', 'B', '-', '-', '-', '-', '-', '-', '-', '-'],
		['', '', '-', '-', '-', '-', '-', '-', '-', '-'],
		['최대', 'A', '-', '-', '-', '-', '-', '-', '-', '-'],
		['', 'B', '-', '-', '-', '-', '-', '-', '-', '-'],
		['최소', 'A', '-', '-', '-', '-', '-', '-', '-', '-'],
		['', 'B', '-', '-', '-', '-', '-', '-', '-', '-'],
		['황색', 'A', '-', '-', '-', '-', '-', '-', '-', '-'],
		['', 'B', '-', '-', '-', '-', '-', '-', '-', '-']
	];

	let data2 = [
		[1, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', ''],
		[2, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', ''],
		[3, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', ''],
		[4, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', ''],
		[5, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', ''],
		[6, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', ''],
		[7, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', ''],
		[8, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', ''],
		[9, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', ''],
		[10, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', ''],
		[11, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', ''],
		[12, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', ''],
		[13, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', ''],
		[14, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', ''],
		[15, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', ''],
		[16, '', '', '', '', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', '', '', '', '']
	];

	let data3 = [
		[1, '00:00', '0', '0', '0', 'TOD'],
		[2, '00:00', '0', '0', '0', 'TOD'],
		[3, '00:00', '0', '0', '0', 'TOD'],
		[4, '00:00', '0', '0', '0', 'TOD'],
		[5, '00:00', '0', '0', '0', 'TOD'],
		[6, '00:00', '0', '0', '0', 'TOD'],
		[7, '00:00', '0', '0', '0', 'TOD'],
		[8, '00:00', '0', '0', '0', 'TOD'],
		[9, '00:00', '0', '0', '0', 'TOD'],
		[10, '00:00', '0', '0', '0', 'TOD'],
		[11, '00:00', '0', '0', '0', 'TOD'],
		[12, '00:00', '0', '0', '0', 'TOD'],
		[13, '00:00', '0', '0', '0', 'TOD'],
		[14, '00:00', '0', '0', '0', 'TOD'],
		[15, '00:00', '0', '0', '0', 'TOD'],
		[16, '00:00', '0', '0', '0', 'TOD']
	];

	let data4 = [['일계획번호', '-', '-', '-', '-', '-', '-', '-']];

	let data5 = [
		[1, '-', '-', '-', '-', '-', '-'],
		[2, '-', '-', '-', '-', '-', '-'],
		[3, '-', '-', '-', '-', '-', '-'],
		[4, '-', '-', '-', '-', '-', '-'],
		[5, '-', '-', '-', '-', '-', '-'],
		[6, '-', '-', '-', '-', '-', '-'],
		[7, '-', '-', '-', '-', '-', '-'],
		[8, '-', '-', '-', '-', '-', '-'],
		[9, '-', '-', '-', '-', '-', '-'],
		[10, '-', '-', '-', '-', '-', '-']
	];

	let data6 = [
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-'],
		['/', '-']
	];

	// 초기 조회
	onMount(() => {
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

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="upperSide">
			<Searcher
				bind:value={param.lcno}
				onChoose={(no) => {
					param = no;
				}}
				width="100%"
			/>
			<div />
			<Input bind:value={elems.input} width="100%" type="text" placeholder="그룹" />
			<div />
			<div />
			<div />
			<div />
			<div />
			<Button icon="save2db" height={'30px'} on:click={ExcelSave}>엑셀 저장</Button>
			<div />
			<Button colored="blue" height={'30px'} on:click={initBtn} icon="init">새로고침</Button>
		</div>
		<div class="lowerSide">
			<div class="lFirst">
				<div class="map">
					<div class="title">교차로 위치</div>
					<div class="content" id="reportMap">
						<!-- svelte-ignore a11y-img-redundant-alt -->
						<!-- <img src="/monitoring.png" alt="no image" style="width: 100%; height: 99%;"/> -->
					</div>
				</div>
				<div class="FlowTap">
					<div class="title">현시 구성정보</div>
					<div class="content">
						<div class="FTap">
							<div class="sel">
								<select bind:value={selected1} on:change={onchange1} class="static">
									{#each option1 as i}
										<option value={i.id}>
											{i.text}
										</option>
									{/each}
								</select>
							</div>
							<div class="flowtable">
								<Table
									bind:wrapper={elems.table1}
									bind:table={table1}
									{data}
									option={{
										height: '295px',
										width: '100%',
										readOnly: true,
										rowHeaders: false,
										colHeaders: false,
										renderer: 'html',
										mergeCells: mergeOption
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div />

			<div class="lSecond">
				<div class="title">TOD 패턴(스플릿 정보)</div>
				<div class="content">
					<div class="STap">
						<div class="sel">
							<select bind:value={selected2} on:change={onchange2} class="static">
								{#each option2 as i}
									<option value={i.id}>
										{i.text}
									</option>
								{/each}
							</select>
						</div>
						<div class="Splittable">
							<Table
								bind:wrapper={elems.table2}
								bind:table={table2}
								colheader={[
									'인덱스',
									'주기',
									'옵셋',
									'1',
									'2',
									'3',
									'4',
									'5',
									'6',
									'7',
									'8',
									'합계'
								]}
								data={data2}
								option={{
									height: '628px',
									width: '100%',
									colWidths: [
										'14px',
										'10px',
										'10px',
										'10px',
										'10px',
										'10px',
										'10px',
										'10px',
										'10px',
										'10px',
										'10px',
										'10px'
									],
									readOnly: true,
									rowHeaders: false,
									renderer: 'html',
									mergeCells: mergeOption2
								}}
							/>
						</div>
					</div>
				</div>
			</div>

			<div />

			<div class="lThird">
				<div class="dayplan">
					<div class="title">일 계획</div>
					<div class="content">
						<div class="DTap">
							<div class="sel">
								<select bind:value={selected3} on:change={onchange3} class="static">
									{#each option2 as i}
										<option value={i.id}>
											{i.text}
										</option>
									{/each}
								</select>
							</div>
							<div class="daytable">
								<Table
									bind:wrapper={elems.table3}
									bind:table={table3}
									colheader={['인덱스', '시각', '주기', '옵셋', '스플릿', '제어모드']}
									data={data3}
									option={{
										height: '278px',
										width: '100%',
										colWidths: ['10px', '10px', '10px', '10px', '10px', '12px'],
										readOnly: true,
										rowHeaders: false,
										renderer: 'html'
									}}
								/>
							</div>
						</div>
					</div>
				</div>
				<div class="weekplan">
					<div class="title">주간 계획</div>
					<div class="content">
						<div class="weektable">
							<Table
								bind:wrapper={elems.table4}
								bind:table={table4}
								colheader={['요일', '일', '월', '화', '수', '목', '금', '토']}
								data={data4}
								option={{
									height: '59px',
									width: '100%',
									colWidths: ['22px', '10px', '10px', '10px', '10px', '10px', '10px', '10px'],
									readOnly: true,
									rowHeaders: false,
									renderer: 'html'
								}}
							/>
						</div>
					</div>
				</div>
				<div class="resplan">
					<div class="title">예약 계획</div>
					<div class="content">
						<div class="restable">
							<Table
								bind:wrapper={elems.table5}
								bind:table={table5}
								colheader={['인덱스', '월', '일', '요일', '시작', '종료', '제어유형']}
								data={data5}
								option={{
									height: '221px',
									width: '100%',
									colWidths: ['9px', '6px', '6px', '6px', '10px', '10px', '12px'],
									readOnly: true,
									rowHeaders: false,
									renderer: 'html'
								}}
							/>
						</div>
					</div>
				</div>
			</div>

			<div />

			<div class="lFourth">
				<div class="title">특수일 계획</div>
				<div class="content">
					<div class="specialtable">
						<Table
							bind:wrapper={elems.table6}
							bind:table={table6}
							colheader={['월/일', '계획번호']}
							data={data6}
							option={{
								height: '668px',
								width: '100%',
								colWidths: [0.76, 1],
								readOnly: true,
								rowHeaders: false,
								renderer: 'html'
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	#main {
		min-width: 1040px;
		min-height: 750px;
		font-size: 1.3rem;
		background-color: #000000;
		padding: 11px;
		overflow: auto;
	}

	.EntireDiv {
		height: calc(100% - 32px);
		display: grid;
		grid-template-rows: 6% 94%;
		box-shadow: 0px 0px 10px #0000000d;
		/* border: 1px solid #181d22; */
		border-radius: 6px;
		background-color: #212830dd;
		padding: 15px;
	}

	#main.win {
		width: 1072px;
		height: 782px;
	}

	.upperSide {
		display: grid;
		grid-template-columns: 24% 5px 17% calc(19% - 20px) 10% 5px 10% 5px 10% 5px 10%;
	}

	.lowerSide {
		display: grid;
		grid-template-columns: 26% 0.2% 36.4% 0.2% 27% 0.2% 10%;
	}

	.title {
		filter: brightness(75%);
		margin-left: 1%;
		font-size: 1.4rem;
		line-height: 29.66px;
		color: #e9eaeb;
		align-items: end;
	}

	.sel {
		position: relative;
		overflow: hidden;
		width: 60%;
		margin-left: 1%;
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

	.content {
		border: 1px solid #212830;
		background-color: #212830;
		border-radius: 4px;
		overflow: auto;
	}

	.lFirst {
		display: grid;
		grid-template-rows: 48% 52%;
		overflow: auto;
	}

	.map,
	.FlowTap {
		display: grid;
		grid-template-rows: 7% 93%;
		overflow: auto;
	}

	.FTap {
		margin-top: 5px;
		overflow: auto;
	}

	.flowtable {
		height: 100%;
		margin-left: 1%;
		margin-top: 5px;
		margin-right: 1%;
		overflow: auto;
	}

	.lSecond {
		display: grid;
		grid-template-rows: 23.67px calc(100% - 23.67px);
		overflow: auto;
	}

	.STap {
		margin-top: 5px;
		overflow: auto;
	}

	.Splittable {
		margin-left: 1%;
		margin-top: 5px;
		margin-right: 1%;
		overflow: auto;
	}

	.Splittable :global(.tableWrapper .wtHolder) {
		overflow-y: auto;
	}

	.Splittable :global(.handsontable td) {
		height: 25px;
	}

	.lThird {
		display: grid;
		grid-template-rows: 50% 13% 37%;
		overflow: auto;
	}

	.DTap {
		margin-top: 5px;
		overflow: auto;
	}

	.dayplan {
		display: grid;
		grid-template-rows: 23.67px calc(100% - 23.67px);
		overflow: auto;
	}

	.weekplan {
		display: grid;
		grid-template-rows: 25.66px calc(100% - 25.66px);
		overflow: auto;
	}

	.resplan {
		display: grid;
		grid-template-rows: 25.66px calc(100% - 25.66px);
		overflow: auto;
	}

	.daytable,
	.weektable,
	.restable {
		margin-left: 1%;
		margin-top: 5px;
		margin-right: 1%;
		overflow: auto;
	}

	.daytable :global(.tableWrapper .wtHolder) {
		overflow-y: auto;
	}

	.restable :global(.tableWrapper .wtHolder) {
		overflow-y: auto;
	}

	.lFourth {
		display: grid;
		grid-template-rows: 23.67px calc(100% - 23.67px);
		overflow: auto;
	}

	.specialtable {
		margin-left: 1%;
		margin-top: 5px;
		margin-right: 1%;
		overflow: auto;
	}

	.specialtable :global(.tableWrapper .wtHolder) {
		overflow-y: auto;
	}

	#main :global(.lcMarker) {
		background: #444444;
		border-radius: 100%;
		width: 10px;
		height: 10px;
	}

	.Splittable :global(.handsontable tr th),
	.daytable :global(.handsontable tr th),
	.weektable :global(.handsontable tr th),
	.restable :global(.handsontable tr th),
	.specialtable :global(.handsontable tr th) {
		color: #666;
		background: #181d23;
	}

	.flowtable :global(.handsontable tr:nth-child(1) td) {
		color: #666;
		background: #181d23;
	}

	#main :global(.handsontable tr td) {
		color: #999999;
		background: #212830;
	}

	#main :global(div.text) {
		border: 1px solid #212830;
		background-color: #14181d;
	}

	#main :global(div.text > input) {
		color: #fff;
		background-color: #14181d;
	}

	/* scroll */
	:global(::-webkit-scrollbar) {
		width: 7px;
		height: 7px;
		background-color: rgba(0, 0, 0, 0.7);
	}
	:global(::-webkit-scrollbar-thumb) {
		background-color: rgba(126, 126, 126, 0.7);
		border-radius: 2px;
	}
</style>
