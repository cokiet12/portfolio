<svelte:options accessors />

<script>
	// @ts-nocheck

	/*
        innerHTML 초기화 해야함
        변수 설정
    */
	import { onMount } from 'svelte';
	import {
		devuimode,
		EventSize,
		EventHeight,
		EventTable1,
		EventTable2,
		EventTable3,
		EventTable4
	} from '$lib/store.mjs';
	import Searcher from '$lib/nested/searcher.svelte';
	import Tabs from '$lib/nested/tabs.svelte';
	import lcE from './lcEvent.svelte';
	import evr from './eventr.svelte';

	let tabHeight = '';
	export let winMode = false;
	export let params = null;
	export const onSize = function (width, height) {
		if (width > 1080 || width <= 962) {
			stats.responsive = 1;
			tabHeight = height - 158 + 'px';
			$EventSize = 1;
		} else {
			stats.responsive = 0;
			$EventSize = 0;
		}

		let ctx = items[tabValue - 1].tables.$$.ctx;
		let tables = ctx.filter((v) => typeof v == 'object' && v.hasOwnProperty('table1') == true);
		if (tables.length) {
			setTimeout(function () {
				Object.keys(tables[0]).forEach(function (k) {
					if (tables[0][k]) {
						if (tables[0][k].table) {
							tables[0][k].table.render();
							tables[0][k].table.refreshDimensions();
						}
					}
				});
			}, 100);
		}
	};
	const consts = {};
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

	let MouseEt;
	let tabValue = 1;

	let items = [
		{ label: '교차로 이벤트', value: 1, component: lcE, tables: null },
		// { label: "그룹 이벤트", value: 2, component: grE, tables: null },
		// { label: "검지기 이벤트", value: 3, component: tfE, tables: null },
		// { label: "운영자 이벤트", value: 2, component: mgE, tables: null },
		{ label: '실시간 이벤트', value: 2, component: evr, tables: null }
	];

	onMount(() => {
		if (params) {
			tabValue = params.tabVal;
		}

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
				$EventTable1 = 1;
			} else if (tabValue == 2) {
				$EventTable2 = 1;
			} else if (tabValue == 3) {
				$EventTable3 = 1;
			} else if (tabValue == 4) {
				$EventTable4 = 1;
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
				$EventTable1 = 2;
			} else if (tabValue == 2) {
				$EventTable2 = 2;
			} else if (tabValue == 3) {
				$EventTable3 = 2;
			} else if (tabValue == 4) {
				$EventTable4 = 2;
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
				$EventTable1 = 3;
			} else if (tabValue == 2) {
				$EventTable2 = 3;
			} else if (tabValue == 3) {
				$EventTable3 = 3;
			} else if (tabValue == 4) {
				$EventTable4 = 3;
			}
		});
	});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		{#if $devuimode < 2}
			<!-- 창모드 -->
		{:else}
			<!-- 싱글/듀얼모드 -->
		{/if}

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
		<div />
		<!-- {#if stats.responsive == 0} -->
		<Tabs
			bind:activeTabValue={tabValue}
			height={stats.responsive == 0 ? '500px' : tabHeight}
			{items}
			on:tabChange={(e) => {
				tabValue = e.detail.tabValue;
				if (tabValue == 5) {
					elems.tag.style = 'display:none;';
				} else {
					elems.tag.style = 'display: flex;';
				}
			}}
		/>
		<!-- {:else}
            <Tabs height={tabHeight} {items} on:tabChange={(e)=>{tabValue = e.detail.tabValue; 
                if(tabValue == 5) { elems.tag.style="display:none;" } else { elems.tag.style="display: flex;" }}}/>   
        {/if} -->
	</div>
</div>

<style>
	#main .search {
		grid-area: 1 / 1 / 2 / 2;
	}

	#main :global(.tabList) {
		/* grid-area: 1 / 2 / 2 / 3; */
	}

	#main :global(.tabPanel) {
		grid-column: span 3;
	}

	.ExcelBtn {
		display: grid;
		grid-template-rows: 1fr 1fr 1fr;
		position: absolute;
		background-color: #212830;
		margin-top: 47px;
		width: 100px;
		height: 80px;
		border-radius: 5px;
		z-index: 110;
	}

	.divbtn {
		/* line-height: 26.66px; */
		margin: auto;
		font-style: bold;
	}

	#main {
		/* MIN */
		min-width: 630px;
		min-height: 580px;

		/* ETC */
		font-size: 1.3rem;
		background-color: #000000;
		padding: 11px;
	}
	#main.win {
		width: 1080px;
		height: 580px;
	}
	.EntireDiv {
		height: calc(100% - 32px);
		display: grid;
		grid-template-columns: 1fr 2fr 1fr;
		grid-template-rows: auto;
		border-radius: 6px;
		background-color: #212830dd;
		padding: 15px;
	}

	.imgtag {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 34px;
		height: 32px;
		line-height: 34px;
		z-index: 20;
		text-align: center;
		border-radius: 5px;
		background-color: #000;
	}

	img {
		width: 20px;
		height: 20px;
	}

	#main .search {
		float: left;
		display: grid;
		grid-template-columns: 36px (100% - 30px);
		width: 30%;
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

	/* Handsontable */
	#main :global(.handsontable tr th) {
		color: #666;
		background: #181d23;
	}

	#main :global(.handsontable tr td) {
		color: #999999;
		background: #212830;
	}

	#main :global(input[type='datetime-local']) {
		height: calc(100% - 2px);
		border-radius: 4px;
		padding: 0 2px;
		font-size: 1.3rem;
		color: #fff;
		border: 1px solid #212830;
		background-color: #212830;
	}
</style>
