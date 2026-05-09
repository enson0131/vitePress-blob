import{Y as S,Q as R,aE as K,G as tt,o as et,p as at,s as rt,g as nt,c as it,b as st,_ as g,l as W,x as ot,d as lt,H as ct,M as ut,a6 as pt,k as gt}from"../app.7b3f7f5d.js";import{p as dt}from"./chunk-4BX2VUAB.b6b112d5.js";import{p as ft}from"./mermaid-parser.core.eb851d18.js";import{d as _}from"./arc.3ea8362b.js";import{o as ht}from"./ordinal.b935e931.js";import"./framework.7c889dd1.js";import"./theme.410d54f2.js";import"./min.93813f99.js";import"./baseUniq.fa78ed1c.js";import"./init.77b53fdd.js";function mt(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function vt(t){return t}function xt(){var t=vt,a=mt,f=null,y=S(0),s=S(R),d=S(0);function o(e){var n,l=(e=K(e)).length,c,h,v=0,u=new Array(l),i=new Array(l),x=+y.apply(this,arguments),w=Math.min(R,Math.max(-R,s.apply(this,arguments)-x)),m,D=Math.min(Math.abs(w)/l,d.apply(this,arguments)),$=D*(w<0?-1:1),p;for(n=0;n<l;++n)(p=i[u[n]=n]=+t(e[n],n,e))>0&&(v+=p);for(a!=null?u.sort(function(A,C){return a(i[A],i[C])}):f!=null&&u.sort(function(A,C){return f(e[A],e[C])}),n=0,h=v?(w-l*$)/v:0;n<l;++n,x=m)c=u[n],p=i[c],m=x+(p>0?p*h:0)+$,i[c]={data:e[c],index:n,value:p,startAngle:x,endAngle:m,padAngle:D};return i}return o.value=function(e){return arguments.length?(t=typeof e=="function"?e:S(+e),o):t},o.sortValues=function(e){return arguments.length?(a=e,f=null,o):a},o.sort=function(e){return arguments.length?(f=e,a=null,o):f},o.startAngle=function(e){return arguments.length?(y=typeof e=="function"?e:S(+e),o):y},o.endAngle=function(e){return arguments.length?(s=typeof e=="function"?e:S(+e),o):s},o.padAngle=function(e){return arguments.length?(d=typeof e=="function"?e:S(+e),o):d},o}var V=tt.pie,z={sections:new Map,showData:!1,config:V},T=z.sections,F=z.showData,St=structuredClone(V),yt=g(()=>structuredClone(St),"getConfig"),wt=g(()=>{T=new Map,F=z.showData,ot()},"clear"),At=g(({label:t,value:a})=>{if(a<0)throw new Error(`"${t}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);T.has(t)||(T.set(t,a),W.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),Ct=g(()=>T,"getSections"),Dt=g(t=>{F=t},"setShowData"),$t=g(()=>F,"getShowData"),U={getConfig:yt,clear:wt,setDiagramTitle:et,getDiagramTitle:at,setAccTitle:rt,getAccTitle:nt,setAccDescription:it,getAccDescription:st,addSection:At,getSections:Ct,setShowData:Dt,getShowData:$t},Tt=g((t,a)=>{dt(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),kt={parse:g(async t=>{const a=await ft("pie",t);W.debug(a),Tt(a,U)},"parse")},Et=g(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),Mt=Et,bt=g(t=>{const a=[...t.values()].reduce((s,d)=>s+d,0),f=[...t.entries()].map(([s,d])=>({label:s,value:d})).filter(s=>s.value/a*100>=1);return xt().value(s=>s.value).sort(null)(f)},"createPieArcs"),Rt=g((t,a,f,y)=>{var P;W.debug(`rendering pie chart
`+t);const s=y.db,d=lt(),o=ct(s.getConfig(),d.pie),e=40,n=18,l=4,c=450,h=c,v=ut(a),u=v.append("g");u.attr("transform","translate("+h/2+","+c/2+")");const{themeVariables:i}=d;let[x]=pt(i.pieOuterStrokeWidth);x??(x=2);const w=o.textPosition,m=Math.min(h,c)/2-e,D=_().innerRadius(0).outerRadius(m),$=_().innerRadius(m*w).outerRadius(m*w);u.append("circle").attr("cx",0).attr("cy",0).attr("r",m+x/2).attr("class","pieOuterCircle");const p=s.getSections(),A=bt(p),C=[i.pie1,i.pie2,i.pie3,i.pie4,i.pie5,i.pie6,i.pie7,i.pie8,i.pie9,i.pie10,i.pie11,i.pie12];let k=0;p.forEach(r=>{k+=r});const G=A.filter(r=>(r.data.value/k*100).toFixed(0)!=="0"),E=ht(C).domain([...p.keys()]);u.selectAll("mySlices").data(G).enter().append("path").attr("d",D).attr("fill",r=>E(r.data.label)).attr("class","pieCircle"),u.selectAll("mySlices").data(G).enter().append("text").text(r=>(r.data.value/k*100).toFixed(0)+"%").attr("transform",r=>"translate("+$.centroid(r)+")").style("text-anchor","middle").attr("class","slice");const j=u.append("text").text(s.getDiagramTitle()).attr("x",0).attr("y",-(c-50)/2).attr("class","pieTitleText"),L=[...p.entries()].map(([r,b])=>({label:r,value:b})),M=u.selectAll(".legend").data(L).enter().append("g").attr("class","legend").attr("transform",(r,b)=>{const I=n+l,Z=I*L.length/2,q=12*n,J=b*I-Z;return"translate("+q+","+J+")"});M.append("rect").attr("width",n).attr("height",n).style("fill",r=>E(r.label)).style("stroke",r=>E(r.label)),M.append("text").attr("x",n+l).attr("y",n-l).text(r=>s.getShowData()?`${r.label} [${r.value}]`:r.label);const H=Math.max(...M.selectAll("text").nodes().map(r=>(r==null?void 0:r.getBoundingClientRect().width)??0)),Q=h+e+n+l+H,N=((P=j.node())==null?void 0:P.getBoundingClientRect().width)??0,X=h/2-N/2,Y=h/2+N/2,B=Math.min(0,X),O=Math.max(Q,Y)-B;v.attr("viewBox",`${B} 0 ${O} ${c}`),gt(v,c,O,o.useMaxWidth)},"draw"),Wt={draw:Rt},Ut={parser:kt,db:U,renderer:Wt,styles:Mt};export{Ut as diagram};
