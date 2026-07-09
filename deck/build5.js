const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.title = "PowerScale Assistant — 5-slide pitch";

const NAVY="0B1F33", INK="0F1E2E", BLUE="0076CE", BLUEDK="00558F", ORANGE="F97316",
      SLATE="5B6B7B", SLATEL="9AA8B5", LIGHT="F6F8FB", CARD="FFFFFF", BORDER="E3E8EF",
      ICE="EAF3FB";
const HF="Segoe UI", BF="Segoe UI", W=13.33, H=7.5, M=0.7;
const shadow=()=>({type:"outer",color:"0B1F33",blur:9,offset:3,angle:135,opacity:0.16});
const darkBg=s=>s.background={color:NAVY};
const lightBg=s=>s.background={color:LIGHT};
function eyebrow(s,t,x,y,c){ s.addText(t.toUpperCase(),{x,y,w:9,h:0.3,margin:0,fontFace:HF,fontSize:12,bold:true,charSpacing:3,color:c||BLUE}); }
function title(s,t,x,y,w,c,sz){ s.addText(t,{x,y,w,h:1.4,margin:0,fontFace:HF,fontSize:sz||32,bold:true,color:c||INK,valign:"top"}); }
function card(s,x,y,w,h,fill,line){ s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w,h,rectRadius:0.09,fill:{color:fill||CARD},line:{color:line||BORDER,width:line?2:1},shadow:shadow()}); }

// Reusable WebUI + assistant mock
function webuiMock(s, mx, my, mw, mh){
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:mx,y:my,w:mw,h:mh,rectRadius:0.08,fill:{color:"FFFFFF"},line:{color:BORDER,width:1},shadow:shadow()});
  s.addShape(pres.shapes.RECTANGLE,{x:mx,y:my+0.5,w:mw,h:0.5,fill:{color:BLUE}});
  s.addText("OneFS Storage Administration",{x:mx+0.2,y:my+0.05,w:mw-0.4,h:0.45,margin:0,valign:"middle",fontFace:HF,fontSize:10,bold:true,color:INK});
  s.addText("Dashboard    Cluster mgmt    File System    Protocols",{x:mx+0.2,y:my+0.5,w:mw-0.4,h:0.5,margin:0,valign:"middle",fontFace:BF,fontSize:8.5,color:"FFFFFF"});
  s.addShape(pres.shapes.RECTANGLE,{x:mx+0.25,y:my+1.25,w:2.3,h:0.9,fill:{color:"F1F5F9"}});
  s.addText("Cluster status",{x:mx+0.32,y:my+1.3,w:2,h:0.3,margin:0,fontFace:BF,fontSize:8,color:SLATE});
  s.addShape(pres.shapes.RECTANGLE,{x:mx+0.25,y:my+2.3,w:2.3,h:1.3,fill:{color:"F1F5F9"}});
  const ax=mx+2.75, ay=my+1.2, aw=1.95, ah=mh-1.55;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:ax,y:ay,w:aw,h:ah,rectRadius:0.07,fill:{color:"F8FAFC"},line:{color:"CBD5E1",width:1},shadow:shadow()});
  s.addShape(pres.shapes.RECTANGLE,{x:ax,y:ay,w:aw,h:0.5,fill:{color:BLUE}});
  s.addText("✦ Assistant",{x:ax+0.1,y:ay,w:aw-0.2,h:0.5,margin:0,valign:"middle",fontFace:HF,fontSize:9,bold:true,color:"FFFFFF"});
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:ax+0.55,y:ay+0.65,w:1.3,h:0.4,rectRadius:0.06,fill:{color:BLUE}});
  s.addText("Create an SMB share?",{x:ax+0.55,y:ay+0.65,w:1.3,h:0.4,margin:2,align:"center",valign:"middle",fontFace:BF,fontSize:6.5,color:"FFFFFF"});
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:ax+0.1,y:ay+1.15,w:1.75,h:1.45,rectRadius:0.06,fill:{color:"FFFFFF"},line:{color:BORDER,width:1}});
  s.addText("1. Protocols → Windows\n   Sharing (SMB).\n2. Create an SMB Share.\n3. Name it, set /ifs path.",{x:ax+0.2,y:ay+1.25,w:1.6,h:1.3,margin:0,fontFace:BF,fontSize:6.5,color:INK});
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:ax+0.1,y:ay+2.75,w:1.0,h:0.28,rectRadius:0.04,fill:{color:ICE},line:{color:"CDDDF0",width:1}});
  s.addText("Web Admin Guide",{x:ax+0.1,y:ay+2.75,w:1.0,h:0.28,margin:0,align:"center",valign:"middle",fontFace:BF,fontSize:5.5,color:BLUEDK});
}

