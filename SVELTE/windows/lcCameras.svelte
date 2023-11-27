<script>
    export let lc = new Object();
    export let winOpen;

    import { ajax } from "$lib/functions.js";
    import Hls from 'hls.js' 
    import { onMount, onDestroy } from 'svelte'

    const dirName = ['동','서','남','북','북동','북서','남동','남서','예비'];
    let cameraInfo = [];

    let hlsArr = new Array();
    const hlsConfig = {
        fragLoadingTimeOut: 3000,
        fragLoadingMaxRetry: 5,
        fragLoadingMaxRetryTimeout: 15000
    }
    ajax(`ntcs_m_camera_lc?lcno=${lc.lcno}`).then((res)=>{
        cameraInfo = res
        // console.log(lc)
        // console.log(cameraInfo)
    })
    
    /**
     * @param {{ target: Element; }} th
     */
    function mouseenter (th) {
        const tg = th.target;
        document.onwheel = (e)=>{
            tg.scrollLeft = tg.scrollLeft - (e.wheelDelta * 2);
        }
    }

    //241, 245,
    function streamVideo () {
        hlsArr = new Array();
        ajax(`ntcs_m_camera_lc?lcno=${lc.lcno}`).then((res)=>{
            let videoDiv = document.querySelector('#videoDiv')
            res.forEach((v) => {
                let div = document.createElement("div");
                let div1 = document.createElement("div");
                let div2 = document.createElement("div");
                let errCnt = 0;
                div2.id = v.lcno + '_' + dirName[v.dir]
                videoDiv.appendChild(div)
                div.appendChild(div1);
                div.appendChild(div2);

                div1.innerHTML = dirName[v.dir];
                let videoTag = document.createElement("video")
                videoTag.autoplay = true;
                videoTag.controls = true;
                videoTag.preload = "auto";
                videoTag.loop = true;
                div2.appendChild(videoTag)



                if(v.camera_id && v.auth_key && v.info){
                    
                    let videoSrc = `http://192.168.10.52:8888/${v.camera_id}/index.m3u8`

                    if (videoTag.canPlayType('application/vnd.apple.mpegurl')){
                    // if (videoTag.canPlayType('video/mp4')){
                        videoTag.src = videoSrc;
                    } else if (Hls.isSupported()) {
                        let hls = new Hls(hlsConfig);

                        function hlsEv (e, data) {
                            console.error(`${dirName[v.dir]} 에러-${data.details} / "${data.error.message}"`)
                            console.error(data)
                            hls.recoverMediaError();
                            errCnt++;
                            if (errCnt > 0) {
                                hls.destroy();
                                errCnt = 0;
                                setTimeout(()=>{
                                    console.log(dirName[v.dir] + " 재시작")
                                    hls = new Hls(hlsConfig);
                                    hls.loadSource(videoSrc);
                                    hls.attachMedia(videoTag);
                                    hls.on(Hls.Events.ERROR, hlsEv);
                                }, 5000)
                            }
                        }

                        hlsArr.push(hls);
                        hls.loadSource(videoSrc);
                        hls.attachMedia(videoTag);
                        hls.on(Hls.Events.ERROR, hlsEv);
                    }
                }
            })
        })
    }

    onMount(()=>{
        streamVideo();
    })

    onDestroy(()=>{
        hlsArr.forEach((v)=>{
            v.detachMedia();
            v.destroy();
        })
    })
</script>

<div class="lcCameras">
    <div>
        교차로 : {lc.lcno}. {lc.lcname}
    </div>
    <div id="videoDiv" on:mouseenter={mouseenter} on:mouseleave={()=>{document.onwheel = null}} style="grid-template-columns: repeat( {cameraInfo.length}, 1fr )">
        <!-- {#each cameraInfo as cam, ind}
            <div>
                <div>
                    {cam.dir}
                </div>
                <div id={cam.lcno + '_' + cam.dir}>
                    <video autoplay controls preload="auto" loop>
                    </video>
                </div>
            </div>
        {/each} -->
    </div>
</div>

<style>
    .lcCameras {
        display: grid;
        grid-template-rows: 50px 1fr;
        padding: 11px;
        box-sizing: border-box;
        width:100%;
        height:100%;
    }
        .lcCameras > div:nth-of-type(1) {
            background-color: #333;
            padding: 6px 30px;
            border-radius: 11px;
        }
        .lcCameras > div:nth-of-type(2) {
            display: grid;
            padding-top: 15px;
            padding-bottom: 15px;
            gap: 15px;
            grid-template-rows: 100%;
            height:703px;
            /* scroll-behavior: smooth; */
            overflow-x: scroll;
            overflow-y: hidden;
        }
        .lcCameras > div:nth-of-type(2)::-webkit-scrollbar { width: 15px; height: 15px; outline: 3px solid rgba(250, 250, 250, 0.8); background-color: rgba(250, 250, 250, 0.8); }
        .lcCameras > div:nth-of-type(2)::-webkit-scrollbar-thumb { background-color:rgba(150, 150, 150, 0.7); border-radius: 2px; }
        .lcCameras > div:nth-of-type(2)::-webkit-scrollbar-thumb:hover { background-color:rgba(150, 150, 150, 1); }
            /* 카메라칸 */
            .lcCameras > div:nth-of-type(2) > :global(div){ 
                position: relative;
                border-radius: 7px;
                background-color: #444;
            }
                .lcCameras > div:nth-of-type(2) > :global(div > div:first-of-type) { 
                    z-index: 1;
                    position: absolute;
                    transform: translate(-50%, -50%);
                    font-weight: bold;
                    left: 50%;
                    top: 35px;
                    width: 55px;
                    height: 40px;
                    text-align: center;
                    padding: 3px 15px;
                    border-radius: 7px;
                    background-color: black;
                    opacity: 0.7;
                }

                    .lcCameras > div:nth-of-type(2) > :global(div > div > video) {
                        /* width: 1230px; */
                        height: 690px;
                    }
</style>