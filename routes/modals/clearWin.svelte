<script>
	import Button from '$lib/nested/button.svelte';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let params;
</script>

<div class="div">
	<div class="text">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="w-6 h-6"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
			/>
		</svg>
		열려있는 창을 <u>모두</u> 닫으시겠습니까?
	</div>
	<Button
		height="30px"
		colored={'red'}
		on:click={() => {
			params.winArr.forEach((v) => {
				v.self.destroy();
			});
			dispatch('destroy');
		}}>모든 창 닫기</Button
	>
	<Button
		height="30px"
		on:click={() => {
			params.winArr.forEach((v) => {
				v.self.minimize();
			});
			dispatch('destroy');
		}}>모든 창 최소화</Button
	>
	<Button
		height="30px"
		on:click={() => {
			dispatch('destroy');
		}}>취소</Button
	>
</div>

<style>
	.div {
		border-radius: 10px;
		background-color: #212830dd;
		box-sizing: border-box;
		margin: 9px;
		padding: 55px 9px 9px 9px;
		column-gap: 15px;
		row-gap: 45px;
		/* width: 100%; */
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
	}
	.text {
		text-align: center;
		font-size: 1.3rem;
		grid-column: span 3;
	}
	.text u {
		color: #bbb;
	}
	.text svg {
		width: 19px;
		color: rgb(255, 208, 0);
		vertical-align: middle;
		margin-bottom: 3px;
	}
</style>
