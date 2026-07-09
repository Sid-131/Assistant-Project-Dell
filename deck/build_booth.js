const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.title = "PowerScale Assistant — Booth";

const NAVY="0B1F33", INK="0F1E2E", BLUE="0076CE", BLUEDK="00558F", ORANGE="F97316",
      SLATE="5B6B7B", SLATEL="9AA8B5", LIGHT="F6F8FB", CARD="FFFFFF", BORDER="E3E8EF", ICE="EAF3FB";
const HF="Segoe UI", BF="Segoe UI", W=13.33, H=7.5, M=0.75;
const shadow=()=>({type:"outer",color:"0B1F33",blur:9,offset:3,angle:135,opacity:0.16});
const darkBg=s=>s.background={color:NAVY};
const lightBg=s=>s.background={color:LIGHT};
function eyebrow(s,t,x,y,c){ s.addText(t.toUpperCase(),{x,y,w:11,h:0.35,margin:0,fontFace:HF,fontSize:13,bold:true,charSpacing:3,color:c||BLUE}); }
function card(s,x,y,w,h,fill,line){ s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w,h,rectRadius:0.09,fill:{color:fill||CARD},line:{color:line||BORDER,width:line?2:1},shadow:shadow()}); }

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

// ── SLIDE 1 — Cover / invite ─────────────────────────────────────
let s=pres.addSlide(); darkBg(s);
s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:0.2,h:H,fill:{color:BLUE}});
eyebrow(s,"PowerScale · OneFS WebUI · live demo",M,0.85,BLUE);
s.addText("Talk to your\nstorage cluster.",{x:M,y:1.9,w:8.3,h:2.6,margin:0,fontFace:HF,fontSize:58,bold:true,color:"FFFFFF",lineSpacingMultiple:0.98});
s.addText("An AI assistant built into the OneFS console — it answers your admin questions from the official documentation, with sources.",{x:M,y:4.95,w:7.7,h:1.0,margin:0,fontFace:HF,fontSize:18,color:ICE});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:M,y:6.35,w:4.6,h:0.7,rectRadius:0.35,fill:{color:ORANGE}});
s.addText("👋  Walk up and ask it anything",{x:M,y:6.35,w:4.6,h:0.7,margin:0,align:"center",valign:"middle",fontFace:HF,fontSize:15,bold:true,color:"FFFFFF"});
// mock
const px=9.75,py=1.7,pw=2.95,ph=4.4;
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:px,y:py,w:pw,h:ph,rectRadius:0.1,fill:{color:"FFFFFF"},shadow:shadow()});
s.addShape(pres.shapes.RECTANGLE,{x:px,y:py,w:pw,h:0.7,fill:{color:BLUE}});
s.addText("✦  Assistant",{x:px+0.15,y:py,w:pw-0.3,h:0.7,margin:0,valign:"middle",fontFace:HF,fontSize:13,bold:true,color:"FFFFFF"});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:px+0.9,y:py+0.95,w:1.9,h:0.55,rectRadius:0.08,fill:{color:BLUE}});
s.addText("How do I add a node?",{x:px+0.9,y:py+0.95,w:1.9,h:0.55,margin:4,valign:"middle",align:"center",fontFace:BF,fontSize:9,color:"FFFFFF"});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:px+0.15,y:py+1.65,w:2.4,h:1.5,rectRadius:0.08,fill:{color:"F1F5F9"},line:{color:BORDER,width:1}});
s.addText("1. Cluster management →\n    Hardware configuration.\n2. Add node, then join.",{x:px+0.3,y:py+1.78,w:2.1,h:1.25,margin:0,fontFace:BF,fontSize:8.5,color:INK});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:px+0.15,y:py+3.35,w:1.25,h:0.32,rectRadius:0.05,fill:{color:ICE},line:{color:"CDDDF0",width:1}});
s.addText("Web Admin Guide",{x:px+0.15,y:py+3.35,w:1.25,h:0.32,margin:0,align:"center",valign:"middle",fontFace:BF,fontSize:7,color:BLUEDK});

// ── SLIDE 2 — The stat hook ──────────────────────────────────────
s=pres.addSlide(); darkBg(s);
eyebrow(s,"The problem, in one number",M,0.8,"7FB8E6");
s.addText([{text:"1 in 5",options:{fontSize:120,bold:true,color:ORANGE}}],{x:M,y:1.5,w:5.2,h:2.4,margin:0,fontFace:HF,valign:"middle"});
s.addText("OneFS support cases are questions the documentation already answers —",{x:M,y:4.05,w:7.4,h:1.0,margin:0,fontFace:HF,fontSize:22,bold:true,color:"FFFFFF"});
s.addText("“how do I do X?” and “what does this cluster event mean?”",{x:M,y:5.05,w:7.4,h:0.6,margin:0,fontFace:HF,fontSize:18,italic:true,color:"9FC4E0"});
// 5 ticket icons, 1 highlighted
let tix=6.6, ty=2.0, tw=0.95, tgap=0.28;
for (let i=0;i<5;i++){ const x=tix+i*(tw+tgap); const hot=(i===0);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:ty,w:tw,h:1.25,rectRadius:0.08,fill:{color:hot?ORANGE:"16344F"},line:{color:hot?ORANGE:"23507A",width:1}});
  s.addText("🎫",{x,y:ty+0.18,w:tw,h:0.55,margin:0,align:"center",fontSize:20});
  s.addText(hot?"docs":"case",{x,y:ty+0.78,w:tw,h:0.35,margin:0,align:"center",fontFace:HF,fontSize:10,bold:true,color:hot?"FFFFFF":"9FC4E0"});
}
s.addText("Every one is a ticket that didn't need a human.",{x:tix,y:3.45,w:5.9,h:0.5,margin:0,fontFace:BF,fontSize:13,italic:true,color:"9FC4E0"});

