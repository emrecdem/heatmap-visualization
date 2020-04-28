import React, { useState } from 'react';
import VideoView from './VideoView';
import Heatmap from './Heatmap';

function VideoTrackView() {

  const [cursor, setCursor] = useState(0);

  return <div>
      <VideoView width="1000" height="400" cursor={cursor} onCursorChange={c => { console.log("1:", c); setCursor(c) }}/>
      <Heatmap width="1000" height="400" cursor={cursor} onCursorChange={c => { console.log("2:", c); setCursor(c) }} />
  </div>
}

export default VideoTrackView;
