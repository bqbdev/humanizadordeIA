import { tokenize } from "./tokenizer.js";
import { replaceFromGlossary } from "../assets/glossaryPtBr.js";

const intensiveAlternatives = [
  [/Além das relações interpessoais, a harmonia também está relacionada ao equilíbrio entre o ser humano e o meio ambiente/gi,["A harmonia não se limita aos vínculos humanos, pois também abrange a relação equilibrada entre as pessoas e a natureza","Para além do convívio entre indivíduos, a harmonia envolve o equilíbrio entre a humanidade e o ambiente natural"]],
  [/é um dos princípios fundamentais para a construção de uma convivência saudável e equilibrada/gi,["constitui uma das bases essenciais para formar relações saudáveis e estáveis","integra os fundamentos necessários ao desenvolvimento de relações positivas e equilibradas","figura entre os pilares de uma convivência saudável e estável"]],
  [/pode ser compreendida como o estado em que diferentes pessoas, ideias e situações coexistem de maneira respeitosa/gi,["corresponde à condição na qual pessoas, perspectivas e circunstâncias distintas convivem com respeito","pode ser entendida como uma condição de coexistência respeitosa entre indivíduos, pontos de vista e realidades diferentes","designa uma forma respeitosa de convivência entre pessoas, visões e circunstâncias diversas"]],
  [/promovendo um ambiente de paz, cooperação e entendimento mútuo/gi,["criando um contexto pautado pela tranquilidade, pela colaboração e pela compreensão recíproca","favorecendo um cenário de serenidade, colaboração e compreensão entre todos","estabelecendo relações baseadas na paz, na cooperação e no entendimento mútuo"]],
  [/Em diversos contextos, como na família, na escola, no trabalho e na sociedade/gi,["No ambiente familiar, na instituição de ensino, na vida profissional e na comunidade","Seja no convívio familiar, escolar, profissional ou social","Nos círculos familiar, educacional, profissional e comunitário"]],
  [/desempenha um papel essencial para fortalecer as relações humanas e favorecer o bem-estar coletivo/gi,["é decisiva para consolidar os vínculos interpessoais e ampliar a qualidade de vida comum","tem importância central na consolidação dos laços entre as pessoas e na promoção do bem-estar compartilhado","contribui diretamente para aproximar as pessoas e fortalecer o bem-estar de todos"]],
  [/viver em harmonia não significa a ausência de diferenças ou de conflitos/gi,["conviver harmoniosamente não pressupõe eliminar divergências ou conflitos","uma convivência harmoniosa não exige que diferenças e desacordos deixem de existir"]],
  [/significa reconhecer que opiniões distintas fazem parte da convivência/gi,["significa compreender que pontos de vista divergentes integram as relações humanas","envolve admitir que perspectivas diferentes são próprias da vida em sociedade"]],
  [/o diálogo, a empatia e o respeito são ferramentas importantes para encontrar soluções equilibradas/gi,["a conversa aberta, a capacidade de se colocar no lugar do outro e a consideração mútua ajudam a construir soluções ponderadas","a escuta, a empatia e o respeito oferecem caminhos para alcançar respostas equilibradas"]],
  [/Quando as pessoas estão dispostas a ouvir, compreender e colaborar/gi,["Quando existe disposição para escutar, entender e cooperar","A abertura para a escuta, a compreensão e o trabalho conjunto"]],
  [/torna-se possível superar desafios de maneira mais construtiva/gi,["os desafios podem ser superados por caminhos mais produtivos","é possível enfrentar os obstáculos com uma postura mais construtiva"]],
  [/Além das relações interpessoais/gi,["Para além dos vínculos entre indivíduos","A harmonia não se limita às relações humanas; ela"]],
  [/também está relacionada ao equilíbrio entre o ser humano e o meio ambiente/gi,["também envolve a relação equilibrada entre a humanidade e a natureza","abrange ainda o equilíbrio entre as pessoas e o ambiente natural"]],
  [/A preservação dos recursos naturais, o consumo consciente e o cuidado com os espaços compartilhados/gi,["A proteção do patrimônio natural, as escolhas responsáveis de consumo e a conservação dos locais coletivos","Conservar a natureza, consumir com responsabilidade e zelar pelos ambientes de uso comum"]],
  [/demonstram que pequenas atitudes individuais podem contribuir para uma sociedade mais sustentável e organizada/gi,["evidenciam como ações cotidianas de cada pessoa ajudam a construir uma comunidade sustentável e bem organizada","mostram que iniciativas individuais, mesmo pequenas, favorecem uma organização social mais sustentável"]],
  [/a harmonia ultrapassa as relações entre pessoas e envolve também a responsabilidade com o mundo em que vivemos/gi,["a busca pelo equilíbrio vai além do convívio humano e inclui o compromisso com o planeta que habitamos","esse princípio supera o campo das relações pessoais e alcança o cuidado responsável com o ambiente em que vivemos"]],
  [/representa um valor indispensável para o desenvolvimento de uma sociedade mais justa, solidária e respeitosa/gi,["constitui um valor decisivo para formar uma comunidade mais justa, cooperativa e respeitosa","é indispensável à construção de uma sociedade orientada pela justiça, pela solidariedade e pelo respeito"]],
  [/Cultivar atitudes de compreensão, cooperação e responsabilidade fortalece os vínculos entre as pessoas/gi,["Praticar a compreensão, a colaboração e a responsabilidade consolida os laços humanos","Adotar posturas compreensivas, cooperativas e responsáveis aproxima os indivíduos"]],
  [/cria condições para uma convivência mais positiva/gi,["abre caminho para relações mais saudáveis","favorece uma experiência coletiva mais positiva"]],
  [/buscar a harmonia diariamente é um compromisso que beneficia não apenas cada indivíduo, mas toda a comunidade/gi,["promover o equilíbrio todos os dias constitui um compromisso capaz de favorecer cada pessoa e a coletividade","assumir diariamente uma postura harmoniosa beneficia tanto o indivíduo quanto o conjunto da comunidade"]],
];
const alternatives = [
  [/\bé um dos princípios fundamentais para\b/gi,["constitui uma base essencial para","está entre os fundamentos de"]],
  [/\bpode ser compreendida como\b/gi,["pode ser entendida como","corresponde a"]],
  [/\bpode ser compreendido como\b/gi,["pode ser entendido como","corresponde a"]],
  [/\bdesempenha um papel essencial para\b/gi,["é decisiva para","tem importância central para"]],
  [/\bdesempenha um papel fundamental para\b/gi,["é decisiva para","tem importância central para"]],
  [/\bfazem parte da\b/gi,["integram a","são próprias da"]],
  [/\btorna-se possível\b/gi,["passa a ser possível","é possível"]],
  [/\bestá relacionada ao\b/gi,["liga-se ao","também envolve o"]],
  [/\bdemonstram que\b/gi,["mostram que","evidenciam que"]],
  [/\bEm síntese\b/gi,["Em resumo","De modo geral"]],
  [/\brepresenta um valor indispensável para\b/gi,["constitui um valor decisivo para","é indispensável ao"]],
  [/\bcria condições para\b/gi,["abre caminho para","estabelece condições para"]],
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
const lexicalRewrite=(text,seed)=>alternatives.reduce((value,[pattern,choices],index)=>value.replace(pattern,(match)=>preserveCase(match,choices[(seed+index)%choices.length])),intensiveAlternatives.reduce((value,[pattern,choices],index)=>value.replace(pattern,(match)=>preserveCase(match,choices[(seed+index)%choices.length])),text));
const normalize=(text)=>text.replace(/[ \t]+/g," ").replace(/\s+([,.;:!?])/g,"$1").replace(/([.!?])(?=[A-ZÀ-Ú])/g,"$1 ").replace(/,\s*,/g,",").replace(/\bAssim,?\s+/g,"Assim, ").trim();
const agreementWarnings=[
  /\b(diversos|muitos|alguns|outros|esses|estes)\s+(pessoas|ideias|situações|ferramentas|estratégias|atividades)\b/i,
  /\bde (modo|jeito) \w+(a|as)\b/i,
  /\bde forma \w+(o|os)\b/i,
  /\b(a|uma|da|na|pela)\s+(projeto|método|propósito|processo|resultado)\b/i,
  /\b(o|um|do|no|pelo)\s+(atividade|proposta|prática|estratégia|ferramenta)\b/i,
  /\b(favorecer|contribuir|possibilitar)\s+para\s+para\b/i,
  /\b(assim|portanto|com isso)\s+(buscar|pretender|realizar|desenvolver)\b/i,
];
const hasAgreementWarning=(text)=>agreementWarnings.some((pattern)=>pattern.test(text));
const contentWords=(text)=>new Set((text.toLocaleLowerCase("pt-BR").match(/[\p{L}]{4,}/gu)||[]));
const changeRatio=(source,result)=>{
  const before=contentWords(source);const after=contentWords(result);
  if(!before.size)return 1;
  let retained=0;before.forEach((word)=>{if(after.has(word))retained+=1;});
  return 1-(retained/before.size);
};
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
  .replace(/\b(A abertura para [^.!?]+),\s+(possibilita|favorece|permite)\b/gi,"$1 $2")
  .replace(/\bda projeto\b/gi,"do projeto")
  .replace(/\bna projeto\b/gi,"no projeto")
  .replace(/\bpela projeto\b/gi,"pelo projeto")
  .replace(/\b(desta|nessa|essa|esta) projeto\b/gi,(match,word)=>`${({desta:"deste",nessa:"nesse",essa:"esse",esta:"este"})[word.toLowerCase()]} projeto`)
  .replace(/\b(a|uma) projeto\b/gi,(match,article)=>article.toLowerCase()==="uma"?"um projeto":"o projeto")
  .replace(/\bmétodos (matemáticas|pedagógicas|didáticas|inclusivas)\b/gi,(_,adj)=>`métodos ${adj.replace(/as$/i,"os")}`)
  .replace(/\bferramentas (digitais )?(complexos|sofisticados|avançados)\b/gi,(_,middle="",adj)=>`ferramentas ${middle}${adj.replace(/os$/i,"as")}`)
  .replace(/\bprojeto (didática|pedagógica|educacional)\b/gi,(_,adj)=>`projeto ${adj.replace(/a$/i,"o")}`)
  .replace(/\bestratégias (pedagógicos|didáticos|inclusivos)\b/gi,(_,adj)=>`estratégias ${adj.replace(/os$/i,"as")}`)
  .replace(/\bde (modo|jeito) (respeitosa|clara|equilibrada|adequada|construtiva|positiva|direta)\b/gi,(_,form,adj)=>`de ${form} ${adj.replace(/a$/i,"o")}`)
  .replace(/\bde forma (respeitoso|claro|equilibrado|adequado|construtivo|positivo|direto)\b/gi,(_,adj)=>`de forma ${adj.replace(/o$/i,"a")}`);
const adaptRegister=(sentence,style,audience)=>{let value=sentence;value=value.replace(/^E viabiliza /i,"Isso viabiliza ");if(style==="Objetivo")value=value.replace(fillers,"");if(style==="Natural"||style==="Conversacional"||audience==="Público geral")simpleWords.forEach(([p,r])=>value=value.replace(p,r));if(style==="Formal"||style==="Acadêmico")value=value.replace(/\ba gente\b/gi,"nós").replace(/\btem que\b/gi,"deve").replace(/\bpra\b/gi,"para");if(audience==="Ensino Fundamental")simpleWords.forEach(([p,r])=>value=value.replace(p,r));if(audience==="Cliente")value=value.replace(/\bo usuário\b/gi,"você");return value;};
export function localRewrite(text,{style="Natural",audience="Público geral",variation=0}={}){
  const source=normalize(text);const seed=hash(source,variation);const paragraphs=source.split(/\n\s*\n/).filter(Boolean);
  const rewritten=paragraphs.map((paragraph,p)=>{
    const candidate=tokenize(paragraph).sentences.flatMap(splitLong).map((sentence,i)=>{
      const contextual=structuralRewrite(adaptRegister(lexicalRewrite(sentence,seed+p+i),style,audience),seed+p+i);
      const rewrittenSentence=fixAgreement(normalize(replaceFromGlossary(contextual,seed+p+i)));
      return hasAgreementWarning(rewrittenSentence)?fixAgreement(normalize(lexicalRewrite(sentence,seed+p+i))):rewrittenSentence;
    }).join(" ");
    const reviewed=fixAgreement(normalize(candidate));
    if(hasAgreementWarning(reviewed)) return fixAgreement(normalize(lexicalRewrite(paragraph,seed+p)));
    return reviewed;
  }).join("\n\n");
  const finalText=fixAgreement(normalize(rewritten));
  if(changeRatio(source,finalText)<0.10)throw new Error("O glossário local não encontrou alterações suficientes para este texto. Tente outro estilo ou divida o conteúdo em trechos menores.");
  return finalText;
}