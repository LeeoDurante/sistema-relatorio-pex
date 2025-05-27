function updateTotal(input) {
  if (input.type !== "number") return;
  if (parseFloat(input.value) > 2) {
    alert("A nota máxima permitida é 2.0");
    input.value = "2.0";
  }
  const row = input.closest('tr');
  const inputs = row.querySelectorAll('input[type="number"]');
  let sum = 0;
  inputs.forEach(i => sum += parseFloat(i.value) || 0);
  row.querySelector(".total").textContent = sum.toFixed(1);
}
function addRow(data = []) {
  const tableBody = document.getElementById("tableBody");
  const newRow = tableBody.rows[0].cloneNode(true);
  newRow.querySelectorAll('input').forEach((input, index) => {
    input.value = data[index] || "";
    if (input.type === "number") {
      input.addEventListener("change", () => updateTotal(input));
    }
  });
  tableBody.appendChild(newRow);
}
function salvarLocal() {
  const dados = [];
  document.querySelectorAll("#tableBody tr").forEach(row => {
    const rowData = Array.from(row.querySelectorAll("input")).map(i => i.value);
    dados.push(rowData);
  });
  localStorage.setItem("tabela_pontuacao", JSON.stringify(dados));
  alert("Dados salvos no navegador.");
}
function apagarDados() {
  if (confirm("Tem certeza que deseja apagar todos os dados?")) {
    localStorage.removeItem("tabela_pontuacao");
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";
    addRow();
  }
}
function carregarLocal() {
  const dados = JSON.parse(localStorage.getItem("tabela_pontuacao") || "[]");
  if (!dados.length) return;
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";
  dados.forEach(rowData => addRow(rowData));
}
window.onload = carregarLocal;
function gerarPDF() {
  const doc = new window.jspdf.jsPDF();
  doc.setFontSize(12);
  doc.text("Tabela de Pontuação", 14, 20);
  let temDataValida = false;
  document.querySelectorAll("#tableBody tr").forEach(row => {
    const data = row.querySelector('input[type="date"]').value;
    if (data) temDataValida = true;
  });
  if (!temDataValida) {
    alert("Você precisa preencher ao menos uma data para gerar o PDF.");
    return;
  }
  let y = 40;
  const campos = ["Planilhas/Etiquetas", "Limpeza Exaustão", "Organização", "Limpeza", "Funcionários", "Total"];
  document.querySelectorAll("#tableBody tr").forEach(row => {
    const inputs = row.querySelectorAll("input");
    if (!inputs[0].value) return;
    const dataVisita = new Date(inputs[0].value);
    const dataFormatada = dataVisita.toLocaleDateString("pt-BR");
    const blocoAltura = 8 + (campos.length * 8) + 12;
    if (y + blocoAltura > 280) {
      doc.addPage();
      y = 20;
      doc.text("Tabela de Pontuação (continuação)", 14, y);
      y += 20;
    }
    doc.rect(10, y - 6, 190, blocoAltura);
    doc.text(`Data da visita: ${dataFormatada}`, 14, y); y += 8;
    for (let i = 1; i <= 5; i++) {
      const nomeCampo = campos[i - 1];
      let valor = parseFloat(inputs[i].value) || 0;
      if (valor > 2) valor = 2;
      doc.text(`${nomeCampo}: ${valor}`, 14, y); y += 8;
    }
    const total = row.querySelector(".total").textContent;
    doc.text(`Total: ${total}`, 14, y); y += 8;
    doc.setFont("courier", "normal");
    doc.text("----------------------------------------", 14, y);
    doc.setFont("helvetica", "normal");
    y += 12;
  });
  doc.save("tabela_pontuacao.pdf");
}
