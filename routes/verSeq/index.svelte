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
	let stats = {};
	let elems = {
		table: null
	};
	let table;

	let data = [
		['버전', '1', 'MAJOR VERSION'],
		['', '2', 'MINOR VERSION'],
		['', '3', 'MODULE VERSION'],
		['', '4', 'REV VERSION']
	];

	let mergeOption = [{ row: 0, col: 0, rowspan: 4, colspan: 1 }];
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<Table
		bind:wrapper={elems.table}
		bind:table
		colheader={['구분', '입력 순서', '상세']}
		{data}
		option={{
			height: '130px',
			colWidths: ['20px', '20px', '40px'],
			readOnly: true,
			mergeCells: mergeOption
		}}
	/>
</div>

<style>
	#main {
		display: grid;
		min-width: 260px;
		min-height: 130px;
		font-size: 1.3rem;
		background-color: #f9fafb;
		padding: 20px;
		overflow: auto;
	}

	#main.win {
		width: 250px;
		height: 130px;
	}
</style>
