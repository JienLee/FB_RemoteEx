package com.example.jieun.remoteconfigex.ui.base

import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import com.example.jieun.remoteconfigex.R
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.firebase.remoteconfig.FirebaseRemoteConfig
import com.google.firebase.remoteconfig.FirebaseRemoteConfigSettings

/**
 * Created by jieun on 2017. 11. 6..
 */
abstract class BaseActivity : AppCompatActivity(){
    protected val mFirebaseConfig by lazy {
        FirebaseRemoteConfig.getInstance()
    }

    fun checkGooglePlayServices(){
        val availability = GoogleApiAvailability.getInstance()
        var status = availability.isGooglePlayServicesAvailable(this)

        if (status != ConnectionResult.SUCCESS) {
            val dialog = availability.getErrorDialog(this, status, -1)
            dialog.setOnDismissListener{
                finish()
            }
            dialog.show()

            availability.showErrorNotification(this, status)
        }
    }

    private fun initFirebase(){
        val configSettings = FirebaseRemoteConfigSettings.Builder()
                .setDeveloperModeEnabled(true)
                .build()
        mFirebaseConfig.setConfigSettings(configSettings)
        mFirebaseConfig.setDefaults(R.xml.remote_config_defaults)

    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        checkGooglePlayServices()
        initFirebase()
    }
}