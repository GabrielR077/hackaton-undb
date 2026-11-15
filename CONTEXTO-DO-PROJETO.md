# Barreiras ao Empreendedorismo Feminino em São Luís

## Desafio do hackathon

Apoiar mulheres que empreendem nos setores de artesanato e gastronomia em São Luís. O desafio envolve ampliar o acesso à capacitação, dar visibilidade aos produtos e negócios dessas mulheres e criar oportunidades de venda.

## Público do projeto

Mulheres em situação de violência já cadastradas no CRAMSV em São Luís que estão na fase de empreender com produtos de artesanato, gastronomia ou atividades afins.

## Problema central

As empreendedoras atendidas pelo CRAMSV têm dificuldade para divulgar seus produtos, alcançar compradores locais e encontrar espaços para expor seus trabalhos. Isso limita suas oportunidades de venda.

## Proposta do aplicativo

Desenvolver um aplicativo mobile da SEMMU para divulgar os produtos das empreendedoras atendidas pelo CRAMSV e facilitar sua descoberta por potenciais compradores.

## Mensagens de incentivo no aplicativo

O próprio aplicativo terá mensagens curtas para explicar por que a iniciativa existe e incentivar as pessoas a comprar os produtos. As mensagens mostrarão que, ao comprar, o público valoriza o trabalho das empreendedoras de São Luís e contribui para sua geração de renda e autonomia econômica. Elas podem aparecer na tela inicial e no catálogo de produtos.

### Exemplos de frases

- “Compre de quem faz. Valorize o trabalho das empreendedoras de São Luís.”
- “Sua compra ajuda uma empreendedora local a gerar renda com o próprio trabalho.”
- “Conheça o artesanato e a gastronomia de São Luís e apoie quem vive desse trabalho.”

## Perfis de usuário

### 1. Equipe SEMMU (administração)

- **Acesso.** A equipe fará login com usuário e senha definidos previamente. Em caso de problema de acesso, deverá entrar em contato com a equipe de desenvolvimento do aplicativo.
- **Cadastro e validação de vendedoras.** A Equipe SEMMU consultará a base do CRAMSV para validar o cadastro das mulheres. Apenas as que já estiverem cadastradas no CRAMSV poderão receber uma conta de vendedora no aplicativo.
- **Oficinas e eventos.** A Equipe SEMMU oferecerá oficinas às empreendedoras, organizará eventos em parceria com as empresas e poderá cadastrar esses eventos no aplicativo. Assim que um evento for cadastrado, o aplicativo enviará uma notificação a todas as pessoas que tiverem o aplicativo instalado e uma conta cadastrada.
- **Mapa de São Luís.** A área administrativa terá um mapa com pontos indicando a concentração de empreendedoras que já produzem. A Equipe SEMMU usará o mapa para escolher locais de eventos mais próximos das participantes.

### 2. Empreendedoras

- **Acesso.** Farão login na própria conta após o cadastro pela Equipe SEMMU. Poderão recuperar o acesso pela opção **Esqueci minha senha** e alterar a senha.
- **Perfil.** Poderão configurar o próprio perfil e informar suas qualificações. A foto de perfil será opcional.
- **Produtos.** Poderão cadastrar produtos com nome, preço e fotos.
- **Notificações.** Receberão uma notificação assim que um evento for cadastrado e também se ele for cancelado.
- **Chat.** Poderão conversar com usuários externos pelo chat interno do aplicativo.

### 3. Usuários externos (pessoas físicas e empresas parceiras)

- **Acesso e perfil.** Poderão criar uma conta, fazer login e configurar o próprio perfil.
- **Consulta.** Poderão ver os perfis das empreendedoras, os produtos cadastrados e as informações das empresas na seção **Parcerias**.
- **Chat.** Poderão entrar em contato com as empreendedoras pelo chat interno do aplicativo.
- **Notificações.** Receberão notificações sobre os eventos cadastrados.
- **Chamados para eventos.** As empresas parceiras poderão abrir um chamado no aplicativo para contatar a Equipe SEMMU e propor um evento.

