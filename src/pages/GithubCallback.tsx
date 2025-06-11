import { useEffect } from "react";

export default function GithubCallback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      fetch("/api/github-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "/dashboard";
          } else {
            alert("Gagal login dengan GitHub");
          }
        });
    }
  }, []);

  return <div>Loading...</div>;
} 