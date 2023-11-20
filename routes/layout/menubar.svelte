<script>
	// @ts-nocheck

	import { menuInfo } from '$lib/js/consts.mjs';
	import { onMount } from 'svelte';
	import { asy } from '/src/lib/js/functions.mjs';
	import { summaryOpen } from '$lib/user_info.mjs';
	import { userLev } from '$lib/store.mjs';
	import _ from 'lodash';

	let _winArr = new Object();

	onMount(() => {
		asy(() => {
			document.setMenu = function (winArr) {
				// asy(()=>{
				_winArr = winArr;
				Object.values(menuOrg).forEach((v) => {
					v.parentElement.classList.remove('note', 'active');
				}); //초기화
				let titles = winArr.map((el) => el.title);
				let groupBy = _.groupBy(titles);
				Object.keys(groupBy).forEach((v) => {
					// console.log(menuOrg)
					// console.log(v)
					if (menuOrg[v]) {
						const len = groupBy[v].length;
						menuOrg[v].textContent = len == 1 ? '-' : len;
						menuOrg[v].parentElement.classList.add('note');
					}
				});
				// })
			};
			document.menuactive = function (self) {
				asy(() => {
					Object.values(menuOrg).forEach((v) => {
						v.parentElement.classList.remove('active');
					}); //초기화
					menuOrg[self].parentElement.classList.add('active');
				});
			};
			const menuEl = document.querySelector('.body .menu');
			const menuEls = menuEl.querySelectorAll('div[draggable]');
			const menuOrg = new Object();

			menuEls.forEach((v) => {
				//초기 메뉴텍스트 구성
				let korName = v.children[0].textContent;
				menuOrg[findKeyInTitle2ko(korName)] = v.children[1];
			});
		});
	});

	function findKeyInTitle2ko(value) {
		return menuInfo[value].file;
	}

	function openWindow(e) {
		let name = findKeyInTitle2ko(this.children[0].textContent);
		if (e.type == 'dragstart') {
			e.dataTransfer.setData('text/plain', '!@' + name);
		} else if (e.type == 'click') {
			document.createWindow(name, false, e);
		}
	}

	function noteWins(e) {
		e.stopPropagation();
		let name = findKeyInTitle2ko(this.previousElementSibling.textContent);
		let filtered = _winArr.filter((el) => el.title == name);
		if (filtered.length == 1) {
			//1개인경우 표시후 포커싱
			let self = filtered[0].self;
			self.sign();
			document.winFocus(self);
			return;
		}
		filtered.forEach((v) => {
			//2개이상은 표시만
			v.self.sign();
		});
	}
</script>

<div
	class="high home"
	on:click={() => {
		if (_winArr.length) {
			document.createMsgWindow('modals/clearWin.svelte', '메시지', {
				winArr: [..._winArr]
			});
		}
	}}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		width="15"
		stroke="currentColor"
		class="w-6 h-6"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
		/>
	</svg>
	홈
</div>
<div class="high"><img src="/svg/pageIcon/titles/title1.svg" />교차로 정보</div>
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>실시간 모니터링</span>
	<div on:click={noteWins} />
</div>
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>교차로 기본정보</span>
	<div on:click={noteWins} />
</div>
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>교차로 TOD</span>
	<div on:click={noteWins} />
</div>
<div class="high"><img src="/svg/pageIcon/titles/title2.svg" />시스템 관리</div>
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>운영자 관리</span>
	<div on:click={noteWins} />
</div>
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>카메라 정보</span>
	<div on:click={noteWins} />
</div>
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>노드관리</span>
	<div on:click={noteWins} />
</div>
<div class="high"><img src="/svg/pageIcon/titles/title3.svg" />분석/통계</div>
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>교통량 데이터</span>
	<div on:click={noteWins} />
</div>
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>교차로 교통량 통계</span>
	<div on:click={noteWins} />
</div>
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>교차로 대기행렬</span>
	<div on:click={noteWins} />
</div>
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>교차로 첨두시간</span>
	<div on:click={noteWins} />
</div>
<!-- <div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>서비스 수준분석</span>
	<div on:click={noteWins} />
</div> -->
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>서비스 수준통계</span>
	<div on:click={noteWins} />
</div>
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>시공도</span>
	<div on:click={noteWins} />
</div>
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>교차로 TOD 생성</span>
	<div on:click={noteWins} />
</div>
<div class="high"><img src="/svg/pageIcon/titles/title4.svg" />이력조회</div>
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>신호운영 이력조회</span>
	<div on:click={noteWins} />
</div>
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>이벤트 이력조회</span>
	<div on:click={noteWins} />
</div>
<div draggable={true} on:dragstart={openWindow} on:click={openWindow}>
	<span>보고서</span>
	<div on:click={noteWins} />
</div>

<style>
	div {
		width: 100%;
		height: 35px;
		cursor: pointer;
		user-select: none;
	}
	div:global(.note) > div {
		display: block;
	}
	div:global(.active) {
		transition: background-color 0.2s;
		background-color: #1476e8;
		color: #ffffff !important;
	}
	div > span {
		height: 100%;
		line-height: 35px;
		float: left;
	}
	div > div {
		cursor: default;
		display: none;
		border-radius: 4px;
		margin: 8px 0 0 7px;
		/*font-weight: bolder;*/
		text-align: center;
		font-size: 1rem;
		line-height: 1.55rem;
		width: 1.5rem;
		height: 1.5rem;
		color: #999;
		border: 1px solid #bbb;
		float: left;
	}
	div > div:hover {
		color: #777;
		border: 1px solid #777;
	}
	/* div > div:global(.note) {
            display: block;
        } */
	div.high {
		cursor: default;
		font-size: 1.4rem;
		color: #a7a8aa;
		padding-left: 15px;
		line-height: 37px;
	}
	div.high > img {
		margin-right: 7px;
		width: 15px;
		height: 15px;
		vertical-align: text-bottom;
	}
	.home {
		cursor: pointer !important;
		background-color: #2f3e4f;
		font-weight: bold;
		color: #bbb !important;
		text-align: center;
		padding-left: 0 !important;
	}
	.home:hover {
		color: #237fd2 !important;
	}
	.home > svg {
		margin-right: 1px;
		width: 15px;
		height: 15px;
		vertical-align: text-bottom;
	}
	div:not(.high)[draggable] {
		font-size: 1.3rem;
		/*color: #819DB777;*/
		color: #777777;
		padding-left: 35px;
	}
	div:not(.high):hover[draggable] {
		/* background-color: #DEEEFD; */
		color: #237fd2;
	}
	div:not(.high):active[draggable] {
		background-color: #1476e8;
		color: #ffffff;
	}
</style>
