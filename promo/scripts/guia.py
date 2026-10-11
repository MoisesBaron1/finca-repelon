from pathlib import Path
import json, sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from xml.sax.saxutils import escape

root=Path(__file__).resolve().parents[1]
url=sys.argv[1].rstrip('/') if len(sys.argv)>1 else ''
out=root/'exports'
out.mkdir(exist_ok=True)
pdfmetrics.registerFont(TTFont('DejaVu','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFontFamily('DejaVu',normal='DejaVu',bold='DejaVuBold')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleFinca',fontName='DejaVuBold',fontSize=32,leading=38,textColor=colors.HexColor('#123c30'),spaceAfter=16))
styles.add(ParagraphStyle(name='HeadingFinca',fontName='DejaVuBold',fontSize=20,leading=26,textColor=colors.HexColor('#123c30'),spaceBefore=16,spaceAfter=10))
styles.add(ParagraphStyle(name='BodyFinca',fontName='DejaVu',fontSize=15,leading=22,textColor=colors.HexColor('#20382e'),spaceAfter=11))
styles.add(ParagraphStyle(name='SmallFinca',fontName='DejaVu',fontSize=11,leading=16,textColor=colors.HexColor('#526158'),spaceAfter=9))
story=[]
def p(text,kind='BodyFinca'):
 story.append(Paragraph(text,styles[kind]))
def space(n=8):story.append(Spacer(1,n))
def page(canvas,doc):
 canvas.setFillColor(colors.HexColor('#123c30'));canvas.rect(0,0,A4[0],12,fill=1,stroke=0)
 canvas.setFont('DejaVu',10);canvas.drawString(42,25,'Finca Repelón · Guía promocional · Piloto gratuito')
 canvas.drawRightString(A4[0]-42,25,str(doc.page))

p('La finca, a tu alcance.','TitleFinca')
p('Finca Repelón te ayuda a llevar las anotaciones del campo desde el celular. Con botones grandes, pasos cortos y revisión antes de guardar.')
p('Gratis durante esta etapa piloto.','HeadingFinca')
home=root/'assets/inicio.png'
if home.exists():
 from PIL import Image as PILImage
 w,h=PILImage.open(home).size
 story.append(Image(str(home),width=440,height=440*h/w))
 space()
p('Pantalla real con datos de ejemplo.','SmallFinca')
p('Anota pesos del ganado, cosechas, gastos y tareas. Registra problemas y lleva el control de tus jornadas.')
if url:
 p('Abre la app','HeadingFinca');p(f'<link href="{escape(url)}" color="#123c30">{escape(url)}</link>')
else:
 p('Empieza desde el enlace que te comparta el administrador. Practica primero con los datos de ejemplo.','BodyFinca')

story.append(PageBreak())
p('Tu primera anotación','TitleFinca')
p('Prueba acompañada: 5 minutos','HeadingFinca')
p('1. En <b>Inicio</b>, toca <b>Anotar un dato</b>. Elige <b>Anotar peso de ganado</b>.')
p('2. Elige el animal y la fecha. Toca <b>Continuar</b>.')
p('3. Escribe el peso e indica si usaste báscula o cinta. Toca <b>Continuar</b>.')
p('4. Revisa la anotación. Si necesitas corregir, vuelve al paso anterior. Si está bien, toca <b>Guardar pesaje</b>.')
p('5. Espera el mensaje <b>Pesaje guardado</b>. Listo: puedes seguir trabajando.')
p('¿Quieres letras más grandes?','HeadingFinca')
p('Toca <b>Ayuda</b> y después <b>Usar texto más grande</b>. La app recordará ese tamaño.')
p('Trabaja sin internet','HeadingFinca')
p('<b>En navegador:</b> abre la app una vez con internet antes de ir al campo. Las anotaciones se guardan en ese navegador y teléfono.')
p('<b>En Android:</b> descarga e instala la APK del piloto. Después puedes usarla sin conexión. Para registrar un recorrido con la pantalla bloqueada, utiliza esta app Android.')
p('Las tareas se verifican mediante revisión y evidencia. La ubicación por sí sola no confirma una labor.','SmallFinca')

story.append(PageBreak())
p('Compártela con tu equipo','TitleFinca')
p('Mensaje listo para WhatsApp','HeadingFinca')
copy='Ya puedes probar Finca Repelón: una app para anotar tareas, ganado, cosechas y gastos. Tiene botones grandes y te guía paso a paso. Es gratis durante el piloto. Mira este video de un minuto y practica con los datos de ejemplo.'
p(escape(copy))
if url:p(f'<link href="{escape(url)}" color="#123c30">{escape(url)}</link>')
else:p('Añade el enlace de acceso cuando lo compartas.','SmallFinca')
p('Después del video','HeadingFinca')
p('Acompaña a cada persona en su primera anotación. Pídele que haga otra por su cuenta. Cuando esté cómoda, cambia a <b>Mi finca</b> y añade los animales o lotes reales. Los ejemplos se guardan aparte.')
p('Conserva una copia de tus datos','HeadingFinca')
p('En <b>Ayuda</b>, abre <b>Hacer una copia</b>. Escribe una contraseña y guarda el archivo fuera del teléfono. Conserva también la contraseña: la necesitarás para recuperar tus anotaciones.')
p('Para pasar datos a otro equipo o cambiar al enlace de Vercel, guarda una copia en el enlace anterior. En la nueva app, elige <b>Traer una copia</b> y usa la misma contraseña.')
p('Cada equipo conserva sus datos. Compartir el enlace no comparte las anotaciones: el intercambio se realiza con archivos protegidos.','SmallFinca')

SimpleDocTemplate(str(out/'Guia-Promocional-Finca-Repelon.pdf'),pagesize=A4,rightMargin=42,leftMargin=42,topMargin=42,bottomMargin=46,title='Finca Repelón: guía promocional',author='Finca Repelón').build(story,onFirstPage=page,onLaterPages=page)
launch=f'''# Compartir Finca Repelón\n\n{copy}\n\n{url or 'Añade aquí el enlace público de la app una vez publicado en Vercel.'}\n\nAdjunta Finca-Repelon-WhatsApp.mp4. Si se comparte en redes, acompáñalo con Finca-Repelon-Subtitulos.srt (tiempos orientativos por frase).\n\n## Presentación breve\n\n«Esta es la app para llevar las anotaciones de la finca. Vamos a probar con un dato de ejemplo. Tú eliges el botón, escribes, revisas y guardas. Si necesitas ayuda, puedes agrandar las letras.»\n\n## Primera sesión de cinco minutos\n\n1. Mira el video en un teléfono y pausa si hace falta.\n2. Anota un peso de ejemplo con la persona.\n3. Pídele que repita el recorrido y espere el aviso de guardado.\n4. Abre Ayuda y elige el tamaño de texto que le resulte cómodo.\n5. Cuando domine el recorrido, pasa a Mi finca y añade los registros reales.\n\n## Copias y cambio de enlace\n\nCada navegador, teléfono y dirección web conserva sus propios datos. Antes de cambiar al enlace de Vercel, guarda una copia protegida desde la dirección anterior. En la nueva app usa Traer una copia y la misma contraseña. La app no envía automáticamente los datos a Vercel ni a otros teléfonos.\n'''
(out/'Texto-para-compartir.md').write_text(launch)
print(out/'Guia-Promocional-Finca-Repelon.pdf')
