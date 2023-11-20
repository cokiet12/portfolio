<script>
	export let flows = new Array();
	const colors = ['#DA21EA', '#0A82FF', '#01C701', '#F81239'];
</script>

<square>
	<svg width="100" height="100" viewBox="0 0 100 100" fill="red">
		<g stroke="#43464a" stroke-width="20">
			<path d="M50 0 V100" />
			<path d="M0 50 H100" />
		</g>
		{#each flows as fl}
			<g transform="rotate({fl.dir * 90} 50 50)" color={colors[fl.dir]}>
				<path
					fill="none"
					d="M40 0 {fl.left == true ? 'V35 L65 60 H80' : 'V80'}"
					stroke="currentColor"
					stroke-width="7"
				/>
				<path
					fill="currentColor"
					stroke="none"
					d={fl.left == true ? 'M70 45 V75 L90 60 Z' : 'M25 70 H55 L40 90 Z'}
				/>
			</g>
		{/each}
	</svg>
</square>

<style>
	square {
		position: relative;
		width: 100%;
	}

	svg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
	}
</style>
