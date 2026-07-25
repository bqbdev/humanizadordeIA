import { tokenize } from "./tokenizer.js";

const swaps = [
  [/\bdevido ao fato de\b/gi, "porque"], [/\bcom o objetivo de\b/gi, "para"],
  [/\bno momento atual\b/gi, "atualmente"], [/\buma grande quantidade de\b/gi, "muitos"],
  [/\bna minha opinião pessoal\b/gi, "na minha opinião"], [/\bplanejar antecipadamente\b/gi, "planejar"],
  [/\bcontinua a permanecer\b/gi, "permanece"], [/\bmas porém\b/gi, "porém"],
];
const connectors = [[/\balém disso\b/gi,"Também"],[/\bportanto\b/gi,"Por isso"],[/\bcontudo\b/gi,"Ainda assim"],[/\bdessa forma\b/gi,"Assim"]];
const fillers = /\b(basicamente|realmente|literalmente|certamente|obviamente|simplesmente|essencialmente)\b[,]?\s*/gi;
const clean = (text) => swaps.reduce((value,[pattern,replacement]) => value.replace(pattern,replacement),text)
  .replace(/[ \t]+/g," ").replace(/\s+([,.;:!?])/g,"$1").replace(/([.!?])(?=[A-ZÀ-Ú])/g,"$1 ").trim();
const splitLong = (sentence) => {
  if (tokenize(sentence).words.length < 29) return [sentence];
  const points=[...sentence.matchAll(/[,;:]\s+/g)].filter((m)=>m.index>sentence.length*.3&&m.index<sentence.length*.72);
  if(!points.length) return [sentence];
  const point=points.sort((a,b)=>Math.abs(a.index-sentence.length/2)-Math.abs(b.index-sentence.length/2))[0];
  const first=sentence.slice(0,point.index).trim(); const rest=sentence.slice(point.index+point[0].length).trim();
  return [`${first}.`,`${rest.charAt(0).toLocaleUpperCase("pt-BR")}${rest.slice(1)}`];
};
const adapt = (sentence, style, audience, index, variation) => {
  let value=sentence;
  if(style==="Objetivo") value=value.replace(fillers,"").replace(/\bé importante (destacar|ressaltar) que\s*/gi,"");
  if(style==="Natural"||style==="Conversacional") value=value.replace(/\butilizar\b/gi,"usar").replace(/\bnecessita\b/gi,"precisa").replace(/\bpossui\b/gi,"tem");
  if(style==="Formal"||style==="Acadêmico") value=value.replace(/\ba gente\b/gi,"nós").replace(/\btem que\b/gi,"deve").replace(/\bpra\b/gi,"para");
  if(audience==="Ensino Fundamental") value=value.replace(/\bconsequentemente\b/gi,"por isso").replace(/\bposteriormente\b/gi,"depois");
  if(audience==="Cliente") value=value.replace(/\bo usuário\b/gi,"você");
  if(variation>0){const pair=connectors[(index+variation)%connectors.length];value=value.replace(pair[0],pair[1]);}
  return value;
};
export function localRewrite(text,{size="keep",targetWords=0,style="Natural",audience="Público geral",variation=0}={}){
  const source=clean(text); let paragraphs=source.split(/\n\s*\n/).filter(Boolean);
  let result=paragraphs.map((paragraph,p)=>tokenize(paragraph).sentences.flatMap(splitLong).map((s,i)=>adapt(s,style,audience,i+p,variation)).join(" ")).join("\n\n");
  if(size==="reduce") result=result.replace(fillers,"").replace(/\b(na verdade|de fato|de certa forma|em outras palavras)[,]?\s*/gi,"");
  const goal=size==="target"?Math.max(30,targetWords):0;
  if(goal&&tokenize(result).words.length>goal){result=result.split(/\s+/).slice(0,goal).join(" ").replace(/[,;:]?$/,".");}
  if(size==="expand"&&result) result += "\n\nEsse encadeamento ajuda a relacionar as ideias e torna a leitura mais natural, sem alterar as informações apresentadas.";
  return clean(result);
}