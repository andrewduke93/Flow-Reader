const x=[[/[\u2018\u2019\u201A\u201B\u2032]/g,"'"],[/[\u201C\u201D\u201E\u201F\u2033]/g,'"'],[/\u2013|\u2014/g,"-"],[/\u00A0/g," "],[/\r\n?/g,`
`],[/\n{3,}/g,`

`]];function y(o){let e=String(o);for(const[r,n]of x)e=e.replace(r,n);return e=e.split(`
`).filter(r=>{const n=r.trim();return!(!n||/^\d{1,4}$/.test(n)||/^[ivxlcdmIVXLCDM]{1,4}$/.test(n))}).join(`
`),e.trim()}function C(o,e=1/0){const n=y(o).split(/\n{2,}/g),t=[];let l=0;for(const i of n){const g=Array.from(i.trim().split(/\s+/g).filter(Boolean));for(const a of g){const c=/[.,:;!?]$/.test(a);if(t.push({text:a,isParagraphBreak:!1,hasPunctuation:c,index:l++}),t.length>=e)return t}if(t.push({text:`
`,isParagraphBreak:!0,hasPunctuation:!1,index:l++}),t.length>=e)break}return t}self.addEventListener("message",async o=>{const{id:e,arrayBuffer:r,maxTokens:n}=o.data;try{const i=await(await import("./pdf-P3jM28GC.js")).getDocument({data:r}).promise,g=i.numPages;let a="";for(let s=1;s<=g;s++){const d=(await(await i.getPage(s)).getTextContent()).items.map(f=>f.str).join(" ");if(a+=`

`+d,a.length>2e4)break;await new Promise(f=>setTimeout(f,0))}let c=null;try{if(self.OffscreenCanvas){const s=await i.getPage(1),u=s.getViewport({scale:1}),p=new OffscreenCanvas(Math.round(u.width),Math.round(u.height)),d=p.getContext("2d");await s.render({canvasContext:d,viewport:u}).promise;const h=await(await p.convertToBlob({type:"image/png"})).arrayBuffer(),w=Array.from(new Uint8Array(h)).map(b=>String.fromCharCode(b)).join("");c=`data:image/png;base64,${btoa(w)}`}}catch{c=null}const m=C(a||"",n??1/0);self.postMessage({id:e,success:!0,text:a,tokens:m,thumbnail:c})}catch(t){self.postMessage({id:e,success:!1,error:String((t==null?void 0:t.message)??t)})}});
