import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Text, Breadcrumbs, Anchor } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';

// Define API URL
const API_URL = "https://matchchase.onrender.com/api/leagues";

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setError('');

    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load leagues');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setLeagues(data);
        } else {
          setLeagues([]);
        }
      })
      .catch(err => {
        console.error('Error fetching leagues:', err);
        setError('Failed to load leagues');
      })
      .finally(() => setLoading(false));
  };

  // Get the first league season (most recent season by name descending)
  const getFirstLeagueSeason = (league) => {
    if (!league.leagueSeasons || league.leagueSeasons.length === 0) return null;

    // Sort by season name descending to get the most recent season first (e.g. "23/24" before "22/23")
    const sortedSeasons = [...league.leagueSeasons].sort((a, b) => {
      const nameA = a.season?.name || '';
      const nameB = b.season?.name || '';
      return nameB.localeCompare(nameA);
    });

    return sortedSeasons[0];
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <Container fluid py="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs mb="xs">
        <Anchor component={Link} to="/">
          <IconHome size={16} /> Ana Sayfa
        </Anchor>
        <Text>Ligler</Text>
      </Breadcrumbs>
      <div style={{ padding: '20px', margin: '0 auto' }}>
        <h1>Ligler</h1>

        {/* Leagues Display */}
        <div>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          {leagues.length === 0 ? (
            <p>Mevcut ligler bulunamadı.</p>
          ) : (
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {leagues.map(league => {
                const firstLeagueSeason = getFirstLeagueSeason(league);
                const isClickable = !!firstLeagueSeason;

                const CardContent = (
                  <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: isClickable ? 'pointer' : 'default',
                    height: '100%',
                    opacity: isClickable ? 1 : 0.7
                  }}
                    onMouseEnter={(e) => {
                      if (isClickable) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isClickable) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>
                          {league.name}
                        </h3>
                        {league.nation && (
                          <p style={{ margin: '0 0 8px 0', color: '#666' }}>
                            <strong>Ülke:</strong> {league.nation.name}
                          </p>
                        )}
                      </div>

                      {/* Arrow Icon to indicate clickability */}
                      {isClickable && (
                        <div style={{ color: '#bdc3c7', fontSize: '20px' }}>›</div>
                      )}
                      {!isClickable && (
                        <div style={{ color: '#e74c3c', fontSize: '12px', fontWeight: 'bold' }}>Sezon Yok</div>
                      )}
                    </div>
                  </div>
                );

                return isClickable ? (
                  <Link
                    key={league.id}
                    to={`/league/${firstLeagueSeason.id}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                  >
                    {CardContent}
                  </Link>
                ) : (
                  <div key={league.id} style={{ display: 'block' }}>
                    {CardContent}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}