<svelte:options accessors />

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
	import Select from '$lib/nested/dropdown.svelte';

	// export let tglcno = 0;
	// export let modalmode = false;
	export let winMode = false;

	const consts = {};
	let stats = {};
	let elems = {};

	let option1 = [
		{ id: 1, text: '2010년' },
		{ id: 2, text: '2004년' }
	];

	let option2 = [
		{ id: 1, text: '코스텍' },
		{ id: 2, text: '서돌전자' },
		{ id: 3, text: '진우' }
	];

	let option3 = [
		{ id: 1, text: '음향신호기' },
		{ id: 2, text: '압버튼' },
		{ id: 3, text: 'UPS' },
		{ id: 4, text: '기타' }
	];

	onMount(() => {});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="Title">
			<Searcher />
			<div />
			<Button icon="save2db" colored={true}>저장</Button>
		</div>

		<div class="FirstDiv">
			<div class="Control">
				<div class="Ftitle">신호제어기</div>
				<div class="content">
					<div class="Child">
						<div class="stitle">표준규격</div>
						<div />
						<Select option={option1} selected={1} />
					</div>
					<div />
					<div class="Child">
						<div class="stitle">모델명</div>
						<div />
						<Select option={option2} selected={1} />
					</div>
					<div />
					<div class="Child">
						<div class="stitle">설치일시</div>
						<div />
						<Input width="calc(100% - 2px)" type="text" placeholder="2022-07-08" />
					</div>
				</div>
			</div>
			<div class="Fc">
				<div class="Box">
					<div class="Control2">
						<div class="Ftitle">음향신호</div>
						<div class="content">
							<div class="Child">
								<div class="stitle">수량</div>
								<div />
								<Input width="calc(100% - 2px)" type="text" placeholder="수량" />
							</div>
							<div />
							<div class="Child">
								<div class="stitle">모델</div>
								<div />
								<Select option={option3} selected={1} />
							</div>
							<div />
							<div class="Child">
								<div class="stitle">설치일시</div>
								<div />
								<Input width="calc(100% - 2px)" type="text" placeholder="2022-07-08" />
							</div>
						</div>
					</div>
				</div>
				<div style="height:8px;" />
				<div class="Box">
					<div class="Control2">
						<div class="Ftitle">압버튼</div>
						<div class="content">
							<div class="Child">
								<div class="stitle">수량</div>
								<div />
								<Input width="calc(100% - 2px)" type="text" placeholder="수량" />
							</div>
							<div />
							<div class="Child">
								<div class="stitle">모델</div>
								<div />
								<Select option={option3} selected={2} />
							</div>
							<div />
							<div class="Child">
								<div class="stitle">설치일시</div>
								<div />
								<Input width="calc(100% - 2px)" type="text" placeholder="2022-07-08" />
							</div>
						</div>
					</div>
				</div>
				<div style="height:8px;" />
				<div class="Box">
					<div class="Control2">
						<div class="Ftitle">UPS</div>
						<div class="content">
							<div class="Child">
								<div class="stitle">수량</div>
								<div />
								<Input width="calc(100% - 2px)" type="text" placeholder="수량" />
							</div>
							<div />
							<div class="Child">
								<div class="stitle">모델</div>
								<div />
								<Select option={option3} selected={3} />
							</div>
							<div />
							<div class="Child">
								<div class="stitle">설치일시</div>
								<div />
								<Input width="calc(100% - 2px)" type="text" placeholder="2022-07-08" />
							</div>
						</div>
					</div>
				</div>
				<div style="height:8px;" />
				<div class="Box">
					<div class="Control2">
						<div class="Ftitle">기타</div>
						<div class="content">
							<div class="Child">
								<div class="stitle">수량</div>
								<div />
								<Input width="calc(100% - 2px)" type="text" placeholder="수량" />
							</div>
							<div />
							<div class="Child">
								<div class="stitle">모델</div>
								<div />
								<Select option={option3} selected={4} />
							</div>
							<div />
							<div class="Child">
								<div class="stitle">설치일시</div>
								<div />
								<Input width="calc(100% - 2px)" type="text" placeholder="2022-07-08" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="SecondDiv">
			<div class="ImageDiv">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<div class="ImageTag">
					<label
						>&nbsp;신호제어기
						<div class="Image">
							<img src={'/svg/image.svg'} alt="" />
							<div>사진을 선택하세요</div>
						</div>
					</label>
				</div>

				<div />
				<div class="ImageTag">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label
						>&nbsp;Sub
						<div class="Image">
							<img src={'/svg/image.svg'} alt="" />
							<div>사진을 선택하세요</div>
						</div>
					</label>
				</div>
			</div>
			<div class="ImageDiv">
				<div class="ImageTag">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label
						>&nbsp;음향신호사진
						<div class="Image">
							<img src={'/svg/image.svg'} alt="" />
							<div>사진을 선택하세요</div>
						</div>
					</label>
				</div>
				<div />
				<div class="ImageTag">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label
						>&nbsp;Sub
						<div class="Image">
							<img src={'/svg/image.svg'} alt="" />
							<div>사진을 선택하세요</div>
						</div>
					</label>
				</div>
			</div>
			<div class="ImageDiv">
				<div class="ImageTag">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label
						>&nbsp;압버튼사진
						<div class="Image">
							<img src={'/svg/image.svg'} alt="" />
							<div>사진을 선택하세요</div>
						</div>
					</label>
				</div>
				<div />
				<div class="ImageTag">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label
						>&nbsp;Sub
						<div class="Image">
							<img src={'/svg/image.svg'} alt="" />
							<div>사진을 선택하세요</div>
						</div>
					</label>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	#main {
		min-width: 640px;
		min-height: 609px;
		padding: 15px;
		/* min-width: 800px; */
		/* min-height: 785px; */
		background-color: #f9fafb;
		overflow: auto;
		font-size: 1.3rem;
	}

	.EntireDiv {
		height: calc(100% - 32px);
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #dbe2e6;
		border-radius: 6px;
		background-color: #fff;
		padding: 15px;
	}

	#main.win {
		width: 672px;
		height: 641px;
	}

	label {
		color: #777777;
	}

	img {
		width: 50%;
		height: 50%;
	}

	.Title {
		display: grid;
		grid-template-columns: 40% 47% 13%;
		width: 100%;
		height: 42.64px;
	}

	.FirstDiv {
		display: grid;
		grid-template-rows: 114.85px calc(100% - 114.85px);
		float: left;
		width: 49%;
		height: 93%;
		overflow: auto;
	}

	.Control {
		display: grid;
		grid-template-columns: 25% 75%;
		margin-bottom: 8px;
	}

	.Control2 {
		height: 100%;
		display: grid;
		grid-template-columns: 25% 75%;
	}

	.Ftitle {
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px solid #dadde1;
		border-radius: 4px;
		color: #777777;
	}

	.content {
		display: grid;
		grid-template-rows: 32.5% 1.25% 32.5% 1.25% 32.5%;
	}

	.Child {
		display: grid;
		grid-template-columns: 29% 2px calc(71% - 2px);
	}

	.stitle {
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px solid #dadde1;
		border-radius: 4px;
		margin-left: 2px;
		color: #777777;
	}

	.Fc {
		overflow: auto;
	}

	.Box {
		height: 106.85px;
	}

	.SecondDiv {
		display: grid;
		grid-template-rows: 33.3% 33.3% 33.3%;
		float: right;
		width: calc(51% - 8px);
		height: 566.36px;
	}

	.ImageDiv {
		display: grid;
		grid-template-columns: calc(50% - 2px) 4px calc(50% - 2px);
		padding: 0px 4px 0px 4px;
	}
	.Image {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border: 1px dashed #dadde1;
		border-radius: 4px;
		height: 169px;
	}
</style>
