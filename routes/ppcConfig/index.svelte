<svelte:options accessors />

<script>
	// @ts-nocheck
	import { devuimode } from '$lib/store.mjs';
	import Button from '$lib/nested/button.svelte';
	import Input from '$lib/nested/input.svelte';

	export let winMode = false;
	export let params;

	const consts = {};
	let stats = {
		// 관리기관 코드
		radio1: 0,

		// 긴급차량 번호
		radio2: 0,

		// 버스번호
		radio3: 0,

		// 우선신호제어 요청
		radio4: 0,

		// 모든 관리기관 코드
		institute: false
	};
	let elems = {};
</script>

<div
	id="main"
	class={params == 2004 ? '_2004' : '_2010'}
	class:modal={winMode == false}
	class:win={winMode == true}
>
	<div class="EntireDiv">
		<div class="grid">
			<!-- PPC 제어 설정 -->
			<div class="config">
				<div class="subject">PPC 제어 설정</div>
				<div class="wrap">
					<div class="ppcConfig1 content">
						<div class="title">설정</div>
						<div class="tab">
							<div>
								<Input
									type="radio"
									radios={['관리기관 코드 등록', '관리기관 코드 삭제']}
									bind:checked={stats.radio1}
								/>
							</div>
							<div>
								<Input
									type="radio"
									radios={['긴급차량 번호 등록', '긴급차량 번호 삭제']}
									bind:checked={stats.radio2}
								/>
							</div>
							<div>
								<Input
									type="radio"
									radios={['버스번호 등록', '버스번호 삭제']}
									bind:checked={stats.radio3}
								/>
							</div>
						</div>
					</div>
				</div>
				<div class="wrap">
					<div class="ppcConfig2 content">
						<div class="title">관리기관 코드</div>
						<div class="tab">
							<div>
								<Button>긴급</Button>
							</div>
							<div>
								<Input type="text" width="170px" />
							</div>
							<div>
								<Input type="checkbox1" bind:checked={stats.institute}>모든 관리기관 코드</Input>
							</div>
						</div>
					</div>
					<div class="ppcConfig3 content">
						<div class="title">노선/차량번호 설정</div>
						<div class="tab">
							<div>
								<Input type="text" />
							</div>
							<div>
								<Input type="checkbox1" bind:checked={stats.institute}>모든 관리기관 코드</Input>
							</div>
						</div>
					</div>
				</div>
				<div class="btn">
					<Button>실행</Button>
				</div>
			</div>
			<!-- 우선신호제어 요청 -->
			<div class="request">
				<div class="subject">우선신호제어 요청</div>
				<div class="wrap">
					<div class="psRequest content">
						<div class="title">노선/차량번호 설정</div>
						<div class="tab">
							<div />
						</div>
					</div>
				</div>
				<div class="exe">
					<div>
						<Input
							type="radio"
							radios={['긴급차량 요청', '버스우선 요청']}
							bind:checked={stats.radio4}
						/>
					</div>
					<div class="btn">
						<Button>업로드</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* 메인 */
	#main {
		font-size: 1.3rem;
		background-color: #f9fafb;
		padding: 15px;
		/* 높이(가변) */
		max-height: 900px;
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 310px;
	}

	/* 싱글모드 (창모드 넓이 ~ MAX) */
	#main.modal {
		overflow: auto;
	}

	/* 카드 */
	.EntireDiv {
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #dbe2e6;
		border-radius: 6px;
		background-color: #fff;
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
		padding: 10px;
	}

	.EntireDiv .grid .wrap {
		border: 1px solid #86b5de;
		border-radius: 4px;
		padding: 10px;
	}

	.EntireDiv .grid .wrap .content {
		display: grid;
		grid-template-rows: 20px auto;
		grid-row-gap: 5px;
	}

	.EntireDiv .grid .subject {
		color: #666666;
	}

	.EntireDiv .grid .wrap .content .title {
		color: #666666;
	}

	.EntireDiv .grid .wrap .content .tab {
		padding-left: 10px;
	}

	.EntireDiv .grid .wrap .content .tab :global(label) {
		padding: 0;
	}

	.EntireDiv .grid .wrap .content .tab :global(label > div) {
		margin: 0 7px 0 0;
	}

	/* 카드 Grid */
	.EntireDiv .grid {
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: auto;
		grid-column-gap: 10px;
		grid-row-gap: 10px;
	}

	/* PPC 제어 설정 */
	.EntireDiv .grid .config {
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: auto;
		grid-column-gap: 10px;
		grid-row-gap: 10px;
	}

	.ppcConfig1 .tab {
		display: grid;
		grid-template-rows: 1fr 1fr 1fr;
		grid-row-gap: 10px;
		grid-column-gap: 10px;
		align-items: center;
	}

	.ppcConfig2 .tab {
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: auto;
		grid-row-gap: 10px;
		grid-column-gap: 10px;
		align-items: center;
	}

	.ppcConfig2 .tab div:nth-child(1) {
		grid-area: 1 / 1 / 2 / 2;
	}

	.ppcConfig2 .tab div:nth-child(2) {
		grid-area: 1 / 2 / 2 / 3;
	}

	.ppcConfig2 .tab div:nth-child(3) {
		grid-area: 2 / 1 / 3 / 3;
	}

	.ppcConfig3 .tab {
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: auto;
		grid-row-gap: 10px;
		grid-column-gap: 10px;
		align-items: center;
	}

	.EntireDiv .grid .config .btn {
		display: inline-flex;
		justify-content: flex-end;
		text-align: end;
	}

	/* 우선신호제어 요청 */
	.EntireDiv .grid .request {
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: auto;
		grid-column-gap: 10px;
		grid-row-gap: 10px;
	}

	.psRequest .tab div {
		height: 100px;
		border: 1px solid #dadde1;
		border-radius: 4px;
		background-color: white;
	}

	.EntireDiv .grid .request .exe {
		display: grid;
		grid-template-columns: auto 70px;
		grid-template-rows: auto;
		align-items: center;
	}
</style>