// ── SLIDE 1 — Cover ──────────────────────────────────────────────
let s=pres.addSlide(); darkBg(s);
s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:0.18,h:H,fill:{color:BLUE}});
eyebrow(s,"Concept proposal · Dell PowerScale",M,0.85,BLUE);
s.addText("PowerScale Assistant",{x:M,y:2.05,w:8.6,h:1.4,margin:0,fontFace:HF,fontSize:56,bold:true,color:"FFFFFF"});
s.addText("An expert OneFS administrator, embedded in the console.",{x:M,y:3.5,w:7.8,h:0.9,margin:0,fontFace:HF,fontSize:23,color:ICE});
s.addText([{text:"Runs 100% local",options:{bold:true,color:"FFFFFF"}},{text:"   ·   grounded in official OneFS 9.12 documentation   ·   nothing leaves the cluster",options:{color:SLATEL}}],{x:M,y:6.5,w:11,h:0.4,margin:0,fontFace:BF,fontSize:13});
// mock motif
const px=9.7,py=1.55,pw=2.95,ph=4.4;
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:px,y:py,w:pw,h:ph,rectRadius:0.1,fill:{color:"FFFFFF"},shadow:shadow()});
s.addShape(pres.shapes.RECTANGLE,{x:px,y:py,w:pw,h:0.7,fill:{color:BLUE}});
s.addText("✦  Assistant",{x:px+0.15,y:py,w:pw-0.3,h:0.7,margin:0,valign:"middle",fontFace:HF,fontSize:13,bold:true,color:"FFFFFF"});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:px+0.9,y:py+0.95,w:1.9,h:0.55,rectRadius:0.08,fill:{color:BLUE}});
s.addText("How do I add a node?",{x:px+0.9,y:py+0.95,w:1.9,h:0.55,margin:4,valign:"middle",align:"center",fontFace:BF,fontSize:9,color:"FFFFFF"});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:px+0.15,y:py+1.65,w:2.4,h:1.5,rectRadius:0.08,fill:{color:"F1F5F9"},line:{color:BORDER,width:1}});
s.addText("1. Cluster management →\n    Hardware configuration.\n2. Add node, then join.",{x:px+0.3,y:py+1.78,w:2.1,h:1.25,margin:0,fontFace:BF,fontSize:8.5,color:INK});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:px+0.15,y:py+3.35,w:1.25,h:0.32,rectRadius:0.05,fill:{color:ICE},line:{color:"CDDDF0",width:1}});
s.addText("Web Admin Guide",{x:px+0.15,y:py+3.35,w:1.25,h:0.32,margin:0,align:"center",valign:"middle",fontFace:BF,fontSize:7,color:BLUEDK});

// ── SLIDE 2 — Problem ────────────────────────────────────────────
s=pres.addSlide(); lightBg(s);
eyebrow(s,"The problem",M,0.7,BLUE);
title(s,"OneFS is powerful — but expert-gated",M,1.05,11.5,INK,34);
s.addText("The knowledge to run it exists — it just isn't where the admin is working. So routine questions become tab-switches, guesswork, and Dell support cases.",{x:M,y:2.0,w:11.7,h:0.7,margin:0,fontFace:BF,fontSize:15,color:SLATE});
const pains=[["📚","Deep, dense product","11 official manuals, thousands of pages. Answers exist — buried."],
  ["🔀","Out of the workflow","Help means leaving the console for a PDF, a KB portal, or a ticket."],
  ["🎓","Expert-gated","Junior admins stall on senior knowledge; mistakes drive support load."]];
