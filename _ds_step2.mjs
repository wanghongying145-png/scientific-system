const PORT = 9228;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = targets.find(t => t.type === "page" && t.url.includes("3000"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map(); const events = [];
ws.addEventListener("message", (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) events.push(m); });
await new Promise((res) => ws.addEventListener("open", res));
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) return "EXC: " + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
  return r.result?.result?.value;
};
await send("Runtime.enable");
const center = async (expr) => evalJs(`(() => { const el = ${expr}; if(!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) }; })()`);
const realClick = async (pt) => { if (!pt) return "no point"; await send("Input.dispatchMouseEvent", { type: "mousePressed", x: pt.x, y: pt.y, button: "left", clickCount: 1 }); await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: pt.x, y: pt.y, button: "left", clickCount: 1 }); return "clicked"; };
const clickBtnText = async (text, exact = false) => realClick(await center(`Array.from(document.querySelectorAll("button")).find(b => ${exact ? "b.innerText.replace(/\\s+/g,\" \").trim() === " + JSON.stringify(text) : "b.innerText.includes(" + JSON.stringify(text) + ")"})`));
const pager = () => evalJs(`(() => { const t = document.body.innerText.replace(/\\s+/g," "); const i = t.indexOf("共 "); return i>=0 ? t.slice(i, i+42) : "none"; })()`);
const rows = () => evalJs(`document.querySelectorAll("table tbody tr").length`);

console.log("--- 类别标签切换 ---");
console.log("click 组学与测序:", await clickBtnText("组学与测序"));
await sleep(900);
console.log("pager:", await pager(), "| rows:", await rows());
console.log("所有行均为组学?", await evalJs(`(() => { const trs = Array.from(document.querySelectorAll("table tbody tr")); return trs.every(tr => tr.innerText.includes("组学与测序")); })()`));

console.log("--- 分页 ---");
console.log("下一页:", await clickBtnText("下一页"));
await sleep(800);
console.log("pager:", await pager(), "| rows:", await rows());
console.log("prev disabled?", await evalJs(`(() => { const b = Array.from(document.querySelectorAll("button")).find(x=>x.innerText.includes("上一页")); return b ? b.disabled : "none"; })()`));
console.log("next disabled?", await evalJs(`(() => { const b = Array.from(document.querySelectorAll("button")).find(x=>x.innerText.includes("下一页")); return b ? b.disabled : "none"; })()`));
console.log("上一页:", await clickBtnText("上一页"));
await sleep(700);
console.log("pager:", await pager(), "| rows:", await rows());

console.log("--- 回到全部数据集 ---");
console.log("click 全部数据集:", await clickBtnText("全部数据集"));
await sleep(900);
console.log("pager:", await pager(), "| rows:", await rows());
console.log("exceptions:", events.filter(e => e.method === "Runtime.exceptionThrown").length);
ws.close(); process.exit(0);