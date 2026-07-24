"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { QUESTION_BANK } from "./question-bank";

type Screen = "intro" | "game" | "result";
type AssistantMessage = { role: "nexa" | "user"; text: string };

type Mission = {
  id: string;
  number: string;
  category: string;
  severity: "CRÍTICA" | "ALTA";
  title: string;
  user: string;
  device: string;
  report: string;
  terminal: string[];
  hint: string;
  options: { label: string; correct: boolean; feedback: string }[];
  explanation: string;
  command: string;
};

const MISSIONS: Mission[] = [
  {
    id: "dhcp",
    number: "INC-001",
    category: "RED",
    severity: "CRÍTICA",
    title: "Contabilidad se ha quedado sin conexión",
    user: "Laura · Contabilidad",
    device: "PC-CONTABILIDAD-03",
    report:
      "No puedo entrar al ERP ni navegar. Mis compañeros sí tienen Internet.",
    terminal: [
      "C:\\> ipconfig /all",
      "",
      "Adaptador Ethernet:",
      "  Dirección IPv4. . . . . . : 169.254.34.18",
      "  Máscara de subred . . . . : 255.255.0.0",
      "  Puerta de enlace . . . .  :",
      "  DHCP habilitado . . . . . : Sí",
    ],
    hint: "Una dirección APIPA aparece cuando Windows no obtiene una concesión DHCP.",
    command: "ipconfig /release  →  ipconfig /renew",
    options: [
      {
        label: "Revisar enlace físico, DHCP y renovar la concesión IP",
        correct: true,
        feedback: "Diagnóstico correcto: el equipo no ha recibido configuración DHCP.",
      },
      {
        label: "Cambiar manualmente el DNS a 8.8.8.8",
        correct: false,
        feedback: "El problema aparece antes de DNS: no existe puerta de enlace.",
      },
      {
        label: "Desactivar el antivirus del equipo",
        correct: false,
        feedback: "Es una acción insegura y no explica la dirección APIPA.",
      },
    ],
    explanation:
      "La IP 169.254.x.x es una dirección APIPA. Primero se comprueban cable, puerto y VLAN; después, el servicio DHCP y la renovación de la concesión.",
  },
  {
    id: "dns",
    number: "INC-002",
    category: "SISTEMAS",
    severity: "ALTA",
    title: "El portal interno no responde por su nombre",
    user: "Mario · Recursos Humanos",
    device: "PORTATIL-RRHH-07",
    report:
      "El portal intranet.empresa.local no abre, pero el servidor parece encendido.",
    terminal: [
      "$ ping 10.20.0.15",
      "64 bytes from 10.20.0.15: icmp_seq=1 ttl=64 time=0.8 ms",
      "",
      "$ nslookup intranet.empresa.local",
      "Server:  10.20.0.2",
      "** server can't find intranet.empresa.local: NXDOMAIN",
    ],
    hint: "Si la IP responde pero el nombre no, compara conectividad con resolución.",
    command: "nslookup  →  revisar zona y registro DNS",
    options: [
      {
        label: "Revisar el registro DNS de la intranet y limpiar la caché",
        correct: true,
        feedback: "Correcto: existe conectividad IP, pero falla la resolución de nombres.",
      },
      {
        label: "Reinstalar el navegador del usuario",
        correct: false,
        feedback: "El resultado NXDOMAIN señala al sistema DNS, no al navegador.",
      },
      {
        label: "Reiniciar todos los switches de la oficina",
        correct: false,
        feedback: "El servidor responde por IP; reiniciar la red sería desproporcionado.",
      },
    ],
    explanation:
      "El ping a la IP confirma conectividad. NXDOMAIN indica que el DNS no encuentra el nombre: hay que validar zona, registro A/CNAME, servidor configurado y caché.",
  },
  {
    id: "phishing",
    number: "INC-003",
    category: "SEGURIDAD",
    severity: "CRÍTICA",
    title: "Posible robo de credenciales",
    user: "Sara · Dirección",
    device: "LAPTOP-DIRECCION-01",
    report:
      "He recibido un aviso urgente de Microsoft. Dice que mi cuenta se bloqueará en 15 minutos.",
    terminal: [
      "DE: Seguridad Microsoft <soporte@micros0ft-verifica.net>",
      "ASUNTO: ⚠ ACCIÓN INMEDIATA REQUERIDA",
      "",
      "Su contraseña ha caducado.",
      "Verifique su cuenta: hxxps://login-m365-seguro[.]net",
      "",
      "Adjunto: Formulario_Seguridad.zip",
    ],
    hint: "Busca dominio suplantado, urgencia, enlace externo y archivo inesperado.",
    command: "aislar  →  reportar  →  analizar  →  proteger credenciales",
    options: [
      {
        label: "No abrir nada, reportar el correo y comprobar si hubo interacción",
        correct: true,
        feedback: "Respuesta segura: se contiene el riesgo y se activa el procedimiento.",
      },
      {
        label: "Abrir el enlace en modo incógnito para comprobarlo",
        correct: false,
        feedback: "El modo incógnito no evita phishing, malware ni robo de credenciales.",
      },
      {
        label: "Responder al remitente pidiendo que confirme su identidad",
        correct: false,
        feedback: "Responder valida que la dirección está activa y mantiene el riesgo.",
      },
    ],
    explanation:
      "Se debe preservar el correo, reportarlo, bloquear indicadores y confirmar si la persona abrió el enlace o introdujo datos. Si lo hizo: cambio de contraseña, cierre de sesiones y revisión MFA.",
  },
];

