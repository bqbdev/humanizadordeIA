import { tokenize } from "./tokenizer.js";

const alternatives = [
  [/\bcom o objetivo de\b/gi,["para","a fim de"]], [/\bdevido ao fato de\b/gi,["porque","em razão de"]],
  [/\bno momento atual\b/gi,["hoje","atualmente"]], [/\buma grande quantidade de\b/gi,["muitos","um número expressivo de"]],
  [/\bconta com\b/gi,["dispõe de","tem"]], [/\bpossibilitando a realização de\b/gi,["o que permite realizar","e viabiliza"]],
  [/\bsem a necessidade de\b/gi,["sem exigir","dispensando"]], [/\balém disso\b/gi,["Também","Somado a isso"]],
  [/\bportanto\b/gi,["Por isso","Assim"]], [/\bcontudo\b/gi,["Ainda assim","Por outro lado"]],
  [/\bdessa forma\b/gi,["Assim","Com isso"]], [/\bpor meio de\b/gi,["com","a partir de"]],
  [/\bno que diz respeito a\b/gi,["quanto a","sobre"]], [/\btem como finalidade\b/gi,["busca","serve para"]],
  [/\bfazer uso de\b/gi,["usar","recorrer a"]], [/\blevar em consideração\b/gi,["considerar","ter em conta"]],
  [/\bé possível observar que\b/gi,["nota-se que","percebe-se que"]], [/\bé importante destacar que\b/gi,["vale observar que",""]],
];
const simpleWords = [[/\butilizar\b/gi,"usar"],[/\bnecessita\b/gi,"precisa"],[/\bpossui\b/gi,"tem"],[/\bposteriormente\b/gi,"depois"],[/\bpreviamente\b/gi,"antes"]];
const fillers=/\b(basicamente|realmente|literalmente|certamente|obviamente|simplesmente|essencialmente)\b[,]?\s*/gi;
const hash=(text,variation=0)=>{let h=2166136261+variation*997;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
const upper=(text)=>text?text[0].toLocaleUpperCase("pt-BR")+text.slice(1):text;
const lower=(text)=>text?text[0].toLocaleLowerCase("pt-BR")+text.slice(1):text;
const preserveCase=(source,value)=>source[0]===source[0]?.toUpperCase()?upper(value):value;
const lexicalRewrite=(text,seed)=>alternatives.reduce((value,[pattern,choices],index)=>value.replace(pattern,(match)=>preserveCase(match,choices[(seed+index)%choices.length])),text);
const normalize=(text)=>text.replace(/[ \t]+/g," ").replace(/\s+([,.;:!?])/g,"$1").replace(/([.!?])(?=[A-ZÀ-Ú])/g,"$1 ").replace(/,\s*,/g,",").trim();
const structuralRewrite=(sentence,seed)=>{
  let value=sentence;value=value.replace(/^E viabiliza /i,"Isso viabiliza ");
  value=value.replace(/^(A|O) (.+?) será (aplicada|aplicado|implementada|implementado) em (uma|um) (.+?) que (.+?)([.!?])$/i,(_,article,subject,verb,placeArticle,place,detail,end)=>`${upper(placeArticle)} ${place} que ${detail} receberá ${lower(article)} ${lower(subject)}${end}`);
  value=value.replace(/^A instituição (dispõe de|tem) (.+?), composta por (.+?)([.!?])$/i,(_,verb,thing,parts,end)=>`${upper(thing)} da instituição inclui ${parts}${end}`);
  value=value.replace(/^(.+?), possibilitando (.+?)([.!?])$/i,(_,idea,result,end)=>`${idea}. Isso permite ${lower(result)}${end}`);
  if(seed%3===0)value=value.replace(/^Para (.+?), (.+?)([.!?])$/i,(_,goal,action,end)=>`${upper(action)} para ${lower(goal)}${end}`);
  return value;
};
const splitLong=(sentence)=>{if(tokenize(sentence).words.length<27)return[sentence];const points=[...sentence.matchAll(/[,;:]\s+/g)].filter(m=>m.index>sentence.length*.3&&m.index<sentence.length*.72);if(!points.length)return[sentence];const point=points.sort((a,b)=>Math.abs(a.index-sentence.length/2)-Math.abs(b.index-sentence.length/2))[0];const first=sentence.slice(0,point.index).trim();const rest=sentence.slice(point.index+point[0].length).trim();return[`${first}.`,`${upper(rest)}`];};
const adaptRegister=(sentence,style,audience)=>{let value=sentence;value=value.replace(/^E viabiliza /i,"Isso viabiliza ");if(style==="Objetivo")value=value.replace(fillers,"");if(style==="Natural"||style==="Conversacional"||audience==="Público geral")simpleWords.forEach(([p,r])=>value=value.replace(p,r));if(style==="Formal"||style==="Acadêmico")value=value.replace(/\ba gente\b/gi,"nós").replace(/\btem que\b/gi,"deve").replace(/\bpra\b/gi,"para");if(audience==="Ensino Fundamental")simpleWords.forEach(([p,r])=>value=value.replace(p,r));if(audience==="Cliente")value=value.replace(/\bo usuário\b/gi,"você");return value;};
export function localRewrite(text,{style="Natural",audience="Público geral",variation=0}={}){
  const source=normalize(text);const seed=hash(source,variation);const paragraphs=source.split(/\n\s*\n/).filter(Boolean);
  const rewritten=paragraphs.map((paragraph,p)=>tokenize(paragraph).sentences.flatMap(splitLong).map((sentence,i)=>structuralRewrite(adaptRegister(lexicalRewrite(sentence,seed+p+i),style,audience),seed+p+i)).join(" ")).join("\n\n");
  return normalize(rewritten);
}