## Participação das empresas em eventos

1. A empresa interessada em promover um evento se cadastra no aplicativo como usuária externa.
2. Pelo aplicativo, a empresa abre um chamado para a Equipe SEMMU e propõe um espaço no evento para a exposição dos produtos.
3. A empresa e a Equipe SEMMU articulam a participação das empreendedoras, que poderão apresentar seus trabalhos ao público do evento.

As empresas parceiras custearão os eventos que promoverem em parceria com a SEMMU.

## Seção “Parcerias”

O aplicativo terá uma seção chamada **Parcerias** para apresentar as empresas que apoiam a exposição dos produtos em eventos. A seção dá visibilidade às empresas e reconhece sua contribuição para a divulgação dos negócios das empreendedoras.

## Contexto institucional

A SEMMU é a secretaria responsável por apoiar essas mulheres e seria responsável pelo aplicativo. Segundo o contexto inicial do projeto, a secretaria havia sido criada cerca de cinco meses antes da apresentação da ideia.

## Resultado esperado

Dar mais visibilidade aos produtos e negócios das mulheres atendidas pelo CRAMSV e fortalecer sua presença no empreendedorismo local. Com a divulgação no aplicativo e a exposição em eventos, o projeto busca ampliar as oportunidades de venda e contribuir para a autonomia econômica das participantes.

## Etapas de desenvolvimento

1. **Aplicativo mobile e fluxos.** Montar a navegação dos três perfis e as telas de catálogo, produtos, chat, oficinas, eventos, parcerias e administração. Usar dados fictícios para demonstrar o login, o cadastro de vendedoras pela Equipe SEMMU, os chamados das empresas, os avisos de eventos e o mapa por bairro.
2. **API e regras do aplicativo.** Definir as rotas, os dados de entrada e saída e as permissões de cada perfil. Testar com dados fictícios as regras de cadastro de vendedoras, publicação e cancelamento de eventos, acesso às conversas e chamados das empresas.
3. **Banco de dados e integração final.** Finalizar a modelagem do PostgreSQL, criar as tabelas e políticas de acesso e conectar a API e o aplicativo ao banco. Nesta etapa, integrar os serviços de login, armazenamento de fotos, chat em tempo real e notificações push e testar os fluxos completos dos três perfis.

O protótipo usa o nome provisório **Feito em São Luís**. As telas da etapa 1 consultam a API REST local da etapa 2, implementada em Node.js e TypeScript. As alterações dos [dados fictícios](../api/fixtures/seed.ts) ficam em memória até reiniciar o servidor. O [README](../README.md) documenta como executar o aplicativo e testar cada perfil.

## Tecnologias propostas para o protótipo

A proposta é usar um único aplicativo mobile para os três perfis, com telas adequadas a cada um. O protótipo terá o Android como primeira plataforma de teste.

| Parte do aplicativo | Tecnologia | Uso no projeto |
| --- | --- | --- |
| Aplicativo mobile | React Native, Expo e TypeScript | Telas do catálogo, perfis, chat, eventos, parcerias e administração. O Expo Router organizará a navegação. |
| API do aplicativo | API REST em Node.js e TypeScript na etapa 2 | O servidor valida os dados, verifica permissões e executa as operações sobre dados fictícios. A Supabase Data API e as Edge Functions são a proposta para a etapa de integração. |
| Banco de dados | PostgreSQL no Supabase | Armazena perfis, produtos, empresas, chamados, oficinas, eventos, conversas e dados de notificações. |
| Login e permissões | Supabase Auth e políticas de acesso por registro (RLS) | Login, recuperação de senha e controle de acesso por perfil. A criação de contas de vendedoras passará por uma Edge Function que verificará a permissão do operador da SEMMU e a elegibilidade da empreendedora. |
| Fotos | Supabase Storage | Fotos dos produtos e fotos opcionais de perfil, com permissões de acesso conforme a finalidade das imagens. |
| Chat interno | PostgreSQL e Supabase Realtime | Histórico persistente e atualização das conversas em tempo real, com acesso limitado aos participantes de cada conversa. |
| Notificações | `expo-notifications`, Expo Push Service e Supabase Edge Functions | Envio de avisos de criação e cancelamento de eventos aos dispositivos cadastrados com permissão de notificação. O teste no Android usará uma *development build* do Expo e credenciais do Firebase Cloud Messaging. |
| Mapa administrativo | Malha municipal do IBGE e `react-native-svg` no protótipo | Mapa de São Luís com pontos de referência e contagens por bairro. Para uma integração futura com mapa navegável, a proposta é usar `react-native-maps`. |

