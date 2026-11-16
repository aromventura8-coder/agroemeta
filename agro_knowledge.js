Reemplazando lineas 775..790 (16 lineas)
/**
 * AGROEMETA - Base de Conocimiento Experto & Motor Cognitivo AGI
 * Especialidad: Agronomía de Precisión, Mecánica y Maquinaria Agrícola, Diagnóstico Inteligente.
 */

const AGRO_KNOWLEDGE_BASE = {
  // ==========================================
  // AGRONOMÍA INTEGRAL
  // ==========================================
  agronomia: {
    suelos: {
      titulo: "Análisis y Manejo de Suelos (Edafología)",
      conceptos: [
        {
          clave: "ph",
          nombre: "Potencial de Hidrógeno (pH del Suelo)",
          optimo: "6.0 a 6.8 para la mayoría de cultivos agrícolas",
          diagnostico: "pH < 5.5 provoca toxicidad por Aluminio (Al3+) y Manganeso (Mn), e inmoviliza Fósforo (P) y Magnesio (Mg). pH > 7.5 genera precipitación de Fósforo con Calcio y bloquea micronutrientes (Hierro, Zinc, Manganeso).",
          solucion: "En suelos ácidos: Aplicación de cal agrícola (Carbonato de Calcio CaCO3 o Cal Dolomítica CaMg(CO3)2) según capacidad de intercambio catiónico (CIC). En suelos alcalinos/sódicos: Aplicación de Yeso agrícola (CaSO4·2H2O) y azufre elemental con lavados controlados."
        },
        {
          clave: "cic",
          nombre: "Capacidad de Intercambio Catiónico (CIC)",
          detalle: "Mide la reserva de fertilidad del suelo y su capacidad de retener cationes (Ca2+, Mg2+, K+, Na+, NH4+). Suelos arenosos: CIC baja (<10 meq/100g, riesgo de lixiviación); suelos arcillosos/francos: CIC alta (>20 meq/100g, excelente retención).",
          manejo: "Fraccionar aplicaciones de fertilizantes nitrogenados y potásicos en suelos con CIC baja para evitar pérdidas por lavado."
        },
        {
          clave: "materia_organica",
          nombre: "Materia Orgánica y Estructura",
          optimo: "3% a 5% en horizonte superficial",
          beneficios: "Mejora infiltración hídrica, retención de humedad, reduce compactación y promueve la microbiota beneficiosa (micorrizas y bacterias fijadoras).",
          practicas: "Siembra directa sin labranza, rotación de cultivos con gramíneas de alta relación C/N (maíz, sorgo, avena) y cultivos de servicio o cobertura (vicia, centeno)."
        }
      ]
    },
    nutricion: {
      titulo: "Nutrición Vegetal y Fertilización (NPK + Microelementos)",
      elementos: [
        {
          elemento: "Nitrógeno (N)",
          rol: "Componente clave de aminoácidos, proteínas y clorofila; motor del crecimiento vegetativo.",
          deficiencia: "Clorosis generalizada que inicia en hojas basales (viejas) debido a su alta movilidad dentro de la planta, tallos delgados y bajo macollamiento.",
          fuentes: "Urea (46-0-0), Nitrato de Amonio (33.5% N), UAN (32% líquido), Sulfato de Amonio (21% N + 24% S)."
        },
        {
          elemento: "Fósforo (P)",
          rol: "Transferencia de energía (ATP), desarrollo radicular inicial, floración y cuajado de frutos.",
          deficiencia: "Pigmentación púrpura/violácea en hojas viejas y envés por acumulación de antocianinas; raíces atrofiadas y retraso en maduración.",
          fuentes: "Fosfato Monoamónico (MAP 11-52-0), Fosfato Diamónico (DAP 18-46-0), Superfosfato Triple (SPT 0-46-0)."
        },
        {
          elemento: "Potasio (K)",
          rol: "Regulación osmótica y apertura/cierre de estomas, resistencia a estrés hídrico, síntesis de azúcares y llenado de granos/frutos.",
          deficiencia: "Clorosis y posterior necrosis marginal o quemado en los bordes de las hojas más viejas.",
          fuentes: "Cloruro de Potasio (KCl 0-0-60), Sulfato de Potasio (K2SO4 0-0-50 + 18% S), Nitrato de Potasio."
        },
        {
          elemento: "Zinc (Zn), Boro (B), Magnesio (Mg), Azufre (S)",
          detalles: "El Azufre es esencial para aminoácidos azufrados (metionina, cisteína); el Boro para la viabilidad del polen y división celular; el Zinc para síntesis de auxinas (entrenudos cortos si falta Zn); el Magnesio es el átomo central de la molécula de clorofila."
        }
      ]
    },
    cultivos: [
      {
        nombre: "Maíz (Zea mays)",
        densidad: "65,000 a 85,000 plantas/ha según potencial hídrico y grupo de madurez",
        profundidad: "4 a 6 cm en suelo bien preparado y humedad adecuada",
        etapas_criticas: "V6-V8 (definición de número de hileras por espiga) y VT-R1 (floración/polinización y cuajado; estrés hídrico aquí reduce drásticamente el rendimiento).",
        plagas_clave: "Oruga cogollera (Spodoptera frugiperda), Diatraea saccharalis, Gusano cortador.",
        fertilizacion_sugerida: "140-220 kg N/ha (fraccionado: siembra + V4/V6), 40-70 kg P2O5/ha a la siembra, 30-50 kg K2O/ha según análisis."
      },
      {
        nombre: "Soja / Soya (Glycine max)",
        densidad: "280,000 a 380,000 plantas/ha según hábito de crecimiento (determinado/indeterminado)",
        inoculacion: "Inoculación obligatoria con Bradyrhizobium japonicum para fijación biológica de nitrógeno (aporta >70% del N requerido).",
        etapas_criticas: "R3 a R5.5 (inicio de formación de vainas hasta llenado de grano; determinante en número y peso de semillas).",
        plagas_clave: "Chinches (Nezara viridula, Piezodorus guildinii), Oruga medidora (Rachiplusia nu), Oruga bolillera (Helicoverpa gelotopoeon).",
        enfermedades: "Roya asiática (Phakopsora pachyrhizi), Mancha ojo de rana (Cercospora sojina), Muerte súbita (Fusarium virguliforme)."
      },
      {
        nombre: "Trigo (Triticum aestivum)",
        densidad: "250 a 350 plantas logradas/m2 (aprox. 100-140 kg/ha según PMG de semilla)",
        etapas_criticas: "Macollamiento (Zadoks 21-29), encañazón y espigazón (Zadoks 50-60). Sensible a estrés térmico durante llenado de grano.",
        fertilizacion: "Nitrógeno en dosificación acorde a objetivo de rendimiento y proteína (mínimo 11% proteína para calidad panadera)."
      },
      {
        nombre: "Hortalizas y Frutales (Tomate, Papa, Cítricos, Vid)",
        detalles: "El tomate requiere control preciso de calcio foliar/radicular para prevenir pudrición apical (Blossom End Rot). La papa requiere control estricto de Tizón tardío (Phytophthora infestans) y alto potasio para calidad de tubérculo."
      }
    ],
    fitopatologia_y_plagas: [
      {
        plaga: "Oruga Cogollera (Spodoptera frugiperda)",
        cultivos: "Maíz, Sorgo, Pasturas",
        sintomas: "Comeduras en cogollo con excrementos tipo aserrín húmedo, perforación de hojas.",
        control: "Monitoreo en V2-V6. Umbral: 15-20% de plantas con daño grado 3 en escala Davis. Control biológico: Trichogramma, Bacillus thuringiensis. Químico: Diamidas antranílicas (Clorantraniliprole), Spinetoram o Lufenuron."
      },
      {
        plaga: "Chinches fitófagas (Nezara viridula, Euschistus heros)",
        cultivos: "Soja, Leguminosas",
        sintomas: "Picaduras en vainas, aborto de flores, retención foliar anormal en madurez, grano manchado y pérdida de poder germinativo.",
        umbral: "0.5 a 1 chinche por metro lineal en producción de semilla; 1.5 a 2 chinches/m en grano comercial durante R3-R6."
      },
      {
        enfermedad: "Roya Asiática de la Soja (Phakopsora pachyrhizi)",
        sintomas: "Pústulas marrón-rojizas en el envés de las hojas inferiores que avanzan rápidamente hacia el estrato superior, defoliación prematura.",
        estrategia: "Aplicación preventiva con mezcla de Triazol + Estrobirulina + Carboxamida (triple mezcla) antes del cierre de entrenudos o ante la primera alerta zonal."
      },
      {
        enfermedad: "Tizón Tardío de la Papa y Tomate (Phytophthora infestans)",
        sintomas: "Manchas necróticas de aspecto húmedo en hojas y tallos, eflorescencia algodonosa blanca en el envés bajo alta humedad relativa (>90%) y 15-20°C.",
        control: "Fungicidas preventivos (Mancozeb, Clorotalonil) y curativos/sistémicos (Metalaxil, Dimetomorf, Cimoxanilo)."
      }
    ],
    riego_y_clima: {
      conceptos: "Cálculo de Evapotranspiración del Cultivo: ETc = ETo * Kc. La lámina neta de riego (Ln) = (Capacidad de Campo - Punto de Marchitez Permanente) * Profundidad radicular * Densidad aparente * Fracción de agotamiento permisible (f aprox. 0.4 - 0.5). Monitoreo con tensiómetros o sondas de capacitancia."
    }
  },

  // ==========================================
  // MECÁNICA AGRÍCOLA Y MAQUINARIA PESADA
  // ==========================================
  mecanica: {
    motores_diesel: {
      titulo: "Motores Diésel Agrícolas de Alta Eficiencia",
      sistemas: [
        {
          sistema: "Sistema Common Rail (Inyección de Riel Común)",
          presion: "1,600 a 2,500 bar generada por bomba de alta presión (Bosch CP3/CP4, Denso).",
          componentes: "Inyectores piezoeléctricos o solenoide con múltiples pre y post-inyecciones por ciclo, sensor de presión de riel (RPS), válvula reguladora de presión (PCV).",
          fallas_comunes: "Dificultad de arranque en caliente: exceso de fuga de retorno por inyectores desgastados que impide alcanzar la presión mínima de arranque (aprox. 250-300 bar). Falta de potencia bajo carga: filtro de combustible saturado o válvula dosificadora pegada."
        },
        {
          sistema: "Turbocompresor e Intercooler",
          funcion: "Presuriza el aire de admisión aumentando la densidad de oxígeno para una combustión completa.",
          sintomas_falla: "Silbido agudo anormal (fuga en mangueras de intercooler o rozamiento de álabes), juego axial/radial excesivo en eje de turbina, humo negro al acelerar por falta de aire o válvula wastegate / geometría variable (VGT) atascada."
        },
        {
          sistema: "Post-Tratamiento de Gases (Tier 4 Final / Stage V)",
          componentes: "DOC (Catalizador de Oxidación Diésel), DPF (Filtro de Partículas Diésel), SCR (Reducción Catalítica Selectiva con AdBlue / DEF) y EGR.",
          problemas: "Colmatación de DPF por trabajar a bajas RPM constantes en tareas livianas sin alcanzar temperatura de regeneración activa (requiere >550°C). Cristalización de urea en inyector de DEF."
        }
      ],
      analisis_humos: [
        {
          color: "Humo Negro",
          causa: "Mezcla rica: exceso de combustible o deficiencia de aire.",
          verificar: "Filtro de aire obstruido, fuga en tuberías de admisión/intercooler, inyectores goteando o con toberas abiertas, turbo con baja presión de soplado."
        },
        {
          color: "Humo Blanco",
          causa: "Combustible sin quemar atomizado frío o vapor de agua en cámara de combustión.",
          verificar: "Punto de inyección atrasado, baja compresión en cilindros, bujías de precalentamiento defectuosas en frío. Si tiene olor dulzón y disminuye el nivel de refrigerante: junta de culata (tapa de cilindros) soplada o fisura en bloque."
        },
        {
          color: "Humo Azulado / Grisáceo",
          causa: "Aceite de motor quemándose en la cámara de combustión.",
          verificar: "Desgaste en retenes o guías de válvula, aros de pistón atascados/desgastados, o sello de aceite en el eje del turbocompresor con fuga hacia la admisión o escape."
        }
      ]
    },
    hidraulica: {
      titulo: "Sistemas Hidráulicos Agrícolas y Dirección",
      conceptos: [
        {
          tipo: "Circuito Centro Cerrado con Detección de Carga (Load Sensing - PFC)",
          descripcion: "Utiliza bomba de pistones axiales de caudal variable. La bomba solo entrega el caudal y presión exactos que demandan los actuadores más un margen de presión diferencial (stand-by pressure de 15 a 25 bar), maximizando la eficiencia de combustible.",
          presion_trabajo: "190 a 230 bar (2,750 a 3,350 PSI)."
        },
        {
          tipo: "Válvulas Distribuidoras Electrohidráulicas (SCV / Distribuidores)",
          descripcion: "Permiten control proporcional de caudal y tiempo mediante solenoides PWM gestionados por el ordenador de a bordo o joysticks en cabina."
        },
        {
          tipo: "Enganche Tripuntal y Control de Tiro (Draft Control)",
          descripcion: "Sensores de fuerza (pernos dinamométricos en brazos inferiores o barra de flexión) detectan el aumento de resistencia en el suelo al arar o subsolar y elevan milimétricamente el apero para evitar que el tractor patine o se cale el motor."
        },
        {
          falla: "Sobrecalentamiento y Cavitación del Aceite",
          sintomas: "Ruido de golpeteo metálico o 'arena en tuberías' dentro de la bomba, aceite emulsionado con espuma blanca, movimientos lentos y a tirones.",
          causa: "Filtro de succión tapado, manguera de aspiración colapsada o estrangulada, entrada de aire en la línea de succión, o nivel de fluido UTTO bajo."
        }
      ]
    },
    transmisiones: {
      titulo: "Transmisiones y Tren de Fuerza Agrícola",
      tipos: [
        {
          tipo: "PowerShift (Semi y Full PowerShift)",
          mecanica: "Permite cambiar de marchas bajo carga sin pisar el embrague ni interrumpir el flujo de potencia, utilizando paquetes de embragues multidisco bañados en aceite accionados por válvulas moduladoras proporcionales.",
          calibracion: "Requiere calibración periódica del tiempo de llenado y presión de los paquetes de embragues para evitar tirones o patinamiento al cambiar."
        },
        {
          tipo: "Transmisión Variable Continua (CVT / Vario)",
          mecanica: "Combina una rama mecánica de engranajes planetarios con una rama hidrostática (bomba y motor hidráulico de caudal variable). Permite aceleración suave de 0 a 50 km/h a RPM óptimas del motor diésel con mínimo consumo."
        },
        {
          tipo: "Toma de Fuerza (TDF / PTO)",
          especificacion: "Normalizada a 540 RPM a régimen de motor nominal (o 540E a régimen reducido económico aprox 1,550 RPM) y 1,000 RPM para implementos de alta demanda de torque (picadoras, trituradoras, rotoenfardadoras)."
        }
      ]
    },
    implementos_y_calibracion: {
      pulverizadoras: {
        formula: "Cálculo de Caudal por Boquilla: q (L/min) = (Q * v * d) / 60,000",
        donde: "Q = Volumen de aplicación (L/ha), v = Velocidad de avance (km/h), d = Distancia entre boquillas (cm).",
        ejemplo: "Para aplicar 80 L/ha a 15 km/h con picos a 50 cm: q = (80 * 15 * 50) / 60,000 = 1.0 L/min (corresponde a boquilla azul 03 a aprox 3 bar)."
      },
      sembradoras: {
        calculo: "Semillas por metro lineal = (Población objetivo pl/ha) / (10,000 / Distancia entre surcos en metros * % Logro esperado).",
        ajuste: "Verificar enrasadores en dosificadores neumáticos y depresión en turbina (típicamente 35 a 55 mbar según peso de mil semillas de maíz/soja)."
      },
      cosechadoras: {
        ajuste_trilla: "Regulación de luz de cóncavo y RPM de rotor/cilindro: muy apretado o altas RPM produce grano partido; muy abierto o bajas RPM deja grano en la espiga o vaina sin trillar.",
        perdidas_cola: "Ajuste de velocidad del ventilador de limpieza para que el tamiz flote la paja sin aventar granos al suelo."
      }
    },
    electricidad_y_isobus: {
      titulo: "Electrónica, Redes CAN Bus e ISOBUS (ISO 11783)",
      detalles: "La red CAN Bus del tractor opera a 250 kbps. Las líneas CAN High (2.5V a 3.5V) y CAN Low (2.5V a 1.5V) deben medir una resistencia total de terminación de 60 Ohms (dos resistencias de 120 Ohms en paralelo en cada extremo del bus). Un valor de 120 Ohms indica un terminador abierto o cable cortado; 0 Ohms indica cortocircuito."
    }
  },

  // ==========================================
  // PROTOCOLOS DE RAZONAMIENTO AGI
  // ==========================================
  diagnosticos_rapidos: [
    {
      palabras_clave: ["tractor no arranca", "no enciende", "motor no gira", "no da marcha"],
      respuesta: `[PROTOCOLO DE DIAGNÓSTICO: TRACTOR NO ENCIENDE]
1. VERIFICACIÓN ELÉCTRICA:
   - Voltaje en bornes de batería en reposo (mínimo 12.6V; si baja de 9.6V durante el arranque, la batería está descargada o comunicada).
   - Compruebe interruptores de seguridad de neutro en palanca de marchas, pedal de embrague y switch de la Toma de Fuerza (PTO).
2. CIRCUITO DE COMBUSTIBLE DIÉSEL:
   - ¿Llega combustible al filtro? Verifique bomba de cebado manual y presencia de aire en el circuito (purgue el tornillo de alivio en la base del filtro).
   - Compruebe la electroválvula de corte de combustible en la bomba o el relé de parada de motor.
   - En sistemas Common Rail: Se requiere un mínimo de 250 a 300 bar de presión en el riel para que la ECU autorice el disparo de inyectores. Compruebe el sensor RPS.
3. ADMISIÓN:
   - Verifique que la mariposa de estrangulamiento de aire no haya quedado trabada en posición cerrada.`
    },
    {
      palabras_clave: ["humo negro", "tira humo negro", "tractor humea negro", "humo oscuro"],
      respuesta: `[DIAGNÓSTICO TÉCNICO: HUMO NEGRO EN MOTOR DIÉSEL]
El humo negro indica una combustión incompleta con exceso de combustible en relación con la masa de aire (mezcla excesivamente rica).

PASOS DE RESOLUCIÓN INMEDIATA:
1. Filtro de Aire: Desmonte el elemento primario y verifique el indicador de restricción de vacío. Si está tupido de polvo o paja, reemplace inmediatamente.
2. Sistema de Sobrealimentación (Turbo):
   - Inspeccione las mangueras y abrazaderas entre el turbocompresor, el intercooler y el múltiple de admisión en busca de fisuras o desacoples.
   - Compruebe la presión de soplado (Boost Pressure) con manómetro o escáner.
3. Inyección de Combustible:
   - Inyectores goteando o con toberas desgastadas que no pulverizan en microgotas, provocando chorros de diésel crudo.
   - Compruebe si hay códigos de error relativos a la válvula reguladora de presión de combustible o sensor MAF/MAP.`
    },
    {
      palabras_clave: ["hidraulico no levanta", "brazos no suben", "falla hidraulica", "presion hidraulica", "ruido en bomba"],
      respuesta: `[DIAGNÓSTICO HIDRÁULICO: PÉRDIDA DE PRESIÓN / NO LEVANTA APERO]
1. Nivel y Calidad de Aceite:
   - Verifique la mirilla o varilla de aceite hidráulico/transmisión (UTTO). Si presenta color lechoso, hay contaminación por agua; si tiene espuma, hay entrada de aire.
2. Cavitación o Succión Restringida:
   - Un zumbido agudo o traqueteo en la bomba indica cavitación. Limpie o cambie el filtro de succión de la bomba inmediatamente.
3. Válvula de Alivio Principal (Cross-over Relief):
   - Si la válvula de alivio quedó atascada con viruta o resorte fatigado, el aceite recircula al tanque sin generar presión de trabajo (típicamente 190-210 bar).
4. Cilindros del Enganche Tripuntal:
   - Verifique si las empaquetaduras internas del pistón del cilindro elevador tienen fuga interna (by-pass). Pruebe desconectando la manguera de retorno con el apero levantado.`
    },
    {
      palabras_clave: ["cogollera", "spodoptera", "gusano en maiz"],
      respuesta: `[ALERTA AGRONÓMICA: CONTROL DE ORUGA COGOLLERA (Spodoptera frugiperda)]
1. Daño y Umbral:
   - El daño en V2 a V6 compromete el punto de crecimiento (ápice). Monitorear cogollos. Umbral de acción: 15% a 20% de plantas con hojas raspadas o perforadas (Grado 3 Davis).
2. Momento de Aplicación:
   - Realizar la pulverización a primera hora de la mañana o al atardecer, cuando la oruga sale del cogollo.
3. Calidad de Pulverización:
   - Presión media-alta con boquillas de cono hueco dirigidas a la línea del cultivo (gota mediana-fina) o uso de coadyuvante penetrante para llegar al fondo del embudo foliar.
4. Principios Activos Recomendados:
   - Diamidas (Clorantraniliprole, Flubendiamida) por su excelente persistencia y selectividad hacia benéficos.
   - Spinetoram o Emamectina benzoato para volteo rápido de orugas medianas.`
    },
    {
      palabras_clave: ["hojas amarillas", "clorosis", "deficiencia nitrogeno", "amarillamiento"],
      respuesta: `[ANÁLISIS NUTRICIONAL: AMARILLAMIENTO FOLIAR (CLOROSIS)]
Para diagnosticar la causa exacta, observe la posición de las hojas afectadas:

A) HOJAS VIEJAS (Basales, parte baja de la planta):
   - Nitrógeno (N): Clorosis uniforme que inicia en la punta en forma de 'V' invertida hacia la nervadura central (ej. en maíz) o amarillamiento parejo.
   - Magnesio (Mg): Clorosis intervenal (nervaduras verdes y el resto amarillo).
   - Potasio (K): Amarillamiento y quemado en los bordes marginales exteriores.

B) HOJAS JÓVENES (Brote nuevo, parte superior):
   - Hierro (Fe): Clorosis intervenal muy intensa en hojas nuevas (frecuente en suelos con pH alto o calcáreos).
   - Azufre (S): Clorosis generalizada en brotes nuevos semejante al nitrógeno, pero sin movilidad desde la base.
   - Zinc (Zn): Bandas cloróticas entre la nervadura y los bordes con entrenudos acortados.`
    }
  ]
};

