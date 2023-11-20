<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { TrfTable, TrfSize } from '$lib/store.mjs';
	import { ajax } from '/src/lib/js/functions.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';

	$: if ($TrfTable[2] == 1) {
		exportExcel(table1);
		$TrfTable[2] = 0;
	}

	$: if ($TrfTable[2] == 2) {
		exportPDF(table1);
		$TrfTable[2] = 0;
	}

	$: if ($TrfTable[2] == 3) {
		exportClib(table1);
		$TrfTable[2] = 0;
	}

	const consts = {};
	let stats = {
		checked1: false,
		checked2: false,
		checked3: false,
		checked4: false,
		checked5: false,
		checked6: false,
		checked7: false,
		checked8: false,
		checked11: false,
		checked12: false,
		checked13: false,
		checked14: false,
		checked15: false,
		checked16: false,
		checked17: false
	};
	let elems = {
		table1: null,
		btn: null
	};
	let param = {
		lcno: 1,
		sano: 1,
		year: 2010
	};

	let SelectedLcno = 0;
	let LcName = null;

	$: searchEvent(param);

	function searchEvent(stat) {
		console.log(stat.lcno);
		SelectedLcno = stat.lcno;
		LcName = document.lcCon.LCs[SelectedLcno].lcname;
	}

	export let table1;

	let data = new Array();

	data.push([
		'발생 시각',
		'교차로<br>번호',
		'교차로명',
		'채널',
		'유형',
		'용도',
		'링',
		'현시',
		'방향',
		'설치<br>차선',
		'점유',
		'비점유',
		'교통량',
		'카드실장',
		'단선여부',
		'ANALOG<br>오류',
		'DIGITAL<br>오류',
		'비점유<br>오류',
		'점유<br>오류',
		'교통량<br>오류'
	]);

	for (let i = 0; i < 21; i++) {
		let temp = [
			`-`,
			'-',
			'-',
			'-',
			'-',
			'-',
			'-',
			'-',
			'-',
			'-',
			'-',
			'-',
			'-',
			'-',
			'-',
			'-',
			'-',
			'-',
			'-',
			'-',
			'-',
			'-'
		];
		data.push(temp);
	}

	function exportExcel(table) {
		// 엑셀
		let exportPlugin = table.getPlugin('exportFile');
		exportPlugin.downloadFile('csv', {
			bom: true,
			columnDelimiter: ',',
			exportHiddenColumns: false,
			exportHiddenRows: true,
			fileExtension: 'csv',
			filename: 'Tfhistory_[YYYY]-[MM]-[DD]',
			mimeType: 'text/csv',
			rowDelimiter: '\r\n',
			rowHeaders: false
		});
	}

	function exportPDF(table) {
		const newWin = window.open('');
		newWin.document.write(table.toHTML());

		let link = newWin.document.createElement('link');
		link.href = 'stylesheets/main/pdfStyle.css';
		link.rel = 'stylesheet';
		newWin.document.getElementsByTagName('head')[0].append(link);

		setTimeout(function () {
			newWin.print();
			newWin.close();
		});
	}

	function exportClib(table) {
		// 클립보드
		const plugin = table.getPlugin('exportFile');
		const string = plugin.exportAsString('csv');

		let t = document.createElement('textarea');
		document.body.appendChild(t);
		t.value = string;
		t.select();
		document.execCommand('copy');
		document.body.removeChild(t);
		document.createMsg('복사되었습니다.');
	}

	function type_jd(a) {
		// 유형 판별

		const b = Number(a);

		switch (b) {
			case 0:
				return '1.8x1.8';
			case 1:
				return '4.0x1.8';
			case 2:
				return '원형';
			case 3:
				return 'LONG LOOP';
			case 4:
				return '점형 검지기';
			case 5:
				return '영상';
			case 6:
				return '기타';
		}
	}

	function use_js(a) {
		// 용도 판별

		switch (a) {
			case 1:
				return '직진';
			case 2:
				return '좌회전';
			case 3:
				return '대기행렬';
			case 4:
				return '앞막힘';
			case 5:
				return '좌회전대기';
			case 6:
				return '기타';
			case 7:
				return '쌍루프(상류)';
			case 8:
				return '쌍루프(하류)';
		}
	}

	function ring_jd(a) {
		// 링 판별 1 : A링 2: B링

		if (a == 1) {
			return 'A링';
		} else {
			return 'B링';
		}
	}

	function type_dir(a) {
		const b = Number(a);

		switch (b) {
			case 1:
				return '북';
			case 2:
				return '동';
			case 3:
				return '남';
			case 4:
				return '서';
			case 5:
				return '북동';
			case 6:
				return '남동';
			case 7:
				return '남서';
			case 8:
				return '북서';
		}
	}

	function type_occ(a) {
		const b = Number(a);
		if (b == 0) {
			return '비점유';
		} else {
			return '점유';
		}
	}

	function type_status_1(a) {
		const b = Number(a);
		if (b == 0) {
			return '실장';
		} else {
			return '실장\n안됨';
		}
	}

	function type_status_2(a) {
		const b = Number(a);
		if (b == 0) {
			return '정상';
		} else {
			return '단선';
		}
	}

	function type_status_3(a) {
		const b = Number(a);
		if (b == 0) {
			return '정상';
		} else {
			return '단락';
		}
	}

	function type_status_4(a) {
		const b = Number(a);
		if (b == 0) {
			return '정상';
		} else {
			return '발진\n이상';
		}
	}

	function type_err(a) {
		const b = Number(a);
		if (b == 0) {
			return '정상';
		} else {
			return 'ERROR';
		}
	}

	function tfdtStClick() {
		const type_use = [];
		const type_type = [];

		const keys = Object.keys(stats);
		console.log(keys);

		for (var i = 0; i < 8; i++) {
			const key = keys[i];
			const value = stats[key];

			if (value == true) {
				type_use.push(1);
			} else {
				type_use.push(0);
			}
		}

		for (var i = 8; i < 15; i++) {
			const key = keys[i];
			const value = stats[key];

			if (value == true) {
				type_type.push(1);
			} else {
				type_type.push(0);
			}
		}
		type_type.push(0);

		const json = {
			lc_no: SelectedLcno,
			tfdt_type: type_use,
			tfdt_error: type_type
		};
		console.log(json);
		ajax('/NTCS_T_TFDT/GetStatusNew', 'POST', json).then((res) => {
			const lens = res.length;

			if (lens > 0) {
				const arr = new Array();

				arr.push([
					'발생 시각',
					'교차로<br>번호',
					'교차로명',
					'채널',
					'유형',
					'용도',
					'링',
					'현시',
					'방향',
					'설치<br>차선',
					'점유',
					'비점유',
					'교통량',
					'카드실장',
					'단선여부',
					'ANALOG<br>오류',
					'DIGITAL<br>오류',
					'비점유<br>오류',
					'점유<br>오류',
					'교통량<br>오류'
				]);

				res.forEach((v, i) => {
					const arr_5 = new Array();
					if (v.tfdt_credate != undefined) {
						arr_5[0] = v.tfdt_credate.replace('T', '\n');
					} else {
						arr_5[0] = '';
					}
					arr_5[1] = v.int_lcno;
					arr_5[2] = LcName;
					arr_5[3] = v.tfdt_no;
					if (v.tfdt_type != undefined) {
						arr_5[4] = type_jd(v.tfdt_type);
					} else {
						arr_5[4] = '';
					}
					if (v.tfdt_use != undefined) {
						arr_5[5] = use_js(v.tfdt_use);
					} else {
						arr_5[5] = '';
					}
					if (v.tfdt_ring != undefined) {
						arr_5[6] = ring_jd(v.tfdt_ring);
					} else {
						arr_5[6] = '';
					}
					arr_5[7] = v.tfdt_phase;
					if (v.tfdt_dir != undefined) {
						arr_5[8] = type_dir(v.tfdt_dir);
					} else {
						arr_5[8] = '';
					}
					arr_5[9] = v.tfdt_lane;
					arr_5[10] = v.tfdt_occ;
					arr_5[11] = v.tfdt_nocc;
					arr_5[12] = v.tfdt_wghvol;
					if (v.tfdt_status1 != undefined) {
						arr_5[13] = type_status_1(v.tfdt_status1);
					} else {
						arr_5[13] = '';
					}
					if (v.tfdt_status2 != undefined) {
						arr_5[14] = type_status_2(v.tfdt_status2);
					} else {
						arr_5[14] = '';
					}
					if (v.tfdt_status3 != undefined) {
						arr_5[15] = type_status_3(v.tfdt_status3);
					} else {
						arr_5[15] = '';
					}
					if (v.tfdt_status4 != undefined) {
						arr_5[16] = type_status_4(v.tfdt_status4);
					} else {
						arr_5[16] = '';
					}
					if (v.tfdt_status5 != undefined) {
						arr_5[17] = type_err(v.tfdt_status5);
					} else {
						arr_5[17] = '';
					}
					if (v.tfdt_status6 != undefined) {
						arr_5[18] = type_err(v.tfdt_status6);
					} else {
						arr_5[18] = '';
					}
					if (v.tfdt_status7 != undefined) {
						arr_5[19] = type_err(v.tfdt_status7);
					} else {
						arr_5[19] = '';
					}

					arr.push(arr_5);
				});

				console.log('검색 완료');
				table1.loadData(arr);
				document.isSuccess(res);
			} else {
				console.log('데이터 없음');
				table1.loadData(data);
				document.isSuccess(res);
			}
		});
	}
