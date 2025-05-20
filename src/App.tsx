import { useState, useRef } from "react";
import "./App.css";

function getRotation(index: number, total: number) {
  return (360 / total) * index;
}

function App() {
  const [name, setName] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const addName = () => {
    if (name.trim() && !names.includes(name.trim())) {
      setNames([...names, name.trim()]);
      setName("");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addName();
  };

  const spinWheel = () => {
    if (names.length === 0) return;
    setSpinning(true);
    setSelected(null);
    // Pick a random winner
    const winnerIndex = Math.floor(Math.random() * names.length);
    // Spin at least 5 full turns + land on winner
    const degreesPerSlice = 360 / names.length;
    const targetRotation = 360 * 5 + (360 - winnerIndex * degreesPerSlice);
    setRotation(targetRotation);
    setTimeout(() => {
      setSelected(names[winnerIndex]);
      setSpinning(false);
      setRotation(targetRotation % 360);
    }, 2500);
  };

  return (
    <div className="wheel-app">
      <h1>Name Wheel Spinner</h1>
      <div className="input-section">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Enter a name"
        />
        <button onClick={addName}>Add</button>
      </div>
      <div className="wheel-container">
        <div
          className="wheel"
          ref={wheelRef}
          style={{
            transition: spinning
              ? "transform 2.5s cubic-bezier(.17,.67,.83,.67)"
              : "none",
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {names.length === 0 ? (
            <div className="wheel-placeholder">Add names to spin the wheel</div>
          ) : (
            names.map((n, i) => (
              <div
                key={n}
                className={`wheel-slice${selected === n ? " selected" : ""}`}
                style={{
                  transform: `rotate(${getRotation(
                    i,
                    names.length
                  )}deg) translateY(-50%)`,
                }}
              >
                <span>{n}</span>
              </div>
            ))
          )}
        </div>
        <div className="wheel-pointer">▼</div>
      </div>
      <button
        className="spin-btn"
        onClick={spinWheel}
        disabled={spinning || names.length === 0}
      >
        {spinning ? "Spinning..." : "Spin"}
      </button>
      {selected && !spinning && (
        <div className="winner">
          Winner: <span>{selected}</span>
        </div>
      )}
    </div>
  );
}

export default App;
