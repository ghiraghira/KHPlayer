import Player from './Components/Player';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    document.title = "KH Music Player";
  }, []);
  return (
    <Player/>
  );
}

export default App;
