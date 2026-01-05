const form = document.getElementById("loginForm");
const errorEl = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, password })
    });

    const data = await res.json();

    if (!data.ok) {
      errorEl.textContent = data.message || "Credenciales inválidas";
      return;
    }

    // sesión simple
    localStorage.setItem("adminLogged", "true");

    window.location.href = "/admin/dashboard.html";

  } catch (err) {
    errorEl.textContent = "Error de conexión";
  }
});
