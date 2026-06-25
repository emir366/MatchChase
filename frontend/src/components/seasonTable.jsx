import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { getSeasons, addSeason } from "../api";

export default function SeasonTable() {
  const [seasons, setSeasons] = useState([]);
  const [form, setForm] = useState({ yearStart: "", yearEnd: "" });

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      const res = await getSeasons();
      setSeasons(res.data);
    } catch (err) {
      console.error("Error fetching seasons:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addSeason({
        yearStart: parseInt(form.yearStart),
        yearEnd: parseInt(form.yearEnd),
      });
      setForm({ yearStart: "", yearEnd: "" });
      fetchSeasons();
    } catch (err) {
      console.error("Error adding season:", err);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "yearStart", headerName: "Start Year", width: 150 },
    { field: "yearEnd", headerName: "End Year", width: 150 },
  ];

  return (
    <div>
      <h2>Seasons</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="number"
          placeholder="Start Year"
          value={form.yearStart}
          onChange={(e) => setForm({ ...form, yearStart: e.target.value })}
        />
        <input
          type="number"
          placeholder="End Year"
          value={form.yearEnd}
          onChange={(e) => setForm({ ...form, yearEnd: e.target.value })}
        />
        <button type="submit">Add Season</button>
      </form>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid rows={seasons} columns={columns} pageSize={5} />
      </div>
    </div>
  );
}

