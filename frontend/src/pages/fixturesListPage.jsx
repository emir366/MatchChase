import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Card, 
  Group, 
  Title, 
  Text, 
  Loader, 
  Alert, 
  Breadcrumbs, 
  Anchor, 
  Stack, 
  Button, 
  ActionIcon,
  Badge
} from '@mantine/core';
import { IconHome, IconArrowLeft, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

const API_BASE = "https://matchchase.onrender.com/api/fixtures";

export default function MatchWeekPage() {
  const { leagueId, seasonId, matchWeekId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [matchWeeks, setMatchWeeks] = useState([]);
  const [currentMatchWeek, setCurrentMatchWeek] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const leagueName = searchParams.get('leagueName');
  const seasonName = searchParams.get('seasonName');

  useEffect(() => {
    if (leagueId && seasonId) {
      fetchMatchWeeks();
    }
  }, [leagueId, seasonId]);

  useEffect(() => {
    if (matchWeekId && matchWeeks.length > 0) {
      const matchWeek = matchWeeks.find(week => week.id.toString() === matchWeekId);
      if (matchWeek) {
        setCurrentMatchWeek(matchWeek);
        loadFixtures(matchWeek.id);
      }
    } else if (matchWeeks.length > 0 && !matchWeekId) {
      // If no specific match week in URL, use the first one
      setCurrentMatchWeek(matchWeeks[0]);
      loadFixtures(matchWeeks[0].id);
    }
  }, [matchWeekId, matchWeeks]);

  const fetchMatchWeeks = async () => {
    try {
      setLoading(true);
      // Matches route: /:leagueId/:seasonId/matchweeks
      const response = await fetch(`${API_BASE}/${leagueId}/${seasonId}/matchweeks`);
      
      if (!response.ok) throw new Error('Failed to fetch match weeks');
      const weeks = await response.json();
      setMatchWeeks(weeks);
      
    } catch (err) {
      setError('Failed to load match weeks');
      console.error('Error fetching match weeks:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFixtures = async (targetMatchWeekId) => {
    try {
      setLoading(true);
      // Matches route: /:leagueId/:seasonId/matchweeks/:matchWeekId/fixtures
      const response = await fetch(
        `${API_BASE}/${leagueId}/${seasonId}/matchweeks/${targetMatchWeekId}/fixtures`
      );
      
      if (!response.ok) throw new Error('Failed to fetch fixtures');
      const data = await response.json();
      setFixtures(data);
    } catch (err) {
      setError('Failed to load fixtures');
      console.error('Error fetching fixtures:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToMatchWeek = (direction) => {
    if (!matchWeeks.length || !currentMatchWeek) return;

    const currentIndex = matchWeeks.findIndex(week => week.id === currentMatchWeek.id);
    let newIndex;

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : matchWeeks.length - 1;
    } else {
      newIndex = currentIndex < matchWeeks.length - 1 ? currentIndex + 1 : 0;
    }

    const newMatchWeek = matchWeeks[newIndex];
    setCurrentMatchWeek(newMatchWeek);
    
    navigate(`/fixtures/${leagueId}/${seasonId}/${newMatchWeek.id}?leagueName=${encodeURIComponent(leagueName || '')}&seasonName=${encodeURIComponent(seasonName || '')}`);
    
    loadFixtures(newMatchWeek.id);
  };

  const getCurrentWeekIndex = () => {
    if (!matchWeeks.length || !currentMatchWeek) return 0;
    return matchWeeks.findIndex(week => week.id === currentMatchWeek.id) + 1;
  };

  const handleMatchWeekSelect = (matchWeek) => {
    setCurrentMatchWeek(matchWeek);
    navigate(`/fixtures/${leagueId}/${seasonId}/${matchWeek.id}?leagueName=${encodeURIComponent(leagueName || '')}&seasonName=${encodeURIComponent(seasonName || '')}`);
    loadFixtures(matchWeek.id);
  };

  // Helper to safely get team names
  const getHomeTeamName = (fixture) => 
    fixture.homeTeamName || fixture.homeClubSeason?.club?.name || 'Home Team';
  
  const getAwayTeamName = (fixture) => 
    fixture.awayTeamName || fixture.awayClubSeason?.club?.name || 'Away Team';

  if (loading && matchWeeks.length === 0) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center" py="xl">
          <Loader size="lg" />
          <Text>Fikstürler yükleniyor...</Text>
        </Group>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert color="red" title="Error">
          {error}
        </Alert>
        <Group mt="md">
          <Button 
            variant="light" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Geri
          </Button>
          <Button component={Link} to="/fixtures" variant="subtle">
            Go to Fixtures
          </Button>
        </Group>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs mb="xl">
        <Anchor component={Link} to="/">
          <IconHome size={16} /> Ana Sayfa
        </Anchor>
        <Anchor component={Link} to="/fixtures">
          Fikstürler
        </Anchor>
        <Text>{leagueName} - {seasonName}</Text>
      </Breadcrumbs>

      {/* Header */}
      <Stack gap="md" mb="xl">
        <Group>
          <Button 
            variant="subtle" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Geri
          </Button>
        </Group>
        
        {/* League & Season Info */}
        <Card shadow="md" p="xl">
          <Group justify="center" align="center">
            <Stack align="center" gap="xs">
              <Title order={1}>{leagueName}</Title>
              <Text size="xl" c="dimmed">{seasonName}</Text>
            </Stack>
          </Group>
        </Card>

        {/* Match Week Navigation */}
        {matchWeeks.length > 0 && (
          <Card shadow="sm" p="lg">
            <Group justify="center" align="center">
              <ActionIcon 
                size="xl" 
                variant="light"
                onClick={() => goToMatchWeek('prev')}
                disabled={matchWeeks.length <= 1}
              >
                <IconChevronLeft size={24} />
              </ActionIcon>
              
              <Stack align="center" gap="xs">
                <Title order={2}>
                  {currentMatchWeek?.weekNumber}. Hafta
                </Title>
                <Text c="dimmed">
                  {getCurrentWeekIndex()}/{matchWeeks.length}
                </Text>
                
                {/* Match Week Selector */}
                <Group>
                  {matchWeeks.map(week => (
                    <Badge
                      key={week.id}
                      variant={currentMatchWeek?.id === week.id ? 'filled' : 'outline'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleMatchWeekSelect(week)}
                    >
                      {week.weekNumber}. Hafta
                    </Badge>
                  ))}
                </Group>
              </Stack>
              
              <ActionIcon 
                size="xl" 
                variant="light"
                onClick={() => goToMatchWeek('next')}
                disabled={matchWeeks.length <= 1}
              >
                <IconChevronRight size={24} />
              </ActionIcon>
            </Group>
          </Card>
        )}
      </Stack>

      {/* Fixtures List */}
      <Grid gutter="xl">
        {fixtures.length > 0 ? (
          <Grid.Col span={12}>
            <Card shadow="sm" p="lg">
              <Title order={3} mb="md">Fikstürler</Title>
              
              <Stack gap="md">
                {fixtures.map(fixture => (
                  <Card 
                    key={fixture.id} 
                    component={Link}
                    to={`/fixtures/match/${fixture.id}`}
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
                    <Group justify="space-between" align="center">
                      <Group>
                        <div style={{ textAlign: 'right', minWidth: '150px' }}>
                          <Text fw={600} size="lg">{getHomeTeamName(fixture)}</Text>
                        </div>
                        
                        <div style={{ 
                          backgroundColor: '#f8f9fa', 
                          padding: '12px 24px', 
                          borderRadius: '8px',
                          minWidth: '120px',
                          textAlign: 'center'
                        }}>
                          {fixture.homeScore !== null && fixture.awayScore !== null ? (
                            <>
                              <Text fw={700} size="xl">
                                {fixture.homeScore} - {fixture.awayScore}
                              </Text>
                              {fixture.homeXg !== null && fixture.awayXg !== null && (
                                <Text size="xs" c="dimmed">
                                  xG: {fixture.homeXg?.toFixed(2)} - {fixture.awayXg?.toFixed(2)}
                                </Text>
                              )}
                            </>
                          ) : (
                            <Text fw={700} size="xl" c="dimmed">
                              VS
                            </Text>
                          )}
                        </div>
                        
                        <div style={{ textAlign: 'left', minWidth: '150px' }}>
                          <Text fw={600} size="lg">{getAwayTeamName(fixture)}</Text>
                        </div>
                      </Group>
                      
                      <div style={{ textAlign: 'right' }}>
                        {fixture.date && (
                          <Text size="sm">
                            {new Date(fixture.date).toLocaleDateString('en-GB')}
                          </Text>
                        )}
                        <Text size="sm" c="blue" mt={4}>
                          Maç ayrıntılarını görüntüle →
                        </Text>
                      </div>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
        ) : matchWeeks.length > 0 && !loading ? (
          <Grid.Col span={12}>
            <Card shadow="sm" p="xl" style={{ textAlign: 'center' }}>
              <Text size="xl" c="dimmed" py="xl">
                Bu hafta için fisktür bulunamadı {currentMatchWeek?.weekNumber}.
              </Text>
            </Card>
          </Grid.Col>
        ) : null}
      </Grid>
    </Container>
  );
}