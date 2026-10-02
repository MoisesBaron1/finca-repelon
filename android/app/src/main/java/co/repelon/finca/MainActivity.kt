package co.repelon.finca

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.location.LocationManager
import android.os.Bundle
import android.webkit.*
import androidx.webkit.WebViewAssetLoader
import org.json.JSONObject
import org.json.JSONArray

class MainActivity : Activity() {
    private lateinit var web:WebView
    private lateinit var db:AppDb
    private var pendingSession:String?=null
    private var exportContent:String?=null
    private var fileCallback:ValueCallback<Array<android.net.Uri>>?=null
    override fun onCreate(savedInstanceState:Bundle?){
        super.onCreate(savedInstanceState);db=AppDb(this)
        if(!LocationService.running)db.active()?.let{db.closeSession(it.getString("id"),"interrupted","Aplicación o equipo reiniciado; retoma la jornada explícitamente")}
        window.statusBarColor=android.graphics.Color.parseColor("#123c30");window.navigationBarColor=android.graphics.Color.parseColor("#f5f7f5")
        web=WebView(this);setContentView(web)
        web.setOnApplyWindowInsetsListener{view,insets->
            if(android.os.Build.VERSION.SDK_INT>=30){val bars=insets.getInsets(android.view.WindowInsets.Type.systemBars());view.setPadding(bars.left,bars.top,bars.right,bars.bottom)}
            insets
        }
        web.settings.apply{javaScriptEnabled=true;domStorageEnabled=true;allowFileAccess=false;allowContentAccess=true;setSupportMultipleWindows(false);mixedContentMode=WebSettings.MIXED_CONTENT_NEVER_ALLOW}
        val loader=WebViewAssetLoader.Builder().addPathHandler("/assets/",WebViewAssetLoader.AssetsPathHandler(this)).build()
        web.webViewClient=object:WebViewClient(){
            override fun shouldInterceptRequest(view:WebView,request:WebResourceRequest):WebResourceResponse?=loader.shouldInterceptRequest(request.url)?:WebResourceResponse("text/plain","UTF-8",403,"Blocked",emptyMap(),"No se permite contenido remoto".byteInputStream())
            override fun shouldOverrideUrlLoading(view:WebView,request:WebResourceRequest):Boolean=request.url.host!="appassets.androidplatform.net"
        }
        web.webChromeClient=object:WebChromeClient(){
            override fun onShowFileChooser(view:WebView,callback:ValueCallback<Array<android.net.Uri>>,params:FileChooserParams):Boolean{
                fileCallback?.onReceiveValue(null);fileCallback=callback
                return try{startActivityForResult(Intent(Intent.ACTION_OPEN_DOCUMENT).apply{type="*/*";addCategory(Intent.CATEGORY_OPENABLE)},42);true}catch(e:Exception){fileCallback=null;false}
            }
        }
        web.addJavascriptInterface(Bridge(),"RepelonNative")
        web.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }
    private fun signal(data:JSONObject){runOnUiThread{web.evaluateJavascript("window.dispatchEvent(new CustomEvent('native-session-start',{detail:${data}}))",null)}}
    private fun launchSession(){
        val payload=pendingSession?:return
        if(checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED){signal(JSONObject().put("ok",false).put("error","Activa el permiso de ubicación precisa para iniciar."));pendingSession=null;return}
        if(!getSystemService(LocationManager::class.java).isProviderEnabled(LocationManager.GPS_PROVIDER)){signal(JSONObject().put("ok",false).put("error","Activa la ubicación GPS en los ajustes del teléfono."));pendingSession=null;return}
        try{
            startForegroundService(Intent(this,LocationService::class.java).putExtra("payload",payload))
            val handler=android.os.Handler(android.os.Looper.getMainLooper())
            var attempts=0
            val check=object:Runnable{override fun run(){
                val current=db.active()
                if(current?.optString("id")==JSONObject(payload).getString("id") && LocationService.running)signal(JSONObject().put("ok",true).put("session",current))
                else if(attempts++<20)handler.postDelayed(this,250)
                else signal(JSONObject().put("ok",false).put("error","El servicio GPS no confirmó el inicio. Revisa permisos y almacenamiento."))
            }}
            handler.postDelayed(check,250)
        }
        catch(e:Exception){signal(JSONObject().put("ok",false).put("error",e.message))}
        pendingSession=null
    }
    inner class Bridge {
        @JavascriptInterface fun read(key:String):String=db.read(key)?:""
        @JavascriptInterface fun write(key:String,value:String):String=try{check(key.length<100 && value.length<50*1024*1024);db.write(key,value);JSONObject().put("ok",true).toString()}catch(e:Exception){JSONObject().put("ok",false).put("error",e.message).toString()}
        @JavascriptInterface fun startSession(payload:String){runOnUiThread{
            if(db.active()!=null){signal(JSONObject().put("ok",false).put("error","Ya hay una jornada activa."));return@runOnUiThread}
            pendingSession=payload
            val permissions=mutableListOf(Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION)
            if(android.os.Build.VERSION.SDK_INT>=33)permissions.add(Manifest.permission.POST_NOTIFICATIONS)
            if(checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED)requestPermissions(permissions.toTypedArray(),11) else launchSession()
        }}
        @JavascriptInterface fun stopSession():String=try{
            db.active()?.let{db.closeSession(it.getString("id"),"finished","Finalizada por el usuario")}
            runOnUiThread{startService(Intent(this@MainActivity,LocationService::class.java).setAction("STOP"))}
            JSONObject().put("ok",true).toString()
        }catch(e:Exception){JSONObject().put("ok",false).put("error",e.message).toString()}
        @JavascriptInterface fun snapshot(mode:String):String=JSONObject().put("sessions",db.sessions(mode)).put("running",LocationService.running).toString()
        @JavascriptInterface fun points(id:String):String=db.points(id).toString()
        @JavascriptInterface fun diagnostics(id:String):String=db.diagnostics(id).toString()
        @JavascriptInterface fun exportFile(name:String,content:String,mime:String):String{
            exportContent=content
            runOnUiThread{try{startActivityForResult(Intent(Intent.ACTION_CREATE_DOCUMENT).apply{addCategory(Intent.CATEGORY_OPENABLE);type=if(mime.startsWith("text/csv"))"text/csv" else "application/octet-stream";putExtra(Intent.EXTRA_TITLE,name)},43)}catch(e:Exception){web.evaluateJavascript("window.dispatchEvent(new CustomEvent('native-export',{detail:${JSONObject().put("ok",false).put("message",e.message)}}))",null)}}
            return JSONObject().put("ok",true).put("pending",true).toString()
        }
    }
    override fun onRequestPermissionsResult(requestCode:Int,permissions:Array<out String>,grantResults:IntArray){super.onRequestPermissionsResult(requestCode,permissions,grantResults);if(requestCode==11)launchSession()}
    override fun onActivityResult(requestCode:Int,resultCode:Int,data:Intent?){
        super.onActivityResult(requestCode,resultCode,data)
        if(requestCode==42){fileCallback?.onReceiveValue(if(resultCode==RESULT_OK&&data?.data!=null)arrayOf(data.data!!) else null);fileCallback=null}
        if(requestCode==43){
            var message="Exportación cancelada. No se creó una copia."
            var ok=false
            if(resultCode==RESULT_OK && data?.data!=null)try{val stream=contentResolver.openOutputStream(data.data!!)?:throw java.io.IOException("No se pudo abrir el archivo");stream.use{it.write((exportContent?:throw java.io.IOException("Contenido no disponible")).toByteArray());it.flush()};message="Archivo exportado";ok=true}catch(e:Exception){message="No se pudo exportar: ${e.message}"}
            exportContent=null;web.evaluateJavascript("window.dispatchEvent(new CustomEvent('native-export',{detail:${JSONObject().put("ok",ok).put("message",message)}}))",null)
        }
    }
    @Deprecated("Deprecated in Java") override fun onBackPressed(){web.evaluateJavascript("window.dispatchEvent(new Event('native-back'))",null)}
}
