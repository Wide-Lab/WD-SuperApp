# Central de Aplicações Widelab

Documento para a equipe interna. Explica o que é a Central, o que dá pra fazer nela e como
ela se conecta com as outras aplicações da casa. Não fala de código.

## O que é

A Central é a porta de entrada das aplicações internas da Widelab. Ela faz duas coisas:

1. **Mostra tudo que existe.** Uma página única com todas as aplicações internas, cada uma
   num card com nome, descrição e link. Ninguém mais precisa guardar URL em favorito, pedir
   o link no WhatsApp ou descobrir que uma ferramenta existia depois de ter feito o trabalho
   à mão.
2. **É o login de todas elas.** Você entra uma vez na Central e, a partir daí, todas as
   aplicações em `widelab.com.br` já sabem quem você é. Sem senha por app, sem cadastro por
   app.

## Como você usa

### Entrar

Você acessa a Central e faz login com **e-mail e senha**. É o único login da casa. Não existe
tela de cadastro: as contas são criadas por quem administra a Central.

### Vitrine

É a tela inicial, e é onde você passa a maior parte do tempo. Um grid com todas as aplicações
publicadas. O card inteiro é um link: clicou, abriu a aplicação.

- **Busca.** O campo no topo filtra os cards conforme você digita, por nome e por descrição.
  Ele ignora acento e maiúscula — procurar por `recibo` acha "Leitor de Recibos", procurar por
  `disparo` acha "Disparador de Mensagens". O contador ao lado mostra quantas sobraram.
- **O termo buscado fica na URL.** Isso significa que você pode mandar o link já filtrado pra
  alguém, e que o botão Voltar do navegador funciona como se espera.
- **Detalhe.** Cada card tem um botão de expandir, que abre a aplicação sem sair da vitrine —
  descrição completa, imagem inteira e o endereço de destino. Serve pra conferir se é aquilo
  mesmo antes de clicar.
- **Cards sem imagem** ganham um desenho de papel milimetrado com uma marca rosa. A posição da
  marca é derivada do identificador da aplicação, então ela é sempre a mesma para aquela
  aplicação: com o tempo, você reconhece o app pelo desenho, mesmo que ninguém tenha subido
  uma capa pra ele.

### Catálogo

É a área de administração, no menu do topo. Qualquer pessoa logada pode usar. Lá você:

- **Publica uma aplicação nova.** Preenche nome, descrição (uma linha, até 160 caracteres),
  endereço e escolhe um ícone. O identificador é sugerido a partir do nome e é o que amarra a
  aplicação pra sempre — ele não muda depois.
- **Edita** o que já está publicado.
- **Sobe uma capa** (PNG, JPEG, WebP ou SVG, até 5 MB) ou remove a que existe. Sem capa, o card
  cai no desenho de papel milimetrado descrito acima.
- **Remove** uma aplicação do ar.

Tudo que você publica aparece na vitrine **na hora**. Não tem deploy, não tem aprovação, não
tem fila. Publicou, está lá.

Não existe categoria, status, destaque nem ordenação manual. É uma decisão, não um esquecimento:
enquanto o catálogo couber numa tela, a busca resolve, e cada campo a mais é um campo que alguém
precisa manter preenchido e correto.

### Sair

O botão de sair fica no canto superior direito. Ele encerra a sessão **em todas as aplicações
de uma vez**, não só na Central. É o outro lado de ter um login só, e é intencional.

## Como as outras aplicações usam a Central

Aqui está o que muda pro resto da casa.

As aplicações internas hospedadas em `widelab.com.br` (WhatsFlow, Disparador de Mensagens,
Leitor de Recibos, CupomWeb) **não têm mais tela de login, nem senha, nem cadastro próprio**.
Quando você abre uma delas:

- Se você já entrou na Central, ela simplesmente abre. Você não vê tela nenhuma no meio.
- Se você não entrou (ou a sessão expirou), ela te manda pra Central, você faz login, e volta
  automaticamente pra página onde estava.

**A Central diz quem você é, não o que você pode fazer.** Ela não tem papel, permissão ou perfil
de acesso — só a identidade (nome e e-mail). Se uma aplicação precisar de níveis de acesso, ela
resolve isso internamente, com as regras que fizerem sentido pra ela. Isso foi decidido de
propósito: as regras de cada ferramenta são diferentes demais entre si pra caber num modelo único.

### A exceção: Cronify

O Cronify roda em `app.cronify.com.br`, fora do domínio da Widelab. Por limitação do navegador
— não por escolha — o login da Central não alcança ele. **O Cronify continua com o login próprio
que sempre teve.** Ele aparece na vitrine como as outras, mas ao clicar você entra com as
credenciais dele.

## O que a Central não faz (e por que)

Perguntas que aparecem sempre:

- **Não tem "esqueci minha senha" ainda.** Perdeu a senha, fala com quem administra a Central.
- **Não tem autocadastro.** Contas são criadas por quem administra.
- **Não tem controle de quem vê o quê.** Todas as aplicações aparecem pra todo mundo que está
  logado. A Central é uma vitrine, não um cofre.
- **Não tem tema claro.** A interface é escura, sem alternância.
