<script>
    import { ajax } from "$lib/functions.js";
    import preset from "../../settings.json"
    import { onDestroy } from 'svelte';

    export let pagename;
    export let width = 1920;
    export let data = {
        start : [
            {
                device:2,
                division:1,
                date:new Date(2023, 8, 1),
                taken:257,
                ID:'정읍 소방서',
                status:2
            },
            {
                device:3,
                division:1,
                date:new Date(2023, 8, 2),
                time:312,
                ID:'정읍 소방서',
                status:2
            },
            {
                device:1,
                division:0,
                date:new Date(2023, 8, 3),
                time:199,
                ID:'정읍 소방서',
                status:2
            },
            {
                device:4,
                division:0,
                date:new Date(2023, 8, 4),
                time:319,
                ID:'정읍초등학교',
                status:2
            }
        ],
        end : [
            {
                device:2,
                division:1,
                date:new Date(2023, 8, 4),
                time:257,
                ID:'정읍 소방서',
                status:1
            },
            {
                device:3,
                division:1,
                date:new Date(2023, 8, 4),
                time:312,
                ID:'정읍 소방서',
                status:1
            },
            {
                device:1,
                division:0,
                date:new Date(2023, 8, 4),
                time:199,
                ID:'정읍 소방서',
                status:0
            },
            {
                device:4,
                division:0,
                date:new Date(2023, 8, 4),
                time:319,
                ID:'정읍초등학교',
                status:0
            }
        ]
    }

    $:wide = Boolean(width > 1000);

    const status = ['대기','진행','완료'];
    const statusColor = ['#494948','#BCBF00','#59B80F'];
    const division = ['ambulance','firetruck'];

    function getData () {
        ajax('ppc_ev').then((res)=>{
            data.start = res.start.map((el)=>{
                const fullDate = new Date(el.CRE_DATE);

                const year = fullDate.getFullYear()-2000;
                const month = fullDate.getMonth()+1;
                const date = fullDate.getDate();
                let hours = fullDate.getHours();
                let min = fullDate.getMinutes();
                let sec = fullDate.getSeconds();
                if (hours < 10) {hours = '0' + hours}
                if (min < 10) {min = '0' + min}
                if (sec < 10) {sec = '0' + sec}

                return {
                    ID : `${el.ID}. ${el.COMMENT}`,
                    date : `${year}. ${month}. ${date}`,
                    time : `${hours}:${min}:${sec}`
                }
            })
            data.end = res.end.map((el)=>{
                const fullDate = new Date(el.CRE_DATE);

                const year = fullDate.getFullYear()-2000;
                const month = fullDate.getMonth()+1;
                const date = fullDate.getDate();
                let hours = fullDate.getHours();
                let min = fullDate.getMinutes();
                let sec = fullDate.getSeconds();
                if (hours < 10) {hours = '0' + hours}
                if (min < 10) {min = '0' + min}
                if (sec < 10) {sec = '0' + sec}

                return {
                    ID : `${el.ID}. ${el.COMMENT}`,
                    date : `${year}. ${month}. ${date}`,
                    time : `${hours}:${min}:${sec}`
                }
            })

        })
    }

    getData();
    const interval = setInterval(getData, preset.getCycle[0])

    onDestroy(() => {
        clearInterval(interval)
    });

</script>

<div class="frame">
    <div class="title">
        <img src="widgetIcon/{pagename}.png" />
        우선신호 이력
    </div>
    <div class="content">
        <div class="grid">
            <div>
                <div style="color:#099999">출동 이력</div>
                <div class:wide>
                    {#each data.start as dt, ind}
                        {#if (wide && ind < 8) || ind < 4}
                        <div>
                            <div>
                                <!-- <div style="background-color:{statusColor[dt.status]}">{status[dt.status]}</div> -->
                                <div style="background-color:{statusColor[1]}">출동</div>
                                <div>
                                    <div>{dt.date}</div>
                                    <div>{dt.time}</div>
                                </div>
                            </div>
                            <div>
                                {dt.ID}
                            </div>
                            <div>
                                <!-- <img src="{division[dt.division]}.png"/> -->
                                <img src="firetruck.png"/>
                            </div>
                        </div>
                        {/if}
                    {/each}
                </div>
            </div>
            <div>
                <div style="color:#F9600E">출동종료 이력</div>
                <div class:wide>
                    {#each data.end as dt, ind}
                        {#if (wide && ind < 8) || ind < 4}
                        <!-- <div style="border:1px solid {statusColor[dt.status]}"> -->
                        <div>
                            <div>
                                <!-- <div style="background-color:{statusColor[dt.status]}">{status[dt.status]}</div> -->
                                <div style="background-color:{statusColor[2]}">종료</div>
                                <div>
                                    <div>{dt.date}</div>
                                    <div>{dt.time}</div>
                                </div>
                            </div>
                            <div>
                                {dt.ID}
                            </div>
                            <div>
                                <!-- <img src="{division[dt.division]}.png"/> -->
                                <img src="firetruck.png"/>
                            </div>
                        </div>
                        {/if}
                    {/each}
                </div>
            </div>
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
        .content {

        }
            .content .grid {
                display: grid;
                grid-template-rows: 1fr 1fr;
                gap:15px;
                width: 100%;
                height: 100%;
            }
                .content .grid > div {
                    display: grid;
                    grid-template-rows: 70px 1fr;
                    padding: 40px 30px;
                    box-sizing: border-box;
                    background-color: #000000;
                    border-radius: 15px;
                }
                    .content .grid > div > div:nth-of-type(1) {
                        font-weight: bold;
                        font-size: 1.2rem;
                    }
                    .content .grid > div > div:nth-of-type(2) {
                        display: grid;
                        gap: 12px;
                        grid-template-columns: repeat(4, 1fr);
                    }
                    .content .grid > div > div:nth-of-type(2).wide {
                        grid-template-columns: repeat(8, 1fr);
                    }
                        .content .grid > div > div:nth-of-type(2) > div {
                            display: grid;
                            padding: 15px;
                            grid-template-rows: 45px 1fr 1fr;
                            background-color: #131517;
                            overflow: hidden;
                            border-radius: 8px;
                        }
                            .content .grid > div > div:nth-of-type(2) > div > div:nth-of-type(1) {
                                display: grid;
                                font-size: 0.7rem;
                                letter-spacing : 3px;
                                color:#FFFFFF;
                                grid-template-columns: 45px 1fr;
                            }
                                .content .grid > div > div:nth-of-type(2) > div > div:nth-of-type(1) > div:nth-of-type(1) {
                                    border-radius: 4px;
                                    line-height: 45px;
                                    text-align: center;
                                }
                                .content .grid > div > div:nth-of-type(2) > div > div:nth-of-type(1) > div:nth-of-type(2) {
                                    display: grid;
                                    color: #9192AA;
                                    grid-template-rows: 1fr 1fr;
                                    padding-left: 9px;
                                }
                                    .content .grid > div > div:nth-of-type(2) > div > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) {
                                        font-size: 0.6rem;
                                    }
                            .content .grid > div > div:nth-of-type(2) > div > div:nth-of-type(2) {
                                padding-top:15px;
                                font-size: 0.9rem;
                                color:#FFFFFF;
                            }
                            .content .grid > div > div:nth-of-type(2) > div > div:nth-of-type(3) > img {
                                display: block;
                                width: 150px;
                                margin: 30px auto 0 auto;
                            }

</style>