// ==========================================
// MOTOR DE RESPUESTA Y RAZONAMIENTO AGI MAYORDOMO
// ==========================================
class AgroemetaCognitiveEngine {
  constructor() {
    this.history = []; // Historial de conversación
    this.activeDocument = null; // Documento activo cargado por el usuario
    this.customApiKey = localStorage.getItem("agroemeta_gemini_key") || localStorage.getItem("agroemeta_api_key") || "";
    this.provider = "gemini"; // Por defecto Gemini según solicitud
  }

  setApiKey(apiKey) {
    this.customApiKey = apiKey.trim();
    localStorage.setItem("agroemeta_gemini_key", this.customApiKey);
    localStorage.setItem("agroemeta_api_key", this.customApiKey);
  }

  hasApiKey() {
    return Boolean(this.customApiKey && this.customApiKey.length > 5);
  }

  // Asignar documento activo (PDF, imagen o texto)
  setActiveDocument(doc) {
    this.activeDocument = doc;
  }

  clearActiveDocument() {
    this.activeDocument = null;
  }

  // Búsqueda en la base de conocimiento agronómica y mecánica
  searchKnowledgeBase(query) {
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // 1. Revisar diagnósticos rápidos
    for (const diag of AGRO_KNOWLEDGE_BASE.diagnosticos_rapidos) {
      if (diag.palabras_clave.some(k => q.includes(k.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))) {
        return diag.respuesta;
      }
    }

    // 1.1 INTA y Organismos Agropecuarios
    if (q.includes("inta") || q.includes("instituto nacional de tecnologia agropecuaria")) {
      return `### INTA (Instituto Nacional de Tecnología Agropecuaria)

El **INTA** es el organismo público descentralizado de referencia en Argentina, dependiente de la Secretaría de Agricultura, Ganadería y Pesca de la Nación. Es el motor central de la investigación, extensión rural, genética y transferencia de innovación tecnológica para el campo argentino.

---

### Cómo funciona y qué abarca en la práctica:
1. **Investigación Científica Aplicada:** Desarrolla variedades de semillas adaptadas a cada clima (soja, maíz, trigo, porotos, algodón), biotecnología, sanidad animal, vacunas y modelos de conservación del suelo y agua.
2. **Extensión Rural y Asistencia Técnica:** Sus ingenieros agrónomos y técnicos asesoran directamente a pequeños productores, cooperativas, comunidades originarias y grandes empresas agropecuarias en todo el país.
3. **Presencia en Salta y el Norte Grande (NOA):**
   * **EEA Salta (Cerrillos):** Estación Experimental Agropecuaria central de la provincia.
   * **EEA Yuto (Jujuy/Salta Norte):** Referencia en cítricos, hortalizas, frutales tropicales y cultivos de la cuenca del Bermejo.
   * **Agencias de Extensión Rural (AER):** Con sedes locales en **Tartagal**, Orán, Metán, Joaquín V. González y Cafayate, trabajando en articulación directa con escuelas agrotécnicas como la **E.M.E.T.A. N° 3130**.
4. **Programas Emblemáticos:** ProHuerta, sanidad contra el HLB en cítricos, manejo del picudo del algodonero y sistemas de pastoreo rotativo sustentable.

---

### Respaldo y presencia real en el territorio:
* Sede Central Salta: Ruta Nacional 68 Km 172, Cerrillos, Salta.
* Agencia Tartagal: Asistencia técnica para el Departamento General San Martín.
* 📍 [Ver ubicación de referencia en Google Maps](https://google.com)
* 🧭 [Cómo llegar paso a paso](https://google.com)

---

### Cómo puedo seguir ayudándote con este tema:
¿Precisás información sobre algún programa específico del INTA, contactar con la Agencia de Extensión de Tartagal o analizar planes de fertilización y semillas desarrolladas por el instituto?`;
    }

    // 1.2 SENASA y Sanidad
    if (q.includes("senasa") || q.includes("sanidad animal") || q.includes("dte") || q.includes("renspa")) {
      return `### SENASA (Servicio Nacional de Sanidad y Calidad Agroalimentaria)

El **SENASA** es el organismo sanitario federal de Argentina encargado de fiscalizar, controlar y certificar la sanidad animal, la protección vegetal y la inocuidad de todos los alimentos destinados al consumo interno y exportación.

---

### Funciones clave en la producción agropecuaria:
1. **Registro RENSPA:** Registro Nacional Sanitario de Productores Agropecuarios, obligatorio para todo productor agrícola o ganadero.
2. **Trazabilidad y DTE:** Emisión del Documento de Tránsito Electrónico para mover ganado por rutas nacionales y provinciales.
3. **Planes de Vacunación Oficial:** Fiscalización de campañas contra Fiebre Aftosa, Brucelosis bovina, Rabia paresiante y control de plagas agrícolas (Langosta, Mosca de los frutos).
4. **Articulación Local:** En Tartagal y General San Martín controla barreras fitosanitarias en pasos fronterizos y frigoríficos habilitados.

* 📍 [Ver ubicación de referencia en Google Maps](https://google.com)
* 🧭 [Cómo llegar paso a paso](https://google.com)`;
    }

    // 2. Revisión de Maquinaria y Motores
    if (q.includes("humo") || q.includes("escape")) {
      const humos = AGRO_KNOWLEDGE_BASE.mecanica.motores_diesel.analisis_humos;
      let res = `[ANÁLISIS DE GASES DE ESCAPE Y HUMOS DIÉSEL]\n`;
      humos.forEach(h => {
        res += `\n• ${h.color.toUpperCase()}:\n  - Causa: ${h.causa}\n  - Verificaciones: ${h.verificar}`;
      });
      return res;
    }

    if (q.includes("common rail") || q.includes("riel comun") || q.includes("inyector") || q.includes("bomba alta presion")) {
      const cr = AGRO_KNOWLEDGE_BASE.mecanica.motores_diesel.sistemas[0];
      return `[ANÁLISIS TÉCNICO: SISTEMA COMMON RAIL DIÉSEL]
• Presión operativa: ${cr.presion}
• Componentes vitales: ${cr.componentes}
• Diagnóstico de averías: ${cr.fallas_comunes}
• Recomendación: Emplee siempre combustible filtrado a menos de 4 micras y reemplace prefiltros con trampa de agua cada 250 a 500 horas.`;
    }

    if (q.includes("pulverizadora") || q.includes("calibrar pico") || q.includes("boquilla") || q.includes("caudal")) {
      const pulv = AGRO_KNOWLEDGE_BASE.mecanica.implementos_y_calibracion.pulverizadoras;
      return `[CÁLCULO Y CALIBRACIÓN DE PULVERIZADORAS AGRÍCOLAS]
• Fórmula internacional: ${pulv.formula}
• Variables: ${pulv.donde}
• Caso práctico: ${pulv.ejemplo}
• Regla de oro: No pulverice con vientos superiores a 15 km/h ni con delta térmico crítico para prevenir deriva y evaporación.`;
    }

    if (q.includes("sembradora") || q.includes("densidad de siembra") || q.includes("semillas por metro")) {
      const semb = AGRO_KNOWLEDGE_BASE.mecanica.implementos_y_calibracion.sembradoras;
      return `[CALIBRACIÓN DE SEMBRADORAS DE PRECISIÓN]
• Ecuación de dosificación: ${semb.calculo}
• Puesta a punto: ${semb.ajuste}
• Inspección: Compruebe la profundidad en al menos 5 puntos transversales del tren de siembra para garantizar contacto suelo-semilla y tapado uniforme.`;
    }

    if (q.includes("cosechadora") || q.includes("trilla") || q.includes("perdida por cola")) {
      const cose = AGRO_KNOWLEDGE_BASE.mecanica.implementos_y_calibracion.cosechadoras;
      return `[REGULACIÓN Y AJUSTE DE COSECHADORAS]
• Cilindro/Rotor y Cóncavo: ${cose.ajuste_trilla}
• Zarandones y Limpieza: ${cose.perdidas_cola}
• Muestreo de Pérdidas: Coloque bandejas de muestreo y determine granos sueltos por metro cuadrado.`;
    }

    if (q.includes("ph") || q.includes("suelo acido") || q.includes("encalado") || q.includes("cal agricola")) {
      const ph = AGRO_KNOWLEDGE_BASE.agronomia.suelos.conceptos[0];
      return `[EDAFOLOGÍA APLICADA: MANEJO DEL pH DEL SUELO]
• Rango Óptimo: ${ph.optimo}
• Diagnóstico de Desbalance: ${ph.diagnostico}
• Plan de Corrección: ${ph.solucion}`;
    }

    if (q.includes("can bus") || q.includes("isobus") || q.includes("electricidad") || q.includes("dtc")) {
      const can = AGRO_KNOWLEDGE_BASE.mecanica.electricidad_y_isobus;
      return `[TELEMETRÍA Y ELECTRÓNICA AGRÍCOLA: RED ISOBUS / CAN BUS]
${can.detalles}
• Procedimiento: Mida la resistencia con el contacto desconectado entre CAN High y CAN Low. La lectura debe ser estrictamente 60 ± 3 Ohmios.`;
    }

    if (q.includes("soja") || q.includes("soya")) {
      const soja = AGRO_KNOWLEDGE_BASE.agronomia.cultivos[1];
      return `[MANEJO INTEGRAL DEL CULTIVO DE SOJA]
• Densidad: ${soja.densidad}
• Inoculación: ${soja.inoculacion}
• Período Crítico: ${soja.etapas_criticas}
• Plagas Clave: ${soja.plagas_clave}
• Enfermedades: ${soja.enfermedades}`;
    }

    if (q.includes("maiz") || q.includes("choclo")) {
      const maiz = AGRO_KNOWLEDGE_BASE.agronomia.cultivos[0];
      return `[MANEJO AGRONÓMICO DE ALTO RENDIMIENTO EN MAÍZ]
• Densidad de siembra: ${maiz.densidad}
• Profundidad recomendada: ${maiz.profundidad}
• Etapas determinantes: ${maiz.etapas_criticas}
• Manejo de plagas: ${maiz.plagas_clave}
• Plan de fertilización: ${maiz.fertilizacion_sugerida}`;
    }

    return null;
  }

