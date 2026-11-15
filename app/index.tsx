import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, type AlertButton, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C={plum:'#3D1A4F',purple:'#80297D',ink:'#212B36',yellow:'#FFE02C',cream:'#FFF9E8',white:'#FFFFFF',muted:'#76717B',line:'#EEE8EF',green:'#31765A'};
type Role='publico'|'empreendedora'|'admin';
type User={email:string;name:string;role:Role;company?:boolean};
type Product={name:string;price:string;owner:string;image?:string};
type Event={title:string;date:string;place:string;cancelled?:boolean};
const initialProducts:Product[]=[{name:'Bolsa de palha trançada',price:'85,00',owner:'Ana Nascimento'},{name:'Bolo de macaxeira',price:'35,00',owner:'Rita Costa'},{name:'Colares de sementes',price:'48,00',owner:'Lúcia Santos'},{name:'Doce de buriti',price:'22,00',owner:'Rita Costa'}];
const adminAccount = { email: 'semmu@firmina.app', password: 'firmina123', name: 'Equipe SEMMU', role: 'admin' as const };
const legacyAdminEmail = 'cramsv@firmina.app';
const accounts=[{email:'compradora@firmina.app',password:'firmina123',name:'Mariana Lima',role:'publico' as Role},{email:'empreendedora@firmina.app',password:'firmina123',name:'Ana Nascimento',role:'empreendedora' as Role},adminAccount];

function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
 if (Platform.OS !== 'web') {
  Alert.alert(title, message, buttons);
  return;
 }

 const text = message ? title + '\n\n' + message : title;
 if (buttons) {
  if (window.confirm(text)) buttons[buttons.length - 1]?.onPress?.();
  return;
 }
 window.alert(text);
}

const webFrame = { width: '100%', alignSelf: 'center' } as const;
const webLogin = Platform.OS === 'web' ? { ...webFrame, maxWidth: 480 } : undefined;
const webDashboard = Platform.OS === 'web' ? { ...webFrame, maxWidth: 1040 } : undefined;
const webSheet = Platform.OS === 'web' ? { ...webFrame, maxWidth: 520 } : undefined;

function BackLink({ label = 'Voltar', onPress }: { label?: string; onPress: () => void }) {
 return (
  <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
   style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginBottom: 8 }}>
   <Text style={{ color: C.purple, fontWeight: '700' }}>← {label}</Text>
  </TouchableOpacity>
 );
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
 const { width } = useWindowDimensions();
 const contentWidth = Math.min(width, 470);
 const photoCornerRadius = contentWidth * (62 / 470);

 return (
  <SafeAreaView style={{ flex: 1, backgroundColor: C.white }}>
   <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
    <View style={{ width: contentWidth, maxWidth: '100%', flexGrow: 1 }}>
     <Image
      source={require('../docs/boas-vindas.png')}
      style={{
       width: '100%',
       height: contentWidth * (918 / 470),
       borderTopLeftRadius: photoCornerRadius,
       borderTopRightRadius: photoCornerRadius,
      }}
      resizeMode="stretch"
      accessibilityLabel="Firmina. Compre de quem faz. Fortaleça quem transforma. Descubra o artesanato e os sabores das empreendedoras de São Luís. Sua compra gera autonomia. Empresas podem abrir espaço em eventos e tornar-se parceiras."
      accessible
     />
     <View style={{ paddingHorizontal: '6.4%', paddingBottom: 24 }}>
      <TouchableOpacity
       accessibilityRole="button"
       accessibilityLabel="Vamos começar"
       onPress={onStart}
       style={{ backgroundColor: C.purple, borderRadius: 20, minHeight: 60, alignItems: 'center', justifyContent: 'center', padding: 14 }}
      >
       <Text style={{ color: C.white, fontWeight: '800', fontSize: 20, textAlign: 'center' }}>Vamos Começar  →</Text>
      </TouchableOpacity>
     </View>
     <View style={{ flexGrow: 1, justifyContent: 'center', backgroundColor: C.cream, paddingHorizontal: 24, paddingVertical: 36, alignItems: 'center' }}>
      <Text style={{ color: C.plum, fontSize: 24, fontWeight: '900' }}>Firmina</Text>
      <Text style={{ color: C.ink, fontSize: 15, marginTop: 8, textAlign: 'center' }}>Uma iniciativa da SEMMU · São Luís</Text>
     </View>
    </View>
   </ScrollView>
  </SafeAreaView>
 );
}

