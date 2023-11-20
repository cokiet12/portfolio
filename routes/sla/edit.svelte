<script>
	import { onMount } from 'svelte';
	import Table from '$lib/nested/table.svelte';
	import Select from './select.svelte';
	import Button from '$lib/nested/button.svelte';
	import Input from '$lib/nested/input.svelte';
	import Flow from './flow.svelte';

	export let stats = {};
</script>

<wrapper class="newScrollBar">
	<div class="container1">
		<div />
		<div class="title red">EB(→)</div>
		<div class="title blue">WB(←)</div>
		<div class="title green">NB(↑)</div>
		<div class="title pink">SB(↓)</div>
		<div />
		<div class="title red">LT&emsp;TH&emsp;RT</div>
		<div class="title blue">LT&emsp;TH&emsp;RT</div>
		<div class="title green">LT&emsp;TH&emsp;RT</div>
		<div class="title pink">LT&emsp;TH&emsp;RT</div>
		<div class="row">일반교통량(vph)</div>
		<div class="split3">
			<input type="text" value="490" />
			<input type="text" value="1700" />
			<input type="text" value="200" />
		</div>
		<div class="split3">
			<input type="text" value="490" />
			<input type="text" value="1700" />
			<input type="text" value="200" />
		</div>
		<div class="split3">
			<input type="text" value="490" />
			<input type="text" value="1700" />
			<input type="text" value="200" />
		</div>
		<div class="split3">
			<input type="text" value="490" />
			<input type="text" value="1700" />
			<input type="text" value="200" />
		</div>
		<div class="row">중앙버스 교통량(vph)</div>
		<div class="split3">
			<input type="text" value="-" />
			<input type="text" value="-" />
		</div>
		<div class="split3">
			<input type="text" value="-" />
			<input type="text" value="-" />
		</div>
		<div class="split3">
			<input type="text" value="-" />
			<input type="text" value="-" />
		</div>
		<div class="split3">
			<input type="text" value="-" />
			<input type="text" value="-" />
		</div>
		<div class="row spanrow multiline">
			일반차로 수, 차로수<br />(전용좌, 중앙버스<br />전차로 제외)
		</div>
		<div class="split3">
			<input type="text" value="2" />
			<input type="text" value="4" />
			<input type="text" value="1" />
		</div>
		<div class="split3">
			<input type="text" value="2" />
			<input type="text" value="4" />
			<input type="text" value="1" />
		</div>
		<div class="split3">
			<input type="text" value="2" />
			<input type="text" value="4" />
			<input type="text" value="1" />
		</div>
		<div class="split3">
			<input type="text" value="2" />
			<input type="text" value="4" />
			<input type="text" value="1" />
		</div>
		<div class="split1">
			<input type="text" value="4" />
		</div>
		<div class="split1">
			<input type="text" value="4" />
		</div>
		<div class="split1">
			<input type="text" value="5" />
		</div>
		<div class="split1">
			<input type="text" value="5" />
		</div>
		<div class="row">중앙버스 차로수</div>
		<div class="split3">
			<input type="text" value="-" />
			<input type="text" value="-" />
		</div>
		<div class="split3">
			<input type="text" value="-" />
			<input type="text" value="-" />
		</div>
		<div class="split3">
			<input type="text" value="-" />
			<input type="text" value="-" />
		</div>
		<div class="split3">
			<input type="text" value="-" />
			<input type="text" value="-" />
		</div>
		<div class="row multiline">중앙버스 차로수<br />(좌회전차로 제외)</div>
		<div class="split1">
			<input type="text" value="-" />
		</div>
		<div class="split1">
			<input type="text" value="-" />
		</div>
		<div class="split1">
			<input type="text" value="-" />
		</div>
		<div class="split1">
			<input type="text" value="-" />
		</div>
		<div class="row">초기 대기 차량대수</div>
		<div class="split3">
			<input type="text" value="0" />
			<input type="text" value="0" />
			<input type="text" value="0" />
		</div>
		<div class="split3">
			<input type="text" value="0" />
			<input type="text" value="0" />
			<input type="text" value="0" />
		</div>
		<div class="split3">
			<input type="text" value="0" />
			<input type="text" value="0" />
			<input type="text" value="0" />
		</div>
		<div class="split3">
			<input type="text" value="0" />
			<input type="text" value="0" />
			<input type="text" value="0" />
		</div>
		<div class="row">신호운영</div>
		<div class="split1">
			<Select opts={['일방보호좌회전', '전용좌회전', '도류화된공용차로']} value={0} />
		</div>
		<div class="split1">
			<Select opts={['일방보호좌회전', '전용좌회전', '도류화된공용차로']} value={0} />
		</div>
		<div class="split1">
			<Select opts={['일방보호좌회전', '전용좌회전', '도류화된공용차로']} value={0} />
		</div>
		<div class="split1">
			<Select opts={['일방보호좌회전', '전용좌회전', '도류화된공용차로']} value={0} />
		</div>
		<div class="row">좌회전형태</div>
		<div class="split1">
			<Select opts={['일방보호좌회전', '전용좌회전', '도류화된공용차로']} value={1} />
		</div>
		<div class="split1">
			<Select opts={['일방보호좌회전', '전용좌회전', '도류화된공용차로']} value={1} />
		</div>
		<div class="split1">
			<Select opts={['일방보호좌회전', '전용좌회전', '도류화된공용차로']} value={1} />
		</div>
		<div class="split1">
			<Select opts={['일방보호좌회전', '전용좌회전', '도류화된공용차로']} value={1} />
		</div>
		<div class="row">우회전형태</div>
		<div class="split1">
			<Select opts={['일방보호좌회전', '전용좌회전', '도류화된공용차로']} value={2} />
		</div>
		<div class="split1">
			<Select opts={['일방보호좌회전', '전용좌회전', '도류화된공용차로']} value={2} />
		</div>
		<div class="split1">
			<Select opts={['일방보호좌회전', '전용좌회전', '도류화된공용차로']} value={2} />
		</div>
		<div class="split1">
			<Select opts={['일방보호좌회전', '전용좌회전', '도류화된공용차로']} value={2} />
		</div>
		<div class="row">U턴 교통량(vph)</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="row">진입 교통량(vph)</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="row">진출 교통량(vph)</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="row">버스정차대수(vph)</div>
		<div class="split1">
			<input type="text" value="60" />
		</div>
		<div class="split1">
			<input type="text" value="60" />
		</div>
		<div class="split1">
			<input type="text" value="60" />
		</div>
		<div class="split1">
			<input type="text" value="60" />
		</div>
		<div class="row">버스베이, 버스이용객</div>
		<div class="split2">
			<Select opts={['유', '대']} value={0} />
			<Select opts={['유', '대']} value={1} />
		</div>
		<div class="split2">
			<Select opts={['유', '대']} value={0} />
			<Select opts={['유', '대']} value={1} />
		</div>
		<div class="split2">
			<Select opts={['유', '대']} value={0} />
			<Select opts={['유', '대']} value={1} />
		</div>
		<div class="split2">
			<Select opts={['유', '대']} value={0} />
			<Select opts={['유', '대']} value={1} />
		</div>
		<div class="row">상류부정류장 이격거리</div>
		<div class="split1">
			<input type="text" value="60" />
		</div>
		<div class="split1">
			<input type="text" value="60" />
		</div>
		<div class="split1">
			<input type="text" value="60" />
		</div>
		<div class="split1">
			<input type="text" value="60" />
		</div>
		<div class="row">주차 여부</div>
		<div class="split1">
			<Select opts={['노상주차 금지', '주차 허용']} value={0} />
		</div>
		<div class="split1">
			<Select opts={['노상주차 금지', '주차 허용']} value={0} />
		</div>
		<div class="split1">
			<Select opts={['노상주차 금지', '주차 허용']} value={0} />
		</div>
		<div class="split1">
			<Select opts={['노상주차 금지', '주차 허용']} value={0} />
		</div>
		<div class="row">주차활동대수(vph)</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="row">횡단보행자수(인/시)</div>
		<div class="split1">
			<input type="text" value="300" />
		</div>
		<div class="split1">
			<input type="text" value="300" />
		</div>
		<div class="split1">
			<input type="text" value="300" />
		</div>
		<div class="split1">
			<input type="text" value="300" />
		</div>
		<div class="row">보행신호시간(초)</div>
		<div class="split1">
			<input type="text" value="37" />
		</div>
		<div class="split1">
			<input type="text" value="37" />
		</div>
		<div class="split1">
			<input type="text" value="37" />
		</div>
		<div class="split1">
			<input type="text" value="37" />
		</div>
		<div class="row">상류링크릴이(m)</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="row">순행속도(kph)</div>
		<div class="split1">
			<input type="text" value="70" />
		</div>
		<div class="split1">
			<input type="text" value="70" />
		</div>
		<div class="split1">
			<input type="text" value="70" />
		</div>
		<div class="split1">
			<input type="text" value="70" />
		</div>
		<div class="row">옵셋(초)</div>
		<div class="split1">
			<input type="text" value="30" />
		</div>
		<div class="split1">
			<input type="text" value="30" />
		</div>
		<div class="split1">
			<input type="text" value="30" />
		</div>
		<div class="split1">
			<input type="text" value="30" />
		</div>
		<div class="row">경사(%)</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="split1">
			<input type="text" value="0" />
		</div>
		<div class="row">평균차로폭(m)</div>
		<div class="split1">
			<input type="text" value="3.4" />
		</div>
		<div class="split1">
			<input type="text" value="3.4" />
		</div>
		<div class="split1">
			<input type="text" value="3.4" />
		</div>
		<div class="split1">
			<input type="text" value="3.4" />
		</div>
		<div class="row">좌회전곡선반경</div>
		<div class="split1">
			<input type="text" value="18" />
		</div>
		<div class="split1">
			<input type="text" value="18" />
		</div>
		<div class="split1">
			<input type="text" value="18" />
		</div>
		<div class="split1">
			<input type="text" value="18" />
		</div>
	</div>
	<div class="container2">
		<div class="Div1">
			<div class="titled">
				<div class="title">교차로명 및 교통량 입력</div>
				<div class="scenario">
					<div>교차로명</div>
					<input class="colspan" type="text" />
					<div class="rowspan2">교통량<br />시나리오</div>
					<input type="text" />
					<Button>추가</Button>
					<div class="rowspan inputlike" />
					<Button>수정적용</Button>
					<div class="rowspan4">0개</div>
					<Button>삭제</Button>
					<Button>전체삭제</Button>
					<Button>위로</Button>
					<Button>아래로</Button>
				</div>
			</div>
			<div class="cenbus">
				<div />
				<div class="updown">
					<div />
					<div class="pink"><b>SB</b></div>
					<div />
					<div class="pink">우회전</div>
					<div class="pink">직진</div>
					<div class="pink">좌회전</div>
					<input type="text" value="200" />
					<input type="text" value="1300" />
					<input type="text" value="400" />
				</div>
				<div />
				<div class="side">
					<div />
					<div class="red"><b>EB</b></div>
					<div class="red">좌회전</div>
					<input type="text" value="490" />
					<div class="red">직진</div>
					<input type="text" value="1700" />
					<div class="red">우회전</div>
					<input type="text" value="200" />
				</div>
				<div class="cenbox">
					<div />
					<input type="text" />
					<input type="text" />
					<input type="text" />
					<div class="cen">중앙버스<br />교통량</div>
					<div />
					<input type="text" />
					<input type="text" />
					<div />
					<input type="text" />
					<input type="text" />
					<input type="text" />
				</div>
				<div class="side">
					<div class="blue"><b>WB</b></div>
					<div />
					<input type="text" value="1186" />
					<div class="blue">좌회전</div>
					<input type="text" value="1600" />
					<div class="blue">직진</div>
					<input type="text" value="441" />
					<div class="blue">우회전</div>
				</div>
				<div />
				<div class="updown">
					<input type="text" value="160" />
					<input type="text" value="1200" />
					<input type="text" value="350" />
					<div class="green">좌회전</div>
					<div class="green">직진</div>
					<div class="green">우회전</div>
					<div />
					<div class="green"><b>NB</b></div>
					<div />
				</div>
				<div />
			</div>
			<div class="inputDiv">
				<div>일반 교통량 Sum</div>
				<input type="text" value="9227" />
				<div>중앙버스 교통량 Sum</div>
				<input type="text" value="0" />
				<div>총 교통량 Sum</div>
				<input type="text" value="9227" />
			</div>
		</div>
		<div class="Div2 titled">
			<div class="title">공통조건입력</div>
			<div class="inputDiv">
				<div>PHF</div>
				<input type="text" value="0.95" />
				<div>중차량 혼입율(%)</div>
				<input type="text" value="5" />
				<div>분석시간(분)</div>
				<input type="text" value="15" />
			</div>
		</div>
		<div class="Div3 titled">
			<div class="title">신호 및 현시입력</div>
			<div class="signal">
				<div class="colspan2">
					<div class="rowspan2" />
					<Button>1현시</Button>
					<Button>2현시</Button>
					<Button>3현시</Button>
					<Button>4현시</Button>
					<Button>5현시</Button>
					<Button>6현시</Button>
					<div class="colspan6 inputlike">
						<Flow
							flows={[
								{ left: true, dir: 1 },
								{ left: true, dir: 3 }
							]}
						/>
						<Flow
							flows={[
								{ left: false, dir: 1 },
								{ left: false, dir: 3 }
							]}
						/>
						<Flow
							flows={[
								{ left: true, dir: 2 },
								{ left: false, dir: 2 }
							]}
						/>
						<Flow
							flows={[
								{ left: true, dir: 0 },
								{ left: false, dir: 0 }
							]}
						/>
					</div>
					<div>녹색시간(초)</div>
					<input type="text" value="17" />
					<input type="text" value="31" />
					<input type="text" value="19" />
					<input type="text" value="21" />
					<input type="text" value="-" />
					<input type="text" value="-" />
					<div>황색시간(초)</div>
					<input type="text" value="3" />
					<input type="text" value="3" />
					<input type="text" value="3" />
					<input type="text" value="3" />
					<input type="text" value="-" />
					<input type="text" value="-" />
					<div>최소녹색시간(초)</div>
					<input type="text" value="12" />
					<input type="text" value="12" />
					<input type="text" value="12" />
					<input type="text" value="12" />
					<input type="text" value="12" />
					<input type="text" value="12" />
				</div>
				<div>
					<div>
						<div class="rowspan2">현시방향</div>
						<Flow flows={[{ left: false, dir: 3 }]} />
						<Flow flows={[{ left: false, dir: 1 }]} />
						<Flow flows={[{ left: false, dir: 2 }]} />
						<Flow flows={[{ left: false, dir: 0 }]} />
						<Flow flows={[{ left: true, dir: 3 }]} />
						<Flow flows={[{ left: true, dir: 1 }]} />
						<Flow flows={[{ left: true, dir: 2 }]} />
						<Flow flows={[{ left: true, dir: 0 }]} />
					</div>
					<div>
						<div class="rowspan2">버스현시방향</div>
						<Flow flows={[{ left: false, dir: 3 }]} />
						<Flow flows={[{ left: false, dir: 1 }]} />
						<Flow flows={[{ left: false, dir: 2 }]} />
						<Flow flows={[{ left: false, dir: 0 }]} />
						<Flow flows={[{ left: true, dir: 3 }]} />
						<Flow flows={[{ left: true, dir: 1 }]} />
						<Flow flows={[{ left: true, dir: 2 }]} />
						<Flow flows={[{ left: true, dir: 0 }]} />
					</div>
				</div>
				<div>
					<div>SET</div>
					<Button>양직양좌</Button>
					<Button colored="blue">직좌직좌</Button>
					<Button colored="red">All Red</Button>
					<div>비보호 좌회전</div>
					<div class="unprotect">
						<Flow flows={[{ left: true, dir: 2 }]} />
						<Flow flows={[{ left: true, dir: 0 }]} />
					</div>
				</div>
			</div>
		</div>
		<div class="Div4 titled">
			<div class="title">신호시간 최적화</div>
			<div class="inputDiv">
				<div>신호시간 최적화 실행</div>
				<Input type="checkbox1" style="padding-left:8px;" checked={true} />
				<div>최소값(초)</div>
				<input type="text" value="90" />
				<div>최대값(초)</div>
				<input type="text" value="5" />
				<div>증가값(초)</div>
				<input type="text" value="15" />
				<div>기본최소 녹색시간(초)</div>
				<input type="text" value="15" />
				<div>적용 주기 단위</div>
				<Select opts={['5초', '10초', '15초', '30초']} value={1} />
			</div>
		</div>
	</div>
	<div class="btns">
		<div>
			<div>
				<Button>EX#1</Button>
				<Button>EX#2</Button>
				<Button>EX#3</Button>
				<Button>EX#4</Button>
			</div>
			<div>
				<Button>EX#8</Button>
				<Button>EX#9</Button>
				<div />
				<div />
			</div>
		</div>
		<div>
			<div>
				<div />
				<Button icon="detail">디폴트</Button>
				<Button>모두 분석</Button>
				<Button>분석</Button>
			</div>
			<div>
				<div />
				<div />
				<Button colored={true} icon="init">초기화</Button>
				<Button colored={true} icon="save2db">저장</Button>
			</div>
		</div>
	</div>