</script>

<div class="tfdtSt {$TrfSize == 1 ? '_big' : ''}">
	<div class="Ftfdt">
		<div class="Box1">교차로</div>
		<div />
		<div class="Select1">
			<Searcher
				onChoose={(no) => {
					param = no;
				}}
				width="100%"
			/>
		</div>
	</div>
	<div />
	<div class="Stfdt">
		<div class="Box1">검지기 용도</div>
		<div />
		<div class="Check1">
			<Input type="checkbox1" bind:checked={stats.checked1}>직진</Input>
			<Input type="checkbox1" bind:checked={stats.checked2}>좌회전</Input>
			<Input type="checkbox1" bind:checked={stats.checked3}>앞막힘</Input>
			<Input type="checkbox1" bind:checked={stats.checked4}>대기행렬</Input>
			<Input type="checkbox1" bind:checked={stats.checked5}>좌회전대기</Input>
			<Input type="checkbox1" bind:checked={stats.checked6}>쌍루프(상류)</Input>
			<Input type="checkbox1" bind:checked={stats.checked7}>쌍루프(하류)</Input>
			<Input type="checkbox1" bind:checked={stats.checked8}>기타</Input>
		</div>
	</div>
	<div />
	<div class="Ttfdt">
		<div class="Box1">검지기 상태</div>
		<div />
		<div class="Check1">
			<Input type="checkbox1" bind:checked={stats.checked11}>실장여부</Input>
			<Input type="checkbox1" bind:checked={stats.checked12}>루프단선</Input>
			<Input type="checkbox1" bind:checked={stats.checked13}>점유오류</Input>
			<Input type="checkbox1" bind:checked={stats.checked14}>비점유오류</Input>
			<Input type="checkbox1" bind:checked={stats.checked15}>교통량오류</Input>
			<Input type="checkbox1" bind:checked={stats.checked16}>ANALOG부 고장</Input>
			<Input type="checkbox1" bind:checked={stats.checked17}>DIGITAL부 고장</Input>
		</div>
		<div />
		<Button on:click={tfdtStClick} bind:this={elems.btn} icon="search" colored={true}>조회</Button>
	</div>
	<div />
	<div class="tfdtTable">
		<Table
			bind:wrapper={elems.table1}
			bind:table={table1}
			{data}
			option={{
				colWidths: [
					'77px',
					'37px',
					'86px',
					'30px',
					'50px',
					'68px',
					'28px',
					'30px',
					'30px',
					'35px',
					'30px',
					'37px',
					'43px',
					'50px',
					'50px',
					'50px',
					'40px',
					'40px',
					'40px',
					'40px'
				],
				renderer: 'html',
				rowHeaders: false,
				readOnly: true,
				fixedRowsTop: 1,
				height: '100%'
			}}
		/>
	</div>
