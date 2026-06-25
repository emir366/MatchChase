import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Breadcrumbs, 
  Button,
  Anchor, 
  Text, 
  Loader, 
  Alert, 
  Title, 
  Group, 
  Select, 
  Grid, 
  Card,
  Tabs,
  Stack,
  ActionIcon,
  Badge
} from '@mantine/core';
import { 
  IconHome, 
  IconUsers, 
  IconCalendarEvent, 
  IconChevronLeft, 
  IconChevronRight,
  IconArrowLeft
} from '@tabler/icons-react';

export default function LeaguePage() {
  const { leagueSeasonId } = useParams();
  const navigate = useNavigate();
  
  // --- UI State ---
  const [activeTab, setActiveTab] = useState('teams');

  // --- League/Season State ---
  const [league, setLeague] = useState(null);
  const [currentLeagueSeason, setCurrentLeagueSeason] = useState(null);
  const [clubSeasons, setClubSeasons] = useState([]);
  const [leagueLoading, setLeagueLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fixture/MatchWeek State ---
  const [matchWeeks, setMatchWeeks] = useState([]);
  const [currentMatchWeek, setCurrentMatchWeek] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [fixturesLoading, setFixturesLoading] = useState(false);

  // 1. Fetch League Context
  useEffect(() => {
    if (!leagueSeasonId) return;
    
    setLeagueLoading(true);
    setError(null);

    fetch(`https://matchchase.onrender.com/api/leagues/season/${leagueSeasonId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch league data');
        return res.json();
      })
      .then(leagueSeasonData => {
        setCurrentLeagueSeason(leagueSeasonData);
        setLeague(leagueSeasonData.league);
        
        // Sort club seasons alphabetically
        if (leagueSeasonData.clubSeasons) {
          const sortedClubSeasons = [...leagueSeasonData.clubSeasons].sort((a, b) => 
            a.club.name.localeCompare(b.club.name)
          );
          setClubSeasons(sortedClubSeasons);
        }
      })
      .catch(err => {
        console.error('Error fetching league season:', err);
        setError('Failed to load league season');
      })
      .finally(() => setLeagueLoading(false));
  }, [leagueSeasonId]);

  // 2. Fetch Match Weeks (Only when Fixture tab is active)
  useEffect(() => {
    if (activeTab === 'fixtures' && currentLeagueSeason) {
      fetchMatchWeeks();
    }
  }, [activeTab, currentLeagueSeason]);

  const fetchMatchWeeks = async () => {
    if (!currentLeagueSeason) return;
    setFixturesLoading(true);
    try {
      const { leagueId, seasonId } = currentLeagueSeason;
      const response = await fetch(`https://matchchase.onrender.com/api/fixtures/${leagueId}/${seasonId}/matchweeks`);
      if (!response.ok) throw new Error('Failed to fetch match weeks');
      const weeks = await response.json();
      setMatchWeeks(weeks);
      
      // Select first week by default if none selected
      if (weeks.length > 0 && !currentMatchWeek) {
        const firstWeek = weeks[0];
        setCurrentMatchWeek(firstWeek);
        loadFixtures(leagueId, seasonId, firstWeek.id);
      } else if (weeks.length > 0 && currentMatchWeek) {
        loadFixtures(leagueId, seasonId, currentMatchWeek.id);
      } else {
        setFixturesLoading(false);
      }
    } catch (err) {
      console.error(err);
      setFixturesLoading(false);
    }
  };

  // 3. Fetch Fixtures for specific week
  const loadFixtures = async (leagueId, seasonId, mwId) => {
    setFixturesLoading(true);
    try {
      const response = await fetch(
        `https://matchchase.onrender.com/api/fixtures/${leagueId}/${seasonId}/matchweeks/${mwId}/fixtures`
      );
      if (!response.ok) throw new Error('Failed to fetch fixtures');
      const data = await response.json();
      setFixtures(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFixturesLoading(false);
    }
  };

  // --- Handlers ---
  const handleSeasonChange = (newVal) => {
    if (newVal) {
      setMatchWeeks([]);
      setCurrentMatchWeek(null);
      setFixtures([]);
      navigate(`/league/${newVal}`);
    }
  };

  const handleMatchWeekSelect = (matchWeek) => {
    setCurrentMatchWeek(matchWeek);
    if(currentLeagueSeason) {
      loadFixtures(currentLeagueSeason.leagueId, currentLeagueSeason.seasonId, matchWeek.id);
    }
  };

  const goToMatchWeek = (direction) => {
    if (!matchWeeks.length || !currentMatchWeek || !currentLeagueSeason) return;
    const currentIndex = matchWeeks.findIndex(week => week.id === currentMatchWeek.id);
    let newIndex = direction === 'prev' 
      ? (currentIndex > 0 ? currentIndex - 1 : matchWeeks.length - 1)
      : (currentIndex < matchWeeks.length - 1 ? currentIndex + 1 : 0);
    
    const newMatchWeek = matchWeeks[newIndex];
    setCurrentMatchWeek(newMatchWeek);
    loadFixtures(currentLeagueSeason.leagueId, currentLeagueSeason.seasonId, newMatchWeek.id);
  };

  const getHomeTeamName = (f) => f.homeTeamName || f.homeClubSeason?.club?.name || 'Home';
  const getAwayTeamName = (f) => f.awayTeamName || f.awayClubSeason?.club?.name || 'Away';
  const getCurrentWeekIndex = () => {
    if (!matchWeeks.length || !currentMatchWeek) return 0;
    return matchWeeks.findIndex(week => week.id === currentMatchWeek.id) + 1;
  };

  // --- Main Render ---

  if (leagueLoading) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center"><Loader size="lg" /><Text>Lig verileri yükleniyor...</Text></Group>
      </Container>
    );
  }

  if (error) {
    return <Container size="xl" py="xl"><Alert color="red" title="Error">{error}</Alert></Container>;
  }

  if (!currentLeagueSeason || !league) return null;

  const seasonOptions = league.leagueSeasons
    ?.sort((a, b) => b.season.name.localeCompare(a.season.name))
    .map(ls => ({ value: ls.id.toString(), label: ls.season.name })) || [];

  return (
    <Container size="xl" py="xl">
      <Breadcrumbs mb="xl">
        <Anchor component={Link} to="/"><IconHome size={16} /> Ana Sayfa</Anchor>
        <Anchor component={Link} to="/leagues">Ligler</Anchor>
        <Text>{league.name} - {currentLeagueSeason.season.name}</Text>
      </Breadcrumbs>

      {/* Back Button */}
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
      </Stack>

      {/* League Header & Season Selector */}
      <div style={{ marginBottom: '20px' }}>
        <Group justify="space-between" align="flex-start" mb="md">
          <div>
            <Title order={1} mb="xs">{league.name} - {currentLeagueSeason.season.name}</Title>
            {league.nation && <Text size="lg" c="dimmed"><strong>Ülke:</strong> {league.nation.name}</Text>}
          </div>
        </Group>
      </div>

      {/* TABS NAVIGATION */}
      <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md" mb="lg">
        <Tabs.List mb="md">
          <Tabs.Tab value="teams" leftSection={<IconUsers size={16} />}>
            Takımlar ({clubSeasons.length})
          </Tabs.Tab>
          <Tabs.Tab value="fixtures" leftSection={<IconCalendarEvent size={16} />}>
            Fikstür
          </Tabs.Tab>
          {seasonOptions.length > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: '4px' }}>
              <Select 
                placeholder="Sezon Seç"
                value={currentLeagueSeason.id.toString()}
                onChange={handleSeasonChange}
                data={seasonOptions}
                allowDeselect={false}
                size="xs"
                style={{ width: 140 }}
              />
            </div>
          )}
        </Tabs.List>

        {/* ---------------- TAB: TEAMS ---------------- */}
        <Tabs.Panel value="teams">
          {clubSeasons.length === 0 ? (
            <Alert color="gray" variant="light">No clubs found for this league season</Alert>
          ) : (
            <Grid gutter="lg">
              {clubSeasons.map(clubSeason => (
                <Grid.Col key={clubSeason.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <Link to={`/club/${clubSeason.id}`} style={{ textDecoration: 'none' }}>
                    <Card 
                      shadow="sm" padding="lg" radius="md" withBorder
                      style={{ height: '100%', transition: 'transform 0.2s, box-shadow 0.2s' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Title order={4} mb="xs" c="dark">{clubSeason.club.name}</Title>
                      <Group gap="xs" mb="xs">
                        {clubSeason.club.nation && <Text size="sm" c="dimmed">{clubSeason.club.nation.name}</Text>}
                      </Group>
                    </Card>
                  </Link>
                </Grid.Col>
              ))}
            </Grid>
          )}
        </Tabs.Panel>

        {/* ---------------- TAB: FIXTURES ---------------- */}
        <Tabs.Panel value="fixtures">
          {fixturesLoading && matchWeeks.length === 0 ? (
            <Group justify="center" py="xl"><Loader /></Group>
          ) : matchWeeks.length === 0 ? (
            <Alert color="blue">Bu sezon için henüz fikstür oluşturulmamış.</Alert>
          ) : (
            <Stack gap="lg">
              {/* Match Week Controller */}
              <Card shadow="sm" p="lg" withBorder>
                <Group justify="center" align="center">
                  <ActionIcon size="lg" variant="light" onClick={() => goToMatchWeek('prev')}><IconChevronLeft size={20} /></ActionIcon>
                  <Stack align="center" gap={0}>
                    <Title order={3}>{currentMatchWeek?.weekNumber}. Hafta</Title>
                    <Text size="xs" c="dimmed">{getCurrentWeekIndex()} / {matchWeeks.length}</Text>
                  </Stack>
                  <ActionIcon size="lg" variant="light" onClick={() => goToMatchWeek('next')}><IconChevronRight size={20} /></ActionIcon>
                </Group>
                <Group justify="center" mt="md" style={{ overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: '5px' }}>
                   {matchWeeks.map(week => (
                      <Badge 
                        key={week.id} 
                        variant={currentMatchWeek?.id === week.id ? 'filled' : 'outline'} 
                        style={{ cursor: 'pointer', flexShrink: 0 }} 
                        onClick={() => handleMatchWeekSelect(week)}
                      >
                        {week.weekNumber}
                      </Badge>
                    ))}
                </Group>
              </Card>

              {/* Fixtures List - Wide Format (Group based like MatchWeekPage) */}
              {fixturesLoading ? (
                 <Group justify="center" py="xl"><Loader size="sm" /></Group>
              ) : fixtures.length > 0 ? (
                <Card shadow="sm" p="lg" withBorder>
                  <Stack gap="md">
                    {fixtures.map(fixture => (
                      <Card 
                        key={fixture.id} 
                        component={Link} 
                        to={`/fixtures/match/${fixture.id}`}
                        shadow="xs" 
                        p="md" // Standard padding
                        withBorder
                        style={{ textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#339af0';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#dee2e6';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* MATCH WEEK PAGE STYLE LAYOUT */}
                        <Group justify="space-between" align="center">
                          <Group>
                            {/* Home Team */}
                            <div style={{ textAlign: 'right', minWidth: '150px' }}>
                              <Text fw={600} size="lg">{getHomeTeamName(fixture)}</Text>
                            </div>
                            
                            {/* Score Box */}
                            <div style={{ 
                              backgroundColor: '#f8f9fa', 
                              padding: '12px 24px', 
                              borderRadius: '8px', 
                              minWidth: '120px', 
                              textAlign: 'center' 
                            }}>
                              {fixture.homeScore !== null && fixture.awayScore !== null ? (
                                <>
                                  <Text fw={700} size="xl">{fixture.homeScore} - {fixture.awayScore}</Text>
                                  {fixture.homeXg !== null && fixture.awayXg !== null && (
                                    <Text size="xs" c="dimmed">
                                      xG: {fixture.homeXg?.toFixed(2)} - {fixture.awayXg?.toFixed(2)}
                                    </Text>
                                  )}
                                </>
                              ) : (
                                <Text fw={700} size="xl" c="dimmed">VS</Text>
                              )}
                            </div>

                            {/* Away Team */}
                            <div style={{ textAlign: 'left', minWidth: '150px' }}>
                              <Text fw={600} size="lg">{getAwayTeamName(fixture)}</Text>
                            </div>
                          </Group>
                          
                          {/* Right Side Link/Date */}
                          <div style={{ textAlign: 'right' }}>
                            {fixture.date && (
                              <Text size="sm">
                                {new Date(fixture.date).toLocaleDateString('tr')}
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
              ) : (
                <Alert color="yellow">Bu hafta için maç bulunamadı.</Alert>
              )}
            </Stack>
          )}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}