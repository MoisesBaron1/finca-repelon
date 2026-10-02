plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android {
    namespace = "co.repelon.finca"
    compileSdk = 35
    defaultConfig {
        applicationId = "co.repelon.finca"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0-piloto"
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
    buildTypes {
        release { isMinifyEnabled = false }
    }
}
dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.core:core-ktx:1.15.0")
}
