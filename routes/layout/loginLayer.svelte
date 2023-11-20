<script>
	import { onMount } from 'svelte';
	import { loadList, userId, userLev, userName, userJson, settings } from '$lib/store.mjs';
	import * as UI from '$lib/user_info.mjs';
	import { blur } from 'svelte/transition';
	import { ajax, asy } from '/src/lib/js/functions.mjs';
	import { getStores } from '$app/stores';
	import Cookies from 'js-cookie';

	$: if ($userJson) {
		saveSession();
	}

	const userJsonStand = {
		curlcno: 0,
		curmainmap: 0,
		theme: 0,
		maptheme: 0,
		mapdiv: 0,
		fac: 15,
		menuopen: 0,
		chartopen: 0,
		mapmarker: 7,
		mapcenters: new Array(4).fill(settings.GIS.GIScenter)
	};

	let msgStat = {
		TO: null,
		isOpen: false,
		msg: '',
		lev: ['#EEEEEE', '#ffdd12', '#f4574b'],
		color: null,
		sessLoaded: false
	};

	let loading = true;

	let elems = {
		loginLayer: null,
		idInput: null,
		pwInput: null,
		submitBtn: null
	};
	let storeInit = false;

	function saveSession() {
		if (loading == false && $userLev) {
			let _userJson = JSON.stringify($userJson);
			let userInfo = {
				user_id: $userId,
				user_name: $userName,
				is_system_admin: $userLev,
				user_json: _userJson
			};
			userInfo = window.btoa(JSON.stringify(userInfo));
			sessionStorage.setItem('user', userInfo);
			Cookies.set('user', userInfo);

			return ajax('/ntcs_m_user/update', 'POST', {
				user_id: $userId,
				auth_lev: $userLev,
				user_json: _userJson.replaceAll('"', '\\"')
			});
		}
	}

	function logout() {
		saveSession().then((res) => {
			if (res.success) {
				console.log('user_json update');
			}

			sessionStorage.clear();
			Cookies.remove('user');
			$userLev = 0;
			$userId = 0;
			$userName = 'guest';
			$userJson = {};
		});
	}

	function submit() {
		ajax('/Auth/LoginNew', 'POST', {
			username: elems.idInput.value,
			password: elems.pwInput.value,
			macaddress: ''
		}).then((res) => {
			if (res.success == false) {
				document.createMsg('로그인에 실패하였습니다', 1);
			} else {
				sessionStorage.setItem('user', res.token);
				Cookies.set('user', res.token);
				sessionCheck();
			}
		});
	}

	function initStore(uj) {
		if (!uj.fac && !uj.mapmarker) {
			$userJson = userJsonStand;
			initStore($userJson);
			console.error('JSON parsing error2');
			return;
		}
		let fac2 = uj.fac.toString(2);
		fac2 = '0'.repeat(4 - fac2.length) + fac2;
		let marker2 = uj.mapmarker.toString(2);
		marker2 = '0'.repeat(3 - marker2.length) + marker2;

		UI.curlcno.set(uj.curlcno);
		UI.curMainMap.set(uj.curmainmap);

		UI.mapTheme.set(uj.maptheme);
		UI.themeMode.set(uj.theme);
		UI.mapDiv.set(uj.mapdiv);

		UI.menuOpen.set(uj.menuopen);
		UI.chartOpen.set(uj.chartopen);

		UI.mapCenters.set(uj.mapcenters);

		UI.showLC.set(Boolean(Number(fac2[0])));
		UI.showLoop.set(Boolean(Number(fac2[1])));
		UI.showSmart.set(Boolean(Number(fac2[2])));
		UI.showPush.set(Boolean(Number(fac2[3])));

		UI.globNameOff.set(Boolean(Number(marker2[0])));
		UI.globFlowOff.set(Boolean(Number(marker2[1])));
		UI.globGroupOff.set(Boolean(Number(marker2[2])));
	}

	function sessionCheck() {
		let userInfo =
			typeof sessionStorage != 'undefined' ? sessionStorage.getItem('user') : Cookies.get('user');
		if ($userName == 'guest' && userInfo) {
			userInfo = window.atob(userInfo);
			userInfo = userInfo.replaceAll('\\\\', '\\');
			console.log(userInfo);
			userInfo = JSON.parse(userInfo);
			$userLev = userInfo.is_system_admin;
			$userId = userInfo.user_id;
			$userName = userInfo.user_name;
			try {
				$userJson = JSON.parse(userInfo.user_json);
			} catch (err) {
				console.error('JSON parsing error', err);
				console.error(userInfo.user_json);
				$userJson = userJsonStand;
			}
			if (!storeInit) {
				storeInit = true;
				// console.log($userJson)

				asy(() => {
					initStore($userJson);
				});
			}
		} else if ($userName != 'guest' && !userInfo) {
			document.createMsg('세션 연결이 끊어졌습니다');
			logout();
		}
	}

	onMount(() => {
		document.initUserJson = function () {
			$userJson = userJsonStand;
			logout();
		};
		sessionCheck();
		setInterval(() => {
			sessionCheck();
		}, 15000);
		loading = false;
		document.logout = logout;
	});
