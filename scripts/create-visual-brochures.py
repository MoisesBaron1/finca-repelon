"""Two platform-specific illustrated brochures. Screenshots use fresh example data only."""
from pathlib import Path
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics import renderPDF
from fontTools.ttLib import TTFont as FontToolsFont
import json, fitz, zipfile

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/downloads'
IMG=ROOT/'docs/folletos/imagenes'
TMP=ROOT/'artifacts/folletos';TMP.mkdir(parents=True,exist_ok=True)
W,H=595.28,841.89
GREEN=HexColor('#123c30');INK=HexColor('#20382e');MUTED=HexColor('#526158')
BG=HexColor('#f5f7f5');LIME=HexColor('#cee891');LINE=HexColor('#d6e0d6');WHITE=HexColor('#ffffff')
URL='https://temporary-spry-jasper-gs4cyvp.vercel.app'
VERSION=json.loads((ROOT/'package.json').read_text())['version']
for weight,name in [(400,'Manrope'),(600,'ManropeSemi'),(800,'ManropeBold')]:
    path=TMP/f'Manrope-{weight}.ttf'
    if not path.exists():
        f=FontToolsFont(ROOT/f'node_modules/@fontsource/manrope/files/manrope-latin-{weight}-normal.woff');f.flavor=None;f.save(path)
    pdfmetrics.registerFont(TTFont(name,str(path)))
pdfmetrics.registerFontFamily('Manrope',normal='Manrope',bold='ManropeBold')

BODY=ParagraphStyle('Cuerpo',fontName='Manrope',fontSize=16.5,leading=22.5,textColor=INK)
SMALL=ParagraphStyle('Pie',fontName='Manrope',fontSize=11.5,leading=15,textColor=MUTED)

def text(c,value,x,top,width,limit=120,style=BODY):
    p=Paragraph(value,style);_,height=p.wrap(width,limit+200)
    if height>limit:raise ValueError(f'Text overflow {height}>{limit}: {value}')
    p.drawOn(c,x,top-height);return top-height

def line(c,value,x,y,size=16,font='Manrope',color=INK):
    c.setFillColor(color);c.setFont(font,size);c.drawString(x,y,value)

def card(c,n,title,y,height):
    c.setFillColor(WHITE);c.setStrokeColor(LINE);c.setLineWidth(.8);c.roundRect(30,y,W-60,height,15,fill=1,stroke=1)
    c.setFillColor(GREEN);c.circle(57,y+height-30,17,fill=1,stroke=0)
    c.setFillColor(WHITE);c.setFont('ManropeBold',18);c.drawCentredString(57,y+height-36,str(n))
    line(c,title,85,y+height-37,20.5,'ManropeBold',GREEN)
    return y+height-61

def shot(c,name,y,maxw=355,maxh=54):
    img=ImageReader(str(IMG/name));iw,ih=img.getSize();scale=min(maxw/iw,maxh/ih);w,h=iw*scale,ih*scale;x=(W-w)/2
    c.setFillColor(WHITE);c.roundRect(x-7,y-5,w+14,h+10,9,fill=1,stroke=0)
    c.drawImage(img,x,y,width=w,height=h,mask='auto')
    return x,y,w,h

def qr(c,url,x,y,size=96):
    widget=QrCodeWidget(url,barLevel='M',barBorder=4)
    x0,y0,x1,y1=widget.getBounds();d=Drawing(size,size,transform=[size/(x1-x0),0,0,size/(y1-y0),0,0]);d.add(widget)
    renderPDF.draw(d,c,x,y)
    c.linkURL(url,(x,y,x+size,y+size),relative=0,thickness=0)

def button(c,label,url,x=48,y=489,w=285):
    c.setFillColor(GREEN);c.roundRect(x,y,w,39,10,fill=1,stroke=0)
    c.setFont('ManropeBold',16);c.setFillColor(WHITE);c.drawCentredString(x+w/2,y+12,label)
    c.linkURL(url,(x,y,x+w,y+39),relative=0,thickness=0)

