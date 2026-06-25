import { useState, useEffect } from "react";

function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationalityId, setNationalityId] = useState("");
  const [nations, setNations] = useState([]);

  useEffect(() => {
    fetch("https://matchchase.onrender.com/players")
      .then((res) => res.json())
      .then(setPlayers)
      .catch(console.error);

    fetch("https://matchchase.onrender.com/nations")
      .then((res) => res.json())
      .then(setNations)
      .catch(console.error);
  }, []);

  const addPlayer = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName) return;

    const res = await fetch("https://matchchase.onrender.com/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        nationalityId: nationalityId ? parseInt(nationalityId) : null,
      }),
    });

    const newPlayer = await res.json();
    setPlayers([...players, newPlayer]);
    setFirstName("");
    setLastName("");
    setNationalityId("");
  };

  return (
    <div>
      <h2>Players</h2>
      <form onSubmit={addPlayer}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <select
          value={nationalityId}
          onChange={(e) => setNationalityId(e.target.value)}
        >
          <option value="">Select Nation</option>
          {nations.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
        <button type="submit">Add Player</button>
      </form>
      <ul>
        {players.map((p) => (
          <li key={p.id}>
            {p.firstName} {p.lastName}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlayersPage;
