package co.repelon.finca

import android.app.*
import android.content.Intent
import android.content.pm.ServiceInfo
import android.location.*
import android.os.*
import android.provider.Settings
import org.json.JSONObject
import java.time.Instant
import java.util.UUID

class LocationService : Service(), LocationListener {
    companion object { @Volatile var running=false }
    private lateinit var db:AppDb
    private lateinit var manager:LocationManager
    private var sessionId:String?=null
    private val handler=Handler(Looper.getMainLooper())
    private var lastPoint=0L
    private var gapReported=false
    private var wakeLock:PowerManager.WakeLock?=null
    private val monitor=object:Runnable{
        override fun run(){
            if(sessionId!=null && SystemClock.elapsedRealtime()-lastPoint>60000 && !gapReported){
                gapReported=true;db.diagnostic(sessionId!!,"Más de 60 s sin puntos GPS. No se estima permanencia en este tramo.")
                notifyStatus("Sin puntos GPS recientes · revisar ubicación")
            }
            if(running)handler.postDelayed(this,15000)
        }
    }
    override fun onCreate(){ super.onCreate();db=AppDb(this);manager=getSystemService(LocationManager::class.java)
        getSystemService(NotificationManager::class.java).createNotificationChannel(NotificationChannel("jornada","Jornada de campo",NotificationManager.IMPORTANCE_LOW))
    }
    private fun notification(text:String):Notification{
        val open=PendingIntent.getActivity(this,0,Intent(this,MainActivity::class.java),PendingIntent.FLAG_IMMUTABLE)
        val stop=PendingIntent.getService(this,1,Intent(this,LocationService::class.java).setAction("STOP"),PendingIntent.FLAG_IMMUTABLE)
        return Notification.Builder(this,"jornada").setSmallIcon(R.drawable.ic_finca).setContentTitle("Finca Repelón · Jornada activa").setContentText(text).setContentIntent(open).setOngoing(true).addAction(Notification.Action.Builder(null,"Finalizar",stop).build()).build()
    }
    private fun notifyStatus(text:String){getSystemService(NotificationManager::class.java).notify(7,notification(text))}
    override fun onStartCommand(intent:Intent?,flags:Int,startId:Int):Int {
        if(intent?.action=="STOP"){
            (sessionId?:db.active()?.optString("id"))?.let{db.closeSession(it,"finished","Finalizada por el usuario")};sessionId=null;stopForeground(STOP_FOREGROUND_REMOVE);stopSelf();return START_NOT_STICKY
        }
        if(running)return START_NOT_STICKY
        if(Build.VERSION.SDK_INT>=29)startForeground(7,notification("Buscando GPS · datos guardados en el teléfono"),ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION)
        else startForeground(7,notification("Buscando GPS · datos guardados en el teléfono"))
        try {
            val payload=JSONObject(intent?.getStringExtra("payload")?:throw IllegalArgumentException("Falta la jornada"))
            db.createSession(payload);sessionId=payload.getString("id");lastPoint=SystemClock.elapsedRealtime();running=true
            wakeLock=getSystemService(PowerManager::class.java).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,"repelon:jornada").apply{acquire(10*60*60*1000L)}
            manager.requestLocationUpdates(LocationManager.GPS_PROVIDER,5000,0f,this)
            handler.postDelayed(monitor,15000)
        }catch(e:Exception){sessionId?.let{db.closeSession(it,"interrupted",e.message?:"No se pudo iniciar GPS")};sessionId=null;running=false;stopForeground(STOP_FOREGROUND_REMOVE);stopSelf()}
        return START_NOT_STICKY
    }
    override fun onLocationChanged(location:Location) {
        val id=sessionId?:return
        if(db.active()?.optString("id")!=id)return
        try {
            val now=SystemClock.elapsedRealtime()
            val boot=Settings.Global.getInt(contentResolver,Settings.Global.BOOT_COUNT,0)
            val p=JSONObject().put("id",UUID.randomUUID().toString()).put("sessionId",id)
                .put("lat",location.latitude).put("lng",location.longitude).put("accuracy",location.accuracy.toDouble())
                .put("time",Instant.ofEpochMilli(location.time).toString()).put("monoMs",location.elapsedRealtimeNanos/1000000)
                .put("segment","boot-$boot").put("ageMs",(now-location.elapsedRealtimeNanos/1000000).coerceAtLeast(0))
                .put("provider",location.provider).put("mock",location.isFromMockProvider)
                .put("battery",getSystemService(BatteryManager::class.java).getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY))
            db.addPoint(id,p);lastPoint=now;gapReported=false
            notifyStatus("GPS ±${location.accuracy.toInt()} m · registro local activo")
        }catch(e:Exception){db.diagnostic(id,"Error de almacenamiento: ${e.message}");notifyStatus("Error al guardar · abre la app");}
    }
    override fun onProviderDisabled(provider:String){sessionId?.let{db.diagnostic(it,"GPS desactivado")};notifyStatus("GPS desactivado · tramo sin registro")}
    override fun onProviderEnabled(provider:String){sessionId?.let{db.diagnostic(it,"GPS activado nuevamente")}}
    override fun onBind(intent:Intent?)=null
    override fun onDestroy(){
        running=false;handler.removeCallbacks(monitor);manager.removeUpdates(this)
        if(wakeLock?.isHeld==true)wakeLock?.release()
        sessionId?.let{db.closeSession(it,"interrupted","Servicio interrumpido; se requiere reanudación visible")}
        super.onDestroy()
    }
}
