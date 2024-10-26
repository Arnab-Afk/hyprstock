import { useNavigate } from "react-router-dom";

export default function Signin() {
  const navigate = useNavigate();

  const handleSubmit = () => {
    // For external URLs, use window.location or window.open
    window.location.href =
      "https://small-mouse-2759.arnabbhowmik019.workers.dev/google/auth?redirect_url=http%3A%2F%2Flocalhost:5173/callback";

    // Alternatively, you can use window.open if you want to open in a new tab
    // window.open("https://small-mouse-2759.arnabbhowmik019.workers.dev/google/auth?redirect_url=https%3A%2F%2Fwww.google.com", "_blank");
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?{" "}
            <button
              onClick={handleSubmit}
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Google Login
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
