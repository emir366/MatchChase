import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Container, Text, Breadcrumbs, Anchor } from '@mantine/core';
import { IconHome} from '@tabler/icons-react';

// Define API URL (Use localhost if running backend locally, or your Render URL)
const API_URL = "https://matchchase.onrender.com/api/nations";
// const API_URL = "http://localhost:4000/api/nations"; // Use this if testing locally

export default function NationsPage() {
  const [nations, setNations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch nations");
        return res.json();
      })
      .then((data) => {
        // Ensure we actually got an array back
        if (Array.isArray(data)) {
          setNations(data);
        } else {
          console.error("API did not return an array:", data);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load nations.");
      });
  }, []);

  return (
    <Container py = "xl">
    {/* Breadcrumbs */}
      <Breadcrumbs mb="xs">
        <Anchor component={Link} to="/">
          <IconHome size={16} /> Ana Sayfa
        </Anchor>
        <Text>Ülkeler</Text>
      </Breadcrumbs>
      <div style={{ padding: "20px" }}>
        <h1>Ülkeler</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <ul>
          {nations.map((n) => (
            <li key={n.id} style={{ marginBottom: "5px" }}>
              {n.name}
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}