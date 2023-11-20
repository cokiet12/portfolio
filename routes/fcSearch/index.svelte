<svelte:options accessors />

<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { devuimode } from '$lib/store.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';

	// export let tglcno = 0;
	// export let modalmode = false;
	export let winMode = false;

	const consts = {};
	let stats = {
		checked1: null,
		checked2: null,
		checked3: null,
		checked4: true,
		checked5: null
	};
	let elems = {
		table: null
	};

	let table;

	let data = new Array();
	for (let i = 0; i < 16; i++) {
		let temp = ['-', '2022-06-06', '-', '-'];
		data.push(temp);
	}
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="searchTap">
			<div class="Box">교차로</div>
			<div />
			<Searcher width="100%" />
		</div>
		<div class="optionTap">
			<div class="Box">시설물</div>
			<div />
			<div class="option">
				<Input type="checkbox1" bind:checked={stats.checked1}>신호제어기</Input>
				<Input type="checkbox1" bind:checked={stats.checked2}>음향신호기</Input>
				<Input type="checkbox1" bind:checked={stats.checked3}>압버튼</Input>
				<Input type="checkbox1" bind:checked={stats.checked4}>전체</Input>
			</div>
			<div />
			<Button icon="search" colored={true}>조회</Button>
		</div>
		<div class="content">
			<Table
				bind:wrapper={elems.table}
				bind:table
				colheader={['모델명', '설치일시', '상태', '사진']}
				{data}
				option={{
					renderer: 'html',
					rowHeaders: false,
					readOnly: true,
					rowHeights: 27,
					height: '459px'
				}}
			/>
		</div>
	</div>
</div>

<style>
	#main {
		min-width: 580px;
		min-height: 550px;
		font-size: 1.3rem;
		background-color: #f9fafb;
		padding: 15px;
		overflow: auto;
	}

	.EntireDiv {
		height: calc(100% - 32px);
		display: grid;
		grid-template-rows: 8% 8% 84%;
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #dbe2e6;
		border-radius: 6px;
		background-color: #fff;
		padding: 15px;
	}

	#main.win {
		width: 612px;
		height: 582px;
	}

	.searchTap {
		display: grid;
		grid-template-columns: 17% 10px 37% calc(46% - 10px);
		align-items: center;
	}

	.optionTap {
		display: grid;
		grid-template-columns: 17% 1px 63% 7% calc(13% - 1px);
		align-items: center;
	}

	.option {
		margin-top: 3px;
	}

	.Box {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 32px;
		border: 1px solid #dadde1;
		font-size: 1.3rem;
		border-radius: 4px;
	}

	.content {
		overflow: auto;
		margin-top: 3px;
	}

	.content :global(.tableWrapper .wtHolder) {
		overflow-y: auto;
	}
</style>
