import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Buffer } from "buffer";
import Routers from "./components/Router";
import { NetworkGuard } from "./components/NetworkGuard";

function App() {
  if (!(window as any).Buffer) (window as any).Buffer = Buffer;
  return (
    <>
      <NetworkGuard />
      <div className="relative w-full overflow-x-hidden min-h-screen" id="dashboard">
        <BrowserRouter>
          <Routers />
        </BrowserRouter>
      </div>
      <ToastContainer />
    </>
  );
}

export default App;