</div>

<style>
	.tfdtSt {
		height: 100%;
		display: grid;
		grid-template-rows: 7% 5px 7% 5px 7% 5px calc(79% - 15px);
	}

	.tfdtSt._big {
		height: 100%;
		display: grid;
		grid-template-rows: 34px 5px 34px 5px 34px 5px calc(100% - 117px);
	}

	.tfdtSt :global(.tableWrapper .handsontable tr:first-child td:first-child) {
		font-size: 1.3rem !important;
	}

	.Ftfdt {
		display: grid;
		grid-template-columns: 12% 10px 20% calc(68% - 10px);
		align-items: center;
	}

	.Stfdt {
		display: grid;
		grid-template-columns: 12% 1px calc(80% - 2px) calc(8% + 1px);
		align-items: center;
	}

	.Check1 {
		margin-top: 3px;
	}

	.Ttfdt {
		display: grid;
		grid-template-columns: 12% 1px 80% calc(0.5% - 1px) 7.5%;
		align-items: center;
	}

	.tfdtTable {
		overflow: auto;
		height: 100%;
	}

	.tfdtTable :global(.hansontable .wtHider) {
		overflow-x: hidden;
		overflow-y: auto;
	}

	.tfdtTable :global(.handsontable td) {
		color: #777777;
		overflow: hidden;
		height: 33px;
	}

	.tfdtTable :global(.handsontable tr:first-child td) {
		color: #999999;
		background: #f4f7f9;
		height: 33px;
		border: 0px !important;
		border-bottom: 1px solid #edeef0 !important;
		padding: 0px !important;
	}

	.Box1 {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 32px;
		border: 1px solid #dadde1;
		font-size: 1.3rem;
		border-radius: 4px;
	}
</style>
