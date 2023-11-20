<script>
    import Button from '$lib/nested/button.svelte';
    import Gauge from '$lib/nested/gauge.svelte';
    import { asy } from '$lib/js/functions.mjs';
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let params;
    const lcs = params.lcs;
    const spdK = params.spdK;
    const spdKrev = params.spdKrev;
    const cycle = params.cycle;
    const lcslen = lcs.length;

    let process = 0; //진행단계
    let optmode = 2; //상행, 평등, 하행
    let done = 0; //계산된 교차로
    let stop = false;
    let prebenchmark;
    let benchmarkresult = {
        UPbefore:0,
        UPafter:0,
        DOWNbefore:0,
        DOWNafter:0,
        UPeffect:0,
        DOWNeffect:0,
        RESULT:0
    }
    let resultOffset = [0];

    const volume = 2;

    function benchmark () {
        let testdone = 0;
        let UPresults = new Array();
        let DOWNresults = new Array();
        let UPoffsetCor = 0;
        let DOWNoffsetCor = 0;

        for (let i = 0;i < volume;i++) { // 표본수만큼 반복
            // 상행
            if (optmode < 4) { 
                let firLC = lcs[0];

                // 표본 설정
                let capa = 0;
                firLC.redA.forEach((red, redi)=>{
                    if (!red) { capa += firLC.phaseA[redi]; }
                })
                const gap = capa / volume;

                let time = Math.ceil(gap * i);
                
                // 첫 교차로
                // console.log(i + 1 +  '번째 표본 시작(A)');
                
                firLC.cuPhaseA.every((curPhase, phi)=>{                   
                    if (time >= (curPhase)) { //접촉하는지
                        if (firLC.redA[phi]) { //적신호
                            time += firLC.phaseA[phi];
                            return true;
                        } else { //청신호
                            time += firLC.offset;
                            return false;
                        }
                    }
                    return true;
                })
                let start = time;

                time += firLC.adist / ( spdK[0] / 3.6 ); // 이동시간

                // 두번째 교차로부터 이동
                for (let o = 1;o < lcslen;o++) { 
                    let whilestop = false;
                    let curLC = lcs[o];
                    let reloffset = -cycle + curLC.offset;
                    while (!whilestop) {
                        curLC.cuPhaseA.every((curPhase, phi)=>{      
                            const nextPhase = curLC.cuPhaseA[phi+1] || cycle;
                            if ( (time >= (curPhase+reloffset) ) && (time < ( nextPhase+reloffset) ) ) { //접촉하는지
                                if (curLC.redA[phi]) { //적신호
                                    // console.warn(`표본 ${start}A: ${o+1}번째 교차로 ${phi+1}현시(${curPhase+reloffset}->${nextPhase+reloffset}) ${Math.round(time)}초에 걸렸다`)
                                    time = nextPhase+reloffset;
                                    return true;
                                } else { //청신호
                                    // console.log(`표본 ${start}A: ${o+1}번째 교차로 ${phi+1}현시(${curPhase+reloffset}->${nextPhase+reloffset}) ${Math.round(time)}초에 지나간다`)
                                    whilestop = true;
                                    return false;
                                }
                            }
                            return true;
                        })
                        reloffset += cycle;
                    }
                    time += curLC.adist / ( spdK[0] / 3.6 ); // 이동시간
                }
                // console.log('시작'+start+' 끝'+time)
                UPresults.push(Math.round(time-start));
            }


            // 하행
            if (optmode > 0) { 
                let lastLC = lcs[lcs.length-1];

                // 표본 설정
                let capa = 0;
                lastLC.redB.forEach((red, redi)=>{
                    if (!red) { capa += lastLC.phaseB[redi]; }
                })
                const gap = capa / volume;

                let time = Math.ceil(gap * i);
                
                // 첫 교차로
                // console.log(i + 1 +  '번째 표본 시작(B)');
                
                lastLC.cuPhaseB.every((curPhase, phi)=>{                   
                    if (time >= (curPhase)) { //접촉하는지
                        if (lastLC.redB[phi]) { //적신호
                            time += lastLC.phaseB[phi];
                            return true;
                        } else { //청신호
                            time += lastLC.offset;
                            return false;
                        }
                    }
                    return true;
                })
                let start = time;

                time += lastLC.bdist / ( spdKrev[0] / 3.6 ); //이동시간

                //두번째 교차로부터 이동
                for (let o = 1;o < lcslen;o++) { 
                    let whilestop = false;
                    let curLC = lcs[lcs.length-1-o];
                    let reloffset = -cycle + curLC.offset;
                    while (!whilestop) {
                        curLC.cuPhaseB.every((curPhase, phi)=>{      
                            const nextPhase = curLC.cuPhaseB[phi+1] || cycle;
                            if ( (time >= (curPhase+reloffset) ) && (time < ( nextPhase+reloffset) ) ) { //접촉하는지
                                if (curLC.redB[phi]) { //적신호
                                    // console.warn(`표본 ${start}B: ${o+1}번째 교차로 ${phi+1}현시(${curPhase+reloffset}->${nextPhase+reloffset}) ${Math.round(time)}초에 걸렸다`)
                                    time = nextPhase+reloffset;
                                    return true;
                                } else { //청신호
                                    // console.log(`표본 ${start}B: ${o+1}번째 교차로 ${phi+1}현시(${curPhase+reloffset}->${nextPhase+reloffset}) ${Math.round(time)}초에 지나간다`)
                                    whilestop = true;
                                    return false;
                                }
                            }
                            return true;
                        })
                        reloffset += cycle;
                    }
                    time += curLC.bdist / ( spdKrev[0] / 3.6 ); //이동시간
                }
                // console.log('시작'+start+' 끝'+time)
                DOWNresults.push(Math.round(time-start));
            }
        }

        return {
            A: UPresults,
            B: DOWNresults
        }
    }

    function chooseOpmode (opmode) {
        asy(()=>{
            optmode=opmode;
            optimize();
            ++process;
        })
    }

    function optimize () {
        // const lclen = lcs.length-1;
        const lclen = 3;
        let standOffset = 0;
        for (let lci = 0;lci < lclen; lci++) {
            if (stop) { return; } //중단

            const UPlc = lcs[lci];
            const DOWNlc = lcs[lci+1];
            
            let UPresults = new Object();
            let DOWNresults = new Object();

            let UPcapa = 0;
            let DOWNcapa = 0;

            let UPlog = new Object();
            let DOWNlog = new Object();

            UPlc.redA.forEach((red, redi)=>{
                if (!red) { UPcapa += UPlc.phaseA[redi]; }
            })
            DOWNlc.redB.forEach((red, redi)=>{
                if (!red) { DOWNcapa += DOWNlc.phaseB[redi]; }
            })
            const UPgap = UPcapa / volume;
            const DOWNgap = DOWNcapa / volume;

            for (let i = 0;i < volume;i++) { //표본수만큼 반복
                let UPtime = Math.ceil(UPgap * i);
                let DOWNtime = Math.ceil(DOWNgap * i);

                UPlc.cuPhaseA.every((curPhase, phi)=>{                   
                    if (UPtime >= (curPhase)) { //접촉하는지
                        if (UPlc.redA[phi]) { //적신호
                            UPtime += UPlc.phaseA[phi];
                            return true;
                        } else { //청신호
                            UPtime += UPlc.offset;
                            return false;
                        }
                    }
                    return true;
                })
                
                DOWNlc.cuPhaseB.every((curPhase, phi)=>{                   
                    if (DOWNtime >= (curPhase)) { //접촉하는지
                        if (DOWNlc.redB[phi]) { //적신호
                            DOWNtime += DOWNlc.phaseB[phi];
                            return true;
                        } else { //청신호
                            DOWNtime += DOWNlc.offset;
                            return false;
                        }
                    }
                    return true;
                })
                
                let UPstart = UPtime;
                let DOWNstart = DOWNtime;

                UPtime += UPlc.adist / ( spdK[lci] / 3.6 ); // 이동시간
                DOWNtime += DOWNlc.bdist / ( spdKrev[lci] / 3.6 ); // 이동시간

                const offsetGap = 4;
                let testOffset = 0;
                while (testOffset < cycle) { // 옵셋별 상행 반복
                    let reloffset = -cycle + testOffset;
                    let whilestop = false;
                    let testPhrase = '';
                    let _UPtime = UPtime;
                    while (!whilestop) { //전주기부터
                        DOWNlc.cuPhaseA.every((curPhase, phi)=>{      
                            const nextPhase = DOWNlc.cuPhaseA[phi+1] || cycle;
                            if ( (_UPtime >= (curPhase + reloffset) ) && (_UPtime < ( nextPhase + reloffset) ) ) { //접촉하는지
                                testPhrase += ` ${phi+1}현시(${reloffset < 0 ? '전' : reloffset < cycle ? '중' : '후'}${curPhase + reloffset}~${( nextPhase + reloffset)}):` 
                                if (DOWNlc.redA[phi]) { //적신호
                                    // console.warn(`표본 ${UPstart}(${testOffset}) A: ${lci+1}번째 교차로 ${phi+1}현시(${curPhase+reloffset}->${nextPhase+reloffset}) ${Math.round(UPtime)}초에 걸렸다`)
                                    testPhrase += `걸림(${UPtime})` 
                                    _UPtime = nextPhase + reloffset;
                                    return true;
                                } else { //청신호
                                    testPhrase += `통과(${UPtime})` 
                                    // console.log(`표본 ${UPstart}(${testOffset}) A: ${lci+1}번째 교차로 ${phi+1}현시(${curPhase+reloffset}->${nextPhase+reloffset}) ${Math.round(UPtime)}초에 지나간다`)
                                    whilestop = true;
                                    return false;
                                }
                            }
                            return true;
                        })
                        reloffset += cycle;
                    }
                    if (!UPresults[testOffset]) { 
                        UPresults[testOffset] = new Array(); 
                        UPlog[testOffset] = new Array(); 
                    }
                    UPresults[testOffset].push( Math.round(_UPtime-UPstart) );
                    UPlog[testOffset].push( `$${Math.round(_UPtime-UPstart)}$시작:${UPstart}${testPhrase} 종료:${UPtime}` )
                    // console.log(`A:옵셋${testOffset} 최종${UPtime} 시작${UPstart}`)

                    testOffset += offsetGap;
                }
                testOffset = 0;
                while (testOffset < cycle) { //옵셋별 하행 반복
                    let reloffset = -cycle + testOffset;
                    let whilestop = false;
                    let testPhrase = '';
                    let _DOWNtime = DOWNtime;
                    while (!whilestop) { //전주기부터
                        UPlc.cuPhaseB.every((curPhase, phi)=>{      
                            const nextPhase = UPlc.cuPhaseB[phi+1] || cycle;
                            if ( (_DOWNtime >= (curPhase+reloffset) ) && (_DOWNtime < ( nextPhase+reloffset) ) ) { //접촉하는지
                                if (UPlc.redB[phi]) { //적신호
                                    // console.warn(`표본 ${DOWNstart} B: ${lci+1}번째 교차로 ${phi+1}현시(${curPhase+reloffset}->${nextPhase+reloffset}) ${Math.round(DOWNtime)}초에 걸렸다`)
                                    _DOWNtime = nextPhase+reloffset;
                                    return true;
                                } else { //청신호
                                    // console.log(`표본 ${DOWNstart} B: ${lci+1}번째 교차로 ${phi+1}현시(${curPhase+reloffset}->${nextPhase+reloffset}) ${Math.round(DOWNtime)}초에 지나간다`)
                                    whilestop = true;
                                    return false;
                                }
                            }
                            return true;
                        })
                        reloffset += cycle;
                    }
                    if (!DOWNresults[testOffset]) { 
                        DOWNresults[testOffset] = new Array(); 
                        DOWNlog[testOffset] = new Array(); 
                    }
                    DOWNresults[testOffset].push( Math.round(_DOWNtime-DOWNstart) );
                    DOWNlog[testOffset].push( `$${Math.round(_DOWNtime-DOWNstart)}$시작:${DOWNstart}${testPhrase} 종료:${DOWNtime}` )
                    // console.log(`B:옵셋${testOffset} 최종${DOWNtime} 시작${DOWNstart}`)
                    testOffset += offsetGap;
                }
            }
            // console.log(JSON.parse(JSON.stringify(UPresults)))
            //상행 합계
            for (const [key, value] of Object.entries(UPresults)) {
                UPresults[key] = value.reduce((sum, curval)=>{
                    return sum + curval
                })
            }
            //상행 최소값
            let min = Object.values(UPresults)[0];
            let UPminkey = new Array();
            for (const [key, value] of Object.entries(UPresults)) {
                if (value < min) { min = value; UPminkey = [key] }
                else if (value == min) { UPminkey.push(key) }
            }
            console.log(UPresults)
            console.log('상행 최소값 : ' + UPminkey + '/' + min)

            // console.log(JSON.parse(JSON.stringify(DOWNresults)))
            // 하행 합계
            for (const [key, value] of Object.entries(DOWNresults)) {
                DOWNresults[key] = value.reduce((sum, curval)=>{
                    return sum + curval
                })
            }
            //하행 최소값
            min = Object.values(DOWNresults)[0];
            let DOWNminkey = new Array();
            for (const [key, value] of Object.entries(DOWNresults)) {
                if (value < min) { min = value; DOWNminkey = [key] }
                else if (value == min) { DOWNminkey.push(key) }
            }
            console.log(DOWNresults)
            console.log('하행 최소값 : ' + DOWNminkey + '/' + min)
            if (lci == 2) {
                console.log(lci+1 + '번째 교차로')
                // console.log(UPresults)
                console.log(UPlog)
                // console.log(DOWNresults)
                console.log(DOWNlog)
            }
            let minkey = new Array();
            switch (optmode) {
                case 1 : //상행우선
                    if (UPminkey.length > 1) {
                        UPminkey.forEach((key, ind)=>{
                            const value = DOWNresults[key];
                            if (minkey.length == 0 || value <= min) { min = value; minkey = [key]}
                        })
                        resultOffset[lci+1] = Number(minkey[0]) - resultOffset[lci];
                    } else {
                        resultOffset[lci+1] = Number(UPminkey[0]) - resultOffset[lci];
                    }
                    break;
                case 2 : //평등 (상하향 더한값이 가장 작은 옵셋)
                    for (const [key, upres] of Object.entries(UPresults)) {
                        const downres = DOWNresults[key];
                        const value = upres + downres;
                        if (minkey.length == 0 || value <= min ) { min = value; minkey = [key]};
                    }
                    resultOffset[lci+1] = Number(minkey[0]) - resultOffset[lci];
                    break;
                case 3 : //하행우선
                    if (DOWNminkey.length > 1) {
                        DOWNminkey.forEach((key)=>{
                            const value = UPresults[key];
                            if (minkey.length == 0 || value <= min) { min = value; minkey = [key]}
                        })
                        resultOffset[lci+1] = Number(minkey[0]) - resultOffset[lci];
                    } else {
                        resultOffset[lci+1] = Number(DOWNminkey[0]) - resultOffset[lci];
                    }
                    break;
            }
            done = lci+1;
        }
        resultOffset.forEach((off, offi)=>{
            params.lcs[offi].offset = off < 0 ? off + cycle : off;
        })
        dispatch('ev');
        
        const afterbenchmark = benchmark();

        console.log('결과 옵셋 : ' + resultOffset);
        console.log('벤치마크');
        console.log(prebenchmark);
        console.log(afterbenchmark);

        benchmarkresult = {
            UPbefore: Math.round(prebenchmark.A.reduce((sum, cur)=>sum + cur) / volume),
            UPafter: Math.round(afterbenchmark.A.reduce((sum, cur)=>sum + cur) / volume),
            DOWNbefore: Math.round(prebenchmark.B.reduce((sum, cur)=>sum + cur) / volume),
            DOWNafter: Math.round(afterbenchmark.B.reduce((sum, cur)=>sum + cur) / volume),
        }
        benchmarkresult.UPeffect = Math.round(benchmarkresult.UPbefore / benchmarkresult.UPafter * 1000 - 1000) / 10 ;
        benchmarkresult.DOWNeffect = Math.round(benchmarkresult.DOWNbefore / benchmarkresult.DOWNafter * 1000 - 1000) / 10 ;
        benchmarkresult.RESULT = Math.round((benchmarkresult.UPeffect + benchmarkresult.DOWNeffect) * 5) / 10;

        Math.round(prebenchmark.A.reduce((sum, cur)=>sum + cur) / volume)
        process++;
    }

    onMount(()=>{
        prebenchmark = benchmark();
    })
    onDestroy(()=>{stop=true; console.log('뿌서')})
