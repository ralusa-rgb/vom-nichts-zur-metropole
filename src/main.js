const app = document.querySelector("#app");

app.innerHTML = `
  <section style="
    min-height:100vh;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    background:#0b0f14;
    color:white;
    font-family:system-ui;
    text-align:center;
    padding:20px;
  ">
    <h1>Vom Nichts zur Metropole</h1>
    <p>Die Spiel-Engine wird geladen...</p>

    <button onclick="alert('Das Spiel funktioniert!')" style="
      padding:15px 25px;
      border:0;
      border-radius:10px;
      font-size:18px;
    ">
      TEST
    </button>
  </section>
`;