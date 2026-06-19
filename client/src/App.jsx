import { useEffect, useLayoutEffect, useState } from "react";
import { Menu } from "./components";
import { Routes, Route } from "react-router-dom";
import { Error, Main } from "./page";
import { useSelector } from "react-redux";

const App = () => {
  const [offline, setOffline] = useState(!window.navigator.onLine);

  const { loading, user } = useSelector((state) => state);

  const changeColorMode = (to) => {
    if (to) {
      localStorage.setItem("darkMode", true);

      document.body.className = "dark";
    } else {
      localStorage.removeItem("darkMode");

      document.body.className = "light";
    }
  };

  // Dark & Light Mode
  useLayoutEffect(() => {
    let mode = localStorage.getItem("darkMode");

    if (mode) {
      changeColorMode(true);
    } else {
      changeColorMode(false);
    }
  });

  // Offline
  useEffect(() => {
    window.addEventListener("online", (e) => {
      location.reload();
    });

    window.addEventListener("offline", (e) => {
      setOffline(true);
    });
  });

  return (
    <section className="main-grid">
      <div>
        <Menu changeColorMode={changeColorMode} />
      </div>

      {offline && (
        <Error
          status={503}
          content={"Website in offline check your network."}
        />
      )}

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/chat" element={<Main />} />
        <Route path="/chat/:id" element={<Main />} />
      </Routes>
    </section>
  );
};

export default App;