Se a recuperação de senha for demonstrada com e-mails externos à equipe do projeto Supabase, será necessário configurar um serviço SMTP próprio.

### Como o aplicativo usa a API

Na etapa 2, o aplicativo usa a API REST local para carregar catálogo e agenda. O login fornece um token para as operações restritas. Ao cadastrar uma vendedora, por exemplo, a API verifica a permissão do operador da SEMMU, valida a referência na base fictícia e registra a conta em memória. A etapa 3 prevê integrar o PostgreSQL, o Supabase Auth e as Edge Functions. A comunicação em produção será por HTTPS.

### Referência para a etapa final do banco de dados

Os dados abaixo orientam a modelagem, que será finalizada na etapa 3.

| Tabela ou conjunto de tabelas | O que armazena |
| --- | --- |
| Perfis e permissões | ID da conta no Supabase Auth, tipo de usuário e permissões atribuídas. O perfil de divulgação da empreendedora inclui nome de exibição, qualificações e referência à foto opcional. |
| Validação de vendedoras | Referência de elegibilidade do CRAMSV consultada pela Equipe SEMMU, status da validação e registro de quem validou e quando. A base é fictícia no protótipo e seu acesso é restrito. |
| Produtos e fotos | Vendedora responsável, nome, descrição, categoria, preço, status de publicação e referências às imagens no Storage. |
| Empresas parceiras | Nome de divulgação, descrição, marca e vínculo com as contas que representam a empresa. Alimenta a seção **Parcerias**. |
| Chamados de empresas | Empresa solicitante, proposta de evento, data sugerida e situação do chamado para acompanhamento pela Equipe SEMMU. |
| Eventos e oficinas | Tipo de atividade, título, descrição, data, local, empresa parceira quando houver e status, incluindo cancelamento. |
| Conversas e mensagens | Participantes da conversa, remetente, conteúdo e horário de envio. O acesso às conversas é limitado aos participantes. |
| Dispositivos e notificações | Conta, token de push do dispositivo e avisos de criação ou cancelamento associados aos eventos. |
| Bairros e produção | Bairro de referência e indicação de que a empreendedora está produzindo, com acesso restrito. O mapa administrativo recebe as contagens agregadas por bairro. |

O Supabase Auth gerencia as credenciais de acesso. O Storage guarda os arquivos de imagem, e o PostgreSQL guarda as referências a esses arquivos. Os perfis de divulgação contêm os dados do negócio. As informações de validação ficam em registros restritos ao CRAMSV.

### Dados para a demonstração

Para o hackathon, a validação do cadastro usará uma base fictícia, sem importar dados reais do CRAMSV. A integração com a base institucional dependerá de acesso autorizado e de definição conjunta sobre quais dados são necessários. A proposta para o mapa é manter os pontos na área administrativa e usar contagens por bairro. O catálogo exibirá as informações de divulgação de cada negócio e de seus produtos, com os dados de atendimento reservados ao CRAMSV.

## Pendências para etapas futuras

- **Benefício adicional para empresas parceiras.** Definir o que as empresas receberão, além da visibilidade na seção **Parcerias**, ao custear eventos.
- **Sistema de entregas.** Será desenvolvido em uma etapa posterior do projeto. 
