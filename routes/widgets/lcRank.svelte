<script>
    import { ajax } from "$lib/functions.js";
    import { LOScolors } from "$lib/consts.js";
    // import preset from "../../settings.json"
    import { onDestroy } from 'svelte';

    let credate = '';

    export let pagename;
    export let width = 1920;
    export let data = [
        {
            lcname : '정읍소방서 사거리',
            cnt : 12345
        },
        {
            lcname : '한국병원 사거리',
            cnt : 3345
        },
        {
            lcname : '서영여자고등학교 사거리',
            cnt : 1154
        },
        {
            lcname : '서영여자중학교 사거리',
            cnt : 854
        },
        {
            lcname : '정읍북 초등학교',
            cnt : 654
        },
        {
            lcname : '정읍보건소',
            cnt : 432
        },
        {
            lcname : '수성사거리',
            cnt : 285
        },
    ]

    $:wide = Boolean(width > 1000);

    function getData () {
        ajax('trafficrank').then((res)=>{
            console.log(res)
            const fullDate = new Date(res[0].cre_date);
            const year = fullDate.getFullYear()-2000;
            const month = fullDate.getMonth()+1;
            const date = fullDate.getDate();
            let hours = fullDate.getHours();
            let prehours = hours > 0 ? hours-1 : 23;
            if (hours < 10) {hours = '0' + hours}
            if (prehours < 10) {prehours = '0' + prehours}

            credate = `${year}. ${month}. ${date} / ${prehours}-${hours}시 기준`
            
            data = res.sort((a, b)=>{
                if (a.cnt > b.cnt) {
                    return -1;
                }
                if (a.cnt < b.cnt) {
                    return 1;
                }
                return 0;
            })
        })
    }

    let interval = null;

    getData();
    const curTime = new Date();
    const leftMin = (61 - curTime.getMinutes());
    const leftSec = (60 - curTime.getSeconds());

    setTimeout(()=>{
        interval = setInterval(getData, 3600000)
    }, (leftMin * 60000) + (leftSec * 1000))

    onDestroy(() => {
        if (interval) clearInterval(interval)
    });


</script>

<div class="frame">
    <div class="title">
        <img src="widgetIcon/{pagename}.png" />
        스마트교차로 교통량 순위
        <div>{credate}</div>
    </div>
    <div class="content">
        <div class="grid" class:wide>
            {#each data as dt, ind}
                {@const color = LOScolors[(function () { 
                    const num = Math.floor(dt.cnt / 15)
                    if (num > 8) {
                        return 7
                    } else {
                        return num
                    }
                })()]}
                {#if ind < 7}
                <!-- <div style="order:{wide ? ind}"> -->
                <div>
                    <div>
                        <div style="background-color:{color}"></div>
                    </div>
                    <div style="color:{color}">{ind+1}</div>
                    <div style="color:{color}">{dt.cnt.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</div>
                    <div>{dt.lcname}</div>
                </div>
                {/if}
            {/each}
        </div>
    </div>
</div>

<style>
    .frame {
        background-color: #131517;
        display: grid;
        padding: 21px;
        box-sizing: border-box;
        grid-template-rows: 60px 1fr;
        width:100%;
        height:100%;
    }
        .title {
            position: relative;
            line-height: 60px;
            padding-left: 15px;
            font-size: 1.5rem;
            color: #CCCCCC;
            font-weight: bold;
        }
            .title > img {
                height:60%;
                vertical-align: baseline;
            }
            .title > div {
                position: absolute;
                bottom: 0px;
                right: 15px;
                font-size: 1rem;
            }
        .content {

        }
            .content .grid {
                display: grid;
                grid-template-rows: minmax(50px, auto-fit);
                /* grid-auto-flow: column; */
                gap:12px;
                width: 100%;
                height: 100%;
            }
            .content .grid.wide {
                grid-template-columns: 1fr 1fr;
                grid-template-rows: minmax(50px, auto-fit);
            }
                .content .grid > div {
                    display: grid;
                    color:#FFFFFF;

                    grid-template-columns: 9px 90px 240px 1fr;
                    background-color: #1C1C1E;
                }
                    .content .grid > div > div:nth-of-type(1) {
                        padding: 30px 0;
                    }
                        .content .grid > div > div:nth-of-type(1) > div {
                            width:100%;
                            height:100%;
                            border-radius: 5px;
                        }
                    .content .grid > div > div:nth-of-type(2) {
                        font-size: 1.7rem;
                        padding-top: 34px;
                        text-align: center;
                    }
                    .content .grid > div > div:nth-of-type(3) {
                        background-color: #202020;
                        font-size: 2rem;
                        padding-top: 30px;
                        padding-right: 30px;
                        font-weight: bold;
                        text-align: right;
                    }
                    .content .grid > div > div:nth-of-type(4) {
                        font-size: 1.2rem;
                        padding-top: 44px;
                        padding-right: 30px;
                        text-align: right;
                    }
</style>