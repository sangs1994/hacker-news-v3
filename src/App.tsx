import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, Box } from "@mui/material";

import PageLayout from "./components/Layout/PageLayout";
import NewsPage from "./pages/News";
import Ask from "./pages/Ask";
import Show from "./pages/Show";
import Jobs from "./pages/Jobs";
import Header from "./components/Header/Header";

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />

      {/* Full-width wrapper to avoid any inherited margins/padding */}
      <Box sx={{ width: "100%", m: 0, p: 0 }}>
        <Header />
        <PageLayout>
          <Routes>
            <Route path="/" element={<NewsPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/ask" element={<Ask />} />
            <Route path="/show" element={<Show />} />
            <Route path="/jobs" element={<Jobs />} />
          </Routes>
        </PageLayout>
      </Box>
    </BrowserRouter>
  );
}

export default App;