const formatTime = (seconds: number) => {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(
    safe % 60,
  ).padStart(2, "0")}`;
};

const normalizeQuestion = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const TECH_KNOWLEDGE: { terms: string[]; answer: string }[] = [
  {
    terms: [
      "que es una ip",
      "que es ip",
      "que significa ip",
      "definicion de ip",
      "lo que es una ip",
      "explicame que es una ip",
      "explicame la ip",
      "explicame ip",
      "dime que es una ip",
      "para que sirve una ip",
      "para que sirve la ip",
    ],
    answer:
      "IP significa Internet Protocol. Una dirección IP es el identificador lógico que permite localizar una interfaz y enviar datos entre redes. No identifica necesariamente a una persona: puede cambiar, ser privada dentro de una LAN o pública al salir a Internet.",
  },
  {
    terms: ["por que aparece esa ip", "por que sale esa ip", "por que tengo esa ip", "por que aparece 169 254", "por que sale 169 254"],
    answer:
      "La dirección 169.254.x.x aparece porque el equipo tiene DHCP activado, pero no ha conseguido una configuración del servidor. Windows se asigna automáticamente una APIPA para comunicarse solo en el segmento local. Hay que revisar Wi‑Fi o cable, el router o servidor DHCP y después renovar con «ipconfig /release» e «ipconfig /renew».",
  },
  {
    terms: ["que es una direccion ipv4", "que es ipv4", "direccion ipv4"],
    answer:
      "IPv4 es la versión 4 del protocolo IP. Usa direcciones de 32 bits escritas en cuatro números de 0 a 255, por ejemplo 192.168.1.25. La dirección identifica al equipo dentro de una red; la máscara indica qué parte pertenece a la red y qué parte al dispositivo.",
  },
  {
    terms: ["que es una mascara de subred", "mascara de subred"],
    answer:
      "La máscara de subred indica qué bits de una IPv4 identifican la red y cuáles identifican al equipo. Por ejemplo, 255.255.255.0 o /24 significa que los tres primeros bloques representan la red. Gracias a ella, el equipo sabe si un destino está en su LAN o debe enviarlo a la puerta de enlace.",
  },
  {
    terms: ["que es una puerta de enlace", "que significa puerta de enlace"],
    answer:
      "La puerta de enlace predeterminada suele ser la dirección del router. El equipo le entrega los paquetes destinados a otras redes, incluido Internet. Si está vacía o es incorrecta, normalmente podrás comunicarte dentro de tu subred, pero no salir fuera de ella.",
  },
  {
    terms: ["que es dhcp", "que significa dhcp"],
    answer:
      "DHCP es el servicio que entrega automáticamente IP, máscara, puerta de enlace, DNS y duración de la concesión. Su intercambio básico es DORA: Discover, Offer, Request y Acknowledge. Evita configurar manualmente cada equipo y reduce errores y direcciones duplicadas.",
  },
  {
    terms: ["que es una ia", "que es la ia", "inteligencia artificial"],
    answer:
      "Una IA es un sistema informático diseñado para realizar tareas asociadas al razonamiento, la clasificación, la predicción o la generación de contenido. NEXA es un asistente educativo basado en una base de conocimiento y reglas locales: reconoce conceptos de la pregunta y muestra una explicación preparada, pero no examina tu equipo ni sustituye el diagnóstico profesional.",
  },
  {
    terms: ["que es google", "google es internet", "buscador google"],
    answer:
      "Google es una empresa tecnológica y también el nombre de su buscador web. El buscador localiza páginas indexadas y ordena resultados; no es Internet. Internet es la infraestructura mundial de redes y la web es uno de los servicios que funciona sobre ella.",
  },
  {
    terms: ["como configurar una ip", "configurar una ip", "configurar ip en windows", "poner ip fija"],
    answer:
      "En Windows 11: abre Configuración → Red e Internet → tu adaptador → Asignación de IP → Editar → Manual → activa IPv4. Introduce una IP libre del rango, prefijo o máscara, puerta de enlace y DNS; guarda y comprueba con «ipconfig /all» y «ping». Antes de usar una IP fija confirma el plan de direccionamiento para no provocar duplicados. Para volver a automático, selecciona DHCP.",
  },
  {
    terms: ["configurar ip en linux", "ip estatica linux", "ip fija linux"],
    answer:
      "En Linux la configuración persistente depende de la distribución. Con NetworkManager puedes usar «nmcli con mod NOMBRE ipv4.method manual ipv4.addresses 192.168.1.25/24 ipv4.gateway 192.168.1.1 ipv4.dns 1.1.1.1» y reactivar la conexión. Valida antes que la IP esté libre y comprueba con «ip a», «ip route» y «ping».",
  },
  {
    terms: ["como configurar dhcp", "configurar un dhcp", "instalar dhcp", "crear ambito dhcp"],
    answer:
      "Para configurar DHCP: 1) define subred y máscara; 2) crea un ámbito con rango inicial y final; 3) excluye routers, servidores e impresoras con IP fija; 4) configura puerta de enlace, DNS y duración; 5) activa y, en Active Directory, autoriza el servidor; 6) prueba desde un cliente con «ipconfig /release» y «ipconfig /renew»; 7) verifica concesiones y documenta. En un router doméstico estos campos aparecen en LAN o Servidor DHCP.",
  },
  {
    terms: ["arreglar el wifi", "arreglar wifi", "wifi no funciona", "solucionar wifi", "sin wifi"],
    answer:
      "Checklist Wi‑Fi: 1) confirma que el modo avión está desactivado y el adaptador encendido; 2) prueba otro dispositivo para saber el alcance; 3) acércate al punto de acceso y olvida/reconecta la red; 4) reinicia el adaptador y, si afecta a todos, el router; 5) comprueba IP, puerta de enlace y DHCP con «ipconfig /all»; 6) haz ping al router, después a 1.1.1.1 y finalmente a un nombre; 7) actualiza el controlador y revisa canal, banda e interferencias. No restablezcas el router de fábrica sin copia de la configuración.",
  },
  {
    terms: ["errores comunes", "problemas comunes", "soluciones a errores", "fallos comunes"],
    answer:
      "Errores frecuentes: 169.254.x.x → DHCP o enlace; «conectado sin Internet» → puerta de enlace, router o proveedor; una IP responde pero el nombre no → DNS; «red no identificada» → IP, máscara o perfil; IP duplicada → localizar el equipo y corregir reserva o dirección fija; Wi‑Fi lento → señal, saturación o banda; acceso denegado → permisos y credenciales; equipo lento → medir CPU, RAM, disco y temperatura. La regla profesional es medir alcance, aislar la capa, aplicar el cambio mínimo, verificar y documentar.",
  },
  {
    terms: ["conectado sin internet", "sin acceso a internet"],
    answer:
      "Si aparece «conectado sin Internet», comprueba si otros equipos fallan. Revisa que tengas IP válida, máscara y puerta de enlace; haz ping al router, luego a 1.1.1.1 y después a google.com. Router sin respuesta apunta a la LAN; IP externa sin respuesta apunta a ruta o proveedor; IP externa responde pero el nombre no, a DNS.",
  },
  {
    terms: ["ip duplicada", "conflicto de ip"],
    answer:
      "Un conflicto de IP ocurre cuando dos interfaces usan la misma dirección. Desconecta temporalmente una, localiza ambas mediante las tablas DHCP, ARP y switch, corrige la IP fija o la reserva y renueva la concesión. No elijas otra IP al azar: verifica primero que esté libre y fuera del rango dinámico.",
  },
  {
    terms: ["como se te ocurrio", "como surgio", "de donde salio la idea", "por que creaste", "origen del proyecto", "idea del proyecto"],
    answer:
      "La idea surgió al observar que un currículum enumera conocimientos, pero rara vez permite ver cómo razona una persona ante una incidencia. Angelin Espinoza decidió transformar situaciones habituales de soporte IT en una experiencia interactiva donde pudiera demostrar diagnóstico, priorización, seguridad y comunicación técnica. Así nació SOS Oficina: un proyecto pensado para aprender, practicar y mostrar competencias de una forma más memorable que una presentación convencional.",
  },
  {
    terms: ["como se juega", "como se utiliza", "como usar", "instrucciones", "reglas del juego"],
    answer:
      "Pulsa «Iniciar guardia». El sistema seleccionará 50 incidencias distintas de un banco de 500. En cada caso debes leer el aviso del usuario, revisar las evidencias del terminal y elegir la actuación más segura y eficaz. Las decisiones incorrectas restan puntos; las correctas muestran una explicación y la secuencia recomendada. NEXA puede ofrecer contexto y pistas durante la partida.",
  },
  {
    terms: ["para que sirve", "objetivo del juego", "finalidad", "que demuestra"],
    answer:
      "SOS Oficina sirve para practicar diagnóstico técnico y demostrar competencias profesionales en soporte IT. Evalúa lectura de evidencias, redes, sistemas, hardware, seguridad, priorización y comunicación. También funciona como proyecto de portfolio para que empresas y reclutadores puedan conocer de forma interactiva el criterio técnico de Angelin Espinoza.",
  },
  {
    terms: ["por que nexa", "nombre nexa", "significa nexa", "que es nexa"],
    answer:
      "NEXA es el nombre del asistente técnico del proyecto. Se eligió porque transmite conexión, punto de unión y siguiente paso: conecta la evidencia con una explicación clara y ayuda a avanzar sin resolver automáticamente el reto. Su personalidad es directa, segura y orientada al aprendizaje.",
  },
  {
    terms: ["que es internet", "significa internet", "internet"],
    answer:
      "Internet es una red mundial de redes conectadas que intercambian datos mediante la familia de protocolos TCP/IP. Los routers encaminan paquetes entre redes; DNS traduce nombres a direcciones IP; y servicios como la web, el correo o las videollamadas funcionan sobre esta infraestructura. Internet no es lo mismo que la web: la web es uno de sus servicios.",
  },
  {
    terms: ["que es la web", "world wide web", "www"],
    answer:
      "La World Wide Web es un sistema de páginas y recursos enlazados al que se accede mediante navegadores usando HTTP o HTTPS. Funciona sobre Internet, pero Internet también incluye otros servicios como correo, DNS, VPN o transferencia de archivos.",
  },
  {
    terms: ["navegador", "browser"],
    answer:
      "Un navegador es una aplicación que solicita recursos web, interpreta HTML, CSS y JavaScript y los presenta de forma interactiva. Chrome, Edge, Firefox y Safari son ejemplos.",
  },
  {
    terms: ["http", "https"],
    answer:
      "HTTP es el protocolo utilizado para intercambiar recursos web. HTTPS añade cifrado TLS, autenticación del servidor mediante certificados e integridad frente a modificaciones durante el tránsito.",
  },
  {
    terms: ["url", "enlace web"],
    answer:
      "Una URL es la dirección de un recurso. Puede incluir esquema, dominio, puerto, ruta, parámetros y fragmento; por ejemplo, https indica el protocolo y el dominio identifica el servidor.",
  },
  {
    terms: ["correo electronico", "email", "smtp", "imap", "pop3"],
    answer:
      "El correo electrónico suele usar SMTP para enviar mensajes e IMAP o POP3 para acceder a ellos. IMAP mantiene la sincronización con el servidor; POP3 se orienta a descargar mensajes al cliente.",
  },
  {
    terms: ["nube", "cloud computing", "cloud"],
    answer:
      "La computación en la nube proporciona servidores, almacenamiento, aplicaciones y otros recursos bajo demanda a través de una red. Puede ofrecer modelos IaaS, PaaS y SaaS, pero sigue necesitando seguridad, copias, identidades y control de costes.",
  },
  {
    terms: ["como hiciste", "como lo hiciste", "como has hecho", "como lo has hecho", "como esta hecho", "como se hizo", "quien creo", "quien hizo", "autora", "creadora"],
    answer:
      "Este proyecto ha sido creado por Angelin Espinoza como demostración práctica de sus competencias en Sistemas Microinformáticos y Redes. Diseñó la experiencia, preparó los casos técnicos y programó la interfaz y la lógica con React, TypeScript y CSS. Después realizó pruebas responsive y lo publicó mediante GitHub Pages para que cualquier persona pueda utilizarlo desde el navegador.",
  },
  {
    terms: ["tecnologias", "lenguajes", "react", "typescript", "github pages"],
    answer:
      "SOS Oficina está desarrollado con React y TypeScript para la interacción, CSS para el diseño responsive y las animaciones, y una compilación web estática publicada en GitHub Pages. NEXA funciona en el propio navegador mediante una base de conocimiento y reglas contextuales.",
  },
  {
    terms: ["apipa", "169 254"],
    answer:
      "APIPA significa Automatic Private IP Addressing. Windows asigna una dirección 169.254.x.x cuando el equipo tiene DHCP activado, pero no recibe una concesión. Se revisan enlace, cable o Wi‑Fi, VLAN y servidor DHCP; después pueden ejecutarse «ipconfig /release» e «ipconfig /renew».",
  },
  {
    terms: ["dhcp"],
    answer:
      "DHCP asigna automáticamente dirección IP, máscara, puerta de enlace y DNS. El proceso básico es DORA: Discover, Offer, Request y Acknowledge. Si falla, el equipo puede obtener una APIPA o quedarse sin configuración válida.",
  },
  {
    terms: ["dns", "nxdomain"],
    answer:
      "DNS traduce nombres a direcciones IP. NXDOMAIN indica que el nombre no existe para el servidor consultado. Se comprueban servidor DNS, zona, registro A o CNAME, sufijo, reenviadores y caché con herramientas como nslookup o dig.",
  },
  {
    terms: ["direccion ip", "ipv4", "ipv6"],
    answer:
      "Una dirección IP identifica una interfaz en una red. IPv4 usa 32 bits, por ejemplo 192.168.1.20; IPv6 usa 128 bits y ofrece un espacio mucho mayor, por ejemplo 2001:db8::20.",
  },
  {
    terms: ["ip publica", "ip privada"],
    answer:
      "Las IPv4 privadas son 10.0.0.0/8, 172.16.0.0/12 y 192.168.0.0/16. Se usan dentro de redes locales y normalmente salen a Internet mediante NAT. Una IP pública es enrutable en Internet.",
  },
  {
    terms: ["mascara", "subred", "cidr"],
    answer:
      "La máscara separa la parte de red y la parte de host. 255.255.255.0 equivale a /24 y permite 254 hosts utilizables en una subred IPv4 convencional. CIDR expresa el número de bits de red.",
  },
  {
    terms: ["puerta de enlace", "gateway"],
    answer:
      "La puerta de enlace predeterminada suele ser el router al que se envía el tráfico destinado a otras redes. Si falta o es incorrecta, el equipo puede comunicarse localmente pero no salir de su subred.",
  },
  {
    terms: ["nat", "pat"],
    answer:
      "NAT traduce direcciones entre redes. PAT permite que muchos equipos privados compartan una IP pública diferenciando conexiones mediante puertos. Es habitual en routers domésticos y empresariales.",
  },
  {
    terms: ["vlan", "trunk", "etiquetado"],
    answer:
      "Una VLAN separa lógicamente dominios de broadcast dentro de switches. Los puertos access pertenecen normalmente a una VLAN; un enlace trunk transporta varias VLAN usando etiquetas 802.1Q.",
  },
  {
    terms: ["switch", "conmutador"],
    answer:
      "Un switch conecta equipos en una LAN y reenvía tramas según direcciones MAC. Aprende esas direcciones en su tabla CAM. Un switch gestionable puede ofrecer VLAN, STP, agregación y monitorización.",
  },
  {
    terms: ["router", "enrutador", "routing"],
    answer:
      "Un router comunica redes diferentes y decide el siguiente salto consultando su tabla de rutas. Puede usar rutas estáticas o protocolos dinámicos y suele proporcionar NAT, DHCP o filtrado.",
  },
  {
    terms: ["mac", "direccion fisica"],
    answer:
      "La dirección MAC identifica una interfaz en la capa de enlace. Los switches la utilizan para entregar tramas dentro de la LAN. Puede consultarse con «getmac», «ipconfig /all» o «ip link».",
  },
  {
    terms: ["arp"],
    answer:
      "ARP relaciona una dirección IPv4 con una dirección MAC dentro de la red local. «arp -a» muestra la caché. Una entrada incorrecta o un conflicto puede causar problemas de conectividad.",
  },
  {
    terms: ["tcp", "udp"],
    answer:
      "TCP es orientado a conexión, confirma entregas y controla el orden; se usa en web, SSH o correo. UDP prioriza rapidez y menor sobrecarga; se usa en DNS, voz, vídeo o juegos.",
  },
  {
    terms: ["puerto", "puertos de red"],
    answer:
      "Los puertos identifican servicios: 22 SSH, 53 DNS, 67/68 DHCP, 80 HTTP, 443 HTTPS, 3389 RDP y 445 SMB. Un puerto abierto no basta: también debe comprobarse el servicio y el firewall.",
  },
  {
    terms: ["modelo osi", "capas osi"],
    answer:
      "El modelo OSI tiene siete capas: física, enlace, red, transporte, sesión, presentación y aplicación. Ayuda a aislar fallos: cable en capa 1, MAC/VLAN en 2, IP/rutas en 3 y puertos en 4.",
  },
  {
    terms: ["ping"],
    answer:
      "Ping usa ICMP para comprobar alcance IP y latencia. Si responde la puerta de enlace pero no una IP externa, se revisan rutas o salida. Si responde una IP pero no un nombre, se investiga DNS.",
  },
  {
    terms: ["tracert", "traceroute"],
    answer:
      "Tracert o traceroute muestra los saltos que sigue el tráfico hasta un destino. Ayuda a localizar dónde se interrumpe o aumenta la latencia, aunque algunos routers no respondan a ICMP.",
  },
  {
    terms: ["ipconfig", "renew", "release"],
    answer:
      "«ipconfig /all» muestra la configuración completa. «/release» libera la concesión DHCP, «/renew» solicita otra y «/flushdns» limpia la caché DNS del cliente.",
  },
  {
    terms: ["nslookup", "dig"],
    answer:
      "Nslookup y dig consultan DNS. Permiten comprobar qué servidor responde, el tipo de registro, la IP obtenida y errores como NXDOMAIN o timeout.",
  },
  {
    terms: ["wifi", "wi fi", "inalambrica"],
    answer:
      "Para diagnosticar Wi‑Fi se revisan señal, interferencias, canal, banda de 2,4/5/6 GHz, autenticación, controlador y DHCP. 2,4 GHz llega más lejos; 5 GHz suele ofrecer mayor velocidad.",
  },
  {
    terms: ["cable ethernet", "rj45", "cable de red"],
    answer:
      "Ethernet de cobre suele usar conectores RJ45 y cable Cat5e, Cat6 o superior. Se comprueban LEDs, latiguillo, roseta, puerto del switch, negociación de velocidad y errores de interfaz.",
  },
  {
    terms: ["vpn", "wireguard"],
    answer:
      "Una VPN crea un túnel cifrado entre dispositivos o redes. WireGuard utiliza claves públicas y privadas, peers, endpoint y AllowedIPs. Hay que proteger la clave privada y limitar las rutas necesarias.",
  },
  {
    terms: ["firewall", "cortafuegos"],
    answer:
      "Un firewall permite o bloquea tráfico según origen, destino, protocolo, puerto y estado. El diagnóstico correcto identifica primero el flujo necesario y aplica la regla mínima, sin desactivarlo por completo.",
  },
  {
    terms: ["phishing", "correo sospechoso"],
    answer:
      "El phishing intenta robar credenciales o ejecutar malware. Señales: urgencia, dominio imitado, enlace extraño, petición inusual y adjunto inesperado. No se abre ni se responde: se reporta y se verifica por otro canal.",
  },
  {
    terms: ["malware", "virus", "ransomware"],
    answer:
      "Ante posible malware se aísla el equipo de la red, se preserva evidencia y se avisa al responsable. No se improvisa borrando archivos. En ransomware son esenciales segmentación, parches y copias 3-2-1 verificadas.",
  },
  {
    terms: ["contraseña", "password", "mfa", "doble factor"],
    answer:
      "Conviene usar contraseñas largas y únicas mediante un gestor, activar MFA y evitar reutilización. Si hay sospecha de robo: cambiarla desde un equipo seguro, cerrar sesiones y revisar métodos MFA.",
  },
  {
    terms: ["copia de seguridad", "backup", "regla 3 2 1"],
    answer:
      "La regla 3-2-1 recomienda tres copias, en dos soportes distintos y una fuera de la ubicación. Una copia solo es fiable si se supervisa y se realizan restauraciones de prueba.",
  },
  {
    terms: ["bitlocker", "cifrado"],
    answer:
      "BitLocker cifra unidades de Windows para proteger datos en caso de pérdida o robo. La clave de recuperación debe guardarse de forma segura y separada del dispositivo.",
  },
  {
    terms: ["active directory", "directorio activo", "dominio windows"],
    answer:
      "Active Directory centraliza usuarios, equipos, grupos, autenticación y políticas en un dominio Windows. Depende especialmente de DNS y de una hora correctamente sincronizada.",
  },
  {
    terms: ["gpo", "politica de grupo"],
    answer:
      "Las GPO aplican configuraciones a usuarios y equipos de Active Directory. Se vinculan a sitios, dominios u OU y se diagnostican con gpupdate, gpresult y la comprobación de permisos y filtrado.",
  },
  {
    terms: ["permisos ntfs", "permisos", "compartida", "carpeta compartida"],
    answer:
      "En una carpeta compartida se combinan permisos de recurso compartido y NTFS; por red prevalece el resultado más restrictivo. Es mejor asignar permisos a grupos y respetar el mínimo privilegio.",
  },
  {
    terms: ["windows update", "actualizaciones", "parches"],
    answer:
      "Las actualizaciones corrigen fallos y vulnerabilidades. En empresa deben probarse, desplegarse por fases, tener ventana de mantenimiento y contar con copia o plan de reversión.",
  },
  {
    terms: ["pantallazo azul", "bsod"],
    answer:
      "Un BSOD requiere anotar el código, revisar cambios recientes, controladores, temperaturas, RAM y almacenamiento. Los minidumps y el Visor de eventos ayudan a identificar la causa.",
  },
  {
    terms: ["equipo lento", "ordenador lento", "va lento"],
    answer:
      "Para un equipo lento se mide antes de actuar: CPU, RAM, disco, procesos de inicio, espacio libre, temperaturas, eventos y malware. El cuello de botella determina la solución.",
  },
  {
    terms: ["ram", "memoria ram"],
    answer:
      "La RAM mantiene temporalmente datos en uso. Si se agota, el sistema pagina a disco y se vuelve lento. Se revisa consumo por proceso y se prueba la memoria si hay errores o bloqueos.",
  },
  {
    terms: ["ssd", "disco duro", "smart", "almacenamiento"],
    answer:
      "Un SSD ofrece menor latencia que un HDD. Para valorar salud se revisan SMART, errores, temperatura y espacio libre. Si hay indicios de fallo, se prioriza la copia de datos antes de pruebas intensivas.",
  },
  {
    terms: ["bios", "uefi", "secure boot"],
    answer:
      "UEFI sustituye a la BIOS tradicional, inicia el hardware y carga el sistema operativo. Secure Boot valida componentes de arranque firmados para reducir manipulaciones.",
  },
  {
    terms: ["linux", "systemctl", "journalctl"],
    answer:
      "En Linux, «systemctl status servicio» consulta un servicio y «journalctl -u servicio» revisa sus registros. También se comprueban IP con «ip a», rutas con «ip route» y puertos con «ss -tulpn».",
  },
  {
    terms: ["chmod", "chown", "permisos linux"],
    answer:
      "En Linux, chmod modifica permisos y chown cambia propietario o grupo. Los permisos básicos son lectura, escritura y ejecución para propietario, grupo y otros; debe aplicarse el mínimo necesario.",
  },
  {
    terms: ["virtualizacion", "maquina virtual", "hyper v", "virtualbox", "vmware"],
    answer:
      "La virtualización ejecuta varios sistemas aislados sobre un host mediante un hipervisor. Hay que dimensionar CPU, RAM y almacenamiento, evitar sobreasignación excesiva y proteger las copias.",
  },
  {
    terms: ["contenedor", "docker"],
    answer:
      "Un contenedor empaqueta aplicación y dependencias compartiendo el kernel del host. Es más ligero que una máquina virtual, pero requiere gestionar imágenes, redes, volúmenes, secretos y actualizaciones.",
  },
  {
    terms: ["raid"],
    answer:
      "RAID combina discos para rendimiento o tolerancia a fallos. RAID 1 replica, RAID 5 distribuye paridad y RAID 10 combina espejo y distribución. RAID no sustituye una copia de seguridad.",
  },
  {
    terms: ["ticket", "incidencia", "soporte tecnico"],
    answer:
      "Un buen ticket registra usuario, equipo, impacto, urgencia, síntomas, hora, cambios recientes, pruebas, evidencias y solución. Se prioriza por impacto y urgencia, manteniendo informado al usuario.",
  },
  {
    terms: ["diagnostico", "metodologia", "resolver problema"],
    answer:
      "Un diagnóstico sólido sigue un método: definir el síntoma, medir alcance e impacto, recopilar evidencias, revisar cambios, formular hipótesis, probar de forma segura, verificar la solución y documentar.",
  },
  {
    terms: ["Angelín", "Angelin Espinoza", "quien es angelin"],
    answer:
      "Angelin Espinoza es técnica de Sistemas Microinformáticos y Redes orientada a soporte IT, administración de sistemas, redes, virtualización y seguridad básica. Este proyecto demuestra su forma de diagnosticar, priorizar y comunicar soluciones.",
  },
];

const getTechnicalAnswer = (question: string): string | null => {
  const normalized = normalizeQuestion(question).replace(/[^a-z0-9\s]/g, " ");
  const haystack = ` ${normalized.replace(/\s+/g, " ").trim()} `;
  const topic = TECH_KNOWLEDGE.map((entry) => ({
    entry,
    position: Math.min(
      ...entry.terms
        .map((term) => haystack.indexOf(` ${normalizeQuestion(term)} `))
        .filter((position) => position >= 0),
    ),
  }))
    .filter(({ position }) => Number.isFinite(position))
    .sort((a, b) => a.position - b.position)[0]?.entry;
  return topic?.answer ?? null;
};

export default function Home() {
  const [activeMissions, setActiveMissions] = useState(() => QUESTION_BANK.slice(0, 50));
  const [screen, setScreen] = useState<Screen>("intro");
  const [missionIndex, setMissionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [selected, setSelected] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState<boolean[]>([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [nexaQuestion, setNexaQuestion] = useState("");
  const [speedTestRunning, setSpeedTestRunning] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
    {
      role: "nexa",
      text: "Hola, soy NEXA. Puedo orientarte con el diagnóstico sin resolver el reto por ti.",
    },
  ]);

  const mission = activeMissions[missionIndex];
  const correctSelected =
    selected !== null && mission.options[selected]?.correct === true;
  const progress = useMemo(
    () => ((missionIndex + (correctSelected ? 1 : 0)) / activeMissions.length) * 100,
    [missionIndex, correctSelected, activeMissions.length],
  );

  useEffect(() => {
    if (screen !== "game") return;
    if (timeLeft <= 0) {
      setScreen("result");
      return;
    }
    const timer = window.setInterval(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [screen, timeLeft]);

  const startGame = () => {
    setActiveMissions([...QUESTION_BANK].sort(() => Math.random() - 0.5).slice(0, 50));
    setScreen("game");
    setMissionIndex(0);
    setScore(0);
    setTimeLeft(1800);
    setSelected(null);
    setAttempts(0);
    setSolved([]);
  };

  const chooseOption = (index: number) => {
    if (correctSelected) return;
    setSelected(index);
    setAttempts((value) => value + 1);
    if (mission.options[index].correct) {
      const earned = attempts === 0 ? 130 : attempts === 1 ? 105 : 85;
      setScore((value) => value + earned);
      setSolved((value) => [...value, true]);
    } else {
      setScore((value) => Math.max(0, value - 15));
    }
  };

  const nextMission = () => {
    if (missionIndex === activeMissions.length - 1) {
      setScore((value) => value + Math.floor(timeLeft / 10));
      setScreen("result");
      return;
    }
    setMissionIndex((value) => value + 1);
    setSelected(null);
    setAttempts(0);
  };

  const askNexa = (question: string) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;

    const lower = normalizeQuestion(cleanQuestion);
    const technicalAnswer = getTechnicalAnswer(cleanQuestion);
    let answer =
      technicalAnswer ??
      (screen === "intro"
        ? "Puedo responder sobre redes, Windows, Linux, hardware, seguridad, copias de seguridad, virtualización y diagnóstico. También puedo explicar quién creó este proyecto y cómo está desarrollado. Prueba una pregunta técnica concreta."
        : screen === "result"
          ? "Tu resultado demuestra criterio técnico, gestión del riesgo y capacidad para explicar decisiones: competencias muy valiosas en soporte IT."
          : `Observa esta señal: ${mission.hint} Relaciónala con el síntoma antes de elegir una acción.`);

    if (!technicalAnswer && lower.includes("comando")) {
      answer =
        screen === "game"
          ? `El terminal muestra evidencias, no datos de tu dispositivo. En esta misión, compara el resultado con el servicio que puede estar fallando.`
          : "Los comandos del reto son simulados y sirven para practicar un proceso de diagnóstico seguro.";
    } else if (!technicalAnswer && (lower.includes("pista") || lower.includes("ayuda"))) {
      answer =
        screen === "game"
          ? `Pista NEXA: ${mission.hint} Descarta primero las acciones que aumenten el riesgo o no expliquen todos los síntomas.`
          : "Pulsa «Iniciar guardia». Cada partida selecciona 50 incidencias de un banco de 500 casos de redes, sistemas, hardware, soporte y seguridad.";
    } else if (!technicalAnswer && (lower.includes("seguro") || lower.includes("datos"))) {
      answer =
        "Sí. Es una simulación local: no analiza tu móvil, tu ordenador ni tu Wi‑Fi, y esta ayuda no envía tus mensajes a ningún servicio externo.";
    }

    setAssistantMessages((messages) => [
      ...messages,
      { role: "user", text: cleanQuestion },
      { role: "nexa", text: answer },
    ]);
    setNexaQuestion("");
  };

  const runSpeedTest = async () => {
    if (speedTestRunning) return;
    setSpeedTestRunning(true);
    setAssistantMessages((messages) => [
      ...messages,
      { role: "user", text: "Ejecutar test de conexión" },
      { role: "nexa", text: "Comprobando conexión y tiempo de respuesta…" },
    ]);

    let answer = "";
    try {
      if (!navigator.onLine) {
        answer =
          "El navegador indica que el dispositivo está sin conexión. Revisa Wi‑Fi o cable, confirma que tienes una IP válida y prueba la puerta de enlace.";
      } else {
        const samples: number[] = [];
        for (let sample = 0; sample < 3; sample += 1) {
          const startedAt = performance.now();
          const response = await fetch(
            `${window.location.pathname}?nexa-test=${Date.now()}-${sample}`,
            { cache: "no-store" },
          );
          if (!response.ok) throw new Error("network-check-failed");
          samples.push(performance.now() - startedAt);
        }

        const averageLatency = Math.round(
          samples.reduce((total, value) => total + value, 0) / samples.length,
        );
        const networkInformation = (
          navigator as Navigator & {
            connection?: { downlink?: number; effectiveType?: string; rtt?: number };
          }
        ).connection;
        const reportedLatency = networkInformation?.rtt ?? averageLatency;
        const speed =
          typeof networkInformation?.downlink === "number"
            ? `${networkInformation.downlink} Mbps estimados`
            : "no disponible en este navegador";
        const quality =
          reportedLatency < 80 ? "buena" : reportedLatency < 180 ? "aceptable" : "mejorable";

        answer = `Conexión activa. Tiempo de respuesta aproximado: ${reportedLatency} ms (${quality}). Velocidad indicada por el navegador: ${speed}. Es una comprobación orientativa sobre esta misma página, no una medición certificada; para diagnosticar lentitud compara también por cable, Wi‑Fi, distancia y varios momentos del día.`;
      }
    } catch {
      answer =
        "No he podido completar la prueba. Puede haber pérdida de conexión, bloqueo temporal o un problema con el sitio. Comprueba primero la puerta de enlace y después una IP externa.";
    } finally {
      setAssistantMessages((messages) => [
        ...messages,
        { role: "nexa", text: answer },
      ]);
      setSpeedTestRunning(false);
    }
  };

  const rank =
    score >= 5500
      ? "Diagnóstico sobresaliente"
      : score >= 4000
        ? "Técnica resolutiva"
        : "Buena base de soporte IT";
  const latestNexaResponse =
    [...assistantMessages].reverse().find((message) => message.role === "nexa")?.text ??
    "Analiza primero las evidencias y descarta las acciones inseguras.";

  return (
    <main>
      <div
        className="ai-background"
        style={{ backgroundImage: "url('./ai-network-bg.jpg')" }}
        aria-hidden="true"
      />
      <div className="motion-field" aria-hidden="true">
        {Array.from({ length: 14 }, (_, index) => (
          <i key={index} style={{ "--particle": index } as CSSProperties} />
        ))}
      </div>
      <div className="global-scan" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="#" aria-label="SOS Oficina, inicio">
          <span className="brand-mark">S</span>
          <span>
            <strong>SOS OFICINA</strong>
            <small>IT INCIDENT RESPONSE</small>
          </span>
        </a>
        <div className="top-status">
          <span className="live-dot" />
          SIMULACIÓN EN DIRECTO
        </div>
        <div className="signature">ANGELIN ESPINOZA · IT</div>
      </header>

      {screen === "intro" && (
        <section className="intro screen">
          <div className="grid-glow" />
          <div className="signal-orb signal-orb-one" />
          <div className="signal-orb signal-orb-two" />
          <div className="intro-copy">
            <div className="command-label">
              <span className="command-icon">⌁</span>
              CENTRO DE RESPUESTA IT · TURNO 09:00
            </div>
            <div className="eyebrow">
              <span>PROTOCOLO 09:00</span>
              <span className="eyebrow-line" />
              <span>500 CASOS · 50 POR GUARDIA</span>
            </div>
            <h1>
              50 INCIDENCIAS.
              <br />
              UNA <em>GUARDIA.</em>
            </h1>
            <p className="lead">
              La red está caída. La intranet no responde. Un correo sospechoso
              acaba de llegar a Dirección.
            </p>
            <p className="mission-copy">
              Tu misión: diagnosticar, priorizar y recuperar los servicios antes
              de que empiece la jornada.
            </p>
            <div className="challenge-pills" aria-label="Competencias del reto">
              <span><i /> REDES</span>
              <span><i /> SISTEMAS</span>
              <span><i /> SEGURIDAD</span>
            </div>
            <button className="primary-button" onClick={startGame}>
              <span>INICIAR GUARDIA</span>
              <span aria-hidden="true">→</span>
            </button>
            <div className="intro-note">
              <span>◈</span>
              <p>
                Basado en situaciones reales de soporte IT, redes y seguridad.
                <strong> 500 casos disponibles · 30 minutos por guardia.</strong>
              </p>
            </div>
          </div>

          <aside className="ops-card" aria-label="Estado del sistema">
            <div className="corner-code">SYS//A-09</div>
            <div className="ops-head">
              <div>
                <small>ESTADO GENERAL</small>
                <strong>OPERACIONES</strong>
              </div>
              <span className="pulse">ALERTA</span>
            </div>
            <div className="network-map">
              <span className="data-packet packet-1" />
              <span className="data-packet packet-2" />
              <span className="data-packet packet-3" />
              <span className="data-packet packet-4" />
              <span className="node node-a">PC</span>
              <span className="node node-b">DNS</span>
              <span className="node node-c">VPN</span>
              <span className="node node-d">SRV</span>
              <span className="node main-node">HQ</span>
              <i className="line line-1" />
              <i className="line line-2" />
              <i className="line line-3" />
              <i className="line line-4" />
            </div>
            <div className="metrics">
              <div><span>RED</span><strong className="danger">DEGRADADA</strong></div>
              <div><span>SERVICIOS</span><strong>4 / 5</strong></div>
              <div><span>SEGURIDAD</span><strong className="warning">1 ALERTA</strong></div>
            </div>
            <div className="ticket-strip">
              <span>INCIDENCIAS EN ESTA GUARDIA</span>
              <strong>50</strong>
            </div>
          </aside>
          <div className="status-ticker" aria-hidden="true">
            <div className="ticker-track">
              <span>● DHCP SIN RESPUESTA</span>
              <span>◆ DNS: NXDOMAIN</span>
              <span>▲ ALERTA DE PHISHING</span>
              <span>● 50 TICKETS ABIERTOS</span>
              <span>● DHCP SIN RESPUESTA</span>
              <span>◆ DNS: NXDOMAIN</span>
              <span>▲ ALERTA DE PHISHING</span>
              <span>● 50 TICKETS ABIERTOS</span>
            </div>
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className="game screen">
          <div className="simulation-banner" role="note">
            <span className="simulation-badge">ENTORNO DE SIMULACIÓN</span>
            <span>Todos los equipos, direcciones IP y mensajes son ficticios.</span>
            <strong>NO SE ANALIZA TU DISPOSITIVO NI TU RED</strong>
          </div>
          <div className="game-head">
            <div className="progress-block">
              <div>
                <span>MISIÓN {missionIndex + 1} / {activeMissions.length}</span>
                <span>{Math.round(progress)}% COMPLETADO</span>
              </div>
              <div className="progress-track">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="game-stat">
              <small>TIEMPO RESTANTE</small>
              <strong className={timeLeft < 60 ? "danger" : ""}>
                {formatTime(timeLeft)}
              </strong>
            </div>
            <div className="game-stat">
              <small>PUNTUACIÓN</small>
              <strong>{score.toString().padStart(3, "0")}</strong>
            </div>
          </div>

          <div className="mission-layout">
            <article className="incident-card">
              <div className="incident-meta">
                <span>{mission.number}</span>
                <span>{mission.category}</span>
                <span className="severity">{mission.severity}</span>
              </div>
              <h2>{mission.title}</h2>
              <div className="user-report">
                <div className="avatar">{mission.user.charAt(0)}</div>
                <div>
                  <strong>{mission.user}</strong>
                  <small>{mission.device}</small>
                  <p>“{mission.report}”</p>
                </div>
              </div>
              <div className="terminal">
                <div className="terminal-head">
                  <div><i /><i /><i /></div>
                  <span>SIMULACIÓN · DIAGNÓSTICO · TERMINAL</span>
                  <span>● ENTORNO SEGURO</span>
                </div>
                <pre>{mission.terminal.join("\n")}</pre>
              </div>
              <div className="hint">
                <span>?</span>
                <p><strong>PISTA TÉCNICA</strong>{mission.hint}</p>
              </div>
            </article>

            <aside className="decision-panel">
              <div className="decision-title">
                <span>PASO {missionIndex + 1}</span>
                <h3>¿Cuál es tu siguiente acción?</h3>
                <p>Elige la intervención más segura y eficiente.</p>
              </div>
              <div className="options">
                {mission.options.map((option, index) => {
                  const state =
                    selected === index
                      ? option.correct
                        ? "correct"
                        : "incorrect"
                      : "";
                  return (
                    <button
                      className={`option ${state}`}
                      key={option.label}
                      onClick={() => chooseOption(index)}
                      disabled={correctSelected}
                    >
                      <span className="option-key">{String.fromCharCode(65 + index)}</span>
                      <span>{option.label}</span>
                      <span className="option-arrow">→</span>
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <div className={`feedback ${correctSelected ? "success" : "error"}`}>
                  <strong>{correctSelected ? "✓ DECISIÓN CORRECTA" : "× REVISA EL DIAGNÓSTICO"}</strong>
                  <p>{mission.options[selected].feedback}</p>
                </div>
              )}

              {correctSelected && (
                <div className="resolution">
                  <small>SECUENCIA RECOMENDADA</small>
                  <code>{mission.command}</code>
                  <p>{mission.explanation}</p>
                  <button className="next-button" onClick={nextMission}>
                    {missionIndex === activeMissions.length - 1
                      ? "VER RESULTADO"
                      : "SIGUIENTE INCIDENCIA"} <span>→</span>
                  </button>
                </div>
              )}
            </aside>
          </div>
        </section>
      )}

      {screen === "result" && (
        <section className="result screen">
          <div className="result-card">
            <div className="result-label">INFORME DE GUARDIA · COMPLETADO</div>
            <div className="score-ring">
              <div>
                <strong>{score}</strong>
                <span>PUNTOS</span>
              </div>
            </div>
            <p className="rank">{rank}</p>
            <h1>OFICINA OPERATIVA.</h1>
            <p className="result-lead">
              Has demostrado criterio para analizar síntomas, evitar acciones
              peligrosas y resolver incidencias con un método profesional.
            </p>
            <div className="result-metrics">
              <div><strong>{solved.length}/{activeMissions.length}</strong><span>RESUELTAS</span></div>
              <div><strong>{formatTime(1800 - timeLeft)}</strong><span>TIEMPO</span></div>
              <div><strong>{Math.max(0, score - Math.floor(timeLeft / 10))}</strong><span>PRECISIÓN</span></div>
            </div>
          </div>

          <aside className="creator-card">
            <span className="available"><i /> DISPONIBLE PARA NUEVOS RETOS</span>
            <small>ESTE RETO HA SIDO CREADO POR</small>
            <h2>Angelin Espinoza</h2>
            <h3>Sistemas Microinformáticos · Redes · Soporte IT</h3>
            <p>
              Convierto problemas técnicos en soluciones claras, seguras y
              documentadas. Busco una oportunidad para aportar iniciativa,
              capacidad de diagnóstico y ganas de seguir creciendo en IT.
            </p>
            <div className="skills">
              <span>LINUX</span><span>WINDOWS</span><span>REDES</span>
              <span>SOPORTE IT</span><span>SEGURIDAD</span>
            </div>
            <button className="profile-button" onClick={() => alert("Enlace de LinkedIn pendiente de añadir")}>
              CONOCER MI PERFIL <span>↗</span>
            </button>
            <button className="replay-button" onClick={startGame}>↻ VOLVER A JUGAR</button>
            <p className="pending-note">Próximamente: LinkedIn, GitHub y CV</p>
          </aside>
        </section>
      )}

      <aside className={`nexa ${assistantOpen ? "nexa-open" : ""}`}>
        {assistantOpen && (
          <div className="nexa-panel" role="dialog" aria-label="Asistente técnico NEXA">
            <div className="nexa-head">
              <div className="nexa-avatar">N</div>
              <div>
                <strong>NEXA 2.0</strong>
                <small><i /> ASISTENTE TÉCNICO · EN LÍNEA</small>
              </div>
              <button onClick={() => setAssistantOpen(false)} aria-label="Cerrar asistente">×</button>
            </div>
            <div className="nexa-context">
              <span>CONTEXTO ACTUAL</span>
              <strong>
                {screen === "intro"
                  ? "CENTRO DE RESPUESTA"
                  : screen === "result"
                    ? "INFORME FINAL"
                    : `${mission.number} · ${mission.category}`}
              </strong>
            </div>
            <div className="nexa-response" aria-live="polite">
              <span>NEXA · RESPUESTA</span>
              <p>{latestNexaResponse}</p>
            </div>
            <div className="nexa-actions">
              <button onClick={() => askNexa("Dame una pista")}>DAME UNA PISTA</button>
              <button onClick={() => askNexa("¿Es seguro y qué datos usa?")}>¿ES SEGURO?</button>
              <button onClick={runSpeedTest} disabled={speedTestRunning}>
                {speedTestRunning ? "PROBANDO…" : "TEST DE RED"}
              </button>
            </div>
            <form
              className="nexa2-compose"
              onSubmit={(event) => {
                event.preventDefault();
                askNexa(nexaQuestion);
              }}
            >
              <label htmlFor="nexa-question">ESCRIBE TU PREGUNTA</label>
              <div>
                <input
                  id="nexa-question"
                  value={nexaQuestion}
                  onChange={(event) => setNexaQuestion(event.target.value)}
                  placeholder="Ejemplo: ¿qué significa APIPA?"
                  autoComplete="off"
                />
                <button type="submit" disabled={!nexaQuestion.trim()}>
                  ENVIAR <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
            <small className="nexa-privacy">
              TUS PREGUNTAS NO SE ENVÍAN · TEST ORIENTATIVO
            </small>
          </div>
        )}
        <button
          className="nexa-launcher"
          onClick={() => setAssistantOpen((value) => !value)}
          aria-expanded={assistantOpen}
          aria-label={assistantOpen ? "Cerrar asistente NEXA" : "Abrir asistente NEXA"}
        >
          <span className="nexa-core">N</span>
          <span><strong>¿NECESITAS APOYO?</strong><small>PREGUNTA A NEXA</small></span>
          <i />
        </button>
      </aside>

      <footer>
        <span>© 2026 ANGELIN ESPINOZA</span>
        <span>HECHO CON CURIOSIDAD, MÉTODO Y CAFÉ ☕</span>
      </footer>
    </main>
  );
}