let cw=3.78,ch=3.0,gap=0.30,cy=3.3;
pains.forEach((p,i)=>{const x=M+i*(cw+gap);
  card(s,x,cy,cw,ch);
  s.addShape(pres.shapes.OVAL,{x:x+0.35,y:cy+0.4,w:0.85,h:0.85,fill:{color:ICE}});
  s.addText(p[0],{x:x+0.35,y:cy+0.4,w:0.85,h:0.85,margin:0,align:"center",valign:"middle",fontSize:22});
  s.addText(p[1],{x:x+0.35,y:cy+1.45,w:cw-0.7,h:0.55,margin:0,fontFace:HF,fontSize:17,bold:true,color:INK});
  s.addText(p[2],{x:x+0.35,y:cy+2.0,w:cw-0.7,h:0.85,margin:0,fontFace:BF,fontSize:12.5,color:SLATE});});

// ── SLIDE 3 — Concept + proof ────────────────────────────────────
s=pres.addSlide(); lightBg(s);
eyebrow(s,"The concept — and the proof",M,0.7,BLUE);
title(s,"Embedded, cited — and it already works, fully local",M,1.05,12,INK,30);
webuiMock(s, M, 2.15, 5.5, 4.55);
// right column
const rx=6.55;
s.addText([{text:"Ask in plain English, in the console. ",options:{bold:true,color:INK}},{text:"Answers come only from official OneFS docs, with citations — and it says “I don't know” rather than guess.",options:{color:SLATE}}],{x:rx,y:2.15,w:6.1,h:1.1,margin:0,fontFace:BF,fontSize:14});
const ticks=["Grounded in official documentation","Cites its sources on every answer","Says “I don't know” — no hallucination"];
ticks.forEach((t,i)=>{const y=3.4+i*0.5;
  s.addText("✓",{x:rx,y,w:0.35,h:0.4,margin:0,fontFace:HF,fontSize:15,bold:true,color:ORANGE});
  s.addText(t,{x:rx+0.4,y,w:5.7,h:0.4,margin:0,valign:"middle",fontFace:BF,fontSize:13,color:INK});});
// 2x2 proof stats
const stats=[["11","official manuals indexed"],["5,205","passages searchable"],["0.73–0.79","retrieval relevance"],["0","answers leave the box"]];
let sw=2.95,sh=0.95,sgx=0.25,sgy=0.2,sx0=rx,sy0=5.05;
stats.forEach((st,i)=>{const col=i%2,row=Math.floor(i/2);const x=sx0+col*(sw+sgx),y=sy0+row*(sh+sgy);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w:sw,h:sh,rectRadius:0.07,fill:{color:CARD},line:{color:BORDER,width:1}});
  s.addText(st[0],{x:x+0.18,y:y+0.12,w:sw-0.36,h:0.45,margin:0,fontFace:HF,fontSize:22,bold:true,color:i===3?ORANGE:INK});
  s.addText(st[1],{x:x+0.18,y:y+0.58,w:sw-0.36,h:0.3,margin:0,fontFace:BF,fontSize:10.5,color:SLATE});});

// ── SLIDE 4 — Ships as a sidecar; grows read-only-first ──────────
s=pres.addSlide(); lightBg(s);
eyebrow(s,"How it ships & grows",M,0.7,BLUE);
title(s,"Ships as a sidecar; grows read-only-first",M,1.05,12,INK,32);
// deployment chips
const models=[["On-cluster","Low–Med","Smallest footprint, but inference competes with storage I/O.",false],
  ["Sidecar appliance","Recommended","A small VM beside the cluster — off the nodes, air-gap-safe.",true],
  ["CloudIQ / APEX AIOps","Connected","Dell-hosted SaaS for customers who allow connectivity.",false]];
let dw=3.78,dh=1.75,dg=0.30,dy=2.25;
models.forEach((m,i)=>{const x=M+i*(dw+dg);const rec=m[3];
  card(s,x,dy,dw,dh,rec?"EAF6EF":CARD,rec?"1E8E4E":null);
  s.addText(m[0],{x:x+0.28,y:dy+0.18,w:dw-0.56,h:0.4,margin:0,fontFace:HF,fontSize:15,bold:true,color:INK});
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x+0.28,y:dy+0.62,w:1.35,h:0.34,rectRadius:0.05,fill:{color:rec?"1E8E4E":"EEF2F6"}});
  s.addText(m[1],{x:x+0.28,y:dy+0.62,w:1.35,h:0.34,margin:0,align:"center",valign:"middle",fontFace:HF,fontSize:9.5,bold:true,color:rec?"FFFFFF":SLATE});
  s.addText(m[2],{x:x+0.28,y:dy+1.08,w:dw-0.56,h:0.58,margin:0,fontFace:BF,fontSize:11.5,color:SLATE});});