</script>

{#if $userLev == 0}
	<loginLayer
		transition:blur={{ amount: 3, duration: 200 }}
		bind:this={elems.loginLayer}
		class:loading
		on:keydown={(e) => {
			if (e.code == 'Enter') {
				elems.submitBtn.classList.add('active');
			}
		}}
		on:keyup={(e) => {
			if (e.code == 'Enter') {
				elems.submitBtn.classList.remove('active');
				submit();
			}
		}}
	>
		<video muted autoplay loop preload="metadata">
			<source src="login_bg.mp4" type="video/mp4" />
			<strong>이 비디오 태그를 지원하지 않습니다</strong>
		</video>
		<div class="login">
			<div class="title"><img src="/svg/mainLogo.png" /><span>스마트 교차로</span></div>
			<span class="IDtag">ID</span>
			<input
				type="text"
				placeholder="로그인 ID를 입력해주세요."
				bind:this={elems.idInput}
				autofocus
			/>
			<span class="PWtag">Password</span>
			<input type="password" placeholder="비밀번호를 입력해주세요." bind:this={elems.pwInput} />
			<button on:click={submit} bind:this={elems.submitBtn}>로그인</button>
		</div>
	</loginLayer>
{/if}

<style>
	loginLayer {
		position: relative;
		background-color: #a0a0a2;
		position: absolute;
		z-index: 4;
		width: 100vw;
		height: 100vh;
	}
	loginLayer.loading {
		opacity: 0;
	}
	loginLayer video {
		filter: brightness(1.1) blur(9px) brightness(0.3);
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		min-width: 100%;
		min-height: 100%;
	}
	loginLayer .login {
		background-color: #181d23;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		border-radius: 20px;
		width: 380px;
		height: 500px;
	}
	loginLayer .login > :is(span, div, input, button) {
		box-sizing: border-box;
		position: absolute;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 304px;
		border-radius: 5px;
		border: none;
	}
	loginLayer .login > input::placeholder {
		color: #7ba2c5;
	}
	loginLayer .login > .title {
		top: 20%;
		height: 48px;
		font-weight: bold;
	}
	loginLayer .login > div img {
		vertical-align: middle;
		float: left;
		width: 44px;
	}
	loginLayer .login > div span {
		margin-left: 11px;
		font-size: 21px;
		line-height: 5rem;
		height: 100%;
		display: block;
		float: left;
		color: #a4b5cb;
	}
	loginLayer .login > .IDtag {
		top: 37.5%;
		color: #a4b5cb;
	}

	loginLayer .login > input[type='text'] {
		background-color: #212830;
		padding-left: 11px;
		top: 44%;
		height: 37px;
	}

	loginLayer .login > .PWtag {
		top: 53.5%;
		color: #a4b5cb;
	}
	loginLayer .login > input[type='password'] {
		background-color: #212830;
		padding-left: 11px;
		top: 60%;
		height: 37px;
	}
	loginLayer .login > input {
		color: white;
	}
	loginLayer .login > input:focus {
		background-color: #181d23;
		outline: 1px solid #0087ff;
	}
	loginLayer .login > button {
		background-color: #1475e8;
		color: white;
		font-size: 1.5rem;
		top: 77%;
		height: 45px;
	}
	loginLayer .login > button:is(:active, .active) {
		filter: brightness(0.7);
	}
</style>
