import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { getClubs, addClub } from "../api";

export default function ClubTable() {
  const [clubs, setClubs] = useState([]);
  const [form, setForm] = useState({ name: "" });

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await getClubs();
      setClubs(res.data);
    } catch (err) {
      console.error("Error fetching clubs:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addClub(form);
      setForm({ name: "" });
      fetchClubs();
    } catch (err) {
      console.error("Error adding club:", err);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Name", width: 200 },
  ];

  return (
    <div>
      <h2>Clubs</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Club Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <button type="submit">Add Club</button>
      </form>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid rows={clubs} columns={columns} pageSize={5} />
      </div>
    </div>
  );
}

