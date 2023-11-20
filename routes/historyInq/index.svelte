<svelte:options accessors />

<script>
	// @ts-nocheck

	/*
        innerHTML 초기화 해야함
        변수 설정
    */
	import { onMount } from 'svelte';
	import { HisTable, HisSize } from '$lib/store.mjs';
	import Searcher from '$lib/nested/searcher.svelte';
	import Tabs from '$lib/nested/tabs.svelte';
	import Lch from './lch.svelte';
	import Grh from './ggh.svelte';

	let tabHeight = '';
	export let winMode = true;
	export const onSize = function (width, height) {
		if (width > 1200 || width <= 963) {
			stats.responsive = 1;
			tabHeight = height - 140 + 'px';
			$HisSize = 1;
		} else {
			stats.responsive = 0;
			$HisSize = 0;
		}

		let ctx = items[tabValue - 1].tables.$$.ctx;
		let tables = ctx.filter((v) => typeof v == 'object' && v.hasOwnProperty('table1') == true);
		if (tables.length) {
			setTimeout(function () {
				Object.keys(tables[0]).forEach(function (k) {
					if (tables[0][k]) {
						if (tables[0][k].table) {
							tables[0][k].table.batch(() => {
								tables[0][k].table.render();
								tables[0][k].table.refreshDimensions();
							});
						}
					}
				});
			}, 100);
		}
	};

	let stats = {
		responsive: 0
	};
	let elems = {
		img: null,
		tag: null,
		Excel: null,
		btn1: null,
		btn2: null,
		btn3: null
	};

	let tabValue = 1;

	let items = [
		{ label: '교차로 신호운영이력', value: 1, component: Lch, tables: null, render: 0 },
		{ label: '그룹 신호운영이력', value: 2, component: Grh, tables: null, render: 0 }
	];

	onMount(() => {
		elems.img.addEventListener('mouseenter', function () {
			elems.Excel.style = 'display:grid;';
		});

		elems.Excel.addEventListener('mouseleave', function () {
			elems.Excel.style = 'display:none;';
		});

		elems.btn1.addEventListener('mouseenter', function () {
			elems.btn1.style = 'color:#237fd2; border-bottom: 1px #237fd2 solid; cursor:pointer;';
		});

		elems.btn1.addEventListener('mouseleave', function () {
			elems.btn1.style = 'color:#777;';
		});

		elems.btn1.addEventListener('click', function () {
			// 엑셀 저장
			if (tabValue == 1) {
				$HisTable[0] = 1;
			} else if (tabValue == 2) {
				$HisTable[1] = 1;
			}
		});

		elems.btn2.addEventListener('mouseenter', function () {
			elems.btn2.style = 'color:#237fd2; border-bottom: 1px #237fd2 solid; cursor:pointer;';
		});

		elems.btn2.addEventListener('mouseleave', function () {
			elems.btn2.style = 'color:#777;';
		});

		elems.btn2.addEventListener('click', function () {
			// PDF 저장/인쇄
			if (tabValue == 1) {
				$HisTable[0] = 2;
			} else if (tabValue == 2) {
				$HisTable[1] = 2;
			}
		});

		elems.btn3.addEventListener('mouseenter', function () {
			elems.btn3.style = 'color:#237fd2; border-bottom: 1px #237fd2 solid; cursor:pointer;';
		});

		elems.btn3.addEventListener('mouseleave', function () {
			elems.btn3.style = 'color:#777;';
		});

		elems.btn3.addEventListener('click', function () {
			// 데이터 복사
			if (tabValue == 1) {
				$HisTable[0] = 3;
			} else if (tabValue == 2) {
				$HisTable[1] = 3;
			}
		});
	});
</script>

<div id="main" class:win={winMode == true}>
	<div class="search">
		<div bind:this={elems.tag} class="imgtag">
			<!-- svelte-ignore a11y-missing-attribute -->
			<img bind:this={elems.img} src={'/svg/button/print.svg'} alt="icon" />
		</div>
		<div bind:this={elems.Excel} class="ExcelBtn" style="display:none;">
			<div bind:this={elems.btn1} class="divbtn">엑셀 저장</div>
			<div bind:this={elems.btn2} class="divbtn">PDF 저장/인쇄</div>
			<div bind:this={elems.btn3} class="divbtn">데이터 복사</div>
		</div>
	</div>
	<Tabs
		height={stats.responsive == 0 ? '587px' : tabHeight}
		{items}
		on:tabChange={(e) => {
			tabValue = e.detail.tabValue;
		}}
	/>
</div>

<style>
	#main .search {
		grid-area: 1 / 1 / 2 / 2;
	}

	#main :global(.tabList) {
		grid-area: 1 / 2 / 2 / 3;
	}

	#main :global(.tabPanel) {
		grid-area: 2 / 1 / 3 / 3;
	}

	.ExcelBtn {
		display: grid;
		grid-template-rows: 1fr 1fr 1fr;
		position: absolute;
		background-color: #dadde1;
		margin-top: 47px;
		width: 100px;
		height: 80px;
		border-radius: 5px;
		z-index: 110;
		color: #777;
	}

	.divbtn {
		/* line-height: 26.66px; */
		margin: auto;
		font-style: bold;
	}

	#main {
		display: grid;
		grid-template-columns: 3fr 1fr;
		grid-template-rows: auto;
		/* MIN */
		min-width: 700px;
		min-height: 660px;

		/* ETC */
		font-size: 1.3rem;
		background-color: #f9fafb;
		padding: 15px;
	}

	#main.win {
		width: 1080px;
		height: 660px;
	}

	.imgtag {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 34px;
		height: 32px;
		line-height: 34px;
		text-align: center;
		border-radius: 5px;
		background-color: #dadde1;
	}

	img {
		width: 20px;
		height: 20px;
	}

	#main .search {
		float: left;
		display: grid;
		grid-template-columns: 36px (100% - 30px);
		width: 34px;
		height: 34px;
		align-items: center;
	}

	#main :global(.tableWrapper .wtHolder) {
		overflow-y: auto;
		overflow-x: hidden;
	}

	#main :global(.tableWrapper .wtHider) {
		width: 100% !important;
	}

	#main :global(.tableWrapper .handsontable tr td:first-child) {
		font-size: 1.2rem;
	}
</style>
