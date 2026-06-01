import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchMe } from "../redux/slices/authslice";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const error  = params.get("error");

    if (error || !token) {
      navigate("/login?error=oauth_failed");
      return;
    }

    localStorage.setItem("token", token);

    // Hydrate Redux state exactly like a normal login
    dispatch(fetchMe()).then((result) => {
      if (fetchMe.fulfilled.match(result)) {
        navigate("/");          // or wherever your post-login route is
      } else {
        localStorage.removeItem("token");
        navigate("/login?error=oauth_failed");
      }
    });
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Signing you in…</p>
    </div>
  );
}