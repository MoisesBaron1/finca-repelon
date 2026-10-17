"""Create a three-page large-print field checklist; full guide: docs/GUIA-SIN-SENAL.md."""
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate,Paragraph,PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
root=Path(__file__).resolve().parents[1]
for name,file in [('Campo','DejaVuSans.ttf'),('CampoBold','DejaVuSans-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+file))
style=ParagraphStyle('Campo',fontName='Campo',fontSize=15,leading=23,textColor=HexColor('#20382e'),spaceAfter=13)
heading=ParagraphStyle('Titulo',fontName='CampoBold',fontSize=25,leading=32,textColor=HexColor('#123c30'),spaceAfter=19)
pages=[('Antes de salir sin señal',[
'Finca Repelón · Versión 0.3.1 · Piloto gratuito',
'<b>1. Prepara el teléfono.</b> Carga la batería, lleva una batería portátil y comprueba espacio libre y hora correcta.',
'<b>2. Instala con señal.</b> En Android 8 o superior descarga la APK y actualiza sin desinstalar. En iPhone abre la app en Safari actualizado y usa Compartir → Añadir a pantalla de inicio. Usa siempre el mismo icono y evita navegación privada.',
'<b>3. Comprueba Ayuda.</b> Debe mostrar Versión 0.3.1. En navegador espera «App guardada para abrir sin señal». Si no aparece, con internet cierra y vuelve a abrir una vez más.',
'<b>4. Haz la prueba en modo avión.</b> Apaga también Wi-Fi y datos móviles. En Datos de ejemplo guarda un peso, cierra y abre de nuevo. Comprueba que el peso sigue en Ganado. Crea una copia en Descargas o Archivos.',
'<b>5. Prepara los datos reales.</b> Toca Datos de ejemplo → Usar mi finca. Añade los responsables, animales y lotes que necesitarás. Los ejemplos se conservan aparte.',
'Guarda este PDF en el teléfono antes de ir. Si falla la prueba de reapertura o guardado, prepáralo de nuevo mientras tienes señal.'
]),('Trabajar dentro de la finca',[
'<b>Anota y confirma.</b> En Inicio elige Anotar un dato o Avisar un problema. Completa los pasos, revisa y guarda. Espera el mensaje de confirmación antes de cerrar.',
'<b>El GPS funciona sin señal móvil.</b> Mantén Ubicación activada, incluso con modo avión. En Android concede ubicación precisa y notificaciones. Permite actividad en segundo plano en los ajustes de batería de la app.',
'<b>Para registrar un recorrido:</b> con la app visible toca Iniciar jornada, elige responsable y zona, revisa y toca Comenzar jornada. Sal a cielo abierto: la primera posición puede tardar varios minutos.',
'<b>Android instalado:</b> puede seguir con pantalla bloqueada. Antes del recorrido largo, prueba un minuto bloqueado y verifica puntos y la notificación de jornada activa.',
'<b>iPhone o navegador:</b> mantén la app visible y la pantalla encendida. Cambiar de app o bloquearla puede interrumpir el recorrido.',
'<b>Si falla el GPS:</b> sigue anotando manualmente y registra el problema. Bajo árboles o techo puede perder precisión. Si el teléfono reinicia o cierra la app, revisa la jornada e inicia otra explícitamente; los huecos no se rellenan.',
'La duración de ocho horas y la precisión por palma aún requieren validación en el teléfono real. El GPS no comprueba por sí solo que una tarea esté hecha.'
]),('Terminar y conservar los datos',[
'<b>1. Finaliza.</b> Toca Finalizar jornada → Sí, finalizar y guardar. Revisa los registros y los puntos o avisos del recorrido.',
'<b>2. Haz una copia sin señal.</b> Ayuda → Hacer una copia. Escribe una contraseña de al menos 8 caracteres y toca Guardar copia protegida. Elige Archivos o Descargas del teléfono, no una nube que necesite internet.',
'<b>3. Comprueba el archivo.</b> Verifica que existe la copia .finca y conserva su contraseña fuera de la app. La app no recuerda la contraseña.',
'<b>4. Saca otra copia del teléfono.</b> Usa USB u otro medio local compatible; con señal puedes usar el servicio que elijas. Para recuperarla en otro equipo usa el mismo espacio y Hacer una copia → Traer una copia.',
'<b>No hay sincronización automática.</b> Recuperar señal no envía las anotaciones a otros equipos. Cada teléfono mantiene sus propios datos.',
'<b>No borres datos ni desinstales.</b> Conserva una copia antes de cambiar de navegador, teléfono o enlace. Si aparece un error de guardado, conserva lo escrito, revisa espacio y reintenta.',
'<b>Apunta para evaluar la prueba:</b><br/>Modelo: __________________________<br/>Hora y batería inicial/final: __________________<br/>¿Conservó el dato en modo avión? Sí / No<br/>¿Guardó la copia? Sí / No<br/>¿Siguió el GPS bloqueado? Sí / No / No aplica'
])]
story=[]
for i,(title,paragraphs) in enumerate(pages):
    if i:story.append(PageBreak())
    story.append(Paragraph(title,heading))
    for text in paragraphs:story.append(Paragraph(text,style))
output=root/'public/downloads/Guia-Sin-Senal-Finca-Repelon.pdf'
def footer(canvas,doc):
    canvas.setFont('Campo',10);canvas.setFillColor(HexColor('#405246'))
    canvas.drawString(42,24,'Finca Repelón · Guarda este PDF antes de salir')
    canvas.drawRightString(553,24,str(doc.page))
SimpleDocTemplate(str(output),pagesize=(595.28,841.89),leftMargin=42,rightMargin=42,topMargin=38,bottomMargin=43,title='Finca Repelón: guía sin señal 0.3.1',author='Finca Repelón').build(story,onFirstPage=footer,onLaterPages=footer)
print(output)
