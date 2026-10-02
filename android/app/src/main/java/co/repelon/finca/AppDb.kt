package co.repelon.finca

import android.content.Context
import android.content.ContentValues
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import org.json.JSONArray
import org.json.JSONObject

class AppDb(context: Context) : SQLiteOpenHelper(context.applicationContext, "repelon.db", null, 1) {
    override fun onConfigure(db: SQLiteDatabase) { db.setForeignKeyConstraintsEnabled(true); db.execSQL("PRAGMA synchronous=FULL") }
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("CREATE TABLE kv (key TEXT PRIMARY KEY, value TEXT NOT NULL)")
        db.execSQL("CREATE TABLE sessions (id TEXT PRIMARY KEY, mode TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL)")
        db.execSQL("CREATE TABLE points (id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), seq INTEGER NOT NULL, payload TEXT NOT NULL, UNIQUE(session_id, seq))")
        db.execSQL("CREATE INDEX points_session ON points(session_id, seq)")
        db.execSQL("CREATE TABLE diagnostics (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL, time TEXT NOT NULL, reason TEXT NOT NULL)")
    }
    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) { throw IllegalStateException("Migración no definida; conserva la copia antes de actualizar.") }
    @Synchronized fun read(key: String): String? = readableDatabase.rawQuery("SELECT value FROM kv WHERE key=?", arrayOf(key)).use { if(it.moveToFirst())it.getString(0) else null }
    @Synchronized fun write(key: String, value: String) {
        val db=writableDatabase; db.beginTransaction()
        try { db.insertWithOnConflict("kv",null,ContentValues().apply{put("key",key);put("value",value)},SQLiteDatabase.CONFLICT_REPLACE).also { check(it!=-1L) };db.setTransactionSuccessful() }
        finally {db.endTransaction()}
    }
    @Synchronized fun createSession(p: JSONObject) {
        val db=writableDatabase;db.beginTransaction()
        try {
            check(db.rawQuery("SELECT id FROM sessions WHERE status='active'",null).use{!it.moveToFirst()}) {"Ya hay una jornada activa."}
            p.put("status","active")
            check(db.insertOrThrow("sessions",null,ContentValues().apply{put("id",p.getString("id"));put("mode",p.getString("mode"));put("payload",p.toString());put("status","active")})!=-1L)
            db.setTransactionSuccessful()
        }finally{db.endTransaction()}
    }
    @Synchronized fun active(): JSONObject? = readableDatabase.rawQuery("SELECT payload FROM sessions WHERE status='active'",null).use{if(it.moveToFirst())JSONObject(it.getString(0)) else null}
    @Synchronized fun closeSession(id: String, status: String, reason: String) {
        val db=writableDatabase;db.beginTransaction()
        try {
            val old=db.rawQuery("SELECT payload FROM sessions WHERE id=?",arrayOf(id)).use{if(it.moveToFirst())JSONObject(it.getString(0)) else null}?:return
            if(old.optString("status")!="active")return
            old.put("status",status).put("end",java.time.Instant.now().toString()).put("reason",reason)
            db.update("sessions",ContentValues().apply{put("status",status);put("payload",old.toString())},"id=?",arrayOf(id))
            diagnostic(id,reason);db.setTransactionSuccessful()
        }finally{db.endTransaction()}
    }
    @Synchronized fun addPoint(session: String, payload: JSONObject) {
        val db=writableDatabase;db.beginTransaction()
        try {
            check(db.rawQuery("SELECT status FROM sessions WHERE id=?",arrayOf(session)).use{it.moveToFirst()&&it.getString(0)=="active"}) {"La jornada ya está cerrada."}
            val seq=db.rawQuery("SELECT COALESCE(MAX(seq),0)+1 FROM points WHERE session_id=?",arrayOf(session)).use{it.moveToFirst();it.getInt(0)}
            payload.put("seq",seq)
            db.insertOrThrow("points",null,ContentValues().apply{put("id",payload.getString("id"));put("session_id",session);put("seq",seq);put("payload",payload.toString())})
            db.setTransactionSuccessful()
        }finally{db.endTransaction()}
    }
    @Synchronized fun points(id:String): JSONArray = JSONArray().apply {
        readableDatabase.rawQuery("SELECT payload FROM points WHERE session_id=? ORDER BY seq",arrayOf(id)).use{while(it.moveToNext())put(JSONObject(it.getString(0)))}
    }
    @Synchronized fun sessions(mode:String): JSONArray = JSONArray().apply {
        readableDatabase.rawQuery("SELECT payload FROM sessions WHERE mode=?",arrayOf(mode)).use{while(it.moveToNext())put(JSONObject(it.getString(0)))}
    }
    @Synchronized fun diagnostic(id:String,reason:String) {
        writableDatabase.insertOrThrow("diagnostics",null,ContentValues().apply{put("session_id",id);put("time",java.time.Instant.now().toString());put("reason",reason)})
    }
    @Synchronized fun diagnostics(id:String):JSONArray=JSONArray().apply{
        readableDatabase.rawQuery("SELECT time,reason FROM diagnostics WHERE session_id=? ORDER BY id",arrayOf(id)).use{while(it.moveToNext())put(JSONObject().put("time",it.getString(0)).put("reason",it.getString(1)))}
    }
}
