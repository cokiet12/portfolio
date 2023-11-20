<script>
	import Window from '$lib/nested/window/window.svelte';
	import { menuInfo } from '$lib/js/consts.mjs';
	import { getThisId } from '$lib/js/functions.mjs';
	import { onMount } from 'svelte';
	import _ from 'lodash';

	let winArr = new Array();
	let childWins = new Object();
	let winCnt = -1;
	let winLimit = 10;

	// export const createWindow = function (url, e) {
	onMount(() => {
		// @ts-ignore
		document.winFocus = function (self) {
			winArr.forEach((v) => {
				//self 제외한 창 active 해제
				if (v.self != self) {
					v.self.$set({
						isActive: false
					});
				} else {
					v.self.$set({
						isActive: true
					});
				}
			});
		};
		document.createWindow = function (url, parent = false, e, params = null) {
			if (winArr.length < winLimit) {
				let isParent = false;
				if (typeof parent == 'number') {
					if (childWins[parent]) {
						//자식중복시
						document.createMsg('자식창이 이미 존재합니다', 1);
						document.winFocus(childWins[parent]);
						return;
					} else {
						isParent = true;
					}
				}
				let pageNameKo = Object.keys(menuInfo).find((key) => menuInfo[key].file == url);
				let winInfo = menuInfo[pageNameKo];
				let already = winArr.find((el) => el.title == url);
				if (!winInfo.multi && already) {
					document.createMsg('다중으로 띄울 수 없는 창입니다', 2);
					already.self.sign();
					document.winFocus(already.self);
					return;
				}
				let x = e.type == 'click' ? 270 + (winArr.length % 10) * 40 : e.x;
				let y = e.type == 'click' ? 120 + (winArr.length % 10) * 40 : e.y;
				// let x = e.type=='click'? e.x * 0.7 + 200 : e.x;
				// let y = e.type=='click'? e.y / 3 + 50 : e.y;
				let self = new Window({
					// @ts-ignore
					target: elems.uiLayer,
					// @ts-ignore
					props: {
						params: params,
						url: url,
						x: x,
						y: y,
						id: winCnt < 1079 ? ++winCnt : ++winCnt - 1080,
						pageNameKo: pageNameKo
					}
				});
				if (isParent) childWins[parent] = self;

				self.$on('mnt', (e) => {
					let id = e.detail.id;
					winArr.push({
						self: self,
						title: url,
						id: id
					});
					self.$set({
						isActive: true
					});

					document.setMenu(winArr);
				});
				self.$on('active', () => {
					document.winFocus(self);
					document.menuactive(url);
				});
				self.$on('destroy', (e) => {
					let id = e.detail.id;
					winArr.splice(winArr.indexOf(winArr.find((el) => el.self == self)), 1);
					if (childWins[id]) {
						//자식창 삭제
						let child = childWins[id];
						child.$destroy();
						winArr.splice(winArr.indexOf(winArr.find((el) => el.self == child)), 1);
						delete childWins[id];
					} else if (Object.values(childWins).indexOf(self) != -1) {
						//내가 자식인 경우
						delete childWins[_.findKey(childWins, self)];
					}
					self.$destroy();
					// console.log(winArr)
					// console.log(childWins)

					document.setMenu(winArr);
				});
				return self;
			} else {
				// @ts-ignore
				document.createMsg('창이 너무 많습니다', 1);
			}
		};
	});

	let elems = {
		uiLayer: null
	};
</script>

<uiLayer bind:this={elems.uiLayer} />

<style>
	uiLayer {
		/*background-color: #0f9d58;*/
		top: 0;
		left: 0;
		pointer-events: none;
		position: absolute;
		z-index: 2;
		width: 100vw;
		height: 100vh;
	}
</style>