def share_icon(c,x,y):
    c.setStrokeColor(GREEN);c.setLineWidth(2)
    p=c.beginPath();p.moveTo(x,y+17);p.lineTo(x,y);p.lineTo(x+24,y);p.lineTo(x+24,y+17);c.drawPath(p)
    c.line(x+12,y+8,x+12,y+34);c.line(x+12,y+34,x+5,y+27);c.line(x+12,y+34,x+19,y+27)

def phone(c,platform,x=477,y=315):
    c.setFillColor(BG);c.setStrokeColor(GREEN);c.setLineWidth(2);c.roundRect(x,y,55,102,10,fill=1,stroke=1)
    c.line(x+20,y+92,x+35,y+92);c.circle(x+27.5,y+9,2,fill=0,stroke=1)
    if platform=='Android':
        c.setFillColor(LIME);c.circle(x+27.5,y+55,19,fill=1,stroke=0)
        c.setStrokeColor(GREEN);c.roundRect(x+17,y+42,21,18,3,fill=0,stroke=1);c.arc(x+21,y+56,x+34,y+73,0,180)
        c.setFillColor(GREEN);c.setFont('ManropeBold',13);c.drawCentredString(x+27.5,y+22,'1 min')
    else:
        c.setFillColor(LIME);c.roundRect(x+8,y+20,39,61,5,fill=1,stroke=0)
        c.setFillColor(GREEN);c.circle(x+27.5,y+56,6,fill=1,stroke=0)
        c.setFont('ManropeBold',10);c.drawCentredString(x+27.5,y+36,'ABIERTA')

def header(c,platform,page):
    c.setFillColor(BG);c.rect(0,0,W,H,fill=1,stroke=0)
    c.setFillColor(GREEN);c.roundRect(30,H-63,35,35,10,fill=1,stroke=0)
    c.setStrokeColor(LIME);c.setLineWidth(2);c.ellipse(40,H-52,55,H-35,fill=0,stroke=1);c.line(40,H-54,52,H-39)
    line(c,'Finca Repelón',76,H-52,19,'ManropeBold',GREEN)
    c.setFillColor(LIME if platform=='Android' else GREEN);c.roundRect(W-146,H-61,116,31,12,fill=1,stroke=0)
    c.setFillColor(GREEN if platform=='Android' else WHITE);c.setFont('ManropeBold',16);c.drawCentredString(W-88,H-51,platform)
    line(c,'Tu finca, sin señal.' if page==1 else 'Anota y conserva.',30,H-113,31,'ManropeBold',GREEN)
    line(c,'ANTES DE SALIR · CON INTERNET' if page==1 else 'EN LA FINCA · SIN INTERNET',31,H-141,13.5,'ManropeSemi',MUTED)

def footer(c,platform,page):
    line(c,'Guarda este folleto en Archivos antes de salir.' if page==1 else 'Haz otra copia fuera del teléfono cuando puedas.',30,53,11.5,'ManropeSemi',GREEN)
    if page==2:line(c,'Recuperar señal no sincroniza tus datos automáticamente.',30,37,11.5,'ManropeSemi',GREEN)
    line(c,f'Guía visual {platform} · v{VERSION} · Gratis',30,18,10.5,'Manrope',MUTED)
    c.setFont('ManropeSemi',11);c.setFillColor(MUTED);c.drawRightString(W-30,18,f'{page} / 2')

