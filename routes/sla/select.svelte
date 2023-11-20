<script>
	export let opts = [];
	export let value = '0';
</script>

<select bind:value>
	{#each opts as opt, i}
		<option value={i}>{opt}</option>
	{/each}
</select>

<style>
	select {
		width: 100%;
		color: #999999;
		border-radius: 4px;
		border: 1px solid #465362;
		background-color: #2e3843;
		font-size: 1.3rem;
	}
</style>
