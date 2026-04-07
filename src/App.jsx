import LandingPage from "./pages/LandingPage";
import ComingSoon from "./pages/ComingSoon";
import Modal from "./components/modal";
import './App.css';

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
    <ComingSoon />
    {/* <LandingPage /> */}
    <Modal />
    </>
  );
}
