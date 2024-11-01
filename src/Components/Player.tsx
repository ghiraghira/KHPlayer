import React, { useEffect, useRef, useState } from "react";
import { songs } from './Songs';
import './Player.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faBackwardStep, faForwardStep, faPause, faShuffle, faRepeat, faArrowRight, faCircleStop, faVolumeHigh } from "@fortawesome/free-solid-svg-icons";

const Player: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [currentStamp, setCurrentStamp] = useState<number>(0);
  const [songLength, setSongLength] = useState<number>(0);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(error => {
        console.error("Error playing audio:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const playSong = async (index: number) => {
    if (index !== currentSong) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = songs[index].src;
        audioRef.current.load();
      }
      setLoading(true);
      setCurrentSong(index);
  
      if (audioRef.current) {
        audioRef.current.oncanplaythrough = async () => {
          try {
            await audioRef.current?.play();
            setIsPlaying(true);
          } catch (error) {
            console.error("Error playing audio:", error);
          } finally {
            setLoading(false);
          }
        };
      }
    } else {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play().catch(error => {
          console.error("Error playing audio:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchStamp = parseFloat(event.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = searchStamp;
    }
  };

  const updateCurrentStamp = () => {
    if (audioRef.current) {
      setCurrentStamp(audioRef.current.currentTime);
      setSongLength(audioRef.current.duration || 0);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => {
        if (repeat) {
          audio.currentTime = 0;
          audio.play().catch(error => console.error("Error replaying audio:", error));
        } else {
          nextTrack();
        }
      };

      audio.addEventListener('timeupdate', updateCurrentStamp);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', updateCurrentStamp);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [repeat, currentSong]);

  const nextTrack = () => {
    let nextIndex = currentSong + 1;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else if (nextIndex >= songs.length) {
      nextIndex = repeat ? 0 : songs.length - 1;
    }
    playSong(nextIndex);
  };
  const prevTrack = () => {
    let nextIndex = currentSong - 1;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else if (nextIndex >= songs.length) {
      nextIndex = repeat ? 0 : songs.length + 1;
    }
    playSong(nextIndex);
  };

  return (
    <div className="wholePlayer">
      <div className="interface">
        <p className="songInfo">Now Playing: {songs[currentSong].title}</p>
      <img src={songs[currentSong].cover} alt={songs[currentSong].title} className="coverImg"/>
      <audio ref={audioRef} />
      <div className="playerSliders">
        <input type="range" min={0} max={songLength} step={0.1} value={currentStamp} onChange={handleSearch} className="songBar" />
      </div>
      
      <div className="playerButtons">
        <button onClick={prevTrack} disabled={loading} className="nextButton"><FontAwesomeIcon icon={faBackwardStep} /></button>
        <button onClick={togglePlay} className="playButton">
          {isPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
        </button>
        <button onClick={nextTrack} disabled={loading} className="nextButton"><FontAwesomeIcon icon={faForwardStep} /></button>
        
        <button onClick={() => setShuffle(!shuffle)}>
          {shuffle ? <FontAwesomeIcon icon={faShuffle} /> : <FontAwesomeIcon icon={faCircleStop} />}
        </button>
        <button onClick={() => setRepeat(!repeat)} className="loopButton">
          {repeat ? <FontAwesomeIcon icon={faRepeat} /> : <FontAwesomeIcon icon={faArrowRight} />}
        </button>
      </div>
      <div className="playerSliders">
      <FontAwesomeIcon icon={faVolumeHigh} /> <input type="range" min={0} max={1} step={0.01} value={volume} onChange={handleVolume} className="volumeBar" />
      </div>
      </div>
      <div className="playList">
        {songs.map((song, index) => (
          <div key={index} className="songOrder">
            <span className="songNames">{song.title}</span>
            <button onClick={() => playSong(index)} disabled={loading} className="listButton">Play</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Player;

