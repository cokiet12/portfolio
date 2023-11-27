<script>
    import { ajax } from "$lib/functions.js";
    import preset from "../../settings.json"
    import { onDestroy } from 'svelte';

    export let pagename;
    export let data = [];
    const statusColor = ['#494948','#494948','#BCBF00'];
    const division = ['119','police'];

    let i = 0;
    function getData () {
        ajax('ppc_mo').then((res)=>{
            data = new Array();
            res.UC.forEach((el)=>{
                data.push({
                    deviceName: el.mobile_id,
                    division:0,
                    status:2
                })
            })
            res.UN.forEach((el)=>{
                data.push({
                    deviceName: el.mobile_id,
                    division:0,
                    status:1
                })
            })
        })
        // 가짜데이터
        // if (i % 2 == 1) {
        //     data = [
        //         {
        //             deviceName: '시흥소방서 단말기 #1',
        //             division: 0,
        //             status: 1
        //         },
        //         {
        //             deviceName: '시흥소방서 단말기 #2',
        //             division: 0,
        //             status: 0
        //         },
        //         {
        //             deviceName: '시흥소방서 단말기 #3',
        //             division: 0,
        //             status: 1
        //         },
        //         {
        //             deviceName: '시흥소방서 단말기 #4',
        //             division: 0,
        //             status: 1
        //         },
        //         {
        //             deviceName: '시흥소방서 단말기 #5',
        //             division: 0,
        //             status: 0
        //         },
        //         {
        //             deviceName: '시흥소방서 단말기 #6',
        //             division: 0,
        //             status: 1
        //         },
        //         {
        //             deviceName: '시흥소방서 단말기 #7',
        //             division: 0,
        //             status: 1
        //         },
        //         {
        //             deviceName: '시흥소방서 단말기 #8',
        //             division: 0,
        //             status: 0
        //         },
        //         {
        //             deviceName: '시흥경찰서 단말기 #1',
        //             division: 1,
        //             status: 0
        //         },
        //         {
        //             deviceName: '시흥경찰서 단말기 #2',
        //             division: 1,
        //             status: 0
        //         }
        //     ];
        // } else {
        //     data = [
        //         {
        //             deviceName: '시흥소방서 단말기 #1',
        //             division: 0,
        //             status: 1
        //         },
        //         {
        //             deviceName: '시흥소방서 단말기 #2',
        //             division: 0,
        //             status: 0
        //         },
        //         {
        //             deviceName: '시흥소방서 단말기 #3',
        //             division: 0,
        //             status: 0
        //         },
        //         {
        //             deviceName: '시흥소방서 단말기 #4',
        //             division: 0,
        //             status: 0
        //         },
        //         {
        //             deviceName: '시흥소방서 단말기 #5',
        //             division: 0,
        //             status: 0
        //         },
        //         {
        //             deviceName: '시흥소방서 단말기 #6',
        //             division: 0,
        //             status: 1
        //         },
        //         {
        //             deviceName: '시흥소방서 단말기 #7',
        //             division: 0,
        //             status: 1
        //         },
        //         {
        //             deviceName: '시흥소방서 단말기 #8',
        //             division: 0,
        //             status: 1
        //         },
        //         {
        //             deviceName: '시흥경찰서 단말기 #1',
        //             division: 1,
        //             status: 0
        //         },
        //         {
        //             deviceName: '시흥경찰서 단말기 #2',
        //             division: 1,
        //             status: 0
        //         }
        //     ];
        // }
        // i++;
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
        우선신호 단말기 현황
    </div>
    <div class="content">
        <div class="grid">
            {#each data as dt, ind}
                {#if ind < 10}
                <div class:nouse={dt.status==0}>
                    <div>
                        <img src="{division[dt.division]}.png" />
                    </div>
                    <div>{dt.deviceName}</div>
                    <div>
                        <div style="background-color:{statusColor[dt.status]}"></div>
                    </div>
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
                background-color: #202020;
                border-radius: 15px;
                padding: 30px;
                box-sizing: border-box;
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: repeat(5, 1fr);
                gap:12px;
                width: 100%;
                height: 100%;
            }
                .content .grid > div {
                    display: grid;
                    grid-template-columns: 110px 1fr 50px; 
                    background-color: #1C1C1E;
                    border-radius: 8px;
                }
                .content .grid > .nouse {
                    opacity: 70%;
                }
                    .content .grid > div > div:nth-of-type(1) > img {
                        display: block;
                        margin: 30px auto;
                        width: 60%;
                    }
                    .content .grid > div > div:nth-of-type(2) {
                        padding-top: 45px;
                        color:#CCCCCC;
                    }
                    .content .grid > div > div:nth-of-type(3) > div {
                        margin: 15px auto;
                        transition: background-color 0.7s ease-in;
                        width:30px;
                        height: 30px;
                        border-radius: 100%;
                    }

</style>