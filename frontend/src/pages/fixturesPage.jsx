import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Grid, Card, Group, Title, Text, Loader, Alert, Breadcrumbs, Anchor, Stack, Badge } from '@mantine/core';
import { IconHome, IconCalendar } from '@tabler/icons-react';

// API Endpoint for all leagues (which includes nested season info)
const API_URL = 'https://matchchase.onrender.com/api/leagues';

export default function FixturesPage() {
  const [leagueGroups, setLeagueGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeagueGroups();
  }, []);

  const fetchLeagueGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch leagues');

      const data = await response.json();

      // Transformation: 
      // Backend returns 'leagueSeasons', but this component expects 'seasons'.
      // We map it here to keep the JSX cleaner.
      const transformedData = data.map(league => ({
        ...league,
        seasons: league.leagueSeasons // Rename key for compatibility
      }));

      setLeagueGroups(transformedData);
    } catch (err) {
      setError('Failed to load leagues');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center" py="xl">
          <Loader size="lg" />
          <Text>Ligler yükleniyor...</Text>
        </Group>
      </Container>
    );
  }

  return (
    <Container fluid py="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs mb="xl">
        <Anchor component={Link} to="/">
          <IconHome size={16} /> Ana Sayfa
        </Anchor>
        <Text>Fikstürler</Text>
      </Breadcrumbs>

      <Title order={1} mb="xl">Fikstürler</Title>

      {error && (
        <Alert color="red" title="Error" mb="xl">
          {error}
        </Alert>
      )}

      <Grid gutter="xl">
        {leagueGroups.map((leagueGroup) => (
          <Grid.Col span={12} key={leagueGroup.id}>
            <Card shadow="sm" p="lg">
              <Group justify="space-between" align="flex-start" mb="md">
                <div>
                  <Title order={2}>{leagueGroup.name}</Title>
                  {leagueGroup.nation && (
                    <Text c="dimmed">{leagueGroup.nation.name}</Text>
                  )}
                </div>
                <Badge color="blue" size="lg">
                  {leagueGroup.seasons?.length || 0} sezon
                </Badge>
              </Group>

              <Title order={4} mb="md">Sezonlar</Title>

              {leagueGroup.seasons && leagueGroup.seasons.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '10px'
                }}>
                  {/* Note: seasonData here is a 'LeagueSeason' object */}
                  {leagueGroup.seasons.map((seasonData) => (
                    <Card
                      key={seasonData.id}
                      component={Link}
                      // Corrected Link: /fixtures/:leagueId/:seasonId
                      to={`/fixtures/${leagueGroup.id}/${seasonData.season.id}?leagueName=${encodeURIComponent(leagueGroup.name)}&seasonName=${encodeURIComponent(seasonData.season.name)}`}
                      shadow="xs"
                      p="md"
                      style={{
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-xs)';
                      }}
                    >
                      <Stack gap="xs" align="center">
                        <IconCalendar size={24} color="#228be6" />
                        <Text fw={600} ta="center">{seasonData.season.name}</Text>
                        {/* Note: 'clubs' count might be 0 if not fetched by backend, handled gracefully */}
                        {seasonData.clubs && (
                          <Text size="sm" c="dimmed" ta="center">
                            {seasonData.clubs.length} takım
                          </Text>
                        )}
                        <Badge size="sm" variant="light">
                          Fikstürleri görüntüle →
                        </Badge>
                      </Stack>
                    </Card>
                  ))}
                </div>
              ) : (
                <Text c="dimmed" py="md" ta="center">
                  Mevcut sezon bulunmamaktır
                </Text>
              )}
            </Card>
          </Grid.Col>
        ))}

        {leagueGroups.length === 0 && !loading && (
          <Grid.Col span={12}>
            <Card shadow="sm" p="xl" style={{ textAlign: 'center' }}>
              <Text size="xl" c="dimmed" py="xl">
                Mevcut sezon bulunmamaktır.
              </Text>
            </Card>
          </Grid.Col>
        )}
      </Grid>
    </Container>
  );
}