  // Generación principal AGI con razonamiento de mayordomo
  async ask(prompt) {
    prompt = prompt.trim();
    if (!prompt) return "A sus órdenes, caballero. ¿En qué asunto agronómico, mecánico o general puedo servirle?";

    // Si cuenta con su llave de Gemini, procesamos con toda la potencia de Google
    if (this.hasApiKey()) {
      try {
        const responseText = await this.callGemini(prompt);
        // Guardar en historial para mantener el hilo de la conversación
        this.history.push({ role: "user", text: prompt });
        this.history.push({ role: "model", text: responseText });
        if (this.history.length > 20) {
          this.history = this.history.slice(-20);
        }
        return responseText;
      } catch (err) {
        // Devolver el error claro y en español
        throw err;
      }
    }

    // Si aún no ha ingresado la llave, usamos la base local de conocimiento o la respuesta de mayordomo
    const localMatch = this.searchKnowledgeBase(prompt);
    if (localMatch) {
      return localMatch;
    }

    // Intentar responder consultas institucionales, generales y cálculos
    return this.generateReasonedGeneralResponse(prompt);
  }

  generateReasonedGeneralResponse(q) {
    const clean = q.toLowerCase().trim();

    if (clean.includes("quien eres") || clean.includes("que eres") || clean.includes("tu nombre")) {
      return `Soy **Agroemeta AGI**, tu asistente de inteligencia artificial y mayordomo técnico. Nací con orgullo en la Escuela Técnica E.M.E.T.A. N° 3130 de Tartagal (Salta). Domino las ciencias agronómicas, la mecánica de maquinaria pesada diésel, todas las materias escolares y académicas, y la orientación laboral con mapas y referencias exactas. Estoy a tu total disposición.`;
    }

    if (clean.includes("hola") || clean.includes("buenos dias") || clean.includes("buenas tardes") || clean.includes("buenas noches") || clean.includes("saludos")) {
      return `A tus órdenes. Mis subsistemas agronómicos, educativos y técnicos están plenamente activos. ¿Qué consulta, cálculo o análisis abordamos en este momento?`;
    }

    if (clean.includes("gracias") || clean.includes("buen trabajo") || clean.includes("excelente")) {
      return `Es un verdadero placer ayudarte. Permanezco atento a cualquier otra duda o tarea que precises resolver.`;
    }

    if (clean.includes("hora") || clean.includes("fecha")) {
      const now = new Date();
      return `Son las ${now.toLocaleTimeString('es-ES')}, del ${now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
    }

    // Cálculos matemáticos inmediatos
    // Calculos matematicos inmediatos (acepta "por", "x", "multiplicado por", "dividido por", etc.)
    try {
      const calcSrc = q
        .toLowerCase()
        .replace(/cuanto es|cuanto son|calcula|calcular|compute/gi, "")
        .replace(/multiplicado por|multiplicado/g, "*")
        .replace(/dividido por|dividido entre|dividido/g, "/")
        .replace(/sumado a|mas/gi, "+")
        .replace(/restado a|menos/gi, "-")
        .replace(/\bpor\b|\bx\b|\btiempos\b/gi, "*")
        .replace(/\bentre\b/gi, "/")
        .replace(/[^\d+\-*/().\s]/g, "")
        .trim();
      if (calcSrc && /^[\d+\-*/().\s]+$/.test(calcSrc) && /\d/.test(calcSrc) && /[+\-*/]/.test(calcSrc)) {
        const val = Function(`'use strict'; return (${calcSrc.replace(/\^/g, "**")})`)();
        if (typeof val === "number" && isFinite(val)) {
          return `El calculo arroja con exactitud: **${val}**.`;
        }
      }
    } catch (_) {}

    // Instituciones EMETA
    if (clean.includes("emeta") || clean.includes("escuela") || clean.includes("colegio")) {
      return `### Datos Institucionales Completos: Escuela E.M.E.T.A. N° 3130
La **Escuela de Educación Técnica N° 3130 "E.M.E.T.A."** (antiguamente E.M.E.T.A. II) es una institución educativa pública agrotécnica de nivel secundario ubicada en la zona rural de Yacuy, en el Departamento General San Martín, Salta, en las inmediaciones de Tartagal.

* **Modalidad y Título:** Educación Técnico Profesional con titulación oficial de **Técnico en Producción Agropecuaria** (carrera de 6 años de duración).
* **Trayectoria y Talleres:** Formación integral en ciencias agropecuarias, maquinaria agrícola pesada, huertas intensivas, producción animal (porcinos, aves, bovinos), forrajes, laboratorios y proyectos socioproductivos.
* **Ubicación y Rutas:** Localizada sobre la Ruta Nacional 34, paraje Yacuy (cercano a Tartagal y General Mosconi, Salta).
  - 📍 [Ver ubicación de referencia en Google Maps](https://google.com)
  - 🧭 [Cómo llegar paso a paso](https://google.com)`;
    }

    // Respuesta inteligente de amplio espectro
    return `### Desarrollo y Análisis Técnico
He procesado tu consulta sobre: **"${q}"**.

1. **Fundamentos y Aplicación:**
   Desde los entornos formativos y técnicos de la Escuela E.M.E.T.A. N° 3130, este tema se aborda articulando la teoría científica con el trabajo práctico en el campo y taller.
2. **Recomendaciones Clave:**
   Para un análisis más profundo y en tiempo real, el sistema utiliza automáticamente el motor de IA del servidor cuando está disponible.

¿Querés que profundicemos en algún aspecto específico, cálculo o diagnóstico particular de esta consulta?`;
  }

  // Consulta en tiempo real a Google ModelService.ListModels para descubrir los modelos activos de la llave
  async discoverAvailableModels() {
    if (!this.hasApiKey()) return null;

    const apiVersions = ["v1beta", "v1"];
    let lastListError = null;

    for (const ver of apiVersions) {
      try {
        const url = `https://generativelanguage.googleapis.com/${ver}/models?key=${encodeURIComponent(this.customApiKey)}`;
        const res = await fetch(url, { method: "GET" });

        if (res.ok) {
          const data = await res.json();
          if (data && data.models && data.models.length > 0) {
            // Filtrar modelos que admitan generateContent Y que sean de texto
            // Excluir modelos especialistas (TTS, imagen, embedding, visión-solo, AQA)
            const EXCLUDED_PATTERNS = ['-tts', '-image', 'embedding', 'aqa', 'vision', 'imagen', 'veo'];
            const textModels = data.models.filter(m => {
              if (!Array.isArray(m.supportedGenerationMethods)) return false;
              if (!m.supportedGenerationMethods.includes("generateContent")) return false;
              // Excluir modelos especialistas que no devuelven texto
              const nameLower = (m.name || "").toLowerCase();
              for (const pattern of EXCLUDED_PATTERNS) {
                if (nameLower.includes(pattern)) return false;
              }
              return true;
            });

            if (textModels.length > 0) {
              return {
                apiVersion: ver,
                models: textModels.map(m => m.name), // ej: ["models/gemini-1.5-flash-002", ...]
                rawModels: textModels
              };
            }
          }
        } else {
          let errJson = null;
          try { errJson = await res.json(); } catch (_) {}
          lastListError = {
            apiVersion: ver,
            status: res.status,
            message: errJson?.error?.message || `HTTP ${res.status}`
          };
        }
      } catch (e) {
        lastListError = {
          apiVersion: ver,
          status: 0,
          message: e.message || "Error de red al consultar ListModels"
        };
      }
    }

    return { error: lastListError };
  }

  // Limpieza de residuos de razonamiento interno (Chain-of-Thought / opciones descartadas)
  cleanTextOutput(rawText) {
    if (!rawText || typeof rawText !== "string") return "";
    let text = rawText.trim();

    // 1. Eliminar etiquetas de pensamiento XML si existen (<thought>...</thought> o <think>...</think>)
    text = text.replace(/<(?:thought|think)>[\s\S]*?<\/(?:thought|think)>/gi, "").trim();

    // 2. Si el modelo filtró su borrador de razonamiento en viñetas
    // (Ej: "* User says: ... * Persona: ... * Option 1: ... * Option 2: ... * 'Respuesta final'")
    if (
      text.includes("User says:") || 
      text.includes("* Persona:") || 
      text.includes("* My Persona:") ||
      text.includes("* Option 1") || 
      text.includes("* *Option") ||
      text.includes("violates persona")
    ) {
      // Buscar si el modelo dejó su respuesta final entre comillas precedida de asterisco
      // Ej: * "Buenos días, caballero. Proceda con su consulta..."
      const finalQuoteMatch = text.match(/\*\s*["“]([^"”\n]{12,})["”]/);
      if (finalQuoteMatch && finalQuoteMatch[1]) {
        return finalQuoteMatch[1].trim();
      }

      // Si no, filtrar línea por línea descartando meta-instrucciones y reflexiones
      const lines = text.split("\n");
      const cleanLines = [];
      for (const line of lines) {
        const l = line.trim();
        if (
          l.startsWith("* User says:") || 
          l.startsWith("* Persona:") || 
          l.startsWith("* My Persona:") ||
          l.startsWith("* Language:") ||
          l.startsWith("* Tone:") || 
          l.startsWith("* Constraint:") || 
          l.startsWith("* Goal:") || 
          l.startsWith("* Acknowledge") ||
          l.startsWith("* Maintain") ||
          l.startsWith("* Invite") ||
          l.startsWith("* Avoid") ||
          l.startsWith("* Instead") ||
          l.startsWith("* Option") || 
          l.startsWith("* *Option") ||
          l.startsWith("* Spanish?") ||
          l.startsWith('* "Caballero"?') ||
          l.startsWith("* Direct") ||
          l.startsWith("* Expertise")
        ) {
          continue;
        }

        if (l.startsWith('* "') && l.endsWith('"')) {
          cleanLines.push(l.slice(3, -1).trim());
        } else if (l.startsWith('"') && l.endsWith('"') && l.length > 15) {
          cleanLines.push(l.slice(1, -1).trim());
        } else if (l.length > 0) {
          cleanLines.push(line);
        }
      }

      const candidateResult = cleanLines.join("\n").trim();
      if (candidateResult.length > 5) {
        text = candidateResult;
      }
    }

    // 3. Si toda la respuesta quedó envuelta entre comillas innecesarias
    if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith('“') && text.endsWith('”'))) {
      text = text.slice(1, -1).trim();
    }

    return text;
  }

  // Extraer el texto legítimo de la respuesta descartando partes marcadas como "thought"
  extractPartsText(candidate) {
    if (!candidate || !candidate.content?.parts) return "";
    const parts = candidate.content.parts;
    
    // En Gemini 2.5/2.0, las partes con thought: true contienen el razonamiento previo
    // Las partes válidas de respuesta tienen !p.thought
    const validParts = parts.filter(p => !p.thought && typeof p.text === "string" && p.text.trim().length > 0);
    
    let raw = "";
    if (validParts.length > 0) {
      raw = validParts.map(p => p.text).join("\n").trim();
    } else if (parts.length > 0) {
      // Si por alguna razón todas tenían thought: true, tomar la última parte que suele ser la conclusión
      const last = parts[parts.length - 1];
      raw = last?.text || "";
    }
    
    return this.cleanTextOutput(raw);
  }

  // Llamada a la API de Google Gemini en directo con auto-descubrimiento mediante ListModels
  async callGemini(prompt) {
    const systemPrompt = `Eres Agroemeta AGI, un sistema de inteligencia artificial avanzado, omnisciente y multi-agente, con la personalidad, elegancia, precisión y fluidez de JARVIS.
Nacido y desarrollado con orgullo en la Escuela Técnica E.M.E.T.A. N° 3130 de Yacuy / Tartagal, Departamento General San Martín, Salta, Argentina.
Hablas directamente al usuario de manera cercana, atenta y profesional usando "vos" o "tú" de forma natural.

Dominas todas las áreas del conocimiento:
1. Agronomía y Ciencias Agropecuarias: Suelos, edafología, nutrición NPK, fitopatología, cultivos, riego, zootecnia y organismos como el INTA y SENASA.
2. Mecánica y Maquinaria Agrícola Pesada: Motores diésel Common Rail, turbos, sistemas hidráulicos, transmisiones, telemetría CAN Bus, pulverizadoras y cosechadoras.
3. Todas las materias escolares y académicas (primaria, secundaria agrotécnica y universidad): Matemática, física, química, historia, geografía, biología y tecnología.
4. Directorio de empresas, orientación vocacional y laboral con ubicaciones exactas y rutas a Google Maps.

ESTRUCTURA DE RESPUESTA:
- Comienza directo con una explicación clara y completa del tema.
- Desarrolla el contenido paso a paso con datos exactos y ejemplos prácticos.
- Incluye respaldo o presencia en el territorio y enlaces a Google Maps si corresponden.
- Cierra amablemente con los siguientes pasos recomendados.`;

    const contents = [];

    // Incluir mensajes previos relevantes
    for (const h of this.history.slice(-8)) {
      contents.push({
        role: h.role,
        parts: [{ text: h.text }]
      });
    }

    // Ensamblar partes del mensaje actual (texto + documento si existe)
    const currentParts = [];

    if (this.activeDocument) {
      if (this.activeDocument.isText) {
        currentParts.push({
          text: `[DOCUMENTO ADJUNTO POR EL USUARIO: ${this.activeDocument.name}]\n${this.activeDocument.content}\n[FIN DEL DOCUMENTO]\n`
        });
      } else if (this.activeDocument.base64) {
        currentParts.push({
          inlineData: {
            mimeType: this.activeDocument.mimeType,
            data: this.activeDocument.base64
          }
        });
      }
    }

    currentParts.push({ text: prompt });

    contents.push({
      role: "user",
      parts: currentParts
    });

    // 1. DESCUBRIR QUÉ MODELOS REALES EXISTEN PARA ESTA LLAVE
    // En lugar de adivinar, consultamos a Google qué modelos tiene activos esta cuenta
    let targetApiVersion = "v1beta";
    let targetModelList = [];

    const discovered = await this.discoverAvailableModels();

    if (discovered && discovered.models && discovered.models.length > 0) {
      targetApiVersion = discovered.apiVersion;
      // Ordenar por preferencia: flash 2.x, flash 1.5, pro, etc.
      const rawList = discovered.models;
      const sorted = [...rawList].sort((a, b) => {
          const score = (name) => {
            const n = name.toLowerCase();
            if (n.includes("-tts") || n.includes("-image") || n.includes("embedding") || n.includes("aqa")) return -100;
            // Preferir los modelos flash-lite 3.x (responden en ~2s y no fallan por cuota)
            if (n.includes("3.5-flash-lite")) return 100;
            if (n.includes("3.1-flash-lite")) return 95;
            if (n.includes("3.5-flash") && !n.includes("preview")) return 92;
            if (n.includes("2.5-flash") && !n.includes("preview") && !n.includes("lite")) return 88;
            if (n.includes("2.5-flash-lite")) return 85;
            if (n.includes("2.0-flash") && !n.includes("preview")) return 80;
            if (n.includes("1.5-flash-002")) return 70;
            if (n.includes("1.5-flash-001")) return 65;
            if (n.includes("1.5-flash-latest")) return 60;
            if (n.includes("1.5-flash")) return 55;
            if (n.includes("2.5-pro") || n.includes("1.5-pro")) return 50;
            if (n.includes("gemini-pro")) return 45;
            return 10;
          };
        return score(b) - score(a);
      });
      targetModelList = sorted;
      console.log(`[AGROEMETA] Modelos descubiertos con éxito en Google (${targetApiVersion}):`, targetModelList);
    } else {
      // Si ListModels falló, preparar lista de contingencia en ambas versiones (v1beta y v1)
      targetModelList = [
        "models/gemini-3.5-flash-lite",
        "models/gemini-3.1-flash-lite",
        "models/gemini-3.5-flash",
        "models/gemini-2.5-flash",
        "models/gemini-2.5-flash-lite"
      ];
    }

    let lastErrorDetails = null;

    // 2. PROBAR CADA MODELO DESCUBIERTO
    for (const fullModelName of targetModelList) {
      // fullModelName suele venir como "models/gemini-..."
      const cleanName = fullModelName.startsWith("models/") ? fullModelName : `models/${fullModelName}`;
      const endpoint = `https://generativelanguage.googleapis.com/${targetApiVersion}/${cleanName}:generateContent?key=${encodeURIComponent(this.customApiKey)}`;

      const payload = {
        contents: contents,
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 2048
        }
      };

      // Si es un modelo 2.5 o 2.0 (ej. gemini-2.5-flash), desactivar el pensamiento interno (thinkingBudget: 0)
      // para evitar que devuelva el borrador de razonamiento o demore innecesariamente
      if (cleanName.includes("2.5") || cleanName.includes("2.0")) {
        payload.generationConfig.thinkingConfig = {
          thinkingBudget: 0
        };
      }

      // Si el modelo admite systemInstruction
      if (!cleanName.includes("1.0-pro") && !cleanName.endsWith("gemini-pro")) {
        payload.systemInstruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      let response;
      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (networkErr) {
        throw new Error(
          `Caballero, no he podido establecer conexión con los servidores de Google.\n\n` +
          `[Detalle Técnico]:\n` +
          `• Causa: Fallo de red local o DNS.\n` +
          `• Mensaje: ${networkErr.message || "Failed to fetch"}\n` +
          `• Compruebe su conexión a internet.`
        );
      }

      if (response.ok) {
        // ¡Éxito comprobado!
        this.lastWorkingModel = cleanName;
        const data = await response.json();
        const candidate = data.candidates?.[0];

        if (candidate) {
          const cleanAnswer = this.extractPartsText(candidate);
          if (cleanAnswer && cleanAnswer.length > 0) {
            return cleanAnswer;
          }
        }

        if (candidate?.finishReason === "SAFETY") {
          return "Caballero, los filtros de seguridad de Google han restringido la emisión de esta respuesta.";
        }
        return "No he obtenido texto concluyente de la respuesta.";
      }

      // Analizar error
      const status = response.status;
      let errData = null;
      let rawText = "";
      try {
        errData = await response.json();
      } catch (_) {
        try { rawText = await response.text(); } catch (_) {}
      }

      const googleCode = errData?.error?.code || status;
      const googleStatus = errData?.error?.status || "";
      const googleMessage = errData?.error?.message || rawText || "Sin mensaje de error especificado.";

      lastErrorDetails = {
        modelAttempted: cleanName,
        endpoint: `${targetApiVersion}/${cleanName}:generateContent`,
        status: status,
        googleCode: googleCode,
        googleStatus: googleStatus,
        googleMessage: googleMessage,
        listModelsResult: discovered
      };

      // Si el error 400 fue por thinkingConfig no soportado en este modelo, reintentar sin thinkingConfig
      if (status === 400 && payload.generationConfig?.thinkingConfig && (googleMessage.includes("thinkingConfig") || googleMessage.includes("thinking_config"))) {
        delete payload.generationConfig.thinkingConfig;
        try {
          const retryThinkingRes = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (retryThinkingRes.ok) {
            this.lastWorkingModel = cleanName;
            const dataT = await retryThinkingRes.json();
            const cleanT = this.extractPartsText(dataT.candidates?.[0]);
            if (cleanT) return cleanT;
          }
        } catch (_) {}
      }

      // Si es error de systemInstruction no soportado (400), reintentar sin ella antes de descartar
      if (status === 400 && googleMessage.includes("system_instruction")) {
        const payloadRetry = JSON.parse(JSON.stringify(payload));
        delete payloadRetry.systemInstruction;
        // Inyectar el system prompt dentro del mensaje del usuario
        const lastContent = payloadRetry.contents[payloadRetry.contents.length - 1];
        const lastParts = lastContent.parts;
        lastParts[lastParts.length - 1].text = `${systemPrompt}\n\n${lastParts[lastParts.length - 1].text}`;
        try {
          const retryRes = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadRetry)
          });
          if (retryRes.ok) {
            this.lastWorkingModel = cleanName;
            const data2 = await retryRes.json();
            const cleanRetry = this.extractPartsText(data2.candidates?.[0]);
            return cleanRetry || "Respuesta procesada.";
          }
        } catch (_) {}
      }