// ── SLIDE 3 — The friction ───────────────────────────────────────
s=pres.addSlide(); lightBg(s);
eyebrow(s,"Why it happens",M,0.8,BLUE);
s.addText("The answer exists — just not on the screen\nthe admin is looking at.",{x:M,y:1.25,w:11.8,h:1.5,margin:0,fontFace:HF,fontSize:34,bold:true,color:INK,lineSpacingMultiple:1.0});
const steps=[["🖥️","In the console","Admin hits a question mid-task"],["📄","Leaves to search","2,000+ pages of PDFs and KB articles"],["🎫","Opens a ticket","...or just asks Dell support"]];
let sx=M, sy=3.4, sw=3.78, sh=2.7, sgap=0.30;
steps.forEach((st,i)=>{const x=sx+i*(sw+sgap);
  card(s,x,sy,sw,sh, i===2?"FFF1E8":CARD, i===2?ORANGE:null);
  s.addShape(pres.shapes.OVAL,{x:x+0.35,y:sy+0.4,w:1.0,h:1.0,fill:{color:i===2?"FCE3CF":ICE}});
  s.addText(st[0],{x:x+0.35,y:sy+0.4,w:1.0,h:1.0,margin:0,align:"center",valign:"middle",fontSize:26});
  s.addText(st[1],{x:x+0.35,y:sy+1.55,w:sw-0.7,h:0.5,margin:0,fontFace:HF,fontSize:18,bold:true,color:INK});
  s.addText(st[2],{x:x+0.35,y:sy+2.05,w:sw-0.7,h:0.55,margin:0,fontFace:BF,fontSize:13,color:SLATE});
  if(i<2) s.addText("→",{x:x+sw+0.02,y:sy,w:sgap-0.04,h:sh,margin:0,align:"center",valign:"middle",fontFace:HF,fontSize:26,bold:true,color:SLATEL});
});

// ── SLIDE 4 — The idea + mock ────────────────────────────────────
s=pres.addSlide(); lightBg(s);
eyebrow(s,"The idea",M,0.8,BLUE);
s.addText("So we put an expert inside the WebUI.",{x:M,y:1.2,w:7.0,h:1.0,margin:0,fontFace:HF,fontSize:33,bold:true,color:INK});
s.addText([{text:"Ask in plain English, right in the console. ",options:{bold:true,color:INK,breakLine:true}},{text:"Answers come only from the official OneFS 9.12 docs — every one is cited, and it says “I don't know” rather than guess.",options:{color:SLATE}}],{x:M,y:2.5,w:6.4,h:1.7,margin:0,fontFace:BF,fontSize:16});
const ticks=["Grounded in official documentation","A source citation on every answer","No made-up commands or values"];
ticks.forEach((t,i)=>{const y=4.5+i*0.62;
  s.addText("✓",{x:M,y,w:0.45,h:0.5,margin:0,fontFace:HF,fontSize:18,bold:true,color:ORANGE});
  s.addText(t,{x:M+0.5,y,w:6.0,h:0.5,margin:0,valign:"middle",fontFace:BF,fontSize:15,color:INK});});
webuiMock(s, 7.75, 1.4, 4.85, 5.5);

// ── SLIDE 5 — Interactive & actionable ───────────────────────────
s=pres.addSlide(); lightBg(s);
eyebrow(s,"Not a chatbot in a tab",M,0.8,BLUE);
s.addText("It knows your page — and turns answers into actions.",{x:M,y:1.2,w:11.9,h:1.0,margin:0,fontFace:HF,fontSize:31,bold:true,color:INK});
const feats=[["📍","Knows where you are","Tailors answers to the page you're on."],["🧭","Takes you there","Links jump you to the right WebUI screen."],["🩺","Explains events","Turns an alert into a cause and a fix."],["⌨️","Hands you the CLI","Commands ready to copy in one click."]];
let gx=M, gy=2.5, gw=5.8, gh=1.9, ggx=0.3, ggy=0.3;
feats.forEach((f,i)=>{const col=i%2,row=Math.floor(i/2);const x=gx+col*(gw+ggx),y=gy+row*(gh+ggy);
  card(s,x,y,gw,gh);
  s.addShape(pres.shapes.OVAL,{x:x+0.32,y:y+0.52,w:0.85,h:0.85,fill:{color:ICE}});
  s.addText(f[0],{x:x+0.32,y:y+0.52,w:0.85,h:0.85,margin:0,align:"center",valign:"middle",fontSize:20});
  s.addText(f[1],{x:x+1.4,y:y+0.42,w:gw-1.7,h:0.5,margin:0,fontFace:HF,fontSize:17,bold:true,color:INK});
  s.addText(f[2],{x:x+1.4,y:y+0.92,w:gw-1.7,h:0.8,margin:0,fontFace:BF,fontSize:12.5,color:SLATE});});

