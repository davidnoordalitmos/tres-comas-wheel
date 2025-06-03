import { useState, useRef, useEffect } from "react";
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState<boolean[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);

  const addName = () => {
    if (name.trim() && !names.includes(name.trim())) {
      setNames([...names, name.trim()]);
      setChecked([...checked, true]); // Default to checked
      setName("");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addName();
  };

  // Only checked names are eligible for the wheel
  const checkedNames = names.filter((_, i) => checked[i]);

  const spinWheel = () => {
    if (checkedNames.length === 0) return;
    setSpinning(true);
    setSelected(null);
    setSelectedIndex(null);
    // Pick a random winner
    const winnerIndex = Math.floor(Math.random() * checkedNames.length);
    // Spin at least 5 full turns + land on winner AT TOP (0deg)
    const degreesPerSlice = 360 / checkedNames.length;
    // To align the winner at the pointer (top), rotate so winnerIndex lands at 0deg
    const targetRotation = 360 * 5 - winnerIndex * degreesPerSlice;
    setRotation(targetRotation);
    setTimeout(() => {
      setSelected(checkedNames[winnerIndex]);
      setSelectedIndex(winnerIndex);
      setSpinning(false);
      setRotation(targetRotation % 360);
      // Uncheck the winner in the list
      setChecked((prevChecked) => {
        const idx = names.findIndex(
          (n) => n === checkedNames[winnerIndex]
        );
        if (idx === -1) return prevChecked;
        return prevChecked.map((c, i) => (i === idx ? false : c));
      });
    }, 2500);
  };

  const handleCheck = (idx: number) => {
    setChecked((checked) =>
      checked.map((c, i) => (i === idx ? !c : c))
    );
  };
  const removeName = (idx: number) => {
    setNames((names) => names.filter((_, i) => i !== idx));
    setChecked((checked) => checked.filter((_, i) => i !== idx));
  };

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    names.forEach((n, i) => {
      params.append("name", n);
      params.append("checked", checked[i] ? "1" : "0");
    });
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }, [names, checked]);

  // Load state from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loadedNames: string[] = [];
    const loadedChecked: boolean[] = [];
    const nameParams = params.getAll("name");
    const checkedParams = params.getAll("checked");
    if (nameParams.length && checkedParams.length && nameParams.length === checkedParams.length) {
      for (let i = 0; i < nameParams.length; i++) {
        loadedNames.push(nameParams[i]);
        loadedChecked.push(checkedParams[i] === "1");
      }
      setNames(loadedNames);
      setChecked(loadedChecked);
    }
  }, []);

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
          {checkedNames.length === 0 ? (
            <div className="wheel-placeholder">
              Check names to spin the wheel
            </div>
          ) : (
            checkedNames.map((n, i) => (
              <div
                key={n}
                className={`wheel-slice${
                  selectedIndex === i ? " selected" : ""
                }`}
                style={{
                  transform: `rotate(${getRotation(
                    i,
                    checkedNames.length
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
        disabled={spinning || checkedNames.length === 0}
      >
        {spinning ? "Spinning..." : "Spin"}
      </button>
      {selected && !spinning && (
        <div className="winner">
          Winner: <span>{selected}</span>
        </div>
      )}
      <ul className="names-list">
        {names.map((n, i) => (
          <li key={n}>
            <input
              type="checkbox"
              checked={checked[i] || false}
              onChange={() => handleCheck(i)}
            />
            <span style={{ marginLeft: 8 }}>{n}</span>
            <button style={{ marginLeft: 8 }} onClick={() => removeName(i)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