for platform in ['Android','iPhone']:
    filename=f'Folleto-{platform}-Finca-Repelon.pdf';path=OUT/filename
    c=canvas.Canvas(str(path),pagesize=(W,H),pageCompression=1)
    c.setTitle(f'Finca Repelón · Folleto visual para {platform} · Sin señal')
    c.setAuthor('Finca Repelón');c.setSubject('Guía visual en español, con pasos numerados y capturas reales de la app')
    header(c,platform,1)
    top=card(c,1,'Instala con internet' if platform=='Android' else 'Añade el icono en Safari',475,210)
    if platform=='Android':
        body='Toca el botón verde, abre la descarga e instala la app. Permite instalar cuando Android lo pida. Si ya la tienes, <b>actualiza sin desinstalar</b>.'
        url=URL+'/downloads/Finca-Repelon-piloto.apk';label='Toca: descargar Android'
    else:
        body='En Safari, toca Compartir (o Más …) y Añadir a pantalla de inicio. Activa «Abrir como app», si aparece. Toca Añadir y abre el icono.'
        url=URL;label='Toca: abrir la app en Safari'
    text(c,body,48,top,350,limit=96)
    button(c,label,url,w=335 if platform=='iPhone' else 305)
    qr(c,url,W-151,540,100)
    c.setFont('Manrope',10.5);c.setFillColor(MUTED);c.drawCentredString(W-101,531,'En papel: escanea el QR')
    if platform=='iPhone':
        share_icon(c,W-177,487)
    top=card(c,2,'Prueba el modo avión',277,184)
    text(c,'En Ayuda comprueba la descarga. Activa modo avión y apaga Wi-Fi. En «Datos de ejemplo», anota un peso, cierra y reabre: <b>debe seguir ahí</b>.',48,top,W-96,limit=68)
    shot(c,'confirmacion.png',289,maxw=390,maxh=44)
    top=card(c,3,'Ahora usa Mi finca',78,185)
    text(c,'Toca «Datos de ejemplo» y luego «Usar mi finca». Añade tus animales, lotes y responsables reales.',48,top,W-96,limit=68)
    shot(c,'mi-finca.png',93,maxw=335,maxh=53)
    footer(c,platform,1);c.showPage()
    header(c,platform,2)
    top=card(c,4,'Anota, revisa y guarda',475,210)
    text(c,'En Inicio, toca Anotar un dato. Completa los pasos, revisa y guarda. <b>Espera el mensaje de confirmación</b>.',48,top,W-96,limit=68)
    shot(c,'guardar-pesaje.png',504,maxw=335,maxh=56)
    line(c,'Ejemplo: guardar un peso de ganado.',48,489,11.5,'Manrope',MUTED)
    top=card(c,5,'Si usas el GPS',277,184)
    body=('Activa Ubicación precisa e inicia la jornada. Prueba un minuto con pantalla bloqueada y revisa que haya puntos.' if platform=='Android' else '<b>Mantén la app visible y la pantalla encendida.</b> Al bloquearla o cambiar de app, el recorrido puede detenerse.')
    text(c,body,48,top,365,limit=93);phone(c,platform)
    line(c,'El GPS puede funcionar sin señal móvil. Prueba también la batería.',48,292,11.5,'ManropeSemi',GREEN)
    top=card(c,6,'Termina y haz una copia',78,185)
    text(c,'Finaliza la jornada. En Ayuda, toca Hacer una copia. Guárdala en Archivos o Descargas y <b>conserva la contraseña</b>.',48,top,W-96,limit=68)
    shot(c,'guardar-copia.png',93,maxw=335,maxh=53)
    footer(c,platform,2);c.save()
    # Editable text and links remain intact; previews are rendered from the actual PDF.
    doc=fitz.open(path)
    doc.xref_set_key(doc.pdf_catalog(),'Lang','(es-CO)')
    temp=TMP/filename;doc.save(temp,garbage=4,deflate=True);doc.close();temp.replace(path)
    doc=fitz.open(path)
    for n,page in enumerate(doc):
        page.get_pixmap(matrix=fitz.Matrix(1.8,1.8),alpha=False).save(OUT/f'Folleto-{platform}-Finca-Repelon-pagina-{n+1}.png')
    print(f'{filename}: {len(doc)} páginas, {path.stat().st_size} bytes')
    doc.close()

with zipfile.ZipFile(OUT/'Folletos-Visuales-Finca-Repelon.zip','w',zipfile.ZIP_DEFLATED) as bundle:
    for platform in ['Android','iPhone']:
        stem=f'Folleto-{platform}-Finca-Repelon'
        for name in [f'{stem}.pdf',f'{stem}-pagina-1.png',f'{stem}-pagina-2.png']:
            bundle.write(OUT/name,name)
    bundle.write(ROOT/'docs/folletos/LEEME.txt','LEEME.txt')
print('Paquete listo: dos PDF, cuatro imágenes y las indicaciones de uso.')
