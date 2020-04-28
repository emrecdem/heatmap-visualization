import React from 'react';
import VideoPlayer from 'react-video-js-player';

function VideoView(props) {
    const cursor = props.cursor;
    const onCursorChange = props.onCursorChange;
  
    let player = {}
    const state = {
        video: {
            src: "P1_S2_LSB_HM1_Cfront.mp4"
        }
    }
 
    function onPlayerReady(_player) {
        console.log("Player is ready: ", _player);
        player = _player;
        player.currentTime(cursor);
    }
 
    function onVideoPlay(duration){
        console.log("Video played at: ", duration);
    }
 
    function onVideoPause(duration){
        console.log("Video paused at: ", duration);
    }
 
    function onVideoTimeUpdate(duration){
        console.log("Time updated: ", duration);
        onCursorChange(duration);
    }
 
    function onVideoSeeking(duration){
        console.log("Video seeking: ", duration);
    }
 
    function onVideoSeeked(from, to){
        console.log(`Video seeked from ${from} to ${to}`);
    }
 
    function onVideoEnd(){
        console.log("Video ended");
    }
 
    return (
        <div>
            <VideoPlayer
                controls={true}
                src={state.video.src}
                poster={state.video.poster}
                width={props.width}
                height={props.height}
                onReady={onPlayerReady}
                onPlay={onVideoPlay}
                onPause={onVideoPause}
                onTimeUpdate={onVideoTimeUpdate}
                onSeeking={onVideoSeeking}
                onSeeked={onVideoSeeked}
                onEnd={onVideoEnd}
            />
        </div>
    );

}
export default VideoView;
