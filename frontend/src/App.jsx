import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import Navbar from "./components/Navbar";
import LeaguesPage from "./pages/LeaguesPage";
import ClubsPage from "./pages/ClubsPage";
import NationsPage from "./pages/NationsPage";
import LeaguePage from "./pages/LeaguePage";
import ClubPage from './pages/ClubPage';
import PlayerPage from './pages/PlayerPage'
import FixturesPage from './pages/fixturesPage'
import FixturesListPage from './pages/fixturesListPage'
import FixtureDetailPage from './pages/fixtureDetailPage'
import FixtureStatisticsPage from './pages/fixtureStatisticsPage'
import '@mantine/core/styles.css';

export default function App() {
  const globalStyles = {
    margin: 0,
    padding: 0,
    minHeight: "100vh",
    backgroundColor: "#fff",
    width: "100%",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  };

  const appContainerStyles = {
    margin: 0,
    padding: 0,
    minHeight: "100vh",
    backgroundColor: "#fff",
    width: "100%",
  };

  const layoutStyles = {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#fff",
    color: "#000",
    width: "100%",
    margin: 0,
    padding: 0,
  };

  const sidebarStyles = {
    width: "250px",
    minWidth: "250px",
    backgroundColor: "#f8f9fa",
    borderRight: "1px solid #e0e0e0",
  };

  const pageStyles = {
    flex: 1,
    padding: "20px",
    marginLeft: "0",
    overflow: "auto",
    backgroundColor: "#FFFFFF",
    width: "100%",
  };

  return (
    <MantineProvider defaultColorScheme="light">  {/* <-- wrap everything */}
      <div style={globalStyles}>
        <style>
          {`
            html, body, #root {
              margin: 0;
              padding: 0;
              height: 100%;
              background-color: white !important;
            }
            body {
              background-color: white;
            }
            * {
              box-sizing: border-box;
            }
          `}
        </style>

        <Router>
          <div style={layoutStyles}>
            <div style={sidebarStyles}>
              <Navbar />
            </div>
            <div style={pageStyles}>
              <Routes>
                <Route path="/leagues" element={<LeaguesPage />} />
                <Route path="/clubs" element={<ClubsPage />} />
                <Route path="/nations" element={<NationsPage />} />
                <Route path="/league/:leagueSeasonId" element={<LeaguePage />} />
                <Route path="/club/:clubSeasonId" element={<ClubPage />} />
                <Route path="/players/:playerId" element={<PlayerPage />} />
                <Route path="/fixtures" element={<FixturesPage />} />
                <Route path="/fixtures/:leagueId/:seasonId" element={<FixturesListPage />} />
                <Route path="/fixtures/:leagueId/:seasonId/:matchWeekId" element={<FixturesListPage />} />
                <Route path="/fixtures/match/:fixtureId" element={<FixtureDetailPage />} />
                <Route path="/fixtures/match/:fixtureId/statistics" element={<FixtureStatisticsPage />} />
              </Routes>
            </div>
          </div>
        </Router>
      </div>
    </MantineProvider>
  );
}

