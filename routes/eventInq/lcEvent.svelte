<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { devuimode, pageWidth, EventTable1, EventSize } from '$lib/store.mjs';
	import { ajax } from '/src/lib/js/functions.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';
	import Select from '$lib/nested/dropdown.svelte';

	$: if ($EventTable1 == 1) {
		console.log('교차로 엑셀 저장 클릭');
		exportExcel(table1);
		$EventTable1 = 0;
	}

	$: if ($EventTable1 == 2) {
		console.log('교차로 PDF 저장/인쇄 클릭');
		exportPDF(table1);
		$EventTable1 = 0;
	}

	$: if ($EventTable1 == 3) {
		console.log('교차로 데이터 복사 클릭');
		exportClib(table1);
		$EventTable1 = 0;
	}

	const consts = {
		option1 : [
            {id: 2023, text: '2023년'},
        ],
        option2 : [
            {id: 1, text: '1월'},
			{id: 2, text: '2월'},
			{id: 3, text: '3월'},
			{id: 4, text: '4월'},
			{id: 5, text: '5월'},
			{id: 6, text: '6월'},
			{id: 7, text: '7월'},
			{id: 8, text: '8월'},
			{id: 9, text: '9월'},
			{id: 10, text: '10월'},
			{id: 11, text: '11월'},
			{id: 12, text: '12월'},
        ]
	};
	let stats = {
		value1: null,
		value2: null,
		checked1: true,
		checked2: true,
		checked3: true,
		checked4: true,
	};
	let elems = {
		table1: null,
		btn: null,
		check: null,
		checked5: false
	};
	let param = {
		lcno: 241,
		sano: 19,
		year: 2010
	};

	let SelectedLcno = 0;
	let selected1 = 2023;
	let selected2 = 1;
	let LcName = null;

	$: searchEvent(param);
	$: ToggleEvent(elems.checked5);

	function searchEvent(stat) {
		console.log(stat.lcno);
		SelectedLcno = stat.lcno;
		console.log(SelectedLcno);
		LcName = document.lcCon.LCs[SelectedLcno].lcname;
	}

	function ToggleEvent(check) {
		console.log("토글 실행됨")
		let today = new Date();
		let year = today.getFullYear(); // 2023
		let month = ('0' + (today.getMonth() + 1)).slice(-2);
		let day = ('0' + today.getDate()).slice(-2);
		let hours = ('0' + today.getHours()).slice(-2);
		let hours2 = ('0' + (today.getHours() - 5)).slice(-2);
		let minutes = ('0' + today.getMinutes()).slice(-2);
		let last = new Date(year, selected2, 0);
		last.getDate();

		let firstInput;
		let secondInput;
		if(check){
			firstInput = selected1 + '-' + ('0' + selected2).slice(-2) + '-' + last.getDate() + 'T' + '00:00';
			secondInput = selected1 + '-' + ('0' + selected2).slice(-2) + '-' + '01' + 'T' + '00:00';
		} else {
			firstInput = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
			secondInput = year + '-' + month + '-' + day + 'T' + hours2 + ':' + minutes;
		}

		stats.value1 = secondInput;
		stats.value2 = firstInput;
	}

	export let table1;

	let today = new Date();
	let year = today.getFullYear(); // 2023
	let month = ('0' + (today.getMonth() + 1)).slice(-2);
	let day = ('0' + today.getDate()).slice(-2);
	let hours = ('0' + today.getHours()).slice(-2);
	let hours2 = ('0' + (today.getHours() - 5)).slice(-2);
	let minutes = ('0' + today.getMinutes()).slice(-2);

	let firstInput = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
	let secondInput = year + '-' + month + '-' + day + 'T' + hours2 + ':' + minutes;
	stats.value1 = secondInput;
	stats.value2 = firstInput;

	for(let i = 2023; i<year; i++){
		consts.push({id: i+1, text: `${i+1}년`})
	}

	let data = new Array();
	for (let i = 0; i < 11; i++) {
		let temp = [``, '', '', '', '', ''];
		data.push(temp);
	}

	let data2 = new Array();
	for (let i = 0; i < 22; i++) {
		let temp = [``, '', '', '', '', ''];
		data2.push(temp);
	}

	function TargetName(l_code, target_no, target_name) {
		if (l_code == 1 || l_code == 3) {
			return document.lcCon.LCs[target_no].lcname;
		} else {
			return target_name;
		}
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
			filename: 'LcEvent_[YYYY]-[MM]-[DD]',
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

	function hisClick() {
		if(
			stats.checked1 == false &&
			stats.checked2 == false &&
			stats.checked3 == false &&
			stats.checked4 == false
		){
			document.createMsg("이벤트가 선택되지 않았습니다.", 1);
		} else {
			let mname = new Array();
			if (
				stats.checked1 == true &&
				stats.checked2 == true &&
				stats.checked3 == true &&
				stats.checked4 == true
			) {
				mname.push(-1);
			} else {
				if (stats.checked1 == true) {
					mname.push(1);
				}
				if (stats.checked2 == true) {
					mname.push(2);
					mname.push(3);
				}
				if (stats.checked3 == true) {
					mname.push(4);
				}
				if (stats.checked4 == true) {
					mname.push(5);
				}
			}
			let StrR = '';
			for (var i = 0; i < mname.length; i++) {
				if (i == mname.length - 1) {
					StrR += mname[i];
				} else {
					StrR += mname[i] + ',';
				}
			}
			const starttime = stats.value1.replace('T', ' ');
			const endtime = stats.value2.replace('T', ' ');
			let result = {
				starttime: starttime,
				endtime: endtime,
				leventtype: 1,
				lcno: SelectedLcno,
				mname: StrR,
				userid: -1,
				sname: -1
			};
			console.log(result);
			ajax('/NTCS_L_EVENT/GetLog', 'POST', result).then((res) => {
				const arr = new Array();
				res.forEach((v, i) => {
					let _arr = new Array();
					_arr[0] = v.cre_date.split('.')[0].replace('T', '\n');
					_arr[1] = v.target_no;
					_arr[2] = TargetName(v.l_code, v.target_no, v.target_name);
					_arr[3] = v.m_name;
					_arr[4] = v.s_name;
					_arr[5] = v.explain;
					arr.push(_arr);
				});

				if (arr.length) {
					table1.loadData(arr);
					document.isSuccess(res);
				} else {
					if ($EventSize == 1) {
						table1.loadData(data2);
						document.isSuccess(res);
					} else {
						table1.loadData(data);
						document.isSuccess(res);
					}
				}
			});
		}
	}

	onMount(() => {});
</script>

<div class="EntireDiv {$EventSize == 1 ? '_big' : ''}">
	<div class="SrhEvt">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<div class="LcSrh">
			<div class="Box1">필터</div>
			<div />
			<Searcher
				bind:value={param.lcno}
				onChoose={(no) => {
					param = no;
				}}
				width="100%"
			/>
			<div />
			<input class="sel {elems.checked5 ? 'none' : ''}" type="datetime-local" bind:value={stats.value1} />
			<div class="during">~</div>
			<input class="sel {elems.checked5 ? 'none' : ''}" type="datetime-local" bind:value={stats.value2} />
			<div />
			<div class="sel {elems.checked5 ? '' : 'none'}">
				<select bind:value={selected1} on:change={ToggleEvent(elems.checked5)} class="static" >
					{#each consts.option1 as i}
						<option value={i.id}>
							{i.text}
						</option>
					{/each}
				</select>
			</div>
			<div />
			<div class="sel {elems.checked5 ? '' : 'none'}">
				<select bind:value={selected2} on:change={ToggleEvent(elems.checked5)} class="static" >
					{#each consts.option2 as i}
						<option value={i.id}>
							{i.text}
						</option>
					{/each}
				</select>
			</div>
			<div />
			<div class="Check1">
				<Input type="checkbox1" bind:checked={elems.checked5}>월단위</Input>
			</div>
		</div>
		<div />
		<div class="EvSrh">
			<div class="Box1">이벤트</div>
			<div />
			<div class="Check1">
				<Input type="checkbox1" bind:checked={stats.checked1}>시설물장애</Input>
				<Input type="checkbox1" bind:checked={stats.checked2}>통신장애</Input>
				<Input type="checkbox1" bind:checked={stats.checked3}>돌발장애</Input>
				<Input type="checkbox1" bind:checked={stats.checked4}>사용자이벤트</Input>
			</div>
			<div />
			<Button height={'30px'} bind:this={elems.btn} colored="blue" icon="search" on:click={hisClick}>조회</Button>
		</div>
	</div>
	<div />
	<div class="TableEvt">
		<Table
			bind:wrapper={elems.table1}
			bind:table={table1}
			colheader={['발생 시각', '대상 ID', '대상 이름', '발생이벤트', '이벤트 상세', '이벤트 설명']}
			data={data2}
			option={{
				renderer: 'html',
				rowHeights: 30,
				colWidths: ['75px', '38px', '136px', '130px', '137px', '136px'],
				readOnly: true,
				height: '100%'
			}}
		/>
	</div>
</div>

<style>
	.EntireDiv {
		height: 100%;
		display: grid;
		grid-template-rows: 14% 10px calc(86% - 10px);
		margin-top: 5px;
	}

	.EntireDiv._big {
		height: 100%;
		display: grid;
		grid-template-rows: 78px 10px calc(100% - 93px);
	}

	.SrhEvt {
		display: grid;
		grid-template-rows: calc(50% - 5px) 10px calc(50% - 5px);
	}

	.LcSrh {
		display: grid;
		grid-template-columns: 10% 10px 21% 10px 16% 15px 16% 10px 80px 10px 80px 10px 75px;
	}

	.EvSrh {
		display: grid;
		grid-template-columns: 10% 1px 50% calc(32% - 1px) 8%;
		align-items: center;
	}

	.Check1 {
		margin-top: 3px;
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

	input[type='datetime-local'] {
		height: calc(100% - 2px);
		border: 1px solid #dadde1;
		border-radius: 4px;
		padding: 0 2px;
		font-size: 1.2rem;
		color: #0584fe;
	}

	.sel {
        position: relative;
        overflow: hidden;
        height: 32px;
        font-size: 1.3rem;
        border-radius: 4px;
        border: 1px solid #212830;
        background-color: #14181D;
    }

        .sel > select {
            width: 100%;
            height: calc(100% - 1px);
            padding: 0 9px;
            border: none;
            margin: 0;
            color: #FFF;
            background-color: #14181D;
            font-size: 1.3rem;
        }

	.TableEvt {
		height: 100%;
		overflow: auto;
	}

	.TableEvt :global(.handsontable td) {
		color: #777777;
	}

	.TableEvt :global(.handsontable tr td:first-child) {
		font-size: 1.2rem;
	}

	.during {
		text-align: center;
		line-height: 34px;
	}

	.none {
		pointer-events: none;
		filter: brightness(70%);
	}
</style>
