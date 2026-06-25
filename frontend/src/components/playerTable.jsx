import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { getPlayers, addPlayer } from "../api";

export default function PlayerTable() {
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({ firstName: "", lastName: "", position: "" });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await getPlayers();
      setPlayers(res.data);
    } catch (err) {
      console.error("Error fetching players:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPlayer(form);
      setForm({ firstName: "", lastName: "", position: "" });
      fetchPlayers();
    } catch (err) {
      console.error("Error adding player:", err);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "firstName", headerName: "First Name", width: 150 },
    { field: "lastName", headerName: "Last Name", width: 150 },
    { field: "position", headerName: "Position", width: 150 },
  ];

  return (
    <div>
      <h2>Players</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        />
        <input
          type="text"
          placeholder="Position"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
        />
        <button type="submit">Add Player</button>
      </form>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid rows={players} columns={columns} pageSize={5} />
      </div>
    </div>
  );
}

