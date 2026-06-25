/**
 * import_excel.js
 *
 * Usage:
 *   node import_excel.js path/to/ingiltere-tumu.xlsx
 */

 import fs from "fs";
 import XLSX from "xlsx";
 import { PrismaClient } from "@prisma/client";
 import { stringify } from "csv-stringify/sync";
 import diacritics from "diacritics";
 
 const prisma = new PrismaClient({ log: ["query"] });
 
 // Explicit mapping: Excel column -> internal field
 const COLUMN_MAP = {
   country: "Ülke",
   league: "Lig",
   season: "Sezon",
   club: "Takım",
   shirt: "FN",
   firstName: "Adı",
   lastName: "Soyadı",
   displayName: "Görünen Adı",
   birthPlace: "Doğum Yeri",
   nationality: "Uyruk",
   position: "Pozisyon",
   transfermarkt: "Transfermarkt ID",
   currentMV: "M.P.D.",
   age: "Yaş",
   status: "Durumu",
   contractExpiry: "Sözleşme Sonu",
   dateOfBirth: "Doğum tarihi",
   transferDate: "Transfer Tarihi",
   prevClub: "Transfer Olduğu Takım",
   prevMV: "Piyasa Değeri",
   height: "Boy",
   weight: "Kilo",
   transferFee: "Transfer Bedeli"
 };
 
 // Helpers
 function normalizeClubName(name) {
   if (!name) return null;
   let s = String(name).trim();
   s = diacritics.remove(s);
   s = s.replace(/[.,']/g, "");
   const removeWords = [" FC", " F.C.", " AFC", " A.F.C.", " CF", " C.F.", "SC", " S.C."];
   for (const w of removeWords) {
     const regex = new RegExp(w + "$", "i");
     s = s.replace(regex, "");
   }
   s = s.replace(/\s+/g, " ");
   return s.trim();
 }
 
 function parseDate(value) {
   if (!value && value !== 0) return null;
   if (value instanceof Date && !isNaN(value)) return value;
   const s = String(value).trim();
   if (!s) return null;
   
   // Handle Excel serial date numbers
   if (!isNaN(s) && s.length > 4) {
     return XLSX.SSF.parse_date_code(parseFloat(s));
   }
   
   const iso = new Date(s);
   if (!isNaN(iso)) return iso;
   
   // Handle DD.MM.YYYY or DD/MM/YYYY formats
   const dmy = s.match(/(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{2,4})/);
   if (dmy) {
     let [_, dd, mm, yy] = dmy;
     dd = dd.padStart(2, "0");
     mm = mm.padStart(2, "0");
     if (yy.length === 2) yy = Number(yy) <= 30 ? "20" + yy : "19" + yy;
     return new Date(`${yy}-${mm}-${dd}T00:00:00Z`);
   }
   
   // Handle MM/DD/YYYY format (common in Excel)
   const mdy = s.match(/(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4})/);
   if (mdy) {
     let [_, mm, dd, yyyy] = mdy;
     dd = dd.padStart(2, "0");
     mm = mm.padStart(2, "0");
     return new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
   }
   
   return null;
 }
 
 function parseMarketValue(v) {
  if (!v) return null;
  return parseFloat(v);
}
 
 function parseHeight(height) {
   if (!height) return null;
   return height;
 }
 
 function parseWeight(weight) {
   if (!weight) return null;
   return weight;
 }
 
 function extractTransfermarktId(val) {
   if (!val) return null;
   return val;
 }

 function parseName(name) {
  if (name == "-") { return "Arda"; }
  return name;
}

 
 const failedRows = [];
 
 // ---- Main importer ----
 async function main() {
   try {
     const filePath = process.argv[2] || "ingiltere-tumu.xlsx";
     if (!fs.existsSync(filePath)) {
       console.error("Excel file not found at", filePath);
       process.exit(1);
     }
 
     console.log("Reading workbook:", filePath);
     const workbook = XLSX.readFile(filePath, { cellDates: true, raw: false });
     const sheetName = workbook.SheetNames[0];
     console.log("Using sheet:", sheetName);
     const sheet = workbook.Sheets[sheetName];
     const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: null });
 
     console.log("Detected headers:", Object.keys(rawRows[0]).join(" | "));
     console.log("Column mapping (using):", COLUMN_MAP);
 
     let rowCount = 0;
     for (const raw of rawRows) {
       rowCount++;
 
       const country       = raw[COLUMN_MAP.country];
       const leagueName    = raw[COLUMN_MAP.league];
       const seasonName    = raw[COLUMN_MAP.season];
       let clubName        = raw[COLUMN_MAP.club];
       const shirtNumber   = raw[COLUMN_MAP.shirt];
       const firstNameRaw  = raw[COLUMN_MAP.firstName];
       const lastNameRaw   = raw[COLUMN_MAP.lastName];
       const displayName   = raw[COLUMN_MAP.displayName];
       const birthPlace    = raw[COLUMN_MAP.birthPlace];
       const nationality   = raw[COLUMN_MAP.nationality];
       const position      = raw[COLUMN_MAP.position];
       const tmIdRaw       = raw[COLUMN_MAP.transfermarkt];
       const currentMVRaw  = raw[COLUMN_MAP.currentMV];
       const ageRaw        = raw[COLUMN_MAP.age];
       const status        = raw[COLUMN_MAP.status];
       const contractExpiry= raw[COLUMN_MAP.contractExpiry];
       const dateOfBirthRaw= raw[COLUMN_MAP.dateOfBirth];
       const transferDateRaw = raw[COLUMN_MAP.transferDate];
       const prevClub      = raw[COLUMN_MAP.prevClub];
       const prevMVRaw     = raw[COLUMN_MAP.prevMV];
       const heightRaw     = raw[COLUMN_MAP.height];
       const weightRaw     = raw[COLUMN_MAP.weight];
       const transferFee   = String(raw[COLUMN_MAP.transferFee]);
 
       if (!country || !leagueName || !seasonName || !clubName || (!firstNameRaw && !lastNameRaw && !displayName)) {
         failedRows.push({ row: rowCount, reason: "Missing core fields", ...raw });
         continue;
       }
 
       const nationName = String(country).trim();
       const seasonNameStr = String(seasonName).trim();
       const leagueNameStr = String(leagueName).trim();
       let clubNameStr = normalizeClubName(clubName);
       let prevClubStr = normalizeClubName(prevClub);
 
       // 1) Nation
       let nation = await prisma.nation.upsert({
         where: { name: nationName },
         update: {},
         create: { name: nationName },
       });
 
       // 2) Season
       let season = await prisma.season.upsert({
         where: { name: seasonNameStr },
         update: {},
         create: { name: seasonNameStr },
       });
 
       // 3) League
       let league = await prisma.league.findFirst({
         where: { name: leagueNameStr, nationId: nation.id, seasonId: season.id },
       });
       if (!league) {
         league = await prisma.league.create({
           data: { name: leagueNameStr, nationId: nation.id, seasonId: season.id },
         });
       }
 
       // 4) Club
       let club = await prisma.club.findFirst({
         where: { name: clubNameStr, leagueId: league.id },
       });
       if (!club) {
         club = await prisma.club.create({
           data: { name: clubNameStr, leagueId: league.id },
         });
       }

       // 5) Player creation/update - FIXED VERSION
       const tmId = extractTransfermarktId(tmIdRaw);
       const dob = parseDate(dateOfBirthRaw);
       const age = ageRaw ? parseInt(ageRaw) : null;
       const height = parseHeight(heightRaw);
       const weight = parseWeight(weightRaw);
       const currentMV = parseMarketValue(currentMVRaw);
       const prevMV = parseMarketValue(prevMVRaw);
       
       let nationalityNation = null;
       if (nationality) {
         const nationName = String(nationality).trim();
         nationalityNation = await prisma.nation.upsert({
           where: { name: nationName },
           update: {},
           create: { name: nationName },
         });
       }

       //const normalizedFirstName = parseName(firstNameRaw); // null if missing/dash/unknown
       
       let player = null;
       
       if (tmId) {
         player = await prisma.player.findUnique({ 
           where: { transfermarktId: tmId }
         });
       }
       
       if (!player) {
          player = await prisma.player.findFirst({
            where: {
              lastName: lastNameRaw,
              ...(dob && { dateOfBirth: dob }),
            },
          });
       }
       
       if (!player) {
         const playerData = {
           firstName: firstNameRaw, // null when missing
           lastName: (lastNameRaw || "Player").trim(),
           displayName: displayName ? String(displayName).trim() : null,
           dateOfBirth: dob,
           birthPlace: birthPlace ? String(birthPlace).trim() : null,
           nationalityId: nationalityNation ? nationalityNation.id : null,
           age: age,
           currentMV: currentMV,
           prevMV: prevMV,
           position: position ? String(position).trim() : null,
           status: status ? String(status).trim() : null,
           contractExpiry: contractExpiry ? parseDate(contractExpiry) : null,
           transfermarktId: tmId || null,
           heightCm: height,
           weightKg: weight,
           transferFee: transferFee
         };
         player = await prisma.player.create({ data: playerData });
         console.log(`✅ Created: ${player.firstName} ${player.lastName}`);
       } else {
         const updateData = {
           displayName: displayName ? String(displayName).trim() : player.displayName,
           currentMV: currentMV !== null ? currentMV : player.currentMV,
           prevMV: prevMV !== null ? prevMV : player.prevMV,
           position: position || player.position,
           status: status || player.status,
           contractExpiry: contractExpiry ? parseDate(contractExpiry) : player.contractExpiry,
           heightCm: height !== null ? height : player.heightCm,
           weightKg: weight !== null ? weight : player.weightKg,
           transferFee: transferFee !== null ? transferFee : player.transferFee
         };
         
         if (tmId && !player.transfermarktId) {
           updateData.transfermarktId = tmId;
         }
         
         player = await prisma.player.update({
           where: { id: player.id },
           data: updateData,
         });
         console.log(`🔄 Updated: ${player.firstName} ${player.lastName}`);
       }

       // 6) SquadMembership with shirt number
       const squad = await prisma.squadMembership.findFirst({
         where: { seasonId: season.id, clubId: club.id, playerId: player.id },
       });
       if (!squad) {
         await prisma.squadMembership.create({
           data: { 
             seasonId: season.id, 
             clubId: club.id, 
             playerId: player.id,
             shirtNumber: shirtNumber ? parseInt(shirtNumber) : null
           },
         });
       } else if (shirtNumber) {
         await prisma.squadMembership.update({
           where: { id: squad.id },
           data: { shirtNumber: parseInt(shirtNumber) }
         });
       }
 
       // 7) Transfer (if transfer date exists)
       if (transferDateRaw || prevClub || prevMV) {
         const tDate = parseDate(transferDateRaw);
         let previousClub = await prisma.club.findFirst({
          where: { name: prevClubStr, leagueId: league.id },
        });
         
         // Check if transfer already exists
         const existingTransfer = await prisma.transfer.findFirst({
           where: {
             playerId: player.id,
             toClubId: club.id,
             date: tDate || undefined
           }
         });
         
         if (!existingTransfer && previousClub) { 
           await prisma.transfer.create({
             data: {
               playerId: player.id,
               fromClubId: previousClub.id,
               toClubId: club.id,
               date: tDate || new Date(),
               fee: transferFee, 
               marketValue: prevMV,
             },
           });
         }
       }
 
       if (rowCount % 100 === 0) console.log(`Processed ${rowCount} rows...`);
     }
 
     if (failedRows.length > 0) {
       fs.writeFileSync("import_failures.csv", stringify(failedRows, { header: true }));
       console.warn(`⚠️ ${failedRows.length} rows skipped. See import_failures.csv`);
     }
 
     console.log(`✅ Import complete. Processed ${rowCount} rows.`);
   } catch (err) {
     console.error("Error in import:", err);
   } finally {
     await prisma.$disconnect();
   }
 }
 
 main();

