import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const STATS_MAPPING: { [key: string]: string } = {
    'EV Topa Sahip Olma': 'homePossession',
    'DEP Topa Sahip Olma': 'awayPossession',
    'EV xG': 'homeXG',
    'DEP xG': 'awayXG',
    'EV Büyük Şans': 'homeBigChance',
    'DEP Büyük Şans': 'awayBigChance',
    'EV Toplam Şut': 'homeShots',
    'DEP Toplam Şut': 'awayShots',
    'EV Kaleci Kurtarışı': 'homeSaves',
    'DEP Kaleci Kurtarışı': 'awaySaves',
    'EV Kritik Kaleci Kurtarışı': 'homeCriticalSaves',
    'DEP Kritik Kaleci Kurtarışı': 'awayCriticalSaves',
    'EV Kaleci Performans': 'homeGKPerf',
    'DEP Kaleci Performans': 'awayGKPerf',
    'EV Korner': 'homeCorners',
    'DEP Korner': 'awayCorners',
    'EV Faul': 'homeFouls',
    'DEP Faul': 'awayFouls',
    'EV Pas': 'homePasses',
    'DEP Pas': 'awayPasses',
    'EV Top Kapma': 'homeInterceptions',
    'DEP Top Kapma': 'awayInterceptions',
    'EV Serbest Vuruşu': 'homeFKs',
    'DEP Serbest Vuruş': 'awayFKs',
    'EV Sarı Kart': 'homeYellowCards',
    'DEP Sarı Kart': 'awayYellowCards',
    'EV Kırmızı Kart ': 'homeRedCards', // Note space
    'DEP Kırmızı Kart': 'awayRedCards',
    'EV Penaltı xG': 'homePenaltyXG',
    'DEP Penaltı xG': 'awayPenaltyXG',
    'EV İsabetli Şut': 'homeshotsOnTarget',
    'EV İsabetli Şut Yüzdesi': 'homeShotPct',
    'EV Direkten Dönen': 'homePosts',
    'EV İsabetsiz Şut': 'homeShotOffTarget',
    'EV Engellenen Şutu': 'homeBlockedShots',
    'EV Ceza Sahası İçinden Şut': 'homeShotsInBox',
    'EV Ceza Sahası İçinden Şut Yüzdesi': 'homeShotsInBoxPct',
    'EV Ceza Sahası Dışından Şut': 'homeShotsOutBox',
    'DEP İsabetli Şut': 'awayshotsOnTarget',
    'DEP İsabetli Şut Yüzdesi': 'awayShotPct',
    'DEP Direkten Dönen': 'awayPosts',
    'DEP İsabetsiz Şut': 'awayShotOffTarget',
    'DEP Engellenen Şutu': 'awayBlockedShots',
    'DEP Ceza Sahası İçinden Şut': 'awayShotsInBox',
    'DEP Ceza Sahası İçinden Şut Yüzdesi': 'awayShotsInBoxPct',
    'DEP Ceza Sahası Dışından Şut': 'awayShotsOutBox',
    'EV Şuta Sebep Olan Hata (Ev Sahibi Takımının Gol Yemesine Dönük Negatif Unsur)': 'homeErrorToShot',
    'EV Gole Sebep Olan Hata (Ev Sahibi Takımının Gol Yemesine Dönük Negatif Unsur)': 'homeErrorToGoal',
    'DEP Şuta Sebep Olan Hata (Deplasman Takımının Gol Yemesine Dönük Negatif Unsur)': 'awayErrorToShot',
    'DEP Gole Sebep Olan Hata (Deplasman Takımının Gol Yemesine Dönük Negatif Unsur)': 'awayErrorToGoal',
};

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: ts-node import-fixture-stats.ts <path-to-excel-file>');
        process.exit(1);
    }

    const filePath = args[0];
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    console.log(`Reading file: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`Found ${data.length} rows.`);
    if (data.length > 0) {
        console.log('First row keys:', Object.keys(data[0] as object));
        console.log('First row sample:', data[0]);
    }

    for (const row of data as any[]) {
        const dateStr = row['Tarih'];
        const homeTeamName = row['EV'];
        const awayTeamName = row['DEP'];
        const homeScore = row['EV Skor'];
        const awayScore = row['DEP Skor'];
        const notes = row['Takım/Dakika/Olay Notları'];

        if (!dateStr || !homeTeamName || !awayTeamName) {
            console.warn('Skipping row due to missing Date, Home Team, or Away Team:', row);
            continue;
        }

        let date: Date;
        if (typeof dateStr === 'number') {
            date = new Date(Math.round((dateStr - 25569) * 86400 * 1000));
        } else {
            date = new Date(dateStr);
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Find fixture by date and BOTH teams
        const fixture = await prisma.fixture.findFirst({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                AND: [
                    {
                        OR: [
                            { homeTeamName: { equals: homeTeamName, mode: 'insensitive' } },
                            { homeClubSeason: { club: { name: { equals: homeTeamName, mode: 'insensitive' } } } }
                        ]
                    },
                    {
                        OR: [
                            { awayTeamName: { equals: awayTeamName, mode: 'insensitive' } },
                            { awayClubSeason: { club: { name: { equals: awayTeamName, mode: 'insensitive' } } } }
                        ]
                    }
                ]
            },
        });

        if (!fixture) {
            console.warn(`Fixture not found for ${homeTeamName} vs ${awayTeamName} on ${date.toISOString().split('T')[0]}`);
            continue;
        }

        console.log(`Found fixture: ${fixture.id} - ${fixture.homeTeamName} vs ${fixture.awayTeamName}`);

        if (homeScore !== undefined && awayScore !== undefined) {
            await prisma.fixture.update({
                where: { id: fixture.id },
                data: {
                    homeScore: Number(homeScore),
                    awayScore: Number(awayScore),
                }
            });
        }

        const statsData: any = {
            notes: notes,
        };

        for (const [excelKey, modelField] of Object.entries(STATS_MAPPING)) {
            let value = row[excelKey];
            if (value !== undefined) {
                if (typeof value === 'string' && value.includes('%')) {
                    value = value.replace('%', '').trim();
                    value = Number(value);
                }

                let numValue = Number(value);

                // Handle percentage values:
                // 1. If it was a string "56%", we already parsed it above.
                // 2. If it was a cell formatted as percentage in Excel, xlsx reads it as a decimal (e.g. 0.56).
                // We need to convert 0.56 to 56 for the integer field.
                if (excelKey.includes('Yüzdesi') && !isNaN(numValue) && numValue <= 1 && numValue >= 0 && numValue !== 0) {
                    numValue = Math.round(numValue * 100);
                } else {
                    numValue = Math.round(numValue);
                }

                if (!isNaN(numValue)) {
                    statsData[modelField] = numValue;
                }
            }
        }

        await prisma.fixtureMatchStats.upsert({
            where: { fixtureId: fixture.id },
            create: {
                fixtureId: fixture.id,
                ...statsData,
            },
            update: {
                ...statsData,
            },
        });

        console.log(`Updated stats for fixture ${fixture.id}`);
    }

    console.log('Import completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
