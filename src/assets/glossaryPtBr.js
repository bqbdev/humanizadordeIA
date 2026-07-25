export const glossaryPtBr = {
  atividade:["ação","prática","iniciativa"], atividades:["ações","práticas","iniciativas"],
  adequada:["apropriada","compatível","satisfatória"], adequado:["apropriado","compatível","satisfatório"],
  adotar:["empregar","aplicar","incorporar"], adoção:["aplicação","incorporação","uso"],
  aluno:["estudante","discente"], alunos:["estudantes","discentes"],
  apresentar:["expor","mostrar","demonstrar"], apresenta:["expõe","mostra","demonstra"],
  aproximadamente:["cerca de"], auxílio:["apoio","suporte"],
  característica:["particularidade"], características:["particularidades"],
  clara:["nítida","compreensível","direta"], claro:["nítido","compreensível","direto"],
  composta:["formada","constituída"], composto:["formado","constituído"],
  compreender:["entender","assimilar"], compreensão:["assimilação"],
  contexto:["cenário","ambiente"], contribuir:["colaborar","favorecer"],
  desenvolver:["elaborar","construir","realizar"], desenvolvida:["realizada","conduzida","elaborada"], desenvolvido:["realizado","conduzido","elaborado"],
  diferente:["distinto","diverso"], diferentes:["distintos","diversos"], diferenciada:["diversificada","específica"], diferenciadas:["diversificadas","específicas"],
  escola:["instituição de ensino","unidade escolar"], escolaridade:["formação escolar"],
  essencial:["indispensável","fundamental"], estratégia:["abordagem"], estratégias:["abordagens"],
  estudante:["aluno","discente"], estudantes:["alunos","discentes"], eventual:["possível","ocasional"],
  facilitar:["simplificar","favorecer"], formada:["constituída","composta"], formado:["constituído","composto"],
  grupo:["conjunto"], grupos:["conjuntos"],
  ideia:["proposta","concepção"], ideias:["propostas","concepções"], implementar:["aplicar","executar","colocar em prática"],
  importância:["relevância"], importante:["relevante","essencial"], incluir:["abranger","incorporar"], inclusiva:["acolhedora","acessível"], inclusivas:["acolhedoras","acessíveis"],
  infraestrutura:["estrutura"], instituição:["organização","entidade"],
  maioria:["maior parte","parcela predominante"], majoritariamente:["predominantemente"],
  melhorar:["aprimorar","aperfeiçoar"], necessário:["indispensável"], necessidade:["exigência","demanda"],
  objetivo:["propósito"], objetivos:["propósitos"], ocorrer:["acontecer","realizar-se"],
  pedagógica:["educacional","didática"], pedagógicas:["educacionais","didáticas"], pedagógico:["educacional","didático"], pedagógicos:["educacionais","didáticos"],
  período:["intervalo"], permitir:["possibilitar","viabilizar"], permite:["possibilita","viabiliza"],
  predominante:["principal","majoritário"], presença:["participação"], proposta:["iniciativa"],
  pública:["estatal"],  realizar:["executar","promover","conduzir"], realização:["execução","condução"],
  recurso:["meio"], recursos:["meios"], reforçar:["evidenciar","ampliar"], reforça:["evidencia","amplia"],
  regular:["habitual","convencional"], relevante:["significativo","importante"], sala:["espaço","ambiente"], salas:["espaços","ambientes"],
  sofisticado:["avançado","complexo"], sofisticados:["avançados","complexos"], tecnologia:["solução digital"], tecnológicos:["digitais","de tecnologia"],
  turma:["classe"], utilizar:["usar","empregar"], variedade:["diversidade","amplitude"]
};

const keepCase=(source,replacement)=>source[0]===source[0]?.toLocaleUpperCase("pt-BR")?replacement[0].toLocaleUpperCase("pt-BR")+replacement.slice(1):replacement;
export function replaceFromGlossary(text,seed=0){
  let index=0;
  return text.replace(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu,(word)=>{
    const options=glossaryPtBr[word.toLocaleLowerCase("pt-BR")];
    if(!options)return word;
    const replacement=options[(seed+index++)%options.length];
    return keepCase(word,replacement);
  });
}