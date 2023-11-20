<script>
	import Samp from './sample.svelte';
	import { onMount } from 'svelte';

	let tog = false;
	function click() {
		console.log(tog);
		tog = !tog;
	}
</script>

<button on:click={click}>버튼</button>
<h1>페이지 없음</h1>
<Samp />
<!-- {#if tog}
    
{/if} -->
