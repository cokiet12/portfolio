<script>
	// @ts-nocheck
	//함수
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	// import { menuInfo } from '$lib/js/consts.mjs';
	import { devuimode, pageWidth, pageHeight } from '$lib/store.mjs';

	//네스티드
	import MenuBar from './menubar.svelte';

	onresize = () => {
		if (uidev) {
			sizes.vw = window.innerWidth;
			sizes.vh = window.innerHeight;
			// @ts-ignore
			pageWidth.set(elems.modal.scrollWidth);
			// @ts-ignore
			pageHeight.set(elems.modal.scrollHeight);
		}
	};
	onMount(async () => {
		sizes.vw = window.innerWidth;
		sizes.vh = window.innerHeight;
		if (localStorage.getItem('devuimode')) {
			devuimode.set(Number(localStorage.getItem('devuimode')));
			stats.devuimode = $devuimode;
		}
		if (localStorage.getItem('menuopen')) {
			stats.menuopen = Boolean(Number(localStorage.getItem('menuopen')));
		}
	});

	export let uidev = false;

	const consts = {
		uimodes: ['none', 'ui', 'single', 'dual']
	};
	let stats = {
		menuopen: true,
		uimode: 0,
		devuimode: 0
	};
	let elems = {
		modal: null
	};
	let sizes = {
		vw: 0,
		vh: 0
		// mw : 0,
		// mh : 0
	};
	// let pageName = new String();
	let pageName = new String();
	let pageNameKo = new String();

	$: if (stats.devuimode && uidev) {
		setTimeout(() => {
			devuimode.set(stats.devuimode);

			// @ts-ignore
			sizes.mw = elems.modal.scrollWidth;
			// @ts-ignore
			sizes.mh = elems.modal.scrollHeight;
			// @ts-ignore
			pageWidth.set(elems.modal.scrollWidth);
			// @ts-ignore
			pageHeight.set(elems.modal.scrollHeight);
		});
	}

	$: if ($page.url) {
		//페이지 열릴 때
		pageName = $page.url.pathname.replace(/\//g, '');
	}

	// @ts-ignore
	// $: pageNameKo = menuInfo[pageName];

	function uimodeSave() {
		localStorage.setItem('devuimode', String(stats.devuimode));
	}
	function menuopenSave() {
		localStorage.setItem('menuopen', String(Number(stats.menuopen)));
	}
</script>

{#if uidev}
	<uidevLayer
		class:ui={$devuimode == 1}
		class:single={$devuimode == 2}
		class:dual={$devuimode == 3}
	>
		<div class="header">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				on:click={() => {
					stats.menuopen = !stats.menuopen;
					menuopenSave();
				}}
			>
				<path
					fill-rule="evenodd"
					d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
					clip-rule="evenodd"
				/>
			</svg>
			<fieldset>
				<legend>view 사이즈</legend>
				{sizes.vw} x {sizes.vh}
			</fieldset>
			<fieldset>
				<legend>modal 사이즈</legend>
				{$pageWidth} x {$pageHeight}
			</fieldset>
			<fieldset>
				<legend>UI모드</legend>
				<label>
					<input
						type="radio"
						name="uimode"
						value={1}
						bind:group={stats.devuimode}
						on:change={uimodeSave}
					/>창
				</label>
				<label>
					<input
						type="radio"
						name="uimode"
						value={2}
						bind:group={stats.devuimode}
						on:change={uimodeSave}
					/>싱글
				</label>
				<label>
					<input
						type="radio"
						name="uimode"
						value={3}
						bind:group={stats.devuimode}
						on:change={uimodeSave}
					/>듀얼
				</label>
			</fieldset>
		</div>
		<div class="body" class:menuopen={stats.menuopen}>
			<div class="menu">
				<MenuBar />
			</div>
			<div class="content">
				<div class="path"><span>대메뉴 / </span><b>메뉴</b></div>
				<div class="page">
					<div class="singleSide" class:dn={stats.devuimode != 2}>
						<img src="/leftside_mock.png" alt="no image" />
					</div>
					<div class="single" bind:this={elems.modal}>
						<div class="title">
							{pageNameKo}
						</div>
						<slot />
						<!-- <div bind:this={elems.page}></div> -->
					</div>
					<div class="dual">
						<div class="title">
							{pageNameKo}
						</div>
						<slot />
					</div>
				</div>
			</div>
		</div>
	</uidevLayer>
{/if}

<style>
	.dn {
		display: none;
	}
	uidevLayer {
		--header-height: 55px;

		position: absolute;
		z-index: 3;
		background-color: #eaeff3;
		width: 100vw;
		height: 100vh;
	}
	uidevLayer .header {
		width: 100%;
		height: var(--header-height);
		background-color: white;
		background-image: url('/upper_mock.png');
		background-repeat: no-repeat;
		outline: 1px solid #e4e4e4;

		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}
	uidevLayer .header svg {
		background: white;
		width: 30px;
		padding: 7px;
		margin: 5px 2px;
		cursor: pointer;
	}
	uidevLayer .header fieldset {
		text-align: center;
		height: 35px;
		padding: 2px 21px;
		margin: 5px 7px;
		float: right;
		display: inline;
	}
	uidevLayer .body {
		--body-padding: 3px;
		--menu-width: 0px;

		width: 100%;
		height: calc(100% - var(--header-height));
		padding: var(--body-padding);
	}
	uidevLayer .body.menuopen {
		--menu-width: 219px;
	}
	uidevLayer .menu {
		width: var(--menu-width);
		height: calc(100% - (var(--body-padding) * 2));
		overflow: hidden;

		float: left;
		background-color: white;
		box-shadow: 0px 0px 3px #0000000d;
		border-radius: 8px;
		padding-top: 7px;

		transition: width 0.05s;
	}
	uidevLayer .content {
		--cont-padding: 11px;

		width: calc(100% - var(--menu-width) - (var(--cont-padding) * 2));
		height: calc(100% - (var(--cont-padding) * 2));
		padding: var(--cont-padding);

		float: right;
	}
	uidevLayer .content .path {
		width: 100%;
		height: 22px;
		padding-left: 15px;
		margin-bottom: var(--cont-padding);

		line-height: 22px;
		font-size: 1.4rem;
		color: #999999;
		max-height: calc(100% - 37px);
	}
	/* ui모드별 설정 */
	uidevLayer .content .page {
		gap: 9px;
		display: grid;
		/* overflow: auto; */
	}
	uidevLayer .content .page > div {
		background-color: white;
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #dbe2e6;
		border-radius: 4px;
		overflow: auto;
		grid-template-rows: 1fr;
		/* max-height: calc(100% - 37px); */
	}
	uidevLayer .content .page .singleSide {
		overflow: auto;
	}
	uidevLayer .content .page .singleSide img {
		display: block;
		margin: 9px auto;
		width: 375px;
	}
	uidevLayer .content .page .dual {
		background-color: white;
		display: none;
	}
	uidevLayer .content .page :is(.single, .dual) .title {
		height: 72px;
		line-height: 72px;
		font-size: 1.4rem;
		color: #777777;
		padding-left: 17px;
		border-bottom: 1px solid #dbe2e6;
	}

	/* 창 모드 */
	uidevLayer.ui .content .page {
		grid-template-columns: 1fr;

		display: inline-block;
	}
	uidevLayer.ui .content .page .single {
		/* resize: both; */
		min-width: 300px;
		min-height: 210px;
		max-width: 1280px;
		max-height: 890px;
	}
	uidevLayer.ui .content .page .single .title {
		height: 50px;
		line-height: 50px;

		border-bottom: 1px solid #ccc;
	}

	/* 싱글 모드 */
	uidevLayer.single .content .page {
		grid-template-columns: 400px 1fr;
	}

	/* 듀얼 모드 */
	uidevLayer.dual .content .page {
		grid-template-columns: 1fr 1fr;
	}
	uidevLayer.dual .content .page .dual {
		display: block;
	}
</style>
