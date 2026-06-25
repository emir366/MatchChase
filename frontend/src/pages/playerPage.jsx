import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Grid, Card, Group, Title, Text, Loader, Alert, Badge, Breadcrumbs, Anchor, Stack, Table, Button } from '@mantine/core';
import { IconHome, IconArrowLeft, IconSoccerField, IconCalendar, IconTransfer, IconCoin } from '@tabler/icons-react';
import axios from 'axios';

const PlayerPage = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        // Use full URL if your API is on a different port
        const response = await axios.get(`https://matchchase.onrender.com/players/${playerId}`);
        setPlayer(response.data);
      } catch (err) {
        setError('Error loading player data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId]);

  const getFlagEmoji = (countryName) => {
    if (!countryName) return '🏴';
    const flagMap = {
      'Türkiye': '🇹🇷',
      'İngiltere': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'İspanya': '🇪🇸',
      'Almanya': '🇩🇪',
      'Fransa': '🇫🇷',
      'İtalya': '🇮🇹',
      'Brezilya': '🇧🇷',
      'Arjantin': '🇦🇷',
      'Portekiz': '🇵🇹',
      'Hollanda': '🇳🇱',
      'Belçika': '🇧🇪',
      'Amerika Birleşik Devletleri': '🇺🇸',
      'Meksika': '🇲🇽',
      'Kanada': '🇨🇦',
      'Japonya': '🇯🇵',
      'Güney Kore': '🇰🇷',
      'Çin': '🇨🇳',
      'Avustralya': '🇦🇺',
      'Yeni Zelanda': '🇳🇿',
      'Rusya': '🇷🇺',
      'Ukrayna': '🇺🇦',
      'Polonya': '🇵🇱',
      'Çek Cumhuriyeti': '🇨🇿',
      'Slovakya': '🇸🇰',
      'Macaristan': '🇭🇺',
      'Romanya': '🇷🇴',
      'Bulgaristan': '🇧🇬',
      'Yunanistan': '🇬🇷',
      'Hırvatistan': '🇭🇷',
      'Sırbistan': '🇷🇸',
      'Bosna Hersek': '🇧🇦',
      'Slovenya': '🇸🇮',
      'Karadağ': '🇲🇪',
      'Makedonya': '🇲🇰',
      'Arnavutluk': '🇦🇱',
      'İsviçre': '🇨🇭',
      'Avusturya': '🇦🇹',
      'İsveç': '🇸🇪',
      'Norveç': '🇳🇴',
      'Danimarka': '🇩🇰',
      'Finlandiya': '🇫🇮',
      'İzlanda': '🇮🇸',
      'İrlanda': '🇮🇪',
      'İskoçya': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'Galler': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
      'Kuzey İrlanda': '🇬🇧',
      'Mısır': '🇪🇬',
      'Fas': '🇲🇦',
      'Cezayir': '🇩🇿',
      'Tunus': '🇹🇳',
      'Senegal': '🇸🇳',
      'Nijerya': '🇳🇬',
      'Fildişi Sahili': '🇨🇮',
      'Kamerun': '🇨🇲',
      'Güney Afrika': '🇿🇦',
      'Gine': '🇬🇳',
      'Mali': '🇲🇱',
      'Burkina Faso': '🇧🇫',
      'Gana': '🇬🇭',
      'Kongo Demokratik Cumhuriyeti': '🇨🇩',
      'Kongo Cumhuriyeti': '🇨🇬',
      'Angola': '🇦🇴',
      'Zambiya': '🇿🇲',
      'Zimbabve': '🇿🇼',
      'Etiyopya': '🇪🇹',
      'Kenya': '🇰🇪',
      'Tanzanya': '🇹🇿',
      'Uganda': '🇺🇬',
      'Suudi Arabistan': '🇸🇦',
      'İran': '🇮🇷',
      'Irak': '🇮🇶',
      'Birleşik Arap Emirlikleri': '🇦🇪',
      'Katar': '🇶🇦',
      'Umman': '🇴🇲',
      'Ürdün': '🇯🇴',
      'Suriye': '🇸🇾',
      'Lübnan': '🇱🇧',
      'Filistin': '🇵🇸',
      'İsrail': '🇮🇱',
      'Kuveyt': '🇰🇼',
      'Bahreyn': '🇧🇭',
      'Hindistan': '🇮🇳',
      'Pakistan': '🇵🇰',
      'Bangladeş': '🇧🇩',
      'Tayland': '🇹🇭',
      'Vietnam': '🇻🇳',
      'Endonezya': '🇮🇩',
      'Malezya': '🇲🇾',
      'Singapur': '🇸🇬',
      'Filipinler': '🇵🇭',
      'Myanmar': '🇲🇲',
      'Sri Lanka': '🇱🇰',
      'Afganistan': '🇦🇫',
      'Kazakistan': '🇰🇿',
      'Özbekistan': '🇺🇿',
      'Kırgızistan': '🇰🇬',
      'Tacikistan': '🇹🇯',
      'Türkmenistan': '🇹🇲',
      'Azerbaycan': '🇦🇿',
      'Gürcistan': '🇬🇪',
      'Ermenistan': '🇦🇲',
      'Kosta Rika': '🇨🇷',
      'Panama': '🇵🇦',
      'Honduras': '🇭🇳',
      'El Salvador': '🇸🇻',
      'Guatemala': '🇬🇹',
      'Jamaika': '🇯🇲',
      'Trinidad ve Tobago': '🇹🇹',
      'Haiti': '🇭🇹',
      'Küba': '🇨🇺',
      'Dominik Cumhuriyeti': '🇩🇴',
      'Kolombiya': '🇨🇴',
      'Uruguay': '🇺🇾',
      'Şili': '🇨🇱',
      'Paraguay': '🇵🇾',
      'Peru': '🇵🇪',
      'Ekvador': '🇪🇨',
      'Bolivya': '🇧🇴',
      'Venezuela': '🇻🇪',
      'Guyana': '🇬🇾',
      'Surinam': '🇸🇷',
      'Fransız Guyanası': '🇬🇫'
  };
    return flagMap[countryName] || '🏴';
  };

  const formatMarketValue = (value) => {
    if (!value) return 'N/A';
    if (value >= 1000000) return '€' + (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return '€' + (value / 1000).toFixed(0) + 'K';
    return '€' + value + "M";
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get current club from squad memberships (most recent or active)
  const getCurrentClub = () => {
    if (!player?.squads || player.squads.length === 0) return null;
    
    // Sort by season or contract end date to find current club
    const sortedSquads = [...player.squads].sort((a, b) => {
      // You might want to add logic to determine the current club
      return new Date(b.seasonId) - new Date(a.seasonId); // Simple season-based sorting
    });
    
    return sortedSquads[0]?.club || null;
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center" py="xl">
          <Loader size="lg" />
          <Text>Loading player data...</Text>
        </Group>
      </Container>
    );
  }

  if (error || !player) {
    return (
      <Container size="xl" py="xl">
        <Alert color="red" title="Error">
          {error || 'Player not found'}
        </Alert>
        <Button 
          component={Link} 
          to="/players" 
          variant="light" 
          mt="md"
          leftSection={<IconArrowLeft size={16} />}
        >
          Oyunculara Dön
        </Button>
      </Container>
    );
  }

  const currentClub = getCurrentClub();
  const currentSquad = player.squads?.[0];

  return (
    <Container size="xl" py="xl">
      {/* Breadcrumbs */}
<Breadcrumbs mb="xl" separator="→">
  <Anchor component={Link} to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
    <IconHome size={16} />
    Home
  </Anchor>
  
  {/* Leagues */}
  <Anchor component={Link} to="/leagues">
    Leagues
  </Anchor>
  
  {/* League Name - with fallback if no current club */}
  {currentClub?.league ? (
    <Anchor component={Link} to={`/leagues/${currentClub.league.id}`}>
      {currentClub.league.name}
    </Anchor>
  ) : player.squads?.[0]?.club?.league ? (
    <Anchor component={Link} to={`/leagues/${player.squads[0].club.league.id}`}>
      {player.squads[0].club.league.name}
    </Anchor>
  ) : (
    <Text c="dimmed" size="sm">No League</Text>
  )}
  
  {/* Club Name - with fallback */}
  {currentClub ? (
    <Anchor component={Link} to={`/clubs/${currentClub.id}`}>
      {currentClub.name}
    </Anchor>
  ) : player.squads?.[0]?.club ? (
    <Anchor component={Link} to={`/clubs/${player.squads[0].club.id}`}>
      {player.squads[0].club.name}
    </Anchor>
  ) : (
    <Text c="dimmed" size="sm">No Club</Text>
  )}
  
  {/* Player Name */}
  <Text fw={600} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
  {player.firstName === '-' ? player.lastName : `${player.firstName} ${player.lastName}`}
  </Text>
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
        
        <Card shadow="md" p="xl">
          <Group align="flex-start">
            <IconSoccerField size={64} color="#228be6" />
            <div style={{ flex: 1 }}>
              <Title order={1}>{player.firstName === '-' ? player.lastName : `${player.firstName} ${player.lastName}`}</Title>
              {player.displayName && (
                <Text size="xl" c="dimmed" mb="md">
                  "{player.displayName}"
                </Text>
              )}
              
              <Group mt="md">
                <Badge color="blue" size="lg">
                  {player.position || 'Unknown Position'}
                </Badge>
                {player.secondaryPos && (
                  <Badge color="cyan" size="lg" variant="light">
                    {player.secondaryPos}
                  </Badge>
                )}
                <Badge variant="light" size="lg">
                  {getFlagEmoji(player.nationality?.name)} {player.nationality?.name || 'Unknown Nationality'}
                </Badge>
                {player.age && (
                  <Badge variant="outline" size="lg">
                    Yaş: {player.age}
                  </Badge>
                )}
              </Group>
            </div>
            
            <Stack align="flex-end">
              <Badge color="green" size="xl" variant="filled">
                Market Value
              </Badge>
              <Text size="lg" fw={600}>
                {player.currentMV ? formatMarketValue(player.currentMV) : 'N/A'}
              </Text>
            </Stack>
          </Group>
        </Card>
      </Stack>

      {/* Main Content Grid */}
      <Grid gutter="xl">
        {/* Personal Information */}
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Card shadow="sm" p="lg">
            <Title order={3} mb="md">
              <IconCalendar size={20} style={{ marginRight: '8px' }} />
              Oyuncu Bilgileri
            </Title>
            <Table>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Th>Adı Soyadı</Table.Th>
                  <Table.Td>{player.firstName === '-' ? player.lastName : `${player.firstName} ${player.lastName}`}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Doğum Tarihi</Table.Th>
                  <Table.Td>{formatDate(player.dateOfBirth)}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Yaş</Table.Th>
                  <Table.Td>{player.age || 'N/A'}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Doğum Yeri</Table.Th>
                  <Table.Td>{player.birthPlace || 'N/A'}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Uyruk</Table.Th>
                  <Table.Td>
                    {getFlagEmoji(player.nationality?.name)} {player.nationality?.name || 'N/A'}
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Boy</Table.Th>
                  <Table.Td>{player.heightCm ? `${player.heightCm} cm` : 'N/A'}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Kilo</Table.Th>
                  <Table.Td>{player.weightKg ? `${player.weightKg} kg` : 'N/A'}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>

        {/* Club & Contract Information */}
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Card shadow="sm" p="lg">
            <Title order={3} mb="md">
              <IconSoccerField size={20} style={{ marginRight: '8px' }} />
              Kontrat Bilgileri
            </Title>
            <Table>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Th>Mevcut Takımı</Table.Th>
                  <Table.Td>
                    {currentClub ? (
                      <Anchor component={Link} to={`/clubs/${currentClub.id}`}>
                        {currentClub.name}
                      </Anchor>
                    ) : 'Free Agent'}
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Lig</Table.Th>
                  <Table.Td>{currentClub?.league?.name || 'N/A'}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Durumu</Table.Th>
                  <Table.Td>
                    <Badge color={player?.status ? 'blue' : 'gray'}>
                      {player?.status || 'Unknown'}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Sözleşme Bitiş Tarihi</Table.Th>
                  <Table.Td>{formatDate(player?.contractExpiry)}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Forma Numarası</Table.Th>
                  <Table.Td>
                    {currentSquad?.shirtNumber ? `#${currentSquad.shirtNumber}` : 'N/A'}
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Sezon</Table.Th>
                  <Table.Td>{currentSquad?.season?.name || 'N/A'}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>

        {/* Transfer History */}
{player.transfers && player.transfers.length > 0 && (
  <Grid.Col span={12}>
    <Card shadow="sm" p="lg">
      <Title order={3} mb="md">
        <IconTransfer size={20} style={{ marginRight: '8px' }} />
        Transfer History ({player.transfers.length})
      </Title>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tarih</Table.Th>
            <Table.Th>Transfer Olduğu Takım</Table.Th>
            <Table.Th>Takım</Table.Th>
            <Table.Th>Bonservis Bedeli</Table.Th>
            <Table.Th>Piyasa Değeri (Transfer Olduğunda)</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {player.transfers.map((transfer, index) => (
            <Table.Tr key={transfer.id || index}>
              <Table.Td>{formatDate(transfer.date)}</Table.Td>
              <Table.Td>
                {transfer.fromClub ? (
                  <Anchor component={Link} to={`/clubs/${transfer.fromClub.id}`}>
                    {transfer.fromClub.name}
                  </Anchor>
                ) : 'Free Agent'}
              </Table.Td>
              <Table.Td>
                {transfer.toClub ? (
                  <Anchor component={Link} to={`/clubs/${transfer.toClub.id}`}>
                    {transfer.toClub.name}
                  </Anchor>
                ) : 'Free Agent'}
              </Table.Td>
              <Table.Td>
                {transfer.fee ? formatMarketValue(transfer.fee) : 'Free Transfer'}
              </Table.Td>
              <Table.Td>
                {transfer.marketValue ? formatMarketValue(transfer.marketValue) : 'N/A'}
              </Table.Td>
            </Table.Tr>
          ))} 
        </Table.Tbody>
      </Table>
    </Card>
  </Grid.Col>
)}

        {/* Squad History */}
        {player.squads && player.squads.length > 1 && (
          <Grid.Col span={12}>
            <Card shadow="sm" p="lg">
              <Title order={3} mb="md">Club History</Title>
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Season</Table.Th>
                    <Table.Th>Club</Table.Th>
                    <Table.Th>Shirt No.</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Contract End</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {player.squads.map((squad, index) => (
                    <Table.Tr key={squad.id || index}>
                      <Table.Td>{squad.season?.name || 'N/A'}</Table.Td>
                      <Table.Td>
                        {squad.club ? (
                          <Anchor component={Link} to={`/clubs/${squad.club.id}`}>
                            {squad.club.name}
                          </Anchor>
                        ) : 'N/A'}
                      </Table.Td>
                      <Table.Td>{squad.shirtNumber || 'N/A'}</Table.Td>
                      <Table.Td>
                        <Badge size="sm" color={squad.status === 'Active' ? 'green' : 'yellow'}>
                          {squad.status || 'N/A'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{formatDate(squad.contractEnd)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </Grid.Col>
        )}
      </Grid>
    </Container>
  );
};

export default PlayerPage;