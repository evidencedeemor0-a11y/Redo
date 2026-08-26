const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const defaultState={balance:2450, frozen:false, notifications:true, compact:false, transactions:[
 {name:"Coffee Shop",meta:"Today • Card purchase",amount:-6.40,type:"out"},
 {name:"Salary Deposit",meta:"Yesterday • Direct deposit",amount:1850,type:"in"},
 {name:"Ride Share",meta:"Yesterday • Card purchase",amount:-14.25,type:"out"},
 {name:"Groceries",meta:"Mon • Card purchase",amount:-52.18,type:"out"}
]};
let state=JSON.parse(localStorage.getItem("gptChimeState")||"null")||structuredClone(defaultState);
const icon=(type)=>type==="in"?'<svg viewBox="0 0 24 24"><path d="M12 19V5M7 10l5-5 5 5"/></svg>':'<svg viewBox="0 0 24 24"><path d="M12 5v14M17 14l-5 5-5-5"/></svg>';
function save(){localStorage.setItem("gptChimeState",JSON.stringify(state))}
function render(){
 $("#balance").textContent=state.balance.toLocaleString("en-US",{style:"currency",currency:"USD"});
 $("#transactions").innerHTML=state.transactions.map(t=>`<article class="transaction"><div class="tx-icon">${icon(t.type)}</div><div class="tx-copy"><b>${t.name}</b><small>${t.meta}</small></div><strong class="amount ${t.type==="in"?"in":""}">${t.amount<0?"−":"+"}$${Math.abs(t.amount).toFixed(2)}</strong></article>`).join("");
 $("#freezeText").textContent=state.frozen?"Unfreeze card":"Freeze card";
 $("#notifyToggle").checked=state.notifications; $("#compactToggle").checked=state.compact;
 document.body.classList.toggle("compact",state.compact);
 const spent=state.transactions.filter(x=>x.amount<0).reduce((a,x)=>a+Math.abs(x.amount),0);
 $("#snapshot").textContent=`You've spent $${spent.toFixed(2)} in this demo.`;
 save();
}
function openModal(kind){
 const m=$("#modal"), title=$("#modalTitle"), desc=$("#modalDescription"), fields=$("#modalFields"), submit=$("#modalSubmit"), iconBox=$("#modalIcon");
 fields.innerHTML=""; submit.textContent="Continue";
 const icons={transfer:"↔",deposit:"↑",pay:"$",card:"▣"};
 iconBox.textContent=icons[kind]||"i";
 if(kind==="transfer"){title.textContent="Transfer money";desc.textContent="Simulate moving funds out of your demo balance.";fields.innerHTML='<div class="field"><label>Recipient</label><input id="recipient" placeholder="e.g. Savings"></div><div class="field"><label>Amount</label><input id="amount" type="number" min="1" step=".01" placeholder="0.00"></div>';submit.textContent="Transfer funds";submit.onclick=e=>{e.preventDefault();const n=parseFloat($("#amount").value),r=$("#recipient").value.trim()||"Demo transfer";if(!n||n<=0||n>state.balance)return alert("Enter an amount within your available demo balance.");state.balance-=n;state.transactions.unshift({name:r,meta:"Just now • Transfer",amount:-n,type:"out"});m.close();render();};}
 if(kind==="deposit"){title.textContent="Add money";desc.textContent="Simulate a deposit into the available balance.";fields.innerHTML='<div class="field"><label>Amount</label><input id="amount" type="number" min="1" step=".01" placeholder="0.00"></div>';submit.textContent="Add funds";submit.onclick=e=>{e.preventDefault();const n=parseFloat($("#amount").value);if(!n||n<=0)return alert("Enter a valid amount.");state.balance+=n;state.transactions.unshift({name:"Demo deposit",meta:"Just now • Added money",amount:n,type:"in"});m.close();render();};}
 if(kind==="pay"){title.textContent="Pay a bill";desc.textContent="Create a simulated outgoing payment.";fields.innerHTML='<div class="field"><label>Payee</label><input id="recipient" placeholder="e.g. Internet"></div><div class="field"><label>Amount</label><input id="amount" type="number" min="1" step=".01" placeholder="0.00"></div>';submit.textContent="Make payment";submit.onclick=e=>{e.preventDefault();const n=parseFloat($("#amount").value),r=$("#recipient").value.trim()||"Bill payment";if(!n||n<=0||n>state.balance)return alert("Enter an amount within your available demo balance.");state.balance-=n;state.transactions.unshift({name:r,meta:"Just now • Bill payment",amount:-n,type:"out"});m.close();render();};}
 if(kind==="card"){title.textContent=state.frozen?"Card is frozen":"Card controls";desc.textContent=state.frozen?"Your demo card is currently frozen.":"You can freeze or unfreeze the demo card from the Cards tab.";submit.textContent=state.frozen?"Unfreeze card":"Freeze card";submit.onclick=e=>{e.preventDefault();state.frozen=!state.frozen;m.close();render();};}
 m.showModal();
}
$$("[data-open]").forEach(b=>b.onclick=()=>openModal(b.dataset.open));
$$(".bottom-nav button").forEach(b=>b.onclick=()=>{$$(".bottom-nav button").forEach(x=>x.classList.remove("active"));b.classList.add("active");$$(".view").forEach(v=>v.classList.remove("active"));$("#"+b.dataset.view).classList.add("active");window.scrollTo({top:0,behavior:"smooth"})});
$("#toggleBalance").onclick=()=>{const hidden=$("#balance").dataset.hidden==="1";$("#balance").dataset.hidden=hidden?"0":"1";$("#balance").textContent=hidden?state.balance.toLocaleString("en-US",{style:"currency",currency:"USD"}):"••••••"};
$("#allActivity").onclick=()=>{openModal("card");$("#modalTitle").textContent="Activity history";$("#modalDescription").textContent=`This demo currently contains ${state.transactions.length} transactions. New simulated transfers, deposits and payments appear here.`};
$("#insightBtn").onclick=()=>openModal("card");
$("#freezeBtn").onclick=()=>{state.frozen=!state.frozen;render()};
$("#replaceBtn").onclick=()=>{alert("Demo request created. No real card replacement is submitted.");};
$("#profileBtn").onclick=()=>{openModal("card");$("#modalTitle").textContent="Demo profile";$("#modalDescription").textContent="GPT Chime Demo User • Account ending 2841. This profile is stored only in this browser."};
$("#notifyToggle").onchange=e=>{state.notifications=e.target.checked;save()};
$("#compactToggle").onchange=e=>{state.compact=e.target.checked;render()};
$("#resetBtn").onclick=()=>{if(confirm("Reset the demo balance and transactions?")){state=structuredClone(defaultState);render()}};
render();
