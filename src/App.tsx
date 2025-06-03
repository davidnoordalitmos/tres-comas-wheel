import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingWinnerIndex, setPendingWinnerIndex] = useState<number | null>(null);
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
    const winnerIndex = Math.floor(Math.random() * checkedNames.length);
    const degreesPerSlice = 360 / checkedNames.length;
    const targetRotation = 360 * 5 - winnerIndex * degreesPerSlice;
    setRotation(targetRotation);
    setTimeout(() => {
      setSelected(checkedNames[winnerIndex]);
      setSelectedIndex(winnerIndex);
      setSpinning(false);
      setRotation(targetRotation % 360);
      setPendingWinnerIndex(winnerIndex);
      setShowModal(true);
    }, 2500);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (pendingWinnerIndex !== null) {
      // Remove winner from wheel (uncheck)
      setChecked((prevChecked) => {
        const idx = names.findIndex((n) => n === checkedNames[pendingWinnerIndex]);
        if (idx === -1) return prevChecked;
        return prevChecked.map((c, i) => (i === idx ? false : c));
      });
      setPendingWinnerIndex(null);
    }
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
            checkedNames.map((n, i) => {
              const wedgeColor = `hsl(${(i * 360) / checkedNames.length}, 70%, 70%)`;
              const degreesPerSlice = 360 / checkedNames.length;
              const startAngle = i * degreesPerSlice;
              const endAngle = (i + 1) * degreesPerSlice;
              const toRadians = (deg: number) => (deg * Math.PI) / 180;
              const x1 = 50 + 50 * Math.cos(toRadians(startAngle - 90));
              const y1 = 50 + 50 * Math.sin(toRadians(startAngle - 90));
              const x2 = 50 + 50 * Math.cos(toRadians(endAngle - 90));
              const y2 = 50 + 50 * Math.sin(toRadians(endAngle - 90));
              const largeArc = degreesPerSlice > 180 ? 1 : 0;
              const path = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
              // Center label: place at 50% radius, at the middle angle of the segment
              const midAngle = startAngle + degreesPerSlice / 2;
              const labelRadius = 25; // 50% of radius (SVG is 100x100)
              const labelX = 50 + labelRadius * Math.cos(toRadians(midAngle - 90));
              const labelY = 50 + labelRadius * Math.sin(toRadians(midAngle - 90));
              return (
                <svg
                  key={n}
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 100"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    zIndex: selectedIndex === i ? 2 : 1,
                    pointerEvents: "none",
                  }}
                >
                  <path
                    d={path}
                    fill={wedgeColor}
                    style={{
                      transition: "filter 0.3s, box-shadow 0.3s",
                      filter: selectedIndex === i ? "brightness(1.2)" : undefined,
                      boxShadow: selectedIndex === i ? "0 0 16px #61dafb" : undefined,
                    }}
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize="6"
                    fill="#222"
                    fontWeight="bold"
                    style={{
                      userSelect: "none",
                      pointerEvents: "none",
                      textShadow: "0 1px 2px #fff8"
                    }}
                  >
                    {n}
                  </text>
                </svg>
              );
            })
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
      {showModal && selected && !spinning && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "1rem",
            padding: "2rem 3rem",
            boxShadow: "0 4px 32px #0003",
            textAlign: "center"
          }}>
            <h2>Winner!</h2>
            <div style={{ fontSize: "2rem", color: "#61dafb", margin: "1rem 0" }}>{selected}</div>
            <button onClick={handleCloseModal} style={{
              padding: "0.7rem 2rem",
              fontSize: "1.1rem",
              borderRadius: "1rem",
              border: "none",
              background: "#646cff",
              color: "#fff",
              cursor: "pointer"
            }}>OK</button>
          </div>
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
