# Radio Mode Architecture - State Management Solution

## The Problem We Solved

### Original Issue
When `currentSong` becomes `null`, the entire `<MediaPlayer>` component unmounts, causing:
1. **Lost AudioContext** - The Web Audio API context is destroyed
2. **Lost Radio Mode state** - User's preference is forgotten
3. **Broken experience** - User must re-enable Radio Mode for every new song

### Why This Happened
```javascript
// In CurrentSong.js - Conditional rendering
{currentSong ? (
  <MediaPlayer />  // This unmounts when currentSong becomes null
) : (
  <div>No song playing</div>
)}
```

## The Solution: Lift State Up

### Architecture Overview
```
CurrentSong.js (Parent)
├── State: isRadioMode ✅ Persists across unmounts
├── Ref: audioContextRef ✅ Survives component lifecycle
└── Conditionally renders:
    └── MediaPlayer.js (Child)
        └── RadioModeControl.js (Grandchild)
            └── Uses parent's state & audioContextRef
```

### Component Responsibilities

#### **CurrentSong.js** (State Owner)
- **Owns** `isRadioMode` state
- **Owns** `audioContextRef` (persistent AudioContext)
- **Passes** these down to MediaPlayer as props
- **Survives** when song becomes null

#### **MediaPlayer.js** (Pass-through)
- **Receives** Radio Mode props from parent
- **Passes** them down to RadioModeControl
- Can mount/unmount without affecting Radio Mode state

#### **RadioModeControl.js** (UI & Logic)
- **Receives** state from parent via props
- **Uses** parent's audioContextRef
- **Controls** audio pipe creation/destruction
- **Monitors** video element changes

## Key Changes Made

### 1. CurrentSong.js - State Lifted
```javascript
const CurrentSong = () => {
  // ... existing state ...
  
  // NEW: Radio Mode state lives here
  const [isRadioMode, setIsRadioMode] = useState(false);
  const audioContextRef = useRef(null); // Persistent AudioContext
  
  return (
    {currentSong ? (
      <MediaPlayer
        isRadioMode={isRadioMode}
        setIsRadioMode={setIsRadioMode}
        audioContextRef={audioContextRef}
      />
    ) : (
      <div>
        No song playing
        {isRadioMode && <div>🎵 Radio Mode ON - Waiting...</div>}
      </div>
    )}
  );
};
```

### 2. MediaPlayer.js - Props Pass-through
```javascript
const MediaPlayer = ({ 
  videoId, 
  startTime, 
  songData,
  isRadioMode,        // NEW: From parent
  setIsRadioMode,     // NEW: From parent
  audioContextRef     // NEW: From parent
}) => {
  // ... player logic ...
  
  return (
    <RadioModeControl 
      player={playerInstance}
      isRadioMode={isRadioMode}
      setIsRadioMode={setIsRadioMode}
      audioContextRef={audioContextRef}
    />
  );
};
```

### 3. RadioModeControl.js - Uses Parent State
```javascript
const RadioModeControl = ({ 
  player, 
  isRadioMode,        // From parent (CurrentSong)
  setIsRadioMode,     // From parent
  audioContextRef     // From parent
}) => {
  // No longer manages its own state!
  // Uses parent's audioContextRef instead of local ref
  
  const toggleRadioMode = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    setIsRadioMode(prev => !prev);
  };
  
  // Always render button (even if player is null)
  return <Button onClick={toggleRadioMode}>...</Button>;
};
```

## Flow Diagram

### Scenario: Song Ends → Queue Empty → New Song Added

```
1. Song ends, currentSong becomes null
   ├── CurrentSong.js: Still mounted ✅
   ├── isRadioMode: Still true ✅
   ├── audioContextRef.current: AudioContext still exists ✅
   └── MediaPlayer: UNMOUNTS ❌
       └── RadioModeControl: UNMOUNTS ❌

2. User adds new song to queue

3. Socket event: currentSongUpdated
   ├── CurrentSong.js: Receives new song
   ├── isRadioMode: Still true ✅
   └── MediaPlayer: REMOUNTS with new videoId
       └── RadioModeControl: REMOUNTS
           ├── Receives isRadioMode=true from parent
           ├── Receives audioContextRef from parent
           ├── Player instance available
           └── Immediately creates audio pipe ✅

4. Result: Audio plays through Web Audio API automatically!
```

## Benefits of This Architecture

### 1. **State Persistence**
- Radio Mode preference survives across song changes
- No need to re-enable manually

### 2. **AudioContext Reuse**
- Single AudioContext for entire session
- More efficient (browser limits concurrent contexts)
- No "unlock" needed on subsequent songs

### 3. **Better UX**
- User can enable Radio Mode once
- Works seamlessly for all subsequent songs
- Clear feedback when waiting for next song

### 4. **Clean Separation of Concerns**
- CurrentSong: Business logic & state
- MediaPlayer: YouTube player management
- RadioModeControl: Audio routing & UI

## Testing Checklist

- [x] Enable Radio Mode with song playing
- [x] Minimize tab - audio continues ✅
- [x] Song changes via socket - audio continues ✅
- [x] Song ends, queue empty - Radio Mode state preserved ✅
- [x] New song added - Radio Mode automatically active ✅
- [x] Disable Radio Mode - returns to normal YouTube audio ✅
- [x] Re-enable Radio Mode - uses existing AudioContext ✅

## Technical Details

### Why AudioContext Must Live in Parent
```javascript
// ❌ WRONG: AudioContext in child component
const RadioModeControl = () => {
  const audioContextRef = useRef(null);
  // This gets destroyed when component unmounts!
};

// ✅ CORRECT: AudioContext in parent component
const CurrentSong = () => {
  const audioContextRef = useRef(null);
  // This survives child unmounts!
};
```

### Why State Must Live in Parent
```javascript
// ❌ WRONG: State in child
const RadioModeControl = () => {
  const [isRadioMode, setIsRadioMode] = useState(false);
  // Lost when MediaPlayer unmounts!
};

// ✅ CORRECT: State in parent
const CurrentSong = () => {
  const [isRadioMode, setIsRadioMode] = useState(false);
  // Available even when MediaPlayer doesn't exist!
};
```

## Conclusion

By lifting Radio Mode state to the parent component (`CurrentSong.js`), we ensure:
1. User preferences persist across song changes
2. AudioContext remains alive throughout the session
3. Seamless experience when songs change or queue becomes empty
4. Efficient resource usage (single AudioContext)

This architectural pattern (lifting state up) is a fundamental React principle and the correct solution for cross-component state that needs to survive child unmounts.
