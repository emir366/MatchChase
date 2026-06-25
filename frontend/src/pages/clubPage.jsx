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
  Card,
  Tabs,
  Stack,
  Table,
  Avatar,
  Badge,
  Grid,
  Center,
  SegmentedControl
} from '@mantine/core';
import {
  IconHome,
  IconUsers,
  IconCalendarEvent,
  IconArrowsLeftRight,
  IconArrowLeft
} from '@tabler/icons-react';

export default function ClubPage() {
  const { clubSeasonId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('fixtures');
  const [fixtureFilter, setFixtureFilter] = useState('all');

  // Context Data
  const [context, setContext] = useState(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [error, setError] = useState(null);

  // Tab Data
  const [squad, setSquad] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loadingTabData, setLoadingTabData] = useState(false);

  // 1. Fetch Context (Club Info & Season Selector)
  useEffect(() => {
    if (!clubSeasonId) return;
    setLoadingContext(true);
    setError(null);

    fetch(`https://matchchase.onrender.com/api/clubs/season/${clubSeasonId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch club context');
        return res.json();
      })
      .then(data => setContext(data))
      .catch(err => setError(err.message))
      .finally(() => setLoadingContext(false));
  }, [clubSeasonId]);

  // 2. Fetch Tab Data when tab changes
  useEffect(() => {
    if (!clubSeasonId) return;

    const fetchTabData = async () => {
      setLoadingTabData(true);
      try {
        let url = '';
        if (activeTab === 'squad') url = `https://matchchase.onrender.com/api/clubs/season/${clubSeasonId}/squad`;
        else if (activeTab === 'fixtures') url = `https://matchchase.onrender.com/api/clubs/season/${clubSeasonId}/fixtures`;
        else if (activeTab === 'transfers') url = `https://matchchase.onrender.com/api/clubs/season/${clubSeasonId}/transfers`;

        const res = await fetch(url);
        const data = await res.json();

        if (activeTab === 'squad') setSquad(data);
        if (activeTab === 'fixtures') setFixtures(data);
        if (activeTab === 'transfers') setTransfers(data);

      } catch (err) {
        console.error("Tab fetch error", err);
      } finally {
        setLoadingTabData(false);
      }
    };

    fetchTabData();
  }, [activeTab, clubSeasonId]);

  // Handlers
  const handleSeasonChange = (newVal) => {
    if (newVal) navigate(`/club/${newVal}`);
  };

  const getHomeTeamName = (f) => f.homeTeamName || f.homeClubSeason?.club?.name || 'Home';
  const getAwayTeamName = (f) => f.awayTeamName || f.awayClubSeason?.club?.name || 'Away';

  const filteredFixtures = fixtures.filter(f => {
    if (fixtureFilter === 'home') {
      // Keep if current club is Home
      return f.homeClubSeasonId === parseInt(clubSeasonId);
    }
    if (fixtureFilter === 'away') {
      // Keep if current club is Away
      return f.awayClubSeasonId === parseInt(clubSeasonId);
    }
    // Default 'all'
    return true;
  });

  // Loading States
  if (loadingContext) {
    return <Container size="xl" py="xl"><Group justify="center"><Loader /><Text>Takım verileri yükleniyor...</Text></Group></Container>;
  }

  if (error || !context) {
    return <Container size="xl" py="xl"><Alert color="red">{error || 'Club context not found'}</Alert></Container>;
  }

  const { club, leagueSeason } = context;
  const seasonOptions = club.clubSeasons.map(cs => ({
    value: cs.id.toString(),
    label: cs.leagueSeason?.season?.name || 'Unknown Season'
  }));

  return (
    <Container fluid py="xl">
      <Breadcrumbs mb="xl">
        <Anchor component={Link} to="/"><IconHome size={16} /> Ana Sayfa</Anchor>
        <Anchor component={Link} to="/clubs">Takımlar</Anchor>
        <Text>{club.name} - {leagueSeason?.season?.name}</Text>
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

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} mb="xs">{club.name}</Title>
            {club.nation && <Text size="lg" c="dimmed"><strong>Ülke:</strong> {club.nation.name}</Text>}
            {leagueSeason && (
              <Text size="md" c="black">
                Lig:{" "}
                <Anchor component={Link} to={`/league/${leagueSeason.id}`} style={{ textDecoration: 'none', color: 'blue' }}>
                  {leagueSeason.league?.name} - {leagueSeason.season?.name}
                </Anchor>
              </Text>
            )}
          </div>
        </Group>
      </div>

      {/* Tabs & Selector */}
      <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
        <Tabs.List mb="md">
          <Tabs.Tab value="fixtures" leftSection={<IconCalendarEvent size={16} />}>Fikstür</Tabs.Tab>
          <Tabs.Tab value="squad" leftSection={<IconUsers size={16} />}>Kadro</Tabs.Tab>
          <Tabs.Tab value="transfers" leftSection={<IconArrowsLeftRight size={16} />}>Transferler</Tabs.Tab>

          {/* Season Selector */}
          {seasonOptions.length > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: '4px' }}>
              <Select
                value={clubSeasonId}
                onChange={handleSeasonChange}
                data={seasonOptions}
                allowDeselect={false}
                size="xs"
                style={{ width: 140 }}
              />
            </div>
          )}
        </Tabs.List>

        {/* 1. FIXTURES TAB */}
        <Tabs.Panel value="fixtures">
          {loadingTabData ? (
            <Group justify="center" py="xl"><Loader /></Group>
          ) : fixtures.length === 0 ? (
            <Alert color="gray">Fikstür bulunamadı.</Alert>
          ) : (
            <Stack gap="md">
              {/* SegmentedControl for filtering Home/Away/All */}
              <Group justify="center" mb="sm">
                <SegmentedControl
                  value={fixtureFilter}
                  onChange={setFixtureFilter}
                  data={[
                    { label: 'Tümü', value: 'all' },
                    { label: 'İç Saha', value: 'home' },
                    { label: 'Deplasman', value: 'away' },
                  ]}
                />
              </Group>

              {filteredFixtures.length === 0 ? (
                <Alert color="yellow" variant="light" ta="center">
                  Bu filtre kriterine uygun maç bulunamadı.
                </Alert>
              ) : (
                filteredFixtures.map(fixture => (
                  <Card
                    key={fixture.id}
                    component={Link}
                    to={`/fixtures/match/${fixture.id}`}
                    shadow="xs" p="lg" withBorder
                    style={{ textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#339af0'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#dee2e6'}
                  >
                    <Grid align="center" gutter="xs">
                      <Grid.Col span={4} style={{ textAlign: 'right' }}>
                        <Text fw={fixture.homeClubSeasonId === parseInt(clubSeasonId) ? 900 : 500} size="lg">
                          {getHomeTeamName(fixture)}
                        </Text>
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <Center>
                          <div style={{ backgroundColor: '#f8f9fa', padding: '8px 16px', borderRadius: '8px', minWidth: '80px', textAlign: 'center' }}>
                            {fixture.homeScore !== null && fixture.awayScore !== null ? (
                              <Text fw={700} size="xl">{fixture.homeScore} - {fixture.awayScore}</Text>
                            ) : <Text fw={700} c="dimmed" size="lg">VS</Text>}
                          </div>
                        </Center>
                      </Grid.Col>
                      <Grid.Col span={4} style={{ textAlign: 'left' }}>
                        <Text fw={fixture.awayClubSeasonId === parseInt(clubSeasonId) ? 900 : 500} size="lg">
                          {getAwayTeamName(fixture)}
                        </Text>
                      </Grid.Col>
                      <Grid.Col span={12} style={{ textAlign: 'center', paddingTop: 0 }}>
                        {fixture.date && <Text size="xs" c="dimmed">{new Date(fixture.date).toLocaleDateString('tr')}</Text>}
                      </Grid.Col>
                    </Grid>
                  </Card>
                ))
              )}
            </Stack>
          )}
        </Tabs.Panel>

        {/* 2. SQUAD TAB */}
        <Tabs.Panel value="squad">
          {loadingTabData ? (
            <Group justify="center" py="xl"><Loader /></Group>
          ) : squad.length === 0 ? (
            <Alert color="gray">Kadro bilgisi bulunamadı.</Alert>
          ) : (
            <Card withBorder p={0}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Forma No</Table.Th>
                    <Table.Th>Oyuncu</Table.Th>
                    <Table.Th>Pozisyon</Table.Th>
                    <Table.Th>Uyruk</Table.Th>
                    <Table.Th>Yaş</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {squad.map(m => (
                    <Table.Tr key={m.id}>
                      <Table.Td>{m.player?.shirtNumber || '-'}</Table.Td>
                      <Table.Td>
                        <Text fw={500}>
                          {[m.player?.firstName, m.player?.lastName].join(' ')}
                        </Text>
                      </Table.Td>
                      <Table.Td>{m.player?.position || '-'}</Table.Td>
                      <Table.Td>{m.player?.nationality?.name || '-'}</Table.Td>
                      <Table.Td>
                        {m.player?.dateOfBirth
                          ? new Date().getFullYear() - new Date(m.player.dateOfBirth).getFullYear()
                          : '-'}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          )}
        </Tabs.Panel>

        {/* 3. TRANSFERS TAB */}
        <Tabs.Panel value="transfers">
          {loadingTabData ? (
            <Group justify="center" py="xl"><Loader /></Group>
          ) : transfers.length === 0 ? (
            <Alert color="gray">Transfer verisi bulunamadı.</Alert>
          ) : (
            <Card withBorder p={0}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Tarih</Table.Th>
                    <Table.Th>Oyuncu</Table.Th>
                    <Table.Th>Tür</Table.Th>
                    <Table.Th>Yön</Table.Th>
                    <Table.Th>Takım</Table.Th>
                    <Table.Th>Bonservis</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {transfers.map(t => {
                    const isIncoming = t.toClubSeasonId === parseInt(clubSeasonId);
                    const otherClub = isIncoming ? t.fromClubSeason?.club : t.toClubSeason?.club;

                    return (
                      <Table.Tr key={t.id}>
                        <Table.Td>{new Date(t.date).toLocaleDateString('tr')}</Table.Td>
                        <Table.Td fw={500}>{[t.player?.firstName, t.player?.lastName].join(' ')}</Table.Td>
                        <Table.Td>{t.transferType || 'Transfer'}</Table.Td>
                        <Table.Td>
                          <Badge color={isIncoming ? 'green' : 'red'}>
                            {isIncoming ? 'Gelen' : 'Giden'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {otherClub ? otherClub.name : (isIncoming ? 'Serbest' : 'Serbest')}
                        </Table.Td>
                        <Table.Td>
                          {t.fee ? `€${(t.fee / 1000000).toFixed(1)}m` : '-'}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Card>
          )}
        </Tabs.Panel>

      </Tabs>
    </Container>
  );
}