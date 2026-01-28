import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageLayout from "./components/Layout/PageLayout";
import Blogs from "./pages/Blogs";
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
          <Route path="/" element={<Blogs />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/show" element={<Show />} />
          <Route path="/jobs" element={<Jobs />} />
        </Routes>
      </PageLayout>
    </BrowserRouter>
  );
}

export default App;
