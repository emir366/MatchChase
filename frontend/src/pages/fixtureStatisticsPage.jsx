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
    Progress,
    Grid,
    Tabs
} from '@mantine/core';
import { IconHome, IconArrowLeft, IconChartBar, IconBallFootball, IconShield, IconActivity } from '@tabler/icons-react';

export default function FixtureStatistics() {
    const { fixtureId } = useParams();
    const navigate = useNavigate();

    const [fixture, setFixture] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadFixtureData() {
            try {
                setLoading(true);
                setError('');

                if (!fixtureId) throw new Error('Fixture id missing');

                const response = await fetch(`https://matchchase.onrender.com/api/fixtures/${fixtureId}`);

                if (!response.ok) {
                    throw new Error(`Fikstür yüklenemedi: (status ${response.status})`);
                }

                const data = await response.json();

                setFixture(data);
                setStats(data.matchStats);

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
                    <Text>İstatistikler yükleniyor...</Text>
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
                </Group>
            </Container>
        );
    }

    const StatRow = ({ label, homeKey, awayKey, isPercentage = false, suffix = '' }) => {
        const homeValue = stats[homeKey];
        const awayValue = stats[awayKey];

        if (homeValue === null || awayValue === null || homeValue === undefined || awayValue === undefined) return null;

        // For percentages, we might want to use the value directly for the bar width
        // For counts, we calculate the ratio
        let homePercent, awayPercent;

        if (isPercentage) {
            // If it's already a percentage (0-100), use it directly for visual, but normalize to 100 total for the bar split?
            // Actually, usually possession is 60-40.
            // But shot accuracy might be 50% vs 50% (independent).
            // If independent, we can't just split a single bar easily unless we use two separate bars or just visual comparison.
            // The previous implementation used a split bar. Let's stick to that for competitive stats (possession),
            // but for independent stats (shot accuracy), maybe just show the values?
            // Let's assume split bar for everything for consistency, normalizing to (home + away).
            // If both are 0, 50-50.
            const total = Number(homeValue) + Number(awayValue);
            homePercent = total === 0 ? 50 : (Number(homeValue) / total) * 100;
            awayPercent = total === 0 ? 50 : (Number(awayValue) / total) * 100;
        } else {
            const total = Number(homeValue) + Number(awayValue);
            homePercent = total === 0 ? 50 : (Number(homeValue) / total) * 100;
            awayPercent = total === 0 ? 50 : (Number(awayValue) / total) * 100;
        }

        return (
            <div style={{ marginBottom: '1rem' }}>
                <Group justify="space-between" mb={5}>
                    <Text fw={700}>{homeValue}{isPercentage ? '%' : ''}{suffix}</Text>
                    <Text c="dimmed" size="sm" tt="uppercase">{label}</Text>
                    <Text fw={700}>{awayValue}{isPercentage ? '%' : ''}{suffix}</Text>
                </Group>
                <Group grow gap="xs">
                    <Progress
                        value={100}
                        sectionProps={{ style: { width: `${homePercent}%`, backgroundColor: 'blue' } }}
                        size="md"
                        radius="xl"
                    />
                    <Progress
                        value={100}
                        sectionProps={{ style: { width: `${awayPercent}%`, backgroundColor: 'red' } }}
                        size="md"
                        radius="xl"
                        style={{ transform: 'scaleX(-1)' }}
                    />
                </Group>
            </div>
        );
    };

    return (
        <Container fluid py="xl" px="md">
            <Breadcrumbs mb="xl">
                <Anchor component={Link} to="/">
                    <IconHome size={16} /> Ana Sayfa
                </Anchor>
                <Anchor component={Link} to="/fixtures">
                    Fikstürler
                </Anchor>
                <Anchor component={Link} to={`/fixtures/match/${fixtureId}`}>
                    Maç Ayrıntıları
                </Anchor>
                <Text>İstatistikler</Text>
            </Breadcrumbs>

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

                <Card shadow="md" p="xl" radius="md">
                    <Title order={2} ta="center" mb="lg">
                        {fixture.homeTeamName} vs {fixture.awayTeamName}
                    </Title>

                    {!stats ? (
                        <Alert color="yellow" title="Bilgi">
                            Bu maç için istatistik bulunmamaktadır.
                        </Alert>
                    ) : (
                        <Stack gap="lg">
                            <Title order={4} ta="center"><IconChartBar size={20} style={{ verticalAlign: 'middle', marginRight: 5 }} /> Maç İstatistikleri</Title>

                            <Tabs defaultValue="genel" variant="outline" radius="md">
                                <Tabs.List justify="center" mb="lg">
                                    <Tabs.Tab value="genel" leftSection={<IconActivity size={16} />}>
                                        Genel
                                    </Tabs.Tab>
                                    <Tabs.Tab value="sut" leftSection={<IconBallFootball size={16} />}>
                                        Şut
                                    </Tabs.Tab>
                                    <Tabs.Tab value="pas-savunma" leftSection={<IconShield size={16} />}>
                                        Pas & Savunma
                                    </Tabs.Tab>
                                </Tabs.List>

                                <Grid gutter="xl">
                                    <Grid.Col span={12}>

                                        <Tabs.Panel value="genel">
                                            <Stack gap="md">
                                                <StatRow label="Topla Oynama" homeKey="homePossession" awayKey="awayPossession" isPercentage />
                                                <StatRow label="xG (Gol Beklentisi)" homeKey="homeXG" awayKey="awayXG" />
                                                <StatRow label="Büyük Şans" homeKey="homeBigChance" awayKey="awayBigChance" />
                                                <StatRow label="Toplam Şut" homeKey="homeShots" awayKey="awayShots" />
                                                <StatRow label="İsabetli Şut" homeKey="homeshotsOnTarget" awayKey="awayshotsOnTarget" />
                                                <StatRow label="Pas" homeKey="homePasses" awayKey="awayPasses" />
                                                <StatRow label="Korner" homeKey="homeCorners" awayKey="awayCorners" />
                                                <StatRow label="Faul" homeKey="homeFouls" awayKey="awayFouls" />
                                                <StatRow label="Sarı Kart" homeKey="homeYellowCards" awayKey="awayYellowCards" />
                                                <StatRow label="Kırmızı Kart" homeKey="homeRedCards" awayKey="awayRedCards" />
                                            </Stack>
                                        </Tabs.Panel>

                                        <Tabs.Panel value="sut">
                                            <Stack gap="md">
                                                <StatRow label="Toplam Şut" homeKey="homeShots" awayKey="awayShots" />
                                                <StatRow label="İsabetli Şut" homeKey="homeshotsOnTarget" awayKey="awayshotsOnTarget" />
                                                <StatRow label="İsabetli Şut %" homeKey="homeShotPct" awayKey="awayShotPct" isPercentage />
                                                <StatRow label="İsabetsiz Şut" homeKey="homeShotOffTarget" awayKey="awayShotOffTarget" />
                                                <StatRow label="Engellenen Şut" homeKey="homeBlockedShots" awayKey="awayBlockedShots" />
                                                <StatRow label="Ceza Sahası İçinden Şut" homeKey="homeShotsInBox" awayKey="awayShotsInBox" />
                                                <StatRow label="Ceza Sahası İçinden Şut %" homeKey="homeShotsInBoxPct" awayKey="awayShotsInBoxPct" isPercentage />
                                                <StatRow label="Ceza Sahası Dışından Şut" homeKey="homeShotsOutBox" awayKey="awayShotsOutBox" />
                                                <StatRow label="Direkten Dönen" homeKey="homePosts" awayKey="awayPosts" />
                                                <StatRow label="Penaltı xG" homeKey="homePenaltyXG" awayKey="awayPenaltyXG" />
                                            </Stack>
                                        </Tabs.Panel>

                                        <Tabs.Panel value="pas-savunma">
                                            <Stack gap="md">
                                                <StatRow label="Pas" homeKey="homePasses" awayKey="awayPasses" />
                                                <StatRow label="Top Kapma" homeKey="homeInterceptions" awayKey="awayInterceptions" />
                                                <StatRow label="Serbest Vuruş" homeKey="homeFKs" awayKey="awayFKs" />
                                                <StatRow label="Kaleci Kurtarışı" homeKey="homeSaves" awayKey="awaySaves" />
                                                <StatRow label="Kritik Kurtarış" homeKey="homeCriticalSaves" awayKey="awayCriticalSaves" />
                                                <StatRow label="Kaleci Performansı" homeKey="homeGKPerf" awayKey="awayGKPerf" />
                                                <StatRow label="Şuta Sebep Olan Hata" homeKey="homeErrorToShot" awayKey="awayErrorToShot" />
                                                <StatRow label="Gole Sebep Olan Hata" homeKey="homeErrorToGoal" awayKey="awayErrorToGoal" />
                                            </Stack>
                                        </Tabs.Panel>

                                    </Grid.Col>
                                </Grid>
                            </Tabs>
                        </Stack>
                    )}
                </Card>
            </Stack>
        </Container>
    );
}
