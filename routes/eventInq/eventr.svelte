<script>
	// @ts-nocheck

	import { onMount } from 'svelte';
	import { ajax } from '/src/lib/js/functions.mjs';
	// import {devuimode} from '$lib/store.mjs'
	// import Button from '$lib/nested/button.svelte'
	import { evlist } from '/src/lib/store.mjs';
	import Table from '$lib/nested/table.svelte';
	import { dir2kor } from '/src/lib/js/consts.mjs';
	// import Searcher from '$lib/nested/searcher.svelte'
	// import Input from '$lib/nested/input.svelte'
	// import Select from '$lib/nested/dropdown.svelte'

	// export let tglcno = 0;
	// export let modalmode = false;

	const consts = {};
	let stats = {};
	let elems = {
		table1: null,
		md: null
	};

	let table1;

	let data = [[`-`, `-`, '-', '-', '-', '-']];
	let sto = null;

	let serverNames = new Object();
	let codes = new Object();

	ajax('/CAMERA_SERVER').then((res) => {
		Object.values(res).forEach((v) => {
			serverNames[v.sid] = v.sname;
		});
		console.log(serverNames);
	});
	ajax('/EVENT_MNAME').then((mres) => {
		Object.values(mres).forEach((m) => {
			codes[m.m_code] = { mname: m.m_name, scodes: new Object() };
		});
		ajax('/EVENT_SNAME').then((sres) => {
			Object.values(sres).forEach((s) => {
				codes[s.m_code].scodes[s.s_code] = { sname: s.s_name };
			});
		});
		console.log(codes);
	});

	$: setTable($evlist, true);

	function setTable(evlist, alive) {
		console.log(codes)
		if (table1 && Object.keys(codes).length) {
			let LCs = document.lcCon.LCs;
			let _evlist = new Array();
			let leng = evlist.length - 1;
			evlist.forEach((el, i) => {
				if (el.TYPE==0) {
					_evlist[leng - i] = [
						i + 1,
						el.TIME,
						'카메라 상태',
						`${el.LCNO}-${el.DIR}`,
						`${el.LCNO}. ${LCs[el.LCNO].lcname}_${dir2kor[el.DIR / 10 - 1]}`,
						el.STATUS ? '카메라 정상화' : '카메라 고장'
					];
				} else if (el.type==1) {
					_evlist[leng - i] = [
						i + 1,
						el.TIME,
						`${codes[el.MCODE].mname}-${codes[el.MCODE].scodes[el.SCODE].sname}`,
						el.IP,
						serverNames[el.IP.split('.')[3].slice(1) + String(el.PORT).slice(0, -3)],
						el.COMMENTS
					];
				} else if (el.type==2) {
					_evlist[leng - i] = [
						i + 1,
						el.TIME,
						`${codes[el.MCODE].mname}-${codes[el.MCODE].scodes[el.SCODE].sname}`,
						`${el.LCNO}-${el.DIR}`,
						`${el.LCNO}. ${LCs[el.LCNO].lcname}_${dir2kor[el.DIR / 10 - 1]}`,
						el.COMMENTS
					];
				}
			});
			table1.loadData(_evlist);
		}
		if (elems.md && alive) {
			elems.md.classList.add('alive');
			if (sto) {
				clearTimeout(sto);
			}
			sto = setTimeout(() => {
				elems.md.classList.remove('alive');
				sto = null;
			}, 150);
		}
	}

	// let fcnt = 0;

	// let realTimeEvent = (e) => {
	//     if(fcnt == 0) {
	//         data.pop();
	//         fcnt++;
	//     }
	//     const edata = e.data;
	//     const lens = data.length;
	//     if(lens > 99) {
	//         data.pop();
	//         const temp = [`${lens + 1}`, edata.cre_date.replace('T', ' ').split('.')[0], edata.l_code, edata.target_no, document.lcCon.LCs[edata.target_no].lcname, edata.explain]
	//         data.push(temp)
	//         data.sort((a, b) => b[0] - a[0])
	//         for(var i = 0; i < lens; i++) {
	//             data[i][0] = 5-i;
	//         }
	//         table1.loadData(data)
	//     } else {
	//         const temp = [`${lens + 1}`, edata.cre_date.replace('T', ' ').split('.')[0], edata.l_code, edata.target_no, document.lcCon.LCs[edata.target_no].lcname, edata.explain]
	//         data.push(temp)
	//         data.sort((a, b) => b[0] - a[0])
	//         table1.loadData(data)
	//     }
	// }

	onMount(() => {
		// elems.md.addEventListener('realTimeEvent', realTimeEvent)
		setTable($evlist);
	});
</script>

<div bind:this={elems.md} class="tab realTime">
	<Table
		bind:wrapper={elems.table1}
		bind:table={table1}
		colheader={['No', '발생 시간', '이벤트 종류', '대상ID', '대상 이름', '이벤트 설명']}
		{data}
		option={{
			colWidths: ['22px', '71px', '78px', '45px', '110px', '132px'],
			renderer: 'html',
			rowHeaders: false,
			rowHeights: 30,
			height: '100%',
			readOnly: true
		}}
	/>
</div>

<style>
	.tab {
		margin-top: 10px;
		height: calc(100% - 10px);
		overflow: auto;
	}

	.tab :global(.handsontable tr td:nth-child(2)) {
		font-size: 1.2rem;
	}
	.tab :global(.handsontable tr:first-of-type td) {
	}
	.realTime:global(.alive .handsontable tr:first-of-type td) {
		transition: background-color 0.15s;
		background-color: white !important;
	}

	:global(.handsontable .wtHolder)::-webkit-scrollbar {
		width: 7px;
		height: 7px;
		background-color: rgba(0, 0, 0, 0.7);
	}
	:global(.handsontable .wtHolder)::-webkit-scrollbar-thumb {
		background-color: rgba(126, 126, 126, 0.7);
		border-radius: 2px;
	}
</style>