</script>

<div id="main" class={'process' + process}>
    <div class="EntireDiv">
        {#if process==0}
            <div class="text">최적화 모드를 선택해주세요</div>
            <div class="content">
                <Button on:click={()=>{chooseOpmode(1)}} height="30px" colored={false}>상행 우선</Button>
                <Button on:click={()=>{chooseOpmode(2)}} height="30px" colored={true}>평등</Button>
                <Button on:click={()=>{chooseOpmode(3)}} height="30px" colored={false}>하행 우선</Button>
            </div>
        {:else if process==1}
            <div class="text">옵셋 최적화를 진행 중입니다.<br/>
                잠시만 기다려 주세요.</div>
            <div class="content">
                <Gauge max={lcs.length-1} cur={done} />
            </div>
        {:else if process==2}
            <div class="text">옵셋 최적화 결과</div>
            <div class="content">
                <table>
                    <tr>
                        <td></td>
                        <td class="tit">전</td>
                        <td class="tit">후</td>
                        <td class="tit">효과</td>
                    </tr>
                    <tr>
                        <td class="tit">상행</td>
                        <td>{benchmarkresult.UPbefore} s</td>
                        <td>{benchmarkresult.UPafter} s</td>
                        <td class={benchmarkresult.UPeffect < 0 ? 'red':'blue'}>{benchmarkresult.UPeffect}%</td>
                    </tr>
                    <tr>
                        <td class="tit">하행</td>
                        <td>{benchmarkresult.DOWNbefore} s</td>
                        <td>{benchmarkresult.DOWNafter} s</td>
                        <td class={benchmarkresult.DOWNeffect < 0 ? 'red':'blue'}>{benchmarkresult.DOWNeffect}%</td>
                    </tr>
                    <tr>
                        <td class={benchmarkresult.RESULT < 0 ? 'red':'blue'} colspan="4">평균 {benchmarkresult.RESULT}% 효과</td>
                    </tr>
                </table>
            </div>
        {/if}
    </div>
</div>

<style>
    #main {
        --main-padding: 11px;
        font-size: 1.3rem;
        padding: var(--main-padding);
        /* width: 1170px;
        height: 750px; */
    }
    .EntireDiv {
        width: calc(100%- (var(--main-padding) * 2));
        height: calc(100%- (var(--main-padding) * 2));
        box-shadow: 0px 0px 10px #0000000d;
        border-radius: 6px;
        background-color: #212830;
        display: grid;
        
        min-height: 150px;
        padding: 10px;
    }
    .EntireDiv .text{
        text-align: center;
        color: #DDD;
    }

    #main.process0 .text {
        padding-top: 45px;
    }
    #main.process0 .EntireDiv {
        grid-template-rows: 90px 1fr;
    }
    #main.process0 .content {
        display: grid;
        gap: 9px;
        grid-template-columns: 1fr 1fr 1fr;
    }

    #main.process1 .text {
        padding-top: 30px;
    }
    #main.process1 .EntireDiv {
        grid-template-rows: 70px 1fr;
    }
    .content > table{
        width: 100%;
        /* border: 1px solid #444; */
        border-collapse: collapse;
    }
        .content > table td.tit { 
            color:#777;
            border: 1px solid #444;
        }
            .content > table td.blue { 
                font-weight: bold;
                color:#7c7cff;
            }
            .content > table td.red { 
                font-weight: bold;
                color:#ff7c7c;
            }
        .content > table td { 
            width:25%;
            color:#ccc;
            height:27px;
            text-align: center;
            border: 1px solid #444;
        }
        .content > table td[colspan] { 
            border: none;
        }

</style>