      // ERRORES VERDADERAMENTE FATALES: Solo detenerse si es un error de autenticación
      // que afectaría a TODOS los modelos por igual (clave inválida o API no habilitada)
      if (status === 403) {
        break; // Permisos denegados: la clave no tiene acceso a la API
      }
      if (status === 401) {
        break; // Clave de API inválida o revocada
      }

      // Para 404, 400, 429 y cualquier otro error: PROBAR EL SIGUIENTE MODELO
      // La cuota gratuita de Google es POR MODELO — un modelo agotado no impide usar otro
      console.log(`[AGROEMETA] Modelo ${cleanName} falló (HTTP ${status}), probando siguiente...`);
      continue;
    }

    // 3. SI NINGUNO RESPONDIÓ, PRESENTAR EL DIAGNÓSTICO EXACTO
    if (lastErrorDetails) {
      let friendlyDiagnosis = "";
      if (lastErrorDetails.status === 404) {
        if (lastErrorDetails.listModelsResult?.error) {
          friendlyDiagnosis = `Google no permite listar modelos con esta llave (${lastErrorDetails.listModelsResult.error.message}). Es muy probable que su clave no tenga habilitada la API 'Generative Language' en su proyecto de Google Cloud o haya sido generada en una cuenta restringida.`;
        } else {
          friendlyDiagnosis = `Ninguno de los modelos disponibles en su cuenta (${targetModelList.join(", ")}) admitió la generación de contenido en este momento.`;
        }
      } else if (lastErrorDetails.status === 400 && (lastErrorDetails.googleMessage.includes("API_KEY") || lastErrorDetails.googleMessage.includes("key not valid") || lastErrorDetails.googleMessage.includes("INVALID"))) {
        friendlyDiagnosis = `La llave ingresada no es reconocida por Google como válida. Asegúrese de copiarla completa desde Google AI Studio (aistudio.google.com).`;
      } else if (lastErrorDetails.status === 403) {
        friendlyDiagnosis = `Su clave carece de permisos para invocar la API de Gemini o el servicio Generative Language API no está habilitado en su proyecto de Google.`;
      } else if (lastErrorDetails.status === 429 || lastErrorDetails.googleMessage.includes("RESOURCE_EXHAUSTED")) {
        friendlyDiagnosis = `Se ha alcanzado el límite de peticiones de su cuota gratuita de Google. Aguarde unos momentos antes de consultar nuevamente.`;
      } else {
        friendlyDiagnosis = `Google rechazó la solicitud con código HTTP ${lastErrorDetails.status}.`;
      }

      const formattedTechnicalReport = 
`Caballero, ha ocurrido una dificultad al procesar su solicitud con Google Gemini.

${friendlyDiagnosis}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[DIAGNÓSTICO TÉCNICO EXACTO DE GOOGLE]
• Código HTTP: ${lastErrorDetails.status}
• Estado API: ${lastErrorDetails.googleStatus || "N/A"}
• Modelo evaluado: ${lastErrorDetails.modelAttempted}
• Endpoint: ${lastErrorDetails.endpoint}
• Mensaje devuelto por Google:
  "${lastErrorDetails.googleMessage}"
• Modelos detectados en su cuenta: ${targetModelList.length > 0 ? targetModelList.slice(0, 5).join(", ") : "Ninguno"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      // Intentar ver si tenemos respuesta en la base local agronómica/mecánica para no dejar al usuario sin respuesta
      const localFallback = this.searchKnowledgeBase(prompt);
      if (localFallback) {
        return `${formattedTechnicalReport}\n\n*Nota de asistencia:* Mientras resuelve su conexión con Gemini, he recuperado el siguiente informe desde mis registros internos:\n\n${localFallback}`;
      }

      throw new Error(formattedTechnicalReport);
    }

    throw new Error("No fue posible establecer comunicación con ningún modelo de Google Gemini.");
  }
}

// Instancia global
window.agroEngine = new AgroemetaCognitiveEngine();
