import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";

export default function Signin() {
  const navigate = useNavigate();

  const handleSubmit = () => {
    // For external URLs, use window.location or window.open
    const redirect = import.meta.env.VITE_REDIRECT_URL;
    if (!redirect) {
      window.location.href =
        "https://small-mouse-2759.arnabbhowmik019.workers.dev/google/auth?redirect_url=http%3A%2F%2Flocalhost:5173/callback";
      return;
    }
    window.location.href =
      "https://small-mouse-2759.arnabbhowmik019.workers.dev/google/auth?redirect_url=" +
      redirect +
      "/callback";

    // Alternatively, you can use window.open if you want to open in a new tab
    // window.open("https://small-mouse-2759.arnabbhowmik019.workers.dev/google/auth?redirect_url=https%3A%2F%2Fwww.google.com", "_blank");
  };

  return (
    <div className="flex flex-col justify-center -mt-20 items-center h-screen gap-10 p-4">
      <img src={Logo} className="scale-75" />
      <div className="flex flex-col w-full h-44 items-center align-middle justify-end">
        {/* <img src={EventioLogo} alt="Eventio" className="h-20 w-20" /> */}
      </div>
      <div className="fiex justify-center -mt-40 items-center text-center">
        <p className="text-4xl font-semibold text-gray-400 text-foreground ">
          By Team-LGTM
        </p>
      </div>
      <button
        onClick={handleSubmit}
        className="flex items-center gap-3 p-4 outline outline-sky-500 rounded-xl text-sky-500 text-xl font-bold"
      >
        <img
          src="https://docs.material-tailwind.com/icons/google.svg"
          alt="metamask"
          className="h-6 w-6"
        />
        Continue with Google
      </button>
    </div>
  );
}