// roadmap timeline
s.addText("Then earn trust in phases:",{x:M,y:4.55,w:6,h:0.35,margin:0,fontFace:HF,fontSize:13,bold:true,color:INK});
const phases=[["0","Doc Q&A","today"],["1","Live read-only","via Platform API"],["2","Guided actions","RBAC + audit"],["3","Cross-product","CloudIQ fleet"],["4","Proactive","detect & predict"]];
s.addShape(pres.shapes.LINE,{x:M+0.3,y:5.45,w:11.4,h:0,line:{color:"CBD5E1",width:2}});
let tw=2.35,tg=0.13;
phases.forEach((p,i)=>{const x=M+i*(tw+tg);const now=i===0;
  s.addShape(pres.shapes.OVAL,{x:x+tw/2-0.26,y:5.19,w:0.52,h:0.52,fill:{color:now?ORANGE:BLUE}});
  s.addText(p[0],{x:x+tw/2-0.26,y:5.19,w:0.52,h:0.52,margin:0,align:"center",valign:"middle",fontFace:HF,fontSize:15,bold:true,color:"FFFFFF"});
  s.addText(p[1],{x:x,y:5.85,w:tw,h:0.35,margin:0,align:"center",fontFace:HF,fontSize:12.5,bold:true,color:INK});
  s.addText(p[2],{x:x,y:6.2,w:tw,h:0.3,margin:0,align:"center",fontFace:BF,fontSize:10,color:SLATE});});

// ── SLIDE 5 — The bet + portfolio + ask ──────────────────────────
s=pres.addSlide(); darkBg(s);
s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:0.18,h:H,fill:{color:ORANGE}});
eyebrow(s,"The bet",M,0.8,ORANGE);
title(s,"Fewer tickets. Faster admins. A bet bigger than PowerScale.",M,1.2,12,"FFFFFF",32);
const bets=[["Deflect support cases","Admins self-serve from the docs instead of opening Dell cases."],
  ["Lower the expertise barrier","Junior admins get senior-level guidance — expanding who can run OneFS."],
  ["A product feedback flywheel","Anonymized questions reveal doc gaps and unmet needs Dell can't see today."]];
let bw=3.78,bh=1.85,bg=0.30,by=2.7;
bets.forEach((b,i)=>{const x=M+i*(bw+bg);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:by,w:bw,h:bh,rectRadius:0.08,fill:{color:"14304A"},line:{color:"23507A",width:1}});
  s.addText(b[0],{x:x+0.28,y:by+0.24,w:bw-0.56,h:0.6,margin:0,fontFace:HF,fontSize:14.5,bold:true,color:"FFFFFF"});
  s.addText(b[1],{x:x+0.28,y:by+0.85,w:bw-0.56,h:0.9,margin:0,fontFace:BF,fontSize:11.5,color:"9FC4E0"});});
// portfolio one-liner
s.addText([{text:"One engine extends across the portfolio:  ",options:{bold:true,color:"FFFFFF"}},{text:"PowerStore · PowerEdge (Redfish) · PowerProtect · VxRail — CloudIQ as the hub.",options:{color:"9FC4E0"}}],{x:M,y:4.85,w:12,h:0.4,margin:0,fontFace:BF,fontSize:12.5,italic:true});
// the ask
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:M,y:5.5,w:12.0,h:1.15,rectRadius:0.08,fill:{color:ORANGE}});
s.addText([{text:"The ask:  ",options:{bold:true,color:"FFFFFF"}},{text:"green-light a Phase 0–1 pilot on a sidecar with two design-partner clusters.",options:{color:"FFFFFF"}}],{x:M+0.4,y:5.5,w:11.2,h:1.15,margin:0,valign:"middle",fontFace:HF,fontSize:18});

pres.writeFile({fileName:"PowerScale-Assistant-Pitch-5slide.pptx"}).then(f=>console.log("WROTE",f));
