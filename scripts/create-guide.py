"""Create the large-print Spanish quick guide (requires reportlab)."""
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

root = Path(__file__).resolve().parents[1]
font = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
bold = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
family, bold_family = 'Helvetica', 'Helvetica-Bold'
if font.exists() and bold.exists():
    pdfmetrics.registerFont(TTFont('Guide', str(font)))
    pdfmetrics.registerFont(TTFont('GuideBold', str(bold)))
    family, bold_family = 'Guide', 'GuideBold'
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='GuideTitle', fontName=bold_family, fontSize=27, leading=35, textColor=HexColor('#123c30'), spaceAfter=24))
styles.add(ParagraphStyle(name='GuideHeading', fontName=bold_family, fontSize=18, leading=26, textColor=HexColor('#123c30'), spaceBefore=20, spaceAfter=10))
styles.add(ParagraphStyle(name='GuideBody', fontName=family, fontSize=16, leading=25, textColor=HexColor('#20382e'), spaceAfter=18))
styles.add(ParagraphStyle(name='GuideNote', fontName=family, fontSize=15, leading=23, textColor=HexColor('#405246'), spaceBefore=12, spaceAfter=18))
story = []
def title(text): story.append(Paragraph(text, styles['GuideTitle']))
def heading(text): story.append(Paragraph(text, styles['GuideHeading']))
def text(value, note=False): story.append(Paragraph(value, styles['GuideNote' if note else 'GuideBody']))
def next_page(): story.append(PageBreak())

title('Finca Repelón<br/>Guía para empezar')
text('Versión 0.2.1 · Uso gratuito')
heading('Primero, elige tus datos')
text('La primera pantalla tiene datos de ejemplo. Puedes practicar con ellos.')
text('Para empezar de verdad, toca «Empezar con mi finca» y luego «Usar mi finca». Los datos de prueba quedan aparte.')
heading('¿Qué necesitas hacer?')
text('• «Ver tareas»: consulta el trabajo pendiente.<br/>• «Anotar un dato»: guarda un peso, cosecha o gasto.<br/>• «Avisar un problema»: cuenta qué ocurrió.<br/>• «Iniciar jornada»: registra tu recorrido.')
text('Para volver, toca «Inicio». Si tienes dudas, toca «Ayuda». Ambos están a mano en la parte inferior del teléfono.', True)

next_page()
title('Anotar un peso')
text('1. En Inicio, toca «Anotar un dato». Después elige «Anotar peso de ganado».')
text('2. Elige el animal y la fecha. Toca «Continuar».')
text('3. Escribe el peso en kilogramos y elige cómo lo obtuviste. Toca «Continuar».')
text('4. Revisa el animal, el peso y la fecha. Si todo está bien, toca «Guardar pesaje».')
text('5. Espera el mensaje «Pesaje guardado». Ya puedes volver al inicio o hacer otra anotación.')
heading('¿Te equivocaste?')
text('Toca «Volver al paso anterior». Lo que escribiste se conserva para que puedas corregirlo.')
text('La cinta y la estimación a ojo se guardan como peso estimado. La báscula se guarda como peso medido.', True)

next_page()
title('Corregir y pedir ayuda')
heading('Salir sin perder lo escrito')
text('Si tocas «Cerrar» antes de guardar, la app pregunta «¿Salir sin guardar?».')
text('Elige «Seguir anotando» para terminar. Elige «Salir sin guardar» solo si quieres abandonar esa anotación.')
heading('Letras más grandes')
text('Toca «Ayuda» y después «Usar texto más grande». La app recordará ese tamaño la próxima vez.')
heading('Ver otras cosas de la finca')
text('Toca «Más opciones» para abrir ganado, plátano, herramientas, informes o ajustes.')
text('Puedes seguir anotando sin internet. En el navegador, debes haber abierto y descargado la app al menos una vez. La app Android lleva sus recursos dentro.', True)

next_page()
title('Hacer una copia')
text('Los datos están en este teléfono o equipo. Guarda una copia fuera de él para poder recuperarlos.')
text('1. En Inicio, toca «Hacer una copia de mis datos».')
text('2. Escribe una contraseña de al menos 8 letras o números. Elige una que puedas recordar.')
text('3. Toca «Guardar copia protegida». Guarda el archivo en un lugar seguro fuera del teléfono y conserva también la contraseña.')
heading('Traer la copia a otro equipo')
text('Abre la app en el otro equipo. Elige el mismo espacio: ejemplo o mi finca. Abre «Hacer una copia» y toca «Traer una copia». Elige el archivo, escribe su contraseña y toca «Revisar y traer copia».')
text('La app no guarda tu contraseña. La necesitas para abrir el archivo. Las anotaciones repetidas se conservan una sola vez.', True)

next_page()
title('Instalar en Android')
text('Necesitas Android 8 o superior. Descarga «Finca-Repelon-piloto.apk» desde el sitio o el enlace de entrega.')
text('Abre el archivo y permite la instalación desde el navegador o gestor de archivos cuando Android lo solicite.')
text('Si ya tienes la versión anterior, instala esta como actualización. Mantiene la misma firma. No desinstales la app: al hacerlo se borran sus datos privados.')
heading('Registrar una jornada')
text('Activa la ubicación. Con la app abierta, toca «Iniciar jornada», elige la persona y la zona, revisa y toca «Comenzar jornada». Permite ubicación precisa y los avisos que solicita Android.')
text('Al terminar, toca «Finalizar jornada» y confirma «Sí, finalizar y guardar».')
text('El GPS no comprueba que una tarea esté hecha. La precisión y la duración de 8 horas con pantalla bloqueada aún deben probarse en los teléfonos reales. Después de cierre forzado o reinicio, hay que iniciar de nuevo de forma visible.', True)

output = root/'public/downloads/Guia-Finca-Repelon.pdf'
output.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(str(output), pagesize=(595.28,841.89), leftMargin=52, rightMargin=52, topMargin=48, bottomMargin=50, title='Finca Repelón - Guía de uso fácil 0.2.1', author='Finca Repelón')
def footer(canvas, doc):
    canvas.setFont(family, 11)
    canvas.setFillColor(HexColor('#405246'))
    canvas.drawString(52, 25, 'Finca Repelón · Gratis · Guía de uso fácil')
    canvas.drawRightString(543, 25, str(doc.page))
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(f'Guía actualizada: {output.stat().st_size} bytes')
