# Firmina

Protótipo mobile para divulgar o trabalho de empreendedoras de São Luís e aproximá-las de compradores e empresas parceiras.

## Executar

```sh
npm install
npm run android
```

O Android deve ter o Expo Go ou uma development build compatível. A primeira execução requer instalar as dependências.

## Acessos de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Pessoa compradora | `compradora@firmina.app` | `firmina123` |
| Empreendedora | `empreendedora@firmina.app` | `firmina123` |
| Equipe SEMMU | `semmu@firmina.app` | `firmina123` |

Também é possível tocar em uma conta na tela inicial para entrar. Usuários sem login veem apenas entrada, cadastro de pessoa e recuperação de acesso. O catálogo, eventos, parcerias, chat e administração exigem sessão autenticada.

Para validar uma vendedora no perfil administrativo, use `DEMO-024`, `DEMO-018` ou `DEMO-031`. Produtos, eventos, contas criadas e mensagens são salvos localmente no dispositivo. Para reiniciar a demonstração, limpe os dados do aplicativo nas configurações do Android.

## Limites do protótipo

Autenticação, chat e avisos são locais e demonstrativos; não há API ou envio de notificações push. O mapa apresenta contagens fictícias por bairro. Não use dados reais de atendimento ou elegibilidade.