</wrapper>

<style>
	* {
		box-sizing: border-box;
	}
	input[type='text'] {
		background-color: #14181d;
		border-radius: 4px;
		border: 1px solid #465362;
		color: #cccccc;
		text-align: center;
		width: 100%;
	}
	.red {
		color: #f81239;
	}
	.blue {
		color: #0a82ff;
	}
	.green {
		color: #01c701;
	}
	.pink {
		color: #da21ea;
	}
	.inputlike {
		background-color: #14181d;
		border-radius: 4px;
		border: 1px solid #465362;
		color: #cccccc;
		text-align: center;
		width: 100%;
	}

	wrapper {
		/* width: 100%; */
		height: 100%;
		display: grid;
		overflow: auto;
		grid-template-columns: 1fr 1fr;
		column-gap: 17px;
		row-gap: 9px;
		grid-template-rows: 2fr 40px;
	}
	.container1 {
		box-sizing: border-box;
		display: grid;
		gap: 3px;

		/* grid-template-columns: 2fr 3fr 3fr 3fr 3fr; */
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
		grid-template-rows: auto;
	}

	.container1 > div {
		width: 100%;
	}
	.container1 input {
		background-color: #14181d;
		border-radius: 4px;
		border: 1px solid #465362;
		color: #cccccc;
		text-align: center;
		width: 100%;
	}
	.container1 .title {
		background-color: #212830;
		border-radius: 4px;
		text-align: center;
		font-weight: bold;
	}

	.container1 .row {
		font-size: 1.2rem;
		letter-spacing: -1px;
		color: #999999;
		text-align: right;
		line-height: 2rem;
	}
	.container1 .row.multiline {
		line-height: 1.3rem;
	}
	.container1 .row.spanrow {
		grid-row: span 2 / span 1;
	}

	.container1 .split1 {
		display: grid;
		grid-template-columns: 1fr;
	}
	.container1 .split2 {
		display: grid;
		gap: 3px;
		grid-template-columns: 1fr 1fr;
	}
	.container1 .split3 {
		display: grid;
		gap: 2px;
		grid-template-columns: 1fr 1fr 1fr;
	}

	.container2 {
		box-sizing: border-box;
		display: grid;
		gap: 11px;

		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 35fr 12fr 20fr;
	}
	.container2 .titled {
		display: grid;
		grid-template-rows: 27px 1fr;
	}
	.container2 .title {
		font-size: 1.3rem;
		font-weight: bold;
		padding: 9px 4px 4px 15px;
		color: #cccccc;
	}
	.container2 .inputDiv {
		display: grid;
		grid-template-columns: 7fr 4fr;
		grid-auto-rows: 20px;
		padding-right: 11px;
		padding-bottom: 4px;
		gap: 3px 7px;
	}
	.container2 .inputDiv > div {
		color: #999999;
		text-align: right;
		font-size: 1.2rem;
		letter-spacing: -1px;
		line-height: 23px;
	}
	.container2 > div {
		background-color: #212830;
	}
	.container2 .Div1 {
		column-gap: 3px;
		row-gap: 7px;
		grid-column: span 3;
		display: grid;
		grid-template-columns: 10fr 21fr;
		grid-template-rows: 3fr 1fr;
	}
	.container2 .Div1 .scenario {
		gap: 3px;
		display: grid;
		font-size: 1.2rem;
		padding-top: 7px;
		padding-right: 11px;
		grid-template-columns: 2fr 3fr 2fr;
		grid-template-rows: repeat(7, 1fr);
	}
	.scenario :global(button) {
		font-size: 1.2rem;
		letter-spacing: -1px;
		color: #777777;
	}
	.scenario > div:not(.inputlike) {
		text-align: right;
		color: #999999;
	}
	.scenario > .colspan {
		grid-column: span 2;
	}
	.scenario > .rowspan2 {
		grid-row: span 2;
	}
	.scenario > .rowspan4 {
		grid-row: span 4;
	}
	.scenario > .rowspan {
		grid-row: span 5;
	}
	.container2 .Div1 > .cenbus {
		grid-row: span 2;
		display: grid;
		grid-template-columns: 2fr 3fr 2fr;
		grid-template-rows: 4fr 7fr 4fr;
	}
	.cenbus > div {
		display: grid;
		text-align: center;
		line-height: 25px;
		padding: 3px;
		gap: 2px;
	}
	.cenbus > .updown {
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 1fr 1fr 1fr;
		row-gap: 0;
	}
	.cenbus > .side {
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
		column-gap: 0;
	}
	.cenbus > .cenbox {
		background-color: #2e3843;
		border: 1px solid #465362;
		border-radius: 10px;

		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
	}
	.cenbox > .cen {
		grid-row: span 3;
		padding-top: 15px;
		text-align: center;
	}
	.container2 .Div3 {
		grid-column: span 2;
		grid-row: span 2;
	}
	.Div3 > .signal .rowspan2 {
		grid-row: span 2;
	}
	.Div3 > .signal .colspan2 {
		grid-column: span 2;
	}
	.Div3 > .signal .colspan6 {
		grid-column: span 6;
	}
	.Div3 > .signal {
		display: grid;
		column-gap: 24px;
		padding-bottom: 5px;
		row-gap: 5px;
		grid-template-columns: 2fr 1fr;
		grid-template-rows: 1fr 1fr;
	}
	.signal > div:nth-of-type(1) {
		display: grid;
		gap: 2px;
		padding-right: 11px;
		grid-template-columns: 79px repeat(6, 1fr);
		grid-template-rows: 4fr 9fr 4fr 4fr 4fr;
	}
	.signal > div:nth-of-type(1) > div {
		color: #999999;
		line-height: 19px;
		padding-right: 3px;
		font-size: 1.2rem;
		letter-spacing: -1px;
		text-align: right;
	}
	.signal > div:nth-of-type(1) > .inputlike {
		display: grid;
		gap: 10px;
		padding: 0 5px;
		grid-template-columns: repeat(6, 1fr);
	}
	.signal > div:nth-of-type(2) {
		display: grid;
		row-gap: 7px;
		grid-template-rows: 1fr 1fr;
	}
	/* 현시방향, 버스현시방향 */
	.signal > div:nth-of-type(2) > div {
		display: grid;
		gap: 4px;
		grid-template-columns: 79px repeat(4, 1fr);
		grid-template-rows: 1fr 1fr;
	}
	.signal > div:nth-of-type(2) > div > .rowspan2 {
		color: #999999;
		padding-right: 3px;
		text-align: right;
		line-height: 60px;
		font-size: 1.2rem;
	}
	.signal > div:nth-of-type(2) > div > :global(square) {
		background-color: #14181d;
		border-radius: 4px;
		border: 1px solid #465362;
	}
	.signal > div:nth-of-type(2) > div:nth-of-type(2) > :global(square) {
		/* filter:brightness(1.5) opacity(0.8); */
		filter: sepia(40%);
	}
	.signal > div:nth-of-type(3) {
		font-size: 1.2rem;
		display: grid;
		row-gap: 2px;
		text-align: center;
		color: #999999;
		padding-left: 4px;
		padding-right: 15px;
		grid-template-rows: repeat(5, 2fr) 3fr;
	}
	.signal > div:nth-of-type(3) > .unprotect {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: 7px;
	}
	.unprotect > :global(square) {
		background-color: #14181d;
		border-radius: 4px;
		border: 1px solid #f81239;
		filter: sepia(40%);
	}

	.btns {
		padding-top: 7px;
		border-top: 1px solid #465362;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-area: 2 / 1 / 3 / 3;
	}
	.btns > div {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: 14px;
	}
	.btns > div > div {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		column-gap: 3px;
	}
	wrapper :global(.handsontable tr td:nth-child(1)) {
		background-color: #2e3843 !important;
	}
</style>
