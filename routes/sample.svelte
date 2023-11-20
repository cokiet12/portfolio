<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { devuimode } from '$lib/store.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';
	import Legend from '$lib/nested/legend.svelte';
	import Tree from '$lib/nested/tree/App.svelte';
	import TSC from '$lib/nested/timeSpaceChart/tsc.svelte';

	// export let tglcno = 0;
	// export let modalmode = false;

	const consts = {};
	let val = 0;
	// $: console.log(val)
	let stats = {
		checked1: false,
		checked2: false,
		radio: 0,
		treeChecked: [],
		searcherVal: null
	};
	let elems = {
		table1: null,
		table2: null,
		table3: null
	};

	let table1;
	let table2;
	let table3;

	onMount(() => {
		// let but = new Button({
		//     target: document.querySelector('#main')
		// })
		// but.$set({icon:'upload'})
		// console.log(but)
		// console.log(elems.table1)
		// console.log(table1)
		// console.log(elems.table2)
		// console.log(table2)
	});
</script>

<div id="main" class:modal={$devuimode > 1} class:win={$devuimode < 2}>
	{#if $devuimode < 2}
		창모드<br />
	{:else}
		싱글/듀얼모드<br />
	{/if}

	<Button
		colored="red"
		icon="download"
		on:click={() => {
			val = 1;
		}}>다운로드</Button
	>
	<Button
		colored="blue"
		icon="upload"
		on:click={() => {
			val = 2;
		}}>업로드</Button
	>
	<Button
		on:click={() => {
			stats.treeChecked.checkAll();
		}}
		colored={true}>버튼</Button
	>
	<Button
		on:click={() => {
			console.log(stats.treeChecked);
		}}>버튼</Button
	>

	<TSC />

	<Searcher
		width={'240px'}
		bind:value={stats.searcherVal}
		onChoose={(val) => {
			console.log(val);
		}}
		onlyGroup={true}
	/>

	<Legend legend="레전드1" color="#86B5DE">
		<Input type="text" placeholder="남" />
		<Input type="number" placeholder="재규" value={0} />
		<Input type="checkbox1" bind:checked={stats.checked1}>체크박스</Input>
		<Input type="checkbox2" bind:checked={stats.checked2} />
	</Legend>
	<Legend legend="레전드2">
		<Input
			type="radio"
			radios={['가', '나', '다', '라', '마', '바', '사']}
			bind:checked={stats.radio}
		/>
	</Legend>

	<Tree
		tree={{
			label: 'ROOT',
			children: [
				{
					label: 'node A',
					children: [
						{
							label: 'node Aa',
							val: 'Aa'
						},
						{
							label: 'node Ab'
						}
					]
				},
				{
					label: 'node B',
					children: []
				},
				{
					label: 'node C',
					children: []
				},
				{
					label: 'node D',
					children: []
				}
			]
		}}
		width={'170px'}
		height={'150px'}
		preChecked={['Aa']}
		multiple={true}
		bind:checked={stats.treeChecked}
		onselect={(tree) => {
			console.log(tree.val || tree.label);
		}}
	/>

	<Table
		bind:wrapper={elems.table1}
		bind:table={table1}
		height="150px"
		colheader={['1', '2', '3', '4', '5', '6']}
		data={[
			['aa', 'bb', 'cc', 'dd', 'ee', 'ff'],
			['ff', 'ee', 'dd', 'cc', 'bb', 'aa'],
			['aa', 'bb', 'cc', 'dd', 'ee', 'ff']
		]}
	/>

	<Table
		bind:wrapper={elems.table2}
		bind:table={table2}
		rowheader={['1', '2', '3']}
		data={[
			['aa', 'bb', 'cc', 'dd', 'ee', 'ff'],
			['ff', 'ee', 'dd', 'cc', 'bb', 'aa'],
			['aa', 'bb', 'cc', 'dd', 'ee', 'ff']
		]}
		readOnly={true}
	/>

	<Table
		bind:wrapper={elems.table3}
		bind:table={table3}
		data={[
			['ff', 'ee', 'dd', 'cc', 'bb', 'aa', '1', '2', '3', '4'],
			['aa', 'bb', 'cc', 'dd', 'ee', 'ff', '1', '2', '3', '4'],
			['ff', 'ee', 'dd', 'cc', 'bb', 'aa', '1', '2', '3', '4'],
			['aa', 'bb', 'cc', '<b>dd</b>', 'ee', 'ff', '1', '2', '3', '4'],
			['ff', 'ee', 'dd', 'cc', 'bb', 'aa', '1', '2', '3', '4'],
			['aa', 'bb', 'cc', 'dd', 'ee', 'ff', '1', '2', '3', '4'],
			['ff', 'ee', 'dd', 'cc', 'bb', 'aa', '1', '2', '3', '4'],
			['aa', 'bb', 'cc', 'dd', 'ee', 'ff', '1', '2', '3', '4']
		]}
		option={{
			renderer: 'html',
			nestedHeaders: [
				[{ label: '현시 구성 정보', colspan: 11 }],
				[{ label: '구분', colspan: 2 }, '1', '2', '3', '4', '5', '6', '7', '8']
			],
			mergeCells: [
				{ row: 0, col: 0, rowspan: 4, colspan: 1 },
				{ row: 0, col: 1, rowspan: 2, colspan: 1 },
				{ row: 2, col: 1, rowspan: 2, colspan: 1 },
				{ row: 4, col: 0, rowspan: 2, colspan: 1 },
				{ row: 6, col: 0, rowspan: 2, colspan: 1 }
				// {row: 8, col: 0, rowspan: 2, colspan: 1}
			],
			renderAllRows: false
		}}
	/>
</div>

<style>
	#main {
		width: 100%;
		min-width: 480px;
		min-height: 650px;
		/* min-width: 800px; */
		/* min-height: 785px; */
		font-size: 1.2rem;
	}
	#main.win {
		width: 480px;
		height: 650px;
	}
</style>
