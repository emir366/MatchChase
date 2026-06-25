import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
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
  Table,
  Badge,
  ScrollArea
} from '@mantine/core';
import { IconHome, IconArrowLeft, IconCalendar, IconScoreboard, IconStar, IconNotes, IconShield, IconChartBar } from '@tabler/icons-react';

export default function FixtureDetail() {
  const { fixtureId } = useParams();
  const navigate = useNavigate();

  const [fixture, setFixture] = useState(null);
  // events/gkPerf are now part of the main fixture object, but we can keep state for easier access
  const [events, setEvents] = useState([]);
  const [gkPerf, setGkPerf] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadFixtureData() {
      try {
        setLoading(true);
        setError('');

        if (!fixtureId) throw new Error('Fixture id missing');

        // Single fetch to the main ID endpoint
        // The backend now includes events and gkPerf in this single response
        const response = await fetch(`https://matchchase.onrender.com/api/fixtures/${fixtureId}`);

        if (!response.ok) {
          throw new Error(`Fikstür yüklenemedi: (status ${response.status})`);
        }

        const data = await response.json();

        setFixture(data);
        setEvents(data.events || []);
        setGkPerf(data.gkPerf || null);

      } catch (err) {
        setError(err.message || 'Unknown error');
        console.error('Fikstür yüklenemedi:', err);
      } finally {
        setLoading(false);
      }
    }

    if (fixtureId) loadFixtureData();
  }, [fixtureId]);


  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center" py="xl">
          <Loader size="lg" />
          <Text>Maç ayrıntıları yükleniyor...</Text>
        </Group>
      </Container>
    );
  }

  if (error || !fixture) {
    return (
      <Container size="xl" py="xl">
        <Alert color="red" title="Error" mb="md">
          {error || 'Fikstür bulunamadı'}
        </Alert>
        <Group>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Geri
          </Button>
          <Button component={Link} to="/fixtures" variant="subtle">
            Fikstürlere dön
          </Button>
        </Group>
      </Container>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr');
  };

  const getRatingColor = (rating) => {
    if (!rating) return 'gray';
    return rating >= 90 ? 'blue' :
      rating >= 70 ? 'green' :
        rating >= 50 ? 'yellow' : 'red';
  };

  const getPlayerName = (event) => {
    if (event.playerFirstName === '-') {
      return event.playerLastName;
    }
    return [event.playerFirstName, event.playerLastName].filter(Boolean).join(' ') || 'Unknown Player';
  };

  const getAssistingPlayerName = (event) => {
    if (event.aPlayerFN === '-') {
      return event.aPlayerLN;
    }
    return [event.aPlayerFN, event.aPlayerLN].filter(Boolean).join(' ') || '-';
  };

  const getOutcomeColor = (outcome) => {
    if (!outcome) return 'gray';
    const lowerOutcome = outcome.toLowerCase();
    if (lowerOutcome.includes('kendi')) return 'red';
    if (lowerOutcome.includes('gol')) return 'green';
    if (lowerOutcome.includes('miss') || lowerOutcome.includes('kaçır')) return 'yellow';
    if (lowerOutcome.includes('yakın')) return 'yellow';
    if (lowerOutcome.includes('kaleci') || lowerOutcome.includes('save')) return 'blue';
    if (lowerOutcome.includes('blok')) return 'orange';
    if (lowerOutcome.includes('direk')) return 'yellow';
    if (lowerOutcome.includes('çizgi')) return 'pink';
    return 'gray';
  };

  const getGkPlayerName = (firstName, lastName) => {
    if (firstName === '-') {
      return lastName;
    }
    return [firstName, lastName].filter(Boolean).join(' ') || 'Unknown Goalkeeper';
  };

  // Helper to get team ID safely from the nested relationship
  const getHomeTeamId = () => fixture.homeClubSeason?.clubId || '#';
  const getAwayTeamId = () => fixture.awayClubSeason?.clubId || '#';

  const getMatchWeekUrl = () => {
    if (!fixture.leagueSeason) return '/fixtures';

    const leagueId = fixture.leagueSeason.leagueId;
    const seasonId = fixture.leagueSeason.seasonId;
    const matchWeekId = fixture.matchWeekId;
    const leagueName = fixture.leagueSeason.league?.name;
    const seasonName = fixture.leagueSeason.season?.name;

    return `/fixtures/${leagueId}/${seasonId}/${matchWeekId}?leagueName=${encodeURIComponent(leagueName)}&seasonName=${encodeURIComponent(seasonName)}`;
  };

  return (
    <Container fluid py="xl" style={{ maxWidth: '100%', overflow: 'hidden' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs mb="xl">
        <Anchor component={Link} to="/">
          <IconHome size={16} /> Ana Sayfa
        </Anchor>
        <Anchor component={Link} to="/fixtures">
          Fikstürler
        </Anchor>
        {fixture.leagueSeason && (
          <Anchor component={Link} to={getMatchWeekUrl()}>
            {fixture.leagueSeason.league?.name} - {fixture.leagueSeason.season?.name}
          </Anchor>
        )}
        <Text>Maç Ayrıntıları</Text>
      </Breadcrumbs>

      {/* Header */}
      <Stack gap="md" mb="xl">
        <Group justify="space-between">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Geri
          </Button>
          <Button
            component={Link}
            to={`/fixtures/match/${fixtureId}/statistics`}
            variant="light"
            rightSection={<IconChartBar size={16} />}
          >
            İstatistikler
          </Button>
        </Group>

        {/* Match Header */}
        <Card shadow="md" p="xl">
          <Group justify="center" align="center">
            <Stack align="center" gap="xs">
              <Group align="center">
                <Stack align="end" gap="xs" style={{ minWidth: 200 }}>
                  <Title order={2}>
                    <Anchor
                      href={`/club/${getHomeTeamId()}`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        fontSize: 'inherit',
                        fontWeight: 'inherit'
                      }}
                    >
                      {fixture.homeTeamName}
                    </Anchor>
                  </Title>
                  {fixture.homeFormation && (
                    <Badge variant="light" color="blue">
                      {fixture.homeFormation}
                    </Badge>
                  )}
                </Stack>

                <Card shadow="sm" p="lg" style={{ minWidth: 150, textAlign: 'center' }}>
                  {fixture.homeScore !== null && fixture.awayScore !== null ? (
                    <Stack gap="xs">
                      <Title order={1}>
                        {fixture.homeScore} - {fixture.awayScore}
                      </Title>
                      {fixture.homeXg !== null && fixture.awayXg !== null && (
                        <Text size="sm" c="dimmed">
                          xG: {fixture.homeXg?.toFixed(2)} - {fixture.awayXg?.toFixed(2)}
                        </Text>
                      )}
                    </Stack>
                  ) : (
                    <Stack gap="xs">
                      <Title order={3} c="dimmed">VS</Title>
                      <Text size="sm" c="dimmed">
                        {fixture.date ? 'Scheduled' : 'TBD'}
                      </Text>
                    </Stack>
                  )}
                </Card>

                <Stack align="start" gap="xs" style={{ minWidth: 200 }}>
                  <Title order={2}>
                    <Anchor
                      href={`/club/${getAwayTeamId()}`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        fontSize: 'inherit',
                        fontWeight: 'inherit'
                      }}
                    >
                      {fixture.awayTeamName}
                    </Anchor>
                  </Title>
                  {fixture.awayFormation && (
                    <Badge variant="light" color="red">
                      {fixture.awayFormation}
                    </Badge>
                  )}
                </Stack>
              </Group>

              <Group gap="xs" mt="md">
                <IconCalendar size={18} />
                <Text size="lg" c="dimmed">
                  {formatDate(fixture.date)}
                </Text>
              </Group>
            </Stack>
          </Group>
        </Card>
      </Stack>

      {/* Events Section */}
      <Card shadow="sm" p="lg" style={{ overflow: 'visible' }}>
        <Group justify="space-between" mb="md">
          <Title order={3}>
            <IconScoreboard size={20} style={{ marginRight: 8 }} />
            Maç Ayrıntıları
          </Title>
          <Badge variant="filled" color="blue">
            {events.length} Ayrıntı
          </Badge>
        </Group>

        {events.length === 0 ? (
          <Card withBorder p="xl" style={{ textAlign: 'center' }}>
            <Text size="xl" c="dimmed" py="xl">
              Bu maç için ayrıntı bulunmamaktadır.
            </Text>
          </Card>
        ) : (
          <ScrollArea>
            <Table
              striped
              highlightOnHover
              style={{
                width: '100%',
                tableLayout: 'auto'
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>Dakika</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>Takım</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>Oyuncu</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>Pozisyon</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>Reyting</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>Şut Bölgesi</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>Şut Tipi</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>Pozisyon Gelişimi</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>xG</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>xGOT</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>Büyük Şans</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>Sonuç</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>Skor</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>Asist</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {events.map((event) => (
                  <Table.Tr key={event.id}>
                    {/* Minute */}
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      <Badge variant="light">
                        {event.minuteStr ? event.minuteStr : (event.minute ? `${event.minute}'` : 'N/A')}'
                      </Badge>
                    </Table.Td>

                    {/* Team */}
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      <Text fw={500}>{event.teamName}</Text>
                    </Table.Td>

                    {/* Player */}
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      <Text>{getPlayerName(event)}</Text>
                    </Table.Td>

                    {/* Position */}
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      <Text size="sm">
                        {event.playerPos || '-'}
                      </Text>
                    </Table.Td>

                    {/* Rating */}
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      {event.playerRating ? (
                        <Badge
                          color={getRatingColor(event.playerRating)}

                          variant="light"
                          leftSection={<IconStar size={12} />}
                        >
                          {event.playerRating}
                        </Badge>
                      ) : (
                        <Text c="dimmed">-</Text>
                      )}
                    </Table.Td>

                    {/* Shot Area */}
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      {event.shotArea ? (
                        <Badge color="gray" variant="outline" size="xs">
                          {event.shotArea}
                        </Badge>
                      ) : (
                        <Text c="dimmed">-</Text>
                      )}
                    </Table.Td>

                    {/* Shot Type */}
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      {event.shotType ? (
                        <Badge color="violet" variant="light" size="xs">
                          {event.shotType}
                        </Badge>
                      ) : (
                        <Text c="dimmed">-</Text>
                      )}
                    </Table.Td>

                    {/* Lead Up */}
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      {event.eventLeadUp ? (
                        <Badge color="cyan" variant="light" size="xs">
                          {event.eventLeadUp}
                        </Badge>
                      ) : (
                        <Text c="dimmed">-</Text>
                      )}
                    </Table.Td>

                    {/* xG */}
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      {event.xG ? (
                        <Badge color={event.xG > 0.3 ? 'red' : 'blue'} variant="light">
                          {event.xG.toFixed(2)}
                        </Badge>
                      ) : (
                        <Text c="dimmed">-</Text>
                      )}
                    </Table.Td>

                    {/* xGOT */}
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      {event.xGOT ? (
                        <Badge color={event.xGOT > 0.3 ? 'orange' : 'green'} variant="light">
                          {event.xGOT.toFixed(2)}
                        </Badge>
                      ) : (
                        <Text c="dimmed">-</Text>
                      )}
                    </Table.Td>

                    {/* Big Chance */}
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      {event.bigChance ? (
                        <Badge color="red" variant="filled">
                          Evet
                        </Badge>
                      ) : (
                        <Text c="dimmed">-</Text>
                      )}
                    </Table.Td>

                    {/* Outcome */}
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      {event.outcome ? (
                        <Badge color={getOutcomeColor(event.outcome)} variant="light">
                          {event.outcome}
                        </Badge>
                      ) : (
                        <Text c="dimmed">-</Text>
                      )}
                    </Table.Td>

                    {/* Score */}
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      {event.score ? (
                        <Badge color="dark" variant="filled">
                          {event.score}
                        </Badge>
                      ) : (
                        <Text c="dimmed">-</Text>
                      )}
                    </Table.Td>

                    {/* Assisting Player */}
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      <Text size="sm">{getAssistingPlayerName(event)}</Text>
                    </Table.Td>

                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Card>

      {/* Match Notes Section */}
      {fixture.notes && (
        <Card shadow="sm" p="lg" mb="md">
          <Group justify="space-between" mb="md">
            <Title order={3}>
              <IconNotes size={20} style={{ marginRight: 8 }} />
              Maç Notları
            </Title>
          </Group>
          <Card withBorder p="md">
            <Text style={{ whiteSpace: 'pre-wrap' }}>
              {fixture.notes}
            </Text>
          </Card>
        </Card>
      )}

      {/* Goalkeepers' Performances Section */}
      {gkPerf && (
        <Card shadow="sm" p="lg" mt="md">
          <Group justify="space-between" mb="md">
            <Title order={3}>
              <IconShield size={20} style={{ marginRight: 8 }} />
              Kaleci Performansları
            </Title>
          </Group>

          {/* Detailed Stats Table */}
          <Card withBorder mt="md">
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Kaleci</Table.Th>
                  <Table.Th>Takım</Table.Th>
                  <Table.Th>Reyting</Table.Th>
                  <Table.Th>Hata</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>
                    <Text fw={500}>
                      {getGkPlayerName(gkPerf.homeGkFn, gkPerf.homeGkLn)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="blue" variant="light">
                      {fixture.homeTeamName}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {gkPerf.homeGkRating ? (
                      <Badge
                        color={getRatingColor(gkPerf.homeGkRating)}
                        variant="light"
                        leftSection={<IconStar size={12} />}
                      >
                        {gkPerf.homeGkRating}
                      </Badge>
                    ) : (
                      <Text c="dimmed">-</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={
                        gkPerf.homeGkSaves === 0 ? 'green' :
                          gkPerf.homeGkSaves === 1 ? 'yellow' :
                            'red'
                      }
                      variant="light"
                    >
                      {gkPerf.homeGkSaves ?? 0}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>
                    <Text fw={500}>
                      {getGkPlayerName(gkPerf.awayGkFn, gkPerf.awayGkLn)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="red" variant="light">
                      {fixture.awayTeamName}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {gkPerf.awayGkRating ? (
                      <Badge
                        color={getRatingColor(gkPerf.awayGkRating)}
                        variant="light"
                        leftSection={<IconStar size={12} />}
                      >
                        {gkPerf.awayGkRating}
                      </Badge>
                    ) : (
                      <Text c="dimmed">-</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={
                        gkPerf.awayGkSaves === 0 ? 'green' :
                          gkPerf.awayGkSaves === 1 ? 'yellow' :
                            'red'
                      }
                      variant="light"
                    >
                      {gkPerf.awayGkSaves ?? 0}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Card>
        </Card>
      )}

      {/* Show message if no goalkeeper data available */}
      {!loading && !gkPerf && (
        <Card shadow="sm" p="lg" mt="md">
          <Card withBorder p="xl" style={{ textAlign: 'center' }}>
            <Text size="xl" c="dimmed" py="xl">
              Bu maç için kaleci performans verisi bulunmamaktadır.
            </Text>
          </Card>
        </Card>
      )}
    </Container>
  );
}