// ── SLIDE 6 — Cluster events in plain English ────────────────────
s=pres.addSlide(); lightBg(s);
eyebrow(s,"The other big ticket driver",BLUE===0?M:M,0.8,BLUE);
s.addText("Cluster events, explained in plain English.",{x:M,y:1.2,w:11.9,h:1.0,margin:0,fontFace:HF,fontSize:31,bold:true,color:INK});
// event card
card(s,M,2.7,5.2,3.4);
s.addShape(pres.shapes.RECTANGLE,{x:M,y:2.7,w:5.2,h:0.6,fill:{color:"FDECEC"}});
s.addText("⚠  Event 920100012 · Critical",{x:M+0.25,y:2.7,w:4.7,h:0.6,margin:0,valign:"middle",fontFace:HF,fontSize:13,bold:true,color:"C0392B"});
s.addText("Drive in bay 3 on node 10 reported a predictive failure (SMART).",{x:M+0.25,y:3.55,w:4.7,h:0.9,margin:0,fontFace:BF,fontSize:14,color:INK});
s.addText("“What does this mean? Is my data at risk? What do I do?”",{x:M+0.25,y:4.6,w:4.7,h:0.9,margin:0,fontFace:BF,fontSize:13,italic:true,color:SLATE});
s.addText("➜",{x:6.3,y:2.7,w:0.7,h:3.4,margin:0,align:"center",valign:"middle",fontFace:HF,fontSize:34,bold:true,color:ORANGE});
// answer card
card(s,7.1,2.7,5.5,3.4,"F2F8FF",BLUE);
s.addText("✦  Assistant",{x:7.35,y:2.9,w:5,h:0.4,margin:0,fontFace:HF,fontSize:13,bold:true,color:BLUEDK});
s.addText("The drive is predicted to fail. Your data stays protected by OneFS, but you should SmartFail and replace the drive. Run isi devices to confirm, then replace bay 3.",{x:7.35,y:3.35,w:5.0,h:1.7,margin:0,fontFace:BF,fontSize:14,color:INK});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:7.35,y:5.45,w:1.9,h:0.4,rectRadius:0.05,fill:{color:ICE},line:{color:"CDDDF0",width:1}});
s.addText("📄 Event Reference Guide",{x:7.35,y:5.45,w:1.9,h:0.4,margin:0,align:"center",valign:"middle",fontFace:BF,fontSize:9,color:BLUEDK});

// ── SLIDE 7 — Impact + CTA ───────────────────────────────────────
s=pres.addSlide(); darkBg(s);
s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:0.2,h:H,fill:{color:ORANGE}});
eyebrow(s,"Why it matters",M,0.85,ORANGE);
s.addText("Fewer tickets. Faster admins. Fully local.",{x:M,y:1.35,w:11.8,h:1.0,margin:0,fontFace:HF,fontSize:36,bold:true,color:"FFFFFF"});
const imp=[["Deflects the easy cases","The how-to and event questions self-serve, in context."],["Lowers the skill barrier","Junior admins get senior-level answers, instantly."],["Runs on the cluster","100% local — no internet, nothing leaves the box."]];
let bx=M, by=2.9, bw=3.78, bh=2.1, bg=0.30;
imp.forEach((b,i)=>{const x=bx+i*(bw+bg);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:by,w:bw,h:bh,rectRadius:0.08,fill:{color:"14304A"},line:{color:"23507A",width:1}});
  s.addText(b[0],{x:x+0.3,y:by+0.3,w:bw-0.6,h:0.7,margin:0,fontFace:HF,fontSize:16,bold:true,color:"FFFFFF"});
  s.addText(b[1],{x:x+0.3,y:by+1.05,w:bw-0.6,h:0.9,margin:0,fontFace:BF,fontSize:12.5,color:"9FC4E0"});});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:M,y:5.55,w:12.0,h:1.15,rectRadius:0.5,fill:{color:ORANGE}});
s.addText("👉  Try it now on the laptop — ask it anything about OneFS 9.12",{x:M,y:5.55,w:12.0,h:1.15,margin:0,align:"center",valign:"middle",fontFace:HF,fontSize:20,bold:true,color:"FFFFFF"});

pres.writeFile({fileName:"PowerScale-Assistant-Booth.pptx"}).then(f=>console.log("WROTE",f));