export default function Home(){
 const [hasStarted, setHasStarted] = useState(false);
 const [pageHistory, setPageHistory] = useState<string[]>(['Início']);
 const page = pageHistory[pageHistory.length - 1];
 const navigateTo = (nextPage: string) => {
  setPageHistory(history => history[history.length - 1] === nextPage ? history : [...history, nextPage]);
 };
 const goBack = () => {
  if (pageHistory.length > 1) {
   setPageHistory(history => history.slice(0, -1));
   return;
  }
  setHasStarted(false);
 };
 const [ready,setReady]=useState(false),[user,setUser]=useState<User|null>(null),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[products,setProducts]=useState(initialProducts),[events,setEvents]=useState<Event[]>([{title:'Feira Mulheres que Fazem',date:'22 nov • 09:00',place:'Praça Maria Aragão'},{title:'Oficina de precificação',date:'26 nov • 14:00',place:'CRAMSV — Centro'}]),[messages,setMessages]=useState<string[]>(['Olá! Gostaria de saber mais sobre seus produtos.']),[modal,setModal]=useState(''),[form,setForm]=useState(''),[price,setPrice]=useState(''),[photo,setPhoto]=useState<string|undefined>(),[toast,setToast]=useState('');
 useEffect(()=>{(async()=>{try{const raw=await AsyncStorage.getItem('firmina-state');if(raw){const d=JSON.parse(raw);const savedUser: User | null = d.user ?? null; setUser(savedUser?.role === 'admin' ? { ...savedUser, email: adminAccount.email, name: adminAccount.name } : savedUser);setProducts(d.products||initialProducts);setEvents(d.events||[]);setMessages(d.messages||[])} }finally{setReady(true)}})()},[]);
 useEffect(()=>{if(ready)AsyncStorage.setItem('firmina-state',JSON.stringify({user,products,events,messages})).catch(()=>{})},[ready,user,products,events,messages]);
 const say=(s:string)=>{setToast(s);setTimeout(()=>setToast(''),2200)};
 const login=(e=email,p=password)=>{const normalizedEmail = e.trim().toLowerCase(); const accountEmail = normalizedEmail === legacyAdminEmail ? adminAccount.email : normalizedEmail; const a=accounts.find(x=>x.email===accountEmail&&x.password===p);if(!a){showAlert('Acesso não encontrado','Confira os dados ou use uma conta de demonstração.');return}setUser({email:a.email,name:a.name,role:a.role});setPageHistory(['Início']);setEmail('');setPassword('')};
 const logout=()=>{setUser(null);setPageHistory(['Início']);setEmail('');setPassword('')};
 const addProduct=()=>{if(!form.trim()||!price.trim()){showAlert('Preencha nome e preço');return}setProducts([{name:form.trim(),price:price.trim(),owner:user?.name||'Minha loja',image:photo},...products]);setForm('');setPrice('');setPhoto(undefined);setModal('');say('Produto publicado!')};
 const choosePhoto=async()=>{const r=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:.75});if(!r.canceled)setPhoto(r.assets[0].uri)};
 const addEvent=()=>{if(!form.trim()){showAlert('Informe o título do evento');return}setEvents([{title:form,date:'Data a definir',place:'São Luís'},...events]);setForm('');setModal('');say('Evento cadastrado. Aviso enviado às contas.')};
 const open=(title:string)=>{setForm('');setModal(title)};
 const register = (company: boolean) => {
  const name = form.trim();
  const registeredEmail = email.trim();
  if (!name || !registeredEmail || !password) {
   showAlert('Complete seus dados');
   return;
  }
  setUser({ name, email: registeredEmail, role: 'publico', company });
  setModal('');
  setPageHistory(['Início']);
  setEmail('');
  setPassword('');
 };

 if (!hasStarted) return <WelcomeScreen onStart={() => setHasStarted(true)} />;
 if(!ready)return <SafeAreaView style={{flex:1,backgroundColor:C.cream}}/>;
 if(!user)return <SafeAreaView style={{flex:1,backgroundColor:C.cream}}><KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}><ScrollView contentContainerStyle={[{flexGrow:1,justifyContent:'center',padding:26},webLogin]}><BackLink label="Voltar para a página inicial" onPress={goBack}/><View style={{alignItems:'center',marginBottom:30}}><View style={styles.mark}><Text style={{fontSize:31,color:C.white}}>✿</Text></View><Text style={styles.logo}>firmina</Text><Text style={styles.tag}>FEITO POR MULHERES. FEITO EM SÃO LUÍS.</Text></View><Text style={styles.h1}>Entre na sua conta</Text><Text style={styles.sub}>Acesse a comunidade de empreendedoras de São Luís.</Text><TextInput placeholder="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input}/><TextInput placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} style={styles.input}/><Button title="Entrar" onPress={()=>login()}/><TouchableOpacity onPress={()=>open('Criar conta')} style={{padding:14,alignItems:'center'}}><Text style={{color:C.purple,fontWeight:'700'}}>Criar conta</Text></TouchableOpacity><TouchableOpacity onPress={()=>showAlert('Recuperar senha','Para esta demonstração, use uma das contas abaixo.')} style={{alignItems:'center',padding:6}}><Text style={{color:C.muted}}>Esqueci minha senha</Text></TouchableOpacity><View style={styles.demo}><Text style={styles.section}>CONTAS DE DEMONSTRAÇÃO</Text>{accounts.map(a=><TouchableOpacity key={a.email} onPress={()=>login(a.email,a.password)} style={styles.demoRow}><Text style={{color:C.ink,fontWeight:'600'}}>{a.name}</Text><Text style={{color:C.muted,fontSize:12}}>{a.email} • toque para entrar</Text></TouchableOpacity>)}<Text style={{fontSize:12,color:C.muted,marginTop:4}}>Senha: firmina123</Text></View></ScrollView></KeyboardAvoidingView><Modal visible={modal==='Criar conta'} transparent animationType="slide" onRequestClose={()=>setModal('')}><View style={styles.scrim}><View style={[styles.sheet,webSheet]}><Text style={styles.h2}>Criar conta</Text><Text style={styles.sub}>Contas de empreendedoras são criadas pela Equipe SEMMU.</Text><TextInput placeholder="Seu nome ou nome da empresa" value={form} onChangeText={setForm} style={styles.input}/><TextInput placeholder="E-mail" value={email} onChangeText={setEmail} style={styles.input}/><TextInput placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} style={styles.input}/><Button title="Cadastrar como pessoa" onPress={()=>register(false)}/><Button title="Cadastrar como empresa" secondary onPress={()=>register(true)}/><TouchableOpacity onPress={()=>setModal('')} style={{padding:16,alignItems:'center'}}><Text style={{color:C.purple}}>Cancelar</Text></TouchableOpacity></View></View></Modal></SafeAreaView>;
 const admin=user.role==='admin',seller=user.role==='empreendedora';
 const nav=admin?['Painel','Vendedoras','Eventos','Chamados','Mapa']:seller?['Início','Produtos','Eventos','Chat','Perfil']:['Início','Catálogo','Eventos','Parcerias','Chat','Perfil'];
 const heading=page==='Início'?(admin?'Painel administrativo':seller?'Olá, '+user.name.split(' ')[0]+' 👋':'Olá, '+user.name.split(' ')[0]+' 👋'):page;
 return <SafeAreaView style={[{flex:1,backgroundColor:C.cream},webDashboard]}><View style={styles.top}><View><Text style={styles.brandSmall}>✿ firmina</Text><Text style={styles.role}>{admin?'EQUIPE SEMMU':seller?'EMPREENDEDORA':user.company?'EMPRESA PARCEIRA':'COMUNIDADE'}</Text></View><TouchableOpacity style={styles.avatar} onPress={()=>navigateTo('Perfil')}><Text style={{color:C.plum,fontWeight:'800'}}>{user.name.charAt(0)}</Text></TouchableOpacity></View><ScrollView contentContainerStyle={{padding:20,paddingBottom:120}}><BackLink onPress={goBack}/><Text style={styles.h1}>{heading}</Text>
 {page==='Início'&&<><View style={styles.hero}><Text style={{color:C.yellow,fontSize:12,fontWeight:'800',letterSpacing:1}}>COMPRE DE QUEM FAZ</Text><Text style={styles.heroTitle}>Seu apoio fortalece{ '\n'}quem empreende.</Text><Text style={{color:'#F1EAF5',lineHeight:21}}>Valorize o trabalho das mulheres de São Luís e contribua para sua autonomia.</Text><TouchableOpacity onPress={()=>navigateTo(admin?'Vendedoras':'Catálogo')} style={styles.heroBtn}><Text style={{fontWeight:'800',color:C.plum}}>{admin?'Acessar gestão':'Descobrir produtos'}  →</Text></TouchableOpacity></View>{seller&&<Button title="＋ Cadastrar produto" onPress={()=>open('Novo produto')}/ >}{admin&&<View style={styles.stats}><Stat n="24" label="Empreendedoras"/><Stat n="38" label="Produtos"/><Stat n="3" label="Eventos ativos"/></View>}<Text style={styles.section}>EM DESTAQUE</Text><ProductList data={products.slice(0,3)} onSelect={()=>navigateTo('Catálogo')}/><Text style={styles.section}>PRÓXIMOS EVENTOS</Text><EventList events={events.slice(0,2)}/></>}
 {['Catálogo','Produtos'].includes(page)&&<><Text style={styles.sub}>{seller?'Seus produtos publicados':'Conheça o trabalho das empreendedoras locais.'}</Text>{seller&&<Button title="＋ Cadastrar produto" onPress={()=>open('Novo produto')}/ >}<ProductList data={seller?products.filter(p=>p.owner===user.name):products} onSelect={()=>navigateTo('Chat')}/></>}
 {page==='Eventos'&&<><Text style={styles.sub}>Oficinas e encontros que aproximam negócios e comunidade.</Text>{admin&&<Button title="＋ Cadastrar evento" onPress={()=>open('Novo evento')}/ >}<EventList events={events} admin={admin} onCancel={(idx:number)=>{setEvents(events.map((e,i)=>i===idx?{...e,cancelled:true}:e));say('Cancelamento avisado às contas.')}}/></>}
 {page==='Parcerias'&&<><Text style={styles.sub}>Empresas que abrem espaço para as empreendedoras.</Text>{['Grupo Mateus','Sebrae Maranhão','Shopping da Ilha'].map((x,i)=><Card key={x}><Text style={styles.h2}>{x}</Text><Text style={styles.sub}>{['Apoio a feiras e pontos de exposição.','Formação e fortalecimento de negócios locais.','Espaço para produtos feitos no Maranhão.'][i]}</Text></Card>)}</>}
 {page==='Chat'&&<><Card><Text style={styles.h2}>{seller?'Conversas':'Conversar com uma empreendedora'}</Text><Text style={styles.sub}>Canal seguro para conhecer os produtos e combinar detalhes.</Text></Card>{messages.map((m,i)=><Card key={i}><Text style={{color:C.ink}}>{m}</Text></Card>)}<TextInput placeholder="Escreva uma mensagem" value={form} onChangeText={setForm} style={styles.input}/><Button title="Enviar mensagem" onPress={()=>{if(form.trim()){setMessages([...messages,form.trim()]);setForm('')}}}/></>}
 {page==='Perfil'&&<><Card><Text style={styles.h2}>{user.name}</Text><Text style={styles.sub}>{user.email}</Text><Text style={styles.sub}>{seller?'Empreendedora • São Luís, MA':admin?adminAccount.name:user.company?'Empresa parceira':'Conta da comunidade'}</Text></Card>{seller&&<Card><Text style={styles.h2}>Sobre meu trabalho</Text><TextInput placeholder="Qualificações, história e especialidades" multiline style={[styles.input,{height:90}]}/><Button title="Salvar perfil" onPress={()=>say('Perfil atualizado')}/></Card>}<Button title="Sair da conta" secondary onPress={logout}/></>}
 {page==='Painel'&&<><View style={styles.stats}><Stat n="24" label="Empreendedoras"/><Stat n="38" label="Produtos"/><Stat n="3" label="Eventos ativos"/></View><Button title="＋ Cadastrar vendedora" onPress={()=>open('Validar vendedora')}/><Card><Text style={styles.h2}>Atividade recente</Text><Text style={styles.sub}>2 chamados aguardando análise</Text><Text style={styles.sub}>Próximo evento: Feira Mulheres que Fazem</Text></Card></>}
 {page==='Vendedoras'&&<><Button title="＋ Validar e cadastrar" onPress={()=>open('Validar vendedora')}/>{['Ana Nascimento • Centro','Rita Costa • Anjo da Guarda','Lúcia Santos • Cohab'].map(x=><Card key={x}><Text style={styles.h2}>{x}</Text><Text style={styles.sub}>Cadastro validado • Em atividade</Text></Card>)}</>}
 {page==='Chamados'&&<><Text style={styles.sub}>Propostas enviadas pelas empresas parceiras.</Text>{['Grupo Mateus • Feira de economia criativa','Shopping da Ilha • Exposição de artesanato'].map(x=><Card key={x}><Text style={styles.h2}>{x}</Text><Text style={styles.sub}>Aguardando retorno da Equipe SEMMU</Text><Button title="Marcar como analisado" secondary onPress={()=>say('Chamado atualizado')}/></Card>)}</>}
 {page==='Mapa'&&<><Text style={styles.sub}>Concentração agregada por bairro para apoiar a escolha de locais.</Text><Card><Text style={{fontSize:28,textAlign:'center',color:C.purple}}>⌖ São Luís</Text>{['Centro','Anjo da Guarda','Cohab','Cidade Operária','Itaqui-Bacanga'].map((x,i)=><View key={x} style={styles.mapRow}><Text style={{color:C.ink}}>{x}</Text><Text style={{color:C.purple,fontWeight:'800'}}>{[8,6,5,3,2][i]} empreendedoras</Text></View>)}</Card></>}
 {toast!==''&&<View style={styles.toast}><Text style={{color:C.white,fontWeight:'700'}}>{toast}</Text></View>}</ScrollView><View style={styles.nav}>{nav.map(n=><TouchableOpacity key={n} onPress={()=>navigateTo(n)} style={styles.navItem}><Text style={{fontSize:19,color:page===n?C.purple:C.muted}}>{({Início:'⌂',Catálogo:'▦',Produtos:'▧',Eventos:'◷',Parcerias:'♡',Chat:'◌',Perfil:'◎',Painel:'▤',Vendedoras:'♙',Chamados:'✉',Mapa:'⌖'} as any)[n]}</Text><Text style={{fontSize:10,color:page===n?C.purple:C.muted,fontWeight:page===n?'800':'500'}}>{n}</Text></TouchableOpacity>)}</View>
 <Modal visible={!!modal} transparent animationType="slide" onRequestClose={()=>setModal('')}><View style={styles.scrim}><View style={[styles.sheet,webSheet]}><Text style={styles.h2}>{modal}</Text>{modal==='Novo produto'?<><TextInput placeholder="Nome do produto" value={form} onChangeText={setForm} style={styles.input}/><TextInput placeholder="Preço (R$)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={styles.input}/><TouchableOpacity onPress={choosePhoto} style={styles.photo}><Text style={{color:C.purple,fontWeight:'700'}}>{photo?'Foto selecionada':'＋ Adicionar foto'}</Text></TouchableOpacity><Button title="Publicar produto" onPress={addProduct}/></>:modal==='Novo evento'?<><TextInput placeholder="Nome do evento ou oficina" value={form} onChangeText={setForm} style={styles.input}/><Button title="Cadastrar e avisar contas" onPress={addEvent}/></>:modal==='Validar vendedora'?<><Text style={styles.sub}>Digite o código da base fictícia: DEMO-024, DEMO-018 ou DEMO-031.</Text><TextInput placeholder="Código de elegibilidade" value={form} onChangeText={setForm} style={styles.input}/><Button title="Validar cadastro" onPress={()=>{if(!['DEMO-024','DEMO-018','DEMO-031'].includes(form.toUpperCase()))return showAlert('Cadastro não encontrado','Apenas mulheres já cadastradas no CRAMSV podem receber uma conta.');say('Cadastro validado e conta criada');setModal('')}}/></>:null}<TouchableOpacity onPress={()=>setModal('')} style={{padding:16,alignItems:'center'}}><Text style={{color:C.purple}}>Cancelar</Text></TouchableOpacity></View></View></Modal></SafeAreaView>
}
function Button({title,onPress,secondary=false}:any){return <TouchableOpacity onPress={onPress} style={[styles.button,secondary&&{backgroundColor:C.white,borderWidth:1,borderColor:C.line}]}><Text style={[styles.buttonText,secondary&&{color:C.plum}]}>{title}</Text></TouchableOpacity>}
function Card({children}:any){return <View style={styles.card}>{children}</View>}
function Stat({n,label}:any){return <View style={styles.stat}><Text style={{fontSize:22,fontWeight:'900',color:C.purple}}>{n}</Text><Text style={{fontSize:11,color:C.muted}}>{label}</Text></View>}
function ProductList({data,onSelect}:any){return <View style={styles.grid}>{data.map((p:Product,i:number)=><TouchableOpacity key={i} onPress={onSelect} style={styles.product}>{p.image?<Image source={{uri:p.image}} style={styles.productImage}/>:<View style={[styles.productImage,{backgroundColor:['#F5E5D7','#E9DDED','#F8EDB7'][i%3],alignItems:'center',justifyContent:'center'}]}><Text style={{fontSize:36}}>{['🧺','🍰','📿'][i%3]}</Text></View>}<Text style={{fontWeight:'700',color:C.ink,marginTop:8}} numberOfLines={2}>{p.name}</Text><Text style={{color:C.muted,fontSize:12}}>{p.owner}</Text><Text style={{fontWeight:'900',color:C.purple,marginTop:4}}>R$ {p.price}</Text></TouchableOpacity>)}</View>}
function EventList({events,admin,onCancel}:any){return <>{events.map((e:Event,i:number)=><Card key={i}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:12,color:e.cancelled?'#AA3838':C.purple,fontWeight:'800'}}>{e.cancelled?'CANCELADO':'EVENTO / OFICINA'}</Text><Text style={{color:C.muted,fontSize:12}}>{e.date}</Text></View><Text style={styles.h2}>{e.title}</Text><Text style={styles.sub}>⌖ {e.place}</Text>{admin&&!e.cancelled&&<Button title="Cancelar evento" secondary onPress={()=>showAlert('Cancelar evento','As contas cadastradas serão avisadas.',[{text:'Voltar'},{text:'Confirmar',onPress:()=>onCancel(i)}])}/>}</Card>)}</>}
const styles:any={mark:{width:64,height:64,borderRadius:22,backgroundColor:C.purple,alignItems:'center',justifyContent:'center'},logo:{fontSize:40,fontWeight:'900',color:C.plum,letterSpacing:-2},tag:{fontSize:9,color:C.purple,fontWeight:'800',letterSpacing:1},h1:{fontSize:27,color:C.ink,fontWeight:'900',marginBottom:6},h2:{fontSize:18,color:C.ink,fontWeight:'800',marginBottom:6},sub:{color:C.muted,lineHeight:20,marginBottom:13},input:{backgroundColor:C.white,borderColor:C.line,borderWidth:1,borderRadius:13,padding:15,marginVertical:6,color:C.ink},button:{backgroundColor:C.purple,padding:15,borderRadius:14,alignItems:'center',marginVertical:8},buttonText:{color:C.white,fontWeight:'800',fontSize:15},demo:{backgroundColor:C.white,borderRadius:16,padding:16,marginTop:22},demoRow:{paddingVertical:9,borderBottomWidth:1,borderColor:C.line},section:{fontSize:12,fontWeight:'900',color:C.plum,letterSpacing:1,marginTop:20,marginBottom:10},top:{paddingHorizontal:20,paddingVertical:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:C.cream},brandSmall:{fontWeight:'900',fontSize:20,color:C.plum},role:{fontSize:9,color:C.purple,letterSpacing:1,fontWeight:'800'},avatar:{width:40,height:40,borderRadius:20,backgroundColor:C.yellow,alignItems:'center',justifyContent:'center'},hero:{backgroundColor:C.plum,borderRadius:22,padding:22,marginVertical:16},heroTitle:{color:C.white,fontSize:26,fontWeight:'900',marginVertical:10},heroBtn:{backgroundColor:C.yellow,alignSelf:'flex-start',padding:12,borderRadius:11,marginTop:15},grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},product:{width:'48%',backgroundColor:C.white,borderRadius:16,padding:10,marginBottom:12},productImage:{width:'100%',height:118,borderRadius:12},card:{backgroundColor:C.white,borderRadius:16,padding:16,marginVertical:7,borderWidth:1,borderColor:C.line},stats:{flexDirection:'row',gap:8,marginVertical:10},stat:{flex:1,backgroundColor:C.white,borderRadius:14,padding:12,alignItems:'center'},nav:{position:'absolute',bottom:0,left:0,right:0,backgroundColor:C.white,flexDirection:'row',justifyContent:'space-around',paddingTop:10,paddingBottom:12,borderTopWidth:1,borderColor:C.line},navItem:{alignItems:'center',gap:3,flex:1},scrim:{flex:1,backgroundColor:'#0008',justifyContent:'flex-end'},sheet:{backgroundColor:C.cream,borderTopLeftRadius:24,borderTopRightRadius:24,padding:22,paddingBottom:34},photo:{padding:14,borderWidth:1,borderColor:C.purple,borderStyle:'dashed',borderRadius:12,alignItems:'center',marginVertical:8},toast:{position:'absolute',bottom:16,alignSelf:'center',backgroundColor:C.ink,padding:13,borderRadius:12},mapRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:12,borderTopWidth:1,borderColor:C.line}};
