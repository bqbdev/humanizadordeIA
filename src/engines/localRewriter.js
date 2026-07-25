import { tokenize } from "./tokenizer.js";
import { replaceFromGlossary } from "../assets/glossaryPtBr.js";

const alternatives = [
  [/\bcom o objetivo de\b/gi,["para","a fim de"]], [/\bdevido ao fato de\b/gi,["porque","em razão de"]],
  [/\bno momento atual\b/gi,["hoje","atualmente"]], [/\buma grande quantidade de\b/gi,["muitos","um número expressivo de"]],
  [/\bconta com\b/gi,["dispõe de","tem"]], [/\bpossibilitando a realização de\b/gi,["o que permite realizar","e viabiliza"]],
  [/\bsem a necessidade de\b/gi,["sem exigir","dispensando"]], [/\balém disso\b/gi,["Também","Somado a isso"]],
  [/\bportanto\b/gi,["Por isso","Assim"]], [/\bcontudo\b/gi,["Ainda assim","Por outro lado"]],
  [/\bdessa forma\b/gi,["Assim","Com isso"]], [/\bpor meio de\b/gi,["com","a partir de"]],
  [/\bno que diz respeito a\b/gi,["quanto a","sobre"]], [/\btem como finalidade\b/gi,["busca","serve para"]],
  [/\bfazer uso de\b/gi,["usar","recorrer a"]], [/\blevar em consideração\b/gi,["considerar","ter em conta"]],
  [/\bé possível observar que\b/gi,["nota-se que","percebe-se que"]], [/\bé importante destacar que\b/gi,["vale notar que","convém observar que"]],
  [/\bserá desenvolvida\b/gi,["será realizada","será conduzida"]], [/\bserá desenvolvido\b/gi,["será realizado","será conduzido"]],
  [/\bfoi desenvolvida\b/gi,["foi realizada","foi conduzida"]], [/\bfoi desenvolvido\b/gi,["foi realizado","foi conduzido"]],
  [/\bé composta por\b/gi,["reúne","é constituída por"]], [/\bé composto por\b/gi,["reúne","é constituído por"]],
  [/\bsão compostas por\b/gi,["reúnem","são constituídas por"]], [/\bsão compostos por\b/gi,["reúnem","são constituídos por"]],
  [/\bde acordo com\b/gi,["conforme","em conformidade com"]], [/\bem consonância com\b/gi,["em conformidade com","de acordo com"]],
  [/\bcontribui para\b/gi,["favorece","colabora para"]], [/\bcontribuem para\b/gi,["favorecem","colaboram para"]],
  [/\bcom a finalidade de\b/gi,["para","a fim de"]], [/\bcom relação a\b/gi,["sobre","quanto a"]],
  [/\bem relação a\b/gi,["quanto a","no que se refere a"]], [/\bao longo de\b/gi,["durante","no decorrer de"]],
  [/\ba partir de\b/gi,["com base em","por meio de"]], [/\bde maneira\b/gi,["de modo","de forma"]],
  [/\bde forma\b/gi,["de modo","de maneira"]], [/\bcada vez mais\b/gi,["progressivamente","com frequência crescente"]],
  [/\btendo em vista\b/gi,["considerando","diante de"]], [/\bvale ressaltar que\b/gi,["convém destacar que","é relevante observar que"]],
  [/\breforça a importância de\b/gi,["evidencia a relevância de","destaca o valor de"]],
];
const simpleWords = [[/\butilizar\b/gi,"usar"],[/\bnecessita\b/gi,"precisa"],[/\bpossui\b/gi,"tem"],[/\bposteriormente\b/gi,"depois"],[/\bpreviamente\b/gi,"antes"]];
const fillers=/\b(basicamente|realmente|literalmente|certamente|obviamente|simplesmente|essencialmente)\b[,]?\s*/gi;
const hash=(text,variation=0)=>{let h=2166136261+variation*997;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
const upper=(text)=>text?text[0].toLocaleUpperCase("pt-BR")+text.slice(1):text;
const lower=(text)=>text?text[0].toLocaleLowerCase("pt-BR")+text.slice(1):text;
const preserveCase=(source,value)=>source[0]===source[0]?.toUpperCase()?upper(value):value;
const lexicalRewrite=(text,seed)=>alternatives.reduce((value,[pattern,choices],index)=>value.replace(pattern,(match)=>preserveCase(match,choices[(seed+index)%choices.length])),text);
const normalize=(text)=>text.replace(/[ \t]+/g," ").replace(/\s+([,.;:!?])/g,"$1").replace(/([.!?])(?=[A-ZÀ-Ú])/g,"$1 ").replace(/,\s*,/g,",").replace(/\b(Também|Assim|Hoje),\s+/g,"$1 ").trim();
const structuralRewrite=(sentence,seed)=>{
  let value=sentence;value=value.replace(/^E viabiliza /i,"Isso viabiliza ");
  value=value.replace(/^(A|O) (.+?) será (aplicada|aplicado|implementada|implementado) em (uma|um) (.+?) que (.+?)([.!?])$/i,(_,article,subject,verb,placeArticle,place,detail,end)=>`${upper(placeArticle)} ${place} que ${detail} receberá ${lower(article)} ${lower(subject)}${end}`);
  value=value.replace(/^A instituição (dispõe de|tem) (.+?), composta por (.+?)([.!?])$/i,(_,verb,thing,parts,end)=>`${upper(thing)} da instituição inclui ${parts}${end}`);
  value=value.replace(/^(.+?), possibilitando (.+?)([.!?])$/i,(_,idea,result,end)=>`${idea}. Isso permite ${lower(result)}${end}`);
  if(seed%3===0)value=value.replace(/^Para (.+?), (.+?)([.!?])$/i,(_,goal,action,end)=>`${upper(action)} para ${lower(goal)}${end}`);
  return value;
};
const splitLong=(sentence)=>[sentence];
const masculineNouns="projeto|método|propósito|intervalo|cenário|ambiente|apoio|suporte|conjunto|meio|estudante|discente";
const feminineNouns="iniciativa|prática|ação|classe|abordagem|relevância|organização|entidade|exigência|demanda|execução|condução|solução|estrutura|participação|formação";
const masculineMap={a:"o",uma:"um",da:"do",na:"no",pela:"pelo",desta:"deste",nessa:"nesse",essa:"esse",esta:"este"};
const feminineMap={o:"a",um:"uma",do:"da",no:"na",pelo:"pela",deste:"desta",nesse:"nessa",esse:"essa",este:"esta"};
const matchCase=(source,value)=>source[0]===source[0].toUpperCase()?upper(value):value;
const fixDeterminers=(text)=>text
  .replace(new RegExp(`\\b(${Object.keys(masculineMap).join("|")}) (${masculineNouns})\\b`,"gi"),(match,det,noun)=>`${matchCase(det,masculineMap[det.toLowerCase()])} ${noun}`)
  .replace(new RegExp(`\\b(${Object.keys(feminineMap).join("|")}) (${feminineNouns})\\b`,"gi"),(match,det,noun)=>`${matchCase(det,feminineMap[det.toLowerCase()])} ${noun}`);
const fixAgreement=(text)=>fixDeterminers(text)
  .replace(/\bda projeto\b/gi,"do projeto")
  .replace(/\bna projeto\b/gi,"no projeto")
  .replace(/\bpela projeto\b/gi,"pelo projeto")
  .replace(/\b(desta|nessa|essa|esta) projeto\b/gi,(match,word)=>`${({desta:"deste",nessa:"nesse",essa:"esse",esta:"este"})[word.toLowerCase()]} projeto`)
  .replace(/\b(a|uma) projeto\b/gi,(match,article)=>article.toLowerCase()==="uma"?"um projeto":"o projeto")
  .replace(/\bmétodos (matemáticas|pedagógicas|didáticas|inclusivas)\b/gi,(_,adj)=>`métodos ${adj.replace(/as$/i,"os")}`)
  .replace(/\bferramentas (digitais )?(complexos|sofisticados|avançados)\b/gi,(_,middle="",adj)=>`ferramentas ${middle}${adj.replace(/os$/i,"as")}`)
  .replace(/\bprojeto (didática|pedagógica|educacional)\b/gi,(_,adj)=>`projeto ${adj.replace(/a$/i,"o")}`)
  .replace(/\bestratégias (pedagógicos|didáticos|inclusivos)\b/gi,(_,adj)=>`estratégias ${adj.replace(/os$/i,"as")}`);
const adaptRegister=(sentence,style,audience)=>{let value=sentence;value=value.replace(/^E viabiliza /i,"Isso viabiliza ");if(style==="Objetivo")value=value.replace(fillers,"");if(style==="Natural"||style==="Conversacional"||audience==="Público geral")simpleWords.forEach(([p,r])=>value=value.replace(p,r));if(style==="Formal"||style==="Acadêmico")value=value.replace(/\ba gente\b/gi,"nós").replace(/\btem que\b/gi,"deve").replace(/\bpra\b/gi,"para");if(audience==="Ensino Fundamental")simpleWords.forEach(([p,r])=>value=value.replace(p,r));if(audience==="Cliente")value=value.replace(/\bo usuário\b/gi,"você");return value;};
export function localRewrite(text,{style="Natural",audience="Público geral",variation=0}={}){
  const source=normalize(text);const seed=hash(source,variation);const paragraphs=source.split(/\n\s*\n/).filter(Boolean);
  const rewritten=paragraphs.map((paragraph,p)=>tokenize(paragraph).sentences.flatMap(splitLong).map((sentence,i)=>{
    const contextual=structuralRewrite(adaptRegister(lexicalRewrite(sentence,seed+p+i),style,audience),seed+p+i);
    return replaceFromGlossary(contextual,seed+p+i);
  }).join(" ")).join("\n\n");
  return fixAgreement(normalize(rewritten));
}