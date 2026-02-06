import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageLayout from "./components/Layout/PageLayout";
import NewsPage from "./pages/News";
import Ask from "./pages/Ask";
import Show from "./pages/Show";
import Jobs from "./pages/Jobs";
import Header from "./components/Header/Header